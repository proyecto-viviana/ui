import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

import {
  parseComponentFromTitlePath,
  parseComponentSlug,
  parseDriverId,
} from "../../scripts/certified-summary";
import {
  comparisonRootFrom,
  defaultWaiversPath,
  evaluateCertifiedWaivers,
  loadCertifiedWaivers,
  parseWaiverEntries,
  utcDateStamp,
  waiverGateFails,
  type CertifiedFailure,
  type CertifiedWaiver,
} from "../../scripts/certified-waivers";

const here = dirname(fileURLToPath(import.meta.url));
const now = new Date("2026-09-02T12:00:00.000Z");

function failure(overrides: Partial<CertifiedFailure> = {}): CertifiedFailure {
  return {
    component: "combobox",
    driver: "D3",
    file: "e2e/certified/combobox.certified.spec.ts",
    title: "D3 pixel diff — ComboBox › default · light",
    ...overrides,
  };
}

function waiver(overrides: Partial<CertifiedWaiver> = {}): CertifiedWaiver {
  return {
    pattern: "combobox\\.certified.*D3",
    ticket: 240,
    expires: "2026-12-31",
    ...overrides,
  };
}

describe("certified waivers", () => {
  it("keeps the tracked waiver file as a valid empty list", () => {
    const loaded = loadCertifiedWaivers(join(here, "../../e2e/certified-waivers.json"));
    expect(loaded.problems).toEqual([]);
    expect(loaded.waivers).toEqual([]);
  });

  it("rejects a waiver file that is not an array of pattern/ticket/expires", () => {
    expect(parseWaiverEntries({ pattern: "x", ticket: 1, expires: "2026-12-31" }).problems).toEqual(
      [
        expect.objectContaining({
          kind: "invalid-entry",
          detail: expect.stringContaining("must be an array"),
        }),
      ],
    );
    expect(
      parseWaiverEntries([{ pattern: "", ticket: 1, expires: "2026-12-31" }]).problems,
    ).toEqual([expect.objectContaining({ kind: "invalid-entry" })]);
    expect(
      parseWaiverEntries([{ pattern: "D3", ticket: "240", expires: "2026-12-31" }]).problems,
    ).toEqual([expect.objectContaining({ kind: "invalid-entry" })]);
    expect(
      parseWaiverEntries([{ pattern: "D3", ticket: 1, expires: "12-31-2026" }]).problems,
    ).toEqual([expect.objectContaining({ kind: "invalid-entry" })]);
  });

  it("rejects a pattern that is not a regular expression", () => {
    expect(
      parseWaiverEntries([{ pattern: "(", ticket: 1, expires: "2026-12-31" }]).problems,
    ).toEqual([expect.objectContaining({ kind: "invalid-pattern" })]);
  });

  it("turns a matching failure into waived (ticket) and does not fail the gate", () => {
    const evaluation = evaluateCertifiedWaivers({
      waivers: [waiver()],
      failures: [failure()],
      now,
      ticketStatus: () => "in-progress",
    });

    expect(evaluation.unwaived).toEqual([]);
    expect(evaluation.waived).toEqual([{ failure: failure(), waiver: waiver() }]);
    expect(evaluation.problems).toEqual([]);
    expect(waiverGateFails(evaluation)).toBe(false);
  });

  it("leaves an unmatched failure unwaived so the job still fails", () => {
    const unmatched = failure({
      component: "picker",
      file: "e2e/certified/picker.certified.spec.ts",
      title: "D1 state matrix — Picker › default · light",
    });
    const evaluation = evaluateCertifiedWaivers({
      waivers: [waiver()],
      failures: [failure(), unmatched],
      now,
      ticketStatus: () => "in-progress",
    });

    expect(evaluation.unwaived).toEqual([unmatched]);
    expect(waiverGateFails(evaluation)).toBe(true);
  });

  it("fails the job when a waiver's expires date has passed", () => {
    const evaluation = evaluateCertifiedWaivers({
      waivers: [waiver({ expires: "2026-09-01" })],
      failures: [failure()],
      now,
      ticketStatus: () => "open",
    });

    expect(evaluation.problems).toEqual([
      expect.objectContaining({
        kind: "expired",
        detail: "waiver for ticket #240 expired on 2026-09-01",
      }),
    ]);
    expect(evaluation.waived).toEqual([]);
    expect(evaluation.unwaived).toEqual([failure()]);
    expect(waiverGateFails(evaluation)).toBe(true);
    expect(utcDateStamp(now)).toBe("2026-09-02");
  });

  it("fails the job when the waiver ticket is verified or merged", () => {
    for (const status of ["verified", "merged", "closed"] as const) {
      const evaluation = evaluateCertifiedWaivers({
        waivers: [waiver()],
        failures: [],
        now,
        ticketStatus: () => status,
      });
      expect(evaluation.problems).toEqual([
        expect.objectContaining({
          kind: "ticket-closed",
          detail: `waiver ticket #240 is ${status}; remove the waiver`,
        }),
      ]);
      expect(waiverGateFails(evaluation)).toBe(true);
    }
  });

  it("fails the job when the waiver ticket is missing from the board", () => {
    const evaluation = evaluateCertifiedWaivers({
      waivers: [waiver()],
      failures: [failure()],
      now,
      ticketStatus: () => null,
    });
    expect(evaluation.problems).toEqual([expect.objectContaining({ kind: "ticket-missing" })]);
    expect(waiverGateFails(evaluation)).toBe(true);
  });

  it("reads a tracked waiver file from disk", () => {
    const dir = mkdtempSync(join(tmpdir(), "certified-waivers-"));
    const path = join(dir, "certified-waivers.json");
    writeFileSync(
      path,
      `${JSON.stringify([waiver({ pattern: "picker", ticket: 99, expires: "2026-10-01" })], null, 2)}\n`,
    );
    const loaded = loadCertifiedWaivers(path);
    expect(loaded.problems).toEqual([]);
    expect(loaded.waivers).toEqual([
      waiver({ pattern: "picker", ticket: 99, expires: "2026-10-01" }),
    ]);
  });

  it("resolves the comparison root from nested modules so waivers are not e2e/e2e", () => {
    const root = comparisonRootFrom(import.meta.url);
    expect(root.replaceAll("\\", "/")).toMatch(/apps\/comparison$/);
    expect(loadCertifiedWaivers(defaultWaiversPath(root)).problems).toEqual([]);
  });

  it("reads the component and driver from certified titles, not the driver file path", () => {
    expect(parseDriverId(["chromium", "D3 pixel diff — ActionButton", "default · light"])).toBe(
      "D3",
    );
    expect(
      parseComponentFromTitlePath(["chromium", "D3 pixel diff — ActionButton", "default · light"]),
    ).toBe("actionbutton");
    expect(
      parseComponentFromTitlePath([
        "chromium",
        "D-scroll window — ComboBox",
        "default · visible window + windowed AX",
      ]),
    ).toBe("combobox");
    expect(parseComponentSlug("e2e/drivers/pixel.ts")).toBeNull();
    expect(parseComponentSlug("e2e/certified/button-d12.certified.spec.ts")).toBe("button-d12");
  });
});
