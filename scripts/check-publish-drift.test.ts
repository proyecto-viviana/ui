import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { beforeEach, describe, expect, it } from "vite-plus/test";

const GUARD = join(import.meta.dirname, "check-publish-drift.mjs");

let root: string;

function git(...args: string[]): void {
  execFileSync("git", args, { cwd: root, encoding: "utf8" });
}

function writeManifest(exports: Record<string, string>): void {
  writeFileSync(
    join(root, "packages", "a", "package.json"),
    `${JSON.stringify({ name: "@scope/a", version: "1.0.0", exports }, null, 2)}\n`,
  );
}

function runGuard(): { status: number; output: string } {
  try {
    return { status: 0, output: execFileSync("node", [GUARD], { cwd: root, encoding: "utf8" }) };
  } catch (error) {
    const failure = error as { status: number; stdout: string; stderr: string };
    return { status: failure.status, output: `${failure.stdout}${failure.stderr}` };
  }
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "publish-drift-"));
  mkdirSync(join(root, "packages", "a", "src"), { recursive: true });
  mkdirSync(join(root, ".changeset"), { recursive: true });
  writeFileSync(join(root, ".changeset", "config.json"), JSON.stringify({ ignore: [] }));
  writeManifest({ ".": "./src/index.ts" });
  writeFileSync(join(root, "packages", "a", "src", "index.ts"), "export const a = 1;\n");
  // `changeset version` writes CHANGELOG.md; its last commit is the release boundary.
  writeFileSync(join(root, "packages", "a", "CHANGELOG.md"), "# @scope/a\n\n## 1.0.0\n");
  git("init", "-q", ".");
  git("config", "user.email", "test@example.com");
  git("config", "user.name", "test");
  git("add", "-A");
  git("commit", "-qm", "release 1.0.0");
});

describe("check-publish-drift", () => {
  it("passes a tree with nothing unreleased", () => {
    expect(runGuard().status).toBe(0);
  });

  it("fails a new exports subpath that no changeset publishes", () => {
    writeManifest({ ".": "./src/index.ts", "./extra": "./src/extra.ts" });
    git("add", "-A");
    git("commit", "-qm", "new subpath");
    const { status, output } = runGuard();
    expect(status).toBe(1);
    expect(output).toContain("packages/a/package.json");
  });

  it("passes that same subpath once a changeset names the package", () => {
    writeManifest({ ".": "./src/index.ts", "./extra": "./src/extra.ts" });
    writeFileSync(join(root, ".changeset", "extra.md"), '---\n"@scope/a": minor\n---\n\nsubpath\n');
    git("add", "-A");
    git("commit", "-qm", "new subpath with changeset");
    expect(runGuard().status).toBe(0);
  });

  it("still fails an unreleased source change", () => {
    writeFileSync(join(root, "packages", "a", "src", "index.ts"), "export const a = 2;\n");
    git("add", "-A");
    git("commit", "-qm", "source change");
    const { status, output } = runGuard();
    expect(status).toBe(1);
    expect(output).toContain("packages/a/src/index.ts");
  });
});
