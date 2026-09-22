import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
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
  readTicketStatus,
  reconcileWaiverTickets,
  repoRootFromComparison,
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
    ticketStatus: "in-progress",
    ...overrides,
  };
}

describe("certified waivers", () => {
  // This held the tracked file at `[]` until #578 carried the three
  // behaviour-class reds of Certification Gates 35668806426 as waivers. An
  // emptiness assertion cannot survive a list that exists, so what is held
  // instead is the shape the certified verdict reads: the file loads with no
  // problems, every entry names a ticket the board still has open, and the
  // recorded `ticketStatus` is the board's own. That last read is
  // `guard:certified-waiver-tickets`' job in CI; asserting it here as well
  // means a stale entry fails inside the suite too, not only in the guard.
  it("keeps the tracked waiver file loadable and ticket-backed", () => {
    const root = comparisonRootFrom(import.meta.url);
    const loaded = loadCertifiedWaivers(join(here, "../../e2e/certified-waivers.json"));
    expect(loaded.problems).toEqual([]);
    expect(loaded.waivers.length).toBeGreaterThan(0);
    expect(
      reconcileWaiverTickets({
        waivers: loaded.waivers,
        ticketStatus: (ticketId) => readTicketStatus(repoRootFromComparison(root), ticketId).status,
      }),
    ).toEqual([]);
    const closed = loaded.waivers.filter((entry) =>
      ["verified", "merged", "closed"].includes(entry.ticketStatus),
    );
    expect(closed).toEqual([]);
  });

  it("rejects a waiver file that is not an array of pattern/ticket/expires/ticketStatus", () => {
    expect(parseWaiverEntries(waiver()).problems).toEqual([
      expect.objectContaining({
        kind: "invalid-entry",
        detail: expect.stringContaining("must be an array"),
      }),
    ]);
    expect(parseWaiverEntries([waiver({ pattern: "" })]).problems).toEqual([
      expect.objectContaining({ kind: "invalid-entry" }),
    ]);
    expect(
      parseWaiverEntries([{ ...waiver(), ticket: "240" as unknown as number }]).problems,
    ).toEqual([expect.objectContaining({ kind: "invalid-entry" })]);
    expect(parseWaiverEntries([waiver({ expires: "12-31-2026" })]).problems).toEqual([
      expect.objectContaining({ kind: "invalid-entry" }),
    ]);
  });

  // The recorded state is what the merged verdict waives on, so an entry
  // without it is not a waiver (#574).
  it("rejects a waiver that records no ticket state", () => {
    const { ticketStatus: _dropped, ...withoutStatus } = waiver();
    expect(parseWaiverEntries([withoutStatus]).problems).toEqual([
      expect.objectContaining({
        kind: "invalid-entry",
        detail: expect.stringContaining("ticketStatus"),
      }),
    ]);
    expect(parseWaiverEntries([waiver({ ticketStatus: "" })]).problems).toEqual([
      expect.objectContaining({ kind: "invalid-entry" }),
    ]);
  });

  it("rejects a pattern that is not a regular expression", () => {
    expect(parseWaiverEntries([waiver({ pattern: "(" })]).problems).toEqual([
      expect.objectContaining({ kind: "invalid-pattern" }),
    ]);
  });

  it("turns a matching failure into waived (ticket) and does not fail the gate", () => {
    const evaluation = evaluateCertifiedWaivers({
      waivers: [waiver()],
      failures: [failure()],
      now,
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
    });

    expect(evaluation.unwaived).toEqual([unmatched]);
    expect(waiverGateFails(evaluation)).toBe(true);
  });

  it("fails the job when a waiver's expires date has passed", () => {
    const evaluation = evaluateCertifiedWaivers({
      waivers: [waiver({ expires: "2026-09-01" })],
      failures: [failure()],
      now,
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

  it("fails the job when the waiver records a verified, merged or closed ticket", () => {
    for (const status of ["verified", "merged", "closed"] as const) {
      const evaluation = evaluateCertifiedWaivers({
        waivers: [waiver({ ticketStatus: status })],
        failures: [failure()],
        now,
      });
      expect(evaluation.problems).toEqual([
        expect.objectContaining({
          kind: "ticket-closed",
          detail: `waiver ticket #240 is ${status}; remove the waiver`,
        }),
      ]);
      // A closed ticket stops waiving, like an expired date: the failure is the
      // job's again, not just a problem beside it.
      expect(evaluation.waived).toEqual([]);
      expect(evaluation.unwaived).toEqual([failure()]);
      expect(waiverGateFails(evaluation)).toBe(true);
    }
  });

  // #574. `certifiedSuiteCoveredPathspecs` excludes `.claude/**`, so a verdict
  // that resolved the ticket state out of the board could change without the
  // postcard seeing it: one commit editing `status:` in a ticket file flips the
  // merger's exit code while `git diff` over the covered paths lists nothing.
  // The state is a field of the covered waiver file now, and the board is
  // reconciled against it outside the run.
  it("keeps the board out of the certified verdict", () => {
    for (const relative of [
      "../../scripts/merge-certified-reports.ts",
      "../../e2e/reporters/certified-summary.ts",
    ]) {
      const source = readFileSync(join(here, relative), "utf8");
      expect({ relative, reads: /readTicketStatus|\.claude\//.test(source) }).toEqual({
        relative,
        reads: false,
      });
    }
  });

  it("reconciles a recorded ticket state that the board has moved past", () => {
    expect(
      reconcileWaiverTickets({ waivers: [waiver()], ticketStatus: () => "in-progress" }),
    ).toEqual([]);
    expect(reconcileWaiverTickets({ waivers: [waiver()], ticketStatus: () => "closed" })).toEqual([
      expect.objectContaining({
        kind: "ticket-stale",
        detail: "waiver ticket #240 records in-progress; the board says closed",
      }),
    ]);
  });

  it("reconciles a waiver ticket that is missing from the board", () => {
    expect(reconcileWaiverTickets({ waivers: [waiver()], ticketStatus: () => null })).toEqual([
      expect.objectContaining({
        kind: "ticket-missing",
        detail: "waiver ticket #240 is not on the board",
      }),
    ]);
  });

  it("reads a tracked waiver file from disk", () => {
    const dir = mkdtempSync(join(tmpdir(), "certified-waivers-"));
    const path = join(dir, "certified-waivers.json");
    const tracked = waiver({
      pattern: "picker",
      ticket: 99,
      expires: "2026-10-01",
      ticketStatus: "next",
    });
    writeFileSync(path, `${JSON.stringify([tracked], null, 2)}\n`);
    const loaded = loadCertifiedWaivers(path);
    expect(loaded.problems).toEqual([]);
    expect(loaded.waivers).toEqual([tracked]);
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
    expect(
      parseDriverId(["chromium", "D14 native validity — TextField native validity", "invalid"]),
    ).toBe("D14");
    expect(
      parseComponentFromTitlePath([
        "chromium",
        "D14 native validity — TextField native validity",
        "invalid · submit attempt",
      ]),
    ).toBe("textfield-native-validity");
    expect(parseDriverId(["chromium", "D13 journeys — ComboBox", "open list"])).toBe("D13");
  });
});

// `reconcileWaiverTickets` is unit-tested above with a stub board; nothing drove
// the guard that runs it. The tracked `e2e/certified-waivers.json` held `[]`
// until #578, so every CI run of `guard:certified-waiver-tickets` iterated zero
// waivers and its green line said only that the list was empty — a wrong path
// or a swallowed exit code would have read the same. It holds three entries
// now, so the guard's green line means something in CI; these cases stay,
// because the refusals are what no tracked list may ever exercise.
describe("guard:certified-waiver-tickets end to end", () => {
  const comparisonRoot = comparisonRootFrom(import.meta.url);
  const repoRoot = repoRootFromComparison(comparisonRoot);
  const guard = join(comparisonRoot, "scripts/check-certified-waiver-tickets.ts");
  const tsx = join(repoRoot, "node_modules/.bin/tsx");

  function run(...args: string[]) {
    const result = spawnSync(tsx, [guard, ...args], { encoding: "utf8" });
    expect(result.error).toBeUndefined();
    return { status: result.status, stdout: result.stdout ?? "", stderr: result.stderr ?? "" };
  }

  function withWaivers(entries: CertifiedWaiver[], ...args: string[]) {
    const path = join(mkdtempSync(join(tmpdir(), "certified-waiver-tickets-")), "waivers.json");
    writeFileSync(path, `${JSON.stringify(entries, null, 2)}\n`);
    return run("--waivers", path, ...args);
  }

  // The board state is read, never asserted: this ticket's own state moves.
  const boardStatus = () => {
    const recorded = readTicketStatus(repoRoot, 574).status;
    expect(recorded).not.toBeNull();
    return recorded as string;
  };

  it("exits 1 naming both a stale recorded state and a ticket the board never had", () => {
    const status = boardStatus();
    const result = withWaivers([
      waiver({ ticket: 574, expires: "2099-12-31", ticketStatus: `not-${status}` }),
      waiver({ ticket: 9_999_999, expires: "2099-12-31" }),
    ]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      `ticket-stale: waiver ticket #574 records not-${status}; the board says ${status}`,
    );
    expect(result.stderr).toContain("ticket-missing: waiver ticket #9999999 is not on the board");
  });

  it("exits 0 over a non-empty list whose every recorded state matches the board", () => {
    const result = withWaivers([
      waiver({ ticket: 574, expires: "2099-12-31", ticketStatus: boardStatus() }),
    ]);
    expect(result.status).toBe(0);
    expect(result.stdout).toContain("1 waiver(s)");
    expect(result.stdout).toContain("agree with the board");
  });

  it("fails closed on a waiver file it cannot read", () => {
    const result = run("--waivers", join(tmpdir(), "certified-waivers-absent-1c7f3a.json"));
    expect(result.status).toBe(1);
    expect(result.stderr).toContain("certified waivers file is missing");
  });

  it("refuses an argument it does not understand rather than grading the default list", () => {
    const result = run("--waiver", "typo.json");
    expect(result.status).toBe(2);
    expect(result.stderr).toContain("unknown argument: --waiver");
  });

  it("grades the tracked list when CI passes no arguments", () => {
    const result = run();
    expect(result.status).toBe(0);
    expect(result.stdout).toContain(defaultWaiversPath(comparisonRoot));
  });
});
