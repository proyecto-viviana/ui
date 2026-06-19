/**
 * Checks parity of selected react-aria-components exports against
 * solidaria-components exports.
 *
 * Scope is intentionally narrow to the explicitly tracked backlog symbols.
 */

import { readFile } from "node:fs/promises";

const RAC_INDEX = "react-spectrum/packages/react-aria-components/exports/index.ts";
const SOLIDARIA_INDEX = "packages/solidaria-components/src/index.ts";

const REQUIRED_SYMBOLS = [
  "Section",
  "ListBoxSection",
  "GridListSection",
  "MenuSection",
  "Header",
  "Group",
  "CollectionRendererContext",
  "ToggleButton",
  "Keyboard",
  "Form",
  "FieldError",
  "ToggleButtonGroup",
  "FileTrigger",
  "DropZone",
  "SharedElementTransition",
  "Virtualizer",
] as const;

// solidaria-only additions not exported by upstream RAC — tracked here
// to preserve visibility without generating misleading parity warnings.
const BACKLOG_SYMBOLS = ["TreeHeader", "TreeSection"] as const;

const TRACKED_SYMBOLS = [...REQUIRED_SYMBOLS, ...BACKLOG_SYMBOLS] as const;

function parseNamedValueExports(source: string): Set<string> {
  const symbols = new Set<string>();
  // Keep matching within one export statement to avoid crossing a prior `export {X};`.
  const exportRegex = /export\s*\{([^;]*?)\}\s*from\s*['"]([^'"]+)['"]\s*;?/g;
  let match: RegExpExecArray | null;

  while ((match = exportRegex.exec(source)) !== null) {
    const [, exportClause, fromPath] = match;
    // Accept both "./" and "../" so the barrel's `../src/<module>` re-exports
    // count as local module files; external siblings (react-aria/…,
    // react-stately/…, @react-types/…) start without a dot and stay excluded.
    if (!fromPath.startsWith(".")) continue;
    if (match[0].startsWith("export type")) continue;

    const specifiers = exportClause
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    for (const spec of specifiers) {
      const parts = spec.split(/\s+as\s+/i).map((part) => part.trim());
      const exportedName = parts.length === 2 ? parts[1] : parts[0];
      if (exportedName) symbols.add(exportedName);
    }
  }

  return symbols;
}

function formatList(values: string[]): string {
  return values.length ? values.map((value) => `  - ${value}`).join("\n") : "  - (none)";
}

const [racSource, solidariaSource] = await Promise.all([
  readFile(RAC_INDEX, "utf8"),
  readFile(SOLIDARIA_INDEX, "utf8"),
]);

const racExports = parseNamedValueExports(racSource);
const solidariaExports = parseNamedValueExports(solidariaSource);

const missingInRac = TRACKED_SYMBOLS.filter((symbol) => !racExports.has(symbol));
const missingRequiredInSolidaria = REQUIRED_SYMBOLS.filter(
  (symbol) => !solidariaExports.has(symbol),
);
const missingBacklogInSolidaria = BACKLOG_SYMBOLS.filter((symbol) => !solidariaExports.has(symbol));
const presentInSolidaria = TRACKED_SYMBOLS.filter((symbol) => solidariaExports.has(symbol));

console.log("RAC parity check (tracked symbols)");
console.log(`- RAC index: ${RAC_INDEX}`);
console.log(`- solidaria index: ${SOLIDARIA_INDEX}`);
console.log("");
console.log("Present in solidaria-components:");
console.log(formatList(presentInSolidaria));
console.log("");
console.log("Missing required symbols in solidaria-components:");
console.log(formatList(missingRequiredInSolidaria));
console.log("");
console.log("Backlog symbols still missing in solidaria-components:");
console.log(formatList(missingBacklogInSolidaria));

if (missingInRac.length > 0) {
  console.log("");
  console.log("Warning: tracked symbols missing in RAC index (check tracker list):");
  console.log(formatList(missingInRac));
}

if (missingRequiredInSolidaria.length > 0) {
  process.exit(1);
}
