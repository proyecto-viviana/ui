/**
 * The route sweep's view of the site.
 *
 * The parser itself lives in `src/app/seo/route-manifest.ts` because the
 * sitemap generator needs the same list. Two independent readers of
 * `routeTree.gen.ts` could disagree about what the site contains, and the one
 * that disagreed quietly would be the sitemap — advertising URLs nothing tests,
 * or testing URLs nothing advertises.
 */
export { EXPECTED_REDIRECTS, MINIMUM_EXPECTED_ROUTES } from "../../src/app/seo/route-manifest";

import { parseRoutes } from "../../src/app/seo/route-manifest";

export const ALL_ROUTES: readonly string[] = parseRoutes();
