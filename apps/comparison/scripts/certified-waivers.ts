import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CERTIFIED_SPEC_SUFFIX = ".certified.spec.ts";
const DAY_MS = 24 * 60 * 60 * 1000;

export interface SemverVersion {
  release: [number, number, number];
  pre: string[];
}

/** A semver version, or null when it is not one. Build metadata carries no precedence. */
export function parseSemver(version: string): SemverVersion | null {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(
    typeof version === "string" ? version : "",
  );
  if (!match) return null;
  return {
    release: [Number(match[1]), Number(match[2]), Number(match[3])],
    pre: match[4] ? match[4].split(".") : [],
  };
}

/**
 * Semver precedence: release triple first, then prerelease sorting below its
 * own release, then identifier by identifier (numeric numerically, shorter below longer).
 */
export function compareSemver(a: string, b: string): number {
  const left = parseSemver(a);
  const right = parseSemver(b);
  if (!left || !right) {
    throw new Error(`cannot compare invalid semver versions: "${a}" and "${b}"`);
  }
  for (let index = 0; index < 3; index += 1) {
    if (left.release[index] !== right.release[index]) {
      return left.release[index] - right.release[index];
    }
  }
  if (left.pre.length === 0 || right.pre.length === 0) {
    return right.pre.length - left.pre.length;
  }
  for (let index = 0; index < Math.max(left.pre.length, right.pre.length); index += 1) {
    const one = left.pre[index];
    const other = right.pre[index];
    if (one === undefined) return -1;
    if (other === undefined) return 1;
    if (one === other) continue;
    const oneIsNumber = /^\d+$/.test(one);
    const otherIsNumber = /^\d+$/.test(other);
    if (oneIsNumber && otherIsNumber) return Number(one) - Number(other);
    if (oneIsNumber !== otherIsNumber) return oneIsNumber ? -1 : 1;
    return one < other ? -1 : 1;
  }
  return 0;
}

/**
 * A waiver may defer past the immediate release cycle, not far into the future (#610).
 */
export function isReleaseTooFar(current: string, target: string): boolean {
  const cur = parseSemver(current);
  const tgt = parseSemver(target);
  if (!cur || !tgt) return false;
  if (compareSemver(current, target) >= 0) return false;
  if (tgt.release[0] > cur.release[0]) return true;
  if (tgt.release[1] > cur.release[1] + 1) return true;
  return false;
}

/**
 * The board's lifecycle, and only it: `viviana-projects/spec/ticket-scheme.md`
 * v1, which `.claude/tickets/SCHEME.md` points at. `open → next → in-progress →
 * merged → verified`, plus the two side exits `parked` (still wanted, not now)
 * and `dropped` (closed without merging). Legacy `done` is not in the set
 * because `readTicketStatus` normalizes it to `merged` on the way out, as the
 * scheme says to.
 */
export const TICKET_STATES = [
  "open",
  "next",
  "in-progress",
  "merged",
  "verified",
  "parked",
  "dropped",
] as const;

export type TicketState = (typeof TICKET_STATES)[number];

export function isTicketState(value: string): value is TicketState {
  return (TICKET_STATES as readonly string[]).includes(value);
}

/**
 * The states that end a waiver: the work landed (`merged`, `verified`) or the
 * ticket was closed without it (`dropped`) — either way nobody is fixing the
 * row any more. `parked` is not one: the defect is still wanted, only not now.
 * `closed` used to be in this set and is a state the board never emits, while
 * `dropped` was missing from it, so a dropped ticket kept waiving for the whole
 * remaining horizon.
 */
export const CLOSED_TICKET_STATES: ReadonlySet<string> = new Set<TicketState>([
  "merged",
  "verified",
  "dropped",
]);

/**
 * How far past today a waiver may still stand. The owner-accepted rule is that
 * a waiver expires "at the next release", and no release date exists anywhere
 * in this tree, so the date on an entry cannot be checked against one. This is
 * the mechanical stand-in the conductor chose for it: a waiver may outlive the
 * cut by a cycle, not by a quarter. #610 owns binding it to the release itself.
 */
