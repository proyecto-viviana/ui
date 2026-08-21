#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import {
  builtCodeHasAttributionHeader,
  sourceAttributionHeader,
  sourceMapEntries,
} from "./package-attribution-banner.mjs";

const packageDir = path.resolve(process.cwd(), process.argv[2] ?? ".");
const distDir = path.join(packageDir, "dist");

function files(directory, pattern) {
  if (!existsSync(directory)) return [];
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) return files(file, pattern);
    return entry.isFile() && pattern.test(entry.name) ? [file] : [];
  });
}

function readSourceMap(codeFile) {
  const mapFile = `${codeFile}.map`;
  if (!existsSync(mapFile)) return null;
  try {
    return { mapFile, sourceMap: JSON.parse(readFileSync(mapFile, "utf8")) };
  } catch (error) {
    throw new Error(`${path.relative(process.cwd(), mapFile)}: ${error.message}`);
  }
}

const runtimeSources = new Set();
for (const codeFile of files(distDir, /\.(?:js|jsx)$/)) {
  const mapped = readSourceMap(codeFile);
  if (!mapped) continue;
  for (const entry of sourceMapEntries(mapped.mapFile, mapped.sourceMap)) {
    if (typeof entry.source === "string" && sourceAttributionHeader(entry.source)) {
      runtimeSources.add(entry.sourceFile);
    }
  }
}

let wrote = 0;
for (const declarationFile of files(distDir, /\.d\.ts$/)) {
  const mapped = readSourceMap(declarationFile);
  if (!mapped) continue;

  const headers = new Set();
  for (const entry of sourceMapEntries(mapped.mapFile, mapped.sourceMap)) {
    if (runtimeSources.has(entry.sourceFile) || typeof entry.source !== "string") continue;
    const header = sourceAttributionHeader(entry.source);
    if (header) headers.add(header);
  }
  if (headers.size === 0) continue;

  const declaration = readFileSync(declarationFile, "utf8");
  const missing = [...headers].filter(
    (header) => !builtCodeHasAttributionHeader(declaration, header),
  );
  if (missing.length === 0) continue;

  writeFileSync(declarationFile, `${missing.join("\n\n")}\n\n${declaration}`);
  wrote += 1;
}

console.log(
  `write-package-declaration-attribution — wrote ${wrote} declaration attribution banner(s) in ${path.relative(process.cwd(), packageDir) || "."}`,
);
