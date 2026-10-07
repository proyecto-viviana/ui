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

/**
 * Every `test.fixme` site a certified spec registers, in both shapes the
 * drivers read.
 *
 * `knownDivergences: { "<case id>": "<reason>" }` marks one case; a driver
 * config carries at most one such block, but a spec configures several drivers,
 * so a spec carries several blocks. `knownDivergence: "<reason>"` on a motion
 * or announcement trigger marks that trigger for every case the driver runs.
 * Reading only the first block of the first shape — which is what this did —
 * left a spec free to add fixme sites the skipped-count gate never saw.
 */
export function extractCertifiedFixmeSites(source: string): { caseId: string; reason: string }[] {
  const entries: { caseId: string; reason: string }[] = [];

  const blockRe = /knownDivergences:\s*\{([\s\S]*?)\n\s*\}/g;
  let block: RegExpExecArray | null;
  while ((block = blockRe.exec(source)) != null) {
    const body = block[1];
    const keyRe = /(?:^|\n)\s*(?:\/\/[^\n]*\n\s*)*(["']?)([A-Za-z0-9_ ·-]+)\1\s*:/g;
    let match: RegExpExecArray | null;
    while ((match = keyRe.exec(body)) != null) {
      const caseId = match[2].trim();
      if (caseId === "knownDivergences") {
        continue;
      }
      const after = body.slice(match.index + match[0].length);
      entries.push({ caseId, reason: firstStringLiteral(after) });
    }
  }

  const triggerRe = /knownDivergence:\s*/g;
  let trigger: RegExpExecArray | null;
  while ((trigger = triggerRe.exec(source)) != null) {
    const reason = firstStringLiteral(source.slice(trigger.index + trigger[0].length));
    entries.push({ caseId: enclosingTriggerId(source, trigger.index), reason });
  }

  return entries;
}

function firstStringLiteral(after: string): string {
  const match = /"((?:\\.|[^"\\])*)"/.exec(after);
  return match ? match[1].replace(/\\n/g, " ").replace(/\s+/g, " ") : "";
}

