#!/usr/bin/env node

/**
 * Fails when scripts/gate-coverage.json and the certification ladder disagree.
 *
 * `ci:release-readiness` is a local chain. Certification Gates is the workflow
 * that runs the ladder. The JSON file says, for every blocking step of the
 * `certification-gates` job (no `continue-on-error: true`) and for the certified
 * matrix job and the certified report job, which package script the chain runs
 * — or that the chain does not run it. A blocking step with no entry, an entry
 * for a step that is gone, or a `leg` that is not a package.json script fails
 * this guard. So does a `leg` the chain does not reach: `check` runs
 * `typecheck`, and a literal leg-name match would miss that.
 *
 * The job slice below is the same four-line cut as `jobBlock` in
 * scripts/test-ci-guard-contracts.mjs. That file runs its suite on import and
 * does not export the reader, so this copy stays here.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..");

const GATES_JOB = "certification-gates";
const CERTIFIED_JOB = "certified";
const CERTIFIED_REPORT_JOB = "certified-report";
const CERTIFIED_SHARDS = 8;
const CHAIN = "ci:release-readiness";
const RUN_SOURCE = String.raw`(?:^|&&|\|\||;)\s*(?:vp|pnpm|npm)\s+run\s+([A-Za-z0-9:_-]+)`;

/** The same cut as `jobBlock` in scripts/test-ci-guard-contracts.mjs. */
export function jobBlock(workflow, job) {
  const start = workflow.indexOf(`\n  ${job}:\n`);
  if (start < 0) return null;
  const body = workflow.slice(start + 1);
  const next = body.search(/\n {2}[A-Za-z0-9_-]+:\n/);
  return next >= 0 ? body.slice(0, next + 1) : body;
}

function unquote(value) {
  const trimmed = value.trim();
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function jobDisplayName(jobText) {
  const match = /^ {4}name:\s*(.+?)\s*$/m.exec(jobText);
  return match ? unquote(match[1]) : null;
}

function shardCount(jobText) {
  const flow = /^ {8}shard:\s*\[([^\]]*)\]/m.exec(jobText);
  if (!flow) return null;
  return flow[1]
    .split(",")
    .map((part) => part.trim())
    .filter((part) => part.length > 0).length;
}

