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
  "packages/geist",
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

function targetStem(target) {
  return target.replace(/\.d\.[cm]?ts$/, "").replace(/\.[cm]?[jt]sx?$/, "");
}

// A public subpath pattern (`./icon/s2wf-icons/*`) is not one file. Expand it
// against the package so a declaration-only match cannot pass as shipped JS.
function expandedTargets(packageDir, target) {
  if (!target.includes("*")) return [target];
  const star = target.indexOf("*");
  const prefix = target.slice(0, star);
  const suffix = target.slice(star + 1);
  const directory = path.resolve(ROOT, packageDir, prefix);
  if (!existsSync(directory)) return [];
  return readdirSync(directory)
    .filter((name) => name.endsWith(suffix))
    .map((name) => `${prefix}${name}`)
    .sort();
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

  if (
    typeof manifest.types === "string" &&
    (typeof manifest.main === "string" || typeof manifest.module === "string")
  ) {
    const jsTarget = manifest.main ?? manifest.module;
    if (targetStem(manifest.types) !== targetStem(jsTarget)) {
      problems.push(
        `${manifest.name} top-level types [${manifest.types}] does not sit alongside JS [${jsTarget}]`,
      );
    }
  }

  for (const [subpath, value] of Object.entries(manifest.exports ?? {})) {
    const targets = exportTargets(value);
    const isCss = subpath.endsWith(".css") || targets.some((t) => t.target.endsWith(".css"));
    if (isCss) {
      const distinctTargets = new Set(targets.map((t) => t.target));
      if (distinctTargets.size > 1) {
        problems.push(
          `${manifest.name} ${subpath}: split CSS export conditions target different files: ${[...distinctTargets].join(", ")}`,
        );
      }
    }

    const typesTarget = targets.find(
      (t) => t.condition === "types" || t.target.endsWith(".d.ts"),
    )?.target;
    if (typesTarget?.includes("*")) {
      const typeFiles = expandedTargets(packageDir, typesTarget);
      if (typeFiles.length === 0) {
        problems.push(
          `${manifest.name} ${subpath}: wildcard types matched nothing (${typesTarget})`,
        );
      }
      const typeStems = new Set(typeFiles.map((file) => targetStem(file)));
      for (const t of targets) {
        if (!t.target.includes("*") || t.target === typesTarget) continue;
        if (t.target.endsWith(".css") || t.target.endsWith(".json")) continue;
        const codeStems = new Set(
          expandedTargets(packageDir, t.target).map((file) => targetStem(file)),
        );
        for (const stem of typeStems) {
          if (!codeStems.has(stem)) {
            problems.push(
              `${manifest.name} ${subpath}: types [${typesTarget}] has ${stem} with no ${t.condition} sibling`,
            );
          }
        }
      }
    } else if (typesTarget) {
      const typesStem = targetStem(typesTarget);
      for (const t of targets) {
        if (t.target === typesTarget || t.target.includes("*")) continue;
        if (t.target.endsWith(".css") || t.target.endsWith(".json")) continue;
        const jsStem = targetStem(t.target);
        if (typesStem !== jsStem) {
          problems.push(
            `${manifest.name} ${subpath}: types [${typesTarget}] does not sit alongside JS ${t.condition} [${t.target}]`,
          );
        }
      }
    }
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
    if (target.includes("*")) {
      const matches = expandedTargets(packageDir, target);
      if (matches.length === 0) {
        problems.push(
          `${manifest.name} ${label} [${condition}] wildcard matched nothing: ${target}`,
        );
      } else {
        checkedTargets += matches.length - 1;
      }
      continue;
    }
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
