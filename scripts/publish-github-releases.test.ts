import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

import {
  applyReleases,
  changelogSection,
  parsePublishedPackages,
  planReleases,
  // @ts-expect-error — plain-JS release script, no types
} from "./publish-github-releases.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
// The publish output of Release run 38339551171, which uploaded rc.2.
const rc2Log = readFileSync(join(HERE, "fixtures", "changeset-publish-rc2.txt"), "utf8");
const SHA = "142ee7c3d6013384add98ff9b70699b9f370280c";

const changelog = [
  "# @proyecto-viviana/ui",
  "",
  "## 0.8.0-rc.2",
  "",
  "### Patch Changes",
  "",
  "- abc1234: Second candidate.",
  "",
  "## 0.8.0-rc.1",
  "",
  "- First candidate.",
  "",
].join("\n");

function workspace(overrides: Record<string, unknown> = {}) {
  return new Map([
    [
      "@proyecto-viviana/ui",
      {
        dir: "packages/viviana-ui",
        version: "0.8.0-rc.2",
        private: false,
        changelog,
        ...overrides,
      },
    ],
  ]);
}

const published = [{ name: "@proyecto-viviana/ui", version: "0.8.0-rc.2" }];

describe("parsePublishedPackages", () => {
  it("reads the five packages the rc.2 run uploaded, through timestamps and cursor codes", () => {
    expect(
      parsePublishedPackages(rc2Log).map(
        (item: { name: string; version: string }) => `${item.name}@${item.version}`,
      ),
    ).toEqual([
      "@proyecto-viviana/solid-spectrum@0.8.0-rc.2",
      "@proyecto-viviana/solid-stately@0.6.0-rc.2",
      "@proyecto-viviana/solidaria@0.6.0-rc.2",
      "@proyecto-viviana/solidaria-components@0.7.0-rc.2",
      "@proyecto-viviana/ui@0.8.0-rc.2",
    ]);
  });

  it("releases nothing for a publish that announced packages and uploaded none", () => {
    const failed = rc2Log.slice(0, rc2Log.indexOf("Successfully published:"));
    expect(failed).toContain("@proyecto-viviana/ui@0.8.0-rc.2");
    expect(parsePublishedPackages(failed)).toEqual([]);
  });

  it("stops the list at the first line that is not a release", () => {
    const log = "Successfully published:\n@a/b@1.0.0\nCreating git tags...\n@a/c@1.0.0\n";
    expect(parsePublishedPackages(log)).toEqual([{ name: "@a/b", version: "1.0.0" }]);
  });
});

describe("changelogSection", () => {
  it("returns one version's notes without its heading or the next version", () => {
    expect(changelogSection(changelog, "0.8.0-rc.2")).toBe(
      "### Patch Changes\n\n- abc1234: Second candidate.",
    );
  });

  it("has nothing for a version the changelog does not hold", () => {
    expect(changelogSection(changelog, "0.8.0-rc.3")).toBeNull();
    expect(changelogSection(changelog, "0.8.0-rc")).toBeNull();
  });
});

