/**
 * Full react-aria-components export-gap report.
 *
 * This is report-only and intentionally broader than guard:rac-parity.
 * It compares named value exports re-exported from local module files.
 */

import { readFile } from "node:fs/promises";

const RAC_INDEX = "react-spectrum/packages/react-aria-components/exports/index.ts";
const SOLIDARIA_INDEX = "packages/solidaria-components/src/index.ts";

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

    const cleanedClause = exportClause
      .replace(/\/\*[\s\S]*?\*\//g, "")
      .replace(/^\s*\/\/.*$/gm, "");

    const specifiers = cleanedClause
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean);

    for (const specifier of specifiers) {
      if (specifier.startsWith("type ")) continue;
      const parts = specifier.split(/\s+as\s+/i).map((part) => part.trim());
      const exportedName = parts.length === 2 ? parts[1] : parts[0];
      if (exportedName) symbols.add(exportedName);
    }
  }

  return symbols;
}

function formatList(values: string[], limit = 50): string {
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

const [racSource, solidariaSource] = await Promise.all([
  readFile(RAC_INDEX, "utf8"),
  readFile(SOLIDARIA_INDEX, "utf8"),
]);

const racExports = parseNamedValueExports(racSource);
const solidariaExports = parseNamedValueExports(solidariaSource);

const missingInSolidaria = [...racExports].filter((name) => !solidariaExports.has(name)).sort();
const extraInSolidaria = [...solidariaExports].filter((name) => !racExports.has(name)).sort();

console.log("RAC full export-gap report (report-only)");
console.log(`- RAC index: ${RAC_INDEX}`);
console.log(`- solidaria index: ${SOLIDARIA_INDEX}`);
console.log("");
console.log(`RAC named exports (local modules only): ${racExports.size}`);
console.log(`solidaria-components named exports: ${solidariaExports.size}`);
console.log(`Missing in solidaria-components: ${missingInSolidaria.length}`);
console.log(`Extra in solidaria-components: ${extraInSolidaria.length}`);
console.log("");
console.log("Missing in solidaria-components:");
console.log(formatList(missingInSolidaria));
console.log("");
console.log("Extra in solidaria-components:");
console.log(formatList(extraInSolidaria));
