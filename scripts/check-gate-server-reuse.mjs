#!/usr/bin/env node

/**
 * Fails when a gate could grade a server it did not start.
 *
 * `reuseExistingServer` is what makes an interactive run cheap: Playwright
 * attaches to the preview server already on the port instead of building
 * again. Under a gate it is the difference between a proof and a guess — a
 * stale server left over from an hour-old build answers every request, the
 * specs pass, and nothing in the run touched the tree being graded.
 *
 * So a gate never reuses: the two `apps/**` Playwright configs must make the
 * reuse decision depend on `VIVIANA_GATE`, and every package script that runs
 * `playwright test` must set it. `CI` stays in the expression for the hosted
 * run, but it cannot be the switch the scripts set: these configs also hang
 * `.env.local` loading, retries and the blob reporter off `CI`, and a local
 * gate that quietly retried twice or lost this machine's Chromium arguments
 * would be a different run from the one CI makes.
 */

import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..");

const SWITCH = "VIVIANA_GATE";
const RUNS_PLAYWRIGHT = /playwright\s+test\b/;

/** One problem per config that would let a gate reuse a server. */
export function findConfigProblems(file, source) {
  const problems = [];
  if (!source.includes("webServer")) return problems;

  const lines = source.split("\n");
  const found = lines.filter((line) => line.includes("reuseExistingServer"));
  if (found.length === 0) {
    problems.push(
      `${file}: starts a webServer but never sets reuseExistingServer — ` +
        `set it to !process.env.CI && !process.env.${SWITCH}.`,
    );
    return problems;
  }

  for (const line of found) {
    const index = lines.indexOf(line);
    if (!line.includes(`process.env.${SWITCH}`)) {
      problems.push(
        `${file}:${index + 1}: reuseExistingServer ignores ${SWITCH} — a gate would grade ` +
          `whatever server is already on the port. Set !process.env.CI && !process.env.${SWITCH}.`,
      );
    }
  }
  return problems;
}

/** One problem per package script that runs Playwright without the switch. */
export function findScriptProblems(file, scripts) {
  const problems = [];
  for (const [name, command] of Object.entries(scripts ?? {})) {
    if (typeof command !== "string" || !RUNS_PLAYWRIGHT.test(command)) continue;
    if (command.includes(`${SWITCH}=1`)) continue;
    problems.push(
      `${file}: script ${name} runs playwright test without ${SWITCH}=1 — ` +
        `it may attach to a server it did not start.`,
    );
  }
  return problems;
}

function appDirs(root) {
  return readdirSync(join(root, "apps"), { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name);
}

export function checkGateServerReuse(root = ROOT) {
  const problems = [];
  let configs = 0;
  let manifests = 0;

  for (const app of appDirs(root)) {
    const config = join(root, "apps", app, "playwright.config.ts");
    try {
      problems.push(
        ...findConfigProblems(`apps/${app}/playwright.config.ts`, readFileSync(config, "utf8")),
      );
      configs += 1;
    } catch {
      // An app with no Playwright config starts no server.
    }
  }

  for (const file of ["package.json", ...appDirs(root).map((app) => `apps/${app}/package.json`)]) {
    const manifest = JSON.parse(readFileSync(join(root, file), "utf8"));
    problems.push(...findScriptProblems(file, manifest.scripts));
    manifests += 1;
  }

  if (problems.length > 0) {
    console.error("A gate could reuse a server it did not start:");
    for (const problem of problems) console.error(`  ${problem}`);
    return 1;
  }
  console.log(
    `gate server reuse: ${configs} Playwright configs and ${manifests} manifests all set ${SWITCH}.`,
  );
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(checkGateServerReuse());
}
