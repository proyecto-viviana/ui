#!/usr/bin/env node

/**
 * The gate on the publish itself: every required workflow must have a
 * successful run at the exact sha being published.
 *
 * The only evidence this reads is a workflow run conclusion, fetched from the
 * Actions API for that one sha. Nothing a human wrote down, and nothing an
 * earlier step of this workflow recorded, can satisfy it — that was #599's
 * finding about the sibling guard, and it applies here first.
 *
 * It fails closed. Two of the three required workflows are `disabled_manually`
 * today (#568, an owner gate), a disabled workflow produces no run, and a
 * missing run is refused with the workflow named. There is deliberately no
 * bypass, no env override and no "if disabled, skip" branch: while the owner
 * keeps them off, the release condition is unsatisfiable, and saying so is the
 * point.
 */

import { execFileSync } from "node:child_process";

const apiUrl = (process.env.GITHUB_API_URL ?? "https://api.github.com").replace(/\/+$/, "");
const timeoutMs = Number(process.env.RELEASE_EVIDENCE_TIMEOUT_MS ?? 15 * 60_000);
const pollMs = Number(process.env.RELEASE_EVIDENCE_POLL_MS ?? 15_000);
const required = [
  ["certification-gates.yml", "Certification Gates"],
  ["release-readiness.yml", "Release Readiness"],
  ["site-gate.yml", "Site Gate"],
];

function git(args) {
  try {
    return execFileSync("git", args, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

// `changeset:publish` runs this guard too, so it has to work off a checkout as
// well as off an Actions environment (#599). Both fallbacks derive the answer
// from the machine — the remote and the commit — never from an argument the
// caller asserts. A wrong repository or a sha with no runs is refused, so the
// fallbacks can only make the check run, never make it pass.
function resolveRepository() {
  const fromEnv = process.env.GITHUB_REPOSITORY?.trim();
  if (fromEnv) return fromEnv;
  const match = /github\.com[:/]+([^/]+)\/(.+?)(?:\.git)?$/.exec(
    git(["remote", "get-url", "origin"]),
  );
  return match ? `${match[1]}/${match[2]}` : "";
}

function resolveSha() {
  const given = (process.env.RELEASE_SHA ?? process.env.GITHUB_SHA ?? "").trim();
  if (/^[0-9a-f]{40}$/i.test(given)) return given.toLowerCase();
  const resolved = git(["rev-parse", given.length > 0 ? given : "HEAD"]);
  return /^[0-9a-f]{40}$/i.test(resolved) ? resolved.toLowerCase() : "";
}

// Read-only: this token only ever performs GET on workflow runs.
function resolveToken() {
  const fromEnv = process.env.GITHUB_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  try {
    return execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

const repository = resolveRepository();
const sha = resolveSha();
const token = resolveToken();

if (!repository || !token || !sha) {
  const missing = [
    repository ? null : "GITHUB_REPOSITORY (or a github.com `origin` remote)",
    token ? null : "GITHUB_TOKEN (or an authenticated `gh`)",
    sha ? null : "RELEASE_SHA (or a resolvable HEAD)",
  ].filter(Boolean);
  console.error(`FAIL: release evidence cannot be read; missing ${missing.join(", ")}.`);
  console.error("Publishing is blocked: an unread gate is not a passed gate.");
  process.exit(1);
}

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
};

async function runsAtSha(workflow) {
  const params = new URLSearchParams({ head_sha: sha, branch: "main", per_page: "100" });
  const url = `${apiUrl}/repos/${repository}/actions/workflows/${workflow}/runs?${params}`;
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`${workflow}: GitHub API returned ${response.status} ${response.statusText}`);
  }
  const body = await response.json();
  // The query parameters are a request, not a guarantee. Re-check both fields
  // on every row: a green run for another revision is not evidence for this
  // one, and that is the whole contract.
  return (body.workflow_runs ?? [])
    .filter((run) => run.head_sha === sha && run.head_branch === "main")
    .sort((a, b) => b.id - a.id);
}

/**
 * One workflow's verdict at this sha.
 *
 * `success` needs a run that completed successfully at this exact sha. A
 * re-run that was cancelled afterwards does not retract the green it already
 * took on the same tree, so any success counts; a cancelled or skipped
 * conclusion is never itself evidence.
 */
function verdict(runs) {
  if (runs.some((run) => run.status === "completed" && run.conclusion === "success")) {
    return { state: "success", detail: "success" };
  }
  const running = runs.find((run) => run.status !== "completed");
  if (running) return { state: "pending", detail: running.status ?? "pending" };
  if (runs.length === 0) return { state: "absent", detail: "no run at this SHA" };
  return {
    state: "refused",
    detail: `concluded ${runs.map((run) => run.conclusion ?? "no conclusion").join(", ")}`,
  };
}

function refuse(states, reason) {
  for (const { name, detail } of states) {
    console.error(`FAIL: ${name} has no successful run at ${sha} on main (${detail}).`);
  }
  console.error(
    `Publishing is blocked: ${states.length} of ${required.length} required workflows have no ` +
      `successful run at this exact SHA (${reason}).`,
  );
  process.exit(1);
}

const deadline = Date.now() + timeoutMs;
let lastReport = "";

for (;;) {
  const states = await Promise.all(
    required.map(async ([workflow, name]) => ({
      workflow,
      name,
      ...verdict(await runsAtSha(workflow)),
    })),
  );
  const report = states.map(({ name, detail }) => `${name}: ${detail}`).join(" | ");
  if (report !== lastReport) {
    console.log(`- ${report}`);
    lastReport = report;
  }

  const missing = states.filter((state) => state.state !== "success");
  if (missing.length === 0) {
    console.log(`PASS: all required workflows succeeded for exact release SHA ${sha}.`);
    process.exit(0);
  }

  // A completed run that did not succeed will not become one by waiting.
  if (missing.some((state) => state.state === "refused")) refuse(missing, "a completed run failed");
  if (Date.now() >= deadline) refuse(missing, `timed out after ${timeoutMs}ms`);

  await new Promise((resolve) => setTimeout(resolve, pollMs));
}
