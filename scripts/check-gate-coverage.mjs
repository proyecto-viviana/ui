#!/usr/bin/env node

/**
 * Fails when scripts/gate-coverage.json and Certification Gates disagree.
 *
 * `ci:release-readiness` is a local chain. The workflow has six jobs. The JSON
 * file names every blocking step of every job — a step with no
 * `continue-on-error: true` and whose run is not swallowed by `|| true` — and
 * says which package script the chain runs, or that the chain does not run it.
 * A `uses:` step is runner plumbing. A `run:` that invokes no package script is
 * plumbing only when its full step key is on the JSON allowlist; every other
 * blocking step is a gate. A blocking step with no entry, an entry for a step
 * that is gone, a blocking step that became advisory, or a `leg` that is not a
 * package script the chain reaches fails this guard. So does a stale second
 * copy of the printed sentence in the two docs this guard reads.
 *
 * The run scanner treats newline, `;`, `&&`, `||`, `&`, `|`, and parentheses as
 * separators outside quotes, comments, and heredocs. An env assignment may
 * precede `vp|pnpm|npm run`. `then`, `else`, and `do` are keywords only in
 * command position. A string `leg` matches when every shell command of the run,
 * after one leading `pnpm exec`, equals a shell command of the package script.
 * A null `leg` that names a reached script fails. An unreached package script
 * on a null `leg` fails only when the step is not purely those `run` commands.
 * Publish summary's `O_*` bindings and rows must name the same
 * certification-gates gates.
 *
 * `jobBlock` is the same four-line cut as `scripts/test-ci-guard-contracts.mjs`.
 * That file runs its suite on import and exports nothing. The workflow-pin and
 * gate-server-reuse readers do not slice jobs, so the cut stays duplicated.
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
const RUNNERS = new Set(["vp", "pnpm", "npm"]);
const SCRIPT_NAME = /^[A-Za-z0-9:_-]+$/;
const COMMAND_KEYWORDS = new Set([
  "if",
  "elif",
  "while",
  "until",
  "then",
  "else",
  "do",
  "fi",
  "done",
  "esac",
  "in",
  "case",
]);
const STATEMENT_SEPS = new Set(["\n", ";", ";;", "&", "(", ")", "`"]);
const STEP_REF = /^\$\{\{\s*steps\.([A-Za-z0-9_-]+)\.(?:outcome|outputs\.[A-Za-z0-9_-]+)\s*\}\}$/;
const COVERAGE_SENTENCE_PATTERN = String.raw`ci:release-readiness runs \d+ of \d+ blocking gate steps locally across the six Certification Gates jobs; the other \d+ run only there; \d+ steps are runner plumbing \(scripts\/gate-coverage\.json\)`;

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

function isEnvAssignment(word) {
  return /^[A-Za-z_][A-Za-z0-9_]*=/.test(word);
}

function stripEnv(words) {
  let index = 0;
  while (index < words.length && isEnvAssignment(words[index])) index += 1;
  return words.slice(index);
}

function readWord(text, start) {
  let index = start;
  let value = "";
  let quote = null;
  while (index < text.length) {
    const ch = text[index];
    if (quote === "'") {
      if (ch === "'") quote = null;
      else value += ch;
      index += 1;
      continue;
    }
    if (quote === '"') {
      if (ch === "\\" && index + 1 < text.length) {
        value += text[index + 1];
        index += 2;
        continue;
      }
      if (ch === '"') quote = null;
      else value += ch;
      index += 1;
      continue;
    }
    if (ch === "\\" && index + 1 < text.length) {
      value += text[index + 1];
      index += 2;
      continue;
    }
    if (ch === "'" || ch === '"') {
      quote = ch;
      index += 1;
      continue;
    }
    if (ch === "$" && text[index + 1] === "(") break;
    if (/[\s;&|()<>`]/.test(ch)) break;
    value += ch;
    index += 1;
  }
  return { value, end: index };
}

function readHeredocDelim(text, start) {
  let index = start;
  while (index < text.length && (text[index] === " " || text[index] === "\t")) index += 1;
  if (index >= text.length || text[index] === "\n") return { word: "", end: index };
  const quote = text[index] === "'" || text[index] === '"' ? text[index] : null;
  if (quote) {
    index += 1;
    let word = "";
    while (index < text.length && text[index] !== quote && text[index] !== "\n") {
      word += text[index];
      index += 1;
    }
    if (index < text.length && text[index] === quote) index += 1;
    return { word, end: index };
  }
  let word = "";
  while (index < text.length && !/[\s;&|()<>`]/.test(text[index])) {
    word += text[index];
    index += 1;
  }
  return { word, end: index };
}

function consumeHeredoc(text, start, heredoc) {
  let index = start;
  while (index < text.length) {
    const end = text.indexOf("\n", index);
    const line = end < 0 ? text.slice(index) : text.slice(index, end);
    const compare = heredoc.stripTabs ? line.replace(/^\t+/, "") : line;
    if (compare === heredoc.word) return end < 0 ? text.length : end + 1;
    if (end < 0) return text.length;
    index = end + 1;
  }
  return index;
}

function matchingParen(text, openIndex) {
  let depth = 0;
  let index = openIndex;
  while (index < text.length) {
    const ch = text[index];
    if (ch === "\\") {
      index += 2;
      continue;
    }
    if (ch === "'") {
      index += 1;
      while (index < text.length && text[index] !== "'") index += 1;
      index += 1;
      continue;
    }
    if (ch === '"') {
      index += 1;
      while (index < text.length && text[index] !== '"') {
        if (text[index] === "\\") index += 2;
        else index += 1;
      }
      index += 1;
      continue;
    }
    if (ch === "(") depth += 1;
    else if (ch === ")") {
      depth -= 1;
      if (depth === 0) return index;
    }
    index += 1;
  }
  return -1;
}

function scanShell(text) {
  const atoms = [];
  const pending = [];
  let words = [];
  let index = 0;

  function flushCommand() {
    while (words.length > 0 && COMMAND_KEYWORDS.has(words[0])) words.shift();
    if (words.length > 0) atoms.push({ type: "cmd", words });
    words = [];
  }

  while (index < text.length) {
    const ch = text[index];
    if (ch === " " || ch === "\t" || ch === "\r") {
      index += 1;
      continue;
    }
    if (ch === "#") {
      while (index < text.length && text[index] !== "\n") index += 1;
      continue;
    }
    if (ch === "\n") {
      flushCommand();
      atoms.push({ type: "sep", op: "\n" });
      index += 1;
      for (const heredoc of pending) index = consumeHeredoc(text, index, heredoc);
      pending.length = 0;
      continue;
    }
    if (ch === ";") {
      flushCommand();
      if (text[index + 1] === ";") {
        atoms.push({ type: "sep", op: ";;" });
        index += 2;
      } else {
        atoms.push({ type: "sep", op: ";" });
        index += 1;
      }
      continue;
    }
    if (ch === "&") {
      flushCommand();
      if (text[index + 1] === "&") {
        atoms.push({ type: "sep", op: "&&" });
        index += 2;
      } else {
        atoms.push({ type: "sep", op: "&" });
        index += 1;
      }
      continue;
    }
    if (ch === "|") {
      flushCommand();
      if (text[index + 1] === "|") {
        atoms.push({ type: "sep", op: "||" });
        index += 2;
      } else if (text[index + 1] === "&") {
        atoms.push({ type: "sep", op: "|&" });
        index += 2;
      } else {
        atoms.push({ type: "sep", op: "|" });
        index += 1;
      }
      continue;
    }
    if (ch === "(" || ch === ")" || ch === "`") {
      flushCommand();
      atoms.push({ type: "sep", op: ch });
      index += 1;
      continue;
    }
    if (ch === "<" || ch === ">") {
      if (ch === "<" && text[index + 1] === "<") {
        const stripTabs = text[index + 2] === "-";
        index += stripTabs ? 3 : 2;
        const delim = readHeredocDelim(text, index);
        index = delim.end;
        if (delim.word !== "") pending.push({ word: delim.word, stripTabs });
        continue;
      }
      if (text[index + 1] === ">" || text[index + 1] === "&") index += 2;
      else index += 1;
      continue;
    }
    if (ch === "$" && text[index + 1] === "(") {
      if (words.length > 0) flushCommand();
      const close = matchingParen(text, index + 1);
      if (close < 0) {
        words.push("$");
        index += 1;
        continue;
      }
      atoms.push(...scanShell(text.slice(index + 2, close)));
      index = close + 1;
      continue;
    }
    const word = readWord(text, index);
    if (word.end === index) {
      words.push(ch);
      index += 1;
      continue;
    }
    if (word.value !== "") words.push(word.value);
    index = word.end;
  }
  flushCommand();
  return atoms;
}

function commandCanFail(words) {
  const rest = stripEnv(words);
  if (rest.length === 0) return false;
  if (rest.length === 1 && rest[0] === "true") return false;
  return true;
}

function parsePipeline(atoms, start) {
  if (start >= atoms.length || atoms[start].type !== "cmd") return { canFail: false, next: start };
  let canFail = commandCanFail(atoms[start].words);
  let index = start + 1;
  while (index < atoms.length) {
    const atom = atoms[index];
    if (atom.type !== "sep" || (atom.op !== "|" && atom.op !== "|&")) break;
    const right = index + 1;
    if (right >= atoms.length || atoms[right].type !== "cmd") {
      index += 1;
      break;
    }
    canFail = canFail || commandCanFail(atoms[right].words);
    index = right + 1;
  }
  return { canFail, next: index };
}

function statementCanFail(atoms, start) {
  const first = parsePipeline(atoms, start);
  let canFail = first.canFail;
  let index = first.next;
  while (index < atoms.length) {
    const atom = atoms[index];
    if (atom.type !== "sep" || (atom.op !== "&&" && atom.op !== "||")) break;
    const op = atom.op;
    const next = parsePipeline(atoms, index + 1);
    if (op === "&&") canFail = canFail || next.canFail;
    else canFail = canFail && next.canFail;
    if (next.next <= index + 1) {
      index += 2;
      break;
    }
    index = next.next;
  }
  return { canFail, next: index > start ? index : start + 1 };
}

function scriptCanFail(atoms) {
  let index = 0;
  let any = false;
  let saw = false;
  while (index < atoms.length) {
    const atom = atoms[index];
    if (atom.type === "sep" && STATEMENT_SEPS.has(atom.op)) {
      index += 1;
      continue;
    }
    if (atom.type === "sep") {
      index += 1;
      continue;
    }
    const result = statementCanFail(atoms, index);
    saw = true;
    if (result.canFail) any = true;
    index = result.next > index ? result.next : index + 1;
  }
  return saw && any;
}

function runSwallowsFailure(run) {
  if (!run) return false;
  const atoms = scanShell(run);
  if (!atoms.some((atom) => atom.type === "cmd")) return false;
  return !scriptCanFail(atoms);
}

function isAdvisory(chunk) {
  if (chunk.split("\n").some((line) => /^ {8}continue-on-error:\s*true\s*(?:#.*)?$/.test(line))) {
    return true;
  }
  return runSwallowsFailure(runBody(chunk));
}

/** Every `vp|pnpm|npm run <script>` in a step body, in first-seen order. */
export function invokedScripts(run) {
  if (!run) return [];
  const names = [];
  const seen = new Set();
  for (const atom of scanShell(run)) {
    if (atom.type !== "cmd") continue;
    const words = stripEnv(atom.words);
    if (words.length < 3 || !RUNNERS.has(words[0]) || words[1] !== "run") continue;
    const name = words[2];
    if (name.startsWith("-") || !SCRIPT_NAME.test(name) || seen.has(name)) continue;
    seen.add(name);
    names.push(name);
  }
  return names;
}

