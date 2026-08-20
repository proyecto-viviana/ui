import { existsSync } from "node:fs";
import path from "node:path";

/** The ten additive playbook gates. Titles match the validation-note table. */
export const ACCEPTANCE_GATES = [
  "Official Docs And Viewer Parity",
  "External Authority And Standards",
  "Upstream React Source Parity",
  "Solid Idiomatic Implementation",
  "Accessibility And I18n",
  "Behavior State Machine",
  "Style Source-To-Computed Parity",
  "React-Vs-Solid Comparison Harness Parity",
  "Known Defects And Regression Protection",
  "Evidence And Handoff",
] as const;

export type AcceptanceGate = (typeof ACCEPTANCE_GATES)[number];

/** Permitted current-gate outcomes. Nothing else is complete. */
export type CanonicalGateOutcome = "complete" | "partial" | "not-started";

/**
 * `unnormalized` is historical vocabulary (`done`, `passing`, `accepted`,
 * `covered`, `updated`). It is not complete. `missing` means the gate row is
 * absent from the note.
 */
export type GateOutcomeKind = CanonicalGateOutcome | "unnormalized" | "missing";

export interface EvidencePointer {
  /** Path relative to `apps/comparison` (`e2e/…`) or the repo root (`packages/…`). */
  file: string;
  /** Optional Playwright title, case id, or note. */
  title?: string;
}

export interface ClassifiedGateOutcome {
  kind: GateOutcomeKind;
  raw: string;
}

const CANONICAL_OUTCOMES = new Set<string>(["complete", "partial", "not-started"]);

export function splitSpecString(spec: string | undefined): string[] {
  if (spec == null) {
    return [];
  }

  return spec
    .split(/[+;]/)
    .map((part) => part.trim())
    .filter((part) => part.length > 0);
}

export function evidencePointersFromSpec(spec: string | undefined): EvidencePointer[] {
  return splitSpecString(spec).map((file) => ({ file }));
}

export function classifyGateOutcome(raw: string): ClassifiedGateOutcome {
  const token = raw
    .trim()
    .toLowerCase()
    .replace(/[_/]/g, "-")
    .split(/\s+/)[0]
    ?.replace(/[^a-z-]/g, "");

  if (token == null || token.length === 0) {
    return { kind: "missing", raw };
  }

  if (CANONICAL_OUTCOMES.has(token)) {
    return { kind: token as CanonicalGateOutcome, raw };
  }

  return { kind: "unnormalized", raw };
}

export function resolveEvidenceFile(
  file: string,
  roots: { comparisonRoot: string; repoRoot: string },
): string | null {
  const rel = file.trim();
  if (rel.length === 0) {
    return null;
  }

  const candidates = [path.join(roots.comparisonRoot, rel), path.join(roots.repoRoot, rel)];

  for (const candidate of candidates) {
    if (existsSync(candidate)) {
      return candidate;
    }
  }

  return null;
}

export function isAcceptanceGate(value: string): value is AcceptanceGate {
  return (ACCEPTANCE_GATES as readonly string[]).includes(value);
}
