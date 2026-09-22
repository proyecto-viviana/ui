import { spawnSync } from "node:child_process";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it, vi } from "vite-plus/test";

import {
  applyWaiverCounts,
  certifiedCasesFromListing,
  formatCertifiedSummaryMarkdown,
  mergeCertifiedSummaries,
  parseComponentFromTitlePath,
  parseComponentSlug,
  parseDriverId,
  type CertifiedCell,
  type CertifiedListingReport,
  type CertifiedSummary,
  type DriverId,
} from "../../scripts/certified-summary";
import {
  CLOSED_TICKET_STATES,
  TICKET_STATES,
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

/**
 * The clock the tracked-file cases grade on: the earliest date the list names,
 * where every entry is still active whatever today is. Expiry is the certified
 * run's to judge — `merge-certified-reports.ts` puts this same file through
 * `evaluateCertifiedWaivers` on the real clock, and an expired entry turns that
 * verdict red and names itself there.
 */
function trackedClock(waivers: readonly CertifiedWaiver[]): Date {
  const earliest = waivers.map((entry) => entry.expires).sort()[0];
  return earliest ? new Date(`${earliest}T00:00:00.000Z`) : now;
}

describe("certified waivers", () => {
  // #578's review, problem 2. Nothing in this describe may read the wall clock.
  // These cases are `certified verdict unit tests`, the FIRST step of
  // `comparison-build`, and the eight certified shards, `certified-report` and
  // both floor jobs all `needs: comparison-build`. A case that went red on the
  // day the tracked list expires would skip every one of them — no certified
  // verdict at all, and the pair and contract floors down with it — instead of
  // the intended outcome, a red certified report whose `expired` problem names
  // the waiver. So `Date` is pinned years past every tracked entry: a case that
  // grades the tracked file on `new Date()` fails here, now, rather than in CI
  // on a date.
  const pastEveryTrackedWaiver = new Date("2099-01-01T00:00:00.000Z");
  beforeAll(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(pastEveryTrackedWaiver);
  });
  afterAll(() => {
    vi.useRealTimers();
  });

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
    const closed = loaded.waivers.filter((entry) => CLOSED_TICKET_STATES.has(entry.ticketStatus));
    expect(closed).toEqual([]);
    // The dates are the verdict's to judge, not the loader's: an entry that has
    // expired, or that stands for longer than a release, is a problem only once
    // `evaluateCertifiedWaivers` sees it, so the tracked file is put through it
    // — on the clock above, where no entry has expired yet. What that still
    // catches is a list that cannot be renewed as one (`expires-too-far` from
    // its own earliest date) and an entry whose ticket state ends a waiver.
    expect(
      evaluateCertifiedWaivers({
        waivers: loaded.waivers,
        failures: [],
        now: trackedClock(loaded.waivers),
      }).problems,
    ).toEqual([]);
  });

  // And where expiry does turn red: the certified run, which evaluates this
  // same file on the real clock. Graded here past every entry, the list waives
  // nothing and every entry names itself — which is the report the day after
  // the dates pass, with the shards and the floors still having run.
  it("stops waiving, and names every entry, once the clock is past the list", () => {
    const loaded = loadCertifiedWaivers(defaultWaiversPath(comparisonRootFrom(import.meta.url)));
    const evaluation = evaluateCertifiedWaivers({
      waivers: loaded.waivers,
      failures: Object.values(REPORTED_FAILURES),
      now: new Date(),
    });
    expect(evaluation.problems.map((problem) => problem.kind)).toEqual(
      loaded.waivers.map(() => "expired"),
    );
    expect(evaluation.waived).toEqual([]);
    expect(evaluation.unwaived).toEqual(Object.values(REPORTED_FAILURES));
    expect(waiverGateFails(evaluation)).toBe(true);
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
      now: trackedClock(loaded.waivers),
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
      now: trackedClock(loaded.waivers),
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

  // #578's review, problem 1. The set is read from the source of truth rather
  // than re-typed here, because the two used to disagree: this set held
  // `closed`, a word the board never writes, and lacked `dropped`, the word it
  // does write for a ticket closed without merging — so a dropped ticket kept
  // waiving its row until the date ran out, which is the one thing
  // `certification-debt.md` promises cannot happen.
  it("fails the job when the waiver records a ticket state that ends a waiver", () => {
    expect([...CLOSED_TICKET_STATES].sort()).toEqual(["dropped", "merged", "verified"]);
    for (const status of CLOSED_TICKET_STATES) {
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
    // And the states that do not end one: the defect is still wanted, only not
    // now (`parked`), or nobody has started it (`open`, `next`, `in-progress`).
    for (const status of TICKET_STATES.filter((state) => !CLOSED_TICKET_STATES.has(state))) {
      const evaluation = evaluateCertifiedWaivers({
        waivers: [waiver({ ticketStatus: status })],
        failures: [failure()],
        now,
      });
      expect({ status, problems: evaluation.problems, waived: evaluation.waived.length }).toEqual({
        status,
        problems: [],
        waived: 1,
      });
    }
  });

  // #578's review, problem 1. `ticketStatus` used to be any non-empty string,
  // and a state the board never emits — `closed`, a typo, a word from another
  // tracker — matches no closing state, so it waives its row for the whole
  // remaining horizon and `guard:certified-waiver-tickets` is the only thing
  // left that would notice. The loader refuses it instead.
  it("rejects a ticketStatus the board's lifecycle does not have", () => {
    for (const status of ["closed", "done", "in progress", "Merged", "wontfix"]) {
      expect(parseWaiverEntries([waiver({ ticketStatus: status })]).problems).toEqual([
        expect.objectContaining({
          kind: "invalid-entry",
          detail: expect.stringContaining("ticketStatus must be the ticket's board state"),
        }),
      ]);
    }
    for (const status of TICKET_STATES) {
      expect(parseWaiverEntries([waiver({ ticketStatus: status })]).problems).toEqual([]);
    }
  });

  // The scheme's one legacy spelling: a ticket still written `status: done`
  // parses as `merged`. Reading the raw word instead would make a waiver that
  // correctly records `merged` look stale in the guard, and a waiver recording
  // `done` — which the loader now refuses — look current.
  it("reads a legacy done ticket as merged", () => {
    const repoRoot = mkdtempSync(join(tmpdir(), "certified-waiver-board-"));
    const board = join(repoRoot, ".claude/tickets/tasks");
    mkdirSync(board, { recursive: true });
    writeFileSync(
      join(board, "240-legacy.md"),
      "---\nid: 240\nstatus: done\n---\n\n# A ticket written before the scheme renamed the state\n",
    );
    writeFileSync(
      join(board, "241-current.md"),
      "---\nid: 241\nstatus: in-progress\n---\n\n# A ticket written after it\n",
    );
    expect(readTicketStatus(repoRoot, 240).status).toBe("merged");
    expect(readTicketStatus(repoRoot, 241).status).toBe("in-progress");
    expect(
      reconcileWaiverTickets({
        waivers: [waiver({ ticketStatus: "merged" })],
        ticketStatus: (ticketId) => readTicketStatus(repoRoot, ticketId).status,
      }),
    ).toEqual([]);
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
    expect(reconcileWaiverTickets({ waivers: [waiver()], ticketStatus: () => "merged" })).toEqual([
      expect.objectContaining({
        kind: "ticket-stale",
        detail: "waiver ticket #240 records in-progress; the board says merged",
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

/**
 * #578's review, problem 3. `applyWaiverCounts` runs twice over the same rows:
 * the reporter applies it inside each shard before writing
 * `certified-summary.json`, and `merge-certified-reports.ts` applies it again
 * over the merged cells. It used to overwrite each cell's `waived` with the
 * number of waived rows still sitting in that cell's `failures` — and the first
 * pass had already moved them out — so the second pass reset every count to
 * zero. That is a merged report printing `Totals: … 0 waived` above a
 * `Waived failures` list with rows in it: the numbers the release bar is read
 * off contradict the list under them.
 */
describe("merged certified summary waiver counts", () => {
  function shardOf(current: number, cell: CertifiedCell): CertifiedSummary {
    return {
      generatedAt: "2026-09-22T00:00:00.000Z",
      revision: "d6745471",
      shard: { current, total: 2 },
      runStatus: "failed",
      errors: [],
      totals: {
        passed: cell.passed,
        failed: cell.failed,
        skipped: cell.skipped,
        waived: cell.waived,
        flaky: cell.flaky,
      },
      cells: [cell],
      waived: [],
      unwaived: [],
      waiverProblems: [],
    };
  }

  function redCell(component: string, driver: DriverId, red: CertifiedFailure): CertifiedCell {
    return {
      component,
      driver,
      passed: 3,
      failed: 1,
      skipped: 0,
      waived: 0,
      flaky: 0,
      failures: [red],
    };
  }

  it("keeps a shard's waived count when the merge applies the same waivers again", () => {
    const pickerRed = REPORTED_FAILURES.pickerKeyboard;
    const tabsRed = REPORTED_FAILURES.tabs;
    const pickerWaiver = waiver({
      pattern:
        "^e2e/drivers/journeys\\.ts chromium › certified/picker\\.certified\\.spec\\.ts .* keyboard-only$",
      ticket: 584,
    });
    const tabsWaiver = waiver({
      pattern:
        "^e2e/drivers/events\\.ts chromium › certified/tabs\\.certified\\.spec\\.ts .* arrow-next-from-selected$",
      ticket: 583,
    });
    // The fixture's own patterns are ones the loader accepts, and each one
    // matches the row it stands for: a waived count over rows no waiver reaches
    // would prove nothing.
    expect(parseWaiverEntries([pickerWaiver, tabsWaiver]).problems).toEqual([]);
    expect(new RegExp(pickerWaiver.pattern).test(failureHaystack(pickerRed))).toBe(true);
    expect(new RegExp(tabsWaiver.pattern).test(failureHaystack(tabsRed))).toBe(true);

    // What the reporter writes per shard: the first pass.
    const shards = [
      applyWaiverCounts(
        shardOf(1, redCell("picker-trigger", "D13", pickerRed)),
        [{ failure: pickerRed, waiver: pickerWaiver }],
        [],
        [],
      ),
      applyWaiverCounts(
        shardOf(2, redCell("tabs", "D4", tabsRed)),
        [{ failure: tabsRed, waiver: tabsWaiver }],
        [],
        [],
      ),
    ];
    for (const shard of shards) {
      expect({ waived: shard.totals.waived, failed: shard.totals.failed }).toEqual({
        waived: 1,
        failed: 0,
      });
      expect(shard.cells[0]?.failures).toEqual([]);
    }

    // What the merger writes: the second pass, over cells the first already
    // emptied, with the same verdict re-evaluated over the merged rows.
    const merged = applyWaiverCounts(
      mergeCertifiedSummaries(shards),
      [
        { failure: pickerRed, waiver: pickerWaiver },
        { failure: tabsRed, waiver: tabsWaiver },
      ],
      [],
      [],
    );

    expect(merged.totals).toEqual({ passed: 6, failed: 0, skipped: 0, waived: 2, flaky: 0 });
    // The report's own consistency: the number above the list and the list.
    expect(merged.totals.waived).toBe(merged.waived.length);
    expect(merged.cells.map((cell) => [cell.component, cell.waived])).toEqual([
      ["picker-trigger", 1],
      ["tabs", 1],
    ]);
    expect(formatCertifiedSummaryMarkdown(merged)).toContain("**2 waived**");
  });

  // And the pass that has work to do still does it: a cell the reporter never
  // graded — an unsharded run, or a row a shard left failed — moves from
  // `failed` to `waived` on the pass that first sees the waiver.
  it("moves a failure that no pass has waived yet", () => {
    const tabsRed = REPORTED_FAILURES.tabs;
    const applied = applyWaiverCounts(
      shardOf(1, redCell("tabs", "D4", tabsRed)),
      [
        {
          failure: tabsRed,
          waiver: waiver({
            pattern:
              "^e2e/drivers/events\\.ts chromium › certified/tabs\\.certified\\.spec\\.ts .* arrow-next-from-selected$",
            ticket: 583,
          }),
        },
      ],
      [],
      [],
    );
    expect(applied.totals).toEqual({ passed: 3, failed: 0, skipped: 0, waived: 1, flaky: 0 });
    expect(applied.cells[0]?.failures).toEqual([]);
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
    // A real state the board is not on: `not-<status>` is no longer a state the
    // loader accepts, and an entry it refuses never reaches the reconciliation
    // this case is here to drive.
    const stale = TICKET_STATES.find((state) => state !== status) as string;
    const result = withWaivers([
      waiver({ ticket: 574, expires: "2099-12-31", ticketStatus: stale }),
      waiver({ ticket: 9_999_999, expires: "2099-12-31" }),
    ]);
    expect(result.status).toBe(1);
    expect(result.stderr).toContain(
      `ticket-stale: waiver ticket #574 records ${stale}; the board says ${status}`,
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
