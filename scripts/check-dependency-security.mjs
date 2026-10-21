#!/usr/bin/env node

/** Peers and both audits run every time; only exact, reviewed exceptions may pass. */
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { checkPeers } from "./check-peers.mjs";

const EXCEPTIONS_PATH = join(
  dirname(fileURLToPath(import.meta.url)),
  "dependency-security-exceptions.json",
);
const GHSA = /^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/;
const VERSION = /^\d+\.\d+\.\d+(?:-[\w.-]+)?(?:\+[\w.-]+)?$/;
const LEVELS = ["info", "low", "moderate", "high", "critical"];
const object = (value) => value !== null && typeof value === "object" && !Array.isArray(value);
const text = (value) => typeof value === "string" && value.trim().length > 0;

export function loadExceptions(path = EXCEPTIONS_PATH) {
  const document = JSON.parse(readFileSync(path, "utf8"));
  if (!object(document) || !text(document.review) || !Array.isArray(document.entries)) {
    throw new Error("exceptions must name their review and contain an entries array");
  }
  return document.entries;
}

/** Expiry dates are exclusive: an entry expires at 00:00 UTC on that date. */
export function evaluateAuditReport(report, entries, now = new Date()) {
  const failures = [];
  const accepted = [];
  const validEntries = [];
  const identities = new Set();
  if (!(now instanceof Date) || !Number.isFinite(now.getTime())) {
    return { accepted, failures: ["invalid audit evaluation time"] };
  }
  if (!Array.isArray(entries)) return { accepted, failures: ["exceptions must be an array"] };
  for (const entry of entries) {
    if (
      !object(entry) ||
      !text(entry.advisoryId) ||
      !GHSA.test(entry.advisoryId ?? "") ||
      !text(entry.package) ||
      !text(entry.version) ||
      !VERSION.test(entry.version ?? "") ||
      !text(entry.reach) ||
      !text(entry.reason) ||
      !text(entry.workspace) ||
      !/^\w[\w.-]*(?:\/[\w.-]+)*$/.test(entry.workspace ?? "") ||
      !text(entry.expires) ||
      !/^\d{4}-\d{2}-\d{2}$/.test(entry.expires ?? "")
    ) {
      failures.push(
        "malformed security exception; advisory, package, exact version, reach, workspace, reason and expiry are required",
      );
      continue;
    }
    const expiry = new Date(`${entry.expires}T00:00:00.000Z`);
    if (!Number.isFinite(expiry.getTime()) || expiry.toISOString().slice(0, 10) !== entry.expires) {
      failures.push(`invalid exception expiry: ${entry.advisoryId} ${entry.expires}`);
      continue;
    }
    const identity = [entry.advisoryId, entry.package, entry.version, entry.workspace].join("|");
    if (identities.has(identity)) {
      failures.push(`duplicate security exception: ${identity}`);
      continue;
    }
    identities.add(identity);
    if (now >= expiry) {
      failures.push(
        `expired security exception: ${entry.advisoryId} ${entry.package}@${entry.version} expired ${entry.expires}`,
      );
      continue;
    }
    validEntries.push(entry);
  }
  // Unknown/error responses must never look like a clean or excepted audit.
  if (
    !object(report) ||
    Object.hasOwn(report, "error") ||
    !object(report.advisories) ||
    !object(report.metadata?.vulnerabilities) ||
    Object.keys(report.metadata.vulnerabilities).some((level) => !LEVELS.includes(level)) ||
    LEVELS.some(
      (level) =>
        !Number.isInteger(report.metadata.vulnerabilities[level]) ||
        report.metadata.vulnerabilities[level] < 0,
    )
  )
    return { accepted, failures: [...failures, "invalid or incomplete pnpm audit report"] };
  const advisories = Object.values(report.advisories);
  if (
    LEVELS.some(
      (level) =>
        report.metadata.vulnerabilities[level] >
        advisories.filter((advisory) => advisory?.severity === level).length,
    )
  ) {
    failures.push("audit reports vulnerabilities without complete advisory details");
  }
  for (const advisory of advisories) {
    if (
      !object(advisory) ||
      !text(advisory.github_advisory_id) ||
      !GHSA.test(advisory.github_advisory_id ?? "") ||
      !text(advisory.module_name) ||
      !LEVELS.includes(advisory.severity) ||
      !Array.isArray(advisory.findings) ||
      !advisory.findings.length
    ) {
      failures.push("audit contains an advisory without a valid identity or findings");
      continue;
    }
    for (const finding of advisory.findings) {
      if (
        !object(finding) ||
        !text(finding.version) ||
        !VERSION.test(finding.version ?? "") ||
        !Array.isArray(finding.paths) ||
        !finding.paths.length ||
        finding.paths.some((path) => !text(path))
      ) {
        failures.push(`invalid audit finding: ${advisory.github_advisory_id}`);
        continue;
      }
      const entry = validEntries.find(
        (candidate) =>
          candidate.advisoryId === advisory.github_advisory_id &&
          candidate.package === advisory.module_name &&
          candidate.version === finding.version &&
          finding.paths.every((path) =>
            path.startsWith(`${candidate.workspace.replaceAll("/", "__")}>`),
          ),
      );
      if (entry) accepted.push(entry);
      else
        failures.push(
          `unexcepted ${advisory.severity} advisory: ${advisory.github_advisory_id} ${advisory.module_name}@${finding.version} (${finding.paths.join(", ")})`,
        );
    }
  }
  return { accepted, failures };
}

