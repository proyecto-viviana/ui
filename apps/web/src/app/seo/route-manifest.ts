import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

/**
 * Every route the site serves, read out of the generated route tree.
 *
 * Build-time only — it reads from disk, so it must never reach the client or
 * the Worker bundle. It is imported by `vite.config.ts` (to emit the sitemap)
 * and by the e2e route sweep, which are the two places that need to enumerate
 * routes and must not be allowed to disagree about what the site contains.
 *
 * The list is derived rather than written down on purpose. A hand-maintained
 * array covers the routes someone remembered on the day they wrote it; the
 * 2026-07-24 audit found the site had 75 route files and one spec that visited
 * four of them, so a page could break in a build and ship. Adding a route file
 * now adds it to both the sweep and the sitemap with no second edit.
 */

const GEN = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "routeTree.gen.ts");

/**
 * A floor, not a count. It exists so that a change to the generated file's
 * shape fails loudly instead of quietly sweeping an empty list and reporting
 * green — the failure mode this whole spec is here to prevent. Raised from 60
 * to 140 when the generated `/docs` reference added 82 routes; the site parses
 * 154 today, and the gap is headroom for pages being removed one at a time, not
 * for the parser silently returning a fraction of the tree.
 */
export const MINIMUM_EXPECTED_ROUTES = 140;

export function parseRoutes(): string[] {
  const source = readFileSync(GEN, "utf8");
  const block = source.match(/export interface FileRoutesByFullPath \{([\s\S]*?)\n\}/)?.[1];
  if (!block) {
    throw new Error(
      `Could not find FileRoutesByFullPath in ${GEN}. If TanStack Router changed the ` +
        `generated shape, update this parser — do not delete the sweep.`,
    );
  }

  const found = new Set<string>();
  for (const [, route] of block.matchAll(/^\s*'([^']+)':/gm)) {
    // `/showcase` and `/showcase/` are the layout route and its index; both
    // resolve to the same URL, so the trailing slash is noise here.
    found.add(route === "/" ? "/" : route.replace(/\/$/, ""));
  }
  return [...found].sort();
}

/**
 * Routes that deliberately do not render themselves.
 *
 * `/admin` is the dev-only dashboard: its `beforeLoad` throws a redirect when
 * `import.meta.env.DEV` is false, so in a production build — which is what the
 * preview server serves — reaching it means landing on the home page. That is
 * the contract, so the sweep asserts it rather than skipping it.
 */
export const EXPECTED_REDIRECTS: Readonly<Record<string, string>> = {
  "/admin": "/",
};

/**
 * Routes to keep out of the sitemap. A sitemap is a claim that a URL is worth
 * indexing, so a route that redirects in production does not belong in one —
 * it is exactly the "soft 404" that gets a site's crawl budget cut.
 */
const SITEMAP_EXCLUDED = new Set<string>(Object.keys(EXPECTED_REDIRECTS));

export function sitemapRoutes(): string[] {
  return parseRoutes().filter((route) => !SITEMAP_EXCLUDED.has(route));
}
