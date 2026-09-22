#!/usr/bin/env node

/**
 * Fails when what npm serves and what this tree carries have come apart.
 *
 * Three ways that happens, and until #598 this guard could only see the first:
 *
 *   1. Source moved with nothing to publish it. A package's published files or
 *      manifest changed after its last version bump and no pending changeset
 *      names it, so no bump will ever carry those changes.
 *      `check-changeset-required.mjs` cannot see this: it asks "did a
 *      releasable package change, and does *a* changeset exist?" and never
 *      checks that the changeset names the package that changed. It is also
 *      `pull_request`-only, so commits landing straight on main skip it
 *      entirely.
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
 *   3. A tree behind the registry. The version this checkout carries was
 *      published from somewhere else, or a realign hand-bumped it down — as
 *      `main` once went 0.6.2 → 0.5.0 against a remote squash. `changeset
 *      publish` cannot publish it (npm refuses a version it already serves) and
 *      the source under it is not the source that shipped. Comparing versions
 *      for equality alone, as this guard did until the #598 review, reads that
 *      as a bump in flight and passes.
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
 * Two stages, two questions. `release.yml` runs this guard twice: once before
 * `changesets/action`, with `--version-stage`, and once inside
 * `changeset:publish`, plain. The version stage exists to consume the pending
 * changesets into the next bump, so refusing a bump they are queued on top of
 * there refuses the remedy — with one flag the step blocked the only commit
 * that could clear what it was reporting. By the publish stage the changesets
 * are consumed, nothing is deferred, and what is left is what is about to be
 * uploaded.
 *
 * Only what the tarball carries counts, and each manifest's own `files` says
 * what that is.
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
 * What a consumer receives, by the manifest's own account: every entry of
 * `files`, plus README.md, which npm ships whatever `files` says, plus the
 * manifest itself. The manifest counts because it is the package's contract — a
 * new `exports` subpath, a widened peer range, a changed `main` — and it drifts
 * the same way source does.
 *
 * `dist` is generated from `src` and is not in git, so naming it costs nothing;
 * a pathspec matching no tracked file contributes no diff. A manifest with no
 * `files` ships its whole directory minus npm's own ignores, so that directory
 * is the honest boundary for it. Hard-coding `src` instead, as this guard did
 * until the #598 review, made a README or NOTICE rewrite after the last bump
 * invisible — and a package's README.md has an owner of its own in #544.
 */
function publishedPaths(pkg) {
  const dir = `${PACKAGES_DIR}/${pkg.dir}`;
  if (!pkg.files || pkg.files.length === 0) return [dir];
  const entries = new Set(["package.json", "README.md", ...pkg.files]);
  return [...entries].map((entry) => `${dir}/${entry.replace(/^\.\/+/, "").replace(/\/+$/, "")}`);
}

function publishedFilesChangedSince(pkg, since) {
  const range = since ? `${since}..HEAD` : "HEAD";
  const out = git(["diff", "--name-only", range, "--", ...publishedPaths(pkg)]);
  return out ? out.split("\n").filter(Boolean) : [];
}

/** A semver version, or null when it is not one. Build metadata carries no precedence. */
function parseVersion(version) {
  const match = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(
    typeof version === "string" ? version : "",
  );
  if (!match) return null;
  return {
    release: [Number(match[1]), Number(match[2]), Number(match[3])],
    pre: match[4] ? match[4].split(".") : [],
  };
}

/**
 * Semver precedence, for two versions `parseVersion` accepted: release triple
 * first, then a prerelease sorting below its own release, then identifier by
 * identifier — numeric ones numerically and below alphanumeric ones, and a
 * shorter list below a longer one that starts with it.
 */
function compareVersions(a, b) {
  const left = parseVersion(a);
  const right = parseVersion(b);
  for (let index = 0; index < 3; index += 1) {
    if (left.release[index] !== right.release[index]) {
      return left.release[index] - right.release[index];
    }
  }
  if (left.pre.length === 0 || right.pre.length === 0) return right.pre.length - left.pre.length;
  for (let index = 0; index < Math.max(left.pre.length, right.pre.length); index += 1) {
    const one = left.pre[index];
    const other = right.pre[index];
    if (one === undefined) return -1;
    if (other === undefined) return 1;
    if (one === other) continue;
    const oneIsNumber = /^\d+$/.test(one);
    const otherIsNumber = /^\d+$/.test(other);
    if (oneIsNumber && otherIsNumber) return Number(one) - Number(other);
    if (oneIsNumber !== otherIsNumber) return oneIsNumber ? -1 : 1;
    return one < other ? -1 : 1;
  }
  return 0;
}

