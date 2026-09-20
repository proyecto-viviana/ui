import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";

import {
  checkRunBudgets,
  emptyTotals,
  loadCertifiedRunBudgets,
} from "../../scripts/certified-summary";
import { extractCertifiedFixmeSites, inventoryCertifiedObligations } from "./acceptance-inventory";

const comparisonRoot = join(import.meta.dirname, "..", "..");
const budgets = { skippedCeiling: 4, flakyBudget: 0 };

describe("checkRunBudgets", () => {
  it("passes a run at the ceiling and inside the budget", () => {
    expect(checkRunBudgets({ ...emptyTotals(), skipped: 4 }, budgets)).toEqual([]);
  });

  it("fails one skip above the ceiling", () => {
    const problems = checkRunBudgets({ ...emptyTotals(), skipped: 5 }, budgets);
    expect(problems.map((problem) => problem.kind)).toEqual(["over-skipped"]);
    expect(problems[0].detail).toContain("5 skipped cases, ceiling 4");
  });

  it("fails a single retry-pass against a zero budget", () => {
    const problems = checkRunBudgets({ ...emptyTotals(), flaky: 1 }, budgets);
    expect(problems.map((problem) => problem.kind)).toEqual(["over-flaky"]);
  });

  it("reports both ceilings at once", () => {
    expect(
      checkRunBudgets({ ...emptyTotals(), skipped: 40, flaky: 7 }, budgets).map(
        (problem) => problem.kind,
      ),
    ).toEqual(["over-skipped", "over-flaky"]);
  });
});

describe("loadCertifiedRunBudgets", () => {
  it("reads the committed ceilings beside the case floor", () => {
    const loaded = loadCertifiedRunBudgets(comparisonRoot);
    expect(Number.isInteger(loaded.skippedCeiling)).toBe(true);
    expect(Number.isInteger(loaded.flakyBudget)).toBe(true);
  });

  it("holds the skipped ceiling to the registered fixme sites", () => {
    const { expectedFixmes } = inventoryCertifiedObligations(
      join(comparisonRoot, "e2e", "certified"),
    );
    expect(loadCertifiedRunBudgets(comparisonRoot).skippedCeiling).toBe(expectedFixmes.length);
  });
});

describe("extractCertifiedFixmeSites", () => {
  it("counts every knownDivergences block, not only the first", () => {
    const source = `
      const spec = {
        events: {
          knownDivergences: {
            "default · press": "gap one",
          },
        },
        ax: {
          knownDivergences: {
            "default": "gap two",
          },
        },
      };
    `;
    expect(extractCertifiedFixmeSites(source)).toEqual([
      { caseId: "default · press", reason: "gap one" },
      { caseId: "default", reason: "gap two" },
    ]);
  });

  it("counts a trigger-level knownDivergence and names it by the trigger id", () => {
    const source = `
      announce: [
        {
          id: "spin-up",
          knownDivergence: "driver-level gap",
        },
      ],
    `;
    expect(extractCertifiedFixmeSites(source)).toEqual([
      { caseId: "· spin-up", reason: "driver-level gap" },
    ]);
  });

  it("finds nothing in a spec that registers no gap", () => {
    expect(extractCertifiedFixmeSites("const spec = { ax: { cases: ['default'] } };")).toEqual([]);
  });
});
