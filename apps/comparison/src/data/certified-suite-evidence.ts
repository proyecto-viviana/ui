export type CertifiedSuiteEvidence = {
  revision: string;
  completedAt: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  waived?: number;
} & (
  | { runId: number; jobId: number; localMergeReceipt?: never }
  | { runId?: never; jobId?: never; localMergeReceipt: { path: string; sha256: string } }
);

/**
 * Last complete certified suite, recorded from a sequential eight-shard local
 * run and the merged certified report. This is recorded evidence, not live
 * truth. Ticket #194.
 */
export const lastFullCertifiedSuiteRun: CertifiedSuiteEvidence = {
  revision: "6d685a030562e715e40ba7a7c421e8883f783d72",
  completedAt: "2026-10-21T13:06:17.960555+00:00",
  total: 2317,
  passed: 2317,
  failed: 0,
  skipped: 0,
  waived: 0,
  localMergeReceipt: {
    path: ".agents/UI-EXECUTION-574-certified-full-6d685a03.json",
    sha256: "c75ec9423ae79ca904a19c919a790ab5cdf008ad67d49abbdae7b61dd350c0ba",
  },
};

/**
 * What can move a certified verdict, as git pathspecs. The run is much wider
 * than the components it certifies: `comparison:test:certified` builds the six
 * workspace packages and the comparison app, resolves the pinned React oracle
 * from `apps/comparison/package.json` and `pnpm-lock.yaml`, runs `e2e/certified`
 * under `apps/comparison/playwright.config.ts`, and only becomes a verdict
 * through `apps/comparison/scripts/**` (the shard check, the merger, the
 * waivers, the budgets), `scripts/check-certified-case-floor.mjs` and the shard
 * matrix in `.github/workflows/certification-gates.yml`.
 *
 * Naming those by hand is how the first version of this rule came to cover
 * component source and fixtures only, and a postcard survived the commit that
 * repaired the merger (#574, audit finding `r2-guards-1`). So the rule fails
 * closed: everything is covered, a new directory invalidates by default, and a
 * path leaves the set only on a reviewed line below. Ticket #574.
 */
export const certifiedSuiteCoveredPathspecs = [
  // The whole tree, minus the reviewed lines under it.
  ":(top,glob)**",
  // The postcard itself, or the commit that records a run would invalidate the
  // run it records — the unsatisfiable gate this ticket opened on.
  ":(top,exclude)apps/comparison/src/data/certified-suite-evidence.ts",
  // Prose. No step of the run reads markdown, and every ticket, receipt,
  // playbook, changeset, ADR and README here is `*.md`.
  ":(top,exclude,glob)**/*.md",
  // The board and the receipts: tickets, plans, logs, command output and
  // one-off probes, written after a run and never read by one. That claim was
  // false when this line was written: the merged verdict resolved each waiver's
  // ticket state out of `.claude/tickets/**/<id>-*.md`, so a single commit
  // editing `status:` could flip the merger's exit code while the diff below
  // listed nothing. The state is a field of the covered
  // `apps/comparison/e2e/certified-waivers.json` now, held to the board by
  // `comparison:guard:certified-waiver-tickets` outside the run, and the
  // `keeps the board out of the certified verdict` case of
  // `certified-waivers.test.ts` fails if a board read comes back. #574.
  ":(top,exclude,glob).claude/**",
  ":(top,exclude,glob).agents/**",
  // The docs site. The certified run builds `packages/*` and `apps/comparison`
  // and serves the comparison preview; it never builds or loads `apps/web`.
  ":(top,exclude,glob)apps/web/**",
  // The release workflow. The certified run verifies packages and comparison;
  // it never runs or references release automation.
  ":(top,exclude).github/workflows/release.yml",
] as const;

export interface PostcardGitProbe {
  hasCommit(revision: string): boolean;
  isAncestor(revision: string, head: string): boolean;
  changedCoveredPaths(revision: string, head: string): string[];
  /**
   * Covered paths the working tree holds and no commit does — modified, staged
   * or untracked. A commit-to-commit diff cannot see them, and the suite runs
   * the working tree, not HEAD.
   */
  dirtyCoveredPaths(): string[];
}

