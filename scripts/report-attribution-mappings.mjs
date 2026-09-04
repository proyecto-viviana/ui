#!/usr/bin/env node

import { createHash } from "node:crypto";
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import { comments, normalizedComment, sourceMarkers } from "./attribution-source-markers.mjs";

const root = process.cwd();
const upstreamRoot = path.join(root, "react-spectrum", "packages");
const generatorPath = path.join(root, "scripts", "generate-solid-spectrum-icons.mjs");
const comparisonManifestPath = path.join(root, "apps/comparison/package.json");
const upstreamPinPath = path.join(root, "scripts/upstream-pin.json");
const requireFromComparison = createRequire(comparisonManifestPath);
const headerlessReviewPath = path.join(root, "scripts", "attribution-headerless-reviews.json");
const compositeReviewPath = path.join(root, "scripts", "attribution-composite-reviews.json");
const localReviewPath = path.join(root, "scripts", "attribution-local-reviews.json");
const localReviewClassifications = new Set(["local-module-surface", "local-solid-helper"]);
const jsonOutput = process.argv.includes("--json");
const showAll = process.argv.includes("--all");
const checkHeaders = process.argv.includes("--check-headers");
const writeHeaders = process.argv.includes("--write-headers");
const knownArgs = ["--json", "--all", "--check-headers", "--write-headers"];
const unknownArgs = process.argv.slice(2).filter((arg) => !knownArgs.includes(arg));

const packages = [
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

function fail(message) {
  console.error(`report:attribution-mappings — ${message}`);
  process.exit(1);
}

function readJson(filePath, label) {
  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch (error) {
    fail(`${label} is invalid JSON (${error.message})`);
  }
}

function loadInstalledS2Package() {
  const comparisonManifest = readJson(comparisonManifestPath, "apps/comparison/package.json");
  const upstreamPin = readJson(upstreamPinPath, "scripts/upstream-pin.json");
  let manifestPath;
  try {
    manifestPath = requireFromComparison.resolve("@react-spectrum/s2/package.json");
  } catch (error) {
    fail(`the pinned @react-spectrum/s2 package is not installed (${error.message})`);
  }
  const installedManifest = readJson(manifestPath, "installed @react-spectrum/s2/package.json");
  const declaredVersion = comparisonManifest.dependencies?.["@react-spectrum/s2"];
  const pinnedVersion = upstreamPin.tags?.["@react-spectrum/s2"];
  if (
    !declaredVersion ||
    declaredVersion !== pinnedVersion ||
    declaredVersion !== installedManifest.version
  ) {
    fail(
      `@react-spectrum/s2 version mismatch: comparison=${declaredVersion ?? "missing"}, pin=${pinnedVersion ?? "missing"}, installed=${installedManifest.version ?? "missing"}`,
    );
  }
  if (installedManifest.license !== "Apache-2.0") {
    fail(
      `installed @react-spectrum/s2 has unexpected license ${installedManifest.license ?? "missing"}`,
    );
  }

  return {
    root: path.dirname(manifestPath),
    version: installedManifest.version,
    license: installedManifest.license,
  };
}

if (unknownArgs.length > 0) {
  fail(`unknown argument${unknownArgs.length === 1 ? "" : "s"}: ${unknownArgs.join(", ")}`);
}

if (writeHeaders && (jsonOutput || showAll || checkHeaders)) {
  fail("--write-headers cannot be combined with another output mode");
}

if (!existsSync(upstreamRoot)) {
  fail(
    "the pinned react-spectrum/packages tree is missing; exact source mappings cannot be reported",
  );
}
let installedS2Package;

if (!existsSync(headerlessReviewPath)) {
  fail("scripts/attribution-headerless-reviews.json is missing");
}
if (!existsSync(compositeReviewPath)) {
  fail("scripts/attribution-composite-reviews.json is missing");
}
if (!existsSync(localReviewPath)) {
  fail("scripts/attribution-local-reviews.json is missing");
}

let headerlessReviewEntries;
try {
  headerlessReviewEntries = JSON.parse(readFileSync(headerlessReviewPath, "utf8"));
} catch (error) {
  fail(`scripts/attribution-headerless-reviews.json is invalid JSON (${error.message})`);
}
if (!Array.isArray(headerlessReviewEntries)) {
  fail("scripts/attribution-headerless-reviews.json must contain an array");
}

let compositeReviewEntries;
try {
  compositeReviewEntries = JSON.parse(readFileSync(compositeReviewPath, "utf8"));
} catch (error) {
  fail(`scripts/attribution-composite-reviews.json is invalid JSON (${error.message})`);
}
if (!Array.isArray(compositeReviewEntries)) {
  fail("scripts/attribution-composite-reviews.json must contain an array");
}

let localReviewEntries;
try {
  localReviewEntries = JSON.parse(readFileSync(localReviewPath, "utf8"));
} catch (error) {
  fail(`scripts/attribution-local-reviews.json is invalid JSON (${error.message})`);
}
if (!Array.isArray(localReviewEntries)) {
  fail("scripts/attribution-local-reviews.json must contain an array");
}

const reviewedHeaderlessMappings = new Map();
for (const [index, entry] of headerlessReviewEntries.entries()) {
  const label = `scripts/attribution-headerless-reviews.json entry ${index + 1}`;
  if (
    !entry ||
    typeof entry !== "object" ||
    typeof entry.localPath !== "string" ||
    entry.localPath.length === 0 ||
    typeof entry.upstreamPath !== "string" ||
    entry.upstreamPath.length === 0 ||
    !Array.isArray(entry.requiredText) ||
    entry.requiredText.length === 0 ||
    entry.requiredText.some((value) => typeof value !== "string" || value.length === 0)
  ) {
    fail(
      `${label} must contain localPath, upstreamPath, and an array of non-empty requiredText strings`,
    );
  }
  if (reviewedHeaderlessMappings.has(entry.localPath)) {
    fail(`${label} repeats localPath ${entry.localPath}`);
  }
  reviewedHeaderlessMappings.set(entry.localPath, {
    upstreamPath: entry.upstreamPath,
    requiredText: entry.requiredText,
  });
}

const reviewedCompositeMappings = new Map();
for (const [index, entry] of compositeReviewEntries.entries()) {
  const label = `scripts/attribution-composite-reviews.json entry ${index + 1}`;
  if (
    !entry ||
    typeof entry !== "object" ||
    typeof entry.localPath !== "string" ||
    entry.localPath.length === 0 ||
    !Array.isArray(entry.upstreamPaths) ||
    entry.upstreamPaths.length < 2 ||
    entry.upstreamPaths.some(
      (value) => typeof value !== "string" || value.length === 0 || !value.startsWith("packages/"),
    ) ||
    !Array.isArray(entry.requiredText) ||
    entry.requiredText.length === 0 ||
    entry.requiredText.some((value) => typeof value !== "string" || value.length === 0)
  ) {
    fail(
      `${label} must contain localPath, at least two upstreamPaths, and an array of non-empty requiredText strings`,
    );
  }
  const uniqueUpstreamPaths = [...new Set(entry.upstreamPaths)];
  if (uniqueUpstreamPaths.length !== entry.upstreamPaths.length) {
    fail(`${label} repeats an upstream path`);
  }
  if (reviewedCompositeMappings.has(entry.localPath)) {
    fail(`${label} repeats localPath ${entry.localPath}`);
  }
  reviewedCompositeMappings.set(entry.localPath, {
    upstreamPaths: uniqueUpstreamPaths.sort(),
    requiredText: entry.requiredText,
  });
}

const reviewedLocalSources = new Map();
for (const [index, entry] of localReviewEntries.entries()) {
  const label = `scripts/attribution-local-reviews.json entry ${index + 1}`;
  if (
    !entry ||
    typeof entry !== "object" ||
    typeof entry.localPath !== "string" ||
    entry.localPath.length === 0 ||
    !localReviewClassifications.has(entry.classification) ||
    typeof entry.contentSha256 !== "string" ||
    !/^[a-f0-9]{64}$/.test(entry.contentSha256)
  ) {
    fail(
      `${label} must contain localPath, a supported local classification, and a lowercase SHA-256 content hash`,
    );
  }
  if (reviewedLocalSources.has(entry.localPath)) {
    fail(`${label} repeats localPath ${entry.localPath}`);
  }
  reviewedLocalSources.set(entry.localPath, {
    classification: entry.classification,
    contentSha256: entry.contentSha256,
  });
}

function slash(file) {
  return file.split(path.sep).join("/");
}

function sourceFiles(
  directory,
  extensions = /\.(?:ts|tsx)$/,
  { includeDeclarations = false } = {},
) {
  if (!existsSync(directory)) return [];

  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules") {
        files.push(...sourceFiles(absolutePath, extensions, { includeDeclarations }));
      }
    } else if (
      entry.isFile() &&
      extensions.test(entry.name) &&
      (includeDeclarations || !entry.name.endsWith(".d.ts"))
    ) {
      files.push(absolutePath);
    }
  }
  return files;
}

