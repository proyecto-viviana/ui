#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import {
  builtCodeHasAttributionHeader,
  sourceAttributionHeader,
  sourceMapEntries,
} from "./package-attribution-banner.mjs";

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

function codeFiles(directory, extensionPattern) {
  if (!existsSync(directory)) return [];
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...codeFiles(file, extensionPattern));
    } else if (entry.isFile() && extensionPattern.test(entry.name)) {
      files.push(file);
    }
  }
  return files;
}
const problems = [];
let checkedTargets = 0;
let checkedAttributionHeaders = 0;

let checkedAttributionSources = 0;
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

  const mappedAttributionSources = new Set();
  const runtimeAttributionSources = new Set();
  for (const codeFile of codeFiles(path.join(ROOT, packageDir, "dist"), /\.(?:js|jsx)$/)) {
    const mapFile = `${codeFile}.map`;
    if (!existsSync(mapFile)) continue;

    let sourceMap;
    try {
      sourceMap = readJson(mapFile);
    } catch (error) {
      problems.push(`${path.relative(ROOT, mapFile)}: invalid source map (${error.message})`);
      continue;
    }

    const code = readFileSync(codeFile, "utf8");
    for (const { source, sourceFile, sourceName } of sourceMapEntries(mapFile, sourceMap)) {
      if (typeof source !== "string") continue;
      const header = sourceAttributionHeader(source);
      if (!header) continue;

      mappedAttributionSources.add(sourceFile);
      runtimeAttributionSources.add(sourceFile);
      checkedAttributionHeaders += 1;
      if (!builtCodeHasAttributionHeader(code, header)) {
        problems.push(
          `${path.relative(ROOT, codeFile)}: missing built attribution header for ${sourceName}`,
        );
      }
    }
  }

  for (const codeFile of codeFiles(path.join(ROOT, packageDir, "dist"), /\.d\.ts$/)) {
    const mapFile = `${codeFile}.map`;
    if (!existsSync(mapFile)) continue;

    let sourceMap;
    try {
      sourceMap = readJson(mapFile);
    } catch (error) {
      problems.push(`${path.relative(ROOT, mapFile)}: invalid source map (${error.message})`);
      continue;
    }

    const code = readFileSync(codeFile, "utf8");
    for (const { source, sourceFile, sourceName } of sourceMapEntries(mapFile, sourceMap)) {
      if (runtimeAttributionSources.has(sourceFile) || typeof source !== "string") continue;
      const header = sourceAttributionHeader(source);
      if (!header) continue;

      mappedAttributionSources.add(sourceFile);
      checkedAttributionHeaders += 1;
      if (!builtCodeHasAttributionHeader(code, header)) {
        problems.push(
          `${path.relative(ROOT, codeFile)}: missing built attribution header for ${sourceName}`,
        );
      }
    }
  }

  for (const sourceFile of codeFiles(path.join(ROOT, packageDir, "src"), /\.(?:ts|tsx)$/)) {
    const source = readFileSync(sourceFile, "utf8");
    if (!sourceAttributionHeader(source)) continue;

    checkedAttributionSources += 1;
    if (!mappedAttributionSources.has(path.resolve(sourceFile))) {
      problems.push(
        `${path.relative(ROOT, sourceFile)}: attributed source has no mapped build output`,
      );
    }
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
  `guard:package-artifacts — PASS: ${checkedTargets} manifest target(s) exist across ${publicPackageDirs.length} public packages; ${checkedAttributionHeaders} mapped attribution header reference(s) cover ${checkedAttributionSources} attributed source file(s); all vp pack packages use vite.config.ts.`,
);
