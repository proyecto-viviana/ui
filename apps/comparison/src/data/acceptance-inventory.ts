import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import {
  ACCEPTANCE_GATES,
  classifyGateOutcome,
  evidencePointersFromSpec,
  isAcceptanceGate,
  resolveEvidenceFile,
  resolveRunnableEvidencePointer,
  type AcceptanceGate,
  type ClassifiedGateOutcome,
  type EvidencePointer,
  type GateOutcomeKind,
  type LegacyEvidencePointer,
} from "./acceptance-schema";
import { officialVisualStateCoverage, type VisualStateTarget } from "./visual-state-matrix";

export interface NoteGateRow {
  gate: AcceptanceGate;
  outcome: ClassifiedGateOutcome;
  evidence: string;
  blockers: string;
}

export interface NoteInventory {
  file: string;
  hasOutcomeTable: boolean;
  rows: NoteGateRow[];
  missingGates: AcceptanceGate[];
}

export interface CertifiedFixme {
  spec: string;
  caseId: string;
  reason: string;
}

export interface DeferredComment {
  spec: string;
  line: number;
  text: string;
}

export type VisualStateEvidenceStatus = "resolved" | "legacy" | "missing" | "invalid";

export interface VisualStateEvidenceRecord {
  slug: string;
  stateId: string;
  status: VisualStateEvidenceStatus;
  pointers: readonly EvidencePointer[];
  invalidPointers: readonly EvidencePointer[];
}

