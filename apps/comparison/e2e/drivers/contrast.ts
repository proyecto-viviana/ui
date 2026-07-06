import { expect, test, type Locator } from "@playwright/test";
import {
  scenarioThemes,
  type DriverScenario,
  type GestureStateId,
  type PanelFramework,
} from "./scenario";
import { walkScenario, type WalkStepContext } from "./walk";

/**
 * Driver D7 — text contrast (recertification.md Phase 1).
 *
 * Rides the same panel-major walk as D1/D3: for every gesture state × theme,
 * every text-bearing element in the component subtree is measured for its
 * WCAG contrast ratio (composited foreground over composited effective
 * background), and the two stacks are pair-diffed. Because the two panels
 * render in the same browser on the same page, equal styling yields an equal
 * ratio to the last decimal; any divergence is a real color difference the
 * pixel driver might round away at a glyph edge but a screen-reader-blind user
 * would feel as a legibility gap.
 *
 * The pair-oracle diff is the hard gate. The WCAG AA floor (4.5 normal / 3.0
 * large) and AAA target (7.0 / 4.5) are computed and attached as a per-stack
 * report: parity is the rule, so a ratio below AA in *both* stacks is an
 * upstream note (surfaced for review), not a port defect — a port-only drop is
 * already caught by the pair diff. `contrast.assertAA` promotes AA to a hard
 * assertion for Tier-6 custom surfaces that have no upstream pair to diff.
 *
 * Background compositing mirrors WCAG/axe: foreground and every ancestor
 * background are alpha-composited (`over`) until opaque, then over white. A
 * node whose effective background carries a `background-image` (gradient,
 * sprite) is uncomputable and recorded as `bg: "image"` with a null ratio —
 * identically on both stacks, so the pair diff still holds on that marker.
 *
 * FORM-CONTROL VALUE TEXT: a `<textarea>`'s visible text is its `.value`, which
 * may live either as a child text node (React syncs value → children as an
 * implementation detail) or purely as the `.value` DOM property (the idiomatic
 * SolidJS binding — no child node). Both paint identical glyphs with identical
 * color, but a text-node walk only "sees" the former, so it would measure
 * React's textarea and silently skip the port's. We therefore source a
 * `<textarea>`'s text from `.value` on BOTH stacks (bypassing the child-node
 * check for that element), so the pair diff compares the same perceptual text.
 */

interface ContrastEntry {
  /** Stack-agnostic locator: tag + role + a slice of the text. */
  descriptor: string;
  fg: string;
  bg: string;
  /** WCAG ratio rounded to 2dp, or null when the background is an image. */
  ratio: number | null;
  largeText: boolean;
  aa: boolean | null;
  aaa: boolean | null;
}

async function captureContrast(root: Locator): Promise<ContrastEntry[]> {
  return root.evaluate((rootEl) => {
    type Rgba = { r: number; g: number; b: number; a: number };

    const parse = (value: string): Rgba => {
      // Chromium serializes color/background-color as `rgb(r, g, b)` or
      // `rgba(r, g, b, a)`; `transparent` collapses to `rgba(0, 0, 0, 0)`.
      const match = value.match(/rgba?\(([^)]+)\)/i);
      if (!match) {
        return { r: 0, g: 0, b: 0, a: 0 };
      }
      const parts = match[1].split(/[,/]/).map((p) => parseFloat(p.trim()));
      return { r: parts[0], g: parts[1], b: parts[2], a: parts[3] === undefined ? 1 : parts[3] };
    };

    // `f` (front) composited over `b` (back) — standard source-over.
    const over = (f: Rgba, b: Rgba): Rgba => {
      const a = f.a + b.a * (1 - f.a);
      if (a === 0) {
        return { r: 0, g: 0, b: 0, a: 0 };
      }
      const blend = (fc: number, bc: number) => (fc * f.a + bc * b.a * (1 - f.a)) / a;
      return { r: blend(f.r, b.r), g: blend(f.g, b.g), b: blend(f.b, b.b), a };
    };

    const white: Rgba = { r: 255, g: 255, b: 255, a: 1 };

    const luminance = (c: Rgba): number => {
      const lin = (v: number) => {
        const s = v / 255;
        return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
      };
      return 0.2126 * lin(c.r) + 0.7152 * lin(c.g) + 0.0722 * lin(c.b);
    };

    const ratioOf = (fg: Rgba, bg: Rgba): number => {
      const l1 = luminance(fg);
      const l2 = luminance(bg);
      const hi = Math.max(l1, l2) + 0.05;
      const lo = Math.min(l1, l2) + 0.05;
      return hi / lo;
    };

    const rgbString = (c: Rgba): string =>
      `rgb(${Math.round(c.r)}, ${Math.round(c.g)}, ${Math.round(c.b)})`;

    // Effective background: composite each ancestor's background-color from the
    // node upward until opaque, then over white. Returns null when any layer
    // still contributing carries a background-image we cannot resolve.
    const effectiveBackground = (node: Element): Rgba | null => {
      let acc: Rgba = { r: 0, g: 0, b: 0, a: 0 };
      let cursor: Element | null = node;
      while (cursor) {
        const style = getComputedStyle(cursor);
        if (style.backgroundImage && style.backgroundImage !== "none") {
          return null;
        }
        const bg = parse(style.backgroundColor);
        if (bg.a > 0) {
          acc = over(acc, bg);
          if (acc.a >= 0.999) {
            return acc;
          }
        }
        cursor = cursor.parentElement;
      }
      return over(acc, white);
    };

    const hasDirectText = (node: Element): boolean => {
      for (const child of Array.from(node.childNodes)) {
        if (child.nodeType === Node.TEXT_NODE && (child.textContent ?? "").trim().length > 0) {
          return true;
        }
      }
      return false;
    };

    const isVisible = (node: Element): boolean => {
      const style = getComputedStyle(node);
      if (style.visibility === "hidden" || style.display === "none" || style.opacity === "0") {
        return false;
      }
      const rect = node.getBoundingClientRect();
      return rect.width > 0 && rect.height > 0;
    };

    const norm = (value: string | null | undefined): string =>
      (value ?? "").replace(/\s+/g, " ").trim();

    // A `<textarea>`'s displayed text is its `.value`, regardless of whether it
    // is also mirrored into a child text node (React) or held only as the DOM
    // property (idiomatic SolidJS). Return it as the text source so the pair
    // diff measures the same glyphs on both stacks; null for any other element.
    const formControlText = (node: Element): string | null =>
      node.tagName === "TEXTAREA" ? (node as HTMLTextAreaElement).value : null;

    const descriptorOf = (node: Element, textOverride?: string | null): string => {
      const tag = node.tagName.toLowerCase();
      const role = node.getAttribute("role");
      const text = norm(textOverride ?? node.textContent).slice(0, 32);
      return `${tag}${role ? `[${role}]` : ""}:${text}`;
    };

    const entries: ContrastEntry[] = [];
    const walk = [rootEl, ...Array.from(rootEl.querySelectorAll("*"))];
    for (const node of walk) {
      const controlText = formControlText(node);
      // Bear text either via a direct text-node child (normal elements) or via a
      // form control's `.value` (textarea). Form controls bypass the child-node
      // check so the port's property-bound value is measured like React's.
      const bearsText = controlText !== null ? controlText.trim().length > 0 : hasDirectText(node);
      if (!bearsText || !isVisible(node)) {
        continue;
      }
      const style = getComputedStyle(node);
      const fgColor = parse(style.color);
      const bg = effectiveBackground(node);
      const fontSize = parseFloat(style.fontSize);
      const fontWeight = parseInt(style.fontWeight, 10) || 400;
      // WCAG "large text": ≥ 24px, or ≥ 18.66px when bold (≥700).
      const largeText = fontSize >= 24 || (fontSize >= 18.66 && fontWeight >= 700);
      if (bg === null) {
        entries.push({
          descriptor: descriptorOf(node, controlText),
          fg: rgbString(over(fgColor, white)),
          bg: "image",
          ratio: null,
          largeText,
          aa: null,
          aaa: null,
        });
        continue;
      }
      const fg = over(fgColor, bg);
      const ratio = ratioOf(fg, bg);
      const rounded = Math.round(ratio * 100) / 100;
      const aaFloor = largeText ? 3 : 4.5;
      const aaaFloor = largeText ? 4.5 : 7;
      entries.push({
        descriptor: descriptorOf(node, controlText),
        fg: rgbString(fg),
        bg: rgbString(bg),
        ratio: rounded,
        largeText,
        aa: rounded >= aaFloor,
        aaa: rounded >= aaaFloor,
      });
    }
    return entries;
  });
}

