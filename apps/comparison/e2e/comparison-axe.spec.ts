import { expect, test, type Locator, type Page } from "@playwright/test";
import axe from "axe-core";
import {
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
  type FrameworkName,
} from "./comparison-page";
import { clearPointer, pinComparisonTheme } from "./visual-diff";
import { comparisonEntries } from "../src/data/comparison-manifest";
import {
  COMPARISON_HARNESS_UA_TARGET_CLASS,
  COMPARISON_TARGET_SIZE_EXEMPTIONS,
  markComparisonHarnessUaTargets,
} from "./target-size-exemptions";

const comparisonAxeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] as const;
// WCAG 2.2 `target-size` (2.5.8) stays on. Compact RAC / S2 tokens under 24px
// are selector-scoped exemptions in COMPARISON_TARGET_SIZE_EXEMPTIONS — classified
// in `.claude/current/wcag-258-target-size.md` (ticket #492). Raising those
// controls to 24px would invent a size (Rule #2 / ADR 0001). D8 pair-diff is
// the certified target-size gate; axe is smoke (Rule #7).
const comparisonAxeDisabledRules = [] as const;
const comparisonAxeExcludeSelectors = COMPARISON_TARGET_SIZE_EXEMPTIONS.map(
  ({ selector }) => selector,
);
const routeFilter = new Set(
  (process.env.COMPARISON_AXE_ROUTES ?? "")
    .split(",")
    .map((route) => route.trim())
    .filter(Boolean),
);

type AxeViolationSummary = {
  id: string;
  help: string;
  impact: string | null;
  nodes: Array<{ target: string[]; html: string; failureSummary?: string }>;
};

type ComparisonAxeRoute = {
  slug: string;
  title: string;
  path: string;
};

const liveStyledRoutes = comparisonEntries
  .filter((entry) => entry.priority === "live")
  .filter((entry) => entry.layers.styled.react === "live")
  .filter((entry) => entry.layers.styled.solid === "live")
  .filter((entry) => routeFilter.size === 0 || routeFilter.has(entry.slug))
  .map((entry): ComparisonAxeRoute => {
    return {
      slug: entry.slug,
      title: entry.title,
      path: `/components/${entry.slug}/`,
    };
  });

const deterministicTimeFieldRoute: ComparisonAxeRoute = {
  slug: "timefield-deterministic",
  title: "TimeField deterministic",
  path: "/components/timefield/?size=XL&value=09%3A30%3A00&hourCycle=24&name=startTime",
};

const timeFieldDeterministicRouteEnabled =
  routeFilter.size === 0 ||
  routeFilter.has("timefield") ||
  routeFilter.has(deterministicTimeFieldRoute.slug);

function axeScopeValue(label: string) {
  return label
    .replace(/[^a-z0-9_-]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
}

async function ensureAxe(page: Page) {
  await page.addScriptTag({ content: axe.source });
  await expect(
    page.evaluate(() => typeof (window as unknown as { axe?: { run?: unknown } }).axe?.run),
  ).resolves.toBe("function");
}

async function markAxeScope(target: Locator, scope: string) {
  return target.evaluate((element, value) => {
    element.setAttribute("data-comparison-axe-scope", value);
    return `[data-comparison-axe-scope="${value}"]`;
  }, scope);
}

async function runAxe(page: Page, selector: string) {
  return page.evaluate(
    async ({ contextSelector, tags, disabledRules, excludeSelectors }) => {
      const axeRunner = (
        window as unknown as {
          axe: {
            run: (
              context: string | { include: string; exclude?: string[] },
              options: {
                runOnly: { type: "tag"; values: string[] };
                rules: Record<string, { enabled: boolean }>;
              },
            ) => Promise<{
              violations: Array<{
                id: string;
                help: string;
                impact: string | null;
                nodes: Array<{ target: string[]; html: string; failureSummary?: string }>;
              }>;
            }>;
          };
        }
      ).axe;

      const context =
        excludeSelectors.length > 0
          ? { include: contextSelector, exclude: excludeSelectors }
          : contextSelector;

      const results = await axeRunner.run(context, {
        runOnly: { type: "tag", values: tags },
        rules: Object.fromEntries(disabledRules.map((id) => [id, { enabled: false }])),
      });

      return results.violations.map((violation) => ({
        id: violation.id,
        help: violation.help,
        impact: violation.impact,
        nodes: violation.nodes.map((node) => ({
          target: node.target,
          html: node.html,
          failureSummary: node.failureSummary,
        })),
      }));
    },
    {
      contextSelector: selector,
      tags: [...comparisonAxeTags],
      disabledRules: [...comparisonAxeDisabledRules],
      excludeSelectors: [...comparisonAxeExcludeSelectors],
    },
  );
}

function violationMessage(label: string, violations: AxeViolationSummary[]) {
  return `${label} axe violations:\n${JSON.stringify(violations, null, 2)}`;
}

async function expectNoAxeViolations(page: Page, target: Locator, label: string) {
  const selector = await markAxeScope(target, axeScopeValue(label));
  const violations = await runAxe(page, selector);
  expect(violations, violationMessage(label, violations)).toEqual([]);
}

async function routePanels(page: Page) {
  const section = await styledSection(page);
  const panels: Array<{ framework: FrameworkName; locator: Locator }> = [];
  for (const framework of ["React Spectrum stack", "Solidaria stack"] as const) {
    panels.push({ framework, locator: await frameworkPanel(section, framework) });
  }
  return panels;
}

async function scanComparisonRoute(page: Page, route: ComparisonAxeRoute) {
  await pinComparisonTheme(page, "dark");
  await page.goto(route.path);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);
  await markComparisonHarnessUaTargets(page);
  await ensureAxe(page);

  await expectNoAxeViolations(page, page.locator("body"), `${route.title} full page`);
  for (const panel of await routePanels(page)) {
    await expectNoAxeViolations(page, panel.locator, `${route.title} ${panel.framework} panel`);
  }
}

