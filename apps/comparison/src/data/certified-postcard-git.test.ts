import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { beforeEach, describe, expect, it } from "vite-plus/test";
import {
  certifiedSuitePostcardCurrency,
  lastFullCertifiedSuiteRun,
} from "./certified-suite-evidence";
import { gitPostcardProbe } from "../../scripts/certified-postcard-git";

let root: string;

function git(cwd: string, ...args: string[]): string {
  return execFileSync(
    "git",
    ["-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false", ...args],
    { cwd, encoding: "utf8" },
  ).trim();
}

function commit(files: Record<string, string>): string {
  for (const [path, body] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true });
    writeFileSync(join(root, path), body);
  }
  git(root, "add", "-A");
  git(root, "commit", "-q", "-m", Object.keys(files).join(" "));
  return git(root, "rev-parse", "HEAD");
}

const currency = (revision: string, cwd = root) =>
  certifiedSuitePostcardCurrency(
    { ...lastFullCertifiedSuiteRun, revision },
    git(cwd, "rev-parse", "HEAD"),
    gitPostcardProbe(cwd),
  );

let recorded: string;

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "certified-postcard-"));
  git(root, "init", "-q", "-b", "main", ".");
  recorded = commit({
    "packages/p/src/a.ts": "1",
    "apps/comparison/e2e/a.spec.ts": "1",
    "docs/a.md": "1",
  });
});

describe("certified postcard currency against a real repository", () => {
  it("passes on the recorded commit, and after the commit that records it", () => {
    expect(currency(recorded)).toEqual({ current: true });
    commit({ "apps/comparison/src/data/certified-suite-evidence.ts": recorded });
    expect(currency(recorded)).toEqual({ current: true });
  });

  it("fails once a covered path moves past the postcard", () => {
    commit({ "packages/p/src/a.ts": "2" });
    expect(currency(recorded)).toEqual({
      current: false,
      reason: "1 certified path(s) changed since it: packages/p/src/a.ts",
    });
  });

  // Everything that turns a certified run into a verdict, one file per class.
  // The first version of this rule covered component source and fixtures only,
  // so every row but the waiver list passed a postcard that no longer spoke
  // for the run (#574, audit finding `r2-guards-1`).
  it.each([
    [
      "the merger whose exit code is the verdict",
      "apps/comparison/scripts/merge-certified-reports.ts",
    ],
    ["the shard check that reads the summary", "apps/comparison/scripts/check-certified-shard.ts"],
    ["the waiver list", "apps/comparison/e2e/certified-waivers.json"],
    ["the case floor the shards are held to", "scripts/check-certified-case-floor.mjs"],
    ["the runner's config", "apps/comparison/playwright.config.ts"],
    ["the app the fixtures are served from", "apps/comparison/astro.config.mjs"],
    ["the pinned upstream oracle", "apps/comparison/package.json"],
    ["the lockfile that resolves it", "pnpm-lock.yaml"],
    ["the build the packages are loaded through", "packages/p/vite.config.ts"],
    ["the workflow that shards the run", ".github/workflows/certification-gates.yml"],
  ])("fails once %s moves past the postcard", (_class, path) => {
    commit({ [path]: "2" });
    expect(currency(recorded)).toEqual({
      current: false,
      reason: `1 certified path(s) changed since it: ${path}`,
    });
  });

  // The reviewed exclusions, one file per line of the pathspec list. Each is a
  // path no step of the certified run reads.
  it.each([
    ["prose", "packages/p/README.md"],
    ["prose", "docs/a.md"],
    ["the board", ".claude/tickets/milestones/.gitkeep"],
    ["a receipt", ".agents/chain-walk/report.out.txt"],
    ["the docs site", "apps/web/src/routes/index.tsx"],
  ])("stays current when %s changes (%s)", (_class, path) => {
    commit({ [path]: "2" });
    expect(currency(recorded)).toEqual({ current: true });
  });

  it("fails for a revision off HEAD's history", () => {
    git(root, "checkout", "-q", "-b", "side");
    const side = commit({ "docs/b.md": "1" });
    git(root, "checkout", "-q", "main");
    expect(currency(side)).toMatchObject({
      current: false,
      reason: expect.stringContaining("not an ancestor"),
    });
  });

  it("fails, naming fetch-depth, in a shallow clone that lacks the revision", () => {
    commit({ "docs/a.md": "2" });
    const shallow = mkdtempSync(join(tmpdir(), "certified-postcard-shallow-"));
    git(shallow, "clone", "-q", "--depth", "1", `file://${root}`, ".");
    expect(currency(recorded, shallow)).toMatchObject({
      current: false,
      reason: expect.stringContaining("fetch-depth: 0"),
    });
  });
});
