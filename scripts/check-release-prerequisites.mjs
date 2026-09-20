#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";

import { pendingChangesetPackages, releasablePackages } from "./release-candidates.mjs";

const root = process.cwd();
const configPath = path.join(root, "scripts", "release-prerequisites.json");

function fail(message) {
  console.error(`release prerequisites — FAIL: ${message}`);
  process.exitCode = 1;
}

function readJson(file, description) {
  try {
    return JSON.parse(readFileSync(file, "utf8"));
  } catch (error) {
    fail(`${description} is unreadable or invalid JSON (${file}): ${error.message}`);
    return null;
  }
}

const config = readJson(configPath, "release prerequisite configuration");

if (!config) {
  process.exit();
}

if (!Array.isArray(config.packages)) {
  fail(`${configPath} must contain a packages array`);
  process.exit();
}

const candidates = releasablePackages(root);
const pending = pendingChangesetPackages(root);
const listed = new Set(config.packages.map((entry) => entry?.name));

// The guard's subjects come from the tree, never from the list: a candidate the
// list forgets is exactly the release nobody checked.
for (const candidate of candidates) {
  if (listed.has(candidate.name)) continue;
  // A workspace version of 0.0.0 has never been published; the entry loop skips it too.
  if (candidate.version === "0.0.0") continue;
  fail(
    `${candidate.name}@${candidate.version} is a publish candidate with no entry in ` +
      `scripts/release-prerequisites.json — record its prerequisites and the evidence for each.`,
  );
}

for (const entry of config.packages) {
  if (
    !entry ||
    typeof entry.name !== "string" ||
    typeof entry.manifest !== "string" ||
    !Array.isArray(entry.prerequisites)
  ) {
    fail("every package entry must define name, manifest, and prerequisites");
    continue;
  }

  const manifestPath = path.join(root, entry.manifest);
  const manifest = readJson(manifestPath, `${entry.name} manifest`);
  if (!manifest) continue;

  if (manifest.name !== entry.name) {
    fail(`${entry.manifest} declares ${manifest.name ?? "no name"}, expected ${entry.name}`);
    continue;
  }

  if (manifest.version === "0.0.0") {
    if (pending.has(entry.name) && candidates.some((pkg) => pkg.name === entry.name)) {
      fail(
        `${entry.name}@0.0.0 is not a publish candidate, but pending changesets name it. ` +
          "Versioning would bump it off 0.0.0 and publish a fake first release. " +
          "Remove it from those changesets, or add it to .changeset/config.json ignore " +
          "until the workspace version is a real release.",
      );
      continue;
    }
    console.log(`SKIP: ${entry.name}@0.0.0 is not a publish candidate.`);
    continue;
  }

  if (typeof manifest.version !== "string" || manifest.version.length === 0) {
    fail(`${entry.name} has no valid version`);
    continue;
  }

  if (entry.prerequisites.length === 0) {
    fail(`${entry.name}@${manifest.version} has an empty prerequisite set`);
    continue;
  }

  for (const prerequisite of entry.prerequisites) {
    const id = prerequisite?.id ?? "unnamed-prerequisite";
    const hasEvidence =
      typeof prerequisite?.evidence === "string" && prerequisite.evidence.trim().length > 0;
    if (prerequisite?.satisfied !== true || !hasEvidence) {
      fail(
        `${entry.name}@${manifest.version} requires ${id}; set satisfied=true and record ` +
          "independently verifiable evidence before release",
      );
    }
  }
}

if (!process.exitCode) {
  console.log("release prerequisites — PASS");
}
