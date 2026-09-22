import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vite-plus/test";

import {
  certifiedCasesFromListing,
  parseComponentFromTitlePath,
  parseComponentSlug,
  parseDriverId,
  type CertifiedListingReport,
} from "../../scripts/certified-summary";
import {
  comparisonRootFrom,
  defaultWaiversPath,
  evaluateCertifiedWaivers,
  failureHaystack,
  loadCertifiedWaivers,
  parseWaiverEntries,
  readTicketStatus,
  reconcileWaiverTickets,
  repoRootFromComparison,
  utcDateStamp,
  waiverGateFails,
  waiverHorizonStamp,
  type CertifiedFailure,
  type CertifiedWaiver,
} from "../../scripts/certified-waivers";
// The suite's own discovery, the one `guard:certified-case-floor` runs:
// `playwright test e2e/certified --list`, no browser and no web server.
import { readCertifiedListing } from "../../../../scripts/check-certified-case-floor.mjs";

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
    pattern:
      "^e2e/certified/combobox\\.certified\\.spec\\.ts D3 pixel diff — ComboBox › default · light$",
    ticket: 240,
    expires: "2026-10-01",
    ticketStatus: "in-progress",
    reason: "the fixture's own row; what a user sees goes here",
    ...overrides,
  };
}

/**
 * Failures a certified report actually wrote: the four red shards of
 * Certification Gates run 35689146611 at `d6745471`, copied from the
 * `certified-shard-{2,5,7,8}` artifacts. Five waiver candidates and one of the
 * 22 ComboBox rows that must stay unwaived (#497). Every title head is the
 * project, which is what made the first five entries inert.
 */
