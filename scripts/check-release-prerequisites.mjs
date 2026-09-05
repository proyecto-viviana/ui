#!/usr/bin/env node

import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const configPath = path.join(root, "scripts", "release-prerequisites.json");
const changesetConfigPath = path.join(root, ".changeset", "config.json");
const changesetDir = path.join(root, ".changeset");

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

function ignoredPackages() {
  if (!existsSync(changesetConfigPath)) return new Set();
  const config = readJson(changesetConfigPath, "Changesets configuration");
  if (!config) return new Set();
  return new Set(Array.isArray(config.ignore) ? config.ignore : []);
}

/** Package names named in the frontmatter of every pending changeset. */
function pendingChangesetPackages() {
  if (!existsSync(changesetDir)) return new Set();

  const named = new Set();
  for (const file of readdirSync(changesetDir)) {
    if (!file.endsWith(".md") || file === "README.md") continue;
    const frontmatter = readFileSync(path.join(changesetDir, file), "utf8").match(
      /^---\r?\n([\s\S]*?)\r?\n---/,
    );
    if (!frontmatter) continue;
    for (const line of frontmatter[1].split("\n")) {
      const named_ = line.match(
        /^\s*["']?(@[^"':]+\/[^"':]+|[^"':\s]+)["']?\s*:\s*(major|minor|patch)\s*$/,
      );
      if (named_) named.add(named_[1]);
    }
  }
  return named;
}

const config = readJson(configPath, "release prerequisite configuration");

if (!config) {
  process.exit();
}

if (!Array.isArray(config.packages)) {
  fail(`${configPath} must contain a packages array`);
  process.exit();
}

const ignored = ignoredPackages();
const pending = pendingChangesetPackages();

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
    if (pending.has(entry.name) && !ignored.has(entry.name)) {
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
