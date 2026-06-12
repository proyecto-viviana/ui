#!/usr/bin/env node

import { execFileSync } from "node:child_process";

const baseRef = process.env.CHANGESET_BASE_REF || "origin/main";

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

const headRef = getHeadRef();

if (headRef.startsWith("changeset-release/")) {
  console.log(`Changesets release branch detected (${headRef}). Changeset status not required.`);
  process.exit(0);
}

execFileSync("vp", ["exec", "changeset", "status", `--since=${baseRef}`], {
  stdio: "inherit",
});
