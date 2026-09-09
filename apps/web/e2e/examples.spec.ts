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

/**
 * Every interactive target that fails WCAG 2.2 2.5.8, by its real hit box.
 *
 * Two failure modes this has to tell apart:
 *
 * 1. A native `input` inside the library's `Radio`, `Switch` or `Checkbox` is
 *    the accessibility anchor, not the target. `visuallyHiddenStyles` land on a
 *    wrapper span, so the input measures ~13x13 while the box a finger actually
 *    hits is its `label`. Measuring the input would red the whole screen over a
 *    control the user never points at, so a visually hidden control is measured
 *    through its labelling box — which is then asserted like any other target,
 *    so a genuinely undersized radio label still fails.
 * 2. 2.5.8's own spacing exception: an undersized target passes only while a
 *    24px circle on its centre clears every neighbouring target (and every
 *    other undersized target's circle). Crowd two 16px labels together and this
 *    still reds; the register's 24px radio pitch is exactly what the exception
 *    is for.
 */
async function undersizedTargets(page: Page): Promise<string[]> {
  return page.evaluate((min) => {
    const selector = "button, a[href], input, select, textarea, [role=button], [tabindex='0']";

    /** The visually-hidden recipe the library emits (solidaria `visuallyHiddenStyles`). */
    const isVisuallyHidden = (el: Element): boolean => {
      const style = getComputedStyle(el);
      if (style.clip.replace(/\s+/g, " ").trim() === "rect(0px, 0px, 0px, 0px)") return true;
      if (style.clipPath.replace(/\s+/g, " ").trim() === "inset(50%)") return true;
      const box = el.getBoundingClientRect();
      return style.overflow === "hidden" && box.width <= 1 && box.height <= 1;
    };

    /** The clip sits on the wrapper span, not on the input it hides. */
    const isHidden = (el: Element): boolean => {
      for (let node: Element | null = el; node; node = node.parentElement) {
        if (isVisuallyHidden(node)) return true;
      }
      return false;
    };

    /** The box a pointer actually hits for a visually hidden control. */
    const labellingBox = (el: Element): Element | null => {
      const wrapping = el.closest("label");
      if (wrapping) return wrapping;
      const labelledBy = el.getAttribute("aria-labelledby");
      if (labelledBy) {
        const target = document.getElementById(labelledBy.split(/\s+/)[0] ?? "");
        if (target) return target;
      }
      const id = el.getAttribute("id");
      if (id) {
        const forLabel = document.querySelector(`label[for="${CSS.escape(id)}"]`);
        if (forLabel) return forLabel;
      }
      return el.parentElement;
    };

    type Target = { label: string; box: DOMRect; inline: boolean; substituted: boolean };
    const targets: Target[] = [];

    for (const el of document.querySelectorAll(selector)) {
      const style = getComputedStyle(el);
      if (style.display === "none" || style.visibility === "hidden") continue;

      let measured: Element = el;
      let substituted = false;
      if (isHidden(el)) {
        const substitute = labellingBox(el);
        // No labelling box at all: measure the control itself rather than drop it.
        if (substitute) {
          measured = substitute;
          substituted = true;
        }
      }

      const box = measured.getBoundingClientRect();
      // A zero box is an off-screen or unrendered control, not a small one.
      if (box.width === 0 && box.height === 0) continue;
      targets.push({
        label:
          `${el.tagName.toLowerCase()} "${el.textContent?.trim().slice(0, 30) ?? ""}" ` +
          `${Math.round(box.width)}x${Math.round(box.height)}` +
          (substituted ? " (measured via its label)" : ""),
        box,
        // 2.5.8 exempts a target inline in a sentence of text.
        inline: getComputedStyle(measured).display === "inline",
        substituted,
      });
    }

    const centre = (b: DOMRect) => ({ x: b.x + b.width / 2, y: b.y + b.height / 2 });
    const undersized = (t: Target) => t.box.width < min || t.box.height < min;

    /** 2.5.8 spacing: the target's own circle must clear every neighbour. */
    const wellSpaced = (t: Target): boolean => {
      const c = centre(t.box);
      const r = min / 2;
      for (const other of targets) {
        if (other === t) continue;
        const b = other.box;
        const dx = Math.max(b.x - c.x, 0, c.x - (b.x + b.width));
        const dy = Math.max(b.y - c.y, 0, c.y - (b.y + b.height));
        if (Math.hypot(dx, dy) < r) return false;
        if (undersized(other)) {
          const o = centre(b);
          if (Math.hypot(o.x - c.x, o.y - c.y) < min) return false;
        }
      }
      return true;
    };

    return targets.filter((t) => undersized(t) && !t.inline && !wellSpaced(t)).map((t) => t.label);
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