/**
 * The published version to measure against, from the registry's answer.
 *
 * `dist-tags[tag]` first, then `latest`, then the highest version the packument
 * carries. The fallbacks are the point: `changeset pre enter rc` moves the tag
 * to one npm serves for no name that has never had a prerelease, and reading
 * that tag alone turned the unpublished-bump check off for every package at
 * once — on exactly the skew #598 was opened for. The rc line and the stable
 * line are the same package; an unpublished stable bump does not stop being
 * unpublished because a tag was renamed.
 *
 * "Never published" is only what the registry says in those words: a 404, or a
 * packument whose `versions` map is empty. An answer this guard cannot use — a
 * 200 carrying no `dist-tags` object, which is what a proxy answering
 * 404-as-200 gives — is undecided, and undecided is refused, not passed.
 */
function publishedBoundary(read, tag) {
  if (!read.ok) return { kind: "absent" };
  const distTags = read.body?.["dist-tags"];
  if (!distTags || typeof distTags !== "object") {
    return {
      kind: "unreadable",
      why: `${read.url} → ${read.status} with no \`dist-tags\` object in the packument`,
    };
  }
  for (const candidate of [tag, "latest"]) {
    if (typeof distTags[candidate] === "string") {
      return { kind: "version", version: distTags[candidate], tag: candidate };
    }
  }
  const versions = read.body?.versions;
  if (!versions || typeof versions !== "object") {
    return {
      kind: "unreadable",
      why: `${read.url} → ${read.status} with no \`${tag}\` or \`latest\` dist-tag and no \`versions\` map`,
    };
  }
  const ordered = Object.keys(versions)
    .filter((version) => parseVersion(version))
    .sort(compareVersions);
  if (ordered.length > 0) {
    return { kind: "version", version: ordered.at(-1), tag: null };
  }
  return Object.keys(versions).length === 0
    ? { kind: "absent" }
    : {
        kind: "unreadable",
        why: `${read.url} → ${read.status} serves no version that can be ordered as semver`,
      };
}

/**
 * `--version-stage`: the caller is about to run `changeset version`, not
 * `changeset publish`.
 *
 * It defers one failure and one only — a bump the registry never received with
 * a pending changeset queued on top of it — because that is the state the
 * version stage is there to clear: the queued changesets are consumed into the
 * next bump, which the publish stage then ships. Everything else still fails,
 * and the publish stage runs this guard again with no flag, through
 * `changeset:publish`, when there is nothing left to defer to.
 *
 * Without it the step in `release.yml` refused the only commit that could fix
 * the thing it was refusing: measured on `main` at 25820f92, exit 1 naming all
 * five packages, each one "a pending changeset is queued on top of that bump"
 * (#598 second review).
 */
const versionStage = process.argv.slice(2).includes("--version-stage");

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
const deferred = [];

for (const pkg of releasablePackages()) {
  const read = await packument(pkg.name);
  // A registry that cannot be read cannot be compared against. `changeset
  // publish` needs the same registry a step later, so an unreachable one is a
  // failed release either way; saying so here names it while it is still cheap.
  if (!read.ok && read.status !== 404) {
    unreadable.push({ ...pkg, why: read.why });
    continue;
  }

  const boundary = publishedBoundary(read, tag);
  if (boundary.kind === "unreadable") {
    unreadable.push({ ...pkg, why: boundary.why });
    continue;
  }

  const bump = lastBumpCommit(pkg.dir);
  const changed = publishedFilesChangedSince(pkg, bump);
  const covered = pending.has(pkg.name);

  // (1) Changes after the bump that no changeset will publish.
  if (changed.length > 0 && !covered) {
    problems.push({
      ...pkg,
      kind: "uncovered",
      reason: `${changed.length} changed file(s) since its last bump ${
        bump ? bump.slice(0, 8) : "(it has never been bumped)"
      }, and no pending changeset names it`,
      changed,
    });
  }

  if (boundary.kind === "absent") {
    unpublished.push({ ...pkg, tag });
    continue;
  }

  const published = boundary.version;
  const serves =
    `the registry serves ${published} ` +
    (boundary.tag ? `under \`${boundary.tag}\`` : "as its highest published version") +
    (boundary.tag === tag ? "" : ` (it has no \`${tag}\` release yet)`);
  if (published === pkg.version) continue;

  // Direction decides which failure this is, so a version neither side can
  // order is its own answer rather than a guess.
  if (!parseVersion(published) || !parseVersion(pkg.version)) {
    problems.push({
      ...pkg,
      kind: "unorderable",
      reason: `the tree carries ${pkg.version} and ${serves}; that pair cannot be ordered as semver, so which of them is ahead is undecided`,
      changed: [],
    });
    continue;
  }

  const order = compareVersions(pkg.version, published);
  if (order === 0) continue;

  // (3) The registry is ahead of this tree.
  if (order < 0) {
    problems.push({
      ...pkg,
      kind: "behind",
      reason: `${serves}, ahead of the ${pkg.version} this tree carries — this checkout is not the tree that was released`,
      changed: [],
    });
    continue;
  }

  // (2) A version the registry never received, with work stacked on top of it.
  // Nothing stacked means the bump is still in flight — that is the state of
  // the commit the release job publishes from, and failing it would make the
  // publish it guards impossible.
  if (!covered && changed.length === 0) continue;

  // The version stage consumes exactly this: the queued changesets become the
  // next bump, and the publish stage ships that. Refusing it before
  // `changesets/action` runs blocks the one commit that clears the skew.
  if (versionStage && covered) {
    deferred.push({ ...pkg, published });
    continue;
  }

  const publishedTree = commitThatSetVersion(pkg.dir, published);
  problems.push({
    ...pkg,
    kind: "unpublished-bump",
    reason:
      `the tree carries ${pkg.version}, ${serves}, and ` +
      `${covered ? "a pending changeset is queued on top of that bump" : "its source has moved since"}`,
    changed: publishedTree ? publishedFilesChangedSince(pkg, publishedTree) : [],
    publishedTree,
  });
}

