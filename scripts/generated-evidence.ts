/// <reference types="node" />

import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

export const WCAG_REPORT_PATH = "apps/comparison/e2e/reports/wcag-aaa-report.md";
export const WCAG_REPORT_GENERATOR = "apps/comparison/e2e/reporters/wcag-aaa-report.ts";
export const WCAG_REPORT_COMMAND =
  'WCAG_REPORT=1 vp exec playwright test e2e/certified --grep "D7 contrast|D8 target size"';

function frontmatterValue(contents: string, field: string): string | null {
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(contents)?.[1];
  if (!frontmatter) return null;
  const raw = new RegExp(`^${field}:\\s*(.+?)\\s*$`, "m").exec(frontmatter)?.[1];
  if (!raw) return null;
  if (raw.startsWith('"')) {
    try {
      const parsed: unknown = JSON.parse(raw);
      return typeof parsed === "string" ? parsed : null;
    } catch {
      return null;
    }
  }
  return raw.replace(/^'|'$/g, "");
}

function summaryCount(contents: string, label: string): number | null {
  const match = new RegExp(`^- ${label}: \\*\\*(\\d+)\\*\\*`, "m").exec(contents);
  return match ? Number(match[1]) : null;
}

export interface GeneratedEvidenceOptions {
  reportPath?: string;
}

export function checkGeneratedEvidence(
  root: string,
  options: GeneratedEvidenceOptions = {},
): string[] {
  const failures: string[] = [];
  const reportPath = options.reportPath ?? WCAG_REPORT_PATH;
  const absolute = path.join(root, reportPath);
  if (!existsSync(absolute)) return [`Generated evidence is missing: ${reportPath}`];

  const contents = readFileSync(absolute, "utf8");
  const expectedFields = [
    "kind",
    "status",
    "generator",
    "command",
    "source-revision",
    "source-dirty",
    "generated-at",
    "result",
    "scope",
  ];
  for (const field of expectedFields) {
    if (frontmatterValue(contents, field) === null) {
      failures.push(`Generated evidence lacks ${field}: ${reportPath}`);
    }
  }

  if (frontmatterValue(contents, "kind") !== "generated-evidence") {
    failures.push(`Generated evidence has invalid kind: ${reportPath}`);
  }
  if (frontmatterValue(contents, "status") !== "current") {
    failures.push(`Generated evidence is not current: ${reportPath}`);
  }
  if (frontmatterValue(contents, "generator") !== WCAG_REPORT_GENERATOR) {
    failures.push(`Generated evidence names the wrong generator: ${reportPath}`);
  } else if (!existsSync(path.join(root, WCAG_REPORT_GENERATOR))) {
    failures.push(`Generated-evidence generator is missing: ${WCAG_REPORT_GENERATOR}`);
  }
  if (frontmatterValue(contents, "command") !== WCAG_REPORT_COMMAND) {
    failures.push(`Generated evidence names the wrong command: ${reportPath}`);
  }

  const revision = frontmatterValue(contents, "source-revision");
  if (!revision || !/^[0-9a-f]{40}(?:[0-9a-f]{24})?$/.test(revision)) {
    failures.push(`Generated evidence has an invalid source revision: ${reportPath}`);
  }
  if (frontmatterValue(contents, "source-dirty") !== "false") {
    failures.push(`Generated evidence must come from a clean source: ${reportPath}`);
  }
  if (frontmatterValue(contents, "result") !== "passed") {
    failures.push(`Generated evidence does not record a passing result: ${reportPath}`);
  }

  const generatedAt = frontmatterValue(contents, "generated-at");
  const generatedAtMs = generatedAt ? Date.parse(generatedAt) : Number.NaN;
  if (
    !generatedAt ||
    Number.isNaN(generatedAtMs) ||
    new Date(generatedAtMs).toISOString() !== generatedAt
  ) {
    failures.push(`Generated evidence has an invalid timestamp: ${reportPath}`);
  }

  const scope = frontmatterValue(contents, "scope");
  const scopeMatch =
    /^D7 contrast \((\d+) components\) and D8 target size \((\d+) components\)$/.exec(scope ?? "");
  if (!scopeMatch) {
    failures.push(`Generated evidence has an invalid result scope: ${reportPath}`);
  } else {
    const contrast = summaryCount(contents, "Components scanned for contrast \\(D7\\)");
    const target = summaryCount(contents, "Components scanned for target size \\(D8\\)");
    if (contrast !== Number(scopeMatch[1]) || target !== Number(scopeMatch[2])) {
      failures.push(`Generated-evidence scope does not match its summary: ${reportPath}`);
    }
  }

  return failures;
}
