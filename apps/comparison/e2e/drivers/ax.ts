import { expect, test, type Locator } from "@playwright/test";
import { flushAnnouncements, installOracle, startAnnouncements } from "./dom-oracle";
import {
  driverCases,
  scenarioThemes,
  type DriverScenario,
  type PanelFramework,
  type TargetResolver,
} from "./scenario";
import { forEachScenarioPanel } from "./walk";

/**
 * Driver D6 — accessibility tree & announcements (see `.claude/current/certification.md`).
 *
 * The semantics tier the style/pixel/event drivers cannot see: what a screen
 * reader actually perceives. Two halves, both exact pair-oracle assertions.
 *
 * - **AX tree (resting structure).** For each configured root, Playwright's
 *   `ariaSnapshot()` yields the accessibility tree Chromium exposes — roles,
 *   accessible names, and bracketed states (`[checked]`, `[expanded]`,
 *   `[disabled]`, `[level=N]`, `[selected]`, …) — as stable YAML. The same
 *   Chromium computes both panels, so identical DOM semantics produce identical
 *   YAML; any divergence is a real role/name/state difference. `ariaSnapshot`
 *   omits the accessible *description*, so a second `evaluate` pass captures
 *   `{role, name, description}` for every element carrying an
 *   `aria-describedby` / `aria-description`, covering the spec's description
 *   field. Both are diffed as JSON.
 * - **Announcements (live transcript).** Each `announce` trigger scripts an
 *   interaction expected to speak (a ComboBox result count, a Toast, a
 *   validation error). The oracle's MutationObserver records the ordered
 *   live-region transcript on each panel; the two must match text-for-text.
 *   Insertion timing (`atMs`) is stripped from the assertion — it drifts
 *   between stacks (the announcer's lazy 100ms first-announce delay lands on
 *   different frames), the same way D2 excludes hashed keyframe names.
 *
 * Semantics are theme-independent, so D6 runs the first scenario theme only.
 * Overlay components point a root at their portal (`page.getByRole("dialog")`)
 * since it renders outside the panel canvas; `beforePanel` opens it first.
 */

const axSettleMs = 120;
const defaultAnnounceSettleMs = 500;

interface AxDescription {
  role: string | null;
  name: string;
  description: string;
}

interface AxRootSnapshot {
  root: string;
  aria: string;
  descriptions: AxDescription[];
}

interface AnnouncementEntry {
  text: string;
  live: string;
  role: string | null;
  scope: string;
}

/**
 * Captures `{role, name, description}` for every element under `root` that
 * exposes an accessible description (`aria-describedby` → referenced text, or
 * `aria-description`). `ariaSnapshot` drops descriptions, so this pass restores
 * the spec's description signal. Names/descriptions are resolved the same way a
 * screen reader computes them, and sorted so the list is order-stable across
 * stacks (DOM order of described elements is an implementation detail).
 */
async function snapshotDescriptions(root: Locator): Promise<AxDescription[]> {
  return root.evaluate((el) => {
    const norm = (value: string | null | undefined): string =>
      (value ?? "").replace(/\s+/g, " ").trim();
    const refText = (ids: string): string =>
      ids
        .split(/\s+/)
        .map((id) => document.getElementById(id)?.textContent ?? "")
        .join(" ");
    const nameOf = (node: Element): string => {
      const ariaLabel = node.getAttribute("aria-label");
      if (ariaLabel) {
        return norm(ariaLabel).slice(0, 80);
      }
      const labelledBy = node.getAttribute("aria-labelledby");
      if (labelledBy) {
        const text = norm(refText(labelledBy));
        if (text) {
          return text.slice(0, 80);
        }
      }
      return norm(node.textContent).slice(0, 80);
    };
    const descriptionOf = (node: Element): string => {
      const describedBy = node.getAttribute("aria-describedby");
      if (describedBy) {
        const text = norm(refText(describedBy));
        if (text) {
          return text;
        }
      }
      return norm(node.getAttribute("aria-description"));
    };
    const out: Array<{ role: string | null; name: string; description: string }> = [];
    for (const node of [el, ...Array.from(el.querySelectorAll("*"))]) {
      const description = descriptionOf(node);
      if (!description) {
        continue;
      }
      out.push({ role: node.getAttribute("role"), name: nameOf(node), description });
    }
    const keyOf = (entry: { role: string | null; name: string; description: string }): string =>
      `${entry.role ?? ""}|${entry.name}|${entry.description}`;
    out.sort((a, b) => keyOf(a).localeCompare(keyOf(b)));
    return out;
  });
}

export function registerAxTreeDriver(scenario: DriverScenario) {
  const config = scenario.ax;
  if (!config) {
    throw new Error(`Scenario "${scenario.slug}" has no ax (D6) config`);
  }
  const roots: Record<string, TargetResolver> = config.roots ?? {
    panel: (ctx) => ctx.canvas,
  };
  const cases = driverCases(scenario, config.cases);

  test.describe(`D6 AX tree — ${scenario.title}`, () => {
    for (const caseDef of cases) {
      test(`${caseDef.id}`, async ({ page }) => {
        const divergence = config.knownDivergences?.[caseDef.id];
        if (divergence) {
          test.fixme(true, divergence);
        }
        test.setTimeout(120_000);
        const theme = scenarioThemes(scenario, caseDef)[0];
        const snaps: Partial<Record<PanelFramework, AxRootSnapshot[]>> = {};

        await forEachScenarioPanel(page, scenario, caseDef, theme, async (ctx) => {
          const rootSnaps: AxRootSnapshot[] = [];
          for (const [name, resolver] of Object.entries(roots)) {
            const rootLocator = resolver(ctx);
            await expect(rootLocator).toBeVisible();
            await ctx.page.waitForTimeout(axSettleMs);
            rootSnaps.push({
              root: name,
              aria: await rootLocator.ariaSnapshot(),
              descriptions: await snapshotDescriptions(rootLocator),
            });
          }
          snaps[ctx.framework] = rootSnaps;
        });

        expect(JSON.stringify(snaps.solid, null, 2)).toBe(JSON.stringify(snaps.react, null, 2));
      });
    }
  });

  if (config.announce && config.announce.length > 0) {
    test.describe(`D6 announcements — ${scenario.title}`, () => {
      for (const caseDef of cases) {
        for (const trigger of config.announce!) {
          test(`${caseDef.id} · ${trigger.id}`, async ({ page }) => {
            if (trigger.knownDivergence) {
              test.fixme(true, trigger.knownDivergence);
            }
            test.setTimeout(120_000);
            const theme = scenarioThemes(scenario, caseDef)[0];
            const logs: Partial<Record<PanelFramework, AnnouncementEntry[]>> = {};

            await forEachScenarioPanel(page, scenario, caseDef, theme, async (ctx) => {
              const target = scenario.target(ctx);
              await installOracle(ctx.page, ctx.canvas);
              await startAnnouncements(ctx.page);
              await trigger.run({ ...ctx, target });
              await ctx.page.waitForTimeout(trigger.settleMs ?? defaultAnnounceSettleMs);
              const raw = await flushAnnouncements(ctx.page);
              // atMs is stack-dependent (flaky insertion timing); assert on the
              // ordered text + politeness + role, not the millisecond.
              logs[ctx.framework] = raw.map(({ text, live, role, scope }) => ({
                text,
                live,
                role,
                scope,
              }));
            });

            expect(JSON.stringify(logs.solid, null, 2)).toBe(JSON.stringify(logs.react, null, 2));
          });
        }
      }
    });
  }
}
