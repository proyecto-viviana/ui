import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

import {
  inventoryCertifiedObligations,
  inventoryValidationNotes,
  parseGateOutcomeTable,
  summarizeNoteInventory,
  unresolvedVisualStatePointers,
} from "./acceptance-inventory";
import {
  classifyGateOutcome,
  evidencePointersFromSpec,
  resolveEvidenceFile,
  splitSpecString,
} from "./acceptance-schema";

const here = dirname(fileURLToPath(import.meta.url));
const comparisonRoot = resolve(here, "../..");
const repoRoot = resolve(comparisonRoot, "../..");

describe("acceptance schema", () => {
  it("keeps only complete/partial/not-started as canonical outcomes", () => {
    expect(classifyGateOutcome("complete").kind).toBe("complete");
    expect(classifyGateOutcome("partial").kind).toBe("partial");
    expect(classifyGateOutcome("not-started").kind).toBe("not-started");
    expect(classifyGateOutcome("pending").kind).toBe("unnormalized");
    expect(classifyGateOutcome("done").kind).toBe("unnormalized");
    expect(classifyGateOutcome("passing").kind).toBe("unnormalized");
    expect(classifyGateOutcome("accepted").kind).toBe("unnormalized");
    expect(classifyGateOutcome("covered").kind).toBe("unnormalized");
    expect(classifyGateOutcome("").kind).toBe("missing");
  });

  it("splits free-form spec strings into file pointers", () => {
    expect(splitSpecString("e2e/a.spec.ts + e2e/b.spec.ts")).toEqual([
      "e2e/a.spec.ts",
      "e2e/b.spec.ts",
    ]);
    expect(
      evidencePointersFromSpec(
        "e2e/modeled-controls-contract.spec.ts; packages/solid-spectrum/test/Color.test.tsx",
      ).map((pointer) => pointer.file),
    ).toEqual([
      "e2e/modeled-controls-contract.spec.ts",
      "packages/solid-spectrum/test/Color.test.tsx",
    ]);
  });

  it("resolves comparison-relative and repo-root evidence files", () => {
    expect(
      resolveEvidenceFile("e2e/certified/calendar.certified.spec.ts", {
        comparisonRoot,
        repoRoot,
      }),
    ).toBe(resolve(comparisonRoot, "e2e/certified/calendar.certified.spec.ts"));
    expect(
      resolveEvidenceFile("packages/solid-spectrum/test/Color.test.tsx", {
        comparisonRoot,
        repoRoot,
      }),
    ).toBe(resolve(repoRoot, "packages/solid-spectrum/test/Color.test.tsx"));
    expect(resolveEvidenceFile("e2e/does-not-exist.spec.ts", { comparisonRoot, repoRoot })).toBe(
      null,
    );
  });
});

describe("acceptance inventory", () => {
  it("parses a ten-gate outcome table and does not treat passing as complete", () => {
    const rows = parseGateOutcomeTable(`
## Gate Outcome Summary

| Gate                                     | Outcome | Evidence | Blockers/owner |
| ---------------------------------------- | ------- | -------- | -------------- |
| Official Docs And Viewer Parity          | partial | docs     | owner          |
| Solid Idiomatic Implementation           | passing | wrapper  | none           |
| Evidence And Handoff                     | complete | commands | none           |

### 1. Official Docs And Viewer Parity
`);

    expect(rows.map((row) => [row.gate, row.outcome.kind])).toEqual([
      ["Official Docs And Viewer Parity", "partial"],
      ["Solid Idiomatic Implementation", "unnormalized"],
      ["Evidence And Handoff", "complete"],
    ]);
  });

  it("inventories every validation note without treating file presence as complete", () => {
    const notes = inventoryValidationNotes(resolve(comparisonRoot, "playbook/components"));
    const summary = summarizeNoteInventory(notes);

    expect(summary.notes).toBeGreaterThan(0);
    expect(summary.allTenComplete).toBeLessThan(summary.notes);
    expect(summary.missingTable).toBeGreaterThan(0);
    expect(summary.outcomeKindCounts.unnormalized).toBeGreaterThan(0);
  });

  it("resolves every visual-state-matrix spec pointer", () => {
    expect(unresolvedVisualStatePointers({ comparisonRoot, repoRoot })).toEqual([]);
  });

  it("names the six certified knownDivergence fixmes", () => {
    const { expectedFixmes } = inventoryCertifiedObligations(
      resolve(comparisonRoot, "e2e/certified"),
    );
    const keys = expectedFixmes.map((item) => `${item.spec}::${item.caseId}`).sort();

    expect(keys).toEqual(
      [
        "breadcrumbs.certified.spec.ts::overflow",
        "datepicker.certified.spec.ts::placeholder · open-escape-close",
        "daterangepicker.certified.spec.ts::placeholder · open-escape-close",
        "rangeslider.certified.spec.ts::default",
        "slider.certified.spec.ts::default",
        "tableview.certified.spec.ts::sorted",
      ].sort(),
    );
  });
});