export type PostcardCurrency = { current: true } | { current: false; reason: string };

function sampled(kind: string, paths: string[]): string {
  const sample = paths.slice(0, 3).join(", ");
  const more = paths.length > 3 ? `, and ${paths.length - 3} more` : "";
  return `${paths.length} certified path(s) ${kind}: ${sample}${more}`;
}

/**
 * The postcard is current when its revision is HEAD or an ancestor of it, no
 * covered path changed in between, and no covered path is uncommitted. Ticket
 * #574: equality with HEAD could never hold, since recording the SHA is itself
 * a commit; and a rule that asked only about commits passed a working tree the
 * recorded run never saw, which is the local answer that decides a re-pin.
 */
export function certifiedSuitePostcardCurrency(
  evidence: CertifiedSuiteEvidence,
  head: string | null,
  git: PostcardGitProbe,
): PostcardCurrency {
  if (head == null) return { current: false, reason: "HEAD is unknown" };
  if (!git.hasCommit(evidence.revision)) {
    // A shallow clone lands here. Failing is the point: passing would switch
    // the gate off exactly where it runs.
    return {
      current: false,
      reason:
        `revision ${evidence.revision} is not in this clone; ` +
        "check out with fetch-depth: 0 so its ancestry can be tested",
    };
  }
  if (!git.isAncestor(evidence.revision, head)) {
    return { current: false, reason: `revision ${evidence.revision} is not an ancestor of HEAD` };
  }
  const changed = git.changedCoveredPaths(evidence.revision, head);
  if (changed.length > 0) {
    return { current: false, reason: sampled("changed since it", changed) };
  }
  const dirty = git.dirtyCoveredPaths();
  if (dirty.length > 0) {
    return { current: false, reason: sampled("are uncommitted", dirty) };
  }
  return { current: true };
}