export const MAX_WAIVER_HORIZON_DAYS = 60;

export interface CertifiedWaiver {
  /**
   * A regular expression over `failureHaystack`, which is the failing case's
   * spec-or-driver file, a space, and its full title — and that title opens
   * with the Playwright project, `chromium › certified/…`, so a pattern that
   * steps from the file straight to the spec path matches nothing. That is how
   * the first five entries came to waive nothing at all (#578); the shape is
   * `certifiedCaseTitle`'s, and only its. Two rules, both held by
   * `parseWaiverEntries`: it is anchored `^…$`, because a pattern that is only
   * tail-anchored waives every case whose title ends the same way; and it names
   * the `*.certified.spec.ts` the case belongs to, because a driver declares
   * the same case shape for many components. One entry waives one case — the
   * breadth test in `src/data/certified-waivers.test.ts` holds that against the
   * suite's own listing, since nothing here reports an over-broad waiver.
   */
  pattern: string;
  ticket: number;
  /**
   * The release version this waiver defers past (e.g. "0.8.0-rc.0").
   * Bound to the released package version rather than a hand-typed date (#610).
   */
  release?: string;
  /** Legacy date stamp (YYYY-MM-DD), kept for backwards compatibility. */
  expires?: string;
  /**
   * The waiver ticket's board state, copied into this file when the waiver is
   * written or renewed, and one of {@link TICKET_STATES}. The certified verdict
   * reads this field and never
   * `.claude/tickets/**` (#574): the board is outside
   * `certifiedSuiteCoveredPathspecs`, so a run that resolved the state from it
   * could change its own exit code under a postcard that still said current —
   * one commit editing `status:` in a ticket, and `git diff` over the covered
   * paths lists nothing. `guard:certified-waiver-tickets` holds this field to
   * the board through `reconcileWaiverTickets`, outside the certified run.
   */
  ticketStatus: string;
  /**
   * What a user sees, and every cause behind the row. A reader deciding whether
   * the entry may go needs it, and the ticket's `Done when` has to cover all of
   * it, so it is required rather than decorative.
   */
  reason: string;
}

export interface CertifiedFailure {
  component: string;
  driver: string;
  file: string;
  title: string;
}

export type WaiverProblemKind =
  | "expired"
  | "expires-too-far"
  | "ticket-closed"
  | "ticket-missing"
  | "ticket-stale"
  | "invalid-pattern"
  | "invalid-entry";

export interface WaiverProblem {
  kind: WaiverProblemKind;
  waiver: CertifiedWaiver | null;
  detail: string;
}

export interface WaiverEvaluation {
  waived: Array<{ failure: CertifiedFailure; waiver: CertifiedWaiver }>;
  unwaived: CertifiedFailure[];
  problems: WaiverProblem[];
}

export function comparisonRootFrom(moduleUrl: string): string {
  let dir = dirname(fileURLToPath(moduleUrl));
  for (let i = 0; i < 8; i++) {
    if (
      existsSync(join(dir, "e2e/certified-waivers.json")) &&
      existsSync(join(dir, "playwright.config.ts"))
    ) {
      return dir;
    }
    dir = join(dir, "..");
  }
  throw new Error(`could not locate comparison app root from ${moduleUrl}`);
}

export function defaultWaiversPath(comparisonRoot: string): string {
  return join(comparisonRoot, "e2e/certified-waivers.json");
}

export function repoRootFromComparison(comparisonRoot: string): string {
  return join(comparisonRoot, "../..");
}

/**
 * `^` at the head and an unescaped `$` at the tail. A trailing `\$` is a literal
 * dollar and anchors nothing, so the backslashes before it are counted.
 */
export function isAnchoredPattern(pattern: string): boolean {
  if (!pattern.startsWith("^") || !pattern.endsWith("$")) return false;
  const trailingEscapes = /\\*$/.exec(pattern.slice(0, -1))?.[0].length ?? 0;
  return trailingEscapes % 2 === 0;
}

