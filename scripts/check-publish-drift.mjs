#!/usr/bin/env node

/**
 * Fails when a publishable package has source changes that no pending changeset
 * covers — i.e. changes that will never reach npm, because nothing will bump the
 * version that carries them.
 *
 * This is the failure `check-changeset-required.mjs` cannot see. That guard asks
 * "did a releasable package change, and does *a* changeset exist?" — it never
 * checks that the changeset names the package that changed. A commit touching
 * two packages and carrying a changeset for one of them passes it. It is also
 * `pull_request`-only, so commits landing straight on main skip it entirely.
 *
 * The symptom is silent and only appears off-workspace: the package keeps its
 * published version number while its source moves on, so npm serves a stale
 * tarball under a version that consumers already resolve. Everything in-repo
 * (apps/web via workspace links, `pack:local-chain` via freshly packed siblings)
 * builds against current source and stays green. `@proyecto-viviana/ui@0.6.0`
 * shipped importing `ElementTag` from `solidaria-components@0.4.1`, whose
 * published tarball predated that export — a hard build failure for any real
 * consumer.
 *
 * The question is decided from git alone, with no network and no build: a
 * package's last release is the last commit touching its CHANGELOG.md, so any
 * `src/` change after that point is unreleased. Only `src/` counts — `files` is
 * `["dist", "src"]` and `dist` is generated, so tests and docs cannot drift.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  PACKAGES_DIR,
  pendingChangesetPackages,
  releasablePackages,
} from "./release-candidates.mjs";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

/**
 * The commit that last released this package. CHANGELOG.md is written only by
 * `changeset version`, so its last touch is the release boundary. A package with
 * no CHANGELOG.md has never been released; everything in it is unreleased.
 */
function lastReleaseCommit(dir) {
  const changelog = join(PACKAGES_DIR, dir, "CHANGELOG.md");
  if (!existsSync(changelog)) return null;
  return git(["log", "--format=%H", "-1", "--", changelog]) || null;
}

function unreleasedSourceFiles(dir, since) {
  const src = `${PACKAGES_DIR}/${dir}/src`;
  const range = since ? `${since}..HEAD` : "HEAD";
  const out = git(["diff", "--name-only", range, "--", src]);
  return out ? out.split("\n").filter(Boolean) : [];
}

// A shallow clone truncates history, so the last CHANGELOG.md commit may simply
// not be present and every package would look clean. Refuse to give a green
// answer we cannot support — checkout needs fetch-depth: 0.
if (git(["rev-parse", "--is-shallow-repository"]) === "true") {
  console.error("Shallow clone: release history is truncated, so drift cannot be determined.");
  console.error("Check out with fetch-depth: 0 before running this guard.");
  process.exit(1);
}

const pending = pendingChangesetPackages();
const drifted = [];

for (const pkg of releasablePackages()) {
  const since = lastReleaseCommit(pkg.dir);
  const changed = unreleasedSourceFiles(pkg.dir, since);
  if (changed.length === 0) continue;
  if (pending.has(pkg.name)) continue;
  drifted.push({ ...pkg, since, changed });
}

if (drifted.length === 0) {
  console.log("No publish drift: every package with unreleased source changes has a changeset.");
  process.exit(0);
}

console.error("Unreleased source changes with no changeset to publish them:\n");
for (const pkg of drifted) {
  const boundary = pkg.since ? `since ${pkg.since.slice(0, 8)}` : "never released";
  console.error(`  ${pkg.name}@${pkg.version} — ${pkg.changed.length} changed file(s) ${boundary}`);
  for (const file of pkg.changed.slice(0, 10)) console.error(`      ${file}`);
  if (pkg.changed.length > 10) console.error(`      … and ${pkg.changed.length - 10} more`);
  console.error("");
}
console.error("These changes will not reach npm: nothing bumps the version that would carry them,");
console.error(
  "so the registry keeps serving the old tarball under a version consumers already resolve.",
);
console.error("Add a changeset naming each package above via `vp run changeset`.");
process.exit(1);
