import { expect, test, type ElementHandle } from "@playwright/test";
import { driverCases, scenarioThemes, type DriverScenario, type PanelFramework } from "./scenario";
import { forEachScenarioPanel } from "./walk";

/**
 * Driver D-scroll — virtualized scroll-window behavior (recertification.md,
 * CP9.56 Virtualizer).
 *
 * The Virtualizer has no standalone styled S2 oracle, and its two ports diverge
 * by design in *how* they window: react-aria-components positions rows via
 * absolute layout rects inside a full-height scroller, while our port slices the
 * collection and pads with spacer divs. So the DOM windowing structure is NOT
 * certifiable — but the observable scroll-window *behavior* is, and it is what a
 * user and a screen reader actually perceive:
 *
 *  1. The set of options strictly visible in the viewport at a given scroll
 *     offset (geometry-determined: it depends only on scrollTop, viewport height,
 *     and row height, which are pinned identical across the two stacks — so it is
 *     independent of each stack's overscan buffer).
 *  2. The windowed accessibility semantics of each visible option
 *     (`aria-posinset`/`aria-setsize` reflecting the *full* collection, plus
 *     `aria-selected`) — the positional info a screen reader needs precisely
 *     because the DOM is incomplete.
 *  3. The total scroll extent (`scrollHeight` = itemCount × rowHeight in both).
 *  4. Focus survival across recycling: a focused row stays focused even after it
 *     is scrolled out of the window and back (both stacks persist the focused key).
 *
 * Items 1–3 are captured per scroll offset and pair-diffed (port == oracle). The
 * separate per-stack invariant that virtualization actually happened (rendered
 * option count < full itemCount) is asserted per stack rather than cross-diffed,
 * because the overscan buffer legitimately differs between the two ports.
 *
 * Behavior is theme-independent, so only the first scenario theme runs.
 */

export interface ScrollWindowConfig {
  /** Case ids to run; defaults to the first (canonical) case. */
  cases?: readonly string[];
  /** Scroll offsets (container scrollTop, px) captured in order. */
  offsets: readonly number[];
  /** Full collection size — the windowing invariant asserts rendered < this. */
  itemCount: number;
  /** Also run the focus-retention walk (default true). */
  focusRetention?: boolean;
}

const scrollSettleMs = 320;

interface OptionSnapshot {
  label: string;
  posinset: string | null;
  setsize: string | null;
  selected: string | null;
}

interface OffsetWindow {
  offset: number;
  visible: OptionSnapshot[];
  scrollHeight: number;
}

interface WindowResult {
  windows: OffsetWindow[];
  /** Per-offset rendered option count — asserted per stack, never cross-diffed. */
  rendered: number[];
}

type ListboxHandle = ElementHandle<HTMLElement | SVGElement>;

/**
 * Finds the actual scroll container for a listbox: the nearest self-or-ancestor
 * (RAC makes the listbox element itself the scroller) or, failing that, a
 * descendant (our port wraps the listbox in a `[data-virtualizer]` scroller —
 * an ancestor — while RAC's inner ScrollView would be a descendant). This finder
 * is inlined verbatim into each `evaluate` body below (not shared) because it has
 * to run in the page context, and Playwright cannot serialize a captured closure.
 */

async function scrollTo(handle: ListboxHandle, offset: number): Promise<void> {
  await handle.evaluate(
    (listbox, to) => {
      const isScrollable = (el: HTMLElement): boolean => {
        const style = getComputedStyle(el);
        return el.scrollHeight - el.clientHeight > 1 && /(auto|scroll)/.test(style.overflowY);
      };
      const findScroller = (start: HTMLElement): HTMLElement => {
        let el: HTMLElement | null = start;
        while (el && el !== document.body) {
          if (isScrollable(el)) return el;
          el = el.parentElement;
        }
        for (const c of Array.from(start.querySelectorAll<HTMLElement>("*"))) {
          if (isScrollable(c)) return c;
        }
        return start;
      };
      const scroller = findScroller(listbox as HTMLElement);
      scroller.scrollTop = to;
      // Native assignment already fires a scroll event; dispatch one explicitly
      // too so the port's capturing document listener updates deterministically.
      scroller.dispatchEvent(new Event("scroll", { bubbles: false }));
    },
    offset,
  );
}

