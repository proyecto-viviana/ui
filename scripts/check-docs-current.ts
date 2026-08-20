/// <reference types="node" />

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { collectDocs } from "../apps/web/src/app/admin/server/data";
import { checkGeneratedWorkViews } from "./generate-work-views";

// docs:check — gate for the .claude/current spine. Every current doc must carry
// the status header, the ticket board must conform to the shared scheme, and
// generated work views must match that board. The same validator drives the
// /admin Home problems strip; see .claude/current/admin-dashboard.md.

const root = process.cwd();
const currentDir = path.join(root, ".claude", "current");

function toRepoPath(filePath: string): string {
  return path.relative(root, filePath).split(path.sep).join("/");
}

function walk(dir: string, files: string[] = []): string[] {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const fullPath = path.join(dir, entry);
    if (statSync(fullPath).isDirectory()) walk(fullPath, files);
    else files.push(fullPath);
  }
  return files;
}

const failures: string[] = [];
function fail(message: string): void {
  failures.push(message);
}

// Human-authored docs carry a visible "Status: live ..." header. Generated
// views carry "Status: generated ...". Both carry an "Update when: ..."
// header, so match by prefix, not exact text.
//
// Docs that frontmatter already marks as finished are exempt: an archived log or
// a completed plan has nothing to say about when to update it, and stamping one
// "Status: live" to satisfy the gate would make the header lie. The frontmatter
// `status:` is the authority on whether a doc is still live.
const FINISHED_STATUSES = new Set(["archived", "done", "superseded"]);

function frontmatterStatus(contents: string): string | null {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(contents);
  if (!match) return null;
  const status = /^status:\s*(\S+)\s*$/m.exec(match[1]);
  return status ? status[1] : null;
}

const currentMarkdown = walk(currentDir).filter((file) => file.endsWith(".md"));
for (const file of currentMarkdown) {
  const relative = toRepoPath(file);
  const contents = readFileSync(file, "utf8");
  const status = frontmatterStatus(contents);
  if (status && FINISHED_STATUSES.has(status)) continue;

  const lines = contents.split(/\r?\n/);
  const hasHeader =
    lines.some(
      (line) => line.startsWith("Status: live ") || line.startsWith("Status: generated "),
    ) && lines.some((line) => line.startsWith("Update when:"));
  if (!hasHeader) {
    fail(`Current doc lacks required status header: ${relative}`);
  }
}

// Ticket-board and stable-document integrity.
for (const problem of collectDocs().problems) {
  fail(`Tracking integrity: ${problem.doc}: ${problem.message}`);
}

for (const problem of checkGeneratedWorkViews()) fail(problem);

if (failures.length > 0) {
  console.error("docs:check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("docs:check passed");
