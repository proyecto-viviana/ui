import { execFileSync } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import type {
  FullConfig,
  FullResult,
  Reporter,
  TestCase,
  TestError,
  TestResult,
} from "@playwright/test/reporter";

import { clearCompositorPaintLatch } from "../visual-diff";
import {
  applyWaiverCounts,
  CERTIFIED_RUN_STATUSES,
  certifiedCaseTitle,
  certifiedSummaryPath,
  emptyCell,
  emptyTotals,
  formatCertifiedSummaryMarkdown,
  parseComponentFromTitlePath,
  parseComponentSlug,
  parseDriverId,
  relativeSpecFile,
  type CertifiedCell,
  type CertifiedRunError,
  type CertifiedRunStatus,
  type CertifiedSummary,
} from "../../scripts/certified-summary";
import type { CertifiedFailure } from "../../scripts/certified-waivers";
import {
  comparisonRootFrom,
  defaultWaiversPath,
  evaluateCertifiedWaivers,
  loadCertifiedWaivers,
} from "../../scripts/certified-waivers";

interface RecordedTest {
  test: TestCase;
  result: TestResult;
}

export default class CertifiedSummaryReporter implements Reporter {
  private readonly tests = new Map<string, RecordedTest>();
  private readonly errors: CertifiedRunError[] = [];
  private shard: { current: number; total: number } | null = null;
  private revision: string | null = null;
  private runStatus: CertifiedRunStatus | null = null;

  onBegin(config: FullConfig): void {
    clearCompositorPaintLatch();
    this.shard = config.shard ? { current: config.shard.current, total: config.shard.total } : null;
    try {
      this.revision = execFileSync("git", ["rev-parse", "HEAD"], {
        encoding: "utf8",
        cwd: comparisonRootFrom(import.meta.url),
      }).trim();
    } catch {
      this.revision = null;
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    this.tests.set(test.id, { test, result });
  }

  /** Playwright reports a spec that failed to load here, and nowhere else. */
  onError(error: TestError): void {
    const comparisonRoot = comparisonRootFrom(import.meta.url);
    const file = error.location?.file ?? null;
    this.errors.push({
      file: file ? relativeSpecFile(comparisonRoot, file) : null,
      message: error.message ?? error.value ?? String(error.stack ?? "unknown error"),
    });
  }

  onEnd(result: FullResult): void {
    this.runStatus = normalizeRunStatus(result?.status);
    const comparisonRoot = comparisonRootFrom(import.meta.url);
    const cells = new Map<string, CertifiedCell>();
    const failures: CertifiedFailure[] = [];
    const totals = emptyTotals();

    for (const { test, result } of this.tests.values()) {
      const driver = parseDriverId(test.titlePath());
      if (driver === "other") continue;
      const file = relativeSpecFile(comparisonRoot, test.location.file);
      const component =
        parseComponentFromTitlePath(test.titlePath()) ?? parseComponentSlug(file) ?? "other";
      const key = `${component}\u0000${driver}`;
      const cell = cells.get(key) ?? emptyCell(component, driver);
      const title = certifiedCaseTitle(test.titlePath());
      const outcome = classifyResult(result);

      if (outcome === "passed") {
        cell.passed += 1;
        totals.passed += 1;
        if (result.retry > 0) {
          cell.flaky += 1;
          totals.flaky += 1;
        }
      } else if (outcome === "skipped") {
        cell.skipped += 1;
        totals.skipped += 1;
      } else {
        cell.failed += 1;
        totals.failed += 1;
        const failure: CertifiedFailure = { component, driver, file, title };
        cell.failures.push(failure);
        failures.push(failure);
      }
      cells.set(key, cell);
    }

    const waiversPath = defaultWaiversPath(comparisonRoot);
    const loaded = loadCertifiedWaivers(waiversPath);
    const evaluation = evaluateCertifiedWaivers({
      waivers: loaded.waivers,
      failures,
      now: new Date(),
    });

    const draft: CertifiedSummary = {
      generatedAt: new Date().toISOString(),
      revision: this.revision,
      shard: this.shard,
      runStatus: this.runStatus,
      errors: this.errors,
      totals,
      cells: [...cells.values()].sort(
        (left, right) =>
          left.component.localeCompare(right.component) || left.driver.localeCompare(right.driver),
      ),
      waived: [],
      unwaived: failures,
      waiverProblems: [...loaded.problems, ...evaluation.problems],
    };
    const summary = applyWaiverCounts(
      draft,
      evaluation.waived,
      evaluation.unwaived,
      draft.waiverProblems,
    );

    const outputDir = path.join(comparisonRoot, "test-results");
    mkdirSync(outputDir, { recursive: true });
    const jsonPath = certifiedSummaryPath(outputDir, this.shard);
    const markdown = formatCertifiedSummaryMarkdown(summary);
    writeFileSync(jsonPath, `${JSON.stringify(summary, null, 2)}\n`);
    writeFileSync(jsonPath.replace(/\.json$/, ".md"), markdown);

    // eslint-disable-next-line no-console
    console.log(`\n[certified-summary] wrote ${path.relative(comparisonRoot, jsonPath)}\n`);
    // eslint-disable-next-line no-console
    console.log(markdown);

    if (summary.errors.length > 0) {
      // eslint-disable-next-line no-console
      console.error(
        `[certified-summary] run errors (the merge fails the job):\n${summary.errors
          .map((error) => `- ${error.file ?? "no file"}: ${error.message.split("\n", 1)[0]}`)
          .join("\n")}`,
      );
    }

    if (summary.waiverProblems.length > 0) {
      // eslint-disable-next-line no-console
      console.error(
        `[certified-summary] waiver problems (certified report fails the job):\n${summary.waiverProblems
          .map((problem) => `- ${problem.kind}: ${problem.detail}`)
          .join("\n")}`,
      );
    }
  }
}

function normalizeRunStatus(status: string | undefined): CertifiedRunStatus | null {
  return (CERTIFIED_RUN_STATUSES as readonly string[]).includes(status ?? "")
    ? (status as CertifiedRunStatus)
    : null;
}

function classifyResult(result: TestResult): "passed" | "failed" | "skipped" {
  if (result.status === "skipped") return "skipped";
  if (result.status === "passed") return "passed";
  return "failed";
}
