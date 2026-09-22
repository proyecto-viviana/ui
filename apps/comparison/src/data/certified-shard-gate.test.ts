import { describe, expect, it } from "vite-plus/test";

import {
  certifiedShardVerdict,
  emptyTotals,
  type CertifiedSummary,
} from "../../scripts/certified-summary";

const failure = {
  component: "button",
  driver: "D1" as const,
  file: "e2e/certified/button.certified.spec.ts",
  title: "D1 — Button › renders",
};

function summary(overrides: Partial<CertifiedSummary> = {}): CertifiedSummary {
  return {
    generatedAt: "2026-09-21T00:00:00.000Z",
    revision: null,
    shard: { current: 3, total: 8 },
    runStatus: "failed",
    errors: [],
    totals: emptyTotals(),
    cells: [],
    waived: [],
    unwaived: [],
    waiverProblems: [],
    ...overrides,
  };
}

// The shard job's verdict, not Playwright's exit code: a waived failure exits 1
// too, and the run conclusion is what `check-release-evidence.mjs` reads (#589).
describe("certifiedShardVerdict", () => {
  it("is green when playwright exited 0, with no summary to consult", () => {
    expect(certifiedShardVerdict(null, 0)).toEqual({ red: false, reason: "the shard exited 0" });
  });

  it("is green when every failure the shard saw is waived", () => {
    const verdict = certifiedShardVerdict(
      summary({
        totals: { ...emptyTotals(), passed: 10, waived: 1 },
        waived: [{ failure, ticket: 553 }],
      }),
      1,
    );
    expect(verdict.red).toBe(false);
    expect(verdict.reason).toContain("1 waived case");
  });

  it("is red when a failure is not waived", () => {
    const verdict = certifiedShardVerdict(
      summary({
        totals: { ...emptyTotals(), passed: 10, failed: 1 },
        unwaived: [failure],
      }),
      1,
    );
    expect(verdict.red).toBe(true);
    expect(verdict.reason).toContain("1 unwaived failure");
  });

  it("is red when the waiver that would cover the failure is itself a problem", () => {
    const verdict = certifiedShardVerdict(
      summary({
        totals: { ...emptyTotals(), waived: 1 },
        waived: [{ failure, ticket: 553 }],
        waiverProblems: [
          {
            kind: "expired",
            waiver: {
              pattern: "button",
              ticket: 553,
              expires: "2026-01-01",
              ticketStatus: "in-progress",
              reason: "the fixture's own row; what a user sees goes here",
            },
            detail: "expired 2026-01-01",
          },
        ],
      }),
      1,
    );
    expect(verdict.red).toBe(true);
    expect(verdict.reason).toContain("waiver problem");
  });

  it("is red when the shard wrote no summary at all", () => {
    const verdict = certifiedShardVerdict(null, 1);
    expect(verdict.red).toBe(true);
    expect(verdict.reason).toContain("wrote no summary");
  });

  it("is red when the shard died without explaining its exit", () => {
    const verdict = certifiedShardVerdict(summary({ runStatus: null }), 1);
    expect(verdict.red).toBe(true);
    expect(verdict.reason).toContain("does not explain its own exit");
  });

  it("is red when a spec failed to load, however well waived the rest is", () => {
    const verdict = certifiedShardVerdict(
      summary({
        totals: { ...emptyTotals(), waived: 1 },
        waived: [{ failure, ticket: 553 }],
        errors: [{ file: "e2e/certified/button.certified.spec.ts", message: "boom" }],
      }),
      1,
    );
    expect(verdict.red).toBe(true);
    expect(verdict.reason).toContain("load-error");
  });

  it("is red when the run was interrupted rather than failed", () => {
    const verdict = certifiedShardVerdict(
      summary({
        runStatus: "interrupted",
        totals: { ...emptyTotals(), waived: 1 },
        waived: [{ failure, ticket: 553 }],
      }),
      1,
    );
    expect(verdict.red).toBe(true);
    expect(verdict.reason).toContain("run status interrupted");
  });

  it("is red when the summary counts failures it can neither waive nor name", () => {
    const verdict = certifiedShardVerdict(
      summary({
        totals: { ...emptyTotals(), passed: 3, failed: 2 },
        unwaived: [],
        waived: [],
      }),
      1,
    );
    expect(verdict.red).toBe(true);
    expect(verdict.reason).toContain("names no failure to waive");
  });
});
