#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const baseRef = process.env.CHANGESET_BASE_REF || "origin/main";
const releasablePaths = [
  "packages/solid-stately/",
  "packages/solidaria/",
  "packages/solidaria-components/",
  "packages/solid-spectrum/",
  "packages/viviana-ui/",
];

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

const touchesReleasablePackage = changedFiles.some((file) =>
  releasablePaths.some((prefix) => file.startsWith(prefix)),
);

if (!touchesReleasablePackage) {
  console.log("No releasable package changes detected. Changeset not required.");
  process.exit(0);
}

const hasChangesetFile = changedFiles.some(
  (file) => /^\.changeset\/[^/]+\.md$/.test(file) && file !== ".changeset/README.md",
);

if (hasChangesetFile) {
  console.log("Changeset file detected for releasable package changes.");
  process.exit(0);
}

console.error("Releasable package changes detected without a changeset file.");
console.error("Add one via `vp run changeset`.");
process.exit(1);
