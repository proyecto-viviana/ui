import { execFileSync } from "node:child_process";
import {
  existsSync,
  readFileSync,
  readdirSync,
  realpathSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parse as parseYaml } from "yaml";
import { splitFrontmatter } from "./frontmatter";
import {
  TICKET_DIRECTORIES,
  type Problem,
  type WorkTicket,
  isTicketPath,
  parseTicket,
  validateTicketBoard,
} from "./tickets";
import { validateStableDocs } from "./validate";

// Filesystem/git/workspace access for the dev-only /admin API. Paths are
// repo-root-relative throughout. Dev tooling — see the AGENTS.md exemption.

// The dev server runs from apps/web, so cwd is not the repo root. Climb until we
// find the pnpm workspace manifest (check-docs-current.ts runs from the root, so
// it resolves on the first hop).
function findRepoRoot(start: string): string {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, "pnpm-workspace.yaml"))) return dir;
    const parent = dirname(dir);
    if (parent === dir) return start;
    dir = parent;
  }
}

const REPO_ROOT = findRepoRoot(process.cwd());

const READABLE_PREFIXES = [
  ".claude/current/",
  ".claude/research/",
  ".claude/archive/",
  ".claude/tickets/",
];
const READABLE_FILES = ["README.md", "AGENTS.md", "CLAUDE.md"];
const GENERATED_VIEW_PATHS = new Set([".claude/current/roadmap.md", ".claude/current/status.md"]);

export function isReadablePath(path: string): boolean {
  if (!path.endsWith(".md") || path.includes("..") || path.startsWith("/")) return false;
  return (
    READABLE_FILES.includes(path) || READABLE_PREFIXES.some((prefix) => path.startsWith(prefix))
  );
}

export function isWritablePath(path: string): boolean {
  return (
    isReadablePath(path) &&
    !GENERATED_VIEW_PATHS.has(path) &&
    (path.startsWith(".claude/current/") || isTicketPath(path))
  );
}

/** Resolves a repo-relative doc path to an absolute one, or null if it escapes the repo. */
export function resolveDocPath(path: string): string | null {
  if (!isReadablePath(path)) return null;
  const absolute = resolve(REPO_ROOT, path);
  try {
    const real = realpathSync(absolute);
    if (real !== absolute || !real.startsWith(realpathSync(REPO_ROOT) + "/")) return null;
    return real;
  } catch {
    return null;
  }
}

export function readDoc(path: string): string | null {
  const absolute = resolveDocPath(path);
  if (!absolute) return null;
  try {
    return readFileSync(absolute, "utf-8");
  } catch {
    return null;
  }
}

export function writeDoc(path: string, content: string): boolean {
  if (!isWritablePath(path)) return false;
  const absolute = resolveDocPath(path);
  if (!absolute) return false;
  writeFileSync(absolute, content);
  return true;
}

export interface DocEntry {
  path: string;
  tier: "current" | "ticket" | "research" | "archive" | "repo";
  writable: boolean;
  title: string;
  frontmatter: Record<string, unknown> | null;
}

export interface DocsPayload {
  docs: DocEntry[];
  tasks: WorkTicket[];
  roadmap: WorkTicket[];
  problems: Problem[];
}

function walkMarkdown(dir: string, out: string[]): void {
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) walkMarkdown(path, out);
    else if (entry.isFile() && entry.name.endsWith(".md")) out.push(path);
  }
}

function firstHeading(body: string): string | null {
  const match = /^#\s+(.+)$/m.exec(body);
  return match ? match[1].trim() : null;
}

export function collectDocs(): DocsPayload {
  const docs: DocEntry[] = [];
  const tickets: WorkTicket[] = [];
  const ticketProblems: Problem[] = [];
  const presentTicketDirectories = new Set<string>();

  const tiers: { tier: DocEntry["tier"]; root: string }[] = [
    { tier: "current", root: ".claude/current" },
    { tier: "research", root: ".claude/research" },
    { tier: "archive", root: ".claude/archive" },
  ];

  for (const { tier, root } of tiers) {
    const absolutePaths: string[] = [];
    walkMarkdown(join(REPO_ROOT, root), absolutePaths);
    for (const absolute of absolutePaths.sort()) {
      const path = absolute.slice(REPO_ROOT.length + 1);
      const writable = tier === "current" && isWritablePath(path);
      // Current docs carry metadata even when a generated view is read-only.
      // Research and archive docs are browse-only.
      if (tier !== "current") {
        docs.push({ path, tier, writable, title: path.slice(root.length + 1), frontmatter: null });
        continue;
      }
      let content: string;
      try {
        content = readFileSync(absolute, "utf-8");
      } catch {
        continue;
      }
      const { data, body } = splitFrontmatter(content);
      docs.push({
        path,
        tier,
        writable,
        title: firstHeading(body) ?? path.slice(root.length + 1),
        frontmatter: data,
      });
    }
  }

  for (const directory of TICKET_DIRECTORIES) {
    const root = `.claude/tickets/${directory}`;
    const absoluteRoot = join(REPO_ROOT, root);
    try {
      if (!statSync(absoluteRoot).isDirectory()) continue;
      presentTicketDirectories.add(directory);
    } catch {
      continue;
    }

    const absolutePaths: string[] = [];
    walkMarkdown(absoluteRoot, absolutePaths);
    for (const absolute of absolutePaths.sort()) {
      const path = absolute.slice(REPO_ROOT.length + 1);
      let content: string;
      try {
        content = readFileSync(absolute, "utf-8");
      } catch {
        continue;
      }
      const { data, body } = splitFrontmatter(content);
      const parsed = parseTicket(content, path);
      docs.push({
        path,
        tier: "ticket",
        writable: true,
        title: parsed.ticket?.title ?? firstHeading(body) ?? path.slice(root.length + 1),
        frontmatter: data,
      });
      if (parsed.ticket) tickets.push(parsed.ticket);
      ticketProblems.push(...parsed.problems);
    }
  }

  for (const file of READABLE_FILES) {
    try {
      statSync(join(REPO_ROOT, file));
      docs.push({ path: file, tier: "repo", writable: false, title: file, frontmatter: null });
    } catch {
      // absent repo doc
    }
  }

  const problems = [
    ...validateStableDocs(docs, true),
    ...validateTicketBoard(tickets, ticketProblems, presentTicketDirectories),
  ];
  return {
    docs,
    tasks: tickets.filter((ticket) => ticket.type === "task"),
    roadmap: tickets.filter((ticket) => ticket.type !== "task"),
    problems,
  };
}