function adobeHeader(content) {
  const apache =
    content.includes("Copyright") &&
    content.includes("Adobe") &&
    content.includes("licensed to you under the Apache License, Version 2.0");
  if (!apache) return { kind: "none", year: null };

  const year = content.match(/Copyright\s+(\d{4}(?:-\d{4})?)\s+Adobe/)?.[1] ?? null;
  const full =
    content.includes("Unless required by applicable law or agreed to in writing") &&
    (content.includes("WITHOUT WARRANTIES OR REPRESENTATIONS") ||
      content.includes("WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND"));
  return { kind: full ? "full" : "short", year };
}

function headerlessReviewContract(relativePath, content, sources, localHeader, status) {
  const review = reviewedHeaderlessMappings.get(relativePath);
  if (!review) return null;

  const actualUpstreamPath = sources.length === 1 ? sources[0].relativePath : null;
  const upstreamHeader = sources.length === 1 ? adobeHeader(sources[0].content) : null;
  const missingText = review.requiredText.filter((value) => !content.includes(value));
  const satisfied =
    status === "exact-no-header" &&
    actualUpstreamPath === review.upstreamPath &&
    upstreamHeader?.kind === "none" &&
    localHeader.kind === "none" &&
    missingText.length === 0;

  return {
    status: satisfied ? "satisfied" : "mismatch",
    upstreamPath: review.upstreamPath,
    actualUpstreamPath,
    upstreamHeader: upstreamHeader?.kind ?? null,
    localHeader: localHeader.kind,
    missingText,
  };
}

function compositeReviewContract(relativePath, content, sources, status) {
  const review = reviewedCompositeMappings.get(relativePath);
  if (!review) return null;

  const actualUpstreamPaths = sources.map((source) => source.relativePath).sort();
  const missingText = review.requiredText.filter((value) => !content.includes(value));
  const satisfied =
    status === "multiple" &&
    actualUpstreamPaths.length === review.upstreamPaths.length &&
    actualUpstreamPaths.every((value, index) => value === review.upstreamPaths[index]) &&
    missingText.length === 0;
  const reviewedSources = satisfied
    ? review.upstreamPaths.map((sourcePath) => fileAt(sourcePath))
    : [];
  const missingUpstreamPath = reviewedSources.findIndex((source) => source === null);
  const headerContract =
    satisfied && missingUpstreamPath === -1
      ? compositeAttributionHeaderContract(content, reviewedSources)
      : null;

  return {
    status: satisfied ? "satisfied" : "mismatch",
    upstreamPaths: review.upstreamPaths,
    actualUpstreamPaths,
    upstreamHeaders: sources.map((source) => ({
      path: source.relativePath,
      ...adobeHeader(source.content),
    })),
    missingText,
    headerContract,
  };
}

