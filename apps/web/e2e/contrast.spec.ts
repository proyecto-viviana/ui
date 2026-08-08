import AxeBuilder from "@axe-core/playwright";
import { test, expect, type Page } from "@playwright/test";
import { ALL_ROUTES } from "./helpers/all-routes";
import { CONTRAST_EXEMPTIONS } from "./helpers/contrast-exemptions";

/**
 * Colour contrast, every route, both themes.
 *
 * `playground-axe.spec.ts` runs the full WCAG rule set against every rendered
 * component section on `/solid-spectrum/playground`. This sweep complements it
 * by covering every generated route, including page chrome outside the
 * playground.
 *
 * This spec closes both halves. It enables `color-contrast` and nothing else —
 * a narrow rule over a wide surface, which is the opposite trade to the
 * playground scan and complements it exactly.
 *
 * One test per route so Playwright's workers shard it; both themes run inside
 * the test because the theme is a `localStorage` value read before paint, and
 * re-navigating is cheaper than a second worker.
 */

const runAxe = process.env.RUN_AXE === "1";

/**
 * Contrast is measured against what a sighted user actually sees, so a rule
 * this absolute needs its exemptions written down rather than assumed. Every
 * entry names the element, the reason WCAG 1.4.3 does not apply to it, and the
 * evidence — an empty list here would be the honest default, and each addition
 * has to earn its place.
 */
async function setTheme(page: Page, theme: "dark" | "light") {
  await page.evaluate((target) => {
    localStorage.setItem("pv-theme", target);
  }, theme);
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForFunction(
    (target) => document.documentElement.getAttribute("data-color-scheme") === target,
    theme,
  );
}

/**
 * axe reports the ratio, then the colours, then the requirement. Reading them
 * back out turns "17,419 nodes" into a handful of colour pairs, which is the
 * form a token fix is actually made in.
 */
const SUMMARY =
  /contrast of ([\d.]+).*?foreground color: (#[0-9a-f]+).*?background color: (#[0-9a-f]+).*?Expected contrast ratio of ([\d.]+):1/is;

function describe(
  theme: string,
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
): string[] {
  const lines: string[] = [];
  for (const violation of violations) {
    for (const node of violation.nodes) {
      const summary = (node.failureSummary ?? "").replace(/\s+/g, " ");
      const parsed = SUMMARY.exec(summary);
      const measured = parsed
        ? `${parsed[2]} on ${parsed[3]} = ${parsed[1]} (needs ${parsed[4]})`
        : summary.slice(0, 160);
      lines.push(
        `  [${theme}] ${measured}\n      ${node.target.join(" > ")}\n      ${node.html.slice(0, 140)}`,
      );
    }
  }
  return lines;
}

for (const route of ALL_ROUTES) {
  test(`${route} — colour contrast in both themes`, async ({ page }) => {
    test.skip(!runAxe, "Queued until RUN_AXE=1");
    test.setTimeout(90_000);

    const failures: string[] = [];

    for (const theme of ["light", "dark"] as const) {
      await page.goto(route, { waitUntil: "networkidle" });
      await setTheme(page, theme);

      let builder = new AxeBuilder({ page }).withRules(["color-contrast"]);
      for (const { selector } of CONTRAST_EXEMPTIONS) {
        builder = builder.exclude(selector);
      }
      failures.push(...describe(theme, (await builder.analyze()).violations));
    }

    expect(failures, `${route} has text below WCAG AA contrast:\n${failures.join("\n")}`).toEqual(
      [],
    );
  });
}
