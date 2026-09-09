import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { EXAMPLES } from "../src/components/examples/registry";

/**
 * The /examples screens, per slug and per colour scheme.
 *
 * These pages are the register's product-scale proof, so their failure modes
 * are the ones a demo screen actually has: a screen that throws and answers
 * 200 through the root boundary, a heading structure that lost or doubled its
 * h1, a missing main landmark, an axe regression that only appears in one
 * scheme, a second fuchsia call-to-action stealing the one ask the screen is
 * allowed (DECISIONS C-1), and a control small enough to fail WCAG 2.2 2.5.8.
 *
 * The fuchsia check resolves `--accent-cta` at runtime rather than hard-coding
 * a colour, so a token change moves the assertion with it instead of silently
 * measuring nothing.
 */

const AXE_TAGS = ["wcag2a", "wcag2aa", "wcag22aa"];

/** WCAG 2.2 2.5.8 minimum target, in CSS pixels. */
const MIN_TARGET = 24;

async function setTheme(page: Page, theme: "dark" | "light") {
  await page.evaluate((target) => localStorage.setItem("pv-theme", target), theme);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.waitForFunction(
    (target) => document.documentElement.getAttribute("data-color-scheme") === target,
    theme,
  );
}

/**
 * The CTA fill, resolved at runtime, and every control painted with it.
 *
 * `--accent-cta` is read off the examples root, not `<html>`: the register
 * redeclares its ramp per colour scheme on the scheme-carrying container, and
 * reading the root returns the light value under a dark page — which silently
 * matches nothing and turns this whole check into a no-op.
 */
async function fuchsiaFills(page: Page): Promise<{ cta: string; filled: string[] }> {
  return page.evaluate(() => {
    const root = document.querySelector("[data-examples]") ?? document.documentElement;
    const probe = document.createElement("span");
    probe.style.display = "none";
    root.append(probe);
    probe.style.backgroundColor = getComputedStyle(root).getPropertyValue("--accent-cta").trim();
    const cta = getComputedStyle(probe).backgroundColor;
    probe.remove();

    const filled: string[] = [];
    for (const el of document.querySelectorAll("button, a, [role=button]")) {
      if (getComputedStyle(el).backgroundColor === cta) {
        filled.push(el.textContent?.trim().slice(0, 40) || el.tagName);
      }
    }
    return { cta, filled };
  });
}

/** Every visible interactive element's rendered box, smallest first. */
async function undersizedTargets(page: Page): Promise<string[]> {
  return page.evaluate((min) => {
    const selector = "button, a[href], input, select, textarea, [role=button], [tabindex='0']";
    const small: string[] = [];
    for (const el of document.querySelectorAll(selector)) {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;
      const box = el.getBoundingClientRect();
      // A zero box is an off-screen or unrendered control, not a small one;
      // 2.5.8 also exempts a target inline in a sentence of text.
      if (box.width === 0 && box.height === 0) continue;
      if (style.display === "inline") continue;
      if (box.width < min || box.height < min) {
        small.push(
          `${el.tagName.toLowerCase()} "${el.textContent?.trim().slice(0, 30) ?? ""}" ` +
            `${Math.round(box.width)}x${Math.round(box.height)}`,
        );
      }
    }
    return small;
  }, MIN_TARGET);
}

for (const example of EXAMPLES) {
  const slug = example.slug;
  for (const theme of ["dark", "light"] as const) {
    test(`[${theme}] /examples/${slug} renders clean`, async ({ page }) => {
      const path = `/examples/${slug}`;
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      expect(response, `no response for ${path}`).not.toBeNull();
      expect(response!.status(), `${path} returned ${response!.status()}`).toBe(200);
      await setTheme(page, theme);

      // The root ErrorBoundary answers 200, so status alone proves nothing.
      const boundary = page.getByTestId("route-error-boundary");
      expect(await boundary.count(), `${path} rendered the error boundary`).toBe(0);

      await expect(page.locator("main, [role=main]").first()).toBeAttached();
      await expect(page.locator("h1")).toHaveCount(1);

      // DECISIONS C-1: one filled fuchsia ask per screen, never two.
      const { cta, filled } = await fuchsiaFills(page);
      expect(cta, `${path}: --accent-cta did not resolve, so nothing was measured`).not.toBe(
        "rgba(0, 0, 0, 0)",
      );
      expect(
        filled.length,
        `${path} shows ${filled.length} fuchsia-filled asks: ${filled.join(" | ")}`,
      ).toBeLessThanOrEqual(1);
      // A screen whose shell carries the filled ask must actually paint it —
      // otherwise a shell that stopped rendering the CTA would pass the cap.
      if (example.fuchsiaFill === "+ Create") {
        expect(filled.length, `${path} lost its filled "+ Create" ask`).toBe(1);
      }

      const small = await undersizedTargets(page);
      expect(small, `${path} has targets under ${MIN_TARGET}px:\n${small.join("\n")}`).toEqual([]);

      const results = await new AxeBuilder({ page }).withTags(AXE_TAGS).analyze();
      const summary = results.violations
        .map((v) => `${v.id} (${v.nodes.length}): ${v.help}`)
        .join("\n");
      expect(results.violations.length, `${path} axe violations:\n${summary}`).toBe(0);
    });
  }
}
