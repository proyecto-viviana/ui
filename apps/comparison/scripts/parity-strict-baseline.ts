/**
 * The strict baseline freezes the catalogue-depth backlog (#85) so the gate can
 * block without waiting for it. It may only shrink: a gap it lists that no
 * longer occurs is an entry to delete, and the report fails until it is gone,
 * as `scripts/check-peers.mjs` does for its allowlist (#194).
 */

export const strictBaselineSections = [
  "missingControlGroups",
  "missingValidationNotes",
  "noCurrentVisualEvidence",
] as const;

export type StrictBaselineSection = (typeof strictBaselineSections)[number];

export interface StrictBaseline {
  version: number;
  allowedBlockingGapSlugs: Record<StrictBaselineSection, string[]>;
}

/** Gaps the baseline does not cover: these fail `--strict`. */
export function unbaselined<T extends { slug: string }>(
  gaps: readonly T[],
  allowed: readonly string[] | undefined,
): readonly T[] {
  if (allowed == null) return gaps;
  const allow = new Set(allowed);
  return gaps.filter((gap) => !allow.has(gap.slug));
}

/** Baselined slugs whose gap no longer occurs: these fail `--strict` too. */
export function staleBaselineSlugs(
  gaps: readonly { slug: string }[],
  allowed: readonly string[] | undefined,
): string[] {
  if (allowed == null) return [];
  const present = new Set(gaps.map((gap) => gap.slug));
  return allowed.filter((slug) => !present.has(slug));
}
