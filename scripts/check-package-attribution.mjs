#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const adobePackages = [
  {
    dir: "packages/solid-stately",
    name: "@proyecto-viviana/solid-stately",
  },
  {
    dir: "packages/solidaria",
    name: "@proyecto-viviana/solidaria",
  },
  {
    dir: "packages/solidaria-components",
    name: "@proyecto-viviana/solidaria-components",
  },
  {
    dir: "packages/solid-spectrum",
    name: "@proyecto-viviana/solid-spectrum",
  },
  {
    dir: "packages/viviana-ui",
    name: "@proyecto-viviana/ui",
  },
];
const kumoPackage = {
  dir: "packages/kumo",
  name: "@proyecto-viviana/kumo",
};
const problems = [];

function read(relativePath) {
  const absolutePath = path.join(root, relativePath);
  if (!existsSync(absolutePath)) {
    problems.push(`${relativePath}: file is missing`);
    return null;
  }
  return readFileSync(absolutePath, "utf8");
}

function readManifest(packageDir) {
  const content = read(path.join(packageDir, "package.json"));
  if (content === null) return null;
  try {
    return JSON.parse(content);
  } catch (error) {
    problems.push(`${packageDir}/package.json: invalid JSON (${error.message})`);
    return null;
  }
}

function requireExactCopy(packageDir, file, expected) {
  const actual = read(path.join(packageDir, file));
  if (actual !== null && expected !== null && actual !== expected) {
    problems.push(`${packageDir}/${file}: content differs from root ${file}`);
  }
}

function requireManifestFiles(manifest, packageDir, requiredFiles) {
  if (!Array.isArray(manifest.files)) {
    problems.push(`${packageDir}/package.json: files must be an array`);
    return;
  }
  for (const file of requiredFiles) {
    if (!manifest.files.includes(file)) {
      problems.push(`${packageDir}/package.json: files does not include ${file}`);
    }
  }
}

function sourceFiles(directory) {
  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...sourceFiles(absolutePath));
    } else if (
      entry.isFile() &&
      /\.(?:ts|tsx)$/.test(entry.name) &&
      !entry.name.endsWith(".d.ts")
    ) {
      files.push(absolutePath);
    }
  }
  return files;
}

const rootMit = read("LICENSE");
const rootApache = read("LICENSE-APACHE-2.0");
const rootNotice = read("NOTICE");
const rootCredits = read("CREDITS.md");

for (const entry of adobePackages) {
  const manifest = readManifest(entry.dir);
  if (manifest !== null) {
    if (manifest.name !== entry.name) {
      problems.push(
        `${entry.dir}/package.json: expected name ${entry.name}, found ${manifest.name ?? "none"}`,
      );
    }
    if (manifest.license !== "MIT AND Apache-2.0") {
      problems.push(`${entry.dir}/package.json: expected license MIT AND Apache-2.0`);
    }
    requireManifestFiles(manifest, entry.dir, ["LICENSE", "LICENSE-APACHE-2.0", "NOTICE"]);
  }

  requireExactCopy(entry.dir, "LICENSE", rootMit);
  requireExactCopy(entry.dir, "LICENSE-APACHE-2.0", rootApache);
  requireExactCopy(entry.dir, "NOTICE", rootNotice);

  for (const publicFile of [
    ["NOTICE", rootNotice],
    ["CREDITS.md", rootCredits],
  ]) {
    if (publicFile[1] !== null && !publicFile[1].includes(entry.name)) {
      problems.push(`${publicFile[0]}: does not name ${entry.name}`);
    }
  }
}

const kumoManifest = readManifest(kumoPackage.dir);
if (kumoManifest !== null) {
  if (kumoManifest.name !== kumoPackage.name) {
    problems.push(
      `${kumoPackage.dir}/package.json: expected name ${kumoPackage.name}, found ${kumoManifest.name ?? "none"}`,
    );
  }
  if (kumoManifest.license !== "MIT") {
    problems.push(`${kumoPackage.dir}/package.json: expected license MIT`);
  }
  requireManifestFiles(kumoManifest, kumoPackage.dir, ["LICENSE", "LICENSE-CLOUDFLARE"]);
}
requireExactCopy(kumoPackage.dir, "LICENSE", rootMit);
read(path.join(kumoPackage.dir, "LICENSE-CLOUDFLARE"));

const sourceInventory = adobePackages.map((entry) => {
  const files = sourceFiles(path.join(root, entry.dir, "src"));
  let adobeHeaders = 0;
  let sourceMarkers = 0;
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    if (
      content.includes("Copyright") &&
      content.includes("Adobe") &&
      content.includes("licensed to you under the Apache License, Version 2.0")
    ) {
      adobeHeaders += 1;
    }
    if (
      /\b(?:Ported from|Based on)\s+(?:@react-(?:aria|spectrum|stately|types)|react-aria-components|React[- ]Aria)/i.test(
        content,
      )
    ) {
      sourceMarkers += 1;
    }
  }
  return { ...entry, files: files.length, adobeHeaders, sourceMarkers };
});

if (problems.length > 0) {
  console.error("guard:attribution — package attribution is incomplete:");
  for (const problem of problems) console.error(`- ${problem}`);
  process.exit(1);
}

console.log(
  `guard:attribution — PASS: ${adobePackages.length} Adobe-derived packages ship exact MIT, Apache-2.0, and NOTICE copies; Kumo ships its local and upstream MIT licenses.`,
);
console.log("Source inventory (report only; it is not a compliance claim):");
for (const entry of sourceInventory) {
  const headerLabel = entry.adobeHeaders === 1 ? "header" : "headers";
  const markerLabel = entry.sourceMarkers === 1 ? "marker" : "markers";
  console.log(
    `- ${entry.name}: ${entry.files} TS/TSX files, ${entry.adobeHeaders} Adobe ${headerLabel}, ${entry.sourceMarkers} source ${markerLabel}`,
  );
}
