export interface CertifiedSuiteEvidence {
  revision: string;
  runId: number;
  jobId: number;
  completedAt: string;
  total: number;
  passed: number;
  failed: number;
  skipped: number;
}

/**
 * Postcard from the last complete certified suite run that was recorded against
 * an exact checked revision. This is NOT live truth. Ticket #194. The recorded
 * SHA is `0f1e1198` (2026-08-21, 2170 passed / 0 failed / 4 skipped). HEAD has
 * moved hundreds of commits since. `validateCertifiedSuiteEvidence` checks
 * arithmetic and skipped-count against the registered `knownDivergences`
 * inventory; it does not check `revision === HEAD`. Report printers must label
 * this as a stale postcard whenever HEAD differs.
 */
export const lastFullCertifiedSuiteRun: CertifiedSuiteEvidence = {
  revision: "0f1e1198963c46eb3294744475e269a7c0041eb6",
  runId: 32485238975,
  jobId: 96780157126,
  completedAt: "2026-08-21T13:45:39Z",
  total: 2174,
  passed: 2170,
  failed: 0,
  skipped: 4,
};

export function certifiedSuitePostcardIsCurrent(
  evidence: CertifiedSuiteEvidence,
  headSha: string | null,
): boolean {
  return headSha != null && headSha === evidence.revision;
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
  if (evidence.passed + evidence.failed + evidence.skipped !== evidence.total) {
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
  revision: "15ca6d4cd685289daa9666485b58fbb059f1c300",
  completedAt: "2026-09-05T04:57:48.170Z",
  scope: "e2e/certified/field-validity.certified.spec.ts (D14 native validity only)",
  passed: 39,
  failed: 0,
  skipped: 0,
  total: 39,
  complete: false,
  blockingReason:
    "D14-only recording. WSL Chromium 151 never issues a compositor frame, so D3 screenshots time out waiting for element stability (15s bound, not 180s hang). Not the full certified suite. Postcard remains 0f1e1198. Do not version from these counts.",
};
