import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { routes } from "./helpers/routes";

const runAxe = process.env.RUN_AXE === "1";
const includeContrast = process.env.AXE_INCLUDE_CONTRAST === "1";
const SECTION_SELECTOR = 'section[data-testid^="section-"]';

async function setTheme(page: Page, theme: "dark" | "light") {
  await page.evaluate((targetTheme) => {
    localStorage.setItem("pv-theme", targetTheme);
  }, theme);
  await page.reload();
  await page.waitForFunction(
    (targetTheme) => document.documentElement.getAttribute("data-theme") === targetTheme,
    theme,
  );
}

async function showAllSections(page: Page) {
  const showAll = page.getByTestId("show-all-sections");
  await expect(showAll).toBeVisible();

  // SSR renders the button before hydration; retry to ensure at least one click
  // lands after event handlers are attached.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await showAll.click({ force: true });
    try {
      await expect
        .poll(() => page.locator(SECTION_SELECTOR).count(), { timeout: 10_000 })
        .toBeGreaterThan(0);
      break;
    } catch (error) {
      if (attempt === 2) throw error;
    }
  }

  // Wait for broad section coverage without relying on exact total.
  await expect
    .poll(() => page.locator(SECTION_SELECTOR).count(), { timeout: 45_000 })
    .toBeGreaterThan(30);
}

async function runAxeScan(page: Page, tags: string[], options: { disabledRules?: string[] } = {}) {
  let builder = new AxeBuilder({ page }).withTags(tags);
  if (options.disabledRules?.length) {
    builder = builder.disableRules(options.disabledRules);
  }
  return builder.analyze();
}

function logViolations(
  scope: string,
  violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"],
) {
  if (violations.length === 0) return;
  console.log(`\n${scope} violations (${violations.length}):`);
  for (const violation of violations) {
    console.log(`  - ${violation.id}: ${violation.help} (${violation.nodes.length} nodes)`);
    for (const node of violation.nodes) {
      const target = node.target?.join(" > ") ?? "<unknown>";
      console.log(`    target: ${target}`);
      if (node.html) {
        console.log(`    html: ${node.html}`);
      }
      if (node.failureSummary) {
        console.log(`    summary: ${node.failureSummary.replace(/\n+/g, " ")}`);
      }
    }
  }
}

// Accessibility automation that scans every section in the playground.
// Runs in both dark and light modes to catch contrast issues in each theme.
// Tests multiple strictness levels to provide a full audit.

test.describe("Playground accessibility (axe scan)", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(120_000);
  const aaDisabledRules = includeContrast ? [] : ["color-contrast"];

  for (const theme of ["dark", "light"] as const) {
    // Level 1: WCAG 2.1 A + AA (the standard bar — must pass)
    test(`[${theme}] WCAG 2.1 AA — zero violations`, async ({ page }) => {
      test.skip(!runAxe, "Queued until RUN_AXE=1");
      await page.goto(routes.playground);
      await setTheme(page, theme);
      await showAllSections(page);

      const results = await runAxeScan(page, ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"], {
        disabledRules: aaDisabledRules,
      });
      expect(results.violations).toEqual([]);
    });

    // Level 2: WCAG 2.2 AA (latest standard)
    test(`[${theme}] WCAG 2.2 AA — zero violations`, async ({ page }) => {
      test.skip(!runAxe, "Queued until RUN_AXE=1");
      await page.goto(routes.playground);
      await setTheme(page, theme);
      await showAllSections(page);

      const results = await runAxeScan(
        page,
        ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"],
        { disabledRules: aaDisabledRules },
      );
      expect(results.violations).toEqual([]);
    });

    // Level 3: Best practices (axe recommendations beyond WCAG)
    test(`[${theme}] best-practices — zero violations`, async ({ page }) => {
      test.skip(!runAxe, "Queued until RUN_AXE=1");
      await page.goto(routes.playground);
      await setTheme(page, theme);
      await showAllSections(page);

      const results = await runAxeScan(page, ["best-practice"]);
      logViolations(`[${theme}] best-practice`, results.violations);
      expect(results.violations).toEqual([]);
    });

    // Level 4: WCAG AAA
    test(`[${theme}] WCAG 2.1 AAA — zero violations`, async ({ page }) => {
      test.skip(!runAxe, "Queued until RUN_AXE=1");
      await page.goto(routes.playground);
      await setTheme(page, theme);
      await showAllSections(page);

      const results = await runAxeScan(page, ["wcag2aaa", "wcag21aaa"]);
      logViolations(`[${theme}] WCAG AAA`, results.violations);
      expect(results.violations).toEqual([]);
    });

    // Level 5: Experimental rules
    test(`[${theme}] experimental rules — zero violations`, async ({ page }) => {
      test.skip(!runAxe, "Queued until RUN_AXE=1");
      await page.goto(routes.playground);
      await setTheme(page, theme);
      await showAllSections(page);

      const results = await runAxeScan(page, ["experimental"]);
      logViolations(`[${theme}] experimental`, results.violations);
      expect(results.violations).toEqual([]);
    });
  }
});