function fullAdobeHeaderBlock(content) {
  return (
    (content.match(/\/\*[\s\S]*?\*\//g) ?? []).find(
      (comment) => adobeHeader(comment).kind === "full",
    ) ?? null
  );
}

function sha256(content) {
  return createHash("sha256").update(content).digest("hex");
}

function localReviewContract(relativePath, content, status) {
  const review = reviewedLocalSources.get(relativePath);
  if (!review) return null;

  const actualContentSha256 = sha256(content);
  return {
    status:
      status === "unmarked" && actualContentSha256 === review.contentSha256
        ? "satisfied"
        : "mismatch",
    classification: review.classification,
    contentSha256: review.contentSha256,
    actualContentSha256,
  };
}

function portLineFor(upstreamPath) {
  return `// Ported to SolidJS for Proyecto Viviana; based on ${upstreamPath}`;
}

function uniqueFullAdobeHeaderBlocks(sources) {
  const seen = new Set();
  const blocks = [];
  for (const source of sources) {
    const block = fullAdobeHeaderBlock(source.content);
    if (block && !seen.has(block)) {
      seen.add(block);
      blocks.push(block);
    }
  }
  return blocks;
}

function compositeAttributionPrefix(sources) {
  const headerBlocks = uniqueFullAdobeHeaderBlocks(sources);
  const portLines = sources.map((source) => portLineFor(source.relativePath));
  return `${[...headerBlocks, portLines.join("\n")].filter(Boolean).join("\n\n")}\n\n`;
}

function splitTsNocheck(content) {
  const match = content.match(/^\/\/ @ts-nocheck[^\S\r\n]*(?:\r?\n|$)/);
  if (!match) return { directive: null, body: content };

  return {
    directive: match[0].trim(),
    body: content.slice(match[0].length).replace(/^\r?\n/, ""),
  };
}

function attributionHeaderContract(content, source) {
  const adobeBlock = fullAdobeHeaderBlock(source.content);
  if (!adobeBlock) {
    throw new Error(`${source.relativePath}: exact mapping has no full Adobe header`);
  }

  const portLine = portLineFor(source.relativePath);
  const { directive, body } = splitTsNocheck(content);
  const tsNocheckFirst = !content.includes("// @ts-nocheck") || directive !== null;
  const expectedPrefix = `${adobeBlock}\n\n${portLine}\n\n`;
  const satisfied = tsNocheckFirst && body.startsWith(expectedPrefix);
  const hasManagedContent =
    adobeHeader(content).kind !== "none" ||
    content.includes("Ported to SolidJS for Proyecto Viviana; based on");

  return {
    status: satisfied ? "satisfied" : hasManagedContent ? "mismatch" : "missing",
    upstreamPath: source.relativePath,
    adobeHeaderSha256: sha256(adobeBlock),
    portLine,
    tsNocheckFirst,
  };
}

function compositeAttributionHeaderContract(content, sources) {
  const expectedPrefix = compositeAttributionPrefix(sources);
  const { directive, body } = splitTsNocheck(content);
  const tsNocheckFirst = !content.includes("// @ts-nocheck") || directive !== null;
  const satisfied = tsNocheckFirst && body.startsWith(expectedPrefix);
  const hasManagedContent =
    adobeHeader(content).kind !== "none" ||
    content.includes("Ported to SolidJS for Proyecto Viviana; based on");

  return {
    status: satisfied ? "satisfied" : hasManagedContent ? "mismatch" : "missing",
    adobeHeaderSha256: uniqueFullAdobeHeaderBlocks(sources).map((block) => sha256(block)),
    portLines: sources.map((source) => portLineFor(source.relativePath)),
    tsNocheckFirst,
  };
}

function stripManagedAttributionPrefix(content) {
  const { directive, body: contentBody } = splitTsNocheck(content);
  if (content.includes("// @ts-nocheck") && directive === null) {
    throw new Error("a required // @ts-nocheck directive is not the first line");
  }

  let body = contentBody.replace(/^(?:\r?\n)+/, "");
  while (true) {
    const leadingBlock = body.match(/^\/\*[\s\S]*?\*\//)?.[0] ?? null;
    if (!leadingBlock || adobeHeader(leadingBlock).kind === "none") break;
    if (adobeHeader(leadingBlock).kind !== "full") {
      throw new Error("a leading Adobe header is not the full upstream block");
    }
    body = body.slice(leadingBlock.length).replace(/^(?:\r?\n)+/, "");
  }

  while (true) {
    const portLine = body.match(
      /^\/\/ Ported to SolidJS for Proyecto Viviana; based on [^\r\n]+(?:\r?\n|$)/,
    )?.[0];
    if (!portLine) break;
    body = body.slice(portLine.length).replace(/^(?:\r?\n)+/, "");
  }

  if (adobeHeader(body).kind !== "none") {
    throw new Error("an Adobe header exists outside the managed file prefix");
  }
  if (body.includes("// Ported to SolidJS for Proyecto Viviana; based on")) {
    throw new Error("a Solid port line exists outside the managed file prefix");
  }

  return { directive, body };
}

function rewriteAttributionHeader(content, source) {
  const adobeBlock = fullAdobeHeaderBlock(source.content);
  if (!adobeBlock) {
    throw new Error(`${source.relativePath}: exact mapping has no full Adobe header`);
  }

  const { directive, body } = stripManagedAttributionPrefix(content);
  const directivePrefix = directive ? `${directive}\n\n` : "";
  return `${directivePrefix}${adobeBlock}\n\n${portLineFor(source.relativePath)}\n\n${body}`;
}

function rewriteCompositeAttributionHeader(content, sources) {
  const { directive, body } = stripManagedAttributionPrefix(content);
  const directivePrefix = directive ? `${directive}\n\n` : "";
  return `${directivePrefix}${compositeAttributionPrefix(sources)}${body}`;
}

function isS2GeneratedComment(comment) {
  return (
    /\bAuto-generated\b/i.test(comment) &&
    /(?:React Spectrum S2|@react-spectrum\/s2)/i.test(comment)
  );
}

const generatorNotices = new Set(
  comments(existsSync(generatorPath) ? readFileSync(generatorPath, "utf8") : "")
    .filter(isS2GeneratedComment)
    .map(normalizedComment),
);
if (generatorNotices.size > 0) {
  installedS2Package = loadInstalledS2Package();
}

const upstreamFiles = sourceFiles(upstreamRoot, /\.(?:ts|tsx|js|jsx|css|svg|json)$/, {
  includeDeclarations: true,
}).map((absolutePath) => {
  const relativePath = slash(path.relative(path.join(root, "react-spectrum"), absolutePath));
  const extension = path.extname(absolutePath);
  return {
    absolutePath,
    relativePath,
    stem: path.basename(absolutePath, extension),
    content: readFileSync(absolutePath, "utf8"),
  };
});
const upstreamByPath = new Map(upstreamFiles.map((file) => [file.relativePath, file]));

function unique(files) {
  return [...new Map(files.map((file) => [file.relativePath, file])).values()];
}

function fileAt(relativePath) {
  return upstreamByPath.get(relativePath) ?? null;
}

function candidatesUnder(prefix, stem) {
  return upstreamFiles.filter((file) => file.relativePath.startsWith(prefix) && file.stem === stem);
}

function modulePrefixes(scope, packageName) {
  const prefixes = [`packages/@react-${scope}/${packageName}/src/`];
  if (scope === "aria" || scope === "stately") {
    prefixes.push(`packages/react-${scope}/src/${packageName}/`);
  }
  return prefixes;
}

function resolvePackageSymbol(scope, packageName, symbol) {
  const cleanSymbol = symbol.replace(/[.,;:)'"`]+$/g, "");
  if (!cleanSymbol) return [];
  return unique(
    modulePrefixes(scope, packageName).flatMap((prefix) => candidatesUnder(prefix, cleanSymbol)),
  );
}

function resolveUniqueStem(prefixes, symbol) {
  const matches = upstreamFiles.filter(
    (file) =>
      prefixes.some((prefix) => file.relativePath.startsWith(prefix)) && file.stem === symbol,
  );
  return matches.length === 1 ? matches : [];
}

function explicitSources(markers) {
  const resolved = [];

  for (const marker of markers) {
    const exactRepositoryPaths = marker.matchAll(
      /\b(packages\/(?:@react-(?:aria|spectrum|stately|types)\/[a-z0-9-]+|@internationalized\/[a-z0-9-]+|react-(?:aria|stately)|react-aria-components)\/[A-Za-z0-9@_./-]+\.(?:tsx?|jsx?|css|svg|json))\b/gi,
    );
    for (const match of exactRepositoryPaths) {
      const candidate = fileAt(match[1]);
      if (candidate) resolved.push(candidate);
    }

    const urls = marker.matchAll(
      /https:\/\/github\.com\/adobe\/react-spectrum\/blob\/[^/\s]+\/(packages\/[A-Za-z0-9@_./-]+)/g,
    );
    for (const match of urls) {
      const sourcePath = match[1].replace(/[.,;:)'"`]+$/g, "");
      let candidate = fileAt(sourcePath);
      const legacyPath = sourcePath.match(/^packages\/@react-(aria|stately)\/([^/]+)\/src\/(.+)$/);
      if (!candidate && legacyPath) {
        candidate = fileAt(`packages/react-${legacyPath[1]}/src/${legacyPath[2]}/${legacyPath[3]}`);
      }
      if (candidate) resolved.push(candidate);
    }

    const racPaths = marker.matchAll(
      /react-aria-components(?:\/src)?\/([A-Za-z0-9_.-]+\.(?:tsx?|jsx?))\b/gi,
    );
    for (const match of racPaths) {
      const candidate = fileAt(`packages/react-aria-components/src/${match[1]}`);
      if (candidate) resolved.push(candidate);
    }

    const repositoryPaths = marker.matchAll(
      /\breact-(aria|stately)(?:\/src)?\/([A-Za-z0-9_./-]+\.(?:tsx?|jsx?))\b/gi,
    );
    for (const match of repositoryPaths) {
      const candidate = fileAt(`packages/react-${match[1]}/src/${match[2]}`);
      if (candidate) resolved.push(candidate);
    }

    const packageReferences = [
      ...marker.matchAll(
        /@react-(aria|stately|types|spectrum)\/([a-z0-9-]+)(?:\/([A-Za-z][A-Za-z0-9_.-]*))?/gi,
      ),
    ];
    for (const match of packageReferences) {
      const [, scope, packageName, pathSymbol] = match;
      if (
        (scope === "aria" || scope === "stately") &&
        /\bintl (?:catalog|messages|strings)\b/i.test(marker)
      ) {
        const prefix = `packages/react-${scope}/intl/${packageName}/`;
        resolved.push(...upstreamFiles.filter((file) => file.relativePath.startsWith(prefix)));
      }

      if (pathSymbol) {
        resolved.push(...resolvePackageSymbol(scope, packageName, pathSymbol));
        continue;
      }

      const after = marker.slice((match.index ?? 0) + match[0].length);
      const symbols = [
        ...after.matchAll(
          /\b((?:use|create)[A-Z][A-Za-z0-9]*|[A-Z][A-Za-z0-9]*(?:Collection|Manager|Selection|Event|Delegate|State|Walker)|types|utils|intl)\b/g,
        ),
      ].map((symbolMatch) => symbolMatch[1]);
      for (const symbol of symbols) {
        resolved.push(...resolvePackageSymbol(scope, packageName, symbol));
      }
    }

    if (resolved.length === 0) {
      const racName = marker.match(
        /react-aria-components(?:['’]s)?(?:\s+(?:src\/)?)?\s+([A-Z][A-Za-z0-9]+)/i,
      )?.[1];
      if (racName) {
        resolved.push(...resolveUniqueStem(["packages/react-aria-components/src/"], racName));
      }
    }

    if (resolved.length === 0 && packageReferences.length === 0 && /react[- ]aria/i.test(marker)) {
      const symbols = [
        ...marker.matchAll(
          /\b((?:use|create)[A-Z][A-Za-z0-9]*|[A-Z][A-Za-z0-9]*(?:Event|Delegate|Walker|Pressable|Focusable))\b/g,
        ),
      ].map((match) => match[1]);
      for (const symbol of symbols) {
        resolved.push(
          ...resolveUniqueStem(
            [
              "packages/@react-aria/",
              "packages/react-aria/src/",
              "packages/react-aria-components/src/",
            ],
            symbol,
          ),
        );
      }
    }

    if (
      resolved.length === 0 &&
      packageReferences.length === 0 &&
      /react[- ]stately/i.test(marker)
    ) {
      const symbols = [
        ...marker.matchAll(/\b(use[A-Z][A-Za-z0-9]*|[A-Z][A-Za-z0-9]*State)\b/g),
      ].map((match) => match[1]);
      for (const symbol of symbols) {
        resolved.push(
          ...resolveUniqueStem(["packages/@react-stately/", "packages/react-stately/src/"], symbol),
        );
      }
    }
  }

  return unique(resolved);
}

function pascalFromAssetName(name) {
  return name
    .replace(/^S2_Icon_/, "")
    .replace(/_20_N$/, "")
    .replace(/[^A-Za-z0-9]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join("");
}

function safeIdentifier(name) {
  return /^[A-Za-z_]/.test(name) ? name : `Icon${name}`;
}

function installedS2Input(relativePath) {
  return `@react-spectrum/s2@${installedS2Package.version}/${relativePath}`;
}

function generatedInputPaths(content) {
  return [...content.matchAll(/^\/\/ Generator input: (.+)$/gm)].map((match) => match[1]);
}

function sameGeneratorInputSet(actual, expected) {
  const actualSet = new Set(actual);
  const expectedSet = new Set(expected);
  return (
    actualSet.size === actual.length &&
    expectedSet.size === expected.length &&
    actualSet.size === expectedSet.size &&
    [...actualSet].every((value) => expectedSet.has(value))
  );
}

function normalizedFallbackAsset(content) {
  return content
    .replace(/\r\n/g, "\n")
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .trimEnd();
}

const workflowGeneratedSources = new Map();
const localWorkflowAssets = path.join(root, "packages/solid-spectrum/src/icon/assets/s2wf-icons");
if (installedS2Package && existsSync(localWorkflowAssets)) {
  for (const entry of readdirSync(localWorkflowAssets, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".svg")) continue;
    const inventoryName = path.basename(entry.name, ".svg");
    const moduleName = pascalFromAssetName(inventoryName) || inventoryName;
    const outputName = `${safeIdentifier(`${moduleName}Icon`)}.tsx`;
    const moduleBase = `icons/${moduleName}`;
    const expectedInputs = [
      installedS2Input(`${moduleBase}.mjs`),
      installedS2Input(`${moduleBase}.cjs`),
    ];
    workflowGeneratedSources.set(outputName, {
      expectedInputs,
      inputsExist: ["mjs", "cjs"].every((extension) =>
        existsSync(path.join(installedS2Package.root, `${moduleBase}.${extension}`)),
      ),
    });
  }
}

function generatedSources(relativeWithinPackage, content) {
  const actualInputs = generatedInputPaths(content);
  const uiMatch = relativeWithinPackage.match(/^src\/icon\/ui-icons\/([^/]+)\.tsx$/);
  if (uiMatch) {
    const wrapper = fileAt(`packages/@react-spectrum/s2/ui-icons/${uiMatch[1]}.tsx`);
    if (!wrapper) return { sources: [], verified: false };

    const imports = [...wrapper.content.matchAll(/from\s+['"]\.\/([^'"]+\.svg)['"]/g)].map(
      (match) => match[1],
    );
    const sources = [wrapper];
    const expectedInputs = [];
    let verified = imports.length > 0;
    for (const asset of imports) {
      const upstream = fileAt(`packages/@react-spectrum/s2/ui-icons/${asset}`);
      const localAsset = path.join(root, "packages/solid-spectrum/src/icon/assets/ui-icons", asset);
      const moduleBase = `dist/private/${path.basename(asset, ".svg")}`;
      const packageInputs = [
        installedS2Input(`${moduleBase}.mjs`),
        installedS2Input(`${moduleBase}.cjs`),
      ];
      const packageFiles = ["mjs", "cjs"].map((extension) =>
        path.join(installedS2Package.root, `${moduleBase}.${extension}`),
      );
      if (packageFiles.every(existsSync)) {
        expectedInputs.push(...packageInputs);
      } else if (packageFiles.some(existsSync)) {
        verified = false;
      } else {
        expectedInputs.push(slash(path.relative(root, localAsset)));
        if (
          !upstream ||
          !existsSync(localAsset) ||
          normalizedFallbackAsset(readFileSync(localAsset, "utf8")) !==
            normalizedFallbackAsset(upstream.content)
        ) {
          verified = false;
        } else {
          sources.push(upstream);
        }
      }
    }
    return {
      sources: unique(sources),
      inputPaths: actualInputs,
      expectedInputPaths: expectedInputs,
      verified: verified && sameGeneratorInputSet(actualInputs, expectedInputs),
    };
  }

  const workflowMatch = relativeWithinPackage.match(/^src\/icon\/s2wf-icons\/([^/]+\.tsx)$/);
  if (workflowMatch) {
    const evidence = workflowGeneratedSources.get(workflowMatch[1]);
    return {
      sources: [],
      inputPaths: actualInputs,
      expectedInputPaths: evidence?.expectedInputs ?? [],
      verified:
        Boolean(evidence?.inputsExist) &&
        sameGeneratorInputSet(actualInputs, evidence.expectedInputs),
    };
  }

  if (
    relativeWithinPackage === "src/icon/ui-icons/index.ts" ||
    relativeWithinPackage === "src/icon/s2wf-icons/index.ts"
  ) {
    return {
      sources: [],
      inputPaths: actualInputs,
      expectedInputPaths: [],
      verified: actualInputs.length === 0,
      multiple: true,
    };
  }

  return { sources: [], inputPaths: actualInputs, expectedInputPaths: [], verified: false };
}

function classify(localFile, packageEntry) {
  const content = readFileSync(localFile, "utf8");
  const relativePath = slash(path.relative(root, localFile));
  const relativeWithinPackage = slash(path.relative(path.join(root, packageEntry.dir), localFile));
  const markers = sourceMarkers(content);
  const localHeader = adobeHeader(content);
  const generatedNotice = comments(content).filter(isS2GeneratedComment).map(normalizedComment)[0];

  if (generatedNotice) {
    const generatorSupported = generatorNotices.has(generatedNotice);
    const evidence = generatorSupported
      ? generatedSources(relativeWithinPackage, content)
      : { sources: [], inputPaths: generatedInputPaths(content), expectedInputPaths: [] };
    const headerSources = evidence.sources.filter(
      (source) => adobeHeader(source.content).kind !== "none",
    );
    let status = "generated-unresolved";
    if (!generatorSupported) status = "generated-stale-generator";
    else if (evidence.multiple) status = "generated-multiple";
    else if (evidence.verified && headerSources.length > 0) status = "generated-exact";
    else if (evidence.verified) status = "generated-exact-no-header";

    return {
      package: packageEntry.name,
      path: relativePath,
      status,
      localHeader,
      markers,
      upstreamPaths: evidence.sources.map((source) => source.relativePath),
      generatorInputs: evidence.inputPaths,
      expectedGeneratorInputs: evidence.expectedInputPaths,
      generatedNotice,
      generatorSupported,
      headerSources: headerSources.map((source) => ({
        path: source.relativePath,
        ...adobeHeader(source.content),
      })),
      reviewRequired: !generatorSupported || !evidence.verified,
    };
  }

  const markerEvidence = markers.map((marker) => {
    const sources = explicitSources([marker]);
    return {
      marker,
      upstreamPaths: sources.map((source) => source.relativePath),
      sources,
    };
  });
  const unresolvedMarkers = markerEvidence.filter((evidence) => evidence.sources.length === 0);
  const sources = unique(markerEvidence.flatMap((evidence) => evidence.sources));
  const headerSources = sources.filter((source) => adobeHeader(source.content).kind !== "none");
  let status;
  if (sources.length > 1) status = "multiple";
  else if (sources.length === 1 && unresolvedMarkers.length > 0) {
    status = "marker-unresolved";
  } else if (sources.length === 1 && adobeHeader(sources[0].content).kind === "full") {
    status = "exact";
  } else if (sources.length === 1) {
    status = "exact-no-header";
  } else if (localHeader.kind !== "none") {
    status = "header-unmapped";
  } else if (markers.length > 0) {
    status = "marker-unresolved";
  } else {
    status = "unmarked";
  }

  const localReview = localReviewContract(relativePath, content, status);
  if (localReview?.status === "satisfied") status = "reviewed-local";

  const headerContract = status === "exact" ? attributionHeaderContract(content, sources[0]) : null;
  const headerlessReview = headerlessReviewContract(
    relativePath,
    content,
    sources,
    localHeader,
    status,
  );
  const compositeReview = compositeReviewContract(relativePath, content, sources, status);
  return {
    package: packageEntry.name,
    path: relativePath,
    status,
    localHeader,
    markers,
    upstreamPaths: sources.map((source) => source.relativePath),
    markerEvidence: markerEvidence.map((evidence) => ({
      marker: evidence.marker,
      upstreamPaths: evidence.upstreamPaths,
    })),
    headerSources: headerSources.map((source) => ({
      path: source.relativePath,
      ...adobeHeader(source.content),
    })),
    headerContract,
    headerlessReview,
    localReview,
    reviewRequired:
      status !== "exact" &&
      headerlessReview?.status !== "satisfied" &&
      localReview?.status !== "satisfied" &&
      !(
        compositeReview?.status === "satisfied" &&
        compositeReview.headerContract?.status === "satisfied"
      ),
    compositeReview,
  };
}

const results = [];
const spectrumByRelativePath = new Map();

for (const packageEntry of packages) {
  const directory = path.join(root, packageEntry.dir, "src");
  if (!existsSync(directory) || !statSync(directory).isDirectory()) continue;

  for (const file of sourceFiles(directory).sort()) {
    const relativeWithinPackage = slash(path.relative(path.join(root, packageEntry.dir), file));
    const content = readFileSync(file, "utf8");

    if (packageEntry.dir === "packages/viviana-ui") {
      const spectrum = spectrumByRelativePath.get(relativeWithinPackage);
      if (spectrum && spectrum.content === content) {
        const relativePath = slash(path.relative(root, file));
        results.push({
          package: packageEntry.name,
          path: relativePath,
          status: "mirror",
          localHeader: adobeHeader(content),
          markers: spectrum.result.markers,
          upstreamPaths: spectrum.result.upstreamPaths,
          markerEvidence: spectrum.result.markerEvidence,
          headerSources: spectrum.result.headerSources,
          headerContract: spectrum.result.headerContract,
          headerlessReview: reviewedHeaderlessMappings.has(relativePath)
            ? spectrum.result.headerlessReview
            : undefined,
          compositeReview: reviewedCompositeMappings.has(relativePath)
            ? spectrum.result.compositeReview
            : undefined,
          localReview: reviewedLocalSources.has(relativePath)
            ? spectrum.result.localReview
            : undefined,
          reviewRequired: false,
          mirrorOf: spectrum.result.path,
          inheritedStatus: spectrum.result.status,
          inheritedReviewRequired: spectrum.result.reviewRequired,
        });
        continue;
      }
    }

    const result = classify(file, packageEntry);
    results.push(result);
    if (packageEntry.dir === "packages/solid-spectrum") {
      spectrumByRelativePath.set(relativeWithinPackage, { content, result });
    }
  }
}

for (const localPath of reviewedHeaderlessMappings.keys()) {
  if (!results.some((result) => result.path === localPath && result.headerlessReview)) {
    fail(`${localPath}: reviewed headerless mapping does not match a scanned source file`);
  }
}
for (const localPath of reviewedCompositeMappings.keys()) {
  if (!results.some((result) => result.path === localPath && result.compositeReview)) {
    fail(`${localPath}: reviewed composite mapping does not match a scanned source file`);
  }
}
for (const localPath of reviewedLocalSources.keys()) {
  if (!results.some((result) => result.path === localPath && result.localReview)) {
    fail(`${localPath}: reviewed local source does not match a scanned source file`);
  }
}

const managedHeaderlessResults = results.filter((result) => result.headerlessReview);
const incompleteHeaderlessReviews = managedHeaderlessResults.filter(
  (result) => result.headerlessReview.status !== "satisfied",
);
const managedCompositeResults = results.filter((result) => result.compositeReview);
const incompleteCompositeReviews = managedCompositeResults.filter(
  (result) => result.compositeReview.status !== "satisfied",
);
const managedLocalResults = results.filter((result) => result.localReview);
const incompleteLocalReviews = managedLocalResults.filter(
  (result) => result.localReview.status !== "satisfied",
);

const incompleteCompositeHeaders = managedCompositeResults.filter(
  (result) => result.compositeReview.headerContract?.status !== "satisfied",
);
const managedHeaderResults = results.filter((result) => result.headerContract);

if (writeHeaders) {
  if (incompleteHeaderlessReviews.length > 0) {
    const result = incompleteHeaderlessReviews[0];
    fail(`${result.path}: reviewed headerless mapping is ${result.headerlessReview.status}`);
  }
  if (incompleteCompositeReviews.length > 0) {
    const result = incompleteCompositeReviews[0];
    fail(`${result.path}: reviewed composite mapping is ${result.compositeReview.status}`);
  }
  if (incompleteLocalReviews.length > 0) {
    const result = incompleteLocalReviews[0];
    fail(`${result.path}: reviewed local source is ${result.localReview.status}`);
  }

  const pendingWrites = [];
  for (const result of managedHeaderResults) {
    const source = fileAt(result.headerContract.upstreamPath);
    if (!source) {
      fail(`${result.path}: mapped upstream file is missing`);
    }

    const absolutePath = path.join(root, result.path);
    const content = readFileSync(absolutePath, "utf8");
    let updated;
    try {
      updated = rewriteAttributionHeader(content, source);
    } catch (error) {
      fail(`${result.path}: ${error.message}`);
    }
    if (updated !== content) {
      pendingWrites.push({ absolutePath, updated });
    }
  }

  for (const result of managedCompositeResults) {
    const sources = result.compositeReview.upstreamPaths.map((sourcePath) => fileAt(sourcePath));
    if (sources.some((source) => source === null)) {
      fail(`${result.path}: mapped upstream file is missing`);
    }

    const absolutePath = path.join(root, result.path);
    const content = readFileSync(absolutePath, "utf8");
    let updated;
    try {
      updated = rewriteCompositeAttributionHeader(content, sources);
    } catch (error) {
      fail(`${result.path}: ${error.message}`);
    }
    if (updated !== content) {
      pendingWrites.push({ absolutePath, updated });
    }
  }

  for (const pending of pendingWrites) {
    writeFileSync(pending.absolutePath, pending.updated);
  }
  console.log(
    `report:attribution-mappings — wrote ${pendingWrites.length} attribution header contract${pendingWrites.length === 1 ? "" : "s"}`,
  );
  process.exit(0);
}

const statusCounts = {};
for (const result of results) {
  statusCounts[result.status] = (statusCounts[result.status] ?? 0) + 1;
}

const headerStatusCounts = {};
for (const result of managedHeaderResults) {
  const status = result.headerContract.status;
  headerStatusCounts[status] = (headerStatusCounts[status] ?? 0) + 1;
}

const headerlessReviewStatusCounts = {};
for (const result of managedHeaderlessResults) {
  const status = result.headerlessReview.status;
  headerlessReviewStatusCounts[status] = (headerlessReviewStatusCounts[status] ?? 0) + 1;
}

const compositeReviewStatusCounts = {};
for (const result of managedCompositeResults) {
  const status = result.compositeReview.status;
  compositeReviewStatusCounts[status] = (compositeReviewStatusCounts[status] ?? 0) + 1;
}
const compositeHeaderStatusCounts = {};
for (const result of managedCompositeResults) {
  const status = result.compositeReview.headerContract?.status ?? "unavailable";
  compositeHeaderStatusCounts[status] = (compositeHeaderStatusCounts[status] ?? 0) + 1;
}
const localReviewStatusCounts = {};
for (const result of managedLocalResults) {
  const status = result.localReview.status;
  localReviewStatusCounts[status] = (localReviewStatusCounts[status] ?? 0) + 1;
}

const report = {
  scope: {
    localPackages: packages.map((entry) => entry.name),
    upstream: "react-spectrum/packages",
    sourceExtensions: [".ts", ".tsx"],
    excludesDeclarations: true,
    generator: slash(path.relative(root, generatorPath)),
    generatorNotices: [...generatorNotices].sort(),
  },
  summary: {
    files: results.length,
    reviewRequired: results.filter((result) => result.reviewRequired).length,
    statuses: Object.fromEntries(
      Object.entries(statusCounts).sort(([left], [right]) => left.localeCompare(right)),
    ),
    headerContracts: {
      files: managedHeaderResults.length,
      statuses: Object.fromEntries(
        Object.entries(headerStatusCounts).sort(([left], [right]) => left.localeCompare(right)),
      ),
    },
    headerlessReviews: {
      files: managedHeaderlessResults.length,
      statuses: Object.fromEntries(
        Object.entries(headerlessReviewStatusCounts).sort(([left], [right]) =>
          left.localeCompare(right),
        ),
      ),
    },
    compositeReviews: {
      files: managedCompositeResults.length,
      statuses: Object.fromEntries(
        Object.entries(compositeReviewStatusCounts).sort(([left], [right]) =>
          left.localeCompare(right),
        ),
      ),
    },
    compositeHeaderContracts: {
      files: managedCompositeResults.length,
      statuses: Object.fromEntries(
        Object.entries(compositeHeaderStatusCounts).sort(([left], [right]) =>
          left.localeCompare(right),
        ),
      ),
    },
    localReviews: {
      files: managedLocalResults.length,
      statuses: Object.fromEntries(
        Object.entries(localReviewStatusCounts).sort(([left], [right]) =>
          left.localeCompare(right),
        ),
      ),
    },
  },
  files: results,
};

if (jsonOutput) {
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  console.log("Attribution mapping report (review aid; not a compliance claim)");
  console.log(`Pinned upstream: ${report.scope.upstream}`);
  console.log(
    `Scanned ${report.summary.files} TS/TSX files; ${report.summary.reviewRequired} independent mappings still require review.`,
  );
  console.log("Statuses:");
  for (const [status, count] of Object.entries(report.summary.statuses)) {
    console.log(`- ${status}: ${count}`);
  }

  console.log("Exact-source header contracts:");
  for (const [status, count] of Object.entries(report.summary.headerContracts.statuses)) {
    console.log(`- ${status}: ${count}`);
  }
  console.log("Reviewed exact mappings without Adobe source headers:");
  for (const [status, count] of Object.entries(report.summary.headerlessReviews.statuses)) {
    console.log(`- ${status}: ${count}`);
  }

  console.log("Reviewed composite source sets:");
  for (const [status, count] of Object.entries(report.summary.compositeReviews.statuses)) {
    console.log(`- ${status}: ${count}`);
  }
  console.log("Composite attribution header contracts:");
  for (const [status, count] of Object.entries(report.summary.compositeHeaderContracts.statuses)) {
    console.log(`- ${status}: ${count}`);
  }
  console.log("Reviewed local source:");
  for (const [status, count] of Object.entries(report.summary.localReviews.statuses)) {
    console.log(`- ${status}: ${count}`);
  }

  const attention = results.filter(
    (result) =>
      showAll ||
      (result.reviewRequired &&
        result.status !== "exact" &&
        result.status !== "generated-exact" &&
        result.status !== "generated-exact-no-header" &&
        result.status !== "generated-stale-generator" &&
        result.status !== "generated-multiple" &&
        result.status !== "marker-unresolved" &&
        result.status !== "mirror" &&
        result.status !== "multiple" &&
        result.status !== "unmarked"),
  );
  const staleGenerated = results.filter((result) => result.status === "generated-stale-generator");
  if (!showAll && staleGenerated.length > 0) {
    console.log(
      `Generator drift: ${staleGenerated.length} generated files use a notice that the current generator does not emit.`,
    );
  }
  if (attention.length > 0) {
    console.log(showAll ? "All mappings:" : "Current files that need special attention:");
    for (const result of attention) {
      const sources =
        result.upstreamPaths.length > 0 ? ` -> ${result.upstreamPaths.join(", ")}` : "";
      console.log(`- [${result.status}] ${result.path}${sources}`);
    }
  }

  console.log("Use --json for the complete machine-readable inventory.");
}

if (checkHeaders) {
  const incomplete = managedHeaderResults.filter(
    (result) => result.headerContract.status !== "satisfied",
  );
  if (
    incomplete.length > 0 ||
    incompleteHeaderlessReviews.length > 0 ||
    incompleteCompositeReviews.length > 0 ||
    incompleteCompositeHeaders.length > 0 ||
    incompleteLocalReviews.length > 0
  ) {
    console.error("report:attribution-mappings — attribution contracts are incomplete:");
    for (const result of incomplete) {
      console.error(`- [${result.headerContract.status}] ${result.path}`);
    }
    for (const result of incompleteHeaderlessReviews) {
      console.error(`- [${result.headerlessReview.status}] ${result.path}`);
    }
    for (const result of incompleteCompositeReviews) {
      console.error(`- [${result.compositeReview.status}] ${result.path}`);
    }
    for (const result of incompleteCompositeHeaders) {
      console.error(
        `- [${result.compositeReview.headerContract?.status ?? "unavailable"}] ${result.path}`,
      );
    }
    for (const result of incompleteLocalReviews) {
      console.error(`- [${result.localReview.status}] ${result.path}`);
    }
    process.exit(1);
  }
  console.log(
    `report:attribution-mappings — PASS: ${managedHeaderResults.length} exact-source headers match their upstream blocks and port lines.`,
  );
  console.log(
    `report:attribution-mappings — PASS: ${managedHeaderlessResults.length} reviewed exact mappings remain headerless and match their recorded source evidence.`,
  );
  console.log(
    `report:attribution-mappings — PASS: ${managedCompositeResults.length} reviewed composite mappings match their recorded upstream source sets.`,
  );
  console.log(
    `report:attribution-mappings — PASS: ${managedCompositeResults.length} composite headers preserve every distinct upstream block and exact source path.`,
  );
  console.log(
    `report:attribution-mappings — PASS: ${managedLocalResults.length} reviewed local files match their recorded content.`,
  );
}
