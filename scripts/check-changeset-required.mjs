#!/usr/bin/env node

import { execFileSync } from "node:child_process";
import { readFileSync, readdirSync, existsSync } from "node:fs";

const baseRef = process.env.CHANGESET_BASE_REF || "origin/main";

// Path prefix -> published package name. The name matters: a changeset only
// releases the packages it names, so "some changeset exists" is not enough —
// a commit touching two packages while carrying a changeset for one of them
// leaves the other stranded at its published version with newer source. See
// check-publish-drift.mjs, which catches that once it has already landed.
const releasablePackages = [
  { path: "packages/solid-stately/", name: "@proyecto-viviana/solid-stately" },
  { path: "packages/solidaria/", name: "@proyecto-viviana/solidaria" },
  { path: "packages/solidaria-components/", name: "@proyecto-viviana/solidaria-components" },
  { path: "packages/solid-spectrum/", name: "@proyecto-viviana/solid-spectrum" },
  { path: "packages/viviana-ui/", name: "@proyecto-viviana/ui" },
];

/** Package names named in the frontmatter of every changeset in the working tree. */
function changesetPackages() {
  if (!existsSync(".changeset")) return new Set();

  const named = new Set();
  for (const file of readdirSync(".changeset")) {
    if (!file.endsWith(".md") || file === "README.md") continue;
    const frontmatter = readFileSync(`.changeset/${file}`, "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) continue;
    for (const line of frontmatter[1].split("\n")) {
      const match = line.match(/^\s*["']?(@[^"':]+\/[^"':]+|[^"':\s]+)["']?\s*:\s*(major|minor|patch)\s*$/);
      if (match) named.add(match[1]);
    }
  }
  return named;
}

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

function getChangedFiles() {
  const output = execFileSync("git", ["diff", "--name-only", `${baseRef}...HEAD`], {
    encoding: "utf8",
  });

  return output
    .split("\n")
    .map((file) => file.trim())
    .filter(Boolean);
}

let changedFiles;

if (process.env.CHANGED_FILES) {
  changedFiles = process.env.CHANGED_FILES.split("\n")
    .map((file) => file.trim())
    .filter(Boolean);
} else {
  try {
    changedFiles = getChangedFiles();
  } catch (error) {
    console.error(`Failed to compute git diff against ${baseRef}.`);
    console.error(error.message);
    process.exit(1);
  }
}

if (changedFiles.length === 0) {
  console.log("No changed files detected.");
  process.exit(0);
}

const headRef = getHeadRef();

if (headRef.startsWith("changeset-release/")) {
  console.log(`Changesets release branch detected (${headRef}). Changeset file not required.`);
  process.exit(0);
}

const touched = releasablePackages.filter((pkg) =>
  changedFiles.some((file) => file.startsWith(pkg.path)),
);

if (touched.length === 0) {
  console.log("No releasable package changes detected. Changeset not required.");
  process.exit(0);
}

const named = changesetPackages();
const uncovered = touched.filter((pkg) => !named.has(pkg.name));

if (uncovered.length === 0) {
  console.log(`Changeset covers every changed package: ${touched.map((p) => p.name).join(", ")}.`);
  process.exit(0);
}

console.error("Releasable package changes with no changeset naming them:\n");
for (const pkg of uncovered) console.error(`  ${pkg.name} (${pkg.path})`);
console.error("\nA changeset only releases the packages it names, so these changes would land");
console.error("in the repo without ever reaching npm. Add one via `vp run changeset`.");
process.exit(1);