/** True when the pattern spells out a certified spec file, escaped or not. */
export function namesCertifiedSpec(pattern: string): boolean {
  return pattern.replaceAll("\\", "").includes(CERTIFIED_SPEC_SUFFIX);
}

export function parseWaiverEntries(raw: unknown): {
  waivers: CertifiedWaiver[];
  problems: WaiverProblem[];
} {
  const problems: WaiverProblem[] = [];
  if (!Array.isArray(raw)) {
    return {
      waivers: [],
      problems: [
        {
          kind: "invalid-entry",
          waiver: null,
          detail:
            "certified-waivers.json must be an array of { pattern, ticket, expires, ticketStatus, reason }",
        },
      ],
    };
  }

  const waivers: CertifiedWaiver[] = [];
  raw.forEach((entry, index) => {
    if (typeof entry !== "object" || entry == null || Array.isArray(entry)) {
      problems.push({
        kind: "invalid-entry",
        waiver: null,
        detail: `waivers[${index}] must be an object`,
      });
      return;
    }
    const record = entry as Record<string, unknown>;
    const pattern = record.pattern;
    const ticket = record.ticket;
    const release = record.release;
    const expires = record.expires;
    const ticketStatus = record.ticketStatus;
    const reason = record.reason;
    if (typeof pattern !== "string" || pattern.length === 0) {
      problems.push({
        kind: "invalid-entry",
        waiver: null,
        detail: `waivers[${index}].pattern must be a non-empty string`,
      });
      return;
    }
    if (typeof ticket !== "number" || !Number.isInteger(ticket) || ticket <= 0) {
      problems.push({
        kind: "invalid-entry",
        waiver: null,
        detail: `waivers[${index}].ticket must be a positive integer`,
      });
      return;
    }
    if (release != null) {
      if (typeof release !== "string" || parseSemver(release) == null) {
        problems.push({
          kind: "invalid-entry",
          waiver: null,
          detail: `waivers[${index}].release must be a valid semver version (e.g. 0.8.0-rc.0)`,
        });
        return;
      }
    } else if (expires != null) {
      if (typeof expires !== "string" || !DATE_RE.test(expires)) {
        problems.push({
          kind: "invalid-entry",
          waiver: null,
          detail: `waivers[${index}].expires must be YYYY-MM-DD`,
        });
        return;
      }
    } else {
      problems.push({
        kind: "invalid-entry",
        waiver: null,
        detail: `waivers[${index}] must specify release (semver) or expires (YYYY-MM-DD)`,
      });
      return;
    }
    if (typeof ticketStatus !== "string" || !isTicketState(ticketStatus)) {
      problems.push({
        kind: "invalid-entry",
        waiver: null,
        detail: `waivers[${index}].ticketStatus must be the ticket's board state, one of ${TICKET_STATES.join(
          ", ",
        )}: a state the board never emits matches no closing state, so it would waive until the date ran out`,
      });
      return;
    }
    if (typeof reason !== "string" || reason.length === 0) {
      problems.push({
        kind: "invalid-entry",
        waiver: null,
        detail: `waivers[${index}].reason must say what a user sees and what causes the row, as a non-empty string`,
      });
      return;
    }
    const waiver: CertifiedWaiver = {
      pattern,
      ticket,
      ...(release ? { release: release as string } : {}),
      ...(expires ? { expires: expires as string } : {}),
      ticketStatus,
      reason,
    };
    try {
      new RegExp(pattern);
    } catch (error) {
      problems.push({
        kind: "invalid-pattern",
        waiver,
        detail: `waivers[${index}].pattern is not a valid regular expression: ${
          error instanceof Error ? error.message : String(error)
        }`,
      });
      return;
    }
    if (!isAnchoredPattern(pattern)) {
      problems.push({
        kind: "invalid-pattern",
        waiver,
        detail: `waivers[${index}].pattern must be anchored with ^ and $ over the whole haystack (file, space, full title): an unanchored pattern waives every case it appears in`,
      });
      return;
    }
    if (!namesCertifiedSpec(pattern)) {
      problems.push({
        kind: "invalid-pattern",
        waiver,
        detail: `waivers[${index}].pattern must name the ${CERTIFIED_SPEC_SUFFIX} the case belongs to: a driver declares the same case shape for many components`,
      });
      return;
    }
    waivers.push(waiver);
  });

  return { waivers, problems };
}

