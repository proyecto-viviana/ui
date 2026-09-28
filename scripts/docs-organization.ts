/// <reference types="node" />

import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

export const LIVE_CURRENT_DOCS = [
  ".claude/current/README.md",
  ".claude/current/admin-dashboard.md",
  ".claude/current/architecture.md",
  ".claude/current/certification-debt.md",
  ".claude/current/certification.md",
  ".claude/current/glasselated-port.md",
  ".claude/current/glossary.md",
  ".claude/current/geist-experiment.md",
  ".claude/current/kumo-experiment.md",
  ".claude/current/parity-gaps.md",
  ".claude/current/release-policy.md",
  ".claude/current/roadmap.md",
  ".claude/current/status.md",
  ".claude/current/steering.md",
  ".claude/current/tooling.md",
  ".claude/current/upstream-sync.md",
  ".claude/current/wcag-258-target-size.md",
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

  failures.push(...checkTicketLocalPaths(root));
  failures.push(...checkStableClaims(root, expected));

  return failures;
}

const GENERATED_WORK_VIEWS = new Set([".claude/current/status.md", ".claude/current/roadmap.md"]);

const SOLID_POINTS_AT_SRC =
  /`solid`(?:\s+export condition)?\s+pointing at\s+`src`|`solid`\s+points at\s+`src`|points\s+`solid`\s+at\s+(?:compiled\s+)?`src`|point(?:s|ing)?\b[^.]{0,40}\bat\s+`src`/;

/**
 * Stable prose may describe current work. These are the shapes that went stale
 * while docs:check stayed green: the `solid` condition pointed at `src`,
 * source mappings "remain under audit", and a verified ticket still named as
 * remaining work.
 */
function checkStableClaims(root: string, liveDocs: Set<string>): string[] {
  const failures: string[] = [];
  const statusById = ticketStatusById(root);
  const files = [...liveDocs]
    .filter((relative) => !GENERATED_WORK_VIEWS.has(relative))
    .map((relative) => path.join(root, relative));
  const readme = path.join(root, "README.md");
  if (existsSync(readme)) files.push(readme);

  for (const file of files) {
    if (!existsSync(file)) continue;
    const relative = toRepoPath(root, file);
    const prose = readFileSync(file, "utf8").replace(/```[\s\S]*?```/g, " ");
    if (/mappings remain under audit/i.test(prose)) {
      failures.push(`Stale packaging claim in ${relative}: mappings remain under audit`);
    }
    for (const sentence of prose.replace(/\s+/g, " ").split(/(?<=[.!?])\s+/)) {
      if (SOLID_POINTS_AT_SRC.test(sentence) && /`solid`|\bsolid export\b/.test(sentence)) {
        failures.push(`Stale packaging claim in ${relative}: solid export points at src`);
      }
      for (const id of verifiedTicketsNamedAsRemainingWork(sentence, statusById)) {
        failures.push(
          `Stale work-state claim in ${relative}: verified ticket #${id} is named as remaining work`,
        );
      }
    }
  }

  return failures;
}

function ticketStatusById(root: string): Map<string, string> {
  const statuses = new Map<string, string>();
  const ticketsDir = path.join(root, ".claude", "tickets");
  for (const file of walk(ticketsDir).filter((entry) => entry.endsWith(".md"))) {
    const contents = readFileSync(file, "utf8");
    const id = frontmatterField(contents, "id");
    const status = frontmatterField(contents, "status");
    if (id && status) statuses.set(id, status);
  }
  return statuses;
}

