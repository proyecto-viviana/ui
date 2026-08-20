#!/usr/bin/env node

import { readFileSync } from "node:fs";
import path from "node:path";

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