export function loadCertifiedWaivers(path: string): {
  waivers: CertifiedWaiver[];
  problems: WaiverProblem[];
} {
  if (!existsSync(path)) {
    return {
      waivers: [],
      problems: [
        {
          kind: "invalid-entry",
          waiver: null,
          detail: `certified waivers file is missing: ${path}`,
        },
      ],
    };
  }

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(path, "utf8"));
  } catch (error) {
    return {
      waivers: [],
      problems: [
        {
          kind: "invalid-entry",
          waiver: null,
          detail: `certified-waivers.json is not valid JSON: ${
            error instanceof Error ? error.message : String(error)
          }`,
        },
      ],
    };
  }

  return parseWaiverEntries(raw);
}

export function utcDateStamp(now: Date): string {
  return now.toISOString().slice(0, 10);
}

/** The last date a waiver written today may still name. See {@link MAX_WAIVER_HORIZON_DAYS}. */
export function waiverHorizonStamp(now: Date): string {
  return utcDateStamp(new Date(now.getTime() + MAX_WAIVER_HORIZON_DAYS * DAY_MS));
}

/**
 * Reads the current release version from packages/viviana-ui/package.json
 * or the VIVIANA_RELEASE_VERSION environment variable (#610).
 */
export function readCurrentRelease(repoRoot: string): string {
  if (process.env.VIVIANA_RELEASE_VERSION) {
    return process.env.VIVIANA_RELEASE_VERSION;
  }
  const uiManifest = join(repoRoot, "packages/viviana-ui/package.json");
  if (existsSync(uiManifest)) {
    try {
      const parsed = JSON.parse(readFileSync(uiManifest, "utf8"));
      if (typeof parsed.version === "string" && parseSemver(parsed.version)) {
        return parsed.version;
      }
    } catch {
      // fall through
    }
  }
  return "0.0.0";
}

/**
 * Reads a ticket's state off the board, normalized to a {@link TicketState}:
 * the scheme says legacy `done` parses as `merged`, and a caller that compared
 * the raw word against a recorded `merged` would read a stale entry as current
 * and keep waiving. This is the board read the certified run no longer does:
 * only `guard:certified-waiver-tickets` calls it, through
 * `reconcileWaiverTickets` (#574).
 */
