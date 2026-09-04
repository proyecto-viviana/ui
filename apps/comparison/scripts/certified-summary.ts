import { existsSync, readFileSync } from "node:fs";
import { basename, relative } from "node:path";

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
  "D-scroll",
  "D-reorder",
  "other",
] as const;

export type DriverId = (typeof DRIVER_IDS)[number];

const DRIVER_RE = /^(D(?:1[0-2]|[1-9]|-scroll|-reorder))\b/;

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

export interface CertifiedSummary {
  generatedAt: string;
  revision: string | null;
  shard: { current: number; total: number } | null;
  totals: CertifiedSummaryTotals;
  cells: CertifiedCell[];
  waived: Array<{ failure: CertifiedFailure; ticket: number }>;
  unwaived: CertifiedFailure[];
  waiverProblems: WaiverProblem[];
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
    const match = /^(D(?:1[0-2]|[1-9]|-scroll|-reorder))\b.* — (.+)$/.exec(part.trim());
    if (match?.[2]) {
      return match[2]
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
    }
  }
  return null;
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
  let revision: string | null = null;

  for (const summary of summaries) {
    addToTotals(totals, summary.totals);
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
    totals,
    cells: [...cells.values()].sort(compareCells),
    waived,
    unwaived,
    waiverProblems: uniqueProblems(waiverProblems),
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

export function applyWaiverCounts(
  summary: CertifiedSummary,
  waived: Array<{ failure: CertifiedFailure; waiver: CertifiedWaiver }>,
  unwaived: CertifiedFailure[],
  problems: WaiverProblem[],
): CertifiedSummary {
  const waivedKeys = new Set(waived.map((entry) => failureKey(entry.failure)));
  const cells = summary.cells.map((cell) => {
    const cellWaived = cell.failures.filter((failure) => waivedKeys.has(failureKey(failure)));
    if (cellWaived.length === 0) return { ...cell, waived: 0 };
    return {
      ...cell,
      failed: Math.max(0, cell.failed - cellWaived.length),
      waived: cellWaived.length,
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
  return JSON.parse(readFileSync(path, "utf8")) as CertifiedSummary;
}

export function relativeSpecFile(comparisonRoot: string, file: string): string {
  const rel = relative(comparisonRoot, file).replaceAll("\\", "/");
  return rel.startsWith("e2e/") ? rel : file.replaceAll("\\", "/");
}
