import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";

// @ts-expect-error — plain-JS guard, no types
import { checkGithubHostedRunners, findRunnerProblems } from "./check-github-hosted-runners.mjs";

const hosted = (runsOn: string) => `jobs:\n  build:\n    runs-on: ${runsOn}\n`;

describe("findRunnerProblems", () => {
  it("names a planted Blacksmith runner", () => {
    const problems = findRunnerProblems("ci.yml", hosted("blacksmith-4vcpu-ubuntu-2404"));
    expect(problems.length).toBeGreaterThan(0);
    expect(problems.some((problem) => problem.includes("ci.yml:3"))).toBe(true);
    expect(problems.some((problem) => problem.includes("blacksmith-4vcpu-ubuntu-2404"))).toBe(true);
    expect(problems.some((problem) => problem.includes("Blacksmith"))).toBe(true);
  });

  it("names a self-hosted label", () => {
    const problems = findRunnerProblems("ci.yml", hosted("self-hosted"));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("ci.yml:3");
    expect(problems[0]).toContain("self-hosted");
    expect(problems[0]).toContain("not a GitHub-hosted runner");
  });

  it("names every label in a self-hosted list", () => {
    const problems = findRunnerProblems("ci.yml", hosted("[self-hosted, linux]"));
    expect(problems.map((problem) => problem.slice(problem.indexOf("names")))).toEqual([
      "names self-hosted, which is not a GitHub-hosted runner.",
      "names linux, which is not a GitHub-hosted runner.",
    ]);
  });

  it("names a runner group", () => {
    const problems = findRunnerProblems(
      "ci.yml",
      "jobs:\n  build:\n    runs-on:\n      group: faster-pool\n      labels: [self-hosted]\n",
    );
    expect(problems).toHaveLength(2);
    expect(problems[0]).toContain("group faster-pool");
    expect(problems[1]).toContain("self-hosted");
  });

  it("names a Blacksmith mention beside a hosted runner", () => {
    const problems = findRunnerProblems(
      "ci.yml",
      "jobs:\n  build:\n    # was Blacksmith\n    runs-on: ubuntu-latest\n",
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("ci.yml:3");
    expect(problems[0]).toContain("Blacksmith");
  });

  it("names a job that never says which runner", () => {
    const problems = findRunnerProblems(
      "ci.yml",
      "jobs:\n  build:\n    steps:\n      - run: echo hi\n",
    );
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("ci.yml:2");
    expect(problems[0]).toContain("job build");
    expect(problems[0]).toContain("no runs-on");
  });

  it("names an expression", () => {
    const problems = findRunnerProblems("ci.yml", hosted("${{ matrix.os }}"));
    expect(problems).toHaveLength(1);
    expect(problems[0]).toContain("expression");
  });

  it("accepts a block list of GitHub-hosted labels", () => {
    expect(
      findRunnerProblems(
        "ci.yml",
        "jobs:\n  build:\n    runs-on:\n      labels:\n        - ubuntu-latest\n",
      ),
    ).toEqual([]);
  });

  it("accepts a GitHub-hosted label", () => {
    expect(findRunnerProblems("ci.yml", hosted("ubuntu-latest"))).toEqual([]);
    expect(findRunnerProblems("ci.yml", hosted('"ubuntu-24.04"'))).toEqual([]);
    expect(
      findRunnerProblems("ci.yml", "jobs:\n  build:\n    runs-on:\n      - macos-latest\n"),
    ).toEqual([]);
  });
});

describe("checkGithubHostedRunners", () => {
  it("fails a directory that plants a Blacksmith runner", () => {
    const dir = mkdtempSync(join(tmpdir(), "github-hosted-runners-"));
    writeFileSync(join(dir, "ci.yml"), hosted("blacksmith-4vcpu-ubuntu-2404"));
    expect(checkGithubHostedRunners(dir)).toBe(1);
  });

  it("passes this repository's workflows", () => {
    expect(checkGithubHostedRunners()).toBe(0);
  });

  it("runs from pr:check:fast through ci:release-readiness", () => {
    const pkg = JSON.parse(readFileSync("package.json", "utf8"));
    expect(pkg.scripts["guard:github-hosted-runners"]).toBe(
      "node scripts/check-github-hosted-runners.mjs",
    );
    expect(pkg.scripts["ci:release-readiness"]).toContain("vp run guard:github-hosted-runners");
    expect(pkg.scripts["pr:check:fast"]).toBe(
      "vp run ci:changesets && vp run ci:release-readiness",
    );
  });
});
