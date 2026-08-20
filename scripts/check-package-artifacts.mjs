#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const DEFAULT_PUBLIC_PACKAGE_DIRS = [
  "packages/solid-stately",
  "packages/solidaria",
  "packages/solidaria-components",
  "packages/kumo",
  "packages/solid-spectrum",
  "packages/viviana-ui",
];
const publicPackageDirs = process.env.VIVIANA_PUBLIC_PACKAGE_DIRS
  ? process.env.VIVIANA_PUBLIC_PACKAGE_DIRS.split(",").filter(Boolean)
  : DEFAULT_PUBLIC_PACKAGE_DIRS;

function readJson(file) {
  return JSON.parse(readFileSync(file, "utf8"));
}

function exportTargets(value, condition = "default") {
  if (typeof value === "string") return [{ condition, target: value }];
  if (!value || typeof value !== "object") return [];
  return Object.entries(value).flatMap(([key, child]) => exportTargets(child, key));
}

const problems = [];
let checkedTargets = 0;

for (const packageDir of publicPackageDirs) {
  const manifestPath = path.join(ROOT, packageDir, "package.json");
  if (!existsSync(manifestPath)) {
    problems.push(`${packageDir}: package.json is missing`);
    continue;
  }

  const manifest = readJson(manifestPath);
  const refs = [];
  for (const field of ["main", "module", "types"]) {
    if (typeof manifest[field] === "string") {
      refs.push({ label: field, condition: field, target: manifest[field] });
    }
  }
  for (const [subpath, value] of Object.entries(manifest.exports ?? {})) {
    for (const target of exportTargets(value)) refs.push({ label: subpath, ...target });
  }

  for (const { label, condition, target } of refs) {
    checkedTargets += 1;
    if (!target.startsWith("./")) {
      problems.push(`${manifest.name} ${label} [${condition}] is not package-relative: ${target}`);
      continue;
    }
    if (target.includes("*")) continue;
    const absolute = path.resolve(ROOT, packageDir, target);
    const packageRoot = `${path.resolve(ROOT, packageDir)}${path.sep}`;
    if (!absolute.startsWith(packageRoot)) {
      problems.push(`${manifest.name} ${label} [${condition}] escapes the package: ${target}`);
    } else if (!existsSync(absolute)) {
      problems.push(`${manifest.name} ${label} [${condition}] -> missing ${target}`);
    }
  }
}

const packagesRoot = path.join(ROOT, "packages");
if (existsSync(packagesRoot)) {
  for (const entry of readdirSync(packagesRoot, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const packageDir = path.join(packagesRoot, entry.name);
    const manifestPath = path.join(packageDir, "package.json");
    if (!existsSync(manifestPath)) continue;
    const manifest = readJson(manifestPath);
    if (!manifest.scripts?.build?.includes("vp pack")) continue;
    if (!existsSync(path.join(packageDir, "vite.config.ts"))) {
      problems.push(`${manifest.name}: build invokes vp pack but vite.config.ts is missing`);
    }
    for (const legacy of ["tsdown.config.ts", "tsdown.config.js", "tsdown.config.mjs"]) {
      if (existsSync(path.join(packageDir, legacy))) {
        problems.push(
          `${manifest.name}: ${legacy} is ignored by current Vite+; use vite.config.ts`,
        );
      }
    }
  }
}

if (problems.length > 0) {
  console.error("guard:package-artifacts — package build output is not publishable:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `guard:package-artifacts — PASS: ${checkedTargets} manifest target(s) exist across ${publicPackageDirs.length} public packages; all vp pack packages use vite.config.ts.`,
);
