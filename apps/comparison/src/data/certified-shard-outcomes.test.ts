import { describe, expect, it } from "vite-plus/test";

import {
  checkShardOutcomes,
  emptyTotals,
  mergeCertifiedSummaries,
  type CertifiedRunStatus,
  type CertifiedSummary,
} from "../../scripts/certified-summary";

function summary(overrides: Partial<CertifiedSummary> = {}): CertifiedSummary {
  return {
    generatedAt: "2026-09-20T00:00:00.000Z",
    revision: null,
    shard: { current: 1, total: 8 },
    runStatus: "passed" as CertifiedRunStatus,
    errors: [],
    totals: emptyTotals(),
    cells: [],
    waived: [],
    unwaived: [],
    waiverProblems: [],
    ...overrides,
  };
}

describe("checkShardOutcomes", () => {
  it("passes a shard that passed and reported nothing", () => {
    expect(checkShardOutcomes([summary()])).toEqual([]);
  });

  it("fails a shard that carries a load error, whatever its run status", () => {
    const problems = checkShardOutcomes([
      summary({
        errors: [{ file: "e2e/button.certified.spec.ts", message: "x\nat spec:1" }],
      }),
    ]);
    expect(problems).toHaveLength(1);
    expect(problems[0]?.kind).toBe("load-error");
    expect(problems[0]?.shard).toBe("shard 1/8");
    expect(problems[0]?.detail).toBe("e2e/button.certified.spec.ts: x");
  });

  it("fails a non-pass run status that nothing in the summary explains", () => {
    const problems = checkShardOutcomes([summary({ runStatus: "failed" })]);
    expect(problems.map((problem) => problem.kind)).toEqual(["unexplained-status"]);
  });

  it("accepts a non-pass run status a failed case explains", () => {
    const failed = summary({
      runStatus: "failed",
      totals: { ...emptyTotals(), failed: 1 },
      unwaived: [
        { component: "button", driver: "D1", file: "e2e/button.certified.spec.ts", title: "x" },
      ],
    });
    expect(checkShardOutcomes([failed])).toEqual([]);
  });

  it("accepts a non-pass run status that only waived failures explain", () => {
    const waived = summary({
      runStatus: "failed",
      totals: { ...emptyTotals(), waived: 1 },
    });
    expect(checkShardOutcomes([waived])).toEqual([]);
  });

  it("fails an interrupted shard with no failures — a silent death", () => {
    const problems = checkShardOutcomes([summary({ runStatus: "interrupted" })]);
    expect(problems.map((problem) => problem.kind)).toEqual(["unexplained-status"]);
    expect(problems[0]?.detail).toContain("interrupted");
  });

  it("fails a summary that records no run status at all", () => {
    const problems = checkShardOutcomes([summary({ runStatus: null })]);
    expect(problems.map((problem) => problem.kind)).toEqual(["missing-status"]);
  });

  it("names the shard each problem belongs to", () => {
    const problems = checkShardOutcomes([
      summary({ shard: { current: 2, total: 8 }, runStatus: "failed" }),
      summary({ shard: null, runStatus: null }),
    ]);
    expect(problems.map((problem) => problem.shard)).toEqual(["shard 2/8", "unsharded run"]);
  });
});

describe("mergeCertifiedSummaries", () => {
  it("carries every shard's errors into the merged summary", () => {
    const merged = mergeCertifiedSummaries([
      summary({ errors: [{ file: "a.spec.ts", message: "a" }] }),
      summary({ shard: { current: 2, total: 8 }, errors: [{ file: null, message: "b" }] }),
    ]);
    expect(merged.errors).toEqual([
      { file: "a.spec.ts", message: "a" },
      { file: null, message: "b" },
    ]);
  });

  it("is passed only when every shard passed", () => {
    expect(mergeCertifiedSummaries([summary(), summary()]).runStatus).toBe("passed");
    expect(mergeCertifiedSummaries([summary(), summary({ runStatus: "timedout" })]).runStatus).toBe(
      "timedout",
    );
    expect(mergeCertifiedSummaries([summary(), summary({ runStatus: null })]).runStatus).toBe(null);
  });
});
