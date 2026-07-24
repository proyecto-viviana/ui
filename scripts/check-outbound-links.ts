/**
 * guard:outbound-links — a static gate on the repository identity we publish.
 *
 * Two failure modes, both of which had already happened by the 2026-07-24 launch
 * audit:
 *
 *   1. Dead repo slug. Six live links on the docs site pointed at
 *      `github.com/proyecto-viviana/proyecto-viviana` — the header GitHub icon,
 *      the solid-spectrum landing CTA, and all four ecosystem package tiles.
 *      The repository is `proyecto-viviana/ui`; every one of those was a 404 for
 *      the first thing a visitor clicks.
 *   2. Hand-typed repo URLs. Those six were literals, which is exactly why they
 *      could rot independently. App source must go through `@/lib/site`, so the
 *      name lives in one place.
 *
 * The gate is static — it never hits the network. It checks the slug we know is
 * dead and the shape of how URLs are written; it cannot tell you a live URL has
 * since 404'd.
 *
 * CHANGELOG.md files are exempt. Changesets wrote those commit and PR links
 * under the repo's former name, and they are a historical record: rewriting them
 * would falsify what the release actually said.
 */

import { readdir, readFile } from "node:fs/promises";
import path from "node:path";

const ROOT = process.cwd();

/** The repository, as `origin` and every package's `repository.url` name it. */
const REPO_SLUG = "proyecto-viviana/ui";
const REPO_URL = `https://github.com/${REPO_SLUG}`;

/**
 * Both patterns require a link delimiter — a quote, `(`, or `<` — immediately
 * before the scheme. That is what separates a link from prose: an `href="…"`, a
 * markdown `](…)`, and an autolink all match, while a backticked mention in a
 * comment or a doc explaining this very rule does not. The guard should catch
 * links, not talk about them.
 */
const LINK_START = `["'(<]https://github\\.com/proyecto-viviana`;

/** The slug that does not exist. Anything pointing here is a 404. */
const DEAD_SLUG_RE = new RegExp(`${LINK_START}/proyecto-viviana`, "g");

/** Any repo-scoped GitHub URL (org-only links like `/proyecto-viviana` are fine). */
const REPO_URL_RE = new RegExp(`${LINK_START}/[A-Za-z0-9._-]+`, "g");

const SCAN_ROOTS = ["apps", "packages", "scripts", "docs", ".claude/current"];
const SCAN_EXTENSIONS = new Set([".ts", ".tsx", ".astro", ".md", ".mdx", ".json", ".mjs", ".js"]);
const SKIP_DIRS = new Set(["node_modules", "dist", ".output", ".vinxi", "__snapshots__"]);

/** Release history, written under the old name. Historical record, not a live link. */
const isChangelog = (rel: string) => path.basename(rel) === "CHANGELOG.md";

/**
 * The single-source rule applies to the docs site, which is where the rot
 * happened and where `@/lib/site` exists. `site.ts` itself is the definition.
 * The comparison app is out of scope: it renders two footer links and has no
 * such module, so a shared constant there would be ceremony, not a safeguard.
 */
const SITE_MODULE = path.join("apps", "web", "src", "lib", "site.ts");
const SINGLE_SOURCE_ROOT = path.join("apps", "web", "src");

function mustUseSiteModule(rel: string): boolean {
  if (rel === SITE_MODULE) return false;
  if (!rel.startsWith(SINGLE_SOURCE_ROOT)) return false;
  return path.extname(rel) === ".ts" || path.extname(rel) === ".tsx";
}

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  let entries;
  try {
    entries = await readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry.name.startsWith(".") && entry.name !== ".claude") continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      out.push(...(await walk(full)));
    } else if (SCAN_EXTENSIONS.has(path.extname(entry.name))) {
      out.push(full);
    }
  }
  return out;
}

interface Hit {
  file: string;
  line: number;
  text: string;
}

const deadLinks: Hit[] = [];
const hardcoded: Hit[] = [];

for (const rootRel of SCAN_ROOTS) {
  for (const file of await walk(path.join(ROOT, rootRel))) {
    const rel = path.relative(ROOT, file);
    if (isChangelog(rel)) continue;
    const source = await readFile(file, "utf8");
    source.split("\n").forEach((text, index) => {
      const hit = { file: rel, line: index + 1, text: text.trim() };
      if (DEAD_SLUG_RE.test(text)) deadLinks.push(hit);
      DEAD_SLUG_RE.lastIndex = 0;
      if (mustUseSiteModule(rel) && REPO_URL_RE.test(text)) hardcoded.push(hit);
      REPO_URL_RE.lastIndex = 0;
    });
  }
}

/**
 * What a published package tells npm about itself. `repository`, `homepage` and
 * `bugs` are the three links npm renders beside a package, and all three were
 * either missing or pointing somewhere dead at audit time. `description` and
 * `keywords` are how the package is found at all — `@proyecto-viviana/ui`
 * shipped six versions with zero keywords and a description that explained the
 * fork's internals to a maintainer rather than the package to a user.
 */
const manifestErrors: string[] = [];
for (const dir of await readdir(path.join(ROOT, "packages"), { withFileTypes: true })) {
  if (!dir.isDirectory()) continue;
  const manifestPath = path.join(ROOT, "packages", dir.name, "package.json");
  let manifest;
  try {
    manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  } catch {
    continue;
  }
  if (manifest.private) continue;

  const at = (field: string, value: string) =>
    manifestErrors.push(`  packages/${dir.name}/package.json  ${field} = ${value}`);

  for (const [field, url] of [
    ["repository.url", manifest.repository?.url],
    ["homepage", manifest.homepage],
    ["bugs", typeof manifest.bugs === "string" ? manifest.bugs : manifest.bugs?.url],
  ] as const) {
    if (typeof url !== "string" || !url.includes(REPO_SLUG)) at(field, url ?? "(missing)");
  }
  if (!manifest.description) at("description", "(missing)");
  if (!Array.isArray(manifest.keywords) || manifest.keywords.length === 0) {
    at("keywords", "(missing or empty)");
  }
}

let failed = false;

if (deadLinks.length > 0) {
  failed = true;
  console.error(
    `guard:outbound-links — ${deadLinks.length} link(s) point at a repository that does not exist:\n`,
  );
  for (const hit of deadLinks) {
    console.error(`  ${hit.file}:${hit.line}`);
    console.error(`      ${hit.text}`);
  }
  console.error(`\nThe repository is ${REPO_URL}.\n`);
}

if (hardcoded.length > 0) {
  failed = true;
  console.error(
    `guard:outbound-links — ${hardcoded.length} hand-typed repository URL(s) in source:\n`,
  );
  for (const hit of hardcoded) {
    console.error(`  ${hit.file}:${hit.line}`);
    console.error(`      ${hit.text}`);
  }
  console.error("\nImport REPO_URL / repoUrl / repoPackageUrl from `@/lib/site` instead. Six");
  console.error("links rotted independently because each one was typed out at its call site.\n");
}

if (manifestErrors.length > 0) {
  failed = true;
  console.error("guard:outbound-links — published packages are missing npm metadata:\n");
  for (const line of manifestErrors) console.error(line);
  console.error(
    `\nEvery published package needs repository.url, homepage and bugs pointing at\n${REPO_SLUG}, plus a description and at least one keyword.\n`,
  );
}

if (failed) process.exit(1);

console.log(`OK: outbound repository links all resolve to ${REPO_SLUG}.`);