describe("planReleases", () => {
  const plan = (packages = workspace(), tagCommit: (tag: string) => string | null = () => SHA) =>
    planReleases({ published, packages, tagCommit, releaseSha: SHA });

  it("names the release after its tag and marks a prerelease version", () => {
    expect(plan()).toEqual({
      problems: [],
      releases: [
        {
          tag: "@proyecto-viviana/ui@0.8.0-rc.2",
          name: "@proyecto-viviana/ui@0.8.0-rc.2",
          prerelease: true,
          notes: "### Patch Changes\n\n- abc1234: Second candidate.",
          releaseSha: SHA,
          createTag: false,
        },
      ],
    });
  });

  it("does not mark a stable version as a prerelease", () => {
    const stable = planReleases({
      published: [{ name: "@proyecto-viviana/ui", version: "0.8.0" }],
      packages: workspace({ version: "0.8.0", changelog: "## 0.8.0\n\n- Stable.\n" }),
      tagCommit: () => SHA,
      releaseSha: SHA,
    });
    expect(stable.releases[0].prerelease).toBe(false);
  });

  it("refuses a version the tree does not hold", () => {
    expect(plan(workspace({ version: "0.8.0-rc.3" })).problems[0]).toContain(
      "the tree holds @proyecto-viviana/ui@0.8.0-rc.3",
    );
  });

  it("plans creation for a missing tag but refuses one on another commit", () => {
    expect(plan(workspace(), () => null)).toMatchObject({
      problems: [],
      releases: [{ createTag: true, releaseSha: SHA }],
    });
    expect(plan(workspace(), () => "f".repeat(40)).problems[0]).toContain(
      "not at the released commit",
    );
  });

  it("refuses a package with no notes for the version, a private one and an unknown one", () => {
    expect(plan(workspace({ changelog: "## 0.8.0-rc.1\n\n- Old.\n" })).problems[0]).toContain(
      "has no section for 0.8.0-rc.2",
    );
    expect(plan(workspace({ private: true })).problems[0]).toContain("is private");
    expect(plan(new Map()).problems[0]).toContain("no workspace package");
  });
});

describe("applyReleases", () => {
  const releases = [
    { tag: "@a/b@1.0.0-rc.1", name: "@a/b@1.0.0-rc.1", prerelease: true, notes: "- One." },
    { tag: "@a/c@1.0.0", name: "@a/c@1.0.0", prerelease: false, notes: "- Two." },
  ];
  const options = (
    run: (command: string, args: string[]) => { status: number; stderr: string },
  ) => ({
    run,
    notesDir: mkdtempSync(join(tmpdir(), "release-notes-test-")),
    log: () => {},
  });

  it("pushes every tag in one push, then creates each release from its notes", () => {
    const calls: string[][] = [];
    const notes: string[] = [];
    applyReleases(
      releases,
      options((command, args) => {
        calls.push([command, ...args]);
        if (command === "gh" && args[1] === "create") {
          notes.push(readFileSync(args[args.indexOf("--notes-file") + 1]!, "utf8"));
        }
        // No release exists yet.
        return { status: command === "gh" && args[1] === "view" ? 1 : 0, stderr: "" };
      }),
    );

    expect(calls[0]).toEqual([
      "git",
      "push",
      "origin",
      "refs/tags/@a/b@1.0.0-rc.1:refs/tags/@a/b@1.0.0-rc.1",
      "refs/tags/@a/c@1.0.0:refs/tags/@a/c@1.0.0",
    ]);
    const created = calls.filter((call) => call[0] === "gh" && call[2] === "create");
    expect(created.map((call) => call[3])).toEqual(["@a/b@1.0.0-rc.1", "@a/c@1.0.0"]);
    expect(created.map((call) => call[call.indexOf("--title") + 1])).toEqual([
      "@a/b@1.0.0-rc.1",
      "@a/c@1.0.0",
    ]);
    expect(created.every((call) => call.includes("--verify-tag"))).toBe(true);
    expect(created.map((call) => call.includes("--prerelease"))).toEqual([true, false]);
    expect(notes).toEqual(["- One.\n", "- Two.\n"]);
  });

  it("creates no release when the tags do not reach the remote", () => {
    const calls: string[][] = [];
    expect(() =>
      applyReleases(
        releases,
        options((command, args) => {
          calls.push([command, ...args]);
          return { status: 1, stderr: "remote rejected" };
        }),
      ),
    ).toThrow(/git push of 2 tag\(s\) failed/);
    expect(calls).toHaveLength(1);
  });

  it("leaves an existing release alone and still creates the others", () => {
    const created: string[] = [];
    applyReleases(
      releases,
      options((command, args) => {
        if (command === "gh" && args[1] === "create") created.push(args[2]!);
        const exists = command === "gh" && args[1] === "view" && args[2] === "@a/b@1.0.0-rc.1";
        return { status: command === "git" || exists || args[1] === "create" ? 0 : 1, stderr: "" };
      }),
    );
    expect(created).toEqual(["@a/c@1.0.0"]);
  });
});

