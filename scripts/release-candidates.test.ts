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

/**
 * One case, because one question here is not asked anywhere else: the guard
 * reads its subjects from the tree, so a package that exists and is not listed
 * must fail. That needs a throwaway workspace, which is what this file builds.
 *
 * The entry *shape* is not asked here. #599 refused `satisfied`/`evidence` by
 * name and replaced it with a re-derived `verify` block or a dated, owned
 * `attested` one, and `scripts/test-ci-guard-contracts.mjs` drives the real
 * script against a real registry answer for every branch of that rule: `PASS:
 * satisfied=true plus a sentence is refused as release evidence`, `PASS: an
 * attestation with no owner and date is refused`, `PASS: what cannot be
 * re-derived passes only as a dated, owned attestation`, `PASS: only the listed
 * prerequisite may be attested; the rest must re-derive`, and `PASS: an
 * attestation expires; a stale one is refused with its age`. Two cases here
 * asserted the abolished shape — one that it passed, one for its old message —
 * and were deleted rather than re-blessed (#607).
 */
describe("check-release-prerequisites", () => {
  it("fails a publish candidate the prerequisite list forgets", () => {
    const root = fixture([{ dir: "a", name: "@scope/a", version: "1.0.0" }]);
    writePrerequisites(root, []);
    const { status, output } = runGuard(root);
    expect(status).toBe(1);
    expect(output).toContain("@scope/a@1.0.0 is a publish candidate with no entry");
  });
});
