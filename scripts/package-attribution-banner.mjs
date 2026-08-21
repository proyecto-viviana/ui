import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

const managedHeaderPattern =
  /^(?:\/\/ @ts-nocheck[^\r\n]*(?:\r?\n){2})?(\/\*[\s\S]*?\*\/(?:\r?\n){2}\/\/ Ported to SolidJS for Proyecto Viviana; based on [^\r\n]+)/;

export function sourceAttributionHeader(source) {
  const header = source.match(managedHeaderPattern)?.[1] ?? null;
  if (
    !header?.includes("Adobe") ||
    !header.includes("Apache License, Version 2.0") ||
    !header.includes("WITHOUT WARRANTIES OR REPRESENTATIONS")
  ) {
    return null;
  }
  return header;
}

function normalizeBuiltAttributionHeader(value) {
  return value
    .replace(/\r\n/g, "\n")
    .replace(/^ (?=\*)/gm, "")
    .replace(/\*\/\n\n(?=\/\/ Ported to SolidJS)/g, "*/\n");
}

export function builtCodeHasAttributionHeader(code, header) {
  return normalizeBuiltAttributionHeader(code).includes(normalizeBuiltAttributionHeader(header));
}

export function sourceMapEntries(mapFile, sourceMap) {
  return (sourceMap.sources ?? []).map((sourceName, index) => {
    const sourceFile = path.resolve(path.dirname(mapFile), sourceMap.sourceRoot ?? "", sourceName);
    let source = sourceMap.sourcesContent?.[index];
    if (typeof source !== "string" && existsSync(sourceFile)) {
      try {
        source = readFileSync(sourceFile, "utf8");
      } catch {
        source = null;
      }
    }
    return { source, sourceFile, sourceName };
  });
}

export function packageAttributionBanner(chunk) {
  const headers = new Set();
  for (const moduleId of [...(chunk.moduleIds ?? [])].sort()) {
    const file = moduleId.replace(/\?.*$/, "");
    if (!existsSync(file)) continue;

    let source;
    try {
      source = readFileSync(file, "utf8");
    } catch {
      continue;
    }

    const header = sourceAttributionHeader(source);
    if (header) headers.add(header);
  }
  return [...headers].join("\n\n");
}
