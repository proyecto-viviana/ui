/**
 * Shared RAC barrel name-presence helpers.
 *
 * These checks prove that a name exists on the solidaria-components barrel.
 * They do not prove behavior, ARIA, or visual parity (Rule #1).
 */

import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export const RAC_INDEX = "react-spectrum/packages/react-aria-components/exports/index.ts";
export const SOLIDARIA_INDEX = "packages/solidaria-components/src/index.ts";
export const PENDING_PATH = "scripts/rac-export-gap-pending.json";

const CLOSED_TICKET_STATUSES = new Set(["verified", "done", "closed", "merged"]);
const OPEN_TICKET_STATUSES = new Set(["open", "next", "in-progress"]);

export interface PendingEntry {
  symbol: string;
  ticket: number;
}

export interface PendingFile {
  description?: string;
  pending: PendingEntry[];
}

export interface ClassifiedGap {
  pending: PendingEntry[];
  unlistedMissing: string[];
  closedStillMissing: Array<{ symbol: string; ticket: number; status: string }>;
  missingTicket: Array<{ symbol: string; ticket: number }>;
  stalePresent: PendingEntry[];
  extra: string[];
}

const EXPORT_FROM = /export(\s+type)?\s*\{([^;]*?)\}\s*from\s*['"]([^'"]+)['"]\s*;?/g;

function isSiblingModule(fromPath: string): boolean {
  return (
    fromPath === "react-aria" ||
    fromPath.startsWith("react-aria/") ||
    fromPath === "react-stately" ||
    fromPath.startsWith("react-stately/")
  );
}

/**
 * Named value exports from `export { … } from '…'` clauses.
 * Type-only statements and `type` specifiers are skipped.
 * `as` aliases use the exported name.
 */
export function parseNamedValueExports(
  source: string,
  options: { from?: "any" | "local" | "sibling" } = {},
): Set<string> {
  const from = options.from ?? "any";
  const symbols = new Set<string>();
  EXPORT_FROM.lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = EXPORT_FROM.exec(source)) !== null) {
    const [, typeKeyword, exportClause, fromPath] = match;
    if (typeKeyword) continue;
    if (from === "local" && !fromPath.startsWith(".")) continue;
    if (from === "sibling" && !isSiblingModule(fromPath)) continue;

    const cleanedClause = exportClause
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

    for (const part of cleanedClause.split(",")) {
      const specifier = part.trim();
      if (!specifier || specifier.startsWith("type ")) continue;
      const bits = specifier.split(/\s+as\s+/i).map((piece) => piece.trim());
      const exportedName = bits.length === 2 ? bits[1] : bits[0];
      if (exportedName) symbols.add(exportedName);
    }
  }

  return symbols;
}

/** RAC barrel value exports re-exported from react-aria / react-stately. */
export function parseSiblingReexports(source: string): Set<string> {
  return parseNamedValueExports(source, { from: "sibling" });
}

export function formatList(values: string[], limit = 50): string {
  if (values.length === 0) return "  - (none)";
  const shown = values
    .slice(0, limit)
    .map((value) => `  - ${value}`)
    .join("\n");
  if (values.length > limit) {
    return `${shown}\n  - ... (${values.length - limit} more)`;
  }
  return shown;
}

export function loadPendingFile(source: string): PendingEntry[] {
  const parsed = JSON.parse(source) as PendingFile;
  if (!Array.isArray(parsed.pending)) {
    throw new Error("rac-export-gap-pending.json must have a pending array");
  }
  return parsed.pending.map((entry) => {
    if (!entry || typeof entry.symbol !== "string" || typeof entry.ticket !== "number") {
      throw new Error("each pending entry must be { symbol: string, ticket: number }");
    }
    return { symbol: entry.symbol, ticket: entry.ticket };
  });
}

/**
 * Read `status:` from `.claude/tickets/tasks/<id>-*.md` frontmatter.
 * Returns null when the ticket file is missing or has no status.
 */
export function readTicketStatus(root: string, ticketId: number): string | null {
  const dir = path.join(root, ".claude", "tickets", "tasks");
  let files: string[];
  try {
    files = readdirSync(dir).filter(
      (name) => name.startsWith(`${ticketId}-`) && name.endsWith(".md"),
    );
  } catch {
    return null;
  }
  if (files.length === 0) return null;
  const text = readFileSync(path.join(dir, files[0]), "utf8");
  const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/.exec(text)?.[1];
  if (!frontmatter) return null;
  const status = /^status:\s*["']?([A-Za-z0-9_-]+)/m.exec(frontmatter)?.[1];
  return status ?? null;
}

export function isOpenTicketStatus(status: string | null): boolean {
  return status != null && OPEN_TICKET_STATUSES.has(status);
}

export function isClosedTicketStatus(status: string | null): boolean {
  return status != null && CLOSED_TICKET_STATUSES.has(status);
}

export function classifyExportGap(input: {
  racExports: Iterable<string>;
  solidariaExports: Iterable<string>;
  pending: PendingEntry[];
  ticketStatus: (ticketId: number) => string | null;
}): ClassifiedGap {
  const rac = new Set(input.racExports);
  const solidaria = new Set(input.solidariaExports);
  const pendingBySymbol = new Map<string, PendingEntry>();
  for (const entry of input.pending) pendingBySymbol.set(entry.symbol, entry);

  const missing = [...rac].filter((name) => !solidaria.has(name)).sort();
  const extra = [...solidaria].filter((name) => !rac.has(name)).sort();

  const pending: PendingEntry[] = [];
  const unlistedMissing: string[] = [];
  const closedStillMissing: ClassifiedGap["closedStillMissing"] = [];
  const missingTicket: ClassifiedGap["missingTicket"] = [];

  for (const symbol of missing) {
    const entry = pendingBySymbol.get(symbol);
    if (!entry) {
      unlistedMissing.push(symbol);
      continue;
    }
    const status = input.ticketStatus(entry.ticket);
    if (status == null) {
      missingTicket.push(entry);
      continue;
    }
    if (isClosedTicketStatus(status)) {
      closedStillMissing.push({ ...entry, status });
      continue;
    }
    if (!isOpenTicketStatus(status)) {
      closedStillMissing.push({ ...entry, status });
      continue;
    }
    pending.push(entry);
  }

  const stalePresent: PendingEntry[] = [];
  for (const entry of input.pending) {
    if (solidaria.has(entry.symbol)) stalePresent.push(entry);
  }

  return {
    pending,
    unlistedMissing,
    closedStillMissing,
    missingTicket,
    stalePresent,
    extra,
  };
}

export function gapHasFailures(gap: ClassifiedGap): boolean {
  return (
    gap.unlistedMissing.length > 0 ||
    gap.closedStillMissing.length > 0 ||
    gap.missingTicket.length > 0 ||
    gap.stalePresent.length > 0
  );
}

export function formatPendingTable(entries: PendingEntry[]): string {
  if (entries.length === 0) return "  - (none)";
  return entries
    .slice()
    .sort((a, b) => a.symbol.localeCompare(b.symbol) || a.ticket - b.ticket)
    .map((entry) => `  - ${entry.symbol}  (#${entry.ticket})`)
    .join("\n");
}
