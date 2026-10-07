#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, "scripts", "ts-nocheck-baseline.json");
const WRITE_BASELINE = process.argv.includes("--write-baseline");
const PUBLIC_PACKAGES = [
  "packages/solid-stately/src",
  "packages/solidaria/src",
  "packages/solidaria-components/src",
  "packages/kumo/src",
  "packages/geist/src",
  "packages/solid-spectrum/src",
  "packages/viviana-ui/src",
];
const DIRECTIVE = /(?:^|\n)\s*(?:\/\/\s*@ts-nocheck\b|\/\*\s*@ts-nocheck\s*\*\/)/;

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory)) {
    const absolute = path.join(directory, entry);
    if (statSync(absolute).isDirectory()) files.push(...walk(absolute));
    else if (/\.tsx?$/.test(entry)) files.push(absolute);
  }
  return files;
}

const current = PUBLIC_PACKAGES.flatMap((directory) => walk(path.join(ROOT, directory)))
  .filter((file) => DIRECTIVE.test(readFileSync(file, "utf8")))
  .map((file) => path.relative(ROOT, file))
  .sort();

if (WRITE_BASELINE) {
  const previous = existsSync(BASELINE_PATH)
    ? JSON.parse(readFileSync(BASELINE_PATH, "utf8"))
    : null;
  if (previous) {
    const allowed = new Set(previous.paths ?? []);
    const additions = current.filter((file) => !allowed.has(file));
    if (additions.length > 0 || current.length > previous.maxCount) {
      console.error(
        "Refusing to absorb @ts-nocheck growth. Adding or moving a directive fails, and --write-baseline will not raise the ceiling.",
      );
      for (const file of additions) console.error(`  - ${file}`);
      process.exit(1);
    }
  }
  const baseline = {
    description:
      "Frozen @ts-nocheck inventory for the public package source trees. A path that no longer carries the directive is a stale record and fails until --write-baseline drops it. Adding or moving a directive fails, and --write-baseline refuses to absorb that growth.",
    maxCount: current.length,
    paths: current,
  };
  writeFileSync(BASELINE_PATH, `${JSON.stringify(baseline, null, 2)}\n`);
  console.log(`Wrote ${current.length}-file baseline to ${path.relative(ROOT, BASELINE_PATH)}.`);
  process.exit(0);
}

if (!existsSync(BASELINE_PATH)) {
  console.error(
    `Missing ${path.relative(ROOT, BASELINE_PATH)}; create it intentionally with --write-baseline.`,
  );
  process.exit(1);
}

const baseline = JSON.parse(readFileSync(BASELINE_PATH, "utf8"));
const allowed = new Set(baseline.paths);
const additions = current.filter((file) => !allowed.has(file));
const removals = baseline.paths.filter((file) => !current.includes(file));

console.log("@ts-nocheck budget");
console.log(`- current: ${current.length}`);
console.log(`- ceiling: ${baseline.maxCount}`);
console.log(`- removed from baseline: ${removals.length}`);
console.log(`- new or moved directives: ${additions.length}`);

if (removals.length > 0) {
  console.error(
    "FAIL: this record no longer matches the tree. The @ts-nocheck baseline still names a file that no longer carries the directive. Re-run with --write-baseline to drop it.",
  );
  for (const file of removals) console.error(`  - ${file}`);
  process.exit(1);
}

if (additions.length > 0 || current.length > baseline.maxCount) {
  if (additions.length > 0) {
    console.error("- forbidden additions:");
    for (const file of additions) console.error(`  - ${file}`);
  }
  console.error("FAIL: the public-package @ts-nocheck surface may only decrease.");
  process.exit(1);
}

console.log("PASS: no new public-package @ts-nocheck blind spots were introduced.");
