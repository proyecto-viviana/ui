/// <reference types="node" />

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { collectDocs } from "../apps/web/src/app/admin/server/data";

// docs:check — gate for the .claude/current spine. Every current doc must carry
// the status header, and the tracking model (roadmap items <-> tasks) must be
// internally consistent. The same validator drives the /admin Home problems
// strip; see .claude/current/admin-dashboard.md.

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

// Spine docs carry a visible status header ("Status: live ...") and a colon
// update header ("Update when: ..."), so match by prefix, not exact line.
const currentMarkdown = walk(currentDir).filter((file) => file.endsWith(".md"));
for (const file of currentMarkdown) {
  const relative = toRepoPath(file);
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  const hasHeader =
    lines.some((line) => line.startsWith("Status: live ")) &&
    lines.some((line) => line.startsWith("Update when:"));
  if (!hasHeader) {
    fail(`Current doc lacks required status header: ${relative}`);
  }
}

// Tracking integrity: tasks must link to real roadmap items, done <=> finished,
// in-progress items must have tasks.
for (const problem of collectDocs().problems) {
  fail(`Tracking integrity: ${problem.doc}: ${problem.message}`);
}

if (failures.length > 0) {
  console.error("docs:check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log("docs:check passed");