// Where the registry has nothing to compare against, say so beside the verdict
// it belongs to — inside a failure when there is one, so it cannot read as
// reassurance in a run that exits 1.
const notes = [
  ...unpublished.map(
    (pkg) =>
      `${pkg.name}: ${registry} has no published version of this package, so there is nothing to drift from.`,
  ),
  ...deferred.map(
    (pkg) =>
      `${pkg.name}: the tree carries ${pkg.version} and ${registry} serves ${pkg.published}; deferred to the version stage, which consumes the changeset queued on top of that bump. The publish stage asks again, with nothing left to defer to.`,
  ),
];

if (unreadable.length > 0) {
  for (const note of notes) console.error(note);
  console.error(`The registry could not be read, so publish drift is undecided:\n`);
  for (const pkg of unreadable) console.error(`  ${pkg.name} — ${pkg.why}`);
  console.error("\nA publish needs this same registry. Fix the read, then run this guard again.");
  process.exit(1);
}

if (problems.length === 0) {
  for (const note of notes) console.log(note);
  console.log(
    deferred.length > 0
      ? `No publish drift the version stage does not clear: ${deferred.length} unpublished bump(s) deferred to it, and nothing else.`
      : `No publish drift: every package's ${tag} release matches this tree, or its unreleased changes have a changeset.`,
  );
  process.exit(0);
}

for (const note of notes) console.error(note);
console.error(`What ${registry} serves and what this tree carries have come apart:\n`);
for (const pkg of problems) {
  console.error(`  ${pkg.name}@${pkg.version} — ${pkg.reason}`);
  if (pkg.publishedTree) {
    console.error(`      published tree ${pkg.publishedTree.slice(0, 8)}; changed since:`);
  }
  for (const file of pkg.changed.slice(0, 10)) console.error(`      ${file}`);
  if (pkg.changed.length > 10) console.error(`      … and ${pkg.changed.length - 10} more`);
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
  console.error("Publish the bump before stacking more on it. By hand: from a clean checkout of");
  console.error("a SHA whose gates are green, `vp run release:npm` re-reads the release guards,");
  console.error("builds, and publishes the versions this tree already carries — `changeset");
  console.error("publish` ships whatever the registry is missing. In CI: re-run Release at that");
  console.error("SHA. Before `changeset version`, this guard takes `--version-stage` and defers");
  console.error("this one failure, because the version stage is what clears it.\n");
}
if (problems.some((pkg) => pkg.kind === "behind")) {
  console.error(
    "A tree behind the registry is not the tree that was released: `changeset publish`",
  );
  console.error("refuses a version npm already serves, and the source under that version is not");
  console.error("the source that shipped. Fetch the commit that was released, or bump past what");
  console.error("the registry serves.\n");
}
if (problems.some((pkg) => pkg.kind === "unorderable")) {
  console.error("A version neither side can order decides nothing: which of the tree and the");
  console.error("registry is ahead is the whole question here. Fix the version, then run again.");
}
process.exit(1);