export interface GitPayload {
  recent: { hash: string; date: string; subject: string }[];
  docDates: Record<string, string>;
}

function git(args: string[]): string {
  return execFileSync("git", args, {
    cwd: REPO_ROOT,
    encoding: "utf-8",
    maxBuffer: 16 * 1024 * 1024,
  });
}

export function collectGit(): GitPayload {
  const recent = git(["log", "-n", "30", "--pretty=format:%h\t%cs\t%s"])
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      const [hash, date, ...subject] = line.split("\t");
      return { hash, date, subject: subject.join("\t") };
    });

  // One pass over recent history; the first commit a path appears in is its
  // last-modified date. Date lines carry an @ marker to distinguish them from
  // the --name-only path lines.
  const docDates: Record<string, string> = {};
  let currentDate = "";
  const log = git([
    "log",
    "-n",
    "500",
    "--pretty=format:@%cs",
    "--name-only",
    "--",
    ".claude/current",
    ".claude/tickets",
    "README.md",
    "AGENTS.md",
  ]);
  for (const line of log.split("\n")) {
    if (line.startsWith("@")) currentDate = line.slice(1);
    else if (line && !(line in docDates)) docDates[line] = currentDate;
  }

  return { recent, docDates };
}

export interface PackageInfo {
  name: string;
  description: string | null;
  manifestDir: string;
  deps: string[];
}

let packagesCache: PackageInfo[] | null = null;

/** Expands the pnpm-workspace.yaml globs to the package directories they match. */
function workspaceDirs(): string[] {
  let globs: string[] = [];
  try {
    const parsed = parseYaml(readFileSync(join(REPO_ROOT, "pnpm-workspace.yaml"), "utf-8")) as {
      packages?: unknown;
    };
    if (Array.isArray(parsed?.packages)) {
      globs = parsed.packages.filter((entry): entry is string => typeof entry === "string");
    }
  } catch {
    return [];
  }
  const dirs: string[] = [];
  for (const glob of globs) {
    if (glob.endsWith("/*")) {
      const base = glob.slice(0, -2);
      let entries;
      try {
        entries = readdirSync(join(REPO_ROOT, base), { withFileTypes: true });
      } catch {
        continue;
      }
      for (const entry of entries) if (entry.isDirectory()) dirs.push(`${base}/${entry.name}`);
    } else {
      dirs.push(glob);
    }
  }
  return dirs;
}

/** The workspace dependency graph (internal deps only), for the Architecture panel. */
export function collectPackages(): PackageInfo[] {
  if (packagesCache) return packagesCache;
  const manifests: { dir: string; pkg: Record<string, unknown> }[] = [];
  for (const dir of workspaceDirs()) {
    try {
      const pkg = JSON.parse(readFileSync(join(REPO_ROOT, dir, "package.json"), "utf-8")) as Record<
        string,
        unknown
      >;
      if (typeof pkg.name === "string") manifests.push({ dir, pkg });
    } catch {
      // no manifest in this dir
    }
  }
  const names = new Set(manifests.map((entry) => entry.pkg.name as string));
  packagesCache = manifests
    .map(({ dir, pkg }) => {
      const allDeps = {
        ...((pkg.dependencies as Record<string, string> | undefined) ?? {}),
        ...((pkg.devDependencies as Record<string, string> | undefined) ?? {}),
      };
      return {
        name: pkg.name as string,
        description: typeof pkg.description === "string" ? pkg.description : null,
        manifestDir: dir,
        deps: Object.keys(allDeps).filter((dep) => names.has(dep)),
      };
    })
    .sort((a, b) => a.name.localeCompare(b.name));
  return packagesCache;
}

export function today(): string {
  return new Date().toISOString().slice(0, 10);
}