/** A trigger declares its `id` beside `knownDivergence`; the nearest one above it names the site. */
function enclosingTriggerId(source: string, at: number): string {
  const before = source.slice(0, at);
  const ids = [...before.matchAll(/\bid:\s*["']([^"']+)["']/g)];
  const last = ids.at(-1);
  return last ? `· ${last[1]}` : "· trigger";
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
    for (const entry of extractCertifiedFixmeSites(source)) {
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

export interface UnmatchedDriverFixme {
  file: string;
  line: number;
  call: string;
}

/**
 * A driver `test.fixme` is already in the skipped inventory when its reason is
 * the binding a certified spec registers: `divergence` assigned from
 * `knownDivergences`, or a `knownDivergence` property. Any other call skips a
 * case `report:parity --strict` would not otherwise see.
 */
export function extractUnmatchedDriverFixmes(source: string): { line: number; call: string }[] {
  const unmatched: { line: number; call: string }[] = [];
  for (const call of scanDriverFixmeCalls(source)) {
    if (driverFixmeReasonMatchesInventory(call.reason, source.slice(0, call.index))) {
      continue;
    }
    unmatched.push({ line: lineNumberAt(source, call.index), call: call.text });
  }
  return unmatched;
}

export function inventoryUnmatchedDriverFixmes(driversDir: string): UnmatchedDriverFixme[] {
  const unmatched: UnmatchedDriverFixme[] = [];
  for (const name of readdirSync(driversDir).sort()) {
    if (!name.endsWith(".ts") || name.endsWith(".d.ts")) {
      continue;
    }
    const source = readFileSync(path.join(driversDir, name), "utf8");
    for (const site of extractUnmatchedDriverFixmes(source)) {
      unmatched.push({ file: name, line: site.line, call: site.call });
    }
  }
  return unmatched;
}

function lineNumberAt(source: string, index: number): number {
  return source.slice(0, index).split("\n").length;
}

function driverFixmeReasonMatchesInventory(reason: string | null, before: string): boolean {
  if (reason == null) {
    return false;
  }
  const compact = reason
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/[^\n]*/g, "")
    .replace(/\s+/g, "");
  if (/^(?:[A-Za-z_$][\w$]*\.)+knownDivergence$/.test(compact)) {
    return true;
  }
  if (compact !== "divergence") {
    return false;
  }
  const assigns = [...before.matchAll(/\bdivergence\s*=\s*([^;\n]+)/g)];
  const last = assigns.at(-1);
  return last != null && last[1].includes("knownDivergences");
}

interface ScannedDriverFixme {
  index: number;
  reason: string | null;
  text: string;
}

function scanDriverFixmeCalls(source: string): ScannedDriverFixme[] {
  const found: ScannedDriverFixme[] = [];
  let state: "code" | "line" | "block" | "sq" | "dq" | "tpl" = "code";
  for (let i = 0; i < source.length; i += 1) {
    const next = source[i + 1];
    if (state === "line") {
      if (source[i] === "\n") state = "code";
      continue;
    }
    if (state === "block") {
      if (source[i] === "*" && next === "/") {
        state = "code";
        i += 1;
      }
      continue;
    }
    if (state === "sq" || state === "dq" || state === "tpl") {
      const quote = state === "sq" ? "'" : state === "dq" ? '"' : "`";
      if (source[i] === "\\") {
        i += 1;
        continue;
      }
      if (source[i] === quote) state = "code";
      continue;
    }
    if (source[i] === "/" && next === "/") {
      state = "line";
      i += 1;
      continue;
    }
    if (source[i] === "/" && next === "*") {
      state = "block";
      i += 1;
      continue;
    }
    if (source[i] === "'") {
      state = "sq";
      continue;
    }
    if (source[i] === '"') {
      state = "dq";
      continue;
    }
    if (source[i] === "`") {
      state = "tpl";
      continue;
    }
    if (!isDriverFixmeCallStart(source, i)) {
      continue;
    }
    let open = i + "test.fixme".length;
    while (open < source.length && /\s/.test(source[open])) open += 1;
    if (source[open] !== "(") {
      continue;
    }
    const end = endOfCall(source, open);
    if (end == null) {
      continue;
    }
    const args = splitTopLevelArgs(source.slice(open + 1, end));
    found.push({
      index: i,
      reason: driverFixmeDescription(args),
      text: source.slice(i, end + 1).replace(/\s+/g, " "),
    });
    i = end;
  }
  return found;
}

function isDriverFixmeCallStart(source: string, index: number): boolean {
  if (!source.startsWith("test.fixme", index)) {
    return false;
  }
  if (index === 0) {
    return true;
  }
  return !/[A-Za-z0-9_$.]/.test(source[index - 1]);
}

function endOfCall(source: string, openParen: number): number | null {
  let depth = 0;
  let state: "code" | "line" | "block" | "sq" | "dq" | "tpl" = "code";
  for (let i = openParen; i < source.length; i += 1) {
    const next = source[i + 1];
    if (state === "line") {
      if (source[i] === "\n") state = "code";
      continue;
    }
    if (state === "block") {
      if (source[i] === "*" && next === "/") {
        state = "code";
        i += 1;
      }
      continue;
    }
    if (state === "sq" || state === "dq" || state === "tpl") {
      const quote = state === "sq" ? "'" : state === "dq" ? '"' : "`";
      if (source[i] === "\\") {
        i += 1;
        continue;
      }
      if (source[i] === quote) state = "code";
      continue;
    }
    if (source[i] === "/" && next === "/") {
      state = "line";
      i += 1;
      continue;
    }
    if (source[i] === "/" && next === "*") {
      state = "block";
      i += 1;
      continue;
    }
    if (source[i] === "'") {
      state = "sq";
      continue;
    }
    if (source[i] === '"') {
      state = "dq";
      continue;
    }
    if (source[i] === "`") {
      state = "tpl";
      continue;
    }
    if (source[i] === "(") depth += 1;
    else if (source[i] === ")") {
      depth -= 1;
      if (depth === 0) return i;
    }
  }
  return null;
}

function splitTopLevelArgs(args: string): string[] {
  const parts: string[] = [];
  let start = 0;
  let depth = 0;
  let state: "code" | "sq" | "dq" | "tpl" = "code";
  for (let i = 0; i < args.length; i += 1) {
    if (state === "sq" || state === "dq" || state === "tpl") {
      const quote = state === "sq" ? "'" : state === "dq" ? '"' : "`";
      if (args[i] === "\\") {
        i += 1;
        continue;
      }
      if (args[i] === quote) state = "code";
      continue;
    }
    if (args[i] === "'") {
      state = "sq";
      continue;
    }
    if (args[i] === '"') {
      state = "dq";
      continue;
    }
    if (args[i] === "`") {
      state = "tpl";
      continue;
    }
    if (args[i] === "(" || args[i] === "[" || args[i] === "{") depth += 1;
    else if (args[i] === ")" || args[i] === "]" || args[i] === "}") depth -= 1;
    else if (args[i] === "," && depth === 0) {
      parts.push(args.slice(start, i));
      start = i + 1;
    }
  }
  parts.push(args.slice(start));
  return parts;
}

function driverFixmeDescription(args: string[]): string | null {
  const cleaned = args.map((arg) => arg.trim()).filter((arg) => arg.length > 0);
  if (cleaned.length === 0) {
    return null;
  }
  if (cleaned.length === 1 && (cleaned[0] === "true" || cleaned[0] === "false")) {
    return null;
  }
  return cleaned[cleaned.length - 1];
}