function isAdvisory(chunk) {
  return chunk.split("\n").some((line) => /^ {8}continue-on-error:\s*true\s*(?:#.*)?$/.test(line));
}

function runBody(chunk) {
  const lines = chunk.split("\n");
  const index = lines.findIndex((line) => /^ {8}run:/.test(line));
  if (index < 0) return null;
  const inline = /^ {8}run:\s*(.*)$/.exec(lines[index]);
  const rest = inline?.[1]?.trim() ?? "";
  if (rest !== "" && rest !== "|" && rest !== ">") return rest;
  const body = [];
  for (const line of lines.slice(index + 1)) {
    if (/^ {8}\S/.test(line)) break;
    body.push(line);
  }
  const text = body.join("\n").trim();
  return text === "" ? null : text;
}

function invokedScript(run) {
  if (!run) return null;
  const match = /(?:^|\s)(?:vp|pnpm|npm)\s+run\s+([A-Za-z0-9:_-]+)/.exec(run);
  if (!match || match[1].startsWith("-")) return null;
  return match[1];
}

/** Blocking steps of the gates job, in file order. Advisory steps are omitted. */
export function blockingGateSteps(workflow) {
  const job = jobBlock(workflow, GATES_JOB);
  if (!job) return [];
  const at = job.indexOf("\n      - ");
  if (at < 0) return [];
  return job
    .slice(at + 1)
    .split(/\n(?= {6}- )/)
    .filter((chunk) => !isAdvisory(chunk))
    .map((chunk) => {
      const first = chunk.split("\n")[0] ?? "";
      const named = /^ {6}- name:\s*(.*?)\s*$/.exec(first);
      return {
        name: named ? unquote(named[1]) : null,
        runBody: runBody(chunk),
      };
    });
}

function legRunsStep(command, run) {
  if (!run) return false;
  const normalized = run.trim().replace(/^pnpm exec\s+/, "");
  return command.includes(normalized) || normalized.includes(command.trim());
}

/** Scripts `ci:release-readiness` runs, following `vp run` / `pnpm run` through compositions. */
export function reachedScripts(scripts, entry = CHAIN) {
  const reached = new Set();
  const pending = [entry];
  while (pending.length > 0) {
    const name = pending.pop();
    if (name === undefined || reached.has(name) || name.startsWith("-")) continue;
    const command = scripts?.[name];
    if (typeof command !== "string") continue;
    reached.add(name);
    for (const match of command.matchAll(new RegExp(RUN_SOURCE, "g"))) {
      pending.push(match[1]);
    }
  }
  return reached;
}

function requiredJobNames(workflow, problems) {
  const names = [];
  const certified = jobBlock(workflow, CERTIFIED_JOB);
  if (!certified) {
    problems.push("certification-gates.yml has no `certified` job");
  } else {
    const name = jobDisplayName(certified);
    if (!name) problems.push("the certified job has no name");
    else names.push(name);
    const shards = shardCount(certified);
    if (shards !== CERTIFIED_SHARDS) {
      problems.push(
        `the certified job runs ${shards ?? "no"} shards; the coverage entry is for eight`,
      );
    }
  }
  const report = jobBlock(workflow, CERTIFIED_REPORT_JOB);
  if (!report) {
    problems.push("certification-gates.yml has no `certified-report` job");
  } else {
    const name = jobDisplayName(report);
    if (!name) problems.push("the certified report job has no name");
    else names.push(name);
  }
  return names;
}

function legProblems(name, entry, scripts, reached) {
  const problems = [];
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) {
    problems.push(`entry "${name}" is not an object`);
    return problems;
  }
  const leg = entry.leg;
  if (leg === null) {
    if (typeof entry.why !== "string" || entry.why.trim() === "") {
      problems.push(`entry "${name}" has leg null without a why`);
    }
    return problems;
  }
  if (typeof leg !== "string" || leg.trim() === "") {
    problems.push(`entry "${name}" has no leg`);
    return problems;
  }
  if (typeof scripts?.[leg] !== "string") {
    problems.push(`entry "${name}" leg "${leg}" is not a package.json script`);
    return problems;
  }
  if (!reached.has(leg)) {
    problems.push(`entry "${name}" leg "${leg}" is not reached by ci:release-readiness`);
  }
  return problems;
}

/**
 * One problem per disagreement. Empty means the map matches the workflow and
 * every non-null leg is a script the release chain reaches.
 */
export function findCoverageProblems(workflow, coverage, scripts) {
  const problems = [];
  if (!coverage || typeof coverage !== "object" || Array.isArray(coverage)) {
    return ["scripts/gate-coverage.json must be an object"];
  }

  const steps = blockingGateSteps(workflow);
  if (steps.length === 0) {
    problems.push("certification-gates.yml has no blocking steps in the certification-gates job");
  }
  const seen = new Set();
  for (const step of steps) {
    if (!step.name) {
      problems.push("a blocking step has no name");
      continue;
    }
    if (seen.has(step.name)) problems.push(`blocking step "${step.name}" is named more than once`);
    seen.add(step.name);
    if (!Object.hasOwn(coverage, step.name)) {
      problems.push(`blocking step "${step.name}" has no entry in scripts/gate-coverage.json`);
    }
  }

  const jobs = requiredJobNames(workflow, problems);
  for (const name of jobs) {
    if (!Object.hasOwn(coverage, name)) {
      problems.push(`"${name}" has no entry in scripts/gate-coverage.json`);
    }
  }
  const valid = new Set([...seen, ...jobs]);
  const reached = reachedScripts(scripts);

  for (const [name, entry] of Object.entries(coverage)) {
    if (!valid.has(name)) {
      problems.push(`entry "${name}" names a step that no longer exists`);
      continue;
    }
    const step = steps.find((candidate) => candidate.name === name);
    if (
      !step &&
      entry &&
      typeof entry === "object" &&
      !Array.isArray(entry) &&
      entry.leg !== null
    ) {
      problems.push(`entry "${name}" is a certified job, so its leg must be null`);
    }
    problems.push(...legProblems(name, entry, scripts, reached));
    if (!step || !entry || typeof entry !== "object" || Array.isArray(entry)) continue;

    const invoked = invokedScript(step.runBody);
    const leg = entry.leg;
    if (invoked && typeof scripts?.[invoked] !== "string") {
      problems.push(
        `blocking step "${name}" runs "${invoked}", which is not a package.json script`,
      );
    } else if (invoked && reached.has(invoked) && leg !== invoked) {
      problems.push(
        `blocking step "${name}" runs "${invoked}", which ci:release-readiness reaches, but its leg is ${leg === null ? "null" : `"${leg}"`}`,
      );
    } else if (invoked && !reached.has(invoked) && leg !== null) {
      problems.push(
        `blocking step "${name}" runs "${invoked}", which ci:release-readiness does not reach`,
      );
    } else if (!invoked && step.runBody === null && typeof leg === "string") {
      problems.push(`blocking step "${name}" has no run command, so its leg must be null`);
    } else if (!invoked && typeof leg === "string" && typeof scripts?.[leg] === "string") {
      if (!legRunsStep(scripts[leg], step.runBody)) {
        problems.push(`blocking step "${name}" leg "${leg}" does not run this step`);
      }
    }
  }
  return problems;
}

export function coverageSentence(local, total) {
  return `ci:release-readiness runs ${local} of ${total} blocking gate steps locally; the other ${total - local} run only in Certification Gates (scripts/gate-coverage.json)`;
}

export function evaluateGateCoverage(workflow, coverage, scripts) {
  const problems = findCoverageProblems(workflow, coverage, scripts);
  if (problems.length > 0) return { ok: false, problems, sentence: null };
  const steps = blockingGateSteps(workflow).filter((step) => step.name);
  const reached = reachedScripts(scripts);
  const local = steps.filter((step) => {
    const leg = coverage[step.name]?.leg;
    return typeof leg === "string" && reached.has(leg);
  }).length;
  return { ok: true, problems: [], sentence: coverageSentence(local, steps.length) };
}

export function checkGateCoverage(root = ROOT) {
  let workflow;
  let coverage;
  let scripts;
  try {
    workflow = readFileSync(join(root, ".github/workflows/certification-gates.yml"), "utf8");
    coverage = JSON.parse(readFileSync(join(root, "scripts/gate-coverage.json"), "utf8"));
    const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    scripts = manifest.scripts ?? {};
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
  const result = evaluateGateCoverage(workflow, coverage, scripts);
  if (!result.ok) {
    console.error("gate coverage:");
    for (const problem of result.problems) console.error(`  ${problem}`);
    return 1;
  }
  console.log(result.sentence);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(checkGateCoverage());
}