export function readTicketStatus(
  repoRoot: string,
  ticketId: number,
): { status: string | null; path: string | null } {
  const directories = ["tasks", "initiatives", "milestones"] as const;
  const prefix = `${ticketId}-`;
  for (const directory of directories) {
    const dir = join(repoRoot, ".claude/tickets", directory);
    if (!existsSync(dir)) continue;
    for (const filename of readdirSync(dir)) {
      if (!filename.startsWith(prefix) || !filename.endsWith(".md")) continue;
      const path = join(dir, filename);
      const source = readFileSync(path, "utf8");
      const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---/);
      const statusMatch = match?.[1]?.match(/^status:\s*([^\s#]+)/m);
      const recorded = statusMatch?.[1] ?? null;
      return { status: recorded === "done" ? "merged" : recorded, path };
    }
  }
  return { status: null, path: null };
}

export function failureHaystack(failure: CertifiedFailure): string {
  return `${failure.file} ${failure.title}`;
}

/**
 * The waiver half of the certified verdict. Every input is the waiver file,
 * which `certifiedSuiteCoveredPathspecs` covers, so nothing this decides can
 * move without the postcard seeing it (#574).
 */
export function evaluateCertifiedWaivers(options: {
  waivers: CertifiedWaiver[];
  failures: readonly CertifiedFailure[];
  now: Date;
  currentRelease?: string;
  comparisonRoot?: string;
}): WaiverEvaluation {
  const problems: WaiverProblem[] = [];
  const today = utcDateStamp(options.now);
  const horizon = waiverHorizonStamp(options.now);
  const repoRoot = repoRootFromComparison(
    options.comparisonRoot ?? comparisonRootFrom(import.meta.url),
  );
  const currentRelease = options.currentRelease ?? readCurrentRelease(repoRoot);

  for (const waiver of options.waivers) {
    if (waiver.release) {
      if (compareSemver(currentRelease, waiver.release) > 0) {
        problems.push({
          kind: "expired",
          waiver,
          detail: `waiver for ticket #${waiver.ticket} expired after release ${waiver.release} (current is ${currentRelease})`,
        });
        continue;
      }

      if (isReleaseTooFar(currentRelease, waiver.release)) {
        problems.push({
          kind: "expires-too-far",
          waiver,
          detail: `waiver for ticket #${waiver.ticket} targets release ${waiver.release}, past next release cycle (current is ${currentRelease}); a waiver stands until the next release`,
        });
        continue;
      }
    } else if (waiver.expires) {
      if (waiver.expires < today) {
        problems.push({
          kind: "expired",
          waiver,
          detail: `waiver for ticket #${waiver.ticket} expired on ${waiver.expires}`,
        });
        continue;
      }

      if (waiver.expires > horizon) {
        problems.push({
          kind: "expires-too-far",
          waiver,
          detail: `waiver for ticket #${waiver.ticket} expires on ${waiver.expires}, past ${horizon}; a waiver stands until the next release, so it may name at most ${MAX_WAIVER_HORIZON_DAYS} days`,
        });
        continue;
      }
    }

    if (CLOSED_TICKET_STATES.has(waiver.ticketStatus)) {
      problems.push({
        kind: "ticket-closed",
        waiver,
        detail: `waiver ticket #${waiver.ticket} is ${waiver.ticketStatus}; remove the waiver`,
      });
    }
  }

  const active = options.waivers.filter((waiver) => {
    if (CLOSED_TICKET_STATES.has(waiver.ticketStatus)) return false;
    if (waiver.release) {
      return (
        compareSemver(currentRelease, waiver.release) <= 0 &&
        !isReleaseTooFar(currentRelease, waiver.release)
      );
    }
    if (waiver.expires) {
      return waiver.expires >= today && waiver.expires <= horizon;
    }
    return false;
  });

  const waived: WaiverEvaluation["waived"] = [];
  const unwaived: CertifiedFailure[] = [];

  for (const failure of options.failures) {
    const haystack = failureHaystack(failure);
    const match = active.find((waiver) => new RegExp(waiver.pattern).test(haystack));
    if (match) {
      waived.push({ failure, waiver: match });
    } else {
      unwaived.push(failure);
    }
  }

  return { waived, unwaived, problems };
}

export function waiverGateFails(evaluation: WaiverEvaluation): boolean {
  return evaluation.problems.length > 0 || evaluation.unwaived.length > 0;
}

/**
 * Holds each waiver's recorded `ticketStatus` to the board. This is the read
 * `evaluateCertifiedWaivers` used to do inline, moved out of the certified run
 * and into `guard:certified-waiver-tickets`, which is not what the postcard
 * speaks for (#574). A recorded state the board has moved past is a defect
 * here, not a green run there.
 */
export function reconcileWaiverTickets(options: {
  waivers: readonly CertifiedWaiver[];
  ticketStatus: (ticketId: number) => string | null;
}): WaiverProblem[] {
  const problems: WaiverProblem[] = [];
  for (const waiver of options.waivers) {
    const status = options.ticketStatus(waiver.ticket);
    if (status == null) {
      problems.push({
        kind: "ticket-missing",
        waiver,
        detail: `waiver ticket #${waiver.ticket} is not on the board`,
      });
      continue;
    }
    if (status !== waiver.ticketStatus) {
      problems.push({
        kind: "ticket-stale",
        waiver,
        detail: `waiver ticket #${waiver.ticket} records ${waiver.ticketStatus}; the board says ${status}`,
      });
    }
  }
  return problems;
}
