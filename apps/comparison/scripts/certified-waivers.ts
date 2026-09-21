import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const CLOSED_TICKET_STATES = new Set(["verified", "merged", "closed"]);

export interface CertifiedWaiver {
  pattern: string;
  ticket: number;
  expires: string;
  /**
   * The waiver ticket's board state, copied into this file when the waiver is
   * written or renewed. The certified verdict reads this field and never
   * `.claude/tickets/**` (#574): the board is outside
   * `certifiedSuiteCoveredPathspecs`, so a run that resolved the state from it
   * could change its own exit code under a postcard that still said current —
   * one commit editing `status:` in a ticket, and `git diff` over the covered
   * paths lists nothing. `guard:certified-waiver-tickets` holds this field to
   * the board through `reconcileWaiverTickets`, outside the certified run.
   */
  ticketStatus: string;
}

export interface CertifiedFailure {
  component: string;
  driver: string;
  file: string;
  title: string;
}

export type WaiverProblemKind =
  | "expired"
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
          detail: "certified-waivers.json must be an array of { pattern, ticket, expires }",
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
    const expires = record.expires;
    const ticketStatus = record.ticketStatus;
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
    if (typeof expires !== "string" || !DATE_RE.test(expires)) {
      problems.push({
        kind: "invalid-entry",
        waiver: null,
        detail: `waivers[${index}].expires must be YYYY-MM-DD`,
      });
      return;
    }
    if (typeof ticketStatus !== "string" || ticketStatus.length === 0) {
      problems.push({
        kind: "invalid-entry",
        waiver: null,
        detail: `waivers[${index}].ticketStatus must be the ticket's board state, as a non-empty string`,
      });
      return;
    }
    const waiver: CertifiedWaiver = { pattern, ticket, expires, ticketStatus };
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

/**
 * Reads a ticket's state off the board. This is the board read the certified
 * run no longer does: only `guard:certified-waiver-tickets` calls it, through
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
      return { status: statusMatch?.[1] ?? null, path };
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
}): WaiverEvaluation {
  const problems: WaiverProblem[] = [];
  const today = utcDateStamp(options.now);

  for (const waiver of options.waivers) {
    if (waiver.expires < today) {
      problems.push({
        kind: "expired",
        waiver,
        detail: `waiver for ticket #${waiver.ticket} expired on ${waiver.expires}`,
      });
      continue;
    }

    if (CLOSED_TICKET_STATES.has(waiver.ticketStatus)) {
      problems.push({
        kind: "ticket-closed",
        waiver,
        detail: `waiver ticket #${waiver.ticket} is ${waiver.ticketStatus}; remove the waiver`,
      });
    }
  }

  const active = options.waivers.filter(
    (waiver) => waiver.expires >= today && !CLOSED_TICKET_STATES.has(waiver.ticketStatus),
  );

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
