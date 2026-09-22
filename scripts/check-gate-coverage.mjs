#!/usr/bin/env node

/**
 * Fails when scripts/gate-coverage.json and Certification Gates disagree.
 *
 * `ci:release-readiness` is a local chain. The workflow has six jobs. The JSON
 * file names every blocking step of every job — a step with no
 * `continue-on-error: true` — and says which package script the chain runs, or
 * that the chain does not run it. A `uses:` step is runner plumbing. A `run:`
 * that invokes no package script is plumbing only when its name is on the JSON
 * allowlist; every other blocking step is a gate. A blocking step with no
 * entry, an entry for a step that is gone, a blocking step that became
 * advisory, or a `leg` that is not a package script the chain reaches fails
 * this guard. So does a copy of the printed sentence that drifted in the two
 * docs this guard reads. A string `leg` must be among the `vp|pnpm|npm run`
 * scripts named in the step's run body when that body names any, every other
 * named script must be one `ci:release-readiness` reaches or the guard fails
 * naming the step and the script, and a null `leg` that names a reached
 * script fails.
 *
 * `jobBlock` is the same four-line cut as `scripts/test-ci-guard-contracts.mjs`.
 * That file runs its suite on import and exports nothing. The workflow-pin and
 * gate-server-reuse readers do not slice jobs, so the cut stays here.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const HERE = dirname(fileURLToPath(import.meta.url));
export const ROOT = join(HERE, "..");

const WORKFLOW_JOBS = [
  "certification-gates",
  "comparison-build",
  "comparison-floors-pair",
  "comparison-floors-contract",
  "certified",
  "certified-report",
];
const CERTIFIED_JOB = "certified";
const CERTIFIED_SHARDS = 8;
const CHAIN = "ci:release-readiness";
const RUN_SOURCE = String.raw`(?:^|&&|\|\||;)\s*(?:vp|pnpm|npm)\s+run\s+([A-Za-z0-9:_-]+)`;

export const SENTENCE_DOCS = [
  ".claude/current/release-policy.md",
  ".claude/current/certification.md",
];

/** The same cut as `jobBlock` in scripts/test-ci-guard-contracts.mjs. */
export function jobBlock(workflow, job) {
  const start = workflow.indexOf(`\n  ${job}:\n`);
  if (start < 0) return null;
  const body = workflow.slice(start + 1);
  const next = body.search(/\n {2}[A-Za-z0-9_-]+:\n/);
  return next >= 0 ? body.slice(0, next + 1) : body;
}

