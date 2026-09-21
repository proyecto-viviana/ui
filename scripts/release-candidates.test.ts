import { execFileSync } from "node:child_process";
import { mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";

// @ts-expect-error — plain-JS guard, no types
import { pendingChangesetPackages, releasablePackages } from "./release-candidates.mjs";

function fixture(
  packages: {
    dir: string;
    name: string;
    version: string;
    private?: boolean;
    files?: string[];
  }[],
  ignore: string[] = [],
  changesets: string[] = [],
): string {
  const root = mkdtempSync(join(tmpdir(), "release-candidates-"));
  mkdirSync(join(root, ".changeset"), { recursive: true });
  writeFileSync(join(root, ".changeset", "config.json"), JSON.stringify({ ignore }));
  changesets.forEach((body, index) => {
    writeFileSync(join(root, ".changeset", `c${index}.md`), body);
  });
  for (const pkg of packages) {
    mkdirSync(join(root, "packages", pkg.dir), { recursive: true });
    writeFileSync(
      join(root, "packages", pkg.dir, "package.json"),
      JSON.stringify({
        name: pkg.name,
        version: pkg.version,
        private: pkg.private,
        files: pkg.files,
      }),
    );
  }
  return root;
}

describe("releasablePackages", () => {
  it("takes every non-private, non-ignored package from the tree", () => {
    const root = fixture(
      [
        { dir: "a", name: "@scope/a", version: "1.0.0" },
        { dir: "b", name: "@scope/b", version: "0.1.0", private: true },
        { dir: "c", name: "@scope/c", version: "0.0.0" },
      ],
      ["@scope/c"],
    );
    expect(releasablePackages(root)).toEqual([
      {
        dir: "a",
        manifest: "packages/a/package.json",
        name: "@scope/a",
        version: "1.0.0",
        files: null,
        private: false,
      },
    ]);
  });

  // What the tarball carries is the manifest's own answer, not a list a guard
  // remembers: `check-publish-drift.mjs` diffs these paths (#598 review).
  it("carries each manifest's own published-file list", () => {
    const root = fixture([
      { dir: "a", name: "@scope/a", version: "1.0.0", files: ["dist", "src", "NOTICE"] },
    ]);
    expect(releasablePackages(root).map((pkg: { files: string[] | null }) => pkg.files)).toEqual([
      ["dist", "src", "NOTICE"],
    ]);
  });

  it("ignores a directory that carries no manifest", () => {
    const root = fixture([{ dir: "a", name: "@scope/a", version: "1.0.0" }]);
    mkdirSync(join(root, "packages", "stray"));
    expect(releasablePackages(root).map((pkg: { name: string }) => pkg.name)).toEqual(["@scope/a"]);
  });
});

describe("pendingChangesetPackages", () => {
  it("names every package a pending changeset bumps", () => {
    const root = fixture(
      [{ dir: "a", name: "@scope/a", version: "1.0.0" }],
      [],
      ['---\n"@scope/a": patch\n"@scope/b": minor\n---\n\nwork\n'],
    );
    expect([...pendingChangesetPackages(root)].sort()).toEqual(["@scope/a", "@scope/b"]);
  });

  it("is empty when nothing is pending", () => {
    expect([...pendingChangesetPackages(fixture([]))]).toEqual([]);
  });
});

const GUARD = join(import.meta.dirname, "check-release-prerequisites.mjs");

function runGuard(root: string): { status: number; output: string } {
  try {
    return { status: 0, output: execFileSync("node", [GUARD], { cwd: root, encoding: "utf8" }) };
  } catch (error) {
    const failure = error as { status: number; stdout: string; stderr: string };
    return { status: failure.status, output: `${failure.stdout}${failure.stderr}` };
  }
}

function writePrerequisites(root: string, packages: unknown[]): void {
  mkdirSync(join(root, "scripts"), { recursive: true });
  writeFileSync(join(root, "scripts", "release-prerequisites.json"), JSON.stringify({ packages }));
}

describe("check-release-prerequisites", () => {
  it("fails a publish candidate the prerequisite list forgets", () => {
    const root = fixture([{ dir: "a", name: "@scope/a", version: "1.0.0" }]);
    writePrerequisites(root, []);
    const { status, output } = runGuard(root);
    expect(status).toBe(1);
    expect(output).toContain("@scope/a@1.0.0 is a publish candidate with no entry");
  });

  it("passes a candidate whose prerequisites are satisfied and evidenced", () => {
    const root = fixture([{ dir: "a", name: "@scope/a", version: "1.0.0" }]);
    writePrerequisites(root, [
      {
        name: "@scope/a",
        manifest: "packages/a/package.json",
        prerequisites: [{ id: "npm-package-registered", satisfied: true, evidence: "npm view …" }],
      },
    ]);
    expect(runGuard(root).status).toBe(0);
  });

  it("fails a prerequisite that claims satisfaction with no evidence", () => {
    const root = fixture([{ dir: "a", name: "@scope/a", version: "1.0.0" }]);
    writePrerequisites(root, [
      {
        name: "@scope/a",
        manifest: "packages/a/package.json",
        prerequisites: [{ id: "npm-package-registered", satisfied: true, evidence: "  " }],
      },
    ]);
    const { status, output } = runGuard(root);
    expect(status).toBe(1);
    expect(output).toContain("requires npm-package-registered");
  });
});