async function captureWindow(
  handle: ListboxHandle,
  offset: number,
): Promise<OffsetWindow & { rendered: number }> {
  return handle.evaluate(
    (listbox, at) => {
      const isScrollable = (el: HTMLElement): boolean => {
        const style = getComputedStyle(el);
        return el.scrollHeight - el.clientHeight > 1 && /(auto|scroll)/.test(style.overflowY);
      };
      const findScroller = (start: HTMLElement): HTMLElement => {
        let el: HTMLElement | null = start;
        while (el && el !== document.body) {
          if (isScrollable(el)) return el;
          el = el.parentElement;
        }
        for (const c of Array.from(start.querySelectorAll<HTMLElement>("*"))) {
          if (isScrollable(c)) return c;
        }
        return start;
      };
      const scroller = findScroller(listbox as HTMLElement);
      const scrollerRect = scroller.getBoundingClientRect();
      const viewTop = scrollerRect.top + scroller.clientTop;
      const viewBottom = viewTop + scroller.clientHeight;

      const options = Array.from((listbox as HTMLElement).querySelectorAll('[role="option"]'));
      const visible = [];
      for (const option of options) {
        const rect = option.getBoundingClientRect();
        if (rect.height === 0) continue;
        const overlap = Math.min(rect.bottom, viewBottom) - Math.max(rect.top, viewTop);
        // Majority-visible → strictly in the window (overscan rows sit off-screen
        // and are excluded; with offsets that are row-height multiples every
        // in-window row is fully visible, so this is unambiguous).
        if (overlap > rect.height / 2) {
          visible.push({
            label: (option.textContent ?? "").trim(),
            posinset: option.getAttribute("aria-posinset"),
            setsize: option.getAttribute("aria-setsize"),
            selected: option.getAttribute("aria-selected"),
          });
        }
      }
      return {
        offset: at,
        visible,
        scrollHeight: scroller.scrollHeight,
        rendered: options.length,
      };
    },
    offset,
  );
}

async function captureActiveLabel(handle: ListboxHandle): Promise<string> {
  return handle.evaluate(() => {
    const active = document.activeElement;
    if (!active) return "(none)";
    if (active.tagName === "BODY") return "(body)";
    if (active.getAttribute("role") === "option") return (active.textContent ?? "").trim();
    return `(${active.tagName.toLowerCase()}:${(active.textContent ?? "").trim().slice(0, 24)})`;
  });
}

export function registerScrollWindowDriver(scenario: DriverScenario, config: ScrollWindowConfig) {
  test.describe(`D-scroll window — ${scenario.title}`, () => {
    for (const caseDef of driverCases(scenario, config.cases)) {
      const theme = scenarioThemes(scenario, caseDef)[0];

      test(`${caseDef.id} · visible window + windowed AX`, async ({ page }) => {
        test.setTimeout(120_000);
        const results: Partial<Record<PanelFramework, WindowResult>> = {};

        await forEachScenarioPanel(page, scenario, caseDef, theme, async (ctx) => {
          const listbox = scenario.target(ctx);
          await expect(listbox).toBeVisible();
          const handle = (await listbox.elementHandle()) as ListboxHandle;

          const windows: OffsetWindow[] = [];
          const rendered: number[] = [];
          for (const offset of config.offsets) {
            await scrollTo(handle, offset);
            await ctx.page.waitForTimeout(scrollSettleMs);
            const capture = await captureWindow(handle, offset);
            const { rendered: renderedCount, ...window } = capture;
            windows.push(window);
            rendered.push(renderedCount);
          }
          results[ctx.framework] = { windows, rendered };
        });

        // Virtualization actually happened on each stack (overscan buffers may
        // differ, so this is a per-stack invariant, not a cross-stack diff).
        for (const framework of ["react", "solid"] as const) {
          const stack = results[framework];
          expect(stack, `${framework} panel produced no window result`).toBeTruthy();
          for (const count of stack!.rendered) {
            expect(
              count,
              `${framework} rendered ${count} of ${config.itemCount} options — not windowed`,
            ).toBeLessThan(config.itemCount);
          }
        }

        // The visible key-set + windowed AX + scroll extent must match the oracle.
        expect(JSON.stringify(results.solid?.windows, null, 2)).toBe(
          JSON.stringify(results.react?.windows, null, 2),
        );
      });

      if (config.focusRetention !== false) {
        test(`${caseDef.id} · focus retention across recycling`, async ({ page }) => {
          test.setTimeout(120_000);
          const sequences: Partial<Record<PanelFramework, string[]>> = {};
          const maxOffset = Math.max(...config.offsets);

          await forEachScenarioPanel(page, scenario, caseDef, theme, async (ctx) => {
            const listbox = scenario.target(ctx);
            await expect(listbox).toBeVisible();
            const handle = (await listbox.elementHandle()) as ListboxHandle;

            // Enter via the keyboard (Tab from the Before boundary button) so the
            // collection's focusedKey is seeded through the real shared path, not a
            // synthetic programmatic .focus() that diverges across stacks.
            const before = ctx.canvas.getByRole("button", { name: "Before" });
            await before.focus();
            await ctx.page.keyboard.press("Tab");
            await ctx.page.waitForTimeout(scrollSettleMs);

            const sequence: string[] = [await captureActiveLabel(handle)];
            // Scroll the focused row out of the window, then back.
            await scrollTo(handle, maxOffset);
            await ctx.page.waitForTimeout(scrollSettleMs);
            sequence.push(await captureActiveLabel(handle));
            await scrollTo(handle, 0);
            await ctx.page.waitForTimeout(scrollSettleMs);
            sequence.push(await captureActiveLabel(handle));

            sequences[ctx.framework] = sequence;
          });

          expect(JSON.stringify(sequences.solid, null, 2)).toBe(
            JSON.stringify(sequences.react, null, 2),
          );
        });
      }
    }
  });
}
