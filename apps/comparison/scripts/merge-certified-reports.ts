import { spawnSync } from "node:child_process";
import {
  appendFileSync,
  copyFileSync,
  existsSync,
  mkdirSync,
  readdirSync,
  writeFileSync,
} from "node:fs";
import { basename, join } from "node:path";

import {
  applyWaiverCounts,
  CERTIFIED_SUMMARY_FILENAME,
  formatCertifiedSummaryMarkdown,
  mergeCertifiedSummaries,
  readCertifiedSummaryFile,
  type CertifiedSummary,
} from "./certified-summary";
import {
  comparisonRootFrom,
  defaultWaiversPath,
  evaluateCertifiedWaivers,
  loadCertifiedWaivers,
  readTicketStatus,
  repoRootFromComparison,
  waiverGateFails,
} from "./certified-waivers";

const comparisonRoot = comparisonRootFrom(import.meta.url);
const repoRoot = repoRootFromComparison(comparisonRoot);
const shardsDir = process.argv[2] ?? join(repoRoot, "certified-shards");
const expectedShards = Number(process.env.CERTIFIED_SHARD_TOTAL ?? "8");

function walkJsonSummaries(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...walkJsonSummaries(path));
      continue;
    }
    if (/^certified-summary(?:\.\d+)?\.json$/.test(entry.name)) {
      found.push(path);
    }
  }
  return found;
}

function walkBlobZips(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const found: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...walkBlobZips(path));
      continue;
    }
    if (entry.name.endsWith(".zip")) found.push(path);
  }
  return found;
}

const summaryPaths = walkJsonSummaries(shardsDir);
if (summaryPaths.length === 0) {
  console.error(`No certified-summary JSON files under ${shardsDir}`);
  process.exit(1);
}

const summaries = summaryPaths.map((path) => {
  const summary = readCertifiedSummaryFile(path);
  if (summary == null) throw new Error(`failed to read ${path}`);
  return summary;
});

if (Number.isFinite(expectedShards) && expectedShards > 0 && summaries.length !== expectedShards) {
  console.error(
    `Expected ${expectedShards} shard summaries, found ${summaries.length}: ${summaryPaths.join(", ")}`,
  );
  process.exit(1);
}

const merged = mergeCertifiedSummaries(summaries);
const loaded = loadCertifiedWaivers(defaultWaiversPath(comparisonRoot));
const evaluation = evaluateCertifiedWaivers({
  waivers: loaded.waivers,
  failures: [
    ...merged.unwaived,
    ...merged.waived.map((entry) => entry.failure),
    ...merged.cells.flatMap((cell) => cell.failures),
  ].filter((failure, index, all) => {
    const key = `${failure.file}\0${failure.title}`;
    return all.findIndex((candidate) => `${candidate.file}\0${candidate.title}` === key) === index;
  }),
  now: new Date(),
  ticketStatus: (ticketId) => readTicketStatus(repoRoot, ticketId).status,
});

const finalSummary: CertifiedSummary = applyWaiverCounts(
  merged,
  evaluation.waived,
  evaluation.unwaived,
  [...loaded.problems, ...evaluation.problems],
);

const outputDir = join(comparisonRoot, "test-results");
mkdirSync(outputDir, { recursive: true });
const jsonPath = join(outputDir, CERTIFIED_SUMMARY_FILENAME);
const markdown = formatCertifiedSummaryMarkdown(finalSummary);
writeFileSync(jsonPath, `${JSON.stringify(finalSummary, null, 2)}\n`);
writeFileSync(join(outputDir, "certified-summary.md"), markdown);

const stepSummary = process.env.GITHUB_STEP_SUMMARY;
if (stepSummary) {
  appendFileSync(stepSummary, `${markdown}\n`);
}

console.log(markdown);

const blobDir = join(comparisonRoot, "blob-reports-merged");
mkdirSync(blobDir, { recursive: true });
for (const zip of walkBlobZips(shardsDir)) {
  copyFileSync(zip, join(blobDir, basename(zip)));
}

if (walkBlobZips(blobDir).length > 0) {
  const mergedReports = spawnSync(
    "pnpm",
    ["exec", "playwright", "merge-reports", blobDir, "--reporter", "html"],
    { cwd: comparisonRoot, stdio: "inherit" },
  );
  if (mergedReports.status !== 0 && mergedReports.status != null) {
    console.error("playwright merge-reports failed");
    process.exit(mergedReports.status);
  }
}

if (waiverGateFails({ ...evaluation, problems: finalSummary.waiverProblems })) {
  process.exit(1);
}
