import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

import {
  inventoryCertifiedObligations,
  inventoryVisualStateEvidence,
  inventoryValidationNotes,
  parseGateOutcomeTable,
  summarizeNoteInventory,
  summarizeVisualStateEvidence,
  unresolvedVisualStatePointers,
} from "./acceptance-inventory";
import {
  classifyGateOutcome,
  evidencePointersFromSpec,
  resolveEvidenceFile,
  resolveRunnableEvidencePointer,
  splitSpecString,
} from "./acceptance-schema";
import {
  certifiedSuitePostcardCurrency,
  type PostcardGitProbe,
  lastFullCertifiedSuiteRun,
  lastHeadCertifiedSubsetRun,
  validateCertifiedSuiteEvidence,
} from "./certified-suite-evidence";

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

  it("resolves structured evidence only when the exact runnable title exists", () => {
    const pointer = {
      file: "e2e/actionmenu-contract.spec.ts",
      title: "ActionMenu semantic accessibility contracts pass on both stacks",
    };

    expect(resolveRunnableEvidencePointer(pointer, { comparisonRoot, repoRoot })).toBe(
      resolve(comparisonRoot, pointer.file),
    );
    expect(
      resolveRunnableEvidencePointer(
        { ...pointer, title: "A descriptive sentence that is not a runnable test" },
        { comparisonRoot, repoRoot },
      ),
    ).toBe(null);
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

  it("distinguishes resolved structured evidence from legacy file-only claims", () => {
    const summary = summarizeVisualStateEvidence(
      inventoryVisualStateEvidence({ comparisonRoot, repoRoot }),
    );

    expect(summary.resolved).toBeGreaterThan(0);
    expect(summary.legacy).toBeGreaterThan(0);
    expect(summary.invalid).toBe(0);
  });

  it("requires zero current certified knownDivergence fixmes", () => {
    const { expectedFixmes } = inventoryCertifiedObligations(
      resolve(comparisonRoot, "e2e/certified"),
    );
    const keys = expectedFixmes.map((item) => `${item.spec}::${item.caseId}`).sort();

    expect(keys).toEqual([]);
  });

  it("preserves historical postcard counts and rejects them as current inventory", () => {
    const historical = {
      revision: "08793320540f06c7bdbfb229bbd3cb161b2ba1f5",
      runId: 37176592599,
      jobId: 111362935087,
      completedAt: "2026-10-04T04:36:40Z",
      total: 2181,
      passed: 2175,
      failed: 0,
      skipped: 4,
      waived: 2,
    };
    const { expectedFixmes } = inventoryCertifiedObligations(
      resolve(comparisonRoot, "e2e/certified"),
    );

    expect(validateCertifiedSuiteEvidence(historical, 4)).toEqual([]);
    expect(expectedFixmes).toHaveLength(0);
    expect(validateCertifiedSuiteEvidence(historical, expectedFixmes.length)).toContain(
      "skipped=4 does not match 0 registered known divergences",
    );
    expect(
      validateCertifiedSuiteEvidence({ ...historical, passed: historical.passed - 1 }, 4),
    ).toContain("passed, failed, and skipped counts must add up to total");
  });

  it("requires truthful complete portable local provenance and rejects mixed or partial records", () => {
    const revision = "a".repeat(40);
    const completedAt = "2026-10-09T00:00:00.000Z";
    const local = {
      revision,
      completedAt,
      total: 8,
      passed: 8,
      failed: 0,
      skipped: 0,
      localMergeReceipt: {
        path: ".agents/synthetic-certified-test.json",
        sha256: "b".repeat(64),
      },
    };
    // Synthetic schema fixture; it is not a recorded browser qualification.
    const totals = { passed: 8, failed: 0, skipped: 0, waived: 0, flaky: 0 };
    const receipt = {
      revision,
      completedAt,
      totals,
      merge: {
        script: "apps/comparison/scripts/merge-certified-reports.ts",
        expectedShards: 8,
        actualProcessExitCode: 0,
        timedOut: false,
        ownedClosureEstablished: true,
        allBoundInputsConserved: true,
        completedWithinGrant: true,
        remainingOwnedProcesses: [],
        receiptSha256: "c".repeat(64),
        summarySha256: "d".repeat(64),
      },
      shards: Array.from({ length: 8 }, (_, index) => ({
        shard: index + 1,
        totalShards: 8,
        revision,
        scope: "e2e/certified",
        workers: 2,
        actualProcessExitCode: 0,
        rawPlaywrightExitCode: 0,
        originalWaiverAwareGateExitCode: 0,
        timedOut: false,
        ownedClosureEstablished: true,
        allBoundInputsConserved: true,
        completedWithinGrant: true,
        remainingOwnedProcesses: [],
        runStatus: "passed",
        closedReturnSha256: "e".repeat(64),
        summarySha256: "f".repeat(64),
        totals: { ...totals, passed: 1 },
      })),
    };
    expect(validateCertifiedSuiteEvidence(local, 0, receipt)).toEqual([]);
    Reflect.set(local, "runId", 1);
    expect(validateCertifiedSuiteEvidence(local, 0, receipt)).toContain(
      "local merge provenance must not include GitHub run/job IDs",
    );
    Reflect.deleteProperty(local, "runId");
    expect(
      validateCertifiedSuiteEvidence(
        {
          ...local,
          localMergeReceipt: { ...local.localMergeReceipt, sha256: "0".repeat(64) },
        },
        0,
        receipt,
      ),
    ).toContain(
      "local provenance requires a portable .agents JSON receipt and non-placeholder SHA256",
    );
    for (const path of [".agents/%2e%2e%2foutside.json", ".agents/nested/receipt.json"]) {
      expect(
        validateCertifiedSuiteEvidence(
          { ...local, localMergeReceipt: { ...local.localMergeReceipt, path } },
          0,
          receipt,
        ),
      ).toContain(
        "local provenance requires a portable .agents JSON receipt and non-placeholder SHA256",
      );
    }
    expect(validateCertifiedSuiteEvidence(local, 0)).not.toEqual([]);
    expect(
      validateCertifiedSuiteEvidence(local, 0, { ...receipt, shards: receipt.shards.slice(0, 7) }),
    ).not.toEqual([]);
    expect(
      validateCertifiedSuiteEvidence(local, 0, {
        ...receipt,
        shards: receipt.shards.map((shard) => ({ ...shard, shard: 1 })),
      }),
    ).not.toEqual([]);
    expect(
      validateCertifiedSuiteEvidence(local, 0, { ...receipt, totals: { ...totals, skipped: 1 } }),
    ).not.toEqual([]);
    expect(
      validateCertifiedSuiteEvidence(local, 0, {
        ...receipt,
        merge: { ...receipt.merge, actualProcessExitCode: 1 },
      }),
    ).not.toEqual([]);
  });

  it("holds the postcard current only through ancestry plus unchanged covered paths", () => {
    const probe = (over: Partial<PostcardGitProbe> = {}): PostcardGitProbe => ({
      hasCommit: () => true,
      isAncestor: () => true,
      changedCoveredPaths: () => [],
      dirtyCoveredPaths: () => [],
      ...over,
    });
    const head = "a".repeat(40);
    const currency = (git: PostcardGitProbe, at: string | null = head) =>
      certifiedSuitePostcardCurrency(lastFullCertifiedSuiteRun, at, git);

    expect(currency(probe())).toEqual({ current: true });
    expect(currency(probe(), null)).toEqual({ current: false, reason: "HEAD is unknown" });
    expect(currency(probe({ hasCommit: () => false }))).toMatchObject({
      current: false,
      reason: expect.stringContaining("fetch-depth: 0"),
    });
    expect(currency(probe({ isAncestor: () => false }))).toMatchObject({
      current: false,
      reason: expect.stringContaining("not an ancestor of HEAD"),
    });
    expect(
      currency(probe({ changedCoveredPaths: () => ["packages/a/src/x.ts", "b", "c", "d"] })),
    ).toEqual({
      current: false,
      reason: "4 certified path(s) changed since it: packages/a/src/x.ts, b, c, and 1 more",
    });
    expect(currency(probe({ dirtyCoveredPaths: () => ["apps/comparison/e2e/x.spec.ts"] }))).toEqual(
      {
        current: false,
        reason: "1 certified path(s) are uncommitted: apps/comparison/e2e/x.spec.ts",
      },
    );
    expect(
      lastHeadCertifiedSubsetRun == null || lastHeadCertifiedSubsetRun.complete === false,
    ).toBe(true);
  });
});
