import { test, expect, type Page } from "@playwright/test";
import { ALL_ROUTES, EXPECTED_REDIRECTS, MINIMUM_EXPECTED_ROUTES } from "./helpers/all-routes";

/**
 * Visit every route once and assert it is actually a page.
 *
 * This is the cheapest possible safety net and the one the site did not have.
 * It does not check that a page is *correct* — it checks that it responds 200,
 * renders content, and hydrates without throwing. A broken import, a null deref
 * in a route component, or a server-render crash on a page nobody clicked
 * through would previously have reached production unseen.
 */

/** A subresource that failed to load is the network's problem, not the page's. */
const RESOURCE_FAILURE = /Failed to load resource|net::ERR_|ERR_NAME_NOT_RESOLVED/;

function captureErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on("pageerror", (err) => errors.push(`pageerror: ${err.message}`));
  page.on("console", (msg) => {
    if (msg.type() !== "error") return;
    const text = msg.text();
    // Fonts come from a remote @import, so an offline or throttled run would
    // otherwise fail every route for a reason that has nothing to do with it.
    if (RESOURCE_FAILURE.test(text)) return;
    errors.push(`console: ${text}`);
  });
  return errors;
}

test("the route list is derived from the generated tree and is not empty", () => {
  expect(
    ALL_ROUTES.length,
    `Parsed ${ALL_ROUTES.length} routes from routeTree.gen.ts. A sweep over an ` +
      `empty or truncated list passes without testing anything.`,
  ).toBeGreaterThanOrEqual(MINIMUM_EXPECTED_ROUTES);
  expect(ALL_ROUTES).toContain("/");
  expect(ALL_ROUTES).toContain("/solid-spectrum/docs/installation");
});

for (const route of ALL_ROUTES) {
  const redirectsTo = EXPECTED_REDIRECTS[route];

  test(`${route} renders`, async ({ page }) => {
    const errors = captureErrors(page);

    const response = await page.goto(route, { waitUntil: "domcontentloaded" });
    expect(response, `no response for ${route}`).not.toBeNull();
    expect(response!.status(), `${route} returned ${response!.status()}`).toBe(200);

    if (redirectsTo) {
      await expect
        .poll(() => new URL(page.url()).pathname, {
          message: `${route} should redirect to ${redirectsTo} in a production build`,
        })
        .toBe(redirectsTo);
    } else {
      expect(new URL(page.url()).pathname.replace(/\/$/, "") || "/").toBe(route);

      // The root ErrorBoundary answers 200 with a full page of text, so status
      // and length alone cannot tell a working route from a thrown one. This is
      // the assertion that separates them; the rest are backstops.
      const boundary = page.getByTestId("route-error-boundary");
      if (await boundary.count()) {
        throw new Error(`${route} rendered the error boundary: ${await boundary.innerText()}`);
      }

      // Enough text to rule out an empty shell, which also reads as a working 200.
      const text = (await page.locator("body").innerText()).trim();
      expect(text.length, `${route} rendered almost no text`).toBeGreaterThan(80);
      await expect(page.locator("main, [role='main'], #main-content").first()).toBeAttached();
    }

    // Hydration happens after DOMContentLoaded; give it a beat to throw.
    await page.waitForLoadState("networkidle").catch(() => {});
    expect(errors, `${route} logged errors:\n${errors.join("\n")}`).toEqual([]);
  });
}