function contrastRootFor(step: WalkStepContext): Locator {
  const config = step.scenario.contrast;
  if (config?.root) {
    return config.root(step);
  }
  return step.scenario.pixelTarget?.(step) ?? step.canvas;
}

export function registerContrastDriver(scenario: DriverScenario) {
  const config = scenario.contrast;
  if (!config) {
    throw new Error(`Scenario "${scenario.slug}" has no contrast (D7) config`);
  }
  const cases = config.cases
    ? scenario.cases.filter((c) => config.cases!.includes(c.id))
    : scenario.cases;

  test.describe(`D7 contrast — ${scenario.title}`, () => {
    for (const caseDef of cases) {
      for (const theme of scenarioThemes(scenario, caseDef)) {
        test(`${caseDef.id} · ${theme}`, async ({ page }, testInfo) => {
          test.setTimeout(120_000);

          const captures: Record<PanelFramework, Map<GestureStateId, ContrastEntry[]>> = {
            react: new Map(),
            solid: new Map(),
          };

          await walkScenario(page, scenario, caseDef, theme, async (step) => {
            captures[step.framework].set(step.state, await captureContrast(contrastRootFor(step)));
          });

          // WCAG report: a sub-AA node present in BOTH stacks is an upstream
          // note (attached for review), not a port defect; a port-only drop is
          // caught by the pair diff below. `assertAA` promotes it to hard.
          const subAA: string[] = [];
          for (const [state, entries] of captures.solid) {
            for (const entry of entries) {
              if (entry.aa === false) {
                subAA.push(`${state} · ${entry.descriptor} · ${entry.ratio}:1`);
              }
            }
          }
          if (subAA.length > 0) {
            testInfo.annotations.push({
              type: config.assertAA ? "contrast-sub-AA (asserted)" : "contrast-sub-AA (reported)",
              description: subAA.join("\n"),
            });
          }

          for (const [state, reactEntries] of captures.react) {
            const solidEntries = captures.solid.get(state);
            expect(
              solidEntries,
              `solid panel produced no contrast capture for state "${state}"`,
            ).toBeTruthy();
            expect(
              JSON.stringify(solidEntries, null, 2),
              `${scenario.slug} · ${caseDef.id} · ${theme} · ${state}`,
            ).toBe(JSON.stringify(reactEntries, null, 2));
          }

          expect(
            captures.solid.get(scenario.states?.[0] ?? "default")?.length ?? 0,
            "contrast driver measured no text nodes — check the root resolver",
          ).toBeGreaterThan(0);

          if (config.assertAA && subAA.length > 0) {
            throw new Error(`D7 AA floor failed (Tier-6 assert):\n${subAA.join("\n")}`);
          }
        });
      }
    }
  });
}