export function parseGateOutcomeTable(markdown: string): NoteGateRow[] {
  const heading = /^#{2,3}\s+Gate Outcome Summary\b/m.exec(markdown);
  if (heading == null || heading.index == null) {
    return [];
  }

  const after = markdown.slice(heading.index + heading[0].length);
  const nextHeading = after.search(/\n#{2,3}\s+/);
  const section = nextHeading === -1 ? after : after.slice(0, nextHeading);
  const rows: NoteGateRow[] = [];

  for (const line of section.split("\n")) {
    if (!line.startsWith("|")) {
      continue;
    }

    const cols = line
      .split("|")
      .slice(1, -1)
      .map((col) => col.trim());
    if (cols.length < 2) {
      continue;
    }

    const gate = cols[0];
    if (gate === "Gate" || /^-+$/.test(gate.replace(/\s/g, ""))) {
      continue;
    }
    if (!isAcceptanceGate(gate)) {
      continue;
    }

    rows.push({
      gate,
      outcome: classifyGateOutcome(cols[1] ?? ""),
      evidence: cols[2] ?? "",
      blockers: cols[3] ?? "",
    });
  }

  return rows;
}

export function inventoryValidationNotes(notesDir: string): NoteInventory[] {
  return readdirSync(notesDir)
    .filter((name) => name.endsWith("-validation-notes.md"))
    .sort()
    .map((name) => {
      const file = path.join(notesDir, name);
      const rows = parseGateOutcomeTable(readFileSync(file, "utf8"));
      const present = new Set(rows.map((row) => row.gate));
      return {
        file: name,
        hasOutcomeTable: rows.length > 0,
        rows,
        missingGates: ACCEPTANCE_GATES.filter((gate) => !present.has(gate)),
      };
    });
}

export function summarizeNoteInventory(notes: readonly NoteInventory[]): {
  notes: number;
  withTenCanonicalRows: number;
  missingTable: number;
  nineGate: number;
  outcomeKindCounts: Record<GateOutcomeKind, number>;
  noncanonicalSourceCounts: Record<string, number>;
  allTenComplete: number;
} {
  const outcomeKindCounts: Record<GateOutcomeKind, number> = {
    complete: 0,
    partial: 0,
    "not-started": 0,
    unnormalized: 0,
    missing: 0,
  };

  let withTenCanonicalRows = 0;
  let missingTable = 0;
  let nineGate = 0;
  let allTenComplete = 0;
  const noncanonicalSourceCounts: Record<string, number> = {};

  for (const note of notes) {
    if (!note.hasOutcomeTable) {
      missingTable += 1;
    } else if (note.rows.length === 10 && note.missingGates.length === 0) {
      withTenCanonicalRows += 1;
      if (note.rows.every((row) => row.outcome.kind === "complete")) {
        allTenComplete += 1;
      }
    } else if (note.rows.length === 9) {
      nineGate += 1;
    }

    for (const row of note.rows) {
      outcomeKindCounts[row.outcome.kind] += 1;
      if (row.outcome.kind === "unnormalized") {
        noncanonicalSourceCounts[row.outcome.raw] =
          (noncanonicalSourceCounts[row.outcome.raw] ?? 0) + 1;
      }
    }
  }

  return {
    notes: notes.length,
    withTenCanonicalRows,
    missingTable,
    nineGate,
    outcomeKindCounts,
    noncanonicalSourceCounts,
    allTenComplete,
  };
}

export function isCompleteAcceptanceNote(note: NoteInventory | undefined): boolean {
  return (
    note != null &&
    note.rows.length === ACCEPTANCE_GATES.length &&
    note.missingGates.length === 0 &&
    note.rows.every((row) => row.outcome.kind === "complete")
  );
}

export function isCurrentVisualState(state: VisualStateTarget): boolean {
  return (
    (state.react === "visual" || state.react === "asserted") &&
    (state.solid === "visual" || state.solid === "asserted") &&
    state.pairDiff !== "planned" &&
    state.pairDiff !== "blocked"
  );
}

export function collectVisualStatePointers(): {
  slug: string;
  stateId: string;
  pointers: readonly LegacyEvidencePointer[];
}[] {
  return officialVisualStateCoverage.flatMap((entry) =>
    entry.states
      .filter(
        (state) =>
          (state.evidence != null && state.evidence.length > 0) ||
          (state.spec != null && state.spec.length > 0),
      )
      .map((state) => ({
        slug: entry.slug,
        stateId: state.id,
        pointers: state.evidence ?? evidencePointersFromSpec(state.spec),
      })),
  );
}

export function inventoryVisualStateEvidence(roots: {
  comparisonRoot: string;
  repoRoot: string;
}): VisualStateEvidenceRecord[] {
  return officialVisualStateCoverage.flatMap((entry) =>
    entry.states.filter(isCurrentVisualState).map((state) => {
      if (state.evidence != null && state.evidence.length > 0) {
        const invalidPointers = state.evidence.filter(
          (pointer) => resolveRunnableEvidencePointer(pointer, roots) == null,
        );
        return {
          slug: entry.slug,
          stateId: state.id,
          status: invalidPointers.length === 0 ? "resolved" : "invalid",
          pointers: state.evidence,
          invalidPointers,
        };
      }

      return {
        slug: entry.slug,
        stateId: state.id,
        status: state.spec != null && state.spec.length > 0 ? "legacy" : "missing",
        pointers: [],
        invalidPointers: [],
      };
    }),
  );
}

export function summarizeVisualStateEvidence(
  records: readonly VisualStateEvidenceRecord[],
): Record<VisualStateEvidenceStatus, number> {
  const summary: Record<VisualStateEvidenceStatus, number> = {
    resolved: 0,
    legacy: 0,
    missing: 0,
    invalid: 0,
  };

  for (const record of records) {
    summary[record.status] += 1;
  }

  return summary;
}

export function unresolvedVisualStatePointers(roots: {
  comparisonRoot: string;
  repoRoot: string;
}): { slug: string; stateId: string; file: string }[] {
  const missing: { slug: string; stateId: string; file: string }[] = [];

  for (const entry of collectVisualStatePointers()) {
    for (const pointer of entry.pointers) {
      if (resolveEvidenceFile(pointer.file, roots) == null) {
        missing.push({ slug: entry.slug, stateId: entry.stateId, file: pointer.file });
      }
    }
  }

  return missing;
}

function extractKnownDivergenceKeys(source: string): { caseId: string; reason: string }[] {
  const block = /knownDivergences:\s*\{([\s\S]*?)\n\s*\}/.exec(source);
  if (block == null) {
    return [];
  }

  const entries: { caseId: string; reason: string }[] = [];
  const keyRe = /(?:^|\n)\s*(?:\/\/[^\n]*\n\s*)*(["']?)([A-Za-z0-9_ ·-]+)\1\s*:/g;
  let match: RegExpExecArray | null;
  while ((match = keyRe.exec(block[1])) != null) {
    const caseId = match[2].trim();
    if (caseId === "knownDivergences") {
      continue;
    }
    const after = block[1].slice(match.index + match[0].length);
    const reasonMatch = /"((?:\\.|[^"\\])*)"/.exec(after);
    const reason = reasonMatch ? reasonMatch[1].replace(/\\n/g, " ").replace(/\s+/g, " ") : "";
    entries.push({ caseId, reason });
  }

  return entries;
}

export function inventoryCertifiedObligations(certifiedDir: string): {
  expectedFixmes: CertifiedFixme[];
  deferredComments: DeferredComment[];
} {
  const expectedFixmes: CertifiedFixme[] = [];
  const deferredComments: DeferredComment[] = [];

  for (const name of readdirSync(certifiedDir).sort()) {
    if (!name.endsWith(".certified.spec.ts")) {
      continue;
    }

    const spec = path.join(certifiedDir, name);
    const source = readFileSync(spec, "utf8");
    for (const entry of extractKnownDivergenceKeys(source)) {
      expectedFixmes.push({ spec: name, caseId: entry.caseId, reason: entry.reason });
    }

    const lines = source.split("\n");
    for (let i = 0; i < lines.length; i += 1) {
      const line = lines[i];
      if (!/\bdeferred\b/i.test(line)) {
        continue;
      }
      if (!/^\s*(\/\/|\*)/.test(line) && !line.includes("/*")) {
        continue;
      }
      deferredComments.push({
        spec: name,
        line: i + 1,
        text: line.replace(/^\s*(?:\/\/|\*)\s?/, "").trim(),
      });
    }
  }

  return { expectedFixmes, deferredComments };
}
