#!/usr/bin/env node

/**
 * Pushes the tags `changeset publish` made and creates their GitHub releases.
 *
 * `changeset publish` uploads to npm and tags each published package on the
 * runner. Nothing pushed those tags or made a release: the Changesets action
 * that used to was dropped when it broke under pre mode, so `0.x.0-rc.0` and
 * `rc.1` have neither, and rc.2's were made by hand (#659).
 *
 * The packages are the ones the publish output names under `Successfully
 * published:`. That is the set this run uploaded: a package npm already had
 * is not listed, so a re-run does not release it twice. Each is checked
 * against the tree before anything is pushed: its manifest holds that
 * version, its tag exists and points at the released commit, and its
 * CHANGELOG has a section for the version. One failed check pushes nothing.
 *
 *   node scripts/publish-github-releases.mjs --publish-log <file>           # print the plan
 *   node scripts/publish-github-releases.mjs --publish-log <file> --apply   # push and release
 *   node scripts/publish-github-releases.mjs <name@version>… [--apply]      # name them by hand
 *
 * `RELEASE_SHA` names the released commit; without it, HEAD.
 */

import { spawnSync } from "node:child_process";
import { existsSync, mkdtempSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");

// Colour and cursor sequences, and the timestamp GitHub prefixes to a job log.
const ANSI = new RegExp(`${String.fromCharCode(27)}\\[[0-9;?]*[A-Za-z]`, "g");
const LOG_TIMESTAMP = /^\d{4}-\d{2}-\d{2}T[\d:.]+Z /;
const PUBLISHED_HEADING = /Successfully published:\s*$/;
const RELEASE = /^(?:- )?((?:@[a-z0-9._-]+\/)?[a-z0-9._-]+)@(\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?)$/;

/** The `name@version` lines under each `Successfully published:` of a publish log. */
export function parsePublishedPackages(log) {
  const published = [];
  let inList = false;
  for (const raw of log.split(/\r?\n/)) {
    const line = raw.replace(LOG_TIMESTAMP, "").replace(ANSI, "").trim();
    if (PUBLISHED_HEADING.test(line)) {
      inList = true;
      continue;
    }
    if (!inList) continue;
    const release = RELEASE.exec(line);
    if (!release) {
      inList = false;
      continue;
    }
    if (!published.some((item) => item.name === release[1] && item.version === release[2])) {
      published.push({ name: release[1], version: release[2] });
    }
  }
  return published;
}

export function parseReleaseName(text) {
  const release = RELEASE.exec(text.trim());
  if (!release) throw new Error(`"${text}" is not a <name>@<version> release name`);
  return { name: release[1], version: release[2] };
}

/** The body of the `## <version>` section of a CHANGELOG, without the heading. */
export function changelogSection(changelog, version) {
  const lines = changelog.split(/\r?\n/);
  const start = lines.findIndex((line) => line.trim() === `## ${version}`);
  if (start === -1) return null;
  let end = lines.findIndex((line, index) => index > start && line.startsWith("## "));
  if (end === -1) end = lines.length;
  const body = lines
    .slice(start + 1, end)
    .join("\n")
    .trim();
  return body === "" ? null : body;
}

/** A semver prerelease carries a hyphenated suffix: `0.8.0-rc.2`. */
export function isPrerelease(version) {
  return version.includes("-");
}

/**
 * One release per published package, or the problems that stop all of them.
 * `packages` maps a name to its manifest version, CHANGELOG text and privacy;
 * `tagCommit(tag)` returns the commit a local tag points at, or null.
 */
export function planReleases({ published, packages, tagCommit, releaseSha }) {
  const releases = [];
  const problems = [];
  for (const { name, version } of published) {
    const tag = `${name}@${version}`;
    const pkg = packages.get(name);
    if (!pkg) {
      problems.push(`${tag}: no workspace package is named ${name}`);
      continue;
    }
    if (pkg.private) {
      problems.push(`${tag}: ${name} is private and is never released`);
      continue;
    }
    if (pkg.version !== version) {
      problems.push(`${tag}: the tree holds ${name}@${pkg.version}, not the published version`);
      continue;
    }
    const commit = tagCommit(tag);
    if (commit === null) {
      problems.push(`${tag}: the tag does not exist in this checkout`);
      continue;
    }
    if (commit !== releaseSha) {
      problems.push(
        `${tag}: the tag points at ${commit}, not at the released commit ${releaseSha}`,
      );
      continue;
    }
    const notes = changelogSection(pkg.changelog ?? "", version);
    if (notes === null) {
      problems.push(`${tag}: ${pkg.dir}/CHANGELOG.md has no section for ${version}`);
      continue;
    }
    releases.push({ tag, name: tag, prerelease: isPrerelease(version), notes });
  }
  return { releases, problems };
}

/**
 * Pushes every tag in one push, then creates the releases. A release that
 * already exists is left alone, so a re-run after a partial failure finishes
 * the rest. `run(command, args)` returns `{ status, stdout, stderr }`.
 */
export function applyReleases(releases, { run, notesDir, log = console.log }) {
  if (releases.length === 0) return;
  const push = run("git", [
    "push",
    "origin",
    ...releases.map(({ tag }) => `refs/tags/${tag}:refs/tags/${tag}`),
  ]);
  if (push.status !== 0) {
    throw new Error(`git push of ${releases.length} tag(s) failed:\n${push.stderr}`);
  }
  log(`pushed ${releases.length} tag(s)`);
  releases.forEach((release, index) => {
    if (run("gh", ["release", "view", release.tag, "--json", "tagName"]).status === 0) {
      log(`release ${release.name} already exists; left as it is`);
      return;
    }
    const notesFile = join(notesDir, `release-notes-${index}.md`);
    writeFileSync(notesFile, `${release.notes}\n`);
    const created = run("gh", [
      "release",
      "create",
      release.tag,
      "--title",
      release.name,
      "--notes-file",
      notesFile,
      // Never let gh mint the tag from the default branch head.
      "--verify-tag",
      ...(release.prerelease ? ["--prerelease"] : []),
    ]);
    if (created.status !== 0) {
      throw new Error(`gh release create ${release.tag} failed:\n${created.stderr}`);
    }
    log(`created ${release.prerelease ? "pre-release" : "release"} ${release.name}`);
  });
}

function readWorkspacePackages(root) {
  const packages = new Map();
  const packagesDir = join(root, "packages");
  for (const entry of readdirSync(packagesDir, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue;
    const manifestPath = join(packagesDir, entry.name, "package.json");
    if (!existsSync(manifestPath)) continue;
    const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
    const changelogPath = join(packagesDir, entry.name, "CHANGELOG.md");
    packages.set(manifest.name, {
      dir: `packages/${entry.name}`,
      version: manifest.version,
      private: manifest.private === true,
      changelog: existsSync(changelogPath) ? readFileSync(changelogPath, "utf8") : null,
    });
  }
  return packages;
}

function main(argv) {
  const apply = argv.includes("--apply");
  const logFlag = argv.indexOf("--publish-log");
  const named = argv.filter(
    (arg, index) => !arg.startsWith("--") && (logFlag === -1 || index !== logFlag + 1),
  );
  const run = (command, args) => {
    const result = spawnSync(command, args, { cwd: ROOT, encoding: "utf8" });
    return {
      status: result.status ?? 1,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? String(result.error ?? ""),
    };
  };
  const revision = (ref) => {
    const result = run("git", ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
    return result.status === 0 ? result.stdout.trim() : null;
  };

  let published;
  if (logFlag !== -1) {
    const logPath = argv[logFlag + 1];
    if (!logPath || !existsSync(logPath)) {
      throw new Error(`--publish-log needs the file the publish step wrote; got ${logPath}`);
    }
    if (named.length > 0) throw new Error("name the releases or pass --publish-log, not both");
    published = parsePublishedPackages(readFileSync(logPath, "utf8"));
  } else if (named.length > 0) {
    published = named.map(parseReleaseName);
  } else {
    throw new Error("pass --publish-log <file>, or the <name>@<version> releases to make");
  }

  if (published.length === 0) {
    console.log(
      "publish-github-releases: the publish step uploaded no package; nothing to release",
    );
    return;
  }

  const releaseSha = revision(process.env.RELEASE_SHA || "HEAD");
  if (releaseSha === null) throw new Error("the released commit is not in this checkout");
  const { releases, problems } = planReleases({
    published,
    packages: readWorkspacePackages(ROOT),
    tagCommit: (tag) => revision(`refs/tags/${tag}`),
    releaseSha,
  });
  if (problems.length > 0) {
    throw new Error(`nothing was pushed:\n${problems.map((problem) => `  ${problem}`).join("\n")}`);
  }

  if (!apply) {
    console.log(JSON.stringify(releases, null, 2));
    return;
  }
  applyReleases(releases, { run, notesDir: mkdtempSync(join(tmpdir(), "release-notes-")) });
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    main(process.argv.slice(2));
  } catch (error) {
    console.error(`publish-github-releases: ${error.message}`);
    process.exit(1);
  }
}
