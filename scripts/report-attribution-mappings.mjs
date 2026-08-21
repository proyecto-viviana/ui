#!/usr/bin/env node

import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const upstreamRoot = path.join(root, "react-spectrum", "packages");
const generatorPath = path.join(root, "scripts", "generate-solid-spectrum-icons.mjs");
const jsonOutput = process.argv.includes("--json");
const showAll = process.argv.includes("--all");
const unknownArgs = process.argv.slice(2).filter((arg) => !["--json", "--all"].includes(arg));

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

if (unknownArgs.length > 0) {
  fail(`unknown argument${unknownArgs.length === 1 ? "" : "s"}: ${unknownArgs.join(", ")}`);
}

if (!existsSync(upstreamRoot)) {
  fail(
    "the pinned react-spectrum/packages tree is missing; exact source mappings cannot be reported",
  );
}

function slash(file) {
  return file.split(path.sep).join("/");
}

function sourceFiles(directory, extensions = /\.(?:ts|tsx)$/) {
  if (!existsSync(directory)) return [];

  const files = [];
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      if (entry.name !== "node_modules") {
        files.push(...sourceFiles(absolutePath, extensions));
      }
    } else if (entry.isFile() && extensions.test(entry.name) && !entry.name.endsWith(".d.ts")) {
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
    content.includes("WITHOUT WARRANTIES OR REPRESENTATIONS");
  return { kind: full ? "full" : "short", year };
}

function comments(content) {
  return content.match(/\/\*[\s\S]*?\*\/|\/\/(?:[^\n]*)/g) ?? [];
}

