#!/usr/bin/env node

/**
 * Fails when a certified spec file discovers fewer cases than the committed
 * floor, or disappears from the suite altogether.
 *
 * The certified shards report what they ran, never what they should have run,
 * and the shard job is `continue-on-error`. So deleting a spec, renaming it out
 * of `testMatch`, or wrapping a describe in a condition that never fires makes
 * the suite smaller and every gate greener. This guard reads the same discovery
 * Playwright uses — `playwright test e2e/certified --list --reporter=json`, no
 * browser and no web server, about two seconds — and compares the per-file case
 * count against `apps/comparison/e2e/certified-case-floor.json`.
 *
 * It is a ratchet, not a pin: growth passes and prints the line to write, a
 * drop fails. `--write` records the current counts.
 */

import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
export const COMPARISON_ROOT = join(HERE, "..", "apps", "comparison");
export const FLOOR_PATH = join(COMPARISON_ROOT, "e2e", "certified-case-floor.json");

/**
 * One row per spec file: every case Playwright discovered under it.
 *
 * A top-level suite in the JSON report is one spec file; the cases below it are
 * nested by describe, and a case declared by a shared driver carries the
 * driver's own `file`, so the count has to come from the top-level suite.
 */
export function countCasesByFile(report) {
  const counts = {};
  for (const suite of report?.suites ?? []) {
    const file = suite.file;
    if (!file) continue;
    counts[file] = (counts[file] ?? 0) + countSpecs(suite);
  }
  return counts;
}

function countSpecs(suite) {
  let total = (suite.specs ?? []).length;
  for (const child of suite.suites ?? []) total += countSpecs(child);
  return total;
}

/**
 * Both directions at once: a file that shrank or vanished fails, a file that
 * grew or appeared is reported so the floor can be raised.
 */
export function diffCaseFloor(actual, floor) {
  const missing = [];
  const shrunk = [];
  const grown = [];
  const added = [];

  for (const [file, expected] of Object.entries(floor ?? {})) {
    if (!(file in actual)) {
      missing.push({ file, expected });
      continue;
    }
    if (actual[file] < expected) shrunk.push({ file, expected, found: actual[file] });
    else if (actual[file] > expected) grown.push({ file, expected, found: actual[file] });
  }
  for (const [file, found] of Object.entries(actual)) {
    if (!(file in (floor ?? {}))) added.push({ file, found });
  }

  return { missing, shrunk, grown, added };
}

export function loadCaseFloor(path = FLOOR_PATH) {
  return JSON.parse(readFileSync(path, "utf8")).files ?? {};
}

/** pnpm prefixes its own banner ("Scope: all N workspace projects") to stdout, so the report starts at the first brace. */
export function parseListingStdout(stdout) {
  const start = stdout.indexOf("{");
  if (start < 0) throw new Error(`playwright --list printed no JSON report:\n${stdout}`);
  return JSON.parse(stdout.slice(start));
}

/** `--list` exits 0 with the report on stdout; a spec that fails to load lands in `errors`. */
export function readCertifiedListing() {
  const stdout = execFileSync(
    "pnpm",
    ["exec", "playwright", "test", "e2e/certified", "--list", "--reporter=json"],
    { cwd: COMPARISON_ROOT, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 },
  );
  return parseListingStdout(stdout);
}

export function formatCaseFloor(counts, revision) {
  const files = Object.fromEntries(
    Object.entries(counts).sort(([left], [right]) => left.localeCompare(right)),
  );
  const total = Object.values(files).reduce((sum, count) => sum + count, 0);
  return `${JSON.stringify(
    {
      $comment:
        "Cases each certified spec file must still discover. Shrink-only: a drop or a missing file fails guard:certified-case-floor. Raise it with `node scripts/check-certified-case-floor.mjs --write`.",
      revision,
      total,
      files,
    },
    null,
    2,
  )}\n`;
}

function currentRevision() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], { cwd: HERE, encoding: "utf8" }).trim();
  } catch {
    return null;
  }
}

export function checkCertifiedCaseFloor({ write = false } = {}) {
  const report = readCertifiedListing();
  const errors = report.errors ?? [];
  for (const error of errors) {
    console.error(
      `certified discovery error: ${error.location?.file ?? "no file"}: ${(error.message ?? "").split("\n", 1)[0]}`,
    );
  }

  const counts = countCasesByFile(report);
  const total = Object.values(counts).reduce((sum, count) => sum + count, 0);

  if (write) {
    if (errors.length > 0) {
      console.error("refusing to write a floor from a listing that carries errors.");
      return 1;
    }
    writeFileSync(FLOOR_PATH, formatCaseFloor(counts, currentRevision()));
    console.log(`certified case floor: wrote ${Object.keys(counts).length} files, ${total} cases.`);
    return 0;
  }

  const { missing, shrunk, grown, added } = diffCaseFloor(counts, loadCaseFloor());

  for (const row of missing) {
    console.error(
      `certified spec gone: ${row.file} discovered ${row.expected} cases and now discovers none — ` +
        `restore it, or drop its line from apps/comparison/e2e/certified-case-floor.json in the ` +
        `commit that removes the component.`,
    );
  }
  for (const row of shrunk) {
    console.error(
      `certified cases lost: ${row.file} discovers ${row.found}, floor is ${row.expected}.`,
    );
  }
  for (const row of [...grown, ...added]) {
    console.log(
      `certified cases gained: ${row.file} discovers ${row.found}` +
        (row.expected == null ? " and is not on the floor yet" : `, floor is ${row.expected}`) +
        " — ratchet with `node scripts/check-certified-case-floor.mjs --write`.",
    );
  }

  const failed = errors.length + missing.length + shrunk.length > 0;
  if (!failed) {
    console.log(
      `certified case floor: ${Object.keys(counts).length} files, ${total} cases, none below the floor.`,
    );
  }
  return failed ? 1 : 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(checkCertifiedCaseFloor({ write: process.argv.includes("--write") }));
}
