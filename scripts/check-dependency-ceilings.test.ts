/**
 * Ceiling pins ratchet against the manifests and the lockfile. A newer release
 * that still sits inside an unchanged peer range is not a failure.
 */
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

import {
  ceilingProblems,
  checkDependencyCeilings,
  satisfiesRange,
  workspaceGlobs,
  // @ts-expect-error — plain-JS guard, no types
} from "./check-dependency-ceilings.mjs";

const LOCK = `lockfileVersion: '9.0'

importers:

  .:
    devDependencies:
      '@testing-library/jest-dom':
        specifier: 6.9.1
        version: 6.9.1
      typescript:
        specifier: 6.0.3
        version: 6.0.3

  apps/web:
    devDependencies:
      typescript:
        specifier: 6.0.3
        version: 6.0.3

packages:

  '@solidjs/vite-plugin@3.0.0-next.44':
    peerDependencies:
      '@testing-library/jest-dom': ^5.16.6 || ^5.17.0 || ^6.0.0 || ^7.0.0
    peerDependenciesMeta:
      '@testing-library/jest-dom':
        optional: true

  '@astrojs/check@0.9.10':
    peerDependencies:
      typescript: ^5.0.0 || ^6.0.0

snapshots:

  jsdom@29.1.1:
    dependencies:
      typescript: 6.0.3
`;

const report = {
  ceilings: [
    {
      name: "@testing-library/jest-dom",
      version: "6.9.1",
      reason: "Compatibility tests for a newer release have not passed.",
      declarations: [{ manifest: "package.json", field: "devDependencies" }],
      peers: [
        {
          lockKey: "@solidjs/vite-plugin@3.0.0-next.44",
          range: "^5.16.6 || ^5.17.0 || ^6.0.0 || ^7.0.0",
          optional: true,
        },
      ],
    },
    {
      name: "typescript",
      version: "6.0.3",
      reason: "@astrojs/check@0.9.10 accepts ^5.0.0 || ^6.0.0.",
      declarations: [
        { manifest: "package.json", field: "devDependencies" },
        { manifest: "apps/web/package.json", field: "devDependencies" },
      ],
      peers: [
        {
          lockKey: "@astrojs/check@0.9.10",
          range: "^5.0.0 || ^6.0.0",
          optional: false,
          rejects: ["7.0.2"],
        },
      ],
    },
  ],
};

const manifests: Record<string, { devDependencies: Record<string, string> }> = {
  "package.json": {
    devDependencies: {
      "@testing-library/jest-dom": "6.9.1",
      typescript: "6.0.3",
    },
  },
  "apps/web/package.json": {
    devDependencies: { typescript: "6.0.3" },
  },
};

const manifestPaths = Object.keys(manifests);

function problemsOf(
  overrides: {
    report?: typeof report;
    manifests?: typeof manifests;
    lockText?: string;
    manifestPaths?: string[];
  } = {},
): string[] {
  return ceilingProblems({
    report: overrides.report ?? report,
    manifests: overrides.manifests ?? manifests,
    lockText: overrides.lockText ?? LOCK,
    manifestPaths: overrides.manifestPaths ?? manifestPaths,
  });
}

describe("satisfiesRange", () => {
  it("accepts 6.0.3 inside ^5 || ^6 and rejects 7.0.2", () => {
    expect(satisfiesRange("6.0.3", "^5.0.0 || ^6.0.0")).toBe(true);
    expect(satisfiesRange("7.0.2", "^5.0.0 || ^6.0.0")).toBe(false);
    expect(satisfiesRange("6.9.1", "^5.16.6 || ^5.17.0 || ^6.0.0 || ^7.0.0")).toBe(true);
    expect(satisfiesRange("7.0.1", "^5.16.6 || ^5.17.0 || ^6.0.0 || ^7.0.0")).toBe(true);
  });
});

describe("ceilingProblems", () => {
  it("holds an exact pin when the installed peer already allows a newer release", () => {
    expect(problemsOf()).toEqual([]);
  });

  it("names a missing reason", () => {
    const drifted = structuredClone(report);
    drifted.ceilings[0].reason = "  ";
    expect(
      problemsOf({ report: drifted }).some((problem) => problem.includes("missing the reason")),
    ).toBe(true);
  });

  it("names a manifest that moved off the exact pin", () => {
    const drifted = structuredClone(manifests);
    drifted["package.json"].devDependencies["@testing-library/jest-dom"] = "^6.9.1";
    const problems = problemsOf({ manifests: drifted });
    expect(problems.some((problem) => problem.includes("the ceiling is 6.9.1"))).toBe(true);
  });

  it("names a lockfile peer range that no longer matches the record", () => {
    const drifted = LOCK.replace(
      "typescript: ^5.0.0 || ^6.0.0",
      "typescript: ^5.0.0 || ^6.0.0 || ^7.0.0",
    );
    const problems = problemsOf({ lockText: drifted });
    expect(problems.some((problem) => problem.includes("Recheck the ceiling"))).toBe(true);
  });

  it("names a recorded range that accepts a version the ceiling rejects", () => {
    const drifted = structuredClone(report);
    drifted.ceilings[1].peers[0].range = "^5.0.0 || ^6.0.0 || ^7.0.0";
    const lockText = LOCK.replace(
      "typescript: ^5.0.0 || ^6.0.0",
      "typescript: ^5.0.0 || ^6.0.0 || ^7.0.0",
    );
    const problems = problemsOf({ report: drifted, lockText });
    expect(problems.some((problem) => problem.includes("accepts 7.0.2"))).toBe(true);
  });

  it("names a workspace manifest the record does not list", () => {
    const extra = structuredClone(manifests);
    extra["apps/comparison/package.json"] = {
      devDependencies: { typescript: "6.0.3" },
    };
    const problems = problemsOf({
      manifests: extra,
      manifestPaths: [...manifestPaths, "apps/comparison/package.json"],
    });
    expect(
      problems.some((problem) =>
        problem.includes("apps/comparison/package.json devDependencies declares typescript"),
      ),
    ).toBe(true);
  });
});

describe("workspaceGlobs", () => {
  it("reads the packages list and stops at the next top-level key", () => {
    expect(
      workspaceGlobs(
        'packages:\n  - "packages/*"\n  - "apps/web"\n\noverrides:\n  vite: "catalog:"\n',
      ),
    ).toEqual(["packages/*", "apps/web"]);
  });
});

describe("checkDependencyCeilings", () => {
  it("passes this repository", () => {
    expect(checkDependencyCeilings()).toBe(0);
  });

  it("runs from the release-readiness chain", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(pkg.scripts["guard:dependency-ceilings"]).toBe(
      "node scripts/check-dependency-ceilings.mjs",
    );
    expect(pkg.scripts["ci:release-readiness"]).toContain(
      "vp run guard:dependency-security && vp run guard:dependency-ceilings",
    );
  });
});
