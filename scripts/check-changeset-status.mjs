#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const baseRef = process.env.CHANGESET_BASE_REF || "origin/main";
const changesetDir = ".changeset";
const changesetConfigPath = path.join(changesetDir, "config.json");

function getHeadRef() {
  if (process.env.CHANGESET_HEAD_REF) return process.env.CHANGESET_HEAD_REF;
  if (process.env.GITHUB_HEAD_REF) return process.env.GITHUB_HEAD_REF;
  if (process.env.GITHUB_REF_NAME) return process.env.GITHUB_REF_NAME;

  try {
    return execFileSync("git", ["branch", "--show-current"], { encoding: "utf8" }).trim();
  } catch {
    return "";
  }
}

function ignoredPackages() {
  if (!existsSync(changesetConfigPath)) return new Set();
  const config = JSON.parse(readFileSync(changesetConfigPath, "utf8"));
  return new Set(Array.isArray(config.ignore) ? config.ignore : []);
}

function namedPackages(frontmatter) {
  const named = [];
  for (const line of frontmatter.split("\n")) {
    const match = line.match(
      /^\s*["']?(@[^"':]+\/[^"':]+|[^"':\s]+)["']?\s*:\s*(major|minor|patch)\s*$/,
    );
    if (match) named.push(match[1]);
  }
  return named;
}

/** Changesets v3 rejects a file that names both ignored and releasable packages. */
function mixedChangesets(ignored) {
  if (!existsSync(changesetDir)) return [];
  const mixed = [];
  for (const file of readdirSync(changesetDir)) {
    if (!file.endsWith(".md") || file === "README.md") continue;
    const text = readFileSync(path.join(changesetDir, file), "utf8");
    const frontmatter = text.match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) continue;
    const names = namedPackages(frontmatter[1]);
    const ignoredNames = names.filter((name) => ignored.has(name));
    const releasableNames = names.filter((name) => !ignored.has(name));
    if (ignoredNames.length > 0 && releasableNames.length > 0) {
      mixed.push({ file, ignoredNames, releasableNames });
    }
  }
  return mixed;
}

const headRef = getHeadRef();

if (headRef.startsWith("changeset-release/")) {
  console.log(`Changesets release branch detected (${headRef}). Changeset status not required.`);
  process.exit(0);
}

const ignored = ignoredPackages();
const mixed = mixedChangesets(ignored);
if (mixed.length > 0) {
  console.error(
    "Pending changesets name both ignored and releasable packages. Changesets cannot version this set.\n",
  );
  for (const entry of mixed) {
    console.error(`  ${changesetDir}/${entry.file}`);
    console.error(`    ignored: ${entry.ignoredNames.join(", ")}`);
    console.error(`    releasable: ${entry.releasableNames.join(", ")}`);
  }
  console.error(
    "\nRemove the ignored package from those files (workspace Kumo stays 0.0.0 and is ignored until a real version).",
  );
  process.exit(1);
}

execFileSync("vp", ["exec", "changeset", "status", `--since=${baseRef}`], {
  stdio: "inherit",
});
