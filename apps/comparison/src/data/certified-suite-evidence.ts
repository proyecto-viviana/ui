export interface CertifiedSuiteEvidence {
  revision: string;
  runId: number;
  jobId: number;
  completedAt: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
  waived?: number;
}

/**
 * Postcard from the last complete certified suite run that was recorded against
 * an exact checked revision. This is NOT live truth. Ticket #194. The recorded
 * SHA is `bb277c52` (2026-09-24, 2168 passed / 0 failed / 4 skipped / 5 waived).
 * `validateCertifiedSuiteEvidence` checks arithmetic and skipped-count against
 * the registered `knownDivergences` inventory; `certifiedSuitePostcardCurrency`
 * decides whether the run still speaks for HEAD, and the report blocks when it
 * does not.
 */
export const lastFullCertifiedSuiteRun: CertifiedSuiteEvidence = {
  revision: "bb277c5248d9762b6524702a0dab398165ae5159",
  runId: 35936775475,
  jobId: 107440102123,
  completedAt: "2026-09-24T00:24:44Z",
  total: 2177,
  passed: 2168,
  failed: 0,
  skipped: 4,
  waived: 5,
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
