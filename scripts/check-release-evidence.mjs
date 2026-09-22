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
 *   - `RELEASE_SHA` / `GITHUB_SHA` name the revision. Whenever the revision
 *     they name is this checkout's HEAD — including when they name nothing and
 *     it comes from HEAD — the tree has to be clean, because `changeset
 *     publish` ships the working tree and not the sha this guard read. Naming
 *     HEAD by its own 40 digits does not buy a dirty tree past that; the second
 *     #599 review found that it did.
 *   - `GITHUB_REPOSITORY` names the repository, and must agree with the
 *     `origin` remote when the checkout has one. Another repository's green run
 *     is not this repository's evidence.
 *   - `GITHUB_API_URL` is accepted only as https://api.github.com, or as a
 *     loopback stand-in for this guard's own contract tests — which needs
 *     `RELEASE_EVIDENCE_FIXTURE=1` beside it, is announced as a fixture, and is
 *     never handed the `gh` credential.
 *
 * The one path that is not a read of api.github.com is that fixture pair, and
 * it takes two variables that nothing on the release path sets; either alone is
 * refused. There is no "if disabled, skip" branch. Two of the three required
 * workflows are `disabled_manually` today (#568, an owner gate), a disabled
 * workflow produces no run, and a missing run is refused with the workflow
 * named: while the owner keeps them off the release condition is unsatisfiable,
 * and saying so is the point.
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

// A cancellation or a skip says nothing about the tree: it stands aside and the
// verdict falls to the run behind it. Every other completed conclusion decides
// — `success`, `failure`, `timed_out`, `action_required`, and any conclusion
// this set has never heard of, because an unknown verdict is not a pass (#599
// review).
const STANDS_ASIDE = new Set(["cancelled", "skipped"]);

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
 *
 * The loopback case needs a second, independent signal. One variable used to
 * open it, so anything that could set `GITHUB_API_URL` could hand this guard a
 * server that says "all green" and collect a PASS and an exit 0 from it — the
 * second #599 review measured exactly that against this checkout. The contract
 * tests set both; no release route sets either.
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
  if (LOOPBACK_HOSTS.has(parsed.hostname)) {
    if (process.env.RELEASE_EVIDENCE_FIXTURE?.trim() !== "1") {
      return {
        error:
          `GITHUB_API_URL is the loopback stand-in ${raw} with no RELEASE_EVIDENCE_FIXTURE=1 ` +
          "beside it. That pair exists for this guard's own contract tests; a release reads " +
          "api.github.com, and a stand-in's verdict is not evidence for any publish",
      };
    }
    return { base: raw, real: false };
  }
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

/**
 * The revision under judgement, and its two relations to this checkout.
 *
 * `fromHead` is "the caller named no revision at all". `isHead` is the one the
 * tree check cares about: the revision being judged is the one checked out,
 * however it was spelled — nothing, `HEAD`, or its own 40 digits. They came as
 * one flag until the second #599 review, so `RELEASE_SHA=$(git rev-parse HEAD)`
 * turned the tree check off while publishing that very tree.
 */
function resolveSha() {
  const head = git(["rev-parse", "HEAD"]).out.toLowerCase();
  const given = (process.env.RELEASE_SHA ?? process.env.GITHUB_SHA ?? "").trim();
  const fromHead = given.length === 0;
  let sha = "";
  if (/^[0-9a-f]{40}$/i.test(given)) {
    sha = given.toLowerCase();
  } else {
    const resolved = git(["rev-parse", fromHead ? "HEAD" : given]).out.toLowerCase();
    if (/^[0-9a-f]{40}$/.test(resolved)) sha = resolved;
  }
  return { sha, fromHead, isHead: sha.length > 0 && sha === head };
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
 * The revision being judged is the one checked out, so the tree is what gets
 * published.
 *
 * `vp run release:npm` on a green sha with uncommitted edits publishes
 * something the evidence does not cover — the same shape as the hole #599 was
 * opened to close (#599 review). This runs on every route that judges HEAD,
 * including CI: the release job reads evidence before `pnpm install`, and
 * `changeset:publish` reads it before `vp run build`, so both see the checkout
 * as `actions/checkout` left it.
 */
function treeRefusals() {
  const refusals = [];
  const status = git(["status", "--porcelain"]);
  if (!status.ok) {
    refusals.push("the working tree could not be read (`git status --porcelain` failed)");
  } else if (status.out.length > 0) {
    refusals.push(
      "the working tree is not clean; `changeset publish` ships the tree, not the SHA this " +
        "guard read. Commit or stash first — naming this same commit in RELEASE_SHA does not " +
        "make the edits on top of it published",
    );
  }
  return refusals;
}

/**
 * Nothing ran on a commit `origin/main` does not contain.
 *
 * Only for the route that names no revision at all. A caller who names one is
 * asking about a revision, not about this checkout's branch state, and the read
 * below already refuses anything that is not a push or dispatch run on this
 * repository's own main at that exact sha — which is the same fact, taken from
 * the API rather than from local refs (#599 second review).
 */
function ancestryRefusals() {
  const refusals = [];
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
const { sha, fromHead, isHead } = resolveSha();
const repository = repositoryRead.repository ?? "";
const token = api.error ? "" : resolveToken(api.real === true);

// An unusable API base is the whole answer: the repository and the credential
// are resolved off it, so reporting them as missing beside it would print two
// sentences that are not true of the caller's environment.
const setupRefusals = (
  api.error
    ? [api.error]
    : [
        repositoryRead.error,
        repository
          ? null
          : "GITHUB_REPOSITORY (or a github.com `origin` remote) names no repository",
        token
          ? null
          : api.real === false
            ? "GITHUB_TOKEN is unset, and a stand-in API base is never handed the `gh` credential"
            : "GITHUB_TOKEN (or an authenticated `gh`) gives no credential",
        sha ? null : "RELEASE_SHA (or a resolvable HEAD) names no revision",
        ...(sha && isHead ? treeRefusals() : []),
        ...(sha && fromHead ? ancestryRefusals() : []),
      ]
).filter(Boolean);

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
    .sort(newestFirst);
}

/**
 * Newest first.
 *
 * Actions run ids ascend, but `run_started_at` is what "later" means, and
 * `run_number` breaks the tie two runs started in the same second leave.
 */
function newestFirst(a, b) {
  const started = Date.parse(b.run_started_at ?? "") - Date.parse(a.run_started_at ?? "");
  if (Number.isFinite(started) && started !== 0) return started;
  const numbered = (b.run_number ?? 0) - (a.run_number ?? 0);
  if (numbered !== 0) return numbered;
  return b.id - a.id;
}

/**
 * One workflow's verdict at this sha: the newest run that says anything about
 * the tree.
 *
 * Cancelled and skipped say nothing, so they stand aside for the run behind
 * them; a run still going has not said anything yet, so it is waited for. Until
 * the second #599 review this was order-blind — one completed failure anywhere
 * in the list refused, so a red run followed by a green re-run at the same sha
 * could never be released, whichever way round they came.
 */
function verdict(runs) {
  const ordered = [...runs].sort(newestFirst);
  const decisive = ordered.find(
    (run) => run.status !== "completed" || !STANDS_ASIDE.has(run.conclusion ?? ""),
  );
  if (!decisive) {
    if (ordered.length === 0) return { state: "absent", detail: "no run at this SHA" };
    return {
      state: "refused",
      detail: `concluded ${ordered.map((run) => run.conclusion ?? "no conclusion").join(", ")}`,
    };
  }
  if (decisive.status !== "completed") {
    return { state: "pending", detail: decisive.status ?? "pending" };
  }
  if (decisive.conclusion === "success") return { state: "success", detail: "success" };
  const conclusion = decisive.conclusion ?? "no conclusion";
  const behind = ordered.some(
    (run) => run !== decisive && run.status === "completed" && run.conclusion === "success",
  );
  return {
    state: "refused",
    detail: `concluded ${conclusion}`,
    // Only when a green is being overruled: otherwise "no successful run" says
    // it better.
    line: behind
      ? `has a completed run at ${sha} on main that concluded ${conclusion}; the older green at the same SHA does not stand against it`
      : undefined,
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
