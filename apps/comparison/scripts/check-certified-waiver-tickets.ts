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
 * Usage: tsx scripts/check-certified-waiver-tickets.ts [--waivers <path>]
 *
 * `--waivers` exists so the reconciliation can be driven end to end against a
 * list this repository would refuse to track. The tracked file held `[]` until
 * #578 carried three behaviour-class certified reds as waivers, and every CI
 * run of this guard reached no branch of `reconcileWaiverTickets` while it did;
 * now it reconciles #583, #584 and #609 against the board. The refusals still
 * need a fixture, so `certified-waivers.test.ts` runs this script over one
 * holding a stale and an off-board ticket. CI passes no `--waivers` and
 * `test-ci-guard-contracts.mjs` holds the package script to that.
 */

import { resolve } from "node:path";

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

function waiversPathFromArgv(argv: readonly string[]): string {
  let selected = defaultWaiversPath(comparisonRoot);
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index] as string;
    if (argument.startsWith("--waivers=")) {
      selected = resolve(argument.slice("--waivers=".length));
      continue;
    }
    if (argument === "--waivers") {
      const value = argv[index + 1];
      if (value == null) {
        console.error("--waivers needs a path");
        process.exit(2);
      }
      selected = resolve(value);
      index += 1;
      continue;
    }
    console.error(`unknown argument: ${argument}`);
    process.exit(2);
  }
  return selected;
}

const waiversPath = waiversPathFromArgv(process.argv.slice(2));
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
