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

function prependHeaders(codeFile, mapped, headers) {
  const prefix = `${headers.join("\n\n")}\n\n`;
  const lineOffset = prefix.split("\n").length - 1;

  if (typeof mapped.sourceMap.mappings === "string") {
    mapped.sourceMap.mappings = `${";".repeat(lineOffset)}${mapped.sourceMap.mappings}`;
  } else if (Array.isArray(mapped.sourceMap.sections)) {
    for (const section of mapped.sourceMap.sections) {
      if (section?.offset && Number.isInteger(section.offset.line)) {
        section.offset.line += lineOffset;
      }
    }
  } else {
    throw new Error(
      `${path.relative(process.cwd(), mapped.mapFile)}: cannot shift an unsupported source map`,
    );
  }

  writeFileSync(codeFile, `${prefix}${readFileSync(codeFile, "utf8")}`);
  writeFileSync(mapped.mapFile, `${JSON.stringify(mapped.sourceMap)}\n`);
}

const runtimeSources = new Set();
let wroteRuntime = 0;
for (const codeFile of files(distDir, /\.(?:js|jsx)$/)) {
  const mapped = readSourceMap(codeFile);
  if (!mapped) continue;

  const headers = new Set();
  for (const entry of sourceMapEntries(mapped.mapFile, mapped.sourceMap)) {
    if (typeof entry.source !== "string") continue;
    const header = sourceAttributionHeader(entry.source);
    if (!header) continue;
    runtimeSources.add(entry.sourceFile);
    headers.add(header);
  }

  const code = readFileSync(codeFile, "utf8");
  const missing = [...headers].filter((header) => !builtCodeHasAttributionHeader(code, header));
  if (missing.length === 0) continue;

  prependHeaders(codeFile, mapped, missing);
  wroteRuntime += 1;
}

let wroteDeclaration = 0;
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
  wroteDeclaration += 1;
}

console.log(
  `write-package-declaration-attribution — wrote ${wroteRuntime} runtime and ${wroteDeclaration} declaration attribution banner(s) in ${path.relative(process.cwd(), packageDir) || "."}`,
);
