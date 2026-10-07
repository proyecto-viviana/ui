/// <reference types="node" />

import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  generatedWorkViewsFromBoard,
  staleGeneratedViewMessage,
  type BoardEntry,
} from "./generate-work-views";

/**
 * #604. Runs after `vp staged`, never inside it: lint-staged's default
 * concurrency would read a ticket while `vp check --fix` rewrites it.
 * The index is the commit, so an unstaged ticket cannot change the verdict.
 */

const STATUS_VIEW = ".claude/current/status.md";
const ROADMAP_VIEW = ".claude/current/roadmap.md";
const GENERATED_VIEWS = [ROADMAP_VIEW, STATUS_VIEW] as const;
const GIT_MAX_BUFFER = 64 * 1024 * 1024;
const TICKET_TREE = /^\.claude\/tickets\/(tasks|initiatives|milestones)\/.+/;

function gitOutput(cwd: string, args: string[], input?: string): Buffer {
  const result = spawnSync("git", args, {
    cwd,
    input,
    maxBuffer: GIT_MAX_BUFFER,
    env: { ...process.env, GIT_OPTIONAL_LOCKS: "0" },
  });
  if (result.error) throw result.error;
  if (result.status !== 0) {
    const stderr = result.stderr?.toString("utf8").trim() ?? "";
    throw new Error(`git ${args.join(" ")} failed (${result.status ?? "signal"}): ${stderr}`);
  }
  return result.stdout ?? Buffer.alloc(0);
}

function nulSplit(buffer: Buffer): string[] {
  if (buffer.length === 0) return [];
  return buffer
    .toString("utf8")
    .split("\0")
    .filter((part) => part.length > 0);
}

function isWatched(filePath: string): boolean {
  return (
    filePath.startsWith(".claude/tickets/") || filePath === STATUS_VIEW || filePath === ROADMAP_VIEW
  );
}

function isCurrentMarkdown(filePath: string): boolean {
  return filePath.startsWith(".claude/current/") && filePath.endsWith(".md");
}

function readIndex(cwd: string, paths: string[]): Map<string, string> {
  const out = new Map<string, string>();
  if (paths.length === 0) return out;
  const buffer = gitOutput(
    cwd,
    ["cat-file", "--batch"],
    `${paths.map((filePath) => `:${filePath}`).join("\n")}\n`,
  );
  let offset = 0;
  for (const filePath of paths) {
    const headerEnd = buffer.indexOf(0x0a, offset);
    if (headerEnd < 0) throw new Error(`git cat-file: truncated header for ${filePath}`);
    const header = buffer.toString("utf8", offset, headerEnd);
    if (header.endsWith(" missing")) {
      throw new Error(`git cat-file: ${filePath} is missing from the index`);
    }
    const size = Number(header.slice(header.lastIndexOf(" ") + 1));
    if (!Number.isInteger(size) || size < 0) {
      throw new Error(`git cat-file: bad header for ${filePath}: ${header}`);
    }
    const start = headerEnd + 1;
    const end = start + size;
    if (end > buffer.length) throw new Error(`git cat-file: truncated blob for ${filePath}`);
    out.set(filePath, buffer.toString("utf8", start, end));
    if (buffer[end] !== 0x0a) throw new Error(`git cat-file: missing trailer for ${filePath}`);
    offset = end + 1;
  }
  if (offset !== buffer.length) throw new Error("git cat-file: trailing bytes");
  return out;
}

/** Stale generated views in the index, or an empty list when this commit leaves them alone. */
export function generatedViewFailures(cwd = process.cwd()): string[] {
  const staged = nulSplit(
    gitOutput(cwd, [
      "diff",
      "--cached",
      "--name-only",
      "-z",
      "--",
      ".claude/tickets",
      STATUS_VIEW,
      ROADMAP_VIEW,
    ]),
  );
  if (!staged.some(isWatched)) return [];

  const indexed = nulSplit(
    gitOutput(cwd, ["ls-files", "-z", "--", ".claude/tickets", ".claude/current"]),
  );
  const ticketPaths = indexed.filter((filePath) => TICKET_TREE.test(filePath));
  const currentPaths = indexed.filter(isCurrentMarkdown);
  const blobs = readIndex(cwd, [...ticketPaths, ...currentPaths]);
  const entry = (filePath: string): BoardEntry => {
    const content = blobs.get(filePath);
    if (content === undefined)
      throw new Error(`git cat-file: ${filePath} is missing from the index`);
    return { path: filePath, content };
  };
  const expected = generatedWorkViewsFromBoard({
    tickets: ticketPaths.map(entry),
    currentDocs: currentPaths.map(entry),
  });

  const failures: string[] = [];
  for (const relative of GENERATED_VIEWS) {
    if (blobs.get(relative) !== expected[relative])
      failures.push(staleGeneratedViewMessage(relative));
  }
  return failures;
}

function main(): void {
  let failures: string[];
  try {
    failures = generatedViewFailures();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("guard:generated-views refused this commit:");
    console.error(`- ${message}`);
    process.exit(1);
  }
  if (failures.length === 0) return;
  console.error("guard:generated-views refused this commit:");
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

if (path.resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) main();
