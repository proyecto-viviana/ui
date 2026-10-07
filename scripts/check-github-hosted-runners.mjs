#!/usr/bin/env node

/**
 * Fails when CI leaves GitHub's runners.
 *
 * Owner 2026-09-20 (#551): no Blacksmith at all, only GitHub-hosted runners
 * and local checks. That supersedes #140's acceptance of Blacksmith for
 * evidence jobs. A `runs-on` label GitHub does not document is either
 * self-hosted or a third-party runner, and a workflow that merely mentions
 * Blacksmith is the same decision creeping back through a comment.
 *
 * The allowlist is the workflow labels on GitHub's hosted-runner and macOS
 * larger-runner pages. An org-named larger-runner pool is not in it: the
 * name is chosen locally and looks the same as a self-hosted label. Bump
 * the set when GitHub publishes a label.
 */

import { readdirSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
export const WORKFLOW_DIR = join(HERE, "..", ".github", "workflows");

/** Labels GitHub documents for its own runners, standard and macOS larger. */
export const GITHUB_HOSTED_RUNNERS = new Set([
  "ubuntu-slim",
  "ubuntu-latest",
  "ubuntu-22.04",
  "ubuntu-24.04",
  "ubuntu-26.04",
  "ubuntu-22.04-arm",
  "ubuntu-24.04-arm",
  "ubuntu-26.04-arm",
  "windows-latest",
  "windows-2022",
  "windows-2025",
  "windows-2025-vs2026",
  "windows-11-arm",
  "windows-11-vs2026-arm",
  "macos-14",
  "macos-14-large",
  "macos-14-xlarge",
  "macos-15",
  "macos-15-intel",
  "macos-15-large",
  "macos-15-xlarge",
  "macos-26",
  "macos-26-intel",
  "macos-26-large",
  "macos-26-xlarge",
  "macos-latest",
  "macos-latest-large",
  "macos-latest-xlarge",
  "xcode-27",
  "xcode-27-xlarge",
]);

const BLOCK_MARKERS = new Set(["", "|", ">", "|-", ">-", "|+", ">+"]);

function stripComment(value) {
  let quote = null;
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (quote) {
      if (ch === quote) quote = null;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === "#" && (i === 0 || /\s/.test(value[i - 1]))) return value.slice(0, i).trim();
  }
  return value.trim();
}