export function validateCertifiedSuiteEvidence(
  evidence: CertifiedSuiteEvidence,
  expectedSkipped: number,
  localReceipt?: unknown,
): string[] {
  const problems: string[] = [];

  if (!/^[0-9a-f]{40}$/.test(evidence.revision)) {
    problems.push("revision must be a full Git commit SHA");
  }
  if (Number.isNaN(Date.parse(evidence.completedAt))) {
    problems.push("completedAt must be an ISO date-time");
  }
  if (
    evidence.passed + evidence.failed + evidence.skipped + (evidence.waived ?? 0) !==
    evidence.total
  ) {
    problems.push("passed, failed, and skipped counts must add up to total");
  }
  if (evidence.failed !== 0) {
    problems.push("the recorded full certified suite must have zero failures");
  }
  if (evidence.skipped !== expectedSkipped) {
    problems.push(
      `skipped=${evidence.skipped} does not match ${expectedSkipped} registered known divergences`,
    );
  }

  if (evidence.localMergeReceipt != null) {
    const local = evidence.localMergeReceipt;
    if (evidence.runId != null || evidence.jobId != null) {
      problems.push("local merge provenance must not include GitHub run/job IDs");
    }
    const hash = (value: unknown): value is string =>
      typeof value === "string" && /^[0-9a-f]{64}$/.test(value) && !/^0{64}$/.test(value);
    const record = (value: unknown): value is Record<string, unknown> =>
      value != null && typeof value === "object" && !Array.isArray(value);
    if (!/^\.agents\/[A-Za-z0-9][A-Za-z0-9._-]*\.json$/.test(local.path) || !hash(local.sha256)) {
      problems.push(
        "local provenance requires a portable .agents JSON receipt and non-placeholder SHA256",
      );
    }
    if (
      !record(localReceipt) ||
      localReceipt.revision !== evidence.revision ||
      localReceipt.completedAt !== evidence.completedAt ||
      !record(localReceipt.merge) ||
      !Array.isArray(localReceipt.shards) ||
      localReceipt.shards.length !== 8
    ) {
      problems.push("local provenance requires the complete recorded eight-shard merge");
    } else {
      const merge = localReceipt.merge;
      if (
        merge.script !== "apps/comparison/scripts/merge-certified-reports.ts" ||
        merge.expectedShards !== 8 ||
        merge.actualProcessExitCode !== 0 ||
        merge.timedOut !== false ||
        merge.ownedClosureEstablished !== true ||
        merge.allBoundInputsConserved !== true ||
        merge.completedWithinGrant !== true ||
        !hash(merge.receiptSha256) ||
        !hash(merge.summarySha256) ||
        !Array.isArray(merge.remainingOwnedProcesses) ||
        merge.remainingOwnedProcesses.length !== 0
      ) {
        problems.push(
          "local merge must bind the original closed conserved successful merge and summary",
        );
      }
      const totals = localReceipt.totals;
      if (
        !record(totals) ||
        totals.passed !== evidence.passed ||
        totals.failed !== evidence.failed ||
        totals.skipped !== evidence.skipped ||
        totals.waived !== (evidence.waived ?? 0) ||
        totals.failed !== 0 ||
        totals.skipped !== 0 ||
        totals.waived !== 0 ||
        totals.flaky !== 0
      ) {
        problems.push("local postcard must match the merged zero-failure/skip/waiver/flaky result");
      }
      let passed = 0;
      const identities = new Set<number>();
      for (const shard of localReceipt.shards) {
        if (
          !record(shard) ||
          typeof shard.shard !== "number" ||
          !Number.isInteger(shard.shard) ||
          shard.shard < 1 ||
          shard.shard > 8 ||
          identities.has(shard.shard) ||
          shard.totalShards !== 8 ||
          shard.revision !== evidence.revision ||
          shard.scope !== "e2e/certified" ||
          shard.workers !== 2 ||
          shard.actualProcessExitCode !== 0 ||
          shard.rawPlaywrightExitCode !== 0 ||
          shard.originalWaiverAwareGateExitCode !== 0 ||
          shard.timedOut !== false ||
          shard.ownedClosureEstablished !== true ||
          shard.allBoundInputsConserved !== true ||
          shard.completedWithinGrant !== true ||
          !Array.isArray(shard.remainingOwnedProcesses) ||
          shard.remainingOwnedProcesses.length !== 0 ||
          shard.runStatus !== "passed" ||
          !hash(shard.closedReturnSha256) ||
          !hash(shard.summarySha256) ||
          !record(shard.totals) ||
          typeof shard.totals.passed !== "number" ||
          !Number.isSafeInteger(shard.totals.passed) ||
          shard.totals.passed < 0 ||
          shard.totals.failed !== 0 ||
          shard.totals.skipped !== 0 ||
          shard.totals.waived !== 0 ||
          shard.totals.flaky !== 0
        ) {
          problems.push(
            "local shard identities must be all eight original closed conserved zero-debt results",
          );
          continue;
        }
        identities.add(shard.shard);
        passed += shard.totals.passed;
      }
      if (identities.size !== 8 || passed !== evidence.passed) {
        problems.push("local full shard coverage/counts do not match the postcard");
      }
    }
  }

  return problems;
}

/**
 * A HEAD recording that is not the full certified suite. Ticket #194.
 * Counts here must not be copied into `lastFullCertifiedSuiteRun`. A subset
 * cannot version a release; the postcard stays stale until a complete suite
 * against this SHA finishes with zero failures.
 */
export interface CertifiedSuiteSubsetEvidence {
  revision: string;
  completedAt: string;
  scope: string;
  passed: number;
  failed: number;
  skipped: number;
  total: number;
  /** Literal false — a subset is never the postcard. */
  complete: false;
  blockingReason: string;
}

export const lastHeadCertifiedSubsetRun: CertifiedSuiteSubsetEvidence = {
  revision: "d15a86fff09308728aa67887654aa57f7eb1ec8a",
  completedAt: "2026-09-05T06:55:52.200Z",
  scope: "D5+D6+D8+D14 certified (303) plus Button D1/D3/D4/D7 (34). Not the full certified suite.",
  passed: 308,
  failed: 25,
  skipped: 4,
  total: 337,
  complete: false,
  blockingReason:
    "Partial HEAD recording. D3 fail-closes when CDP Page.captureScreenshot never returns a compositor frame (not a skip or postcard). Full comparison:test:certified was not run. Postcard remains 0f1e1198. Do not version from these counts.",
};