function normalizedComment(comment) {
  return comment
    .replace(/^\/\*+|\*+\/$/g, "")
    .replace(/^\s*\*\s?/gm, "")
    .replace(/^\/\/\s?/gm, "")
    .replace(/\s+/g, " ")
    .trim();
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

function sourceMarkers(content) {
  return comments(content)
    .filter(
      (comment) =>
        /(?:Port(?:ed)?\s+(?:of|from)|Based on)\b/i.test(comment) &&
        /(?:@react-(?:aria|spectrum|stately|types)|react[- ]aria|react[- ]stately)/i.test(comment),
    )
    .map(normalizedComment);
}

const upstreamFiles = sourceFiles(upstreamRoot, /\.(?:ts|tsx|js|jsx|css|svg)$/).map(
  (absolutePath) => {
    const relativePath = slash(path.relative(path.join(root, "react-spectrum"), absolutePath));
    const extension = path.extname(absolutePath);
    return {
      absolutePath,
      relativePath,
      stem: path.basename(absolutePath, extension),
      content: readFileSync(absolutePath, "utf8"),
    };
  },
);
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
      /react-aria-components(?:\/src)?\/([A-Za-z0-9_.-]+\.(?:ts|tsx|js|jsx))/gi,
    );
    for (const match of racPaths) {
      const candidate = fileAt(`packages/react-aria-components/src/${match[1]}`);
      if (candidate) resolved.push(candidate);
    }

    const packageReferences = [
      ...marker.matchAll(
        /@react-(aria|stately|types|spectrum)\/([a-z0-9-]+)(?:\/([A-Za-z][A-Za-z0-9_.-]*))?/gi,
      ),
    ];
    for (const match of packageReferences) {
      const [, scope, packageName, pathSymbol] = match;
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

    if (resolved.length === 0 && /react[- ]aria/i.test(marker)) {
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

    if (resolved.length === 0 && /react[- ]stately/i.test(marker)) {
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

const workflowGeneratedSources = new Map();
const localWorkflowAssets = path.join(root, "packages/solid-spectrum/src/icon/assets/s2wf-icons");
if (existsSync(localWorkflowAssets)) {
  for (const entry of readdirSync(localWorkflowAssets, { withFileTypes: true })) {
    if (!entry.isFile() || !entry.name.endsWith(".svg")) continue;
    const outputName = `${safeIdentifier(
      `${pascalFromAssetName(path.basename(entry.name, ".svg")) || path.basename(entry.name, ".svg")}Icon`,
    )}.tsx`;
    const upstream = fileAt(`packages/@react-spectrum/s2/s2wf-icons/${entry.name}`);
    const localContent = readFileSync(path.join(localWorkflowAssets, entry.name), "utf8");
    workflowGeneratedSources.set(outputName, {
      upstream: upstream && upstream.content === localContent ? upstream : null,
      asset: entry.name,
    });
  }
}

function generatedSources(relativeWithinPackage) {
  const uiMatch = relativeWithinPackage.match(/^src\/icon\/ui-icons\/([^/]+)\.tsx$/);
  if (uiMatch) {
    const wrapper = fileAt(`packages/@react-spectrum/s2/ui-icons/${uiMatch[1]}.tsx`);
    if (!wrapper) return { sources: [], verified: false };

    const imports = [...wrapper.content.matchAll(/from\s+['"]\.\/([^'"]+\.svg)['"]/g)].map(
      (match) => match[1],
    );
    const sources = [wrapper];
    let verified = imports.length > 0;
    for (const asset of imports) {
      const upstream = fileAt(`packages/@react-spectrum/s2/ui-icons/${asset}`);
      const localAsset = path.join(root, "packages/solid-spectrum/src/icon/assets/ui-icons", asset);
      if (
        !upstream ||
        !existsSync(localAsset) ||
        readFileSync(localAsset, "utf8") !== upstream.content
      ) {
        verified = false;
      } else {
        sources.push(upstream);
      }
    }
    return { sources: unique(sources), verified };
  }

  const workflowMatch = relativeWithinPackage.match(/^src\/icon\/s2wf-icons\/([^/]+\.tsx)$/);
  if (workflowMatch) {
    const evidence = workflowGeneratedSources.get(workflowMatch[1]);
    return {
      sources: evidence?.upstream ? [evidence.upstream] : [],
      verified: Boolean(evidence?.upstream),
    };
  }

  if (
    relativeWithinPackage === "src/icon/ui-icons/index.ts" ||
    relativeWithinPackage === "src/icon/s2wf-icons/index.ts"
  ) {
    return { sources: [], verified: true, multiple: true };
  }

  return { sources: [], verified: false };
}

function classify(localFile, packageEntry) {
  const content = readFileSync(localFile, "utf8");
  const relativePath = slash(path.relative(root, localFile));
  const relativeWithinPackage = slash(path.relative(path.join(root, packageEntry.dir), localFile));
  const markers = sourceMarkers(content);
  const localHeader = adobeHeader(content);
  const generatedNotice = comments(content).filter(isS2GeneratedComment).map(normalizedComment)[0];

  if (generatedNotice) {
    const evidence = generatedSources(relativeWithinPackage);
    const generatorSupported = generatorNotices.has(generatedNotice);
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
      generatedNotice,
      generatorSupported,
      headerSources: headerSources.map((source) => ({
        path: source.relativePath,
        ...adobeHeader(source.content),
      })),
      reviewRequired: status !== "generated-exact",
    };
  }

  const sources = explicitSources(markers);
  const headerSources = sources.filter((source) => adobeHeader(source.content).kind !== "none");
  let status;
  if (sources.length > 1) status = "multiple";
  else if (sources.length === 1 && adobeHeader(sources[0].content).kind === "full") {
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

  return {
    package: packageEntry.name,
    path: relativePath,
    status,
    localHeader,
    markers,
    upstreamPaths: sources.map((source) => source.relativePath),
    headerSources: headerSources.map((source) => ({
      path: source.relativePath,
      ...adobeHeader(source.content),
    })),
    reviewRequired: status !== "exact",
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
        results.push({
          package: packageEntry.name,
          path: slash(path.relative(root, file)),
          status: "mirror",
          localHeader: adobeHeader(content),
          markers: spectrum.result.markers,
          upstreamPaths: spectrum.result.upstreamPaths,
          headerSources: spectrum.result.headerSources,
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

const statusCounts = {};
for (const result of results) {
  statusCounts[result.status] = (statusCounts[result.status] ?? 0) + 1;
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

  const attention = results.filter(
    (result) =>
      showAll ||
      (result.status !== "exact" &&
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
