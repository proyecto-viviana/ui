/**
 * Tracked react-aria-components export presence against solidaria-components.
 *
 * Name-presence only (Rule #1): a listed symbol is "export present" or
 * "export missing". This is not behavior, ARIA, or visual parity.
 *
 * Sibling re-exports (`export { … } from 'react-aria/…'` / `'react-stately/…'`)
 * count as RAC value exports. Completeness of those names is scored by
 * guard:rac-export-gap (including the ticketed-pending list).
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  RAC_INDEX,
  SOLIDARIA_INDEX,
  parseNamedValueExports,
  parseSiblingReexports,
} from "./rac-export-presence";

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
  "TreeHeader",
  "TreeSection",
] as const;

function formatPresence(values: string[], present: boolean): string {
  if (values.length === 0) return "  - (none)";
  const label = present ? "export present" : "export missing";
  return values.map((value) => `  - ${value}  (${label})`).join("\n");
}

function isExecutedDirectly(): boolean {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return path.resolve(entry) === path.resolve(new URL(import.meta.url).pathname);
  } catch {
    return false;
  }
}

async function main(): Promise<void> {
  const [racSource, solidariaSource] = await Promise.all([
    readFile(RAC_INDEX, "utf8"),
    readFile(SOLIDARIA_INDEX, "utf8"),
  ]);

  const racExports = parseNamedValueExports(racSource);
  const siblingExports = parseSiblingReexports(racSource);
  const solidariaExports = parseNamedValueExports(solidariaSource);

  const missingInRac = REQUIRED_SYMBOLS.filter((symbol) => !racExports.has(symbol));
  const missingRequiredInSolidaria = REQUIRED_SYMBOLS.filter(
    (symbol) => !solidariaExports.has(symbol),
  );
  const presentInSolidaria = REQUIRED_SYMBOLS.filter((symbol) => solidariaExports.has(symbol));
  const siblingMissing = [...siblingExports].filter((name) => !solidariaExports.has(name)).sort();
  const siblingPresent = [...siblingExports].filter((name) => solidariaExports.has(name)).sort();

  console.log("RAC tracked-export presence check (name match, not behavior)");
  console.log(`- RAC index: ${RAC_INDEX}`);
  console.log(`- solidaria index: ${SOLIDARIA_INDEX}`);
  console.log("");
  console.log("Tracked symbols in solidaria-components:");
  console.log(formatPresence(presentInSolidaria, true));
  console.log("");
  console.log("Tracked symbols export missing in solidaria-components:");
  console.log(formatPresence(missingRequiredInSolidaria, false));
  console.log("");
  console.log(
    `RAC sibling re-exports (react-aria / react-stately): ${siblingExports.size}  |  export present: ${siblingPresent.length}  |  export missing: ${siblingMissing.length}`,
  );
  console.log("Sibling re-exports export missing (see guard:rac-export-gap + pending file):");
  console.log(
    siblingMissing.length
      ? siblingMissing.map((name) => `  - ${name}  (export missing)`).join("\n")
      : "  - (none)",
  );

  if (missingInRac.length > 0) {
    console.log("");
    console.log("Warning: tracked symbols export missing in RAC index (check tracker list):");
    console.log(formatPresence(missingInRac, false));
  }

  if (missingRequiredInSolidaria.length > 0) {
    process.exit(1);
  }

  console.log("\nPASS: every tracked symbol is export present on solidaria-components.");
}

if (isExecutedDirectly()) {
  await main();
}
