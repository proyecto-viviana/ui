import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

// @ts-expect-error — plain-JS guard, no types
import * as gateCoverage from "./check-gate-coverage.mjs";

const {
  blockingGateSteps,
  checkGateCoverage,
  coverageSentence,
  evaluateGateCoverage,
  reachedScripts,
  stepKind,
  workflowJobIds,
} = gateCoverage;

const shardName = "certified (${{ matrix.shard }}/8)";
const workflowJobs = [
  "certification-gates",
  "comparison-build",
  "comparison-floors-pair",
  "comparison-floors-contract",
  "certified",
  "certified-report",
];

const scripts = {
  "ci:release-readiness": "vp run check",
  check: "vp check && vp run typecheck",
  typecheck: "vp exec tsc --noEmit -p tsconfig.typecheck.json",
  "comparison:build": "vp run --filter @proyecto-viviana/comparison build",
};

type Entry = { leg: string | null; why?: string };
type Coverage = { plumbing: string[]; steps: Record<string, Entry> };

function workflow(extra: string[] = []) {
  return [
    "jobs:",
    "  certification-gates:",
    "    steps:",
    "      - name: typecheck",
    "        run: pnpm run typecheck",
    ...extra,
    "      - name: Checkout",
    "        uses: actions/checkout@0000000000000000000000000000000000000000",
    "      - name: guard upstream-freshness",
    "        continue-on-error: true",
    "        run: pnpm run guard:upstream-freshness",
    "  comparison-build:",
    "    name: comparison evidence build",
    "    steps:",
    "      - name: build comparison app",
    "        run: pnpm run comparison:build",
    "  comparison-floors-pair:",
    '    name: "comparison floors: pair budgets"',
    "    steps:",
    "      - name: comparison floors pair",
    "        run: pnpm exec playwright test pair",
    "  comparison-floors-contract:",
    '    name: "comparison floors: contracts"',
    "    steps:",
    "      - name: comparison floors contract",
    "        run: pnpm exec playwright test contract",
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

function coverage(extra: Record<string, Entry> = {}): Coverage {
  return {
    plumbing: ["Checkout"],
    steps: {
      "certification-gates / typecheck": { leg: "typecheck" },
      "certification-gates / Checkout": { leg: null, why: "The runner checks the repository out." },
      "comparison evidence build / build comparison app": {
        leg: null,
        why: "comparison:build is not reached by this fixture chain.",
      },
      "comparison floors: pair budgets / comparison floors pair": {
        leg: null,
        why: "The pair floor runs only in Certification Gates.",
      },
      "comparison floors: contracts / comparison floors contract": {
        leg: null,
        why: "The contract floor runs only in Certification Gates.",
      },
      [`${shardName} / certified shard`]: {
        leg: null,
        why: "The eight certified shards run only in Certification Gates.",
      },
      "certified report / Merge certified reports": {
        leg: null,
        why: "The certified report runs only in Certification Gates.",
      },
      ...extra,
    },
  };
}

const sentenceDocs = [
  ".claude/current/release-policy.md",
  ".claude/current/certification.md",
] as const;

describe("findCoverageProblems", () => {
  it("accepts the blocking steps of all six jobs and ignores an advisory one", () => {
    const result = evaluateGateCoverage(workflow(), coverage(), scripts);
    expect(result.problems).toEqual([]);
    expect(workflowJobIds(workflow())).toEqual(workflowJobs);
  });

  it("names a blocking step missing from the map", () => {
    const source = workflow(["      - name: docs:check", "        run: pnpm run docs:check"]);
    const problems: string[] = evaluateGateCoverage(source, coverage(), scripts).problems;
    expect(
      problems.some((problem) =>
        problem.includes('blocking step "certification-gates / docs:check"'),
      ),
    ).toBe(true);
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
    mapped.steps["certification-gates / typecheck"] = { leg: "no-such-script" };
    const problems: string[] = evaluateGateCoverage(workflow(), mapped, scripts).problems;
    expect(
      problems.some(
        (problem) =>
          problem.includes('entry "certification-gates / typecheck"') &&
          problem.includes("no-such-script"),
      ),
    ).toBe(true);
  });

  it("names a reached script whose leg was left null", () => {
    const mapped = coverage();
    mapped.steps["certification-gates / typecheck"] = {
      leg: null,
      why: "Counted by the step name, not by the chain.",
    };
    const problems: string[] = evaluateGateCoverage(workflow(), mapped, scripts).problems;
    expect(
      problems.some((problem) =>
        problem.includes('blocking step "certification-gates / typecheck"'),
      ),
    ).toBe(true);
  });

  it("names a blocking step demoted to advisory", () => {
    const source = workflow().replace(
      "      - name: typecheck\n        run: pnpm run typecheck\n",
      "      - name: typecheck\n        continue-on-error: true\n        run: pnpm run typecheck\n",
    );
    const problems: string[] = evaluateGateCoverage(source, coverage(), scripts).problems;
    expect(problems).toContain(
      'blocking step "certification-gates / typecheck" is now advisory; remove its entry or restore continue-on-error',
    );
    expect(problems.some((problem) => problem.includes("no longer exists"))).toBe(false);
  });
});

describe("the certification workflow", () => {
  const source = readFileSync(".github/workflows/certification-gates.yml", "utf8");
  const mapped = JSON.parse(readFileSync("scripts/gate-coverage.json", "utf8")) as Coverage;
  const manifest = JSON.parse(readFileSync("package.json", "utf8")) as {
    scripts: Record<string, string>;
  };

  it("counts blocking steps from all six jobs", () => {
    expect(workflowJobIds(source)).toEqual(workflowJobs);
    const steps = blockingGateSteps(source).filter((step: { name: string | null }) => step.name);
    const jobIds = new Set(steps.map((step: { jobId: string }) => step.jobId));
    expect([...jobIds]).toEqual(workflowJobs);
    const reached = reachedScripts(manifest.scripts);
    let gates = 0;
    let plumbing = 0;
    let local = 0;
    for (const step of steps) {
      if (stepKind(step, mapped.plumbing) === "plumbing") {
        plumbing += 1;
        continue;
      }
      gates += 1;
      const leg = mapped.steps[step.key]?.leg;
      if (typeof leg === "string" && reached.has(leg)) local += 1;
    }
    const result = evaluateGateCoverage(source, mapped, manifest.scripts);
    expect(result.problems).toEqual([]);
    expect(result.sentence).toBe(coverageSentence(local, gates, plumbing));
    expect(result.sentence).toMatch(
      /^ci:release-readiness runs (\d+) of (\d+) blocking gate steps locally across the six Certification Gates jobs; the other (\d+) run only there; (\d+) steps are runner plumbing \(scripts\/gate-coverage\.json\)$/,
    );
    const match =
      /^ci:release-readiness runs (\d+) of (\d+) blocking gate steps locally across the six Certification Gates jobs; the other (\d+) run only there; (\d+) steps /.exec(
        result.sentence ?? "",
      );
    expect(Number(match?.[1]) + Number(match?.[3])).toBe(Number(match?.[2]));
    expect(mapped.steps["comparison evidence build / D13 journey driver unit tests"]?.leg).toBe(
      "comparison:test:journeys-driver",
    );
    expect(mapped.steps["comparison evidence build / guard certified case floor"]?.leg).toBe(
      "guard:certified-case-floor",
    );
    expect(mapped.steps["comparison evidence build / build packages"]?.leg).toBe("build");
    const byKey = new Map(steps.map((step: { key: string }) => [step.key, step]));
    expect(stepKind(byKey.get("certification-gates / Checkout"), mapped.plumbing)).toBe("plumbing");
    expect(stepKind(byKey.get("certification-gates / axe full audit"), mapped.plumbing)).toBe(
      "gate",
    );
    expect(
      stepKind(
        byKey.get("certification-gates / materialize pinned upstream oracle"),
        mapped.plumbing,
      ),
    ).toBe("gate");
    expect(
      stepKind(
        byKey.get("comparison floors: pair budgets / Publish floor summary"),
        mapped.plumbing,
      ),
    ).toBe("plumbing");
  });

  it("names a blocking step added to comparison-build", () => {
    const mutated = source.replace(
      "      - name: D13 journey driver unit tests\n",
      "      - name: w568b fake blocking step\n        run: node fake-step.mjs\n\n      - name: D13 journey driver unit tests\n",
    );
    const problems: string[] = evaluateGateCoverage(mutated, mapped, manifest.scripts).problems;
    expect(problems).toContain(
      'blocking step "comparison evidence build / w568b fake blocking step" has no entry in scripts/gate-coverage.json',
    );
  });

  it("names a doc whose coverage sentence changed by one digit", () => {
    const docs = Object.fromEntries(sentenceDocs.map((file) => [file, readFileSync(file, "utf8")]));
    const clean = evaluateGateCoverage(source, mapped, manifest.scripts, docs);
    expect(clean.problems).toEqual([]);
    const sentence = clean.sentence ?? "";
    const tweaked = sentence.replace(/\d/, (digit: string) => String((Number(digit) + 1) % 10));
    const problems: string[] = evaluateGateCoverage(source, mapped, manifest.scripts, {
      ...docs,
      ".claude/current/release-policy.md": docs[".claude/current/release-policy.md"].replace(
        sentence,
        tweaked,
      ),
    }).problems;
    expect(problems).toEqual([
      ".claude/current/release-policy.md does not contain the coverage sentence",
    ]);
  });

  it("names axe full audit when that gate is made advisory", () => {
    const mutated = source.replace(
      "      - name: axe full audit\n        id: axe_full\n        run: pnpm run a11y:full\n",
      "      - name: axe full audit\n        id: axe_full\n        continue-on-error: true\n        run: pnpm run a11y:full\n",
    );
    const problems: string[] = evaluateGateCoverage(mutated, mapped, manifest.scripts).problems;
    expect(problems).toContain(
      'blocking step "certification-gates / axe full audit" is now advisory; remove its entry or restore continue-on-error',
    );
    expect(problems.some((problem) => problem.includes("no longer exists"))).toBe(false);
  });

  it("names a script appended to the typecheck step that the chain does not reach", () => {
    const mutated = source.replace(
      "        run: pnpm run typecheck\n",
      "        run: pnpm run typecheck && pnpm run guard:idiomatic-solid\n",
    );
    const problems: string[] = evaluateGateCoverage(mutated, mapped, manifest.scripts).problems;
    expect(
      problems.some(
        (problem) => problem.includes("typecheck") && problem.includes("guard:idiomatic-solid"),
      ),
    ).toBe(true);
  });

  it("names a script prepended to the typecheck step that the chain does not reach", () => {
    const mutated = source.replace(
      "        run: pnpm run typecheck\n",
      "        run: pnpm run guard:idiomatic-solid && pnpm run typecheck\n",
    );
    const problems: string[] = evaluateGateCoverage(mutated, mapped, manifest.scripts).problems;
    expect(
      problems.some(
        (problem) => problem.includes("typecheck") && problem.includes("guard:idiomatic-solid"),
      ),
    ).toBe(true);
  });

  it("accepts a step that runs two scripts the release chain reaches", () => {
    const mutated = source.replace(
      "        run: pnpm run typecheck\n",
      "        run: pnpm run check && pnpm run typecheck\n",
    );
    expect(evaluateGateCoverage(mutated, mapped, manifest.scripts).problems).toEqual([]);
  });

  it("names a script on the next line of the typecheck step that the chain does not reach", () => {
    const mutated = source.replace(
      "        run: pnpm run typecheck\n",
      "        run: |\n          pnpm run typecheck\n          pnpm run guard:idiomatic-solid\n",
    );
    const problems: string[] = evaluateGateCoverage(mutated, mapped, manifest.scripts).problems;
    expect(
      problems.some(
        (problem) => problem.includes("typecheck") && problem.includes("guard:idiomatic-solid"),
      ),
    ).toBe(true);
  });

  it("counts a typecheck step whose script is below set -e", () => {
    const clean = evaluateGateCoverage(source, mapped, manifest.scripts);
    const mutated = source.replace(
      "        run: pnpm run typecheck\n",
      "        run: |\n          set -e\n          pnpm run typecheck\n",
    );
    const result = evaluateGateCoverage(mutated, mapped, manifest.scripts);
    expect(result.problems).toEqual([]);
    expect(result.sentence).toBe(clean.sentence);
  });

  it("names each duplicated script on one problem line", () => {
    const mutated = source.replace(
      "        run: pnpm run typecheck\n",
      "        run: pnpm run a && pnpm run a && pnpm run b && pnpm run b\n",
    );
    const problems: string[] = evaluateGateCoverage(mutated, mapped, manifest.scripts).problems;
    expect(problems).toEqual([
      'blocking step "certification-gates / typecheck" runs "a", which is not a package.json script',
      'blocking step "certification-gates / typecheck" runs "b", which is not a package.json script',
    ]);
  });
});

describe("checkGateCoverage", () => {
  it("passes this repository and states the coverage fact", () => {
    expect(checkGateCoverage()).toBe(0);
  });
});
