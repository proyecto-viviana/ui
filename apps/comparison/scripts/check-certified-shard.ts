/**
 * The exit gate of a `certified shard` job (#589).
 *
 * Playwright's exit code says "some test failed"; it does not know about
 * `e2e/certified-waivers.json`. Since the shard step stopped carrying
 * `continue-on-error`, that raw code is the job's verdict and, through the job,
 * the run's — and `scripts/check-release-evidence.mjs` reads the run
 * conclusion, not the merged report. Without this gate a waived failure would
 * conclude the run `failure` and block publishing, while `certified report`,
 * the job the workflow calls the blocking verdict, printed green.
 *
 * So the shard runs Playwright, keeps its exit code, and exits through
 * `certifiedShardVerdict`: green only when this shard's own summary says every
 * failure it saw is waived, with no load error and no waiver problem. Anything
 * else — including a missing summary — stays red.
 *
 * Usage: tsx scripts/check-certified-shard.ts --exit-code <n> [--shard <n>]
 */

import { appendFileSync } from "node:fs";
import { join } from "node:path";

import {
  certifiedShardVerdict,
  certifiedSummaryPath,
  readCertifiedSummaryFile,
} from "./certified-summary";
import { comparisonRootFrom } from "./certified-waivers";

function flag(name: string): string | null {
  const index = process.argv.indexOf(name);
  if (index < 0) return null;
  return process.argv[index + 1] ?? null;
}

const rawExitCode = flag("--exit-code");
const exitCode = Number(rawExitCode);
if (rawExitCode == null || !Number.isInteger(exitCode)) {
  console.error(
    `[certified-shard] --exit-code <n> is required, got ${rawExitCode ?? "nothing"}; failing rather than guessing`,
  );
  process.exit(1);
}

const rawShard = flag("--shard");
const shardNumber = rawShard == null ? null : Number(rawShard);
if (rawShard != null && !Number.isInteger(shardNumber)) {
  console.error(`[certified-shard] --shard must be a number, got ${rawShard}`);
  process.exit(1);
}

const comparisonRoot = comparisonRootFrom(import.meta.url);
const summaryPath = certifiedSummaryPath(
  join(comparisonRoot, "test-results"),
  shardNumber == null ? null : { current: shardNumber },
);
const verdict = certifiedShardVerdict(readCertifiedSummaryFile(summaryPath), exitCode);

const line = `[certified-shard] ${verdict.red ? "RED" : "GREEN"} (playwright exit ${exitCode}): ${verdict.reason}`;
if (verdict.red) console.error(line);
else console.log(line);

const stepSummary = process.env.GITHUB_STEP_SUMMARY;
if (stepSummary) {
  appendFileSync(stepSummary, `\n${line}\n`);
}

process.exit(verdict.red ? 1 : 0);
