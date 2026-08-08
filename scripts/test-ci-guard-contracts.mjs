#!/usr/bin/env node

import { spawn, spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
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
    "missing-oracle failure did not name the evidence contract",
  );
  console.log("PASS: missing upstream oracle exits non-zero.");

  const nocheckFixture = path.join(fixtureRoot, "ts-nocheck-growth");
  for (const directory of [
    "packages/solid-stately/src",
    "packages/solidaria/src",
    "packages/solidaria-components/src",
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
