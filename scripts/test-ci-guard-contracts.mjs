#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

import { sourceAttributionHeader } from "./package-attribution-banner.mjs";

const ROOT = process.cwd();
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "viviana-ci-guards-"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function combined(result) {
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function runSync(script, cwd, env = {}, args = []) {
  return spawnSync(process.execPath, [path.join(ROOT, "scripts", script), ...args], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, ...env },
  });
}

function run(script, cwd, env = {}) {
  return new Promise((resolve) => {
    const child = spawn(process.execPath, [path.join(ROOT, "scripts", script)], {
      cwd,
      env: { ...process.env, ...env },
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (chunk) => (stdout += chunk));
    child.stderr.on("data", (chunk) => (stderr += chunk));
    child.on("close", (status) => resolve({ status, stdout, stderr }));
  });
}

function json(file, value) {
  mkdirSync(path.dirname(file), { recursive: true });
  writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`);
}

async function listen(server) {
  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });
  const address = server.address();
  assert(address && typeof address !== "string", "mock GitHub server did not bind a port");
  return `http://127.0.0.1:${address.port}`;
}

try {
  const rootManifest = JSON.parse(readFileSync(path.join(ROOT, "package.json"), "utf8"));
  const generatedIconGuard = rootManifest.scripts?.["guard:generated-icons"];
  assert(
    generatedIconGuard === "node scripts/generate-solid-spectrum-icons.mjs --check",
    "the generated-icon guard must call the icon generator in read-only check mode",
  );
  const releaseReadiness = rootManifest.scripts?.["ci:release-readiness"] ?? "";
  const generatedIconGuardIndex = releaseReadiness.indexOf("vp run guard:generated-icons");
  const releaseBuildIndex = releaseReadiness.indexOf("vp run build");
  assert(
    generatedIconGuardIndex >= 0 &&
      releaseBuildIndex >= 0 &&
      generatedIconGuardIndex < releaseBuildIndex,
    "release readiness must check generated icons before building packages",
  );

  const generatedIconSource = readFileSync(
    path.join(ROOT, "scripts", "generate-solid-spectrum-icons.mjs"),
    "utf8",
  );
  assert(
    generatedIconSource.includes("const generatedIconRoots = [solidIconRoot, vivianaIconRoot];"),
    "the icon generator must own both styled-package output trees",
  );
  assert(
    generatedIconSource.includes('const checkOnly = args.includes("--check");') &&
      generatedIconSource.includes("if (checkOnly && (changed.length || extra.length))"),
    "the generated-icon guard must detect changed and unexpected output files",
  );
  console.log("PASS: release readiness checks both generated icon trees without writing them.");

  const changesetsWorkflow = readFileSync(
    path.join(ROOT, ".github", "workflows", "changesets-check.yml"),
    "utf8",
  );
  assert(
    /fetch-depth:\s*0/.test(changesetsWorkflow),
    "Changesets Check must acquire complete release history",
  );
  assert(
    !/git fetch[^\n]*--depth(?:=|\s)/.test(changesetsWorkflow),
    "Changesets Check must not truncate the full checkout with a later shallow fetch",
  );
  console.log("PASS: Changesets Check preserves complete release history.");

  const certificationWorkflow = readFileSync(
    path.join(ROOT, ".github", "workflows", "certification-gates.yml"),
    "utf8",
  );
  const packageBuild = certificationWorkflow.indexOf("run: pnpm run build\n");
  const jsxDeoptGuard = certificationWorkflow.indexOf("run: pnpm run guard:jsx-deopt-size\n");
  assert(
    packageBuild >= 0 && jsxDeoptGuard >= 0 && packageBuild < jsxDeoptGuard,
    "Certification Gates must build package artifacts before measuring JSX deopt size",
  );
  console.log("PASS: Certification builds package evidence before JSX size checks.");

  const oracleFixture = path.join(fixtureRoot, "missing-oracle");
  json(path.join(oracleFixture, "scripts", "upstream-pin.json"), {
    commit: "1111111111111111111111111111111111111111",
    tags: {
      "@react-spectrum/s2": "1.5.1",
      "react-aria-components": "1.19.0",
    },
  });
  const missingOracle = runSync("check-upstream-oracle.mjs", oracleFixture);
  assert(missingOracle.status !== 0, "missing upstream oracle unexpectedly passed");
  assert(
    combined(missingOracle).includes("upstream-backed checks cannot run"),
    `missing-oracle failure did not name the evidence contract:\n${combined(missingOracle)}${
      missingOracle.error ? `\n${missingOracle.error.stack ?? missingOracle.error}` : ""
    }`,
  );
  console.log("PASS: missing upstream oracle exits non-zero.");

  const nocheckFixture = path.join(fixtureRoot, "ts-nocheck-growth");
  for (const directory of [
    "packages/solid-stately/src",
    "packages/solidaria/src",
    "packages/solidaria-components/src",
    "packages/kumo/src",
    "packages/solid-spectrum/src",
    "packages/viviana-ui/src",
  ]) {
    mkdirSync(path.join(nocheckFixture, directory), { recursive: true });
  }
  json(path.join(nocheckFixture, "scripts", "ts-nocheck-baseline.json"), {
    maxCount: 0,
    paths: [],
  });
  writeFileSync(
    path.join(nocheckFixture, "packages", "solid-stately", "src", "regression.ts"),
    "// @ts-nocheck\nexport {};\n",
  );
  const nocheckGrowth = runSync("check-ts-nocheck-budget.mjs", nocheckFixture);
  assert(nocheckGrowth.status !== 0, "new @ts-nocheck directive unexpectedly passed");
  assert(
    combined(nocheckGrowth).includes("packages/solid-stately/src/regression.ts"),
    "@ts-nocheck failure did not identify the new file",
  );
  console.log("PASS: new @ts-nocheck directive exits non-zero.");

  const sourceArtifactFixture = path.join(fixtureRoot, "source-artifact-growth");
  for (const directory of [
    "packages/solid-stately/src",
    "packages/solidaria/src",
    "packages/solidaria-components/src",
    "packages/kumo/src",
    "packages/solid-spectrum/src/style",
    "packages/viviana-ui/src/style",
  ]) {
    mkdirSync(path.join(sourceArtifactFixture, directory), { recursive: true });
  }
  writeFileSync(
    path.join(
      sourceArtifactFixture,
      "packages",
      "solid-spectrum",
      "src",
      "style",
      "spectrum-tokens-json.d.ts",
    ),
    "declare module '@adobe/spectrum-tokens/**/*.json';\n",
  );
  writeFileSync(
    path.join(
      sourceArtifactFixture,
      "packages",
      "viviana-ui",
      "src",
      "style",
      "spectrum-tokens-json.d.ts",
    ),
    "declare module '@adobe/spectrum-tokens/**/*.json';\n",
  );
  writeFileSync(
    path.join(sourceArtifactFixture, "packages", "solid-stately", "src", "stale.d.ts"),
    "export declare const stale: true;\n",
  );
  const sourceArtifactGrowth = runSync("check-source-artifacts.mjs", sourceArtifactFixture);
  assert(sourceArtifactGrowth.status !== 0, "generated source declaration unexpectedly passed");
  assert(
    combined(sourceArtifactGrowth).includes("packages/solid-stately/src/stale.d.ts"),
    "source-artifact failure did not identify the generated declaration",
  );
  console.log("PASS: generated declaration in public-package source exits non-zero.");

  const packageArtifactFixture = path.join(fixtureRoot, "missing-package-artifact");
  json(path.join(packageArtifactFixture, "packages", "example", "package.json"), {
    name: "@proyecto-viviana/example",
    version: "1.0.0",
    main: "./dist/index.js",
    types: "./dist/index.d.ts",
    exports: {
      ".": {
        types: "./dist/index.d.ts",
        import: "./dist/index.js",
      },
    },
    scripts: { build: "vp pack" },
  });
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "vite.config.ts"),
    'import { defineConfig } from "vite-plus";\nexport default defineConfig({pack: {entry: "src/index.ts"}});\n',
  );
  mkdirSync(path.join(packageArtifactFixture, "packages", "example", "dist"), {
    recursive: true,
  });
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "dist", "index.d.ts"),
    "export declare const example: true;\n",
  );
  const missingPackageArtifact = runSync("check-package-artifacts.mjs", packageArtifactFixture, {
    VIVIANA_PUBLIC_PACKAGE_DIRS: "packages/example",
  });
  assert(
    missingPackageArtifact.status !== 0,
    "missing package export artifact unexpectedly passed",
  );
  assert(
    combined(missingPackageArtifact).includes("missing ./dist/index.js"),
    "package-artifact failure did not identify the missing export target",
  );
  console.log("PASS: missing package export artifact exits non-zero.");

  const builtHeader = [
    "/" + "*",
    " * Copyright 2024 Adobe. All rights reserved.",
    ' * This file is licensed to you under the Apache License, Version 2.0 (the "License");',
    " * you may not use this file except in compliance with the License.",
    " * Unless required by applicable law or agreed to in writing, software distributed",
    ' * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS',
    " * OF ANY KIND.",
    " *" + "/",
    "",
    "/" + "*",
    " * Copyright 2020 Adobe. All rights reserved.",
    ' * This file is licensed to you under the Apache License, Version 2.0 (the "License");',
    " * you may not use this file except in compliance with the License.",
    " * Unless required by applicable law or agreed to in writing, software distributed",
    ' * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS',
    " * OF ANY KIND.",
    " *" + "/",
    "",
    "// Ported to SolidJS for Proyecto Viviana; based on packages/upstream/src/collection.ts",
    "// Ported to SolidJS for Proyecto Viviana; based on packages/upstream/src/index.ts",
  ].join("\n");
  const builtSource = `${builtHeader}\n\nexport const example = true;\n`;
  assert(
    sourceAttributionHeader(builtSource) === builtHeader,
    "composite attribution header parsing did not preserve every block and source path",
  );
  mkdirSync(path.join(packageArtifactFixture, "packages", "example", "src"), {
    recursive: true,
  });
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "src", "index.ts"),
    builtSource,
  );
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "dist", "index.js"),
    "const example = true;\n",
  );
  json(path.join(packageArtifactFixture, "packages", "example", "dist", "index.js.map"), {
    version: 3,
    file: "index.js",
    sources: ["../src/index.ts"],
    sourcesContent: [builtSource],
    names: [],
    mappings: "",
  });
  const missingBuiltHeader = runSync("check-package-artifacts.mjs", packageArtifactFixture, {
    VIVIANA_PUBLIC_PACKAGE_DIRS: "packages/example",
  });
  assert(missingBuiltHeader.status !== 0, "missing built attribution header unexpectedly passed");
  assert(
    combined(missingBuiltHeader).includes(
      "dist/index.js: missing built attribution header for ../src/index.ts",
    ),
    "artifact guard did not identify the stripped attribution header",
  );
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "dist", "index.js"),
    `${builtHeader
      .replace(/^ (?=\*)/gm, "")
      .replace(
        "*/\n\n// Ported to SolidJS",
        "*/\n// Ported to SolidJS",
      )}\n\nconst example = true;\n`,
  );
  const preservedBuiltHeader = runSync("check-package-artifacts.mjs", packageArtifactFixture, {
    VIVIANA_PUBLIC_PACKAGE_DIRS: "packages/example",
  });
  assert(
    preservedBuiltHeader.status === 0,
    `preserved built attribution header failed:\n${combined(preservedBuiltHeader)}`,
  );
  console.log("PASS: package artifacts preserve mapped attribution headers after printing.");
  const typeOnlyHeader = builtHeader.replace(
    "packages/upstream/src/index.ts",
    "packages/upstream/src/types.ts",
  );
  const typeOnlySource = `${typeOnlyHeader}\n\nexport type Example = true;\n`;
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "src", "types.ts"),
    typeOnlySource,
  );
  writeFileSync(
    path.join(packageArtifactFixture, "packages", "example", "dist", "types.d.ts"),
    "export type Example = true;\n",
  );
  json(path.join(packageArtifactFixture, "packages", "example", "dist", "types.d.ts.map"), {
    version: 3,
    file: "types.d.ts",
    sources: ["../src/types.ts"],
    names: [],
    mappings: "",
  });
  const missingDeclarationHeader = runSync("check-package-artifacts.mjs", packageArtifactFixture, {
    VIVIANA_PUBLIC_PACKAGE_DIRS: "packages/example",
  });
  assert(
    missingDeclarationHeader.status !== 0 &&
      combined(missingDeclarationHeader).includes(
        "dist/types.d.ts: missing built attribution header for ../src/types.ts",
      ),
    "artifact guard did not identify a stripped declaration-only attribution header",
  );
  const declarationWrite = runSync(
    "write-package-declaration-attribution.mjs",
    packageArtifactFixture,
    {},
    ["packages/example"],
  );
  assert(
    declarationWrite.status === 0 && combined(declarationWrite).includes("wrote 1"),
    `declaration attribution writer failed:\n${combined(declarationWrite)}`,
  );
  const preservedDeclarationHeader = runSync(
    "check-package-artifacts.mjs",
    packageArtifactFixture,
    {
      VIVIANA_PUBLIC_PACKAGE_DIRS: "packages/example",
    },
  );
  assert(
    preservedDeclarationHeader.status === 0,
    `preserved declaration attribution header failed:\n${combined(preservedDeclarationHeader)}`,
  );
  const idempotentDeclarationWrite = runSync(
    "write-package-declaration-attribution.mjs",
    packageArtifactFixture,
    {},
    ["packages/example"],
  );
  assert(
    idempotentDeclarationWrite.status === 0 &&
      combined(idempotentDeclarationWrite).includes("wrote 0"),
    "declaration attribution writer was not idempotent",
  );
  console.log("PASS: declaration-only attribution survives package builds.");
  rmSync(path.join(packageArtifactFixture, "packages", "example", "dist", "index.js.map"));
  const missingBuiltSourceMap = runSync("check-package-artifacts.mjs", packageArtifactFixture, {
    VIVIANA_PUBLIC_PACKAGE_DIRS: "packages/example",
  });
  assert(missingBuiltSourceMap.status !== 0, "missing attribution source map unexpectedly passed");
  assert(
    combined(missingBuiltSourceMap).includes(
      "src/index.ts: attributed source has no mapped build output",
    ),
    "artifact guard silently skipped an attributed source without a map",
  );
  console.log("PASS: attributed source without a mapped build output exits non-zero.");

  const attributionFixture = path.join(fixtureRoot, "changed-package-notice");
  mkdirSync(attributionFixture, { recursive: true });
  const adobePackages = [
    ["packages/solid-stately", "@proyecto-viviana/solid-stately"],
    ["packages/solidaria", "@proyecto-viviana/solidaria"],
    ["packages/solidaria-components", "@proyecto-viviana/solidaria-components"],
    ["packages/solid-spectrum", "@proyecto-viviana/solid-spectrum"],
    ["packages/viviana-ui", "@proyecto-viviana/ui"],
  ];
  const fixtureMit = "Proyecto Viviana MIT fixture\n";
  const fixtureApache = "Apache-2.0 fixture\n";
  const fixtureNotice = adobePackages.map(([, name]) => name).join("\n") + "\n";
  writeFileSync(path.join(attributionFixture, "LICENSE"), fixtureMit);
  writeFileSync(path.join(attributionFixture, "LICENSE-APACHE-2.0"), fixtureApache);
  writeFileSync(path.join(attributionFixture, "NOTICE"), fixtureNotice);
  writeFileSync(path.join(attributionFixture, "CREDITS.md"), fixtureNotice);

  for (const [packageDir, name] of adobePackages) {
    json(path.join(attributionFixture, packageDir, "package.json"), {
      name,
      license: "MIT AND Apache-2.0",
      files: ["src", "LICENSE", "LICENSE-APACHE-2.0", "NOTICE"],
    });
    mkdirSync(path.join(attributionFixture, packageDir, "src"), { recursive: true });
    writeFileSync(path.join(attributionFixture, packageDir, "src", "index.ts"), "export {};\n");
    writeFileSync(path.join(attributionFixture, packageDir, "LICENSE"), fixtureMit);
    writeFileSync(path.join(attributionFixture, packageDir, "LICENSE-APACHE-2.0"), fixtureApache);
    writeFileSync(path.join(attributionFixture, packageDir, "NOTICE"), fixtureNotice);
  }

  const kumoFixture = path.join(attributionFixture, "packages", "kumo");
  json(path.join(kumoFixture, "package.json"), {
    name: "@proyecto-viviana/kumo",
    license: "MIT",
    files: ["src", "LICENSE", "LICENSE-CLOUDFLARE"],
  });
  writeFileSync(path.join(kumoFixture, "LICENSE"), fixtureMit);
  writeFileSync(path.join(kumoFixture, "LICENSE-CLOUDFLARE"), "Cloudflare MIT fixture\n");

  writeFileSync(
    path.join(attributionFixture, "packages", "solidaria", "NOTICE"),
    "changed notice\n",
  );
  const changedPackageNotice = runSync("check-package-attribution.mjs", attributionFixture);
  assert(changedPackageNotice.status !== 0, "changed package NOTICE unexpectedly passed");
  assert(
    combined(changedPackageNotice).includes(
      "packages/solidaria/NOTICE: content differs from root NOTICE",
    ),
    "attribution failure did not identify the changed package NOTICE",
  );
  console.log("PASS: changed package NOTICE exits non-zero.");
  writeFileSync(path.join(attributionFixture, "packages", "solidaria", "NOTICE"), fixtureNotice);
  writeFileSync(
    path.join(attributionFixture, "packages", "solid-spectrum", "src", "index.ts"),
    [
      "// Ported to SolidJS for Proyecto Viviana;",
      "// based on packages/@react-spectrum/s2/style/index.ts",
      "export {};",
      "",
    ].join("\n"),
  );
  const completeAttribution = runSync("check-package-attribution.mjs", attributionFixture);
  assert(
    completeAttribution.status === 0 &&
      completeAttribution.stdout.includes(
        "@proyecto-viviana/solid-spectrum: 1 TS/TSX files, 0 Adobe headers, 1 source marker",
      ),
    "package attribution inventory did not use the shared multiline marker parser",
  );
  console.log("PASS: package attribution inventory uses shared source-marker parsing.");

  const mappingFixture = path.join(fixtureRoot, "attribution-mappings");
  for (const directory of [
    "packages/solid-stately/src/calendar",
    "packages/solid-stately/src/color/intl",
    "packages/solid-stately/src/disclosure",
    "packages/solid-stately/src/table",
    "packages/solid-stately/src/utils",
    "packages/solidaria/src/color/intl",
    "packages/solidaria/src/focus",
    "packages/solidaria/src/local",
    "packages/solidaria/src/utils",
    "packages/solidaria/src/table",
    "packages/solidaria-components/src",
    "packages/solid-spectrum/src/shared",
    "packages/solid-spectrum/src/style",
    "packages/solid-spectrum/src/icon/ui-icons",
    "packages/viviana-ui/src/shared",
    "packages/viviana-ui/src/icon/pixel-icons",
    "react-spectrum/packages/react-aria-components/src",
    "react-spectrum/packages/react-aria/intl/color",
    "react-spectrum/packages/react-aria/src/i18n",
    "react-spectrum/packages/react-aria/src/focus",
    "react-spectrum/packages/react-aria/src/utils",
    "react-spectrum/packages/react-aria/src/table",
    "react-spectrum/packages/react-stately/intl/color",
    "react-spectrum/packages/react-stately/src/calendar",
    "react-spectrum/packages/react-stately/src/disclosure",
    "react-spectrum/packages/@react-spectrum/s2/ui-icons",
    "react-spectrum/packages/@react-spectrum/s2/style",
    "react-spectrum/packages/@react-types/table/src",
  ]) {
    mkdirSync(path.join(mappingFixture, directory), { recursive: true });
  }
  const fullAdobeHeader = [
    "/" + "*",
    " * Copyright 2024 Adobe. All rights reserved.",
    ' * This file is licensed to you under the Apache License, Version 2.0 (the "License");',
    " * you may not use this file except in compliance with the License.",
    " * Unless required by applicable law or agreed to in writing, software distributed",
    ' * under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS',
    " * OF ANY KIND.",
    " *" + "/",
    "",
  ].join("\n");
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/react-aria/src/table/useTable.ts"),
    `${fullAdobeHeader}export const useTable = true;\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/@react-types/table/src/index.d.ts"),
    `${fullAdobeHeader}export type TableSource = true;\n`,
  );
  for (const symbol of ["useDisclosureState", "useDisclosureGroupState"]) {
    writeFileSync(
      path.join(
        mappingFixture,
        `react-spectrum/packages/react-stately/src/disclosure/${symbol}.ts`,
      ),
      `${fullAdobeHeader}export const ${symbol} = true;\n`,
    );
  }
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/@react-spectrum/s2/ui-icons/Add.tsx"),
    `${fullAdobeHeader}export default function Add() {}\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/@react-spectrum/s2/style/runtime.ts"),
    `${fullAdobeHeader}export const upstreamRuntime = true;\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/react-aria-components/src/utils.tsx"),
    `${fullAdobeHeader}export const upstreamUtils = true;\n`,
  );
  writeFileSync(
    path.join(
      mappingFixture,
      "react-spectrum/packages/react-aria-components/src/HiddenDateInput.tsx",
    ),
    "export const upstreamHiddenDateInput = true;\n",
  );
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/react-stately/src/calendar/useCalendar.ts"),
    `${fullAdobeHeader}export const useCalendar = true;\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/react-aria/src/utils/animation.ts"),
    `${fullAdobeHeader}export const animation = true;\n`,
  );
  writeFileSync(
    path.join(
      mappingFixture,
      "react-spectrum/packages/react-aria/src/i18n/useLocalizedStringFormatter.ts",
    ),
    `${fullAdobeHeader}export const useLocalizedStringFormatter = true;\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "react-spectrum/packages/react-aria/src/focus/useFocusRing.ts"),
    "export const useFocusRing = true;\n",
  );
  const reviewedFocusRing =
    "// Based on @react-aria/focus useFocusRing.\nexport const localFocusRing = true;\n";
  const reviewedFocusRingPath = path.join(
    mappingFixture,
    "packages/solidaria/src/focus/createFocusRing.ts",
  );
  writeFileSync(reviewedFocusRingPath, reviewedFocusRing);
  json(path.join(mappingFixture, "scripts", "attribution-headerless-reviews.json"), [
    {
      localPath: "packages/solidaria/src/focus/createFocusRing.ts",
      upstreamPath: "packages/react-aria/src/focus/useFocusRing.ts",
      requiredText: ["@react-aria/focus useFocusRing"],
    },
  ]);
  const reviewedDisclosure = {
    localPath: "packages/solid-stately/src/disclosure/createDisclosureState.ts",
    upstreamPaths: [
      "packages/react-stately/src/disclosure/useDisclosureState.ts",
      "packages/react-stately/src/disclosure/useDisclosureGroupState.ts",
    ],
    requiredText: ["useDisclosureState and useDisclosureGroupState"],
  };
  const compositeReviewPath = path.join(
    mappingFixture,
    "scripts",
    "attribution-composite-reviews.json",
  );
  json(compositeReviewPath, [reviewedDisclosure]);
  const reviewedLocalSource = "export { localValue } from './localValue';\n";
  const reviewedLocalPath = path.join(mappingFixture, "packages/solidaria/src/local/index.ts");
  writeFileSync(reviewedLocalPath, reviewedLocalSource);
  const reviewedSolidHelperSource = "export function access(value) { return value; }\n";
  writeFileSync(
    path.join(mappingFixture, "packages/solid-stately/src/utils/reactivity.ts"),
    reviewedSolidHelperSource,
  );
  json(path.join(mappingFixture, "scripts", "attribution-local-reviews.json"), [
    {
      localPath: "packages/solidaria/src/local/index.ts",
      classification: "local-module-surface",
      contentSha256: createHash("sha256").update(reviewedLocalSource).digest("hex"),
    },
    {
      localPath: "packages/solid-stately/src/utils/reactivity.ts",
      classification: "local-solid-helper",
      contentSha256: createHash("sha256").update(reviewedSolidHelperSource).digest("hex"),
    },
  ]);

  for (const locale of ["en-US", "fr-FR"]) {
    writeFileSync(
      path.join(mappingFixture, `react-spectrum/packages/react-aria/intl/color/${locale}.json`),
      `{"colorPicker":"${locale}"}\n`,
    );
    writeFileSync(
      path.join(mappingFixture, `react-spectrum/packages/react-stately/intl/color/${locale}.json`),
      `{"colorName":"${locale}"}\n`,
    );
  }

  const exactSource = `// @ts-nocheck\n\n${fullAdobeHeader}// Based on @react-aria/table/useTable.\nexport const local = true;\n`;

  writeFileSync(
    path.join(mappingFixture, "packages/solidaria/src/table/createTable.ts"),
    exactSource,
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-stately/src/table/types.ts"),
    "// Ported from packages/@react-types/table/src/index.d.ts.\nexport type LocalTable = true;\n",
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solidaria/src/table/useTable.ts"),
    "export const unrelated = true;\n",
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-stately/src/disclosure/createDisclosureState.ts"),
    "// Based on @react-stately/disclosure useDisclosureState and useDisclosureGroupState.\n",
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-stately/src/calendar/createCalendar.ts"),
    [
      "// Based on @react-stately/calendar useCalendar.",
      "// Based on React Stately selection alignment rules.",
      "export const calendar = true;",
      "",
    ].join("\n"),
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solidaria-components/src/utils.tsx"),
    "// Port of react-aria-components/src/utils.tsx.\n",
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solidaria/src/utils/animation.ts"),
    "// Port of react-aria/src/utils/animation.ts.\n",
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solidaria/src/color/intl/index.ts"),
    [
      "// Port of @react-aria/color intl catalog.",
      "// Consumed via useLocalizedStringFormatter.",
      "export const colorStrings = true;",
      "",
    ].join("\n"),
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-stately/src/color/intl/index.ts"),
    [
      "// Color names. Ported from the @react-stately/color intl catalog.",
      "export const colorNames = true;",
      "",
    ].join("\n"),
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solidaria-components/src/orphan.ts"),
    `${fullAdobeHeader}export const orphan = true;\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solidaria-components/src/hidden-date-input.ts"),
    [
      "/**",
      " * A faithful port",
      " * of react-aria-components/src/HiddenDateInput.tsx.",
      " */",
      "export const localHiddenDateInput = true;",
      "",
    ].join("\n"),
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-spectrum/src/shared/createTable.ts"),
    exactSource,
  );
  const exactS2RuntimeMarker =
    "// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/style/runtime.ts";
  writeFileSync(
    path.join(mappingFixture, "packages/solid-spectrum/src/style/runtime.ts"),
    `${fullAdobeHeader}\n${exactS2RuntimeMarker}\n\nexport const localRuntime = true;\n`,
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-spectrum/src/shared/documentation.ts"),
    [
      "/**",
      " * Computes spacing based on the input value.",
      " * @example import {style} from '@react-spectrum/s2/style';",
      " */",
      "export const documentation = true;",
      "",
    ].join("\n"),
  );
  writeFileSync(
    path.join(mappingFixture, "packages/viviana-ui/src/shared/createTable.ts"),
    exactSource,
  );
  writeFileSync(
    path.join(mappingFixture, "packages/viviana-ui/src/icon/pixel-icons/Pixel.tsx"),
    "/" +
      "* Auto-generated from the Glasselated pixel-art SVG set. *" +
      "/\nexport const Pixel = true;\n",
  );
  writeFileSync(
    path.join(mappingFixture, "packages/solid-spectrum/src/icon/ui-icons/Add.tsx"),
    "/" +
      "* Auto-generated from the shipped @react-spectrum/s2 dist assets. *" +
      "/\nexport const Add = true;\n",
  );

  const mappingResult = runSync("report-attribution-mappings.mjs", mappingFixture, {}, ["--json"]);
  assert(
    mappingResult.status === 0,
    `attribution mapping fixture failed:\n${combined(mappingResult)}`,
  );
  const mappingReport = JSON.parse(mappingResult.stdout);
  const mappingByPath = new Map(mappingReport.files.map((file) => [file.path, file]));
  assert(
    mappingByPath.get("packages/solidaria/src/table/createTable.ts")?.status === "exact",
    "explicit unified-source mapping was not exact",
  );
  assert(
    mappingByPath.get("packages/solid-spectrum/src/style/runtime.ts")?.status === "exact",
    "an exact S2 repository path did not resolve",
  );
  const declarationMapping = mappingByPath.get("packages/solid-stately/src/table/types.ts");
  assert(
    declarationMapping?.status === "exact" &&
      declarationMapping.upstreamPaths[0] === "packages/@react-types/table/src/index.d.ts",
    "an explicit upstream declaration path did not resolve",
  );
  assert(
    mappingByPath.get("packages/solidaria-components/src/hidden-date-input.ts")?.status ===
      "exact-no-header",
    "a multiline provenance comment did not resolve",
  );
  const documentationExample = mappingByPath.get(
    "packages/solid-spectrum/src/shared/documentation.ts",
  );
  assert(
    documentationExample?.status === "unmarked" && documentationExample.markers.length === 0,
    "ordinary API documentation was misclassified as source evidence",
  );
  assert(
    mappingReport.summary.headerContracts.files === 7 &&
      mappingReport.summary.headerContracts.statuses.satisfied === 1 &&
      mappingReport.summary.headerContracts.statuses.mismatch === 3 &&
      mappingReport.summary.headerContracts.statuses.missing === 3,
    "exact header contract states were not reported",
  );
  const reviewedHeaderless = mappingByPath.get("packages/solidaria/src/focus/createFocusRing.ts");
  assert(
    reviewedHeaderless?.status === "exact-no-header" &&
      reviewedHeaderless.reviewRequired === false &&
      reviewedHeaderless.headerlessReview?.status === "satisfied" &&
      mappingReport.summary.headerlessReviews.statuses.satisfied === 1,
    "reviewed exact source without an Adobe header did not retain its audit result",
  );

  assert(
    mappingByPath.get("packages/solidaria/src/table/useTable.ts")?.status === "unmarked",
    "same-name source was promoted without an explicit marker",
  );
  const reviewedLocal = mappingByPath.get("packages/solidaria/src/local/index.ts");
  assert(
    reviewedLocal?.status === "reviewed-local" &&
      reviewedLocal.reviewRequired === false &&
      reviewedLocal.localReview?.status === "satisfied" &&
      mappingReport.summary.localReviews.statuses.satisfied === 2,
    "reviewed local module surface did not retain its content contract",
  );
  const reviewedSolidHelper = mappingByPath.get("packages/solid-stately/src/utils/reactivity.ts");
  assert(
    reviewedSolidHelper?.status === "reviewed-local" &&
      reviewedSolidHelper.localReview?.classification === "local-solid-helper",
    "reviewed Solid helper did not retain its local classification",
  );
  const reviewedComposite = mappingByPath.get(
    "packages/solid-stately/src/disclosure/createDisclosureState.ts",
  );
  assert(
    reviewedComposite?.status === "multiple" &&
      reviewedComposite.reviewRequired === true &&
      reviewedComposite.compositeReview?.status === "satisfied" &&
      mappingReport.summary.compositeReviews.statuses.satisfied === 1,
    reviewedComposite.compositeReview.headerContract?.status === "missing" &&
      "reviewed composite source set or pending header contract was not reported",
  );
  assert(
    mappingByPath.get("packages/solid-stately/src/calendar/createCalendar.ts")?.status ===
      "marker-unresolved",
    "a resolved marker hid a second unresolved marker",
  );
  assert(
    mappingByPath.get("packages/solidaria-components/src/utils.tsx")?.status === "exact",
    "an explicit react-aria-components TSX path did not resolve",
  );
  assert(
    mappingByPath.get("packages/solidaria-components/src/utils.tsx")?.upstreamPaths[0] ===
      "packages/react-aria-components/src/utils.tsx",
    "a react-aria-components TSX path was truncated to a TS path",
  );
  assert(
    mappingByPath.get("packages/solidaria/src/utils/animation.ts")?.upstreamPaths[0] ===
      "packages/react-aria/src/utils/animation.ts",
    "an explicit react-aria repository path did not resolve to that file",
  );
  const colorCatalog = mappingByPath.get("packages/solidaria/src/color/intl/index.ts");
  assert(
    colorCatalog?.status === "multiple" &&
      colorCatalog.upstreamPaths.length === 2 &&
      colorCatalog.upstreamPaths.every((source) => source.includes("/intl/color/")),
    "a scoped intl catalog marker fell back to an incidental cross-package hook",
  );
  const statelyColorCatalog = mappingByPath.get("packages/solid-stately/src/color/intl/index.ts");
  assert(
    statelyColorCatalog?.status === "multiple" &&
      statelyColorCatalog.upstreamPaths.length === 2 &&
      statelyColorCatalog.upstreamPaths.every((source) =>
        source.includes("/react-stately/intl/color/"),
      ),
    "a React Stately intl catalog marker did not resolve its complete scoped source set",
  );
  assert(
    mappingByPath.get("packages/solidaria-components/src/orphan.ts")?.status === "header-unmapped",
    "unmapped Adobe header was not kept for review",
  );
  const mirror = mappingByPath.get("packages/viviana-ui/src/shared/createTable.ts");
  assert(
    mirror?.status === "mirror" && mirror.inheritedStatus === "exact",
    "identical Viviana UI source did not inherit the Spectrum mapping",
  );
  assert(
    mappingByPath.get("packages/viviana-ui/src/icon/pixel-icons/Pixel.tsx")?.status === "unmarked",
    "original generated source was misattributed to S2",
  );
  assert(
    mappingByPath.get("packages/solid-spectrum/src/icon/ui-icons/Add.tsx")?.status ===
      "generated-stale-generator",
    "generated output drift was not reported",
  );
  console.log("PASS: attribution mappings preserve evidence and review boundaries.");
  const incompleteHeaders = runSync("report-attribution-mappings.mjs", mappingFixture, {}, [
    "--check-headers",
  ]);
  assert(incompleteHeaders.status !== 0, "incomplete exact-source headers unexpectedly passed");
  assert(
    combined(incompleteHeaders).includes(
      "[mismatch] packages/solidaria/src/table/createTable.ts",
    ) &&
      combined(incompleteHeaders).includes("[missing] packages/solidaria/src/utils/animation.ts"),
    "header check did not identify missing and mismatched contracts",
  );

  const headerWrite = runSync("report-attribution-mappings.mjs", mappingFixture, {}, [
    "--write-headers",
  ]);
  assert(headerWrite.status === 0, `header writer failed:\n${combined(headerWrite)}`);
  assert(combined(headerWrite).includes("wrote 7 attribution header contracts"));

  const managedTable = readFileSync(
    path.join(mappingFixture, "packages/solidaria/src/table/createTable.ts"),
    "utf8",
  );
  const expectedTablePrefix =
    `// @ts-nocheck\n\n${fullAdobeHeader}\n` +
    "// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/table/useTable.ts\n\n";
  assert(
    managedTable.startsWith(expectedTablePrefix),
    "writer did not preserve ts-nocheck first or copy the exact header and path",
  );
  assert(
    managedTable.includes("// Based on @react-aria/table/useTable."),
    "writer removed the source evidence marker",
  );

  const managedDisclosure = readFileSync(
    path.join(mappingFixture, "packages/solid-stately/src/disclosure/createDisclosureState.ts"),
    "utf8",
  );
  const expectedDisclosurePrefix =
    `${fullAdobeHeader}\n` +
    "// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/disclosure/useDisclosureGroupState.ts\n" +
    "// Ported to SolidJS for Proyecto Viviana; based on packages/react-stately/src/disclosure/useDisclosureState.ts\n\n";
  assert(
    managedDisclosure.startsWith(expectedDisclosurePrefix),
    "writer did not deduplicate a composite Adobe block or preserve every exact source path",
  );

  const managedSpectrum = readFileSync(
    path.join(mappingFixture, "packages/solid-spectrum/src/shared/createTable.ts"),
    "utf8",
  );
  const managedMirror = readFileSync(
    path.join(mappingFixture, "packages/viviana-ui/src/shared/createTable.ts"),
    "utf8",
  );
  assert(managedSpectrum === managedMirror, "writer broke an exact inherited mirror");
  assert(
    !readFileSync(
      path.join(mappingFixture, "packages/solidaria-components/src/orphan.ts"),
      "utf8",
    ).includes("Ported to SolidJS for Proyecto Viviana"),
    "writer changed an unmapped Adobe header",
  );

  const completeHeaders = runSync("report-attribution-mappings.mjs", mappingFixture, {}, [
    "--check-headers",
  ]);
  assert(
    completeHeaders.status === 0,
    `completed exact-source headers failed:\n${combined(completeHeaders)}`,
  );
  writeFileSync(reviewedLocalPath, `${reviewedLocalSource}export const behavior = true;\n`);
  const contradictedLocalReview = runSync("report-attribution-mappings.mjs", mappingFixture, {}, [
    "--check-headers",
  ]);
  assert(
    contradictedLocalReview.status !== 0 &&
      combined(contradictedLocalReview).includes(
        "[mismatch] packages/solidaria/src/local/index.ts",
      ),
    "reviewed local source accepted content drift",
  );
  writeFileSync(reviewedLocalPath, reviewedLocalSource);
  console.log("PASS: reviewed local source rejects content drift.");
  json(compositeReviewPath, [
    {
      ...reviewedDisclosure,
      upstreamPaths: [
        ...reviewedDisclosure.upstreamPaths,
        "packages/react-stately/src/disclosure/missing.ts",
      ],
    },
  ]);
  const contradictedCompositeReview = runSync(
    "report-attribution-mappings.mjs",
    mappingFixture,
    {},
    ["--check-headers"],
  );
  assert(
    contradictedCompositeReview.status !== 0 &&
      combined(contradictedCompositeReview).includes(
        "[mismatch] packages/solid-stately/src/disclosure/createDisclosureState.ts",
      ),
    "reviewed composite mapping accepted a changed upstream source set",
  );
  json(compositeReviewPath, [reviewedDisclosure]);
  console.log("PASS: reviewed composite mappings reject source-set drift.");

  writeFileSync(reviewedFocusRingPath, `${fullAdobeHeader}${reviewedFocusRing}`);
  const contradictedHeaderlessReview = runSync(
    "report-attribution-mappings.mjs",
    mappingFixture,
    {},
    ["--check-headers"],
  );
  assert(
    contradictedHeaderlessReview.status !== 0 &&
      combined(contradictedHeaderlessReview).includes(
        "[mismatch] packages/solidaria/src/focus/createFocusRing.ts",
      ),
    "reviewed headerless source accepted an unsupported Adobe header",
  );
  writeFileSync(reviewedFocusRingPath, reviewedFocusRing);
  console.log("PASS: reviewed headerless mappings reject unsupported Adobe headers.");
  const idempotentWrite = runSync("report-attribution-mappings.mjs", mappingFixture, {}, [
    "--write-headers",
  ]);
  assert(
    idempotentWrite.status === 0 && combined(idempotentWrite).includes("wrote 0"),
    "header writer was not idempotent",
  );
  console.log("PASS: exact-source header contracts are enforced and written safely.");

  const missingMapping = runSync("report-attribution-mappings.mjs", oracleFixture);
  assert(missingMapping.status !== 0, "missing attribution upstream unexpectedly passed");
  assert(
    combined(missingMapping).includes("exact source mappings cannot be reported"),
    "missing attribution upstream did not identify the evidence requirement",
  );
  console.log("PASS: attribution mapping report requires the pinned upstream tree.");

  const unpublishedPrerequisiteFixture = path.join(fixtureRoot, "unpublished-prerequisite");
  json(path.join(unpublishedPrerequisiteFixture, "packages", "kumo", "package.json"), {
    name: "@proyecto-viviana/kumo",
    version: "0.0.0",
  });
  json(path.join(unpublishedPrerequisiteFixture, "scripts", "release-prerequisites.json"), {
    packages: [
      {
        name: "@proyecto-viviana/kumo",
        manifest: "packages/kumo/package.json",
        prerequisites: [
          { id: "npm-package-registered", satisfied: false, evidence: null },
          { id: "trusted-publisher-registered", satisfied: false, evidence: null },
        ],
      },
    ],
  });
  const unpublishedPrerequisites = runSync(
    "check-release-prerequisites.mjs",
    unpublishedPrerequisiteFixture,
  );
  assert(
    unpublishedPrerequisites.status === 0,
    "unpublished 0.0.0 package was incorrectly treated as a release candidate",
  );
  console.log("PASS: unpublished 0.0.0 package does not require release registration.");

  const kumoManifestPath = path.join(
    unpublishedPrerequisiteFixture,
    "packages",
    "kumo",
    "package.json",
  );
  json(kumoManifestPath, { name: "@proyecto-viviana/kumo", version: "0.1.0" });
  const blockedPrerequisites = runSync(
    "check-release-prerequisites.mjs",
    unpublishedPrerequisiteFixture,
  );
  assert(blockedPrerequisites.status !== 0, "unregistered Kumo release candidate passed");
  assert(
    combined(blockedPrerequisites).includes("trusted-publisher-registered"),
    "release prerequisite failure did not identify the missing trusted publisher",
  );
  console.log("PASS: unregistered Kumo release candidate exits non-zero.");

  json(path.join(unpublishedPrerequisiteFixture, "scripts", "release-prerequisites.json"), {
    packages: [
      {
        name: "@proyecto-viviana/kumo",
        manifest: "packages/kumo/package.json",
        prerequisites: [
          {
            id: "npm-package-registered",
            satisfied: true,
            evidence: "https://www.npmjs.com/package/@proyecto-viviana/kumo",
          },
          {
            id: "trusted-publisher-registered",
            satisfied: true,
            evidence: "npm settings checked 2026-08-19 by repository owner",
          },
        ],
      },
    ],
  });
  const satisfiedPrerequisites = runSync(
    "check-release-prerequisites.mjs",
    unpublishedPrerequisiteFixture,
  );
  assert(satisfiedPrerequisites.status === 0, "satisfied release prerequisites did not pass");
  console.log("PASS: evidenced Kumo release prerequisites exit zero.");

  let releaseMode = "failed";
  const server = createServer((request, response) => {
    const workflow = request.url?.match(/actions\/workflows\/([^/]+)\/runs/)?.[1];
    const conclusion =
      workflow === "site-gate.yml" && releaseMode === "failed" ? "failure" : "success";
    const workflowRuns =
      releaseMode === "absent"
        ? []
        : [
            {
              id: 1,
              status: "completed",
              conclusion,
              head_sha: "release-sha",
              head_branch: "main",
            },
          ];
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ workflow_runs: workflowRuns }));
  });
  const githubApiUrl = await listen(server);
  const releaseEnv = {
    GITHUB_API_URL: githubApiUrl,
    GITHUB_REPOSITORY: "example/project",
    GITHUB_TOKEN: "fixture-token",
    RELEASE_SHA: "release-sha",
    RELEASE_EVIDENCE_POLL_MS: "1",
    RELEASE_EVIDENCE_TIMEOUT_MS: "20",
  };

  try {
    const failedEvidence = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(failedEvidence.status !== 0, "failed same-SHA evidence unexpectedly passed");
    assert(
      combined(failedEvidence).includes("Site Gate concluded failure"),
      "release evidence failure did not identify Site Gate",
    );
    console.log("PASS: failed same-SHA release evidence exits non-zero.");

    releaseMode = "absent";
    const absentEvidence = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(absentEvidence.status !== 0, "absent same-SHA evidence unexpectedly passed");
    assert(
      combined(absentEvidence).includes("timed out waiting for complete same-SHA evidence"),
      "release evidence timeout did not identify absent evidence",
    );
    console.log("PASS: absent same-SHA release evidence exits non-zero.");

    releaseMode = "success";
    const successfulEvidence = await run("check-release-evidence.mjs", ROOT, releaseEnv);
    assert(successfulEvidence.status === 0, "complete same-SHA release evidence did not pass");
    console.log("PASS: complete same-SHA release evidence exits zero.");
  } finally {
    server.close();
  }
} finally {
  rmSync(fixtureRoot, { recursive: true, force: true });
}
