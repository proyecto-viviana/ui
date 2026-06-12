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

const comparisonAxeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] as const;
const includeColorContrast = process.env.AXE_INCLUDE_CONTRAST === "1";
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
    async ({ contextSelector, tags, rules }) => {
      const axeRunner = (
        window as unknown as {
          axe: {
            run: (
              context: string,
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

      const results = await axeRunner.run(contextSelector, {
        runOnly: { type: "tag", values: tags },
        rules,
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
      rules: includeColorContrast ? {} : { "color-contrast": { enabled: false } },
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
});
