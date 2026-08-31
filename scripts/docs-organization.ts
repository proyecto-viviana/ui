/// <reference types="node" />

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const LIVE_CURRENT_DOCS = [
  ".claude/current/README.md",
  ".claude/current/admin-dashboard.md",
  ".claude/current/architecture.md",
  ".claude/current/certification.md",
  ".claude/current/glasselated-port.md",
  ".claude/current/glossary.md",
  ".claude/current/kumo-experiment.md",
  ".claude/current/release-policy.md",
  ".claude/current/roadmap.md",
  ".claude/current/status.md",
  ".claude/current/steering.md",
  ".claude/current/tooling.md",
  ".claude/current/upstream-sync.md",
] as const;

const FINISHED_STATUSES = new Set(["archived", "done", "superseded"]);
const EXTERNAL_TARGET = /^(?:[a-z][a-z\d+.-]*:|\/\/)/i;
const MARKDOWN_LINK = /!?\[[^\]]*\]\(\s*(?:<([^>]+)>|([^\s)]+))(?:\s+[^)]*)?\)/g;

function toRepoPath(root: string, filePath: string): string {
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

function frontmatterField(contents: string, field: string): string | null {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(contents)?.[1];
  if (!frontmatter) return null;
  const value = new RegExp(`^${field}:\\s*["']?([^"'\\r\\n]+)["']?\\s*$`, "m").exec(
    frontmatter,
  )?.[1];
  return value?.trim() ?? null;
}

function localLinkTargets(filePath: string, contents: string): string[] {
  const targets: string[] = [];
  for (const match of contents.matchAll(MARKDOWN_LINK)) {
    const rawTarget = match[1] ?? match[2];
    if (!rawTarget || rawTarget.startsWith("#") || EXTERNAL_TARGET.test(rawTarget)) continue;

    const pathPart = rawTarget.split("#", 1)[0]?.split("?", 1)[0];
    if (!pathPart) continue;
    try {
      targets.push(path.resolve(path.dirname(filePath), decodeURIComponent(pathPart)));
    } catch {
      targets.push(path.resolve(path.dirname(filePath), pathPart));
    }
  }
  return targets;
}

function isActiveInternalPlan(relativePath: string, contents: string): boolean {
  if (relativePath.startsWith("docs/adr/")) return false;
  if (frontmatterField(contents, "kind") === "plan") return true;

  const filename = path.basename(relativePath);
  const planName = /(?:^|[-_])(plan|roadmap|work-queue|audit)(?:[-_.]|$)/i.test(filename);
  const activeMarker =
    /(?:^|\n)(?:\*\*)?Status:?(?:\*\*)?\s*(?:planned|open|active|in-progress)\b/i.test(contents) ||
    /^##\s+(?:The\s+)?Plan\s*$/im.test(contents);
  return planName && activeMarker;
}

export interface DocsOrganizationOptions {
  liveCurrentDocs?: readonly string[];
}

export function checkDocsOrganization(
  root: string,
  options: DocsOrganizationOptions = {},
): string[] {
  const failures: string[] = [];
  const expected = new Set(options.liveCurrentDocs ?? LIVE_CURRENT_DOCS);
  const currentDir = path.join(root, ".claude", "current");
  const currentMarkdown = walk(currentDir)
    .filter((file) => file.endsWith(".md"))
    .sort();

  for (const relative of expected) {
    if (!existsSync(path.join(root, relative))) {
      failures.push(`Live-document contract is missing ${relative}`);
    }
  }

  for (const file of currentMarkdown) {
    const relative = toRepoPath(root, file);
    const contents = readFileSync(file, "utf8");
    if (!expected.has(relative)) {
      failures.push(`Live-document contract does not allow ${relative}`);
    }

    const status = frontmatterField(contents, "status");
    if (status && FINISHED_STATUSES.has(status)) {
      failures.push(`Retired status ${status} is not allowed under .claude/current: ${relative}`);
    }

    const lines = contents.split(/\r?\n/);
    const hasHeader =
      lines.some(
        (line) => line.startsWith("Status: live ") || line.startsWith("Status: generated "),
      ) && lines.some((line) => line.startsWith("Update when:"));
    if (!hasHeader) {
      failures.push(`Current doc lacks required status header: ${relative}`);
    }

    for (const target of localLinkTargets(file, contents)) {
      if (!existsSync(target)) {
        failures.push(`Broken local link in ${relative}: ${toRepoPath(root, target)}`);
      }
    }
  }

  const indexPath = path.join(root, ".claude", "current", "README.md");
  if (existsSync(indexPath)) {
    const indexed = new Set(localLinkTargets(indexPath, readFileSync(indexPath, "utf8")));
    for (const relative of expected) {
      if (relative === ".claude/current/README.md") continue;
      if (!indexed.has(path.join(root, relative))) {
        failures.push(`Current-doc index does not link to ${relative}`);
      }
    }
  }

  const publicDocsDir = path.join(root, "docs");
  for (const file of walk(publicDocsDir).filter((entry) => entry.endsWith(".md"))) {
    const relative = toRepoPath(root, file);
    const contents = readFileSync(file, "utf8");
    if (isActiveInternalPlan(relative, contents)) {
      failures.push(`Active internal plan is not allowed under public docs: ${relative}`);
    }
  }

  return failures;
}