function unquote(value) {
  const trimmed = stripComment(value);
  if (
    trimmed.length >= 2 &&
    ((trimmed.startsWith('"') && trimmed.endsWith('"')) ||
      (trimmed.startsWith("'") && trimmed.endsWith("'")))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function flowLabels(value) {
  const inner = value.slice(1, -1).trim();
  if (inner === "") return [];
  return inner
    .split(",")
    .map((part) => unquote(part))
    .filter((part) => part !== "");
}

function jobSpans(lines) {
  const jobsAt = lines.findIndex((line) => /^jobs:\s*(?:#.*)?$/.test(line));
  if (jobsAt < 0) return [];
  const starts = [];
  for (let i = jobsAt + 1; i < lines.length; i++) {
    const match = /^ {2}([A-Za-z0-9_-]+):\s*(?:#.*)?$/.exec(lines[i]);
    if (match) starts.push({ id: match[1], start: i });
  }
  return starts.map((span, index) => ({
    ...span,
    end: index + 1 < starts.length ? starts[index + 1].start : lines.length,
  }));
}

function blockEntries(lines, headerIndex) {
  const entries = [];
  for (let i = headerIndex + 1; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === "" || /^\s*#/.test(line)) continue;
    const indent = /^ */.exec(line)[0].length;
    if (indent <= 4) break;
    entries.push({ line, number: i + 1, indent });
  }
  return entries;
}

function readRunsOn(lines, index) {
  const header = /^ {4}runs-on:\s*(.*)$/.exec(lines[index]);
  const raw = stripComment(header[1]);
  if (!BLOCK_MARKERS.has(raw)) {
    if (raw.startsWith("[") && raw.endsWith("]")) {
      return {
        labels: flowLabels(raw).map((label) => ({ label, number: index + 1 })),
        group: null,
      };
    }
    return { labels: [{ label: unquote(header[1]), number: index + 1 }], group: null };
  }

  const labels = [];
  let group = null;
  for (const entry of blockEntries(lines, index)) {
    if (entry.indent === 6 && entry.line.trimStart().startsWith("- ")) {
      labels.push({ label: unquote(entry.line.trim().slice(2)), number: entry.number });
      continue;
    }
    const key = /^ {6}([A-Za-z0-9_-]+):\s*(.*)$/.exec(entry.line);
    if (key && entry.indent === 6) {
      const name = key[1];
      const value = key[2];
      if (name === "group") {
        group = { value: unquote(value), number: entry.number };
        continue;
      }
      if (name === "labels") {
        const stripped = stripComment(value);
        if (BLOCK_MARKERS.has(stripped)) continue;
        const parsed =
          stripped.startsWith("[") && stripped.endsWith("]")
            ? flowLabels(stripped)
            : [unquote(value)];
        for (const label of parsed) labels.push({ label, number: entry.number });
        continue;
      }
      labels.push({ label: name, number: entry.number, unknown: name });
      continue;
    }
    if (entry.indent >= 8 && entry.line.trimStart().startsWith("- ")) {
      labels.push({ label: unquote(entry.line.trim().slice(2)), number: entry.number });
      continue;
    }
    labels.push({ label: entry.line.trim(), number: entry.number, unreadable: true });
  }
  return { labels, group };
}

function judgeLabel(file, number, label) {
  if (label.includes("${{")) {
    return `${file}:${number}: runs-on ${label} is an expression, not a GitHub-hosted label.`;
  }
  if (GITHUB_HOSTED_RUNNERS.has(label)) return null;
  return `${file}:${number}: runs-on names ${label}, which is not a GitHub-hosted runner.`;
}

/** One problem per Blacksmith reference or non-GitHub-hosted `runs-on`. */
export function findRunnerProblems(file, source) {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const problems = [];
  lines.forEach((line, index) => {
    if (/blacksmith/i.test(line)) {
      problems.push(
        `${file}:${index + 1}: references Blacksmith — CI runs on GitHub-hosted runners only.`,
      );
    }
  });

  for (const span of jobSpans(lines)) {
    let runsOnAt = -1;
    for (let i = span.start + 1; i < span.end; i++) {
      if (/^ {4}runs-on:/.test(lines[i])) {
        runsOnAt = i;
        break;
      }
    }
    if (runsOnAt < 0) {
      problems.push(
        `${file}:${span.start + 1}: job ${span.id} has no runs-on — name a GitHub-hosted runner.`,
      );
      continue;
    }
    const read = readRunsOn(lines, runsOnAt);
    if (read.group) {
      const name = read.group.value === "" ? "(empty)" : read.group.value;
      problems.push(
        `${file}:${read.group.number}: runs-on group ${name} is not a GitHub-hosted label.`,
      );
    }
    if (read.labels.length === 0 && !read.group) {
      problems.push(
        `${file}:${runsOnAt + 1}: runs-on names no runner — name a GitHub-hosted label.`,
      );
      continue;
    }
    for (const entry of read.labels) {
      if (entry.unknown) {
        problems.push(
          `${file}:${entry.number}: runs-on key ${entry.unknown} is not a GitHub-hosted label.`,
        );
        continue;
      }
      if (entry.unreadable) {
        problems.push(
          `${file}:${entry.number}: runs-on ${entry.label} is not a GitHub-hosted label.`,
        );
        continue;
      }
      const problem = judgeLabel(file, entry.number, entry.label);
      if (problem) problems.push(problem);
    }
  }
  return problems;
}

export function checkGithubHostedRunners(dir = WORKFLOW_DIR) {
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".yml") || name.endsWith(".yaml"))
    .sort();
  const problems = files.flatMap((name) =>
    findRunnerProblems(join(".github/workflows", name), readFileSync(join(dir, name), "utf8")),
  );

  if (problems.length > 0) {
    console.error("Workflows leave GitHub-hosted runners:");
    for (const problem of problems) console.error(`  ${problem}`);
    return 1;
  }
  console.log(
    `github-hosted runners: ${files.length} workflows, every runs-on is a GitHub-hosted label.`,
  );
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(checkGithubHostedRunners());
}
