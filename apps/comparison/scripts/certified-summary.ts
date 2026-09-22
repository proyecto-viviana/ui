import { existsSync, readFileSync } from "node:fs";
import { basename, join, relative } from "node:path";

import type { CertifiedFailure, CertifiedWaiver, WaiverProblem } from "./certified-waivers";

export const DRIVER_IDS = [
  "D1",
  "D2",
  "D3",
  "D4",
  "D5",
  "D6",
  "D7",
  "D8",
  "D9",
  "D10",
  "D11",
  "D12",
  "D13",
  "D14",
  "D-scroll",
  "D-reorder",
  "other",
] as const;

export type DriverId = (typeof DRIVER_IDS)[number];

// D10–D14 before D1–D9 so `D14` is not captured as `D1`.
const DRIVER_RE = /^(D(?:-scroll|-reorder|1[0-4]|[1-9]))\b/;

export interface CertifiedCell {
  component: string;
  driver: DriverId;
  passed: number;
  failed: number;
  skipped: number;
  waived: number;
  flaky: number;
  failures: CertifiedFailure[];
}

export interface CertifiedSummaryTotals {
  passed: number;
  failed: number;
  skipped: number;
  waived: number;
  flaky: number;
}

export const CERTIFIED_RUN_STATUSES = ["passed", "failed", "timedout", "interrupted"] as const;

export type CertifiedRunStatus = (typeof CERTIFIED_RUN_STATUSES)[number];

/** An error Playwright reported outside a test: a spec that failed to load, a global-setup throw. */
export interface CertifiedRunError {
  file: string | null;
  message: string;
}

export interface CertifiedSummary {
  generatedAt: string;
  revision: string | null;
  shard: { current: number; total: number } | null;
  runStatus: CertifiedRunStatus | null;
  errors: CertifiedRunError[];
  totals: CertifiedSummaryTotals;
  cells: CertifiedCell[];
  waived: Array<{ failure: CertifiedFailure; ticket: number }>;
  unwaived: CertifiedFailure[];
  waiverProblems: WaiverProblem[];
}

export type ShardOutcomeProblemKind = "load-error" | "missing-status" | "unexplained-status";

export interface ShardOutcomeProblem {
  kind: ShardOutcomeProblemKind;
  shard: string;
  detail: string;
}

export const CERTIFIED_SUMMARY_FILENAME = "certified-summary.json";

export function parseDriverId(titlePath: readonly string[]): DriverId {
  for (const part of titlePath) {
    const match = DRIVER_RE.exec(part.trim());
    if (match) return match[1] as DriverId;
  }
  return "other";
}

export function parseComponentSlug(file: string): string | null {
  const name = basename(file);
  const match = name.match(/^(.*)\.certified\.spec\.[cm]?[jt]sx?$/);
  return match ? match[1] : null;
}

