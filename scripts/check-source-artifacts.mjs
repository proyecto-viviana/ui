#!/usr/bin/env node

import { readdirSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const SOURCE_ROOTS = [
  "packages/solid-stately/src",
  "packages/solidaria/src",
  "packages/solidaria-components/src",
  "packages/kumo/src",
  "packages/solid-spectrum/src",
  "packages/viviana-ui/src",
];
const INTENTIONAL_AMBIENT_DECLARATIONS = new Set([
  "packages/solid-spectrum/src/style/spectrum-tokens-json.d.ts",
  "packages/viviana-ui/src/style/spectrum-tokens-json.d.ts",
]);

function walk(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...walk(absolute));
    else files.push(path.relative(ROOT, absolute).split(path.sep).join("/"));
  }
  return files;
}

const declarations = SOURCE_ROOTS.flatMap((directory) => walk(path.join(ROOT, directory)))
  .filter((file) => /\.d\.ts(?:\.map)?$/.test(file))
  .sort();
const unexpected = declarations.filter((file) => !INTENTIONAL_AMBIENT_DECLARATIONS.has(file));
const missing = [...INTENTIONAL_AMBIENT_DECLARATIONS].filter(
  (file) => !declarations.includes(file),
);

if (unexpected.length > 0 || missing.length > 0) {
  if (unexpected.length > 0) {
    console.error(
      "guard:source-artifacts — generated declarations must not be committed beside TypeScript source:",
    );
    for (const file of unexpected) console.error(`- ${file}`);
  }
  if (missing.length > 0) {
    console.error("guard:source-artifacts — the ambient declaration allowlist is stale:");
    for (const file of missing) console.error(`- ${file}`);
  }
  process.exit(1);
}

console.log(
  `guard:source-artifacts — PASS: only ${declarations.length} intentional ambient declaration(s) exist in public-package source.`,
);
