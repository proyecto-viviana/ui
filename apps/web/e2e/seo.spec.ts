import { test, expect } from "@playwright/test";
import { sitemapRoutes } from "../src/app/seo/route-manifest";
import { SITE_URL, SITE_NAME, canonicalUrl } from "../src/seo";

/**
 * Every indexable route must describe itself.
 *
 * Before the 2026-07-24 audit, exactly five route files set a `head:` and all
 * five set only a stylesheet link, so all ~72 routes shipped the one title the
 * root route declares — "Proyecto Viviana" — and the one description under it.
 * To a search engine, and to anyone with more than one tab open, the site was a
 * single page repeated seventy times.
 *
 * The fallback in `__root.tsx` is what makes that failure quiet: a route that
 * forgets its head still renders a perfectly reasonable-looking title. So the
 * check below is not "does a title exist" — it is "is this title this route's
 * own", which is the part a fallback cannot fake.
 */

const ROUTES = sitemapRoutes();

/** The root fallback. Any route still wearing it has no head of its own. */
const FALLBACK_TITLE = SITE_NAME;

test("the sitemap route list is derived and non-empty", () => {
  expect(ROUTES.length).toBeGreaterThanOrEqual(60);
  expect(ROUTES).toContain("/");
  // /admin redirects in production, so it is deliberately not indexable.
  expect(ROUTES).not.toContain("/admin");
});

test("titles are unique across the site", async ({ page }) => {
  const seen = new Map<string, string>();

  for (const route of ROUTES) {
    await page.goto(route, { waitUntil: "domcontentloaded" });
    const title = await page.title();

    if (route !== "/") {
      expect(title, `${route} is still wearing the root fallback title`).not.toBe(FALLBACK_TITLE);
    }

    const existing = seen.get(title);
    expect(existing, `${route} and ${existing} share the title "${title}"`).toBeUndefined();
    seen.set(title, route);
  }
});

for (const route of ROUTES) {
  test(`${route} has a head of its own`, async ({ page }) => {
    await page.goto(route, { waitUntil: "domcontentloaded" });

    const title = await page.title();
    expect(title.length, `${route} has no title`).toBeGreaterThan(0);
    // Long titles are truncated in a search result, which is where they matter.
    expect(title.length, `${route} title is too long to survive truncation`).toBeLessThanOrEqual(
      70,
    );
    expect(title, `${route} title should carry the site name`).toContain(SITE_NAME);

    const description = await page
      .locator('head meta[name="description"]')
      .first()
      .getAttribute("content");
    expect(description, `${route} has no meta description`).toBeTruthy();
    expect(description!.length, `${route} description is too short to be useful`).toBeGreaterThan(
      40,
    );
    expect(description!.length, `${route} description will be truncated`).toBeLessThanOrEqual(170);

    // Exactly one canonical, pointing at this route on the real origin. More
    // than one is worse than none — a search engine picks arbitrarily.
    const canonicals = page.locator('head link[rel="canonical"]');
    await expect(canonicals, `${route} should have exactly one canonical link`).toHaveCount(1);
    expect(await canonicals.getAttribute("href")).toBe(canonicalUrl(route));

    // Open Graph, so a shared link is not a bare URL.
    for (const property of ["og:title", "og:description", "og:url", "og:image"]) {
      const content = await page
        .locator(`head meta[property="${property}"]`)
        .first()
        .getAttribute("content");
      expect(content, `${route} is missing ${property}`).toBeTruthy();
    }
  });
}

test("robots.txt is served and points at the sitemap", async ({ page }) => {
  const response = await page.goto("/robots.txt");
  expect(response?.status()).toBe(200);

  const body = await response!.text();
  expect(body).toContain("User-agent: *");
  expect(body).toContain(`Sitemap: ${SITE_URL}/sitemap.xml`);
  expect(body).toContain("Disallow: /admin");
});

test("sitemap.xml lists every indexable route and nothing else", async ({ page }) => {
  const response = await page.goto("/sitemap.xml");
  expect(response?.status()).toBe(200);

  const body = await response!.text();
  const locs = [...body.matchAll(/<loc>([^<]+)<\/loc>/g)].map(([, loc]) => loc);

  expect(locs.length, "sitemap is empty").toBeGreaterThanOrEqual(60);
  expect(new Set(locs).size, "sitemap contains duplicate URLs").toBe(locs.length);
  expect([...locs].sort()).toEqual(ROUTES.map(canonicalUrl).sort());
  expect(locs.some((loc) => loc.includes("/admin"))).toBe(false);
});
