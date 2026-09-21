/**
 * Holds every waiver's recorded `ticketStatus` to the board (#574).
 *
 * The certified verdict waives on the state recorded in
 * `e2e/certified-waivers.json`, never on `.claude/tickets/**`. That is the
 * point: the board is outside `certifiedSuiteCoveredPathspecs`, so a merger
 * that resolved the state from a ticket file could change its exit code with
 * one commit editing `status:` while the postcard's covered-path diff listed
 * nothing, and `comparison parity (strict)` printed the run as current.
 *
 * The check that field still needs is this one, and it runs outside the
 * certified job, where reading the board decides nothing the postcard speaks
 * for. A recorded state the board has moved past fails here.
 *
 * Usage: tsx scripts/check-certified-waiver-tickets.ts
 */

import {
  comparisonRootFrom,
  defaultWaiversPath,
  loadCertifiedWaivers,
  readTicketStatus,
  reconcileWaiverTickets,
  repoRootFromComparison,
} from "./certified-waivers";

const comparisonRoot = comparisonRootFrom(import.meta.url);
const repoRoot = repoRootFromComparison(comparisonRoot);
const waiversPath = defaultWaiversPath(comparisonRoot);
const loaded = loadCertifiedWaivers(waiversPath);

const problems = [
  ...loaded.problems,
  ...reconcileWaiverTickets({
    waivers: loaded.waivers,
    ticketStatus: (ticketId) => readTicketStatus(repoRoot, ticketId).status,
  }),
];

if (problems.length > 0) {
  console.error(
    `Certified waivers disagree with the board:\n${problems
      .map((problem) => `- ${problem.kind}: ${problem.detail}`)
      .join("\n")}`,
  );
  process.exit(1);
}

console.log(
  `[certified-waiver-tickets] ${loaded.waivers.length} waiver(s) in ${waiversPath} agree with the board`,
);
