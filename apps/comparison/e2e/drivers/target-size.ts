import { expect, test, type Locator } from "@playwright/test";
import { scenarioThemes, type DriverScenario, type PanelFramework } from "./scenario";
import { forEachScenarioPanel } from "./walk";

/**
 * Driver D8 — pointer target size (recertification.md Phase 1).
 *
 * Every interactive element in the component subtree is measured for its
 * rendered border-box across the scenario's size cases, and the two stacks are
 * pair-diffed (port == upstream). Target size is theme- and state-independent
 * (a hit box does not change on hover, and `pressScale` is a transient
 * transform, not a layout change), so D8 runs the first theme at the resting
 * default state only — the size axis lives in the scenario's prop cases.
 *
 * The pair-oracle diff is the hard gate. The WCAG 2.5.8 (24px) floor and 2.5.5
 * (44px) enhanced target are computed and attached as a per-stack report, for
 * the same parity reason as D7: an undersized control that faithfully matches
 * upstream is an upstream note (2.5.8's inline/essential exceptions also apply),
 * not a port defect — a port-only shrink is caught by the pair diff. Tier-6
 * custom surfaces (no upstream pair) promote the 24px floor to a hard assertion
 * via `targetSize.assert24`.
 */

interface SizeEntry {
  /** Stack-agnostic locator: tag + role + accessible name. */
  descriptor: string;
  width: number;
  height: number;
  meets24: boolean;
  meets44: boolean;
}

async function captureTargetSizes(root: Locator): Promise<SizeEntry[]> {
  return root.evaluate((rootEl) => {
    const interactiveSelector = [
      "button",
      "a[href]",
      "input:not([type=hidden])",
      "select",
      "textarea",
      "[role=button]",
      "[role=link]",
      "[role=checkbox]",
      "[role=radio]",
      "[role=switch]",
      "[role=tab]",
      "[role=menuitem]",
      "[role=menuitemcheckbox]",
      "[role=menuitemradio]",
      "[role=option]",
      "[role=slider]",
      "[role=spinbutton]",
    ].join(",");

    const norm = (value: string | null | undefined): string =>
      (value ?? "").replace(/\s+/g, " ").trim();

    const nameOf = (node: Element): string => {
      const ariaLabel = node.getAttribute("aria-label");
      if (ariaLabel) {
        return norm(ariaLabel).slice(0, 40);
      }
      const labelledBy = node.getAttribute("aria-labelledby");
      if (labelledBy) {
        const text = labelledBy
          .split(/\s+/)
          .map((id) => document.getElementById(id)?.textContent ?? "")
          .join(" ");
        if (norm(text)) {
          return norm(text).slice(0, 40);
        }
      }
      return norm(node.textContent).slice(0, 40);
    };

    const descriptorOf = (node: Element): string => {
      const tag = node.tagName.toLowerCase();
      const role = node.getAttribute("role");
      return `${tag}${role ? `[${role}]` : ""}:${nameOf(node)}`;
    };

    const isVisible = (node: Element): boolean => {
      const style = getComputedStyle(node);
      if (style.visibility === "hidden" || style.display === "none") {
        return false;
      }
      if (typeof (node as { checkVisibility?: () => boolean }).checkVisibility === "function") {
        if (!(node as unknown as { checkVisibility: () => boolean }).checkVisibility()) {
          return false;
        }
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const round = (value: number): number => Math.round(value * 100) / 100;

    const candidates = [rootEl, ...Array.from(rootEl.querySelectorAll("*"))].filter(
      (node) => node.matches(interactiveSelector) && isVisible(node),
    );

    const entries: SizeEntry[] = candidates.map((node) => {
      const rect = node.getBoundingClientRect();
      const width = round(rect.width);
      const height = round(rect.height);
      return {
        descriptor: descriptorOf(node),
        width,
        height,
        meets24: width >= 24 && height >= 24,
        meets44: width >= 44 && height >= 44,
      };
    });

    // Order-stabilize: DOM order already aligns the stacks, but a stable sort
    // by descriptor makes a failing diff read cleanly regardless of any single
    // reordered node.
    entries.sort((a, b) => a.descriptor.localeCompare(b.descriptor));
    return entries;
  });
}

export function registerTargetSizeDriver(scenario: DriverScenario) {
  const config = scenario.targetSize;
  if (!config) {
    throw new Error(`Scenario "${scenario.slug}" has no targetSize (D8) config`);
  }
  const cases = config.cases
    ? scenario.cases.filter((c) => config.cases!.includes(c.id))
    : scenario.cases;

  test.describe(`D8 target size — ${scenario.title}`, () => {
    for (const caseDef of cases) {
      const theme = scenarioThemes(scenario, caseDef)[0];
      test(`${caseDef.id}`, async ({ page }, testInfo) => {
        test.setTimeout(120_000);

        const captures: Partial<Record<PanelFramework, SizeEntry[]>> = {};

        await forEachScenarioPanel(page, scenario, caseDef, theme, async (ctx) => {
          const root = config.root?.(ctx) ?? scenario.pixelTarget?.(ctx) ?? ctx.canvas;
          await expect(root).toBeVisible();
          captures[ctx.framework] = await captureTargetSizes(root);
        });

        // WCAG report: an under-24px control present in BOTH stacks is an
        // upstream note (attached), not a port defect; a port-only shrink is
        // caught by the pair diff. `assert24` promotes it to hard.
        const sub24 = (captures.solid ?? [])
          .filter((entry) => !entry.meets24)
          .map((entry) => `${entry.descriptor} · ${entry.width}×${entry.height}`);
        if (sub24.length > 0) {
          testInfo.annotations.push({
            type: config.assert24
              ? "target-size-sub-24 (asserted)"
              : "target-size-sub-24 (reported)",
            description: sub24.join("\n"),
          });
        }

        expect(
          captures.solid?.length ?? 0,
          "target-size driver measured no interactive elements — check the root resolver",
        ).toBeGreaterThan(0);

        expect(JSON.stringify(captures.solid, null, 2)).toBe(
          JSON.stringify(captures.react, null, 2),
        );

        if (config.assert24 && sub24.length > 0) {
          throw new Error(`D8 24px floor failed (Tier-6 assert):\n${sub24.join("\n")}`);
        }
      });
    }
  });
}
