#!/usr/bin/env node

/**
 * Who Changesets may publish, and what the pending changesets name.
 *
 * Both answers were derived twice, in `check-publish-drift.mjs` and in
 * `check-release-prerequisites.mjs`, and the two did not agree: drift
 * enumerated the tree, while the prerequisite guard trusted a hand-written list
 * that named one ignored package and none of the five real candidates. A guard
 * that reads its own subjects from a list can only ever check the packages
 * somebody remembered. It reads them from the tree now, through here.
 *
 * The live registry read lives here for the same reason: two guards ask the
 * registry what it serves, and a second copy of the URL, the env variable and
 * the error shape is how the two answers drift apart (#598).
 */

import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

export const PACKAGES_DIR = "packages";
export const CHANGESET_DIR = ".changeset";

/** Packages changesets may publish: everything under packages/ that is not private or ignored. */
export function releasablePackages(root = ".") {
  const packagesDir = join(root, PACKAGES_DIR);
  const config = join(root, CHANGESET_DIR, "config.json");
  const ignored = new Set(
    existsSync(config) ? (JSON.parse(readFileSync(config, "utf8")).ignore ?? []) : [],
  );

  return readdirSync(packagesDir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => {
      const manifest = join(packagesDir, entry.name, "package.json");
      if (!existsSync(manifest)) return null;
      const parsed = JSON.parse(readFileSync(manifest, "utf8"));
      return {
        dir: entry.name,
        manifest: `${PACKAGES_DIR}/${entry.name}/package.json`,
        name: parsed.name,
        version: parsed.version,
        // The manifest's own account of what the tarball carries. A guard that
        // hard-codes that list checks a package it invented: all five of ours
        // ship LICENSE, LICENSE-APACHE-2.0 and NOTICE beside `dist` and `src`.
        files: Array.isArray(parsed.files) ? parsed.files : null,
        private: Boolean(parsed.private),
      };
    })
    .filter((pkg) => pkg && !pkg.private && !ignored.has(pkg.name));
}

/**
 * Every pending changeset, by its changeset id and the packages it names.
 *
 * The id matters in prerelease mode: `.changeset/pre.json` lists the changesets
 * a prerelease bump has already consumed, and those files stay in the directory
 * until `pre exit`. A guard that counts files sees them as still pending
 * forever (#598).
 */
export function pendingChangesets(root = ".") {
  const dir = join(root, CHANGESET_DIR);
  if (!existsSync(dir)) return [];

  const found = [];
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".md") || file === "README.md") continue;
    const frontmatter = readFileSync(join(dir, file), "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) continue;
    const names = new Set();
    for (const line of frontmatter[1].split("\n")) {
      const match = line.match(
        /^\s*["']?(@[^"':]+\/[^"':]+|[^"':\s]+)["']?\s*:\s*(major|minor|patch)\s*$/,
      );
      if (match) names.add(match[1]);
    }
    found.push({ id: file.replace(/\.md$/, ""), names });
  }
  return found;
}

/** Package names named in the frontmatter of every pending changeset. */
export function pendingChangesetPackages(root = ".") {
  const named = new Set();
  for (const changeset of pendingChangesets(root)) {
    for (const name of changeset.names) named.add(name);
  }
  return named;
}

/** The prerelease this tree is in, or null. Written by `changeset pre enter`. */
export function preRelease(root = ".") {
  const file = join(root, CHANGESET_DIR, "pre.json");
  if (!existsSync(file)) return null;
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(file, "utf8"));
  } catch {
    return null;
  }
  if (parsed?.mode !== "pre" || typeof parsed.tag !== "string") return null;
  return { tag: parsed.tag, consumed: new Set(parsed.changesets ?? []) };
}

/**
 * The registry a publish from this tree would reach.
 *
 * `npm_config_registry` is npm's own variable — the one `changeset publish`
 * itself obeys — so the guards measure against the registry they would publish
 * to, and the contract tests can hand them a registry they control.
 */
export const registry = (process.env.npm_config_registry ?? "https://registry.npmjs.org").replace(
  /\/+$/,
  "",
);

const packuments = new Map();

/** One live registry read per package name, shared by every guard in the process. */
export function packument(name) {
  if (!packuments.has(name)) packuments.set(name, fetchPackument(name));
  return packuments.get(name);
}

async function fetchPackument(name) {
  const url = `${registry}/${name.replace("/", "%2f")}`;
  try {
    const response = await fetch(url, { headers: { Accept: "application/json" } });
    if (!response.ok) {
      return {
        ok: false,
        url,
        status: response.status,
        why: `${url} → ${response.status} ${response.statusText}`,
      };
    }
    return { ok: true, url, status: response.status, body: await response.json() };
  } catch (error) {
    return { ok: false, url, status: 0, why: `${url} → ${error.message}` };
  }
}
