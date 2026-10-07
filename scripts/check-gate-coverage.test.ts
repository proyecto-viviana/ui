import { readFileSync } from "node:fs";
import { describe, expect, it } from "vite-plus/test";

// @ts-expect-error — plain-JS guard, no types
import * as gateCoverage from "./check-gate-coverage.mjs";

const {
  blockingGateSteps,
  checkGateCoverage,
  countCoverage,
  coverageSentence,
  evaluateGateCoverage,
  invokedScripts,
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
    plumbing: [],
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

  it("treats a run swallowed by || true as advisory", () => {
    const source = workflow().replace(
      "        run: pnpm run typecheck\n",
      "        run: pnpm run typecheck || true\n",
    );
    expect(evaluateGateCoverage(source, coverage(), scripts).problems).toEqual([
      'blocking step "certification-gates / typecheck" is now advisory; remove its entry or restore continue-on-error',
    ]);
  });

  it("does not treat || true && a later command as advisory", () => {
    const source = workflow().replace(
      "        run: pnpm run typecheck\n",
      "        run: pnpm run typecheck || true && pnpm run guard:upstream-freshness\n",
    );
    const withScript = {
      ...scripts,
      "guard:upstream-freshness": "node scripts/check.mjs",
    };
    expect(evaluateGateCoverage(source, coverage(), withScript).problems).toEqual([
      'blocking step "certification-gates / typecheck" runs "guard:upstream-freshness", which ci:release-readiness does not reach',
    ]);
  });

  it("treats a run that always succeeds through || true as advisory", () => {
    const source = workflow().replace(
      "        run: pnpm run typecheck\n",
      "        run: pnpm run typecheck && pnpm run guard:upstream-freshness || true\n",
    );
    const withScript = {
      ...scripts,
      "guard:upstream-freshness": "node scripts/check.mjs",
    };
    expect(evaluateGateCoverage(source, coverage(), withScript).problems).toEqual([
      'blocking step "certification-gates / typecheck" is now advisory; remove its entry or restore continue-on-error',
    ]);
  });

  it("sees scripts inside parentheses instead of falling back to the leg", () => {
    const source = workflow().replace(
      "        run: pnpm run typecheck\n",
      "        run: (pnpm run a); (pnpm run b)\n",
    );
    expect(evaluateGateCoverage(source, coverage(), scripts).problems).toEqual([
      'blocking step "certification-gates / typecheck" runs "a", which is not a package.json script',
      'blocking step "certification-gates / typecheck" runs "b", which is not a package.json script',
    ]);
  });

  it("rejects a plumbing key that names a uses: step", () => {
    const mapped = coverage();
    mapped.plumbing = ["certification-gates / Checkout"];
    expect(evaluateGateCoverage(workflow(), mapped, scripts).problems).toEqual([
      'plumbing name "certification-gates / Checkout" is a uses: step, which is already plumbing',
    ]);
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
    const result = evaluateGateCoverage(source, mapped, manifest.scripts);
    expect(result.problems).toEqual([]);
    const counts = countCoverage(source, mapped, manifest.scripts);
    expect(result.sentence).toBe(coverageSentence(counts.local, counts.gates, counts.plumbing));
    expect(result.sentence).toMatch(
      /^ci:release-readiness runs (\d+) of (\d+) blocking gate steps locally across the six Certification Gates jobs; the other (\d+) run only there; (\d+) steps are runner plumbing \(scripts\/gate-coverage\.json\)$/,
    );
    const match =
      /^ci:release-readiness runs (\d+) of (\d+) blocking gate steps locally across the six Certification Gates jobs; the other (\d+) run only there; (\d+) steps /.exec(
        result.sentence ?? "",
      );
    expect(Number(match?.[1]) + Number(match?.[3])).toBe(Number(match?.[2]));
    expect(mapped.plumbing).not.toContain("Checkout");
    expect(mapped.plumbing).toContain("certification-gates / Publish summary");
    expect(mapped.plumbing).toContain("comparison floors: pair budgets / Publish floor summary");
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
    expect(problems).toEqual([
      'blocking step "certification-gates / axe full audit" is now advisory; remove its entry or restore continue-on-error',
    ]);
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
  it("does not count a heredoc as running the typecheck leg", () => {
    const mutated = source.replace(
      "        run: pnpm run typecheck\n",
      "        run: |\n          cat <<EOF\n            pnpm run typecheck\n            EOF\n",
    );
    expect(evaluateGateCoverage(mutated, mapped, manifest.scripts).problems).toEqual([
      'blocking step "certification-gates / typecheck" leg "typecheck" does not run this step',
    ]);
  });

  it("does not count a quoted echo as running the typecheck leg", () => {
    const mutated = source.replace(
      "        run: pnpm run typecheck\n",
      '        run: |\n          echo "\n            pnpm run typecheck"\n',
    );
    expect(evaluateGateCoverage(mutated, mapped, manifest.scripts).problems).toEqual([
      'blocking step "certification-gates / typecheck" leg "typecheck" does not run this step',
    ]);
  });

  it("names a null leg that mixes in a script the chain does not reach", () => {
    const mutated = source.replace(
      "set +e\n          pnpm exec playwright",
      "set +e\n          pnpm run build:web\n          pnpm exec playwright",
    );
    expect(evaluateGateCoverage(mutated, mapped, manifest.scripts).problems).toEqual([
      'blocking step "certified (${{ matrix.shard }}/8) / certified shard" runs "build:web", which ci:release-readiness does not reach',
    ]);
  });

  it("names a Publish summary binding that dropped a certification-gates gate", () => {
    const mutated = source.replace("          O_TYPECHECK: ${{ steps.typecheck.outcome }}\n", "");
    expect(evaluateGateCoverage(mutated, mapped, manifest.scripts).problems).toEqual([
      'Publish summary does not bind certification-gates step "certification-gates / typecheck" (id typecheck)',
      "Publish summary row uses $O_TYPECHECK with no env binding",
    ]);
  });

  it("names the job and index of a blocking step with no name", () => {
    const mutated = source.replace(
      "      - name: typecheck\n",
      "      - run: pnpm run typecheck\n",
    );
    const problems: string[] = evaluateGateCoverage(mutated, mapped, manifest.scripts).problems;
    expect(problems).toContain(
      "blocking step 9 of certification-gates (certification-gates) has no name",
    );
  });

  it("does not demote a no-script gate renamed to another job's plumbing step", () => {
    const mutated = source.replace(
      "      - name: comparison floors pair\n",
      "      - name: Publish summary\n",
    );
    const mapped2 = structuredClone(mapped);
    const oldKey = "comparison floors: pair budgets / comparison floors pair";
    mapped2.steps["comparison floors: pair budgets / Publish summary"] = mapped2.steps[oldKey];
    delete mapped2.steps[oldKey];
    const clean = evaluateGateCoverage(source, mapped, manifest.scripts);
    const result = evaluateGateCoverage(mutated, mapped2, manifest.scripts);
    expect(result.problems).toEqual([]);
    expect(result.sentence).toBe(clean.sentence);
  });

  it("names a stale coverage sentence beside the current one", () => {
    const docs = Object.fromEntries(sentenceDocs.map((file) => [file, readFileSync(file, "utf8")]));
    const clean = evaluateGateCoverage(source, mapped, manifest.scripts, docs);
    expect(clean.problems).toEqual([]);
    const sentence = clean.sentence ?? "";
    const stale = sentence.replace(/\d+/, (digits: string) => String(Number(digits) + 1));
    const problems: string[] = evaluateGateCoverage(source, mapped, manifest.scripts, {
      ...docs,
      ".claude/current/certification.md": `${docs[".claude/current/certification.md"]}\n${stale}\n`,
    }).problems;
    expect(problems).toEqual([
      ".claude/current/certification.md has a stale coverage sentence beside the current one",
    ]);
  });

  it("does not accept a bare plumbing name as a full step key", () => {
    const mapped2 = structuredClone(mapped);
    mapped2.plumbing = ["Install dependencies"];
    const problems: string[] = evaluateGateCoverage(source, mapped2, manifest.scripts).problems;
    expect(problems).toContain('plumbing name "Install dependencies" matches no blocking step');
  });
});

describe("checkGateCoverage", () => {
  it("passes this repository and states the coverage fact", () => {
    expect(checkGateCoverage()).toBe(0);
  });
});

describe("invokedScripts", () => {
  it("sees an env-prefixed run", () => {
    expect(invokedScripts("CI=1 pnpm run x")).toEqual(["x"]);
  });

  it("sees a run after then", () => {
    expect(invokedScripts("if [ -f x ]; then pnpm run x; fi")).toEqual(["x"]);
  });

  it("sees both sides of a single &", () => {
    expect(invokedScripts("pnpm run a & pnpm run b")).toEqual(["a", "b"]);
  });

  it("sees both sides of a single |", () => {
    expect(invokedScripts("pnpm run a | pnpm run b")).toEqual(["a", "b"]);
  });

  it("sees runs inside parentheses", () => {
    expect(invokedScripts("(pnpm run a); (pnpm run b)")).toEqual(["a", "b"]);
  });

  it("ignores a heredoc body", () => {
    expect(invokedScripts("cat <<EOF\n  pnpm run typecheck\n  EOF")).toEqual([]);
  });

  it("ignores a quoted echo", () => {
    expect(invokedScripts('echo "\n  pnpm run typecheck"')).toEqual([]);
  });

  it("keeps then when it is the script name", () => {
    expect(invokedScripts("pnpm run then")).toEqual(["then"]);
    expect(invokedScripts("echo then")).toEqual([]);
  });

  it("does not record the script after a run flag", () => {
    expect(invokedScripts("vp run --filter @proyecto-viviana/web build")).toEqual([]);
    expect(invokedScripts("pnpm run typecheck -- --flag")).toEqual(["typecheck"]);
  });

  it("sees a run inside an unquoted command substitution", () => {
    expect(invokedScripts("FOO=$(pnpm run x) pnpm run y")).toEqual(["x", "y"]);
    expect(invokedScripts('echo "pnpm run hidden"')).toEqual([]);
  });
});
