import { spawnSync } from "node:child_process";
import {
  chmodSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readdirSync,
  realpathSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, delimiter, join } from "node:path";
import { afterEach, describe, expect, it } from "vite-plus/test";
import { generatedViewFailures } from "./guard-generated-views";
import {
  generatedWorkViews,
  generatedWorkViewsFromBoard,
  staleGeneratedViewMessage,
  type BoardEntry,
} from "./generate-work-views";

/**
 * #604: a commit that changes a rendered ticket field and leaves the generated
 * views behind is refused. The check reads the index after `vp staged`.
 */

const repoRoot = join(import.meta.dirname, "..");
const DATE = "2026-10-07";
const STATUS_VIEW = ".claude/current/status.md";
const ROADMAP_VIEW = ".claude/current/roadmap.md";
const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) rmSync(dir, { recursive: true, force: true });
});

function ticket(spec: {
  directory: "tasks" | "initiatives" | "milestones";
  id: number;
  slug: string;
  type: "task" | "initiative" | "milestone";
  title: string;
  titleStyle?: "single";
  parent?: number;
  status?: string;
  blocked?: boolean;
  note?: string;
  created?: string;
  history?: string;
}): BoardEntry {
  const status = spec.status ?? "open";
  const title = spec.titleStyle === "single" ? `'${spec.title}'` : `"${spec.title}"`;
  const history =
    spec.history ?? `  - { state: ${status}, at: ${DATE}, note: "${spec.note ?? "opened"}" }`;
  const lines = [
    "---",
    `id: ${spec.id}`,
    `type: ${spec.type}`,
    `title: ${title}`,
    `created: ${spec.created ?? DATE}`,
  ];
  if (spec.parent !== undefined) lines.push(`parent: ${spec.parent}`);
  if (spec.blocked) lines.push("blocked: true");
  lines.push(`status: ${status}`, "history:", history, "---", "", "## Scope", "", "Body.", "");
  return {
    path: `.claude/tickets/${spec.directory}/${spec.id}-${spec.slug}.md`,
    content: lines.join("\n"),
  };
}

function baseBoard(): BoardEntry[] {
  return [
    ticket({
      directory: "milestones",
      id: 1,
      slug: "a-milestone",
      type: "milestone",
      title: "Milestone",
    }),
    ticket({
      directory: "initiatives",
      id: 2,
      slug: "an-initiative",
      type: "initiative",
      title: "Initiative",
      parent: 1,
    }),
    ticket({ directory: "tasks", id: 3, slug: "a-task", type: "task", title: "Task", parent: 2 }),
    ticket({
      directory: "tasks",
      id: 4,
      slug: "another-task",
      type: "task",
      title: "Another task",
      parent: 2,
    }),
  ];
}

function replaceTicket(entries: BoardEntry[], id: number, next: BoardEntry): BoardEntry[] {
  const replaced = entries.map((entry) => (entry.path.includes(`/${id}-`) ? next : entry));
  expect(replaced).not.toEqual(entries);
  return replaced;
}

function viewsOf(tickets: BoardEntry[], currentDocs: BoardEntry[] = []): Record<string, string> {
  return generatedWorkViewsFromBoard({ tickets, currentDocs });
}