function verifiedTicketsNamedAsRemainingWork(
  sentence: string,
  statusById: Map<string, string>,
): string[] {
  const ids = new Set<string>();
  for (const pattern of [
    /#(\d+)\b[\s\S]{0,160}?\btracks\b/g,
    /#(\d+)\b[\s\S]{0,160}?\bremaining\b/g,
    /\bremaining(?:-work| work)\b[\s\S]{0,160}?#(\d+)\b/g,
    /#(\d+)\b\s+is open\b/g,
  ]) {
    for (const match of sentence.matchAll(pattern)) {
      const id = match[1];
      if (id) ids.add(id);
    }
  }
  if (/\bwhile that (?:initiative|ticket) is open\b/i.test(sentence)) {
    for (const match of sentence.matchAll(/(?<!Rule )#(\d+)\b/g)) {
      const id = match[1];
      if (id) ids.add(id);
    }
  }
  return [...ids].filter((id) => statusById.get(id) === "verified").sort();
}

const CLAUDE_BACKTICK = /`(\.claude\/[^`]+)`/g;
const LINE_ANCHOR = /:\d+(?:-\d+)?$/;
const HISTORICAL_MARK = /^\s*\((?:deleted|retired|example)\)/;
const CONCRETE_CLAUDE_PATH = /^\.claude(?:\/[\w.+@=-]+)+\/?$/;

/**
 * A backtick or markdown path under `.claude/` is a claim that the file is
 * there. `(deleted)`, `(retired)`, and `(example)` immediately after the cite
 * keep a historical or illustrative mention without making that claim. Globs
 * and ellipsis abbreviations are not paths.
 */
function concreteClaudePath(token: string): string | null {
  const trimmed = token
    .trim()
    .replace(LINE_ANCHOR, "")
    .replace(/[.,);]+$/, "");
  if (!CONCRETE_CLAUDE_PATH.test(trimmed)) return null;
  if (trimmed.includes("...")) return null;
  return trimmed;
}

function citedClaudePaths(line: string, filePath: string, root: string): string[] {
  const cited = new Set<string>();

  for (const match of line.matchAll(CLAUDE_BACKTICK)) {
    const raw = match[1];
    if (!raw) continue;
    const after = line.slice((match.index ?? 0) + match[0].length);
    if (HISTORICAL_MARK.test(after)) continue;
    const concrete = concreteClaudePath(raw);
    if (concrete) cited.add(concrete);
  }

  for (const match of line.matchAll(MARKDOWN_LINK)) {
    const rawTarget = match[1] ?? match[2];
    if (!rawTarget || rawTarget.startsWith("#") || EXTERNAL_TARGET.test(rawTarget)) continue;
    const pathPart = rawTarget.split("#", 1)[0]?.split("?", 1)[0];
    if (!pathPart || !/^(?:\.|\.claude)|\/|\.claude\//.test(pathPart)) continue;
    if (/[*?<>]|\.\.\./.test(pathPart)) continue;
    const after = line.slice((match.index ?? 0) + match[0].length);
    if (HISTORICAL_MARK.test(after)) continue;

    let resolved: string;
    try {
      resolved = path.resolve(path.dirname(filePath), decodeURIComponent(pathPart));
    } catch {
      continue;
    }
    const repoPath = toRepoPath(root, resolved);
    if (repoPath.startsWith("..")) continue;
    const concrete = concreteClaudePath(repoPath);
    if (concrete) cited.add(concrete);
  }

  return [...cited];
}

function checkTicketLocalPaths(root: string): string[] {
  const failures: string[] = [];
  const ticketsDir = path.join(root, ".claude", "tickets");
  const ticketFiles = walk(ticketsDir)
    .filter((file) => file.endsWith(".md"))
    .sort();

  for (const file of ticketFiles) {
    const relative = toRepoPath(root, file);
    const lines = readFileSync(file, "utf8").split(/\r?\n/);
    for (let index = 0; index < lines.length; index++) {
      const line = lines[index] ?? "";
      for (const repoPath of citedClaudePaths(line, file, root)) {
        if (!existsSync(path.join(root, repoPath))) {
          failures.push(`Missing ticket path in ${relative}:${index + 1}: ${repoPath}`);
        }
      }
    }
  }

  return failures;
}
