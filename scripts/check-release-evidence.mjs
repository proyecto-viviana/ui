#!/usr/bin/env node

const repository = process.env.GITHUB_REPOSITORY;
const token = process.env.GITHUB_TOKEN;
const sha = process.env.RELEASE_SHA;
const apiUrl = process.env.GITHUB_API_URL ?? "https://api.github.com";
const timeoutMs = Number(process.env.RELEASE_EVIDENCE_TIMEOUT_MS ?? 15 * 60_000);
const pollMs = Number(process.env.RELEASE_EVIDENCE_POLL_MS ?? 15_000);
const required = [
  ["certification-gates.yml", "Certification Gates"],
  ["release-readiness.yml", "Release Readiness"],
  ["site-gate.yml", "Site Gate"],
];

if (!repository || !token || !sha) {
  console.error("GITHUB_REPOSITORY, GITHUB_TOKEN, and RELEASE_SHA are required.");
  process.exit(1);
}

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
};

async function latestRun(workflow) {
  const params = new URLSearchParams({ head_sha: sha, branch: "main", per_page: "20" });
  const url = `${apiUrl}/repos/${repository}/actions/workflows/${workflow}/runs?${params}`;
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`${workflow}: GitHub API returned ${response.status} ${response.statusText}`);
  }
  const body = await response.json();
  return body.workflow_runs
    .filter((run) => run.head_sha === sha && run.head_branch === "main")
    .sort((a, b) => b.id - a.id)[0];
}

const deadline = Date.now() + timeoutMs;
let lastReport = "";

for (;;) {
  const states = await Promise.all(
    required.map(async ([workflow, name]) => ({ workflow, name, run: await latestRun(workflow) })),
  );
  const report = states
    .map(
      ({ name, run }) =>
        `${name}: ${run ? `${run.status}/${run.conclusion ?? "pending"}` : "absent"}`,
    )
    .join(" | ");
  if (report !== lastReport) {
    console.log(`- ${report}`);
    lastReport = report;
  }

  const failed = states.find(
    ({ run }) => run?.status === "completed" && run.conclusion !== "success",
  );
  if (failed) {
    console.error(
      `FAIL: ${failed.name} concluded ${failed.run.conclusion} for release SHA ${sha}; publishing is blocked.`,
    );
    process.exit(1);
  }

  if (states.every(({ run }) => run?.status === "completed" && run.conclusion === "success")) {
    console.log(`PASS: all required workflows succeeded for exact release SHA ${sha}.`);
    process.exit(0);
  }

  if (Date.now() >= deadline) {
    console.error(`FAIL: timed out waiting for complete same-SHA evidence for ${sha}.`);
    process.exit(1);
  }

  await new Promise((resolve) => setTimeout(resolve, pollMs));
}