describe("generatedWorkViewsFromBoard", () => {
  it("holds the views still when a ticket is only respelt or its history changes", () => {
    const written = baseBoard();
    const respelt = replaceTicket(
      written,
      3,
      ticket({
        directory: "tasks",
        id: 3,
        slug: "a-task",
        type: "task",
        title: "Task",
        titleStyle: "single",
        parent: 2,
      }),
    );
    const history = replaceTicket(
      written,
      3,
      ticket({
        directory: "tasks",
        id: 3,
        slug: "a-task",
        type: "task",
        title: "Task",
        parent: 2,
        note: "reworded",
        created: "2026-09-21",
      }),
    );
    expect(viewsOf(respelt)).toEqual(viewsOf(written));
    expect(viewsOf(history)).toEqual(viewsOf(written));
    const roundTrip = viewsOf(
      written,
      Object.entries(viewsOf(written)).map(([path, content]) => ({ path, content })),
    );
    expect(roundTrip).toEqual(viewsOf(written));
  });

  it("moves both views when a rendered field changes", () => {
    const written = baseBoard();
    const cases = [
      ticket({
        directory: "tasks",
        id: 3,
        slug: "a-task",
        type: "task",
        title: "Task",
        parent: 2,
        status: "merged",
        history: `  - { state: open, at: ${DATE}, note: "opened" }\n  - { state: merged, at: ${DATE}, note: "landed" }`,
      }),
      ticket({
        directory: "tasks",
        id: 3,
        slug: "a-task",
        type: "task",
        title: "Renamed task",
        parent: 2,
      }),
      ticket({
        directory: "tasks",
        id: 3,
        slug: "a-task",
        type: "task",
        title: "Task",
        parent: 2,
        blocked: true,
      }),
      ticket({
        directory: "tasks",
        id: 3,
        slug: "a-task",
        type: "task",
        title: "Task",
        parent: 1,
      }),
    ];
    for (const next of cases) {
      const views = viewsOf(replaceTicket(written, 3, next));
      expect(views[STATUS_VIEW]).not.toBe(viewsOf(written)[STATUS_VIEW]);
      expect(views[ROADMAP_VIEW]).not.toBe(viewsOf(written)[ROADMAP_VIEW]);
    }
  });

  it("refuses an invalid board", () => {
    const missingMilestone = baseBoard().filter((entry) => !entry.path.includes("/milestones/"));
    expect(() => viewsOf(missingMilestone)).toThrow(/invalid board/);
    const keptEmpty = [
      ticket({
        directory: "initiatives",
        id: 2,
        slug: "an-initiative",
        type: "initiative",
        title: "Initiative",
      }),
      ticket({ directory: "tasks", id: 3, slug: "a-task", type: "task", title: "Task", parent: 2 }),
      { path: ".claude/tickets/milestones/.gitkeep", content: "" },
    ];
    expect(() => viewsOf(keptEmpty)).not.toThrow();
    expect(() =>
      viewsOf(baseBoard(), [{ path: ".claude/current/notes.md", content: "# Notes\n" }]),
    ).toThrow(/missing baseline frontmatter/);
  });

  it("matches generatedWorkViews on this checkout", { timeout: 30_000 }, () => {
    const readTree = (dir: string, markdownOnly: boolean): BoardEntry[] => {
      const out: BoardEntry[] = [];
      const walk = (absolute: string) => {
        for (const entry of readdirSync(absolute, { withFileTypes: true })) {
          const child = join(absolute, entry.name);
          if (entry.isDirectory()) walk(child);
          else if (entry.isFile() && (!markdownOnly || entry.name.endsWith(".md"))) {
            const relative = child.slice(repoRoot.length + 1);
            out.push({ path: relative, content: readFileSync(child, "utf8") });
          }
        }
      };
      walk(dir);
      return out;
    };
    const tickets = readTree(join(repoRoot, ".claude/tickets"), false).filter((entry) =>
      /^\.claude\/tickets\/(tasks|initiatives|milestones)\//.test(entry.path),
    );
    const currentDocs = readTree(join(repoRoot, ".claude/current"), true);
    expect(generatedWorkViewsFromBoard({ tickets, currentDocs })).toEqual(generatedWorkViews());
  });
});

describe("guard:generated-views", () => {
  it("is the command the pre-commit hook runs after vp staged", () => {
    expect(readFileSync(join(repoRoot, ".vite-hooks/pre-commit"), "utf8")).toBe(
      "vp staged\nvp run guard:generated-views\n",
    );
    const scripts = JSON.parse(readFileSync(join(repoRoot, "package.json"), "utf8"))
      .scripts as Record<string, string>;
    expect(scripts["guard:generated-views"]).toBe("vp exec tsx scripts/guard-generated-views.ts");
  });

  it("ignores an unstaged rendered-field edit", () => {
    const repo = makeRepo();
    writeEntries(repo, baseBoard());
    const task = join(repo, ".claude/tickets/tasks/4-another-task.md");
    writeFileSync(task, readFileSync(task, "utf8").replace("status: open", "status: merged"));
    writeFileSync(join(repo, "README.md"), "notes\n");
    git(repo, ["add", "--", "README.md"]);
    expect(withoutInheritedGit(() => generatedViewFailures(repo))).toEqual([]);
    const run = spawnSync(tsxBin(), [guardScript()], {
      cwd: repo,
      encoding: "utf8",
      env: gitEnv(),
    });
    expect(run.status).toBe(0);
    expect(run.stdout).toBe("");
    expect(run.stderr).toBe("");
  });

  it("refuses a rendered-field commit from a clean repository", { timeout: 120_000 }, () => {
    const repo = makeRepo();
    const tickets = baseBoard();
    writeEntries(repo, tickets);
    writeEntries(
      repo,
      Object.entries(viewsOf(tickets)).map(([path, content]) => ({ path, content })),
    );
    installHook(repo);
    git(repo, ["add", "--", ".claude"]);
    const first = commit(repo, "board");
    expect(first.status, first.stderr).toBe(0);

    const historyPath = ".claude/tickets/tasks/3-a-task.md";
    const statusPath = ".claude/tickets/tasks/4-another-task.md";
    writeFileSync(
      join(repo, historyPath),
      readFileSync(join(repo, historyPath), "utf8").replace('note: "opened"', 'note: "reworded"'),
    );
    writeFileSync(
      join(repo, statusPath),
      readFileSync(join(repo, statusPath), "utf8")
        .replace("status: open", "status: merged")
        .replace(
          'history:\n  - { state: open, at: 2026-10-07, note: "opened" }',
          'history:\n  - { state: open, at: 2026-10-07, note: "opened" }\n  - { state: merged, at: 2026-10-07, note: "landed" }',
        ),
    );
    writeFileSync(join(repo, "notes.txt"), "unstaged\n");
    git(repo, ["add", "--", historyPath]);
    const historyCommit = commit(repo, "history");
    expect(historyCommit.status, `${historyCommit.stdout}\n${historyCommit.stderr}`).toBe(0);
    expect(git(repo, ["show", `HEAD:${statusPath}`]).stdout).toContain("status: open");
    expect(readFileSync(join(repo, statusPath), "utf8")).toContain("status: merged");

    git(repo, ["add", "--", statusPath]);
    expect(withoutInheritedGit(() => generatedViewFailures(repo))).toEqual([
      staleGeneratedViewMessage(ROADMAP_VIEW),
      staleGeneratedViewMessage(STATUS_VIEW),
    ]);
    const head = git(repo, ["rev-parse", "HEAD"]).stdout.trim();
    const refused = commit(repo, "status");
    const output = `${refused.stdout}\n${refused.stderr}`;
    expect(refused.status, output).toBe(1);
    expect(output).toContain("guard:generated-views refused this commit:");
    expect(output).toContain(staleGeneratedViewMessage(STATUS_VIEW));
    expect(output).toContain(staleGeneratedViewMessage(ROADMAP_VIEW));
    expect(git(repo, ["rev-parse", "HEAD"]).stdout.trim()).toBe(head);

    const stagedTickets = readIndexTickets(repo);
    writeEntries(
      repo,
      Object.entries(viewsOf(stagedTickets)).map(([path, content]) => ({ path, content })),
    );
    git(repo, ["add", "--", statusPath, STATUS_VIEW, ROADMAP_VIEW]);
    const regenerated = commit(repo, "views");
    expect(regenerated.status, `${regenerated.stdout}\n${regenerated.stderr}`).toBe(0);
  });
});

