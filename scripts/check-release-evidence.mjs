#!/usr/bin/env node

/**
 * The gate on the publish itself: every required workflow must have a
 * successful run at the exact sha being published.
 *
 * The only evidence this reads is a workflow run conclusion, fetched from
 * GitHub's Actions API for that one sha. Nothing a human wrote down, and
 * nothing an earlier step of this workflow recorded, can satisfy it — that was
 * #599's finding about the sibling guard, and it applies here first.
 *
 * What the environment may say, and what it cannot (the #599 review found the
 * first draft of this file claiming "no env override" while three variables
 * decided the answer):
 *   - `RELEASE_SHA` / `GITHUB_SHA` name the revision. With neither, the sha
 *     comes from HEAD — and then the checkout itself has to be publishable: a
 *     clean tree, and a HEAD that `origin/main` already contains. `changeset
 *     publish` ships the working tree, not the sha this guard read.
 *   - `GITHUB_REPOSITORY` names the repository, and must agree with the
 *     `origin` remote when the checkout has one. Another repository's green run
 *     is not this repository's evidence.
 *   - `GITHUB_API_URL` is accepted only as https://api.github.com, or as a
 *     loopback stand-in for the contract tests — which is announced as one, and
 *     is never handed the `gh` credential.
 *
 * There is no bypass and no "if disabled, skip" branch. Two of the three
 * required workflows are `disabled_manually` today (#568, an owner gate), a
 * disabled workflow produces no run, and a missing run is refused with the
 * workflow named: while the owner keeps them off the release condition is
 * unsatisfiable, and saying so is the point.
 */

import { execFileSync } from "node:child_process";

const DEFAULT_API_URL = "https://api.github.com";
const LOOPBACK_HOSTS = new Set(["127.0.0.1", "localhost", "[::1]", "::1"]);
const timeoutMs = Number(process.env.RELEASE_EVIDENCE_TIMEOUT_MS ?? 15 * 60_000);
const pollMs = Number(process.env.RELEASE_EVIDENCE_POLL_MS ?? 15_000);
const required = [
  ["certification-gates.yml", "Certification Gates"],
  ["release-readiness.yml", "Release Readiness"],
  ["site-gate.yml", "Site Gate"],
];

// Only a push to this repository's own main, or a dispatch of it, runs against
// the tree at that sha. A `pull_request` run's `head_sha` is the PR head while
// its checkout is `refs/pull/N/merge`, and its `head_branch` is the PR's head
// ref name — which can be literally "main", from a fork or from this repository
// opened into another branch. `gh run list --event pull_request` here returns
// exactly that shape, so head_sha plus head_branch is not the whole contract
// (#599 review).
const EVIDENCE_EVENTS = new Set(["push", "workflow_dispatch"]);

// A cancellation or a skip after a green does not retract the green the same
// tree already took. Every other completed conclusion does — `failure`,
// `timed_out`, `action_required`, and any conclusion this set has never heard
// of, because an unknown verdict is not a pass (#599 review).
const STANDING_CONCLUSIONS = new Set(["success", "cancelled", "skipped"]);

