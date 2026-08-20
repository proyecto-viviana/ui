#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import path from "node:path";

const ROOT = process.cwd();
const fixtureRoot = mkdtempSync(path.join(tmpdir(), "viviana-ci-guards-"));

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function combined(result) {
  return `${result.stdout ?? ""}${result.stderr ?? ""}`;
}

function runSync(script, cwd, env = {}) {
  return spawnSync(process.execPath, [path.join(ROOT, "scripts", script)], {
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