export function checkAudit(label, args, entries, now = new Date(), execute = spawnSync) {
  // pnpm filters JSON by audit-level, so request every severity before applying policy.
  const commandArgs = ["pm", "audit", "--", "--json", "--audit-level=info", ...args];
  console.log(`\n=== ${label}: vp ${commandArgs.join(" ")}`);
  const result = execute("vp", commandArgs, { encoding: "utf8", maxBuffer: 16 * 1024 * 1024 });
  if (result.error || result.signal || ![0, 1].includes(result.status)) {
    console.error(
      `${label}: audit command failed: ${result.error?.message ?? result.signal ?? result.status}`,
    );
    if (result.stderr) console.error(result.stderr);
    return 1;
  }
  let report;
  try {
    report = JSON.parse(result.stdout);
  } catch {
    console.error(`${label}: audit did not return JSON`);
    if (result.stderr) console.error(result.stderr);
    return 1;
  }
  const { accepted, failures } = evaluateAuditReport(report, entries, now);
  if (result.status !== 0 && object(report?.advisories) && !Object.keys(report.advisories).length) {
    failures.push("audit command failed without advisory findings");
  }
  for (const entry of accepted) {
    console.log(
      `REVIEWED EXCEPTION: ${entry.advisoryId} ${entry.package}@${entry.version}; expires ${entry.expires} (00:00 UTC); reach: ${entry.reach}; reason: ${entry.reason}`,
    );
  }
  for (const failure of failures) console.error(`${label}: ${failure}`);
  if (!failures.length)
    console.log(`${label}: passed; ${accepted.length} reviewed exception(s) applied.`);
  return failures.length ? 1 : 0;
}

export function checkDependencySecurity() {
  const results = [];
  let entries = [];
  try {
    entries = loadExceptions();
  } catch (error) {
    console.error(`security exceptions: ${error.message}`);
    results.push(["exceptions", 1]);
  }
  try {
    results.push(["peers", checkPeers()]);
  } catch (error) {
    console.error(`peers: ${error.message}`);
    results.push(["peers", 1]);
  }
  const now = new Date();
  results.push(["audit (all severities)", checkAudit("audit (all severities)", [], entries, now)]);
  results.push([
    "audit (prod, all severities)",
    checkAudit("audit (prod, all severities)", ["--prod"], entries, now),
  ]);
  const failed = results.filter(([, status]) => status !== 0);
  if (failed.length) {
    console.error(`\nguard:dependency-security failed: ${failed.map(([name]) => name).join(", ")}`);
    return 1;
  }
  console.log(
    "\nguard:dependency-security: peers and both audits passed under the reviewed exception policy.",
  );
  return 0;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  process.exit(checkDependencySecurity());
}
