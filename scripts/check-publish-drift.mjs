#!/usr/bin/env node

/**
 * Fails when what npm serves and what this tree carries have come apart.
 *
 * Two ways that happens, and until #598 this guard could only see the first:
 *
 *   1. Source moved with nothing to publish it. A package's `src` or manifest
 *      changed after its last version bump and no pending changeset names it,
 *      so no bump will ever carry those changes. `check-changeset-required.mjs`
 *      cannot see this: it asks "did a releasable package change, and does *a*
 *      changeset exist?" and never checks that the changeset names the package
 *      that changed. It is also `pull_request`-only, so commits landing straight
 *      on main skip it entirely.
 *
 *   2. A bump that was written and never published. `changeset version` writes
 *      the new version and CHANGELOG.md in one commit; the publish is a
 *      separate step that can be skipped, cancelled or fail. The old boundary
 *      here was "the last commit touching CHANGELOG.md", which is that bump —
 *      so the guard started its diff *after* an unpublished bump and called the
 *      result clean. At the time #598 was written every one of the five
 *      packages sat a full minor ahead of the registry with that boundary and
 *      the guard printed "No publish drift". The boundary is the registry's
 *      answer now, not the tree's claim about itself.
 *
 * The symptom is silent and only appears off-workspace: the package keeps its
 * published version number while its source moves on, so npm serves a stale
 * tarball under a version consumers already resolve. Everything in-repo
 * (apps/web via workspace links, `pack:local-chain` via freshly packed
 * siblings) builds against current source and stays green.
 * `@proyecto-viviana/ui@0.6.0` shipped importing `ElementTag` from
 * `solidaria-components@0.4.1`, whose published tarball predated that export —
 * a hard build failure for any real consumer. An abandoned bump is the same
 * failure a step earlier: `workspace:^` publishes as `^0.7.0`, and `^0.7.0` of
 * a sibling the registry never received does not resolve at all.
 *
 * What a pending changeset excuses, and what it does not. A changeset naming
 * the package answers (1): the changes will reach npm, because the next bump
 * carries them. It answers nothing about (2) — a queued changeset on top of an
 * unpublished bump is the evidence that the bump was abandoned, not an excuse
 * for it. The skip is on the first question only; before #598 it was on both,
 * and since every releasable package had a changeset it skipped every subject
 * the guard had.
 *
 * Only what the tarball carries counts — `files` is `["dist", "src"]` and
 * `dist` is generated from `src` — so tests and docs cannot drift, but the
 * manifest can.
 */

import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

import {
  packument,
  PACKAGES_DIR,
  pendingChangesets,
  preRelease,
  registry,
  releasablePackages,
} from "./release-candidates.mjs";

function git(args) {
  return execFileSync("git", args, { encoding: "utf8" }).trim();
}

/**
 * The commit that last *bumped* this package — not the commit that last
 * released it. CHANGELOG.md is written only by `changeset version`, so its last
 * touch is where the current version number was minted. Whether that version
 * ever reached the registry is a separate question, asked below.
 */
function lastBumpCommit(dir) {
  const changelog = join(PACKAGES_DIR, dir, "CHANGELOG.md");
  if (!existsSync(changelog)) return null;
  return git(["log", "--format=%H", "-1", "--", changelog]) || null;
}

/**
 * The commit that set `version` in this package's manifest — the tree the
 * registry's tarball for that version was built from.
 *
 * Walk the manifest's own history newest-first and keep the oldest commit of
 * the run that carries `version`: the newest such commit is the last edit made
 * *while* that version stood, and using it as a boundary would hide that edit's
 * own diff. Returns null when the version is not in this history at all — a
 * tarball published from somewhere this checkout cannot see.
 */
function commitThatSetVersion(dir, version) {
  const manifest = `${PACKAGES_DIR}/${dir}/package.json`;
  let setter = null;
  for (const commit of git(["log", "--format=%H", "--", manifest]).split("\n").filter(Boolean)) {
    let seen;
    try {
      seen = JSON.parse(git(["show", `${commit}:${manifest}`])).version;
    } catch {
      break;
    }
    if (seen === version) setter = commit;
    else if (setter) break;
  }
  return setter;
}

/**
 * What a consumer receives: `src` (`files` is `["dist", "src"]`, and `dist` is
 * generated from `src`) and the manifest itself. The manifest counts because it
 * is the package's contract — a new `exports` subpath, a widened peer range, a
 * changed `main` — and it drifts the same way source does: the published
 * tarball keeps the old contract under a version consumers already resolve.
 */
