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
        private: Boolean(parsed.private),
      };
    })
    .filter((pkg) => pkg && !pkg.private && !ignored.has(pkg.name));
}

/** Package names named in the frontmatter of every pending changeset. */
export function pendingChangesetPackages(root = ".") {
  const dir = join(root, CHANGESET_DIR);
  if (!existsSync(dir)) return new Set();

  const named = new Set();
  for (const file of readdirSync(dir)) {
    if (!file.endsWith(".md") || file === "README.md") continue;
    const frontmatter = readFileSync(join(dir, file), "utf8").match(/^---\r?\n([\s\S]*?)\r?\n---/);
    if (!frontmatter) continue;
    for (const line of frontmatter[1].split("\n")) {
      const match = line.match(
        /^\s*["']?(@[^"':]+\/[^"':]+|[^"':\s]+)["']?\s*:\s*(major|minor|patch)\s*$/,
      );
      if (match) named.add(match[1]);
    }
  }
  return named;
}