function commandText(words) {
  const stripped = stripEnv(words);
  const body = stripped[0] === "pnpm" && stripped[1] === "exec" ? stripped.slice(2) : stripped;
  if (body.length === 0) return null;
  return body.join(" ");
}

function shellCommands(run) {
  if (!run) return [];
  const commands = [];
  for (const atom of scanShell(run)) {
    if (atom.type !== "cmd") continue;
    const text = commandText(atom.words);
    if (text) commands.push(text);
  }
  return commands;
}

function legRunsStep(command, run) {
  const runCommands = shellCommands(run);
  if (runCommands.length === 0) return false;
  const scriptCommands = new Set(shellCommands(command));
  return runCommands.every((segment) => scriptCommands.has(segment));
}

function isPureAcknowledgement(run, invoked) {
  if (!run) return false;
  const commands = scanShell(run).filter((atom) => atom.type === "cmd");
  if (commands.length === 0) return false;
  const names = new Set(invoked);
  return commands.every((command) => {
    const words = stripEnv(command.words);
    return words.length === 3 && RUNNERS.has(words[0]) && words[1] === "run" && names.has(words[2]);
  });
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
    let index = 0;
    for (const chunk of job.slice(at + 1).split(/\n(?= {6}- )/)) {
      index += 1;
      const first = chunk.split("\n")[0] ?? "";
      const named = /^ {6}- name:\s*(.*?)\s*$/.exec(first);
      const name = named ? unquote(named[1]) : null;
      const idMatch = /^ {8}id:\s*(.+?)\s*$/m.exec(chunk);
      const id = idMatch ? unquote(idMatch[1]) : null;
      steps.push({
        jobId,
        jobName,
        name,
        key: name ? stepKey(jobName, name) : null,
        index,
        id,
        chunk,
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
 * only when its full step key is on the allowlist. Everything else is a gate.
 */
export function stepKind(step, plumbingKeys) {
  if (step.uses) return "plumbing";
  if (invokedScripts(step.runBody).length > 0) return "gate";
  if (step.key && plumbingKeys.includes(step.key)) return "plumbing";
  return "gate";
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
    for (const script of invokedScripts(command)) pending.push(script);
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
    const pure = isPureAcknowledgement(step.runBody, invoked);
    for (const script of invoked) {
      if (typeof scripts?.[script] !== "string") continue;
      if (reached.has(script)) {
        problems.push(
          `blocking step "${name}" runs "${script}", which ci:release-readiness reaches, but its leg is null`,
        );
      } else if (!pure) {
        problems.push(
          `blocking step "${name}" runs "${script}", which ci:release-readiness does not reach`,
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

function publishEnvBindings(chunk) {
  const lines = chunk.split("\n");
  const start = lines.findIndex((line) => /^ {8}env:\s*$/.test(line));
  if (start < 0) return [];
  const bindings = [];
  for (const line of lines.slice(start + 1)) {
    if (/^ {8}\S/.test(line)) break;
    const match = /^ {10}(O_[A-Z0-9_]+):\s*(.*?)\s*$/.exec(line);
    if (match) bindings.push({ name: match[1], value: match[2] });
  }
  return bindings;
}

function publishSummaryProblems(steps, plumbingKeys) {
  const summary = steps.find(
    (candidate) =>
      candidate.jobId === "certification-gates" && candidate.name === "Publish summary",
  );
  if (!summary) return [];
  const problems = [];
  const bindings = publishEnvBindings(summary.chunk);
  const rowNames = new Set(
    [...(summary.runBody ?? "").matchAll(/\$O_[A-Z0-9_]+/g)].map((match) => match[0].slice(1)),
  );
  const gates = steps.filter(
    (candidate) =>
      candidate.jobId === "certification-gates" &&
      candidate.name &&
      stepKind(candidate, plumbingKeys) === "gate",
  );
  for (const gate of gates) {
    if (!gate.id) {
      problems.push(
        `certification-gates step "${gate.name}" has no id, so Publish summary cannot name it`,
      );
    }
  }
  const seenEnv = new Set();
  const seenId = new Set();
  for (const binding of bindings) {
    if (seenEnv.has(binding.name)) {
      problems.push(`Publish summary binds $${binding.name} more than once`);
    }
    seenEnv.add(binding.name);
    const ref = STEP_REF.exec(binding.value);
    if (!ref) {
      problems.push(`Publish summary env ${binding.name} does not reference a step outcome`);
      continue;
    }
    if (seenId.has(ref[1])) {
      problems.push(`Publish summary binds step id "${ref[1]}" more than once`);
    }
    seenId.add(ref[1]);
  }
  for (const gate of gates) {
    if (!gate.id || seenId.has(gate.id)) continue;
    problems.push(
      `Publish summary does not bind certification-gates step "${gate.key}" (id ${gate.id})`,
    );
  }
  const gateIds = new Set(gates.filter((gate) => gate.id).map((gate) => gate.id));
  for (const id of seenId) {
    if (!gateIds.has(id)) {
      problems.push(`Publish summary binds step id "${id}" that is not a certification-gates gate`);
    }
  }
  for (const name of seenEnv) {
    if (!rowNames.has(name)) problems.push(`Publish summary binds $${name} but no row uses it`);
  }
  for (const name of rowNames) {
    if (!seenEnv.has(name)) {
      problems.push(`Publish summary row uses $${name} with no env binding`);
    }
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

  const allSteps = stepsIn(workflow);
  const blocking = allSteps.filter((step) => !step.advisory);
  if (blocking.length === 0) problems.push("certification-gates.yml has no blocking steps");
  const seen = new Set();
  const blockingKeys = new Set();
  for (const step of blocking) {
    if (!step.name || !step.key) {
      problems.push(`blocking step ${step.index} of ${step.jobId} (${step.jobName}) has no name`);
      continue;
    }
    blockingKeys.add(step.key);
    if (seen.has(step.key)) problems.push(`blocking step "${step.key}" is named more than once`);
    seen.add(step.key);
    if (!Object.hasOwn(entries, step.key)) {
      problems.push(`blocking step "${step.key}" has no entry in scripts/gate-coverage.json`);
    }
  }
  for (const name of plumbing) {
    const step = allSteps.find((candidate) => candidate.key === name);
    if (step?.uses) {
      problems.push(`plumbing name "${name}" is a uses: step, which is already plumbing`);
    }
    if (!blockingKeys.has(name)) {
      problems.push(`plumbing name "${name}" matches no blocking step`);
    }
  }

  const advisory = new Set(
    allSteps.filter((step) => step.advisory && step.key).map((step) => step.key),
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
  problems.push(...publishSummaryProblems(allSteps, plumbing));
  return problems;
}

export function coverageSentence(local, gates, plumbing) {
  return `ci:release-readiness runs ${local} of ${gates} blocking gate steps locally across the six Certification Gates jobs; the other ${gates - local} run only there; ${plumbing} steps are runner plumbing (scripts/gate-coverage.json)`;
}

/** Local, gate, and plumbing counts. Meaningful once findCoverageProblems is empty. */
export function countCoverage(workflow, coverage, scripts) {
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
    if (stepRunsLocally(leg, reached)) local += 1;
  }
  return { local, gates, plumbing };
}

// countCoverage runs only after findCoverageProblems is empty, so reached.has(leg) is the whole rule.
function stepRunsLocally(leg, reached) {
  return typeof leg === "string" && reached.has(leg);
}

export function findDocProblems(sentence, docs) {
  const problems = [];
  for (const file of SENTENCE_DOCS) {
    const text = docs?.[file];
    if (typeof text !== "string" || !text.includes(sentence)) {
      problems.push(`${file} does not contain the coverage sentence`);
      continue;
    }
    const matches = text.match(new RegExp(COVERAGE_SENTENCE_PATTERN, "g")) ?? [];
    if (matches.length > 1 || matches.some((match) => match !== sentence)) {
      problems.push(`${file} has a stale coverage sentence beside the current one`);
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