export function parseComponentFromTitlePath(titlePath: readonly string[]): string | null {
  for (const part of titlePath) {
    const match = /^(D(?:-scroll|-reorder|1[0-4]|[1-9]))\b.* — (.+)$/.exec(part.trim());
    if (match?.[2]) {
      return match[2]
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
  }
  return null;
}

/**
 * The title a certified report records for a case: Playwright's `titlePath()`
 * below the root suite, joined with " › ". The root suite's title is empty and
 * the project's is the head, so a certified title reads
 * `chromium › certified/tabs.certified.spec.ts › D4 … — Tabs › …`.
 *
 * The only builder of it, because `failureHaystack` matches waivers against
 * this string: a second builder that left the project out produced haystacks no
 * anchored waiver could ever match, and five inert waivers with it (#578).
 */
export function certifiedCaseTitle(titlePath: readonly string[]): string {
  return titlePath.slice(1).join(" › ");
}

/** A suite of `playwright test e2e/certified --list --reporter=json`. */
export interface CertifiedListingSuite {
  title?: string;
  specs?: Array<{ title: string; file: string; tests?: Array<{ projectName?: string }> }>;
  suites?: CertifiedListingSuite[];
}

export interface CertifiedListingReport {
  suites?: CertifiedListingSuite[];
}

/**
 * Every case that listing discovers, shaped as the reporter would record a
 * failure for it — the discovery `guard:certified-case-floor` already runs, no
 * browser and no web server.
 *
 * The project is not a suite level here: it sits on `spec.tests[].projectName`,
 * one entry per project, while `titlePath()` carries it first, under the root
 * suite. So the walk rebuilds the path in `titlePath()` order and hands it to
 * the one title builder. A case declared by a shared driver carries the
 * driver's own `file`, which is what `relativeSpecFile` hands the reporter, one
 * `e2e/` prefix on.
 *
 * Unlike the reporter, nothing is dropped: a case whose driver does not parse
 * comes back as `other`, so the count is the listing's own.
 */
export function certifiedCasesFromListing(report: CertifiedListingReport): CertifiedFailure[] {
  const cases: CertifiedFailure[] = [];
  const walk = (suite: CertifiedListingSuite, titles: readonly string[]): void => {
    const next = suite.title ? [...titles, suite.title] : titles;
    for (const spec of suite.specs ?? []) {
      const file = `e2e/${spec.file}`;
      for (const test of spec.tests ?? []) {
        const titlePath = [
          "",
          ...(test.projectName ? [test.projectName] : []),
          ...next,
          spec.title,
        ];
        cases.push({
          component: parseComponentFromTitlePath(titlePath) ?? parseComponentSlug(file) ?? "other",
          driver: parseDriverId(titlePath),
          file,
          title: certifiedCaseTitle(titlePath),
        });
      }
    }
    for (const child of suite.suites ?? []) walk(child, next);
  };
  for (const suite of report.suites ?? []) walk(suite, []);
  return cases;
}

export function cellKey(component: string, driver: DriverId): string {
  return `${component}\u0000${driver}`;
}

export function emptyTotals(): CertifiedSummaryTotals {
  return { passed: 0, failed: 0, skipped: 0, waived: 0, flaky: 0 };
}

export function emptyCell(component: string, driver: DriverId): CertifiedCell {
  return {
    component,
    driver,
    passed: 0,
    failed: 0,
    skipped: 0,
    waived: 0,
    flaky: 0,
    failures: [],
  };
}

export function addToTotals(target: CertifiedSummaryTotals, source: CertifiedSummaryTotals): void {
  target.passed += source.passed;
  target.failed += source.failed;
  target.skipped += source.skipped;
  target.waived += source.waived;
  target.flaky += source.flaky;
}

export function mergeCertifiedSummaries(summaries: readonly CertifiedSummary[]): CertifiedSummary {
  const cells = new Map<string, CertifiedCell>();
  const totals = emptyTotals();
  const waived: CertifiedSummary["waived"] = [];
  const unwaived: CertifiedFailure[] = [];
  const waiverProblems: WaiverProblem[] = [];
  const errors: CertifiedRunError[] = [];
  let revision: string | null = null;

  for (const summary of summaries) {
    addToTotals(totals, summary.totals);
    errors.push(...(summary.errors ?? []));
    if (revision == null) revision = summary.revision;
    waived.push(...summary.waived);
    unwaived.push(...summary.unwaived);
    waiverProblems.push(...summary.waiverProblems);
    for (const cell of summary.cells) {
      const key = cellKey(cell.component, cell.driver);
      const existing = cells.get(key) ?? emptyCell(cell.component, cell.driver);
      existing.passed += cell.passed;
      existing.failed += cell.failed;
      existing.skipped += cell.skipped;
      existing.waived += cell.waived;
      existing.flaky += cell.flaky;
      existing.failures.push(...cell.failures);
      cells.set(key, existing);
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    revision,
    shard: null,
    runStatus: mergeRunStatuses(summaries),
    errors,
    totals,
    cells: [...cells.values()].sort(compareCells),
    waived,
    unwaived,
    waiverProblems: uniqueProblems(waiverProblems),
  };
}

/** `passed` only when every shard passed; `null` when any shard failed to record a status. */
function mergeRunStatuses(summaries: readonly CertifiedSummary[]): CertifiedRunStatus | null {
  if (summaries.length === 0) return null;
  const statuses = summaries.map((summary) => summary.runStatus ?? null);
  if (statuses.some((status) => status == null)) return null;
  return (statuses as CertifiedRunStatus[]).find((status) => status !== "passed") ?? "passed";
}

export function shardLabel(summary: Pick<CertifiedSummary, "shard">): string {
  return summary.shard ? `shard ${summary.shard.current}/${summary.shard.total}` : "unsharded run";
}

function firstLine(message: string): string {
  const line = message.split("\n", 1)[0]?.trim() ?? "";
  return line.length > 200 ? `${line.slice(0, 197)}...` : line;
}

/** Does the summary name something that accounts for a non-pass exit? */
function explainsNonPass(summary: CertifiedSummary): boolean {
  return (
    summary.totals.failed > 0 ||
    summary.totals.waived > 0 ||
    summary.unwaived.length > 0 ||
    summary.waiverProblems.length > 0 ||
    (summary.errors?.length ?? 0) > 0
  );
}

/**
 * Every shard must explain its own exit: a load error is always a problem, and a non-pass run
 * status with nothing failed, waived or errored in the summary means the shard died silently.
 */
export function checkShardOutcomes(summaries: readonly CertifiedSummary[]): ShardOutcomeProblem[] {
  const problems: ShardOutcomeProblem[] = [];
  for (const summary of summaries) {
    const shard = shardLabel(summary);
    for (const error of summary.errors ?? []) {
      problems.push({
        kind: "load-error",
        shard,
        detail: `${error.file ?? "no file"}: ${firstLine(error.message)}`,
      });
    }
    if (summary.runStatus == null) {
      problems.push({
        kind: "missing-status",
        shard,
        detail: "the summary records no run status, so the reporter never saw the run end",
      });
      continue;
    }
    if (summary.runStatus === "passed") continue;
    if (explainsNonPass(summary)) continue;
    problems.push({
      kind: "unexplained-status",
      shard,
      detail: `run status ${summary.runStatus}, but the summary records no failed case and no error`,
    });
  }
  return problems;
}

/** What a certified shard job should conclude, and the sentence that says why. */
export interface CertifiedShardVerdict {
  red: boolean;
  reason: string;
}

/**
 * The verdict a certified shard job concludes with (#589).
 *
 * Playwright's own exit code is not waiver-aware: a failure waived in
 * `e2e/certified-waivers.json` still exits 1. Handing that code straight to the
 * job would make a fully waived suite conclude the run `failure`, and
 * `scripts/check-release-evidence.mjs` reads the run conclusion, not the merged
 * report — so a waiver would block publishing instead of permitting it. The
 * shard therefore exits through this gate, which downgrades exit 1 to green
 * only when the shard's own summary explains the exit that way: a `failed` run
 * whose every failure is waived, with no load error and no waiver problem.
 * Everything else stays red, including a shard that wrote no summary at all.
 */
export function certifiedShardVerdict(
  summary: CertifiedSummary | null,
  exitCode: number,
): CertifiedShardVerdict {
  if (exitCode === 0) return { red: false, reason: "the shard exited 0" };
  if (summary == null) {
    return { red: true, reason: `the shard exited ${exitCode} and wrote no summary` };
  }
  const shard = shardLabel(summary);
  const problems = checkShardOutcomes([summary]);
  if (problems.length > 0) {
    return {
      red: true,
      reason: `${shard} does not explain its own exit: ${problems
        .map((problem) => `${problem.kind}: ${problem.detail}`)
        .join("; ")}`,
    };
  }
  if (summary.runStatus !== "failed") {
    return {
      red: true,
      reason: `${shard} exited ${exitCode} with run status ${summary.runStatus ?? "none"}`,
    };
  }
  if (summary.waiverProblems.length > 0) {
    return {
      red: true,
      reason: `${shard} carries ${summary.waiverProblems.length} waiver problem(s): ${summary.waiverProblems
        .map((problem) => `${problem.kind}: ${problem.detail}`)
        .join("; ")}`,
    };
  }
  if (summary.unwaived.length > 0) {
    return {
      red: true,
      reason: `${shard} has ${summary.unwaived.length} unwaived failure(s)`,
    };
  }
  if (summary.waived.length === 0) {
    return {
      red: true,
      reason: `${shard} exited ${exitCode} but names no failure to waive: ${summary.totals.failed} failed, none waived and none unwaived`,
    };
  }
  return {
    red: false,
    reason: `${shard} failed only on ${summary.waived.length} waived case(s); the merged report holds the verdict`,
  };
}

function uniqueProblems(problems: readonly WaiverProblem[]): WaiverProblem[] {
  const seen = new Set<string>();
  const result: WaiverProblem[] = [];
  for (const problem of problems) {
    const key = `${problem.kind}:${problem.detail}`;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(problem);
  }
  return result;
}

function compareCells(left: CertifiedCell, right: CertifiedCell): number {
  return (
    left.component.localeCompare(right.component) ||
    DRIVER_IDS.indexOf(left.driver) - DRIVER_IDS.indexOf(right.driver)
  );
}

/**
 * Moves each waived failure out of its cell's `failures` and into its `waived`
 * count. It runs twice over the same rows — once per shard in the reporter,
 * once more in `merge-certified-reports.ts` over the merged cells — so it has
 * to be idempotent: a cell whose failures no longer hold a waived key keeps the
 * count a shard already gave it instead of being reset to zero. Resetting is
 * what made the merged report print `waived 0` while listing five waived rows
 * underneath it.
 */
export function applyWaiverCounts(
  summary: CertifiedSummary,
  waived: Array<{ failure: CertifiedFailure; waiver: CertifiedWaiver }>,
  unwaived: CertifiedFailure[],
  problems: WaiverProblem[],
): CertifiedSummary {
  const waivedKeys = new Set(waived.map((entry) => failureKey(entry.failure)));
  const cells = summary.cells.map((cell) => {
    const cellWaived = cell.failures.filter((failure) => waivedKeys.has(failureKey(failure)));
    if (cellWaived.length === 0) return { ...cell };
    return {
      ...cell,
      failed: Math.max(0, cell.failed - cellWaived.length),
      waived: cell.waived + cellWaived.length,
      failures: cell.failures.filter((failure) => !waivedKeys.has(failureKey(failure))),
    };
  });
  const totals = emptyTotals();
  for (const cell of cells) {
    totals.passed += cell.passed;
    totals.failed += cell.failed;
    totals.skipped += cell.skipped;
    totals.waived += cell.waived;
    totals.flaky += cell.flaky;
  }

  return {
    ...summary,
    totals,
    cells,
    waived: waived.map((entry) => ({ failure: entry.failure, ticket: entry.waiver.ticket })),
    unwaived,
    waiverProblems: problems,
  };
}

export function failureKey(failure: CertifiedFailure): string {
  return `${failure.file}\u0000${failure.title}`;
}

export function formatCertifiedSummaryMarkdown(summary: CertifiedSummary): string {
  const lines: string[] = [];
  lines.push("## Certified suite — component × driver");
  lines.push("");
  lines.push(
    "This is the recertification bar. Pair and contract jobs in this workflow are **floors**, not acceptance.",
  );
  lines.push("");
  if (summary.revision) {
    lines.push(`Revision: \`${summary.revision}\`.`);
    lines.push("");
  }
  if (summary.shard) {
    lines.push(`Shard: ${summary.shard.current}/${summary.shard.total}.`);
    lines.push("");
  }
  if (summary.runStatus) {
    lines.push(`Run status: \`${summary.runStatus}\`.`);
    lines.push("");
  }
  const { totals } = summary;
  lines.push(
    `Totals: **${totals.passed} passed**, **${totals.failed} failed**, **${totals.skipped} skipped**, **${totals.waived} waived**, **${totals.flaky} flaky**.`,
  );
  lines.push("");
  lines.push("| Component | Driver | Passed | Failed | Skipped | Waived |");
  lines.push("| --- | --- | ---: | ---: | ---: | ---: |");
  for (const cell of summary.cells) {
    lines.push(
      `| ${cell.component} | ${cell.driver} | ${cell.passed} | ${cell.failed} | ${cell.skipped} | ${cell.waived} |`,
    );
  }
  if (summary.cells.length === 0) {
    lines.push("| — | — | 0 | 0 | 0 | 0 |");
  }
  lines.push("");

  if (summary.waived.length > 0) {
    lines.push("### Waived failures");
    lines.push("");
    for (const entry of summary.waived) {
      lines.push(
        `- waived (#${entry.ticket}): \`${entry.failure.component}\` ${entry.failure.driver} — ${entry.failure.title}`,
      );
    }
    lines.push("");
  }

  if (summary.unwaived.length > 0) {
    lines.push("### Unwaived failures");
    lines.push("");
    for (const failure of summary.unwaived) {
      lines.push(`- \`${failure.component}\` ${failure.driver} — ${failure.title}`);
    }
    lines.push("");
  }

  if (summary.errors && summary.errors.length > 0) {
    lines.push("### Run errors");
    lines.push("");
    lines.push("An error outside a test — a spec that failed to load — fails the certified job.");
    lines.push("");
    for (const error of summary.errors) {
      lines.push(`- \`${error.file ?? "no file"}\` — ${firstLine(error.message)}`);
    }
    lines.push("");
  }

  if (summary.waiverProblems.length > 0) {
    lines.push("### Waiver problems");
    lines.push("");
    lines.push("A stale or invalid waiver fails the certified job.");
    lines.push("");
    for (const problem of summary.waiverProblems) {
      lines.push(`- ${problem.kind}: ${problem.detail}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

export function certifiedSummaryPath(outputDir: string, shard: { current: number } | null): string {
  if (shard == null) return `${outputDir}/${CERTIFIED_SUMMARY_FILENAME}`;
  return `${outputDir}/certified-summary.${shard.current}.json`;
}

export function readCertifiedSummaryFile(path: string): CertifiedSummary | null {
  if (!existsSync(path)) return null;
  const raw = JSON.parse(readFileSync(path, "utf8")) as CertifiedSummary;
  // A summary written before the run-status field existed keeps `null`, which is itself a problem.
  return { ...raw, runStatus: raw.runStatus ?? null, errors: raw.errors ?? [] };
}

/** The skipped and flaky ceilings the merge holds the whole suite to. */
export interface CertifiedRunBudgets {
  skippedCeiling: number;
  flakyBudget: number;
}

export interface RunBudgetProblem {
  kind: "over-skipped" | "over-flaky";
  detail: string;
}

/**
 * A skip and a retry-pass are both green in every count we print, so a suite can
 * quietly stop running and stay green. The ceilings live beside the case floor,
 * in `e2e/certified-case-floor.json`: one file, one line each for the owner.
 */
export function loadCertifiedRunBudgets(comparisonRoot: string): CertifiedRunBudgets {
  const path = join(comparisonRoot, "e2e", "certified-case-floor.json");
  const raw = JSON.parse(readFileSync(path, "utf8")) as Partial<CertifiedRunBudgets>;
  if (typeof raw.skippedCeiling !== "number" || typeof raw.flakyBudget !== "number") {
    throw new Error(`${path} must carry numeric skippedCeiling and flakyBudget`);
  }
  return { skippedCeiling: raw.skippedCeiling, flakyBudget: raw.flakyBudget };
}

export function checkRunBudgets(
  totals: CertifiedSummaryTotals,
  budgets: CertifiedRunBudgets,
): RunBudgetProblem[] {
  const problems: RunBudgetProblem[] = [];
  if (totals.skipped > budgets.skippedCeiling) {
    problems.push({
      kind: "over-skipped",
      detail:
        `${totals.skipped} skipped cases, ceiling ${budgets.skippedCeiling} — every skip must be a ` +
        `registered knownDivergence. Fix the case, or register it and raise the ceiling in ` +
        `e2e/certified-case-floor.json.`,
    });
  }
  if (totals.flaky > budgets.flakyBudget) {
    problems.push({
      kind: "over-flaky",
      detail:
        `${totals.flaky} cases passed only on a retry, budget ${budgets.flakyBudget} — a retry-pass ` +
        `is a failure the report rounds off. Fix it, or raise the budget in ` +
        `e2e/certified-case-floor.json and say why.`,
    });
  }
  return problems;
}

export function relativeSpecFile(comparisonRoot: string, file: string): string {
  const rel = relative(comparisonRoot, file).replaceAll("\\", "/");
  return rel.startsWith("e2e/") ? rel : file.replaceAll("\\", "/");
}