function git(args) {
  try {
    return {
      ok: true,
      out: execFileSync("git", args, {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim(),
    };
  } catch {
    return { ok: false, out: "" };
  }
}

/**
 * Where the runs are read from.
 *
 * api.github.com, or a loopback host for the contract tests. Anything else is
 * refused: an env var that redirects the read is an env var that answers the
 * question, and the loopback case is fenced off from the `gh` credential
 * below rather than trusted.
 */
function resolveApi() {
  const raw = (process.env.GITHUB_API_URL?.trim() || DEFAULT_API_URL).replace(/\/+$/, "");
  let parsed;
  try {
    parsed = new URL(raw);
  } catch {
    return { error: `GITHUB_API_URL is not a URL (${raw})` };
  }
  if (parsed.protocol === "https:" && parsed.hostname === "api.github.com") {
    return { base: raw, real: true };
  }
  if (LOOPBACK_HOSTS.has(parsed.hostname)) return { base: raw, real: false };
  return {
    error:
      `GITHUB_API_URL points at ${parsed.host}; release evidence is read from api.github.com ` +
      "only. A redirected read is not a read.",
  };
}

// `changeset:publish` runs this guard too, so it has to work off a checkout as
// well as off an Actions environment (#599). The repository is derived from the
// remote this checkout pushes to; `GITHUB_REPOSITORY` may name it, but may not
// disagree with it.
function resolveRepository(realApi) {
  const remote = git(["remote", "get-url", "origin"]);
  const match = /github\.com[:/]+([^/]+)\/(.+?)(?:\.git)?$/.exec(remote.out);
  const fromRemote = match ? `${match[1]}/${match[2]}` : "";
  const fromEnv = process.env.GITHUB_REPOSITORY?.trim() ?? "";
  if (!fromEnv) return { repository: fromRemote };
  if (realApi && fromRemote && fromEnv.toLowerCase() !== fromRemote.toLowerCase()) {
    return {
      error:
        `GITHUB_REPOSITORY names ${fromEnv}, but this checkout's origin is ${fromRemote}. ` +
        "Evidence is read for the repository being published, not for one that shares its shas.",
    };
  }
  return { repository: fromEnv };
}

function resolveSha() {
  const given = (process.env.RELEASE_SHA ?? process.env.GITHUB_SHA ?? "").trim();
  if (/^[0-9a-f]{40}$/i.test(given)) return { sha: given.toLowerCase(), fromHead: false };
  const fromHead = given.length === 0;
  const resolved = git(["rev-parse", fromHead ? "HEAD" : given]).out;
  return {
    sha: /^[0-9a-f]{40}$/i.test(resolved) ? resolved.toLowerCase() : "",
    fromHead,
  };
}

/**
 * The credential. Read-only: it only ever performs GET on workflow runs.
 *
 * The `gh` fallback exists for the local route, and is refused outright when
 * the API base was overridden — a stand-in host asking for a developer's
 * personal token is how a guard becomes a credential leak (#599 review).
 */
function resolveToken(realApi) {
  const fromEnv = process.env.GITHUB_TOKEN?.trim();
  if (fromEnv) return fromEnv;
  if (!realApi) return "";
  try {
    return execFileSync("gh", ["auth", "token"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "";
  }
}

/**
 * The sha came from HEAD, so the checkout is what gets published.
 *
 * `vp run release:npm` on a green sha with uncommitted edits, or on a commit
 * that was never pushed and so never ran anything, would publish something the
 * evidence does not cover — the same shape as the hole #599 was opened to close
 * (#599 review).
 */
function checkoutRefusals() {
  const refusals = [];
  const status = git(["status", "--porcelain"]);
  if (!status.ok) {
    refusals.push("the working tree could not be read (`git status --porcelain` failed)");
  } else if (status.out.length > 0) {
    refusals.push(
      "the working tree is not clean; `changeset publish` ships the tree, not the SHA this " +
        "guard read. Commit or stash first, or name the revision with RELEASE_SHA",
    );
  }
  const remoteMain = git(["rev-parse", "--verify", "--quiet", "refs/remotes/origin/main"]);
  if (!remoteMain.ok || remoteMain.out.length === 0) {
    refusals.push(
      "this checkout has no `origin/main` ref to compare HEAD against; run `git fetch origin main`",
    );
  } else if (!git(["merge-base", "--is-ancestor", "HEAD", "refs/remotes/origin/main"]).ok) {
    refusals.push(
      "HEAD is not contained in `origin/main`, so nothing ran on it. Push it, let the ladder " +
        "run, and publish the SHA that went green (`git fetch origin main` first if it is stale)",
    );
  }
  return refusals;
}

const api = resolveApi();
const repositoryRead = api.error ? {} : resolveRepository(api.real === true);
const { sha, fromHead } = resolveSha();
const repository = repositoryRead.repository ?? "";
const token = api.error ? "" : resolveToken(api.real === true);

const setupRefusals = [
  api.error,
  repositoryRead.error,
  repository ? null : "GITHUB_REPOSITORY (or a github.com `origin` remote) names no repository",
  token
    ? null
    : api.real === false
      ? "GITHUB_TOKEN is unset, and a stand-in API base is never handed the `gh` credential"
      : "GITHUB_TOKEN (or an authenticated `gh`) gives no credential",
  sha ? null : "RELEASE_SHA (or a resolvable HEAD) names no revision",
  ...(sha && fromHead ? checkoutRefusals() : []),
].filter(Boolean);

if (setupRefusals.length > 0) {
  for (const refusal of setupRefusals) console.error(`FAIL: ${refusal}.`);
  console.error("Publishing is blocked: an unread gate is not a passed gate.");
  process.exit(1);
}

if (api.real === false) {
  console.error(
    `FIXTURE: GITHUB_API_URL is the loopback stand-in ${api.base}. This run exercises the guard, ` +
      "not the release: its verdict is not evidence for any publish.",
  );
}

const headers = {
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
};

async function runsAtSha(workflow) {
  const params = new URLSearchParams({ head_sha: sha, branch: "main", per_page: "100" });
  const url = `${api.base}/repos/${repository}/actions/workflows/${workflow}/runs?${params}`;
  const response = await fetch(url, { headers });
  if (!response.ok) {
    throw new Error(`${workflow}: GitHub API returned ${response.status} ${response.statusText}`);
  }
  const body = await response.json();
  // The query parameters are a request, not a guarantee, and two of the four
  // fields below the API will not filter on at all. A run is evidence for this
  // revision only if it ran this revision, on this repository's main, from an
  // event that checks that revision out.
  return (body.workflow_runs ?? [])
    .filter(
      (run) =>
        run.head_sha === sha &&
        run.head_branch === "main" &&
        EVIDENCE_EVENTS.has(run.event) &&
        (run.head_repository?.full_name ?? "").toLowerCase() === repository.toLowerCase(),
    )
    .sort((a, b) => b.id - a.id);
}

/**
 * One workflow's verdict at this sha.
 *
 * `success` needs a run that completed successfully at this exact sha, and no
 * later verdict that retracts it. A re-run cancelled or skipped afterwards does
 * not take back the green the same tree already earned; a completed `failure`,
 * `timed_out` or `action_required` at that sha does, whichever ran first.
 */
function verdict(runs) {
  const succeeded = runs.some((run) => run.status === "completed" && run.conclusion === "success");
  const retracting = runs.filter(
    (run) => run.status === "completed" && !STANDING_CONCLUSIONS.has(run.conclusion ?? ""),
  );
  if (retracting.length > 0) {
    const conclusions = retracting.map((run) => run.conclusion ?? "no conclusion").join(", ");
    return {
      state: "refused",
      detail: `concluded ${conclusions}`,
      // Only when a green is being overruled: otherwise "no successful run"
      // says it better.
      line: succeeded
        ? `has a completed run at ${sha} on main that concluded ${conclusions}; the green at the same SHA does not stand against it`
        : undefined,
    };
  }
  if (succeeded) {
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
  for (const { name, detail, line } of states) {
    console.error(
      `FAIL: ${name} ${line ?? `has no successful run at ${sha} on main (${detail})`}.`,
    );
  }
  console.error(
    `Publishing is blocked: ${states.length} of ${required.length} required workflows have no ` +
      `standing successful run at this exact SHA (${reason}).`,
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
    const where = api.real === false ? ` (loopback stand-in ${api.base}, not evidence)` : "";
    console.log(`PASS: all required workflows succeeded for exact release SHA ${sha}${where}.`);
    process.exit(0);
  }

  // A completed run that did not succeed will not become one by waiting.
  if (missing.some((state) => state.state === "refused")) refuse(missing, "a completed run failed");
  if (Date.now() >= deadline) refuse(missing, `timed out after ${timeoutMs}ms`);

  await new Promise((resolve) => setTimeout(resolve, pollMs));
}