function publishedFilesChangedSince(dir, since) {
  const paths = [`${PACKAGES_DIR}/${dir}/src`, `${PACKAGES_DIR}/${dir}/package.json`];
  const range = since ? `${since}..HEAD` : "HEAD";
  const out = git(["diff", "--name-only", range, "--", ...paths]);
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

// In prerelease mode the published version lives under the prerelease tag —
// `latest` deliberately stays on the last stable — and the changesets a
// prerelease bump has already consumed stay on disk until `pre exit`. Counting
// those files as pending would make every package look permanently stacked.
const pre = preRelease();
const tag = pre?.tag ?? "latest";
const pending = new Set();
for (const changeset of pendingChangesets()) {
  if (pre?.consumed.has(changeset.id)) continue;
  for (const name of changeset.names) pending.add(name);
}

const problems = [];
const unreadable = [];
const unpublished = [];

for (const pkg of releasablePackages()) {
  const read = await packument(pkg.name);
  // A registry that cannot be read cannot be compared against. `changeset
  // publish` needs the same registry a step later, so an unreachable one is a
  // failed release either way; saying so here names it while it is still cheap.
  if (!read.ok && read.status !== 404) {
    unreadable.push({ ...pkg, why: read.why });
    continue;
  }

  const published = read.ok ? read.body?.["dist-tags"]?.[tag] : undefined;
  const bump = lastBumpCommit(pkg.dir);
  const changed = publishedFilesChangedSince(pkg.dir, bump);
  const covered = pending.has(pkg.name);

  // (1) Changes after the bump that no changeset will publish.
  if (changed.length > 0 && !covered) {
    problems.push({
      ...pkg,
      kind: "uncovered",
      reason: `${changed.length} changed file(s) since its last bump ${
        bump ? bump.slice(0, 8) : "(it has never been bumped)"
      }, and no pending changeset names it`,
      files: changed,
    });
  }

  // (2) A version the registry never received, with work stacked on top of it.
  // Nothing stacked means the bump is still in flight — that is the state of
  // the commit the release job publishes from, and failing it would make the
  // publish it guards impossible.
  if (typeof published !== "string") {
    unpublished.push({ ...pkg, tag });
    continue;
  }
  if (published === pkg.version) continue;
  if (!covered && changed.length === 0) continue;

  const boundary = commitThatSetVersion(pkg.dir, published);
  problems.push({
    ...pkg,
    kind: "unpublished-bump",
    reason:
      `the tree carries ${pkg.version}, the registry serves ${published} under \`${tag}\`, and ` +
      `${covered ? "a pending changeset is queued on top of that bump" : "its source has moved since"}`,
    files: boundary ? publishedFilesChangedSince(pkg.dir, boundary) : [],
    boundary,
  });
}

for (const pkg of unpublished) {
  console.log(
    `${pkg.name}: ${registry} serves no \`${pkg.tag}\` release, so there is no published tarball to drift from.`,
  );
}

if (unreadable.length > 0) {
  console.error(`The registry could not be read, so publish drift is undecided:\n`);
  for (const pkg of unreadable) console.error(`  ${pkg.name} — ${pkg.why}`);
  console.error("\nA publish needs this same registry. Fix the read, then run this guard again.");
  process.exit(1);
}

if (problems.length === 0) {
  console.log(
    `No publish drift: every package's ${tag} release matches this tree, or its unreleased changes have a changeset.`,
  );
  process.exit(0);
}

console.error(`What ${registry} serves and what this tree carries have come apart:\n`);
for (const pkg of problems) {
  console.error(`  ${pkg.name}@${pkg.version} — ${pkg.reason}`);
  if (pkg.boundary) {
    console.error(`      published tree ${pkg.boundary.slice(0, 8)}; changed since:`);
  }
  for (const file of pkg.files.slice(0, 10)) console.error(`      ${file}`);
  if (pkg.files.length > 10) console.error(`      … and ${pkg.files.length - 10} more`);
  console.error("");
}
if (problems.some((pkg) => pkg.kind === "uncovered")) {
  console.error("A change with no changeset never reaches npm: nothing bumps the version that");
  console.error("would carry it, so the registry keeps serving the old tarball under a version");
  console.error("consumers already resolve. Add a changeset naming the package via");
  console.error("`vp run changeset`.\n");
}
if (problems.some((pkg) => pkg.kind === "unpublished-bump")) {
  console.error("A version the registry never received is that same skew a step earlier:");
  console.error("`workspace:^` publishes as a range on a sibling version npm does not have, and");
  console.error("the changelog written for that version describes a tree nobody can install.");
  console.error("Publish the bump before stacking more on it, or re-run the release for it.");
}
process.exit(1);
