/**
 * Full react-aria-components export-gap report.
 *
 * Name-presence only (Rule #1): this gate checks that every RAC barrel value
 * export — local modules and sibling re-exports from react-aria / react-stately —
 * exists on the solidaria-components barrel. It does not prove behavior.
 *
 * Ticketed gaps live in scripts/rac-export-gap-pending.json so a pin move can
 * land before the matching port (#216 pin-first train).
 */

import { readFile } from "node:fs/promises";
import path from "node:path";
import {
  PENDING_PATH,
  RAC_INDEX,
  SOLIDARIA_INDEX,
  classifyExportGap,
  formatList,
  formatPendingTable,
  gapHasFailures,
  loadPendingFile,
  parseNamedValueExports,
  parseSiblingReexports,
  readTicketStatus,
} from "./rac-export-presence";

const ROOT = process.cwd();

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
  const [racSource, solidariaSource, pendingSource] = await Promise.all([
    readFile(RAC_INDEX, "utf8"),
    readFile(SOLIDARIA_INDEX, "utf8"),
    readFile(PENDING_PATH, "utf8"),
  ]);

  const racExports = parseNamedValueExports(racSource);
  const siblingExports = parseSiblingReexports(racSource);
  const solidariaExports = parseNamedValueExports(solidariaSource);
  const pending = loadPendingFile(pendingSource);

  const gap = classifyExportGap({
    racExports,
    solidariaExports,
    pending,
    ticketStatus: (ticketId) => readTicketStatus(ROOT, ticketId),
  });

  console.log("RAC full export-gap guard (barrel name presence)");
  console.log(`- RAC index: ${RAC_INDEX}`);
  console.log(`- solidaria index: ${SOLIDARIA_INDEX}`);
  console.log(`- pending file: ${PENDING_PATH}`);
  console.log("");
  console.log(`RAC named value exports: ${racExports.size}`);
  console.log(`  of which sibling re-exports (react-aria / react-stately): ${siblingExports.size}`);
  console.log(`solidaria-components named value exports: ${solidariaExports.size}`);
  console.log(`export missing (unlisted): ${gap.unlistedMissing.length}`);
  console.log(`export missing (pending, open ticket): ${gap.pending.length}`);
  console.log(`export extra (Solid-only, reported, non-blocking): ${gap.extra.length}`);
  console.log("");
  console.log("Pending (ticketed, open):");
  console.log(formatPendingTable(gap.pending));
  console.log("");
  console.log("export missing (unlisted):");
  console.log(formatList(gap.unlistedMissing));
  console.log("");
  console.log("export extra in solidaria-components:");
  console.log(formatList(gap.extra));

  if (gapHasFailures(gap)) {
    console.error("");
    for (const symbol of gap.unlistedMissing) {
      console.error(
        `FAIL: ${symbol} is export missing from solidaria-components and is not in ${PENDING_PATH}.`,
      );
    }
    for (const entry of gap.closedStillMissing) {
      console.error(
        `FAIL: ${entry.symbol} is listed as pending on #${entry.ticket} (status: ${entry.status}) — ticket closed, export still missing.`,
      );
    }
    for (const entry of gap.missingTicket) {
      console.error(
        `FAIL: ${entry.symbol} is listed as pending on #${entry.ticket} but that ticket file was not found.`,
      );
    }
    for (const entry of gap.stalePresent) {
      console.error(
        `FAIL: ${entry.symbol} is listed as pending on #${entry.ticket} but is now exported — stale pending entry, remove it.`,
      );
    }
    process.exit(1);
  }

  console.log(
    `\nPASS: no unlisted RAC value exports are missing. ${gap.pending.length} ticketed pending export(s).`,
  );
}

if (isExecutedDirectly()) {
  await main();
}
