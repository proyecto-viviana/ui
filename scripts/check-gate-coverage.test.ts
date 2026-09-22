import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

// @ts-expect-error — plain-JS guard, no types
import { checkGateCoverage, evaluateGateCoverage } from "./check-gate-coverage.mjs";

const shardName = "certified (${{ matrix.shard }}/8)";

const scripts = {
  "ci:release-readiness": "vp run check",
  check: "vp check && vp run typecheck",
  typecheck: "vp exec tsc --noEmit -p tsconfig.typecheck.json",
};

type Entry = { leg: string | null; why?: string };

function workflow(extra: string[] = []) {
  return [
    "jobs:",
    "  certification-gates:",
    "    steps:",
    "      - name: typecheck",
    "        run: pnpm run typecheck",
    ...extra,
    "      - name: guard upstream-freshness",
    "        continue-on-error: true",
    "        run: pnpm run guard:upstream-freshness",
    "  certified:",
    `    name: ${shardName}`,
    "    strategy:",
    "      matrix:",
    "        shard: [1, 2, 3, 4, 5, 6, 7, 8]",
    "    steps:",
    "      - name: certified shard",
    "        run: pnpm exec playwright test",
    "  certified-report:",
    "    name: certified report",
    "    steps:",
    "      - name: Merge certified reports",
    "        run: pnpm exec tsx merge.ts",
    "",
  ].join("\n");
}

function coverage(extra: Record<string, Entry> = {}): Record<string, Entry> {
  return {
    typecheck: { leg: "typecheck" },
    [shardName]: {
      leg: null,
      why: "The eight certified shards run only in Certification Gates.",
    },
    "certified report": {
      leg: null,
      why: "The certified report runs only in Certification Gates.",
    },
    ...extra,
  };
}

describe("findCoverageProblems", () => {
  it("accepts the blocking steps and ignores an advisory one", () => {
    expect(evaluateGateCoverage(workflow(), coverage(), scripts).problems).toEqual([]);
  });

  it("names a blocking step missing from the map", () => {
    const source = workflow(["      - name: docs:check", "        run: pnpm run docs:check"]);
    const problems: string[] = evaluateGateCoverage(source, coverage(), scripts).problems;
    expect(problems.some((problem) => problem.includes('blocking step "docs:check"'))).toBe(true);
  });

  it("names an entry for a step that no longer exists", () => {
    const problems: string[] = evaluateGateCoverage(
      workflow(),
      coverage({ "retired step": { leg: null, why: "This step was removed." } }),
      scripts,
    ).problems;
    expect(
      problems.some((problem) =>
        problem.includes('entry "retired step" names a step that no longer exists'),
      ),
    ).toBe(true);
  });

  it("names a leg that is not a package.json script", () => {
    const mapped = coverage();
    mapped.typecheck = { leg: "no-such-script" };
    const problems: string[] = evaluateGateCoverage(workflow(), mapped, scripts).problems;
    expect(
      problems.some(
        (problem) => problem.includes('entry "typecheck"') && problem.includes("no-such-script"),
      ),
    ).toBe(true);
  });

  it("names a reached script whose leg was left null", () => {
    const mapped = coverage();
    mapped.typecheck = { leg: null, why: "Counted by the step name, not by the chain." };
    const problems: string[] = evaluateGateCoverage(workflow(), mapped, scripts).problems;
    expect(problems.some((problem) => problem.includes('blocking step "typecheck"'))).toBe(true);
  });
});

describe("checkGateCoverage", () => {
  it("passes this repository and states the coverage fact", () => {
    const source = readFileSync(".github/workflows/certification-gates.yml", "utf8");
    const mapped = JSON.parse(readFileSync("scripts/gate-coverage.json", "utf8"));
    const manifest = JSON.parse(readFileSync("package.json", "utf8"));
    const result = evaluateGateCoverage(source, mapped, manifest.scripts);
    expect(result.problems).toEqual([]);
    expect(result.sentence).toMatch(
      /^ci:release-readiness runs (\d+) of (\d+) blocking gate steps locally; the other (\d+) run only in Certification Gates \(scripts\/gate-coverage\.json\)$/,
    );
    const match =
      /^ci:release-readiness runs (\d+) of (\d+) blocking gate steps locally; the other (\d+) /.exec(
        result.sentence ?? "",
      );
    expect(Number(match?.[1]) + Number(match?.[3])).toBe(Number(match?.[2]));
    expect(checkGateCoverage()).toBe(0);
  });
});