describe("publish log to tag and release recovery without network", () => {
  it.each([false, true])(
    "recovers with tags initially present: %s, then reruns idempotently",
    (present) => {
      const cwd = mkdtempSync(join(tmpdir(), "release-git-test-"));
      const git = (args: string[]) =>
        spawnSync("git", args, {
          cwd,
          encoding: "utf8",
          env: { ...process.env, GIT_CONFIG_GLOBAL: "/dev/null", GIT_CONFIG_NOSYSTEM: "1" },
        });
      expect(git(["init"]).status).toBe(0);
      const commit = (message: string) => {
        expect(
          git([
            "-c",
            "user.name=Test",
            "-c",
            "user.email=test@example.invalid",
            "commit",
            "--allow-empty",
            "-m",
            message,
          ]).status,
        ).toBe(0);
        return git(["rev-parse", "HEAD"]).stdout.trim();
      };
      const releaseSha = commit("Released candidate");
      commit("Later checkout HEAD");
      const tag = "@proyecto-viviana/ui@0.8.0-rc.2";
      // Reproduce the runner's failed annotated tagging without a Git identity.
      expect(git(["-c", "user.name=", "-c", "user.email=", "tag", tag, "-m", tag]).status).not.toBe(
        0,
      );
      if (present) expect(git(["tag", tag, releaseSha]).status).toBe(0);
      const log = "Successfully published:\n" + tag + "\nCreating git tags...\n";
      const calls: string[][] = [];
      const existingReleases = new Set<string>();
      const run = (command: string, args: string[]) => {
        calls.push([command, ...args]);
        if (command === "git" && args[0] !== "push") return git(args);
        if (command === "gh" && args[1] === "view") {
          return { status: existingReleases.has(args[2]!) ? 0 : 1, stderr: "" };
        }
        if (command === "gh" && args[1] === "create") existingReleases.add(args[2]!);
        // Push and gh are intercepted: no network or remote refs.
        return { status: 0, stderr: "" };
      };
      const execute = () => {
        const plan = planReleases({
          published: parsePublishedPackages(log),
          packages: workspace(),
          releaseSha,
          tagCommit: (name: string) => {
            const result = git(["rev-parse", "--verify", "--quiet", `refs/tags/${name}^{commit}`]);
            return result.status === 0 ? result.stdout.trim() : null;
          },
        });
        expect(plan.problems).toEqual([]);
        applyReleases(plan.releases, { run, notesDir: cwd, log: () => {} });
      };
      execute();
      const object = git(["rev-parse", `refs/tags/${tag}`]).stdout.trim();
      expect(object).toBe(releaseSha); // Lightweight, explicitly at RELEASE_SHA, not HEAD.
      expect(git(["tag", "-l", tag, "-n1"]).stdout).toContain("Released candidate");
      execute();
      expect(git(["rev-parse", `refs/tags/${tag}`]).stdout.trim()).toBe(object);
      const tagCalls = calls.filter((call) => call[0] === "git" && call.includes("tag"));
      expect(tagCalls).toHaveLength(present ? 0 : 1);
      expect(calls.filter((call) => call[0] === "git" && call[1] === "push")).toHaveLength(2);
      expect(calls.filter((call) => call[0] === "gh" && call[2] === "create")).toHaveLength(1);
      if (!present)
        expect(calls[0]).toEqual(["git", "-c", "tag.gpgSign=false", "tag", tag, releaseSha]);
    },
  );

  it("does not push or create releases when tag creation fails", () => {
    const calls: string[][] = [];
    expect(() =>
      applyReleases([{ tag: "@a/b@1.0.0", createTag: true, releaseSha: SHA }], {
        run: (command: string, args: string[]) => {
          calls.push([command, ...args]);
          return { status: 1, stderr: "tag failed" };
        },
        notesDir: tmpdir(),
        log: () => {},
      }),
    ).toThrow(/git tag .* failed/);
    expect(calls).toHaveLength(1);
  });
});