export function workflowJobIds(workflow) {
  const at = workflow.startsWith("jobs:\n") ? 0 : workflow.indexOf("\njobs:\n");
  if (at < 0) return [];
  return [...workflow.slice(at).matchAll(/\n {2}([A-Za-z0-9_-]+):\n/g)].map((match) => match[1]);
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

function usesAction(chunk) {
  return chunk.split("\n").some((line) => /^ {8}uses:/.test(line));
}

/** Every `vp|pnpm|npm run <script>` in a step body, in source order. */
export function invokedScripts(run) {
  if (!run) return [];
  const names = [];
  for (const match of run.matchAll(new RegExp(RUN_SOURCE, "g"))) {
    if (!match[1].startsWith("-")) names.push(match[1]);
  }
  return names;
}

export function stepKey(jobName, stepName) {
  return `${jobName} / ${stepName}`;
}

function stepsIn(workflow) {
  const steps = [];
  for (const jobId of workflowJobIds(workflow)) {
    const job = jobBlock(workflow, jobId);
    if (!job) continue;
    const jobName = jobDisplayName(job) ?? jobId;
    const at = job.indexOf("\n      - ");
    if (at < 0) continue;
    for (const chunk of job.slice(at + 1).split(/\n(?= {6}- )/)) {
      const first = chunk.split("\n")[0] ?? "";
      const named = /^ {6}- name:\s*(.*?)\s*$/.exec(first);
      const name = named ? unquote(named[1]) : null;
      steps.push({
        jobId,
        jobName,
        name,
        key: name ? stepKey(jobName, name) : null,
        runBody: runBody(chunk),
        uses: usesAction(chunk),
        advisory: isAdvisory(chunk),
      });
    }
  }
  return steps;
}

/** Blocking steps of every job, in file order. Advisory steps are omitted. */
export function blockingGateSteps(workflow) {
  return stepsIn(workflow).filter((step) => !step.advisory);
}

/**
 * `uses:` is plumbing. A `run:` that invokes no package script is plumbing
 * only when its name is on the allowlist. Everything else is a gate.
 */
export function stepKind(step, plumbingNames) {
  if (step.uses) return "plumbing";
  if (invokedScripts(step.runBody).length > 0) return "gate";
  if (step.name && plumbingNames.includes(step.name)) return "plumbing";
  return "gate";
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

function coverageParts(coverage, problems) {
  if (!coverage || typeof coverage !== "object" || Array.isArray(coverage)) {
    problems.push("scripts/gate-coverage.json must be an object");
    return null;
  }
  for (const key of Object.keys(coverage)) {
    if (key !== "plumbing" && key !== "steps") {
      problems.push(`scripts/gate-coverage.json has unknown key "${key}"`);
    }
  }
  const plumbing = coverage.plumbing;
  const steps = coverage.steps;
  if (
    !Array.isArray(plumbing) ||
    plumbing.some((name) => typeof name !== "string" || name.trim() === "")
  ) {
    problems.push("scripts/gate-coverage.json plumbing must be a list of step names");
  }
  if (!steps || typeof steps !== "object" || Array.isArray(steps)) {
    problems.push("scripts/gate-coverage.json steps must be an object");
    return null;
  }
  return { plumbing: Array.isArray(plumbing) ? plumbing : [], steps };
}

function gateLegProblems(step, entry, scripts, reached) {
  if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
  const problems = [];
  const invoked = invokedScripts(step.runBody);
  const leg = entry.leg;
  const name = step.key;
  if (invoked.length === 0) {
    if (step.runBody === null && typeof leg === "string") {
      problems.push(`blocking step "${name}" has no run command, so its leg must be null`);
    } else if (typeof leg === "string" && typeof scripts?.[leg] === "string") {
      if (!legRunsStep(scripts[leg], step.runBody)) {
        problems.push(`blocking step "${name}" leg "${leg}" does not run this step`);
      }
    }
    return problems;
  }
  for (const script of invoked) {
    if (typeof scripts?.[script] !== "string") {
      problems.push(`blocking step "${name}" runs "${script}", which is not a package.json script`);
    }
  }
  if (leg === null) {
    for (const script of invoked) {
      if (typeof scripts?.[script] === "string" && reached.has(script)) {
        problems.push(
          `blocking step "${name}" runs "${script}", which ci:release-readiness reaches, but its leg is null`,
        );
      }
    }
    return problems;
  }
  if (!invoked.includes(leg)) {
    const standIn = invoked.find(
      (script) => typeof scripts?.[script] === "string" && reached.has(script),
    );
    if (standIn) {
      problems.push(
        `blocking step "${name}" runs "${standIn}", which ci:release-readiness reaches, but its leg is "${leg}"`,
      );
    }
  }
  for (const script of invoked) {
    if (typeof scripts?.[script] !== "string" || reached.has(script)) continue;
    problems.push(
      `blocking step "${name}" runs "${script}", which ci:release-readiness does not reach`,
    );
  }
  return problems;
}

/**
 * One problem per disagreement. Empty means the map matches every blocking
 * step of the six jobs and every non-null leg is a script the release chain
 * reaches.
 */
export function findCoverageProblems(workflow, coverage, scripts) {
  const problems = [];
  const parts = coverageParts(coverage, problems);
  if (!parts) return problems;
  const { plumbing, steps: entries } = parts;

  const ids = workflowJobIds(workflow);
  const idSet = new Set(ids);
  if (ids.length !== WORKFLOW_JOBS.length || WORKFLOW_JOBS.some((job) => !idSet.has(job))) {
    problems.push(
      `certification-gates.yml has ${ids.length} jobs (${ids.join(", ")}); the coverage sentence is for the six Certification Gates jobs`,
    );
  }

  const certified = jobBlock(workflow, CERTIFIED_JOB);
  if (certified) {
    const shards = shardCount(certified);
    if (shards !== CERTIFIED_SHARDS) {
      problems.push(
        `the certified job runs ${shards ?? "no"} shards; the coverage keys are for eight`,
      );
    }
  }

  const listed = new Set();
  for (const name of plumbing) {
    if (listed.has(name)) problems.push(`plumbing name "${name}" is listed more than once`);
    listed.add(name);
  }

  const blocking = blockingGateSteps(workflow);
  if (blocking.length === 0) problems.push("certification-gates.yml has no blocking steps");
  const seen = new Set();
  const blockingNames = new Set();
  for (const step of blocking) {
    if (!step.name || !step.key) {
      problems.push("a blocking step has no name");
      continue;
    }
    blockingNames.add(step.name);
    if (seen.has(step.key)) problems.push(`blocking step "${step.key}" is named more than once`);
    seen.add(step.key);
    if (!Object.hasOwn(entries, step.key)) {
      problems.push(`blocking step "${step.key}" has no entry in scripts/gate-coverage.json`);
    }
  }
  for (const name of plumbing) {
    if (!blockingNames.has(name)) {
      problems.push(`plumbing name "${name}" matches no blocking step`);
    }
  }

  const advisory = new Set(
    stepsIn(workflow)
      .filter((step) => step.advisory && step.key)
      .map((step) => step.key),
  );
  const reached = reachedScripts(scripts);
  for (const [key, entry] of Object.entries(entries)) {
    const step = blocking.find((candidate) => candidate.key === key);
    if (!step) {
      if (advisory.has(key)) {
        problems.push(
          `blocking step "${key}" is now advisory; remove its entry or restore continue-on-error`,
        );
      } else {
        problems.push(`entry "${key}" names a step that no longer exists`);
      }
      continue;
    }
    problems.push(...legProblems(key, entry, scripts, reached));
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) continue;
    if (stepKind(step, plumbing) === "plumbing") {
      if (entry.leg !== null) {
        problems.push(`entry "${key}" is runner plumbing, so its leg must be null`);
      }
      continue;
    }
    problems.push(...gateLegProblems(step, entry, scripts, reached));
  }
  return problems;
}

export function coverageSentence(local, gates, plumbing) {
  return `ci:release-readiness runs ${local} of ${gates} blocking gate steps locally across the six Certification Gates jobs; the other ${gates - local} run only there; ${plumbing} steps are runner plumbing (scripts/gate-coverage.json)`;
}

function countCoverage(workflow, coverage, scripts) {
  const plumbingNames = Array.isArray(coverage?.plumbing) ? coverage.plumbing : [];
  const entries = coverage?.steps ?? {};
  const reached = reachedScripts(scripts);
  let gates = 0;
  let plumbing = 0;
  let local = 0;
  for (const step of blockingGateSteps(workflow)) {
    if (!step.name) continue;
    if (stepKind(step, plumbingNames) === "plumbing") {
      plumbing += 1;
      continue;
    }
    gates += 1;
    const leg = entries[step.key]?.leg;
    if (stepRunsLocally(step, leg, reached)) local += 1;
  }
  return { local, gates, plumbing };
}

/** A gate runs locally when its leg and every script its body names are on the chain. */
function stepRunsLocally(step, leg, reached) {
  if (typeof leg !== "string" || !reached.has(leg)) return false;
  const invoked = invokedScripts(step.runBody);
  if (invoked.length > 0 && !invoked.includes(leg)) return false;
  return invoked.every((script) => reached.has(script));
}

export function findDocProblems(sentence, docs) {
  const problems = [];
  for (const file of SENTENCE_DOCS) {
    const text = docs?.[file];
    if (typeof text !== "string" || !text.includes(sentence)) {
      problems.push(`${file} does not contain the coverage sentence`);
    }
  }
  return problems;
}

export function evaluateGateCoverage(workflow, coverage, scripts, docs) {
  const problems = findCoverageProblems(workflow, coverage, scripts);
  if (problems.length > 0) return { ok: false, problems, sentence: null };
  const counts = countCoverage(workflow, coverage, scripts);
  const sentence = coverageSentence(counts.local, counts.gates, counts.plumbing);
  if (docs) {
    const docProblems = findDocProblems(sentence, docs);
    if (docProblems.length > 0) return { ok: false, problems: docProblems, sentence };
  }
  return { ok: true, problems: [], sentence };
}

export function checkGateCoverage(root = ROOT) {
  let workflow;
  let coverage;
  let scripts;
  const docs = {};
  try {
    workflow = readFileSync(join(root, ".github/workflows/certification-gates.yml"), "utf8");
    coverage = JSON.parse(readFileSync(join(root, "scripts/gate-coverage.json"), "utf8"));
    const manifest = JSON.parse(readFileSync(join(root, "package.json"), "utf8"));
    scripts = manifest.scripts ?? {};
    for (const file of SENTENCE_DOCS) docs[file] = readFileSync(join(root, file), "utf8");
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 1;
  }
  const result = evaluateGateCoverage(workflow, coverage, scripts, docs);
  if (!result.ok) {
    console.error("gate coverage:");
    for (const problem of result.problems) console.error(`  ${problem}`);
    if (result.sentence) console.error(result.sentence);
    return 1;
  }
  console.log(result.sentence);
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(checkGateCoverage());
}