test.describe("comparison app axe coverage", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(90_000);

  test("discovers live comparison routes for axe coverage", () => {
    expect(liveStyledRoutes.length, "live styled comparison routes").toBeGreaterThan(0);
  });

  for (const route of liveStyledRoutes) {
    test(`${route.title} route has no full-page or panel-scoped axe violations`, async ({
      page,
    }) => {
      await scanComparisonRoute(page, route);
    });
  }

  if (timeFieldDeterministicRouteEnabled) {
    test("TimeField deterministic route has no full-page or panel-scoped axe violations", async ({
      page,
    }) => {
      await scanComparisonRoute(page, deterministicTimeFieldRoute);
    });
  }

  if (routeFilter.size === 0 || routeFilter.has("actiongroup")) {
    test("harness UA floor marks trampolines and does not min-size ActionGroup item hosts", async ({
      page,
    }) => {
      await pinComparisonTheme(page, "dark");
      await page.goto("/components/actiongroup/");
      await waitForComparisonRouteReady(page);
      await markComparisonHarnessUaTargets(page);

      const metrics = await page.evaluate((harnessClass) => {
        const trampolines = [...document.querySelectorAll(".comparison-reference-canvas button")]
          .filter((button) => !button.closest("[data-comparison-control-root]"))
          .filter((button) => {
            const label = button.textContent?.trim();
            return label === "Before" || label === "After";
          });
        const items = [
          ...document.querySelectorAll("[data-comparison-control-root='actiongroup'] button"),
        ];
        const boxOf = (element: Element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return {
            className: element.className,
            minBlockSize: style.minBlockSize,
            minInlineSize: style.minInlineSize,
            width: rect.width,
            height: rect.height,
          };
        };
        return {
          trampolines: trampolines.map(boxOf),
          items: items.map(boxOf),
          harnessClass,
        };
      }, COMPARISON_HARNESS_UA_TARGET_CLASS);

      expect(metrics.trampolines.length).toBeGreaterThan(0);
      for (const trampoline of metrics.trampolines) {
        expect(trampoline.className.split(/\s+/)).toContain(COMPARISON_HARNESS_UA_TARGET_CLASS);
        expect(trampoline.minBlockSize).toBe("24px");
        expect(trampoline.minInlineSize).toBe("24px");
        expect(trampoline.width).toBeGreaterThanOrEqual(24);
        expect(trampoline.height).toBeGreaterThanOrEqual(24);
      }

      expect(metrics.items.length).toBeGreaterThan(0);
      for (const item of metrics.items) {
        expect(item.className.split(/\s+/)).not.toContain(COMPARISON_HARNESS_UA_TARGET_CLASS);
        expect(item.minBlockSize).not.toBe("24px");
        expect(item.minInlineSize).not.toBe("24px");
      }
    });
  }
});