const REPORTED_FAILURES: Record<string, CertifiedFailure> = {
  pickerPointer: {
    component: "picker-trigger",
    driver: "D13",
    file: "e2e/drivers/journeys.ts",
    title:
      "chromium › certified/picker.certified.spec.ts › D13 journeys — Picker trigger › D13 journey — open-arrow-enter-reopen-scroll-escape",
  },
  pickerKeyboard: {
    component: "picker-trigger",
    driver: "D13",
    file: "e2e/drivers/journeys.ts",
    title:
      "chromium › certified/picker.certified.spec.ts › D13 journeys — Picker trigger › D13 journey — keyboard-only",
  },
  toggleButton: {
    component: "togglebutton",
    driver: "D2",
    file: "e2e/drivers/motion.ts",
    title:
      "chromium › certified/togglebutton.certified.spec.ts › D2 motion (reduced) — ToggleButton › default · hover-transition",
  },
  toggleButtonGroup: {
    component: "togglebuttongroup",
    driver: "D2",
    file: "e2e/drivers/motion.ts",
    title:
      "chromium › certified/togglebuttongroup.certified.spec.ts › D2 motion (reduced) — ToggleButtonGroup › default · hover-transition",
  },
  tabs: {
    component: "tabs",
    driver: "D4",
    file: "e2e/drivers/events.ts",
    title:
      "chromium › certified/tabs.certified.spec.ts › D4 event sequence — Tabs › horizontal-regular · arrow-next-from-selected",
  },
  comboboxList: {
    component: "combobox-list",
    driver: "D1",
    file: "e2e/drivers/state-matrix.ts",
    title:
      "chromium › certified/combobox.certified.spec.ts › D1 state matrix — ComboBox list › size-s · dark",
  },
};

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
    // The dates are the verdict's to judge, not the loader's: an entry that has
    // expired, or that stands for longer than a release, is a problem only once
    // `evaluateCertifiedWaivers` sees it, so the tracked file is put through it.
    expect(
      evaluateCertifiedWaivers({ waivers: loaded.waivers, failures: [], now: new Date() }).problems,
    ).toEqual([]);
  });

  // #578's review, problem 2. The receipt claimed each pattern matched its own
  // rows and nothing else, and nothing ran that claim. It matters because
  // `evaluateCertifiedWaivers` has no over-broad problem kind: a pattern one
  // segment too wide swallows a future red in silence. So every discovered case
  // is put through the real matcher, and each entry must catch exactly one —
  // one waiver, one case, which is also why #584's two journeys are two
  // entries. `--list` is discovery only: no browser, no web server.
  it("matches exactly one discovered certified case per tracked waiver", () => {
    const root = comparisonRootFrom(import.meta.url);
    const cases = certifiedCasesFromListing(readCertifiedListing() as CertifiedListingReport);
    const floor = JSON.parse(readFileSync(join(root, "e2e/certified-case-floor.json"), "utf8")) as {
      total: number;
    };
    expect(cases.length).toBeGreaterThanOrEqual(floor.total);

    const loaded = loadCertifiedWaivers(defaultWaiversPath(root));
    expect(loaded.problems).toEqual([]);
    const evaluation = evaluateCertifiedWaivers({
      waivers: loaded.waivers,
      failures: cases,
      now: new Date(),
    });
    const matched = new Map(loaded.waivers.map((entry) => [entry.pattern, 0]));
    for (const { waiver: entry } of evaluation.waived) {
      matched.set(entry.pattern, (matched.get(entry.pattern) ?? 0) + 1);
    }
    expect(Object.fromEntries(matched)).toEqual(
      Object.fromEntries(loaded.waivers.map((entry) => [entry.pattern, 1])),
    );
  }, 120_000);

  // Where a pattern has to start, which is not where it reads as if it should.
  // Two segments a hand-written pattern drops: the haystack opens with the file
  // the case is DECLARED in — the driver's, for a driver-declared case — and
  // the title opens with the Playwright PROJECT, not with the spec path. Both
  // are read off a record a certified report really wrote.
  it("anchors on the declaring file and on the project the title opens with", () => {
    const reported = REPORTED_FAILURES.pickerKeyboard;
    const haystack = failureHaystack(reported);
    expect(haystack).toBe(
      "e2e/drivers/journeys.ts chromium › certified/picker.certified.spec.ts › D13 journeys — Picker trigger › D13 journey — keyboard-only",
    );
    expect(/^certified\/picker\.certified\.spec\.ts .*keyboard-only$/.test(haystack)).toBe(false);
    // The shape the first five entries were written to, and the reason none of
    // them waived anything: no project segment, anchored, so it matches nothing.
    expect(
      /^e2e\/drivers\/journeys\.ts certified\/picker\.certified\.spec\.ts .*keyboard-only$/.test(
        haystack,
      ),
    ).toBe(false);
    const tracked = loadCertifiedWaivers(join(here, "../../e2e/certified-waivers.json")).waivers;
    expect(tracked.filter((entry) => new RegExp(entry.pattern).test(haystack)).length).toBe(1);
  });

  // #578, 2026-09-22. The five entries were INERT in CI: each was written
  // against a haystack a second builder produced without the project, so run
  // 35689146611 at `d6745471` — the revision that carries them — reported
  // `0 waived` and listed all five under `Unwaived failures`. The fixture is
  // that run's own records, so the list is graded against what a report writes
  // rather than against a title this file builds for it.
  it("waives the five rows a certified report really wrote, and leaves #497's alone", () => {
    const root = comparisonRootFrom(import.meta.url);
    const loaded = loadCertifiedWaivers(defaultWaiversPath(root));
    expect(loaded.problems).toEqual([]);
    const reported = Object.values(REPORTED_FAILURES);
    const evaluation = evaluateCertifiedWaivers({
      waivers: loaded.waivers,
      failures: reported,
      now: new Date(),
    });

    expect(evaluation.problems).toEqual([]);
    expect(evaluation.waived.map((entry) => entry.failure.title)).toEqual(
      reported.filter((row) => row.component !== "combobox-list").map((row) => row.title),
    );
    // #497's ComboBox rows are a defect being fixed, never waived, so the gate
    // stays red on them.
    expect(evaluation.unwaived).toEqual([REPORTED_FAILURES.comboboxList]);
    expect(waiverGateFails(evaluation)).toBe(true);
    // One entry, one row: no waiver covers a second reported failure.
    expect(new Set(evaluation.waived.map((entry) => entry.waiver.pattern)).size).toBe(
      loaded.waivers.length,
    );
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

  // The recorded reason is what a reader judges the entry by, and what the
  // ticket's `Done when` has to cover before the entry may go, so an entry
  // without one is not a waiver.
  it("rejects a waiver that records no reason", () => {
    const { reason: _dropped, ...withoutReason } = waiver();
    expect(parseWaiverEntries([withoutReason]).problems).toEqual([
      expect.objectContaining({
        kind: "invalid-entry",
        detail: expect.stringContaining("reason"),
      }),
    ]);
    expect(parseWaiverEntries([waiver({ reason: "" })]).problems).toEqual([
      expect.objectContaining({ kind: "invalid-entry" }),
    ]);
  });

  it("rejects a pattern that is not a regular expression", () => {
    expect(parseWaiverEntries([waiver({ pattern: "(" })]).problems).toEqual([
      expect.objectContaining({ kind: "invalid-pattern" }),
    ]);
  });

  // #578's review, problem 3. A tail-anchored pattern waives its case under
  // every file and every describe that ends the same way, and the three entries
  // #578 wrote were all tail-anchored only. A trailing `\$` is a literal dollar
  // and anchors nothing, so it is refused too.
  it("rejects a pattern that is not anchored at both ends", () => {
    for (const pattern of [
      "combobox\\.certified\\.spec\\.ts D3 pixel diff — ComboBox › default · light$",
      "^e2e/certified/combobox\\.certified\\.spec\\.ts D3 pixel diff",
      "^e2e/certified/combobox\\.certified\\.spec\\.ts D3 pixel diff costs 5\\$",
    ]) {
      expect(parseWaiverEntries([waiver({ pattern })]).problems).toEqual([
        expect.objectContaining({
          kind: "invalid-pattern",
          detail: expect.stringContaining("anchored"),
        }),
      ]);
    }
    expect(parseWaiverEntries([waiver()]).problems).toEqual([]);
  });

  // A driver declares the same case shape for many components, so a pattern
  // that names only the driver and the case id waives every component's copy.
  it("rejects a pattern that names no certified spec file", () => {
    expect(
      parseWaiverEntries([waiver({ pattern: "^e2e/drivers/motion\\.ts .* · hover-transition$" })])
        .problems,
    ).toEqual([
      expect.objectContaining({
        kind: "invalid-pattern",
        detail: expect.stringContaining("certified.spec.ts"),
      }),
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

  // #578's review, problem 4. The recorded rule is that a waiver expires "at
  // the next release", and no release date exists anywhere in this tree to
  // check a date against — #610 owns binding it to the release itself. This is
  // the stand-in: a waiver may outlive the cut by a cycle, not by a quarter.
  // The first three entries #578 wrote stood to 2026-12-31 under that rule.
  it("fails the job when a waiver stands past the horizon a release bounds", () => {
    const evaluation = evaluateCertifiedWaivers({
      waivers: [waiver({ expires: "2026-12-31" })],
      failures: [failure()],
      now,
    });

    expect(evaluation.problems).toEqual([
      expect.objectContaining({
        kind: "expires-too-far",
        detail: expect.stringContaining("expires on 2026-12-31, past 2026-11-01"),
      }),
    ]);
    // Like an expired date: the failure is the job's again, not a note beside it.
    expect(evaluation.waived).toEqual([]);
    expect(evaluation.unwaived).toEqual([failure()]);
    expect(waiverGateFails(evaluation)).toBe(true);
    expect(waiverHorizonStamp(now)).toBe("2026-11-01");
    // The horizon itself is still inside.
    expect(
      evaluateCertifiedWaivers({
        waivers: [waiver({ expires: waiverHorizonStamp(now) })],
        failures: [failure()],
        now,
      }).problems,
    ).toEqual([]);
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
      pattern:
        "^e2e/certified/picker\\.certified\\.spec\\.ts D1 state matrix — Picker › default · light$",
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