function makeRepo(): string {
  const repo = mkdtempSync(join(realpathSync(tmpdir()), "guard-generated-views-"));
  tempDirs.push(repo);
  git(repo, ["init", "-b", "main"]);
  git(repo, ["config", "core.hooksPath", join(repo, ".git/hooks")]);
  return repo;
}

function writeEntries(repo: string, entries: BoardEntry[]): void {
  for (const entry of entries) {
    const absolute = join(repo, entry.path);
    mkdirSync(dirname(absolute), { recursive: true });
    writeFileSync(absolute, entry.content);
  }
}

const GIT_ENV_KEYS = ["GIT_DIR", "GIT_WORK_TREE", "GIT_INDEX_FILE", "GIT_PREFIX"] as const;

function gitEnv(extra: NodeJS.ProcessEnv = {}): NodeJS.ProcessEnv {
  const env: NodeJS.ProcessEnv = { ...process.env, ...extra };
  for (const key of GIT_ENV_KEYS) delete env[key];
  return env;
}

function withoutInheritedGit<T>(run: () => T): T {
  const saved = GIT_ENV_KEYS.map((key) => [key, process.env[key]] as const);
  for (const key of GIT_ENV_KEYS) delete process.env[key];
  try {
    return run();
  } finally {
    for (const [key, value] of saved) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

function git(
  repo: string,
  args: string[],
): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(
    "git",
    ["-c", "user.name=Viviana", "-c", "user.email=viviana@example.com", ...args],
    {
      cwd: repo,
      encoding: "utf8",
      env: gitEnv(),
    },
  );
  if (result.error) throw result.error;
  if (result.status !== 0) {
    throw new Error(
      `git ${args.join(" ")} failed (${result.status ?? "signal"}): ${result.stderr ?? ""}`,
    );
  }
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function commit(
  repo: string,
  message: string,
): { status: number | null; stdout: string; stderr: string } {
  const result = spawnSync(
    "git",
    ["-c", "user.name=Viviana", "-c", "user.email=viviana@example.com", "commit", "-m", message],
    {
      cwd: repo,
      encoding: "utf8",
      env: gitEnv({
        PATH: `${join(repo, "bin")}${delimiter}${process.env.PATH ?? ""}`,
      }),
    },
  );
  return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
}

function shellQuote(value: string): string {
  return `'${value.replaceAll("'", `'\\''`)}'`;
}

function tsxBin(): string {
  return join(repoRoot, "node_modules/.bin/tsx");
}

function guardScript(): string {
  return join(repoRoot, "scripts/guard-generated-views.ts");
}

function installHook(repo: string): void {
  const bin = join(repo, "bin");
  mkdirSync(bin, { recursive: true });
  writeFileSync(
    join(bin, "vp"),
    `#!/bin/sh
if [ "$1" = "staged" ]; then
  exit 0
fi
if [ "$1" = "run" ] && [ "$2" = "guard:generated-views" ]; then
  exec ${shellQuote(tsxBin())} ${shellQuote(guardScript())}
fi
printf 'unexpected: vp %s\\n' "$*" >&2
exit 1
`,
    { mode: 0o755 },
  );
  chmodSync(join(bin, "vp"), 0o755);
  writeFileSync(
    join(repo, ".git/hooks/pre-commit"),
    `#!/bin/sh
set -e
vp staged
vp run guard:generated-views
`,
    { mode: 0o755 },
  );
  chmodSync(join(repo, ".git/hooks/pre-commit"), 0o755);
}

function readIndexTickets(repo: string): BoardEntry[] {
  return baseBoard().map((entry) => ({
    path: entry.path,
    content: git(repo, ["show", `:${entry.path}`]).stdout,
  }));
}
