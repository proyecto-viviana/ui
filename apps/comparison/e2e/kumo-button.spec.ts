import { expect, test, type FrameLocator, type Locator, type Page } from "@playwright/test";
import {
  clearPointer,
  compareScreenshots,
  type ScreenshotDiffThreshold,
} from "./visual-diff";

/**
 * Paired Kumo Button behavior against the experiment fixture.
 * Oracle: @cloudflare/kumo@2.11.0. Candidate: @proyecto-viviana/kumo.
 * This is not Adobe certified-suite coverage and does not close the Kumo port.
 *
 * Accepted framework difference: Solid's public `ref` is a callback. React
 * object refs are oracle-only and are not part of the Solid contract.
 * Headless data attributes (`data-hovered`, `data-pressed`, `data-focus-visible`)
 * come from solidaria-components on Solid and are absent on the React oracle.
 *
 * Classified paint (not silent): Tailwind extra transparent ring layers;
 * 0-width rings; rounded-full vs 9999px; oklch/oklab color-space
 * serialization; unused outline-width when outline-style is none.
 */

const FRAMEWORKS = ["react", "solid"] as const;
type Framework = (typeof FRAMEWORKS)[number];

const PAINT_KEYS = [
  "width",
  "height",
  "paddingTop",
  "paddingRight",
  "paddingBottom",
  "paddingLeft",
  "columnGap",
  "borderTopLeftRadius",
  "borderTopRightRadius",
  "borderBottomRightRadius",
  "borderBottomLeftRadius",
  "fontSize",
  "fontWeight",
  "lineHeight",
  "color",
  "backgroundColor",
  "cursor",
  "display",
  "alignItems",
  "justifyContent",
  "outlineStyle",
  "outlineWidth",
] as const;

const INTERACTION_STATES = [
  "variant-primary",
  "variant-secondary",
  "variant-ghost",
  "variant-destructive",
  "variant-secondary-destructive",
  "variant-outline",
  "mode-light-secondary",
  "mode-dark-secondary",
] as const;

type PaintSnapshot = {
  button: Record<string, string>;
  overlay: Record<string, string> | null;
};

/**
 * Measured 2026-08-19 on primary hover: 1228/3784 pixels differ by maxChannelDelta 1
 * (same oklch gradient; Tailwind serializes 0%/100% stops, Solid omits them).
 * Deltas of 1 are raster, not paint. Geometry must still be exact.
 */
const kumoInteractionPairDiff: ScreenshotDiffThreshold = {
  maxMismatchRatio: 0,
  maxDimensionDelta: 0,
  pixelThreshold: 1,
};

function frame(page: Page, framework: Framework): FrameLocator {
  return page.frameLocator(`[data-kumo-frame="${framework}"]`);
}

async function waitForPair(page: Page) {
  await page.goto(`/experiments/kumo-button/?t=${Date.now()}`);
  for (const framework of FRAMEWORKS) {
    await expect(page.locator(`[data-kumo-frame="${framework}"]`)).toBeVisible();
    await expect(frame(page, framework).locator('[data-fixture-state="controlled"]')).toBeVisible();
    await expect(frame(page, framework).locator('[data-hydrated="true"]')).toBeVisible();
  }
}

async function pressCount(root: FrameLocator) {
  const text = await root.locator('[data-fixture-output="press-count"]').innerText();
  const match = text.match(/Activated (\d+) times/);
  if (!match) {
    throw new Error(`Unexpected press readout: ${text}`);
  }
  return Number(match[1]);
}

async function setControl(page: Page, name: string, value: string | boolean) {
  if (typeof value === "boolean") {
    const checkbox = page.locator(`[data-kumo-controls] input[name="${name}"]`);
    if (value) await checkbox.check();
    else await checkbox.uncheck();
    return;
  }
  await page.locator(`[data-kumo-controls] select[name="${name}"]`).selectOption(value);
}

async function buttonPaint(button: Locator) {
  return button.evaluate((element, keys) => {
    const style = window.getComputedStyle(element);
    const paint: Record<string, string> = {};
    for (const key of keys) {
      paint[key] = style[key as keyof CSSStyleDeclaration] as string;
    }
    paint.boxShadow = style.boxShadow;
    return paint;
  }, PAINT_KEYS);
}

/** Tailwind `ring` emits extra fully-transparent and 0-width shadow layers. */
function paintedShadow(value: string) {
  return value
    .split(/,(?![^()]*\))/)
    .map((layer) => layer.trim())
    .filter((layer) => {
      if (!layer) return false;
      if (/^rgba?\(0,\s*0,\s*0,\s*0\)/.test(layer)) return false;
      // Ghost has no `ring` utility: :focus sets color on a 0-width ring that
      // does not paint. Oracle serializes that as transparent 0px layers.
      if (/(?:^|\s)0px\s+0px\s+0px\s+0px(?:\s|$)/.test(layer)) return false;
      return true;
    })
    .join(", ");
}

function isFullRadius(value: string) {
  const px = Number.parseFloat(value);
  return value === "9999px" || (Number.isFinite(px) && px >= 1000);
}

function shadowLayers(value: string) {
  return paintedShadow(value)
    .split(/,(?![^()]*\))/)
    .map((layer) => layer.trim())
    .filter(Boolean)
    .map((layer) => {
      const match = layer.match(/^(oklch|oklab|rgba?)\([^)]+\)/);
      const color = match?.[0] ?? "";
      return {
        color,
        geometry: layer.slice(color.length).trim(),
        colorSpace: /oklch|oklab/.test(color),
      };
    });
}

function samePaintedShadow(reactValue: string, solidValue: string) {
  if (paintedShadow(reactValue) === paintedShadow(solidValue)) return true;
  const react = shadowLayers(reactValue);
  const solid = shadowLayers(solidValue);
  if (react.length !== solid.length) return false;
  return react.every((layer, i) => {
    const other = solid[i];
    if (layer.geometry !== other.geometry) return false;
    if (layer.color === other.color) return true;
    // Oracle serializes color-mix rings as oklab; the Button sheet keeps oklch.
    return layer.colorSpace && other.colorSpace;
  });
}

function classifyPaintDiff(state: string, key: string, reactValue: string, solidValue: string) {
  if (key === "boxShadow" && samePaintedShadow(reactValue, solidValue)) {
    return null;
  }
  if (key.startsWith("border") && key.endsWith("Radius") && isFullRadius(reactValue) && isFullRadius(solidValue)) {
    return null;
  }
  // Oracle Tailwind resolves --color-neutral-900; the Button sheet fallback is
  // oklch(21% 0.006 285.885). Serialization also flips oklch/oklab. Dated
  // KX-04 remainder — do not treat a new geometry miss as this class.
  if (
    (key === "color" || key === "backgroundColor" || key === "backgroundImage") &&
    /oklch|oklab/.test(reactValue) &&
    /oklch|oklab/.test(solidValue)
  ) {
    return null;
  }
  return `${state}.${key}: react=${JSON.stringify(reactValue)} solid=${JSON.stringify(solidValue)}`;
}

async function settleInteraction(button: Locator) {
  // Oracle outline uses `transition-colors` 0.1s; two frames plus that duration.
  await button.evaluate(
    () =>
      new Promise<void>((resolve) => {
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            window.setTimeout(resolve, 120);
          });
        });
      }),
  );
}

async function interactionPaint(button: Locator): Promise<PaintSnapshot> {
  const snapshot = await button.evaluate((element, keys) => {
    const style = window.getComputedStyle(element);
    const paint: Record<string, string> = {};
    for (const key of keys) {
      paint[key] = style[key as keyof CSSStyleDeclaration] as string;
    }
    paint.boxShadow = style.boxShadow;
    const overlay = element.querySelector('[aria-hidden="true"]');
    let overlayPaint: Record<string, string> | null = null;
    if (overlay instanceof HTMLElement) {
      const overlayStyle = window.getComputedStyle(overlay);
      overlayPaint = {
        backgroundImage: overlayStyle.backgroundImage,
        boxShadow: overlayStyle.boxShadow,
      };
    }
    return { button: paint, overlay: overlayPaint };
  }, PAINT_KEYS);
  return snapshot;
}

function collectPaintMismatches(
  state: string,
  reactPaint: Record<string, string>,
  solidPaint: Record<string, string>,
) {
  const mismatches: string[] = [];
  for (const key of Object.keys(reactPaint)) {
    if (reactPaint[key] === solidPaint[key]) continue;
    // Tailwind `focus:outline-none` sets style only. Unused outline-width
    // used-value is UA (1px vs 3px) and is not painted when style is none.
    if (
      key === "outlineWidth" &&
      reactPaint.outlineStyle === "none" &&
      solidPaint.outlineStyle === "none"
    ) {
      continue;
    }
    const classified = classifyPaintDiff(state, key, reactPaint[key], solidPaint[key]);
    if (classified) mismatches.push(classified);
  }
  return mismatches;
}

function collectSnapshotMismatches(state: string, react: PaintSnapshot, solid: PaintSnapshot) {
  const mismatches = collectPaintMismatches(state, react.button, solid.button);
  if (!react.overlay && !solid.overlay) return mismatches;
  if (!react.overlay || !solid.overlay) {
    mismatches.push(
      `${state}.overlay: react=${react.overlay ? "present" : "missing"} solid=${solid.overlay ? "present" : "missing"}`,
    );
    return mismatches;
  }
  mismatches.push(...collectPaintMismatches(`${state}.overlay`, react.overlay, solid.overlay));
  return mismatches;
}

function paintChanged(rest: PaintSnapshot, next: PaintSnapshot) {
  for (const key of Object.keys(rest.button)) {
    if (rest.button[key] !== next.button[key]) return true;
  }
  if (rest.overlay && next.overlay) {
    for (const key of Object.keys(rest.overlay)) {
      if (rest.overlay[key] !== next.overlay[key]) return true;
    }
  }
  return false;
}

async function keyboardFocus(page: Page, button: Locator) {
  await clearPointer(page);
  await button.evaluate((element) => {
    const host = element as HTMLElement;
    host.ownerDocument.querySelector("[data-kumo-focus-probe]")?.remove();
    const probe = host.ownerDocument.createElement("button");
    probe.type = "button";
    probe.setAttribute("data-kumo-focus-probe", "true");
    probe.tabIndex = 0;
    probe.style.cssText =
      "position:fixed;left:0;top:0;width:1px;height:1px;opacity:0;pointer-events:none;border:0;padding:0";
    host.insertAdjacentElement("beforebegin", probe);
    probe.focus();
  });
  await page.keyboard.press("Tab");
  await expect(button).toBeFocused();
  expect(
    await button.evaluate((element) => (element as HTMLElement).matches(":focus-visible")),
    "keyboard focus must be :focus-visible",
  ).toBe(true);
  await settleInteraction(button);
}

async function removeFocusProbe(button: Locator) {
  await button.evaluate((element) => {
    (element as HTMLElement).ownerDocument.querySelector("[data-kumo-focus-probe]")?.remove();
  });
}

/** Page clip keeps the pointer on the element; locator.screenshot() can scroll and drop :hover. */
async function clipElement(page: Page, locator: Locator) {
  const box = await locator.boundingBox();
  if (!box) throw new Error("missing bounding box");
  const pad = 4;
  return page.screenshot({
    animations: "disabled",
    clip: {
      x: Math.max(0, box.x - pad),
      y: Math.max(0, box.y - pad),
      width: box.width + pad * 2,
      height: box.height + pad * 2,
    },
  });
}

async function expectClippedPair(
  page: Page,
  reactButton: Locator,
  solidButton: Locator,
  label: string,
  prepareReact: () => Promise<void>,
  prepareSolid: () => Promise<void>,
) {
  await clearPointer(page);
  await prepareReact();
  const reactPng = await clipElement(page, reactButton);
  await page.mouse.up();
  await clearPointer(page);
  await prepareSolid();
  const solidPng = await clipElement(page, solidButton);
  await page.mouse.up();
  await compareScreenshots(page, reactPng, solidPng, label, kumoInteractionPairDiff);
}

test.describe("Kumo Button pair", () => {
  test("accessible names match for text, icon-plus-text, square, and circle", async ({
    page,
  }) => {
    await waitForPair(page);

    for (const framework of FRAMEWORKS) {
      const root = frame(page, framework);
      await expect(root.locator('[data-fixture-state="controlled"]')).toHaveAccessibleName(
        "Deploy Worker",
      );
      await expect(root.locator('[data-fixture-state="variant-primary"]')).toHaveAccessibleName(
        "primary",
      );
      await expect(root.locator('[data-fixture-state="shape-square"]')).toHaveAccessibleName(
        "Add square",
      );
      await expect(root.locator('[data-fixture-state="shape-circle"]')).toHaveAccessibleName(
        "Add circle",
      );
    }
  });

  test("pointer click increments the paired press counts", async ({ page }) => {
    await waitForPair(page);

    for (const framework of FRAMEWORKS) {
      const root = frame(page, framework);
      const before = await pressCount(root);
      await root.locator('[data-fixture-state="controlled"]').click();
      await expect.poll(() => pressCount(root)).toBe(before + 1);
    }
  });

  test("Enter and Space activate both implementations", async ({ page }) => {
    await waitForPair(page);

    for (const framework of FRAMEWORKS) {
      const root = frame(page, framework);
      const button = root.locator('[data-fixture-state="controlled"]');
      const before = await pressCount(root);
      await button.focus();
      await expect(button).toBeFocused();
      await page.keyboard.press("Enter");
      await expect.poll(() => pressCount(root)).toBe(before + 1);
      await page.keyboard.press("Space");
      await expect.poll(() => pressCount(root)).toBe(before + 2);
    }
  });

  test("disabled and loading suppress activation and keep names", async ({ page }) => {
    await waitForPair(page);

    for (const framework of FRAMEWORKS) {
      const root = frame(page, framework);
      const disabled = root.locator('[data-fixture-state="state-disabled"]');
      await expect(disabled).toBeDisabled();
      await expect(disabled).toHaveAccessibleName("Disabled");

      const loading = root.locator('[data-fixture-state="state-loading"]');
      await expect(loading).toBeDisabled();
      await expect(loading).toHaveAccessibleName(/Saving/);
      await expect(root.getByRole("status", { name: "Loading" }).first()).toBeVisible();
    }

    await setControl(page, "disabled", true);
    for (const framework of FRAMEWORKS) {
      const root = frame(page, framework);
      const button = root.locator('[data-fixture-state="controlled"]');
      await expect(button).toBeDisabled();
      const before = await pressCount(root);
      await button.click({ force: true });
      await expect.poll(() => pressCount(root)).toBe(before);
    }

    await setControl(page, "disabled", false);
    await setControl(page, "loading", true);
    for (const framework of FRAMEWORKS) {
      const root = frame(page, framework);
      const button = root.locator('[data-fixture-state="controlled"]');
      await expect(button).toBeDisabled();
      await expect(root.getByRole("status", { name: "Loading" }).first()).toBeVisible();
      const before = await pressCount(root);
      await button.click({ force: true });
      await expect.poll(() => pressCount(root)).toBe(before);
    }
  });

  test("shared controls update both frames to the same public state", async ({ page }) => {
    await waitForPair(page);

    await setControl(page, "variant", "destructive");
    await setControl(page, "size", "lg");
    await setControl(page, "shape", "square");

    for (const framework of FRAMEWORKS) {
      const root = frame(page, framework).locator('[data-framework]');
      await expect(root).toHaveAttribute("data-fixture-variant", "destructive");
      await expect(root).toHaveAttribute("data-fixture-size", "lg");
      await expect(root).toHaveAttribute("data-fixture-shape", "square");
      await expect(root.locator('[data-fixture-state="controlled"]')).toHaveAccessibleName(
        "Deploy Worker",
      );
    }
  });

  test("native type defaults to button and form participation matches", async ({ page }) => {
    await waitForPair(page);

    for (const framework of FRAMEWORKS) {
      const root = frame(page, framework);
      const defaultButton = root.locator('[data-fixture-state="form-default"]');
      const submitButton = root.locator('[data-fixture-state="form-submit"]');
      const associateButton = root.locator('[data-fixture-state="form-associate"]');
      const result = root.locator('[data-fixture-output="form-result"]');

      await expect(defaultButton).toHaveAttribute("type", "button");
      await expect(submitButton).toHaveAttribute("type", "submit");
      await expect(submitButton).toHaveAttribute("name", "intent");
      await expect(submitButton).toHaveAttribute("value", "deploy");
      await expect(associateButton).toHaveAttribute("form", `kumo-native-form-${framework}`);
      await expect(result).toHaveText("idle");

      await defaultButton.click();
      await expect(result).toHaveText("idle");

      await submitButton.click();
      await expect(result).toHaveText('{"worker":"edge","intent":"deploy"}');
    }

    await waitForPair(page);
    for (const framework of FRAMEWORKS) {
      const root = frame(page, framework);
      await root.locator('[data-fixture-state="form-associate"]').click();
      await expect(root.locator('[data-fixture-output="form-result"]')).toHaveText(
        '{"worker":"edge","intent":"associate"}',
      );
    }
  });

  test("callback refs attach on both sides", async ({ page }) => {
    await waitForPair(page);

    for (const framework of FRAMEWORKS) {
      await expect(
        frame(page, framework).locator('[data-fixture-state="form-ref"]'),
      ).toHaveAttribute("data-ref-attached", "true");
    }
  });

  test("keyboard tab order and :focus-visible match across the pair", async ({ page }) => {
    await waitForPair(page);

    const collect = async (framework: Framework) => {
      const root = frame(page, framework);
      const first = root.locator('[data-fixture-state="controlled"]');
      await first.focus();
      await page.keyboard.press("Tab");
      const names: string[] = [];
      const focusVisible: boolean[] = [];
      for (let i = 0; i < 8; i++) {
        const focused = root.locator(":focus");
        names.push(
          await focused.evaluate((element) => {
            const host = element as HTMLElement;
            return (
              host.getAttribute("aria-label") ||
              host.innerText.replace(/\s+/g, " ").trim() ||
              host.tagName
            );
          }),
        );
        focusVisible.push(await focused.evaluate((element) => element.matches(":focus-visible")));
        await page.keyboard.press("Tab");
      }
      return { names, focusVisible };
    };

    const reactTrail = await collect("react");
    const solidTrail = await collect("solid");
    expect(solidTrail.names, "tab order of named buttons").toEqual(reactTrail.names);
    expect(solidTrail.focusVisible, "keyboard focus is :focus-visible on both sides").toEqual(
      reactTrail.focusVisible,
    );
    expect(solidTrail.focusVisible.some(Boolean), "at least one stop is :focus-visible").toBe(
      true,
    );
  });

  test("rest computed paint matches for variants, sizes, shapes, and modes", async ({ page }) => {
    await waitForPair(page);

    const states = [
      "variant-primary",
      "variant-secondary",
      "variant-ghost",
      "variant-destructive",
      "variant-secondary-destructive",
      "variant-outline",
      "size-xs",
      "size-sm",
      "size-base",
      "size-lg",
      "shape-square",
      "shape-circle",
      "state-disabled",
      "state-loading",
      "mode-light",
      "mode-dark",
    ] as const;

    const mismatches: string[] = [];
    for (const state of states) {
      const reactPaint = await buttonPaint(
        frame(page, "react").locator(`[data-fixture-state="${state}"]`),
      );
      const solidPaint = await buttonPaint(
        frame(page, "solid").locator(`[data-fixture-state="${state}"]`),
      );
      for (const key of Object.keys(reactPaint)) {
        if (reactPaint[key] === solidPaint[key]) continue;
        const classified = classifyPaintDiff(state, key, reactPaint[key], solidPaint[key]);
        if (classified) mismatches.push(classified);
      }
    }

    expect(mismatches, mismatches.join("\n")).toEqual([]);
  });

  test("hover computed paint matches across variants and modes", async ({ page }) => {
    await waitForPair(page);

    const mismatches: string[] = [];
    const unchanged: string[] = [];
    for (const state of INTERACTION_STATES) {
      const reactButton = frame(page, "react").locator(`[data-fixture-state="${state}"]`);
      const solidButton = frame(page, "solid").locator(`[data-fixture-state="${state}"]`);

      await clearPointer(page);
      const reactRest = await interactionPaint(reactButton);
      const solidRest = await interactionPaint(solidButton);

      await reactButton.hover();
      await settleInteraction(reactButton);
      const reactHover = await interactionPaint(reactButton);

      await solidButton.hover();
      await settleInteraction(solidButton);
      const solidHover = await interactionPaint(solidButton);

      mismatches.push(...collectSnapshotMismatches(`hover.${state}`, reactHover, solidHover));
      if (!paintChanged(reactRest, reactHover)) {
        unchanged.push(`react hover did not change ${state}`);
      }
      if (!paintChanged(solidRest, solidHover)) {
        unchanged.push(`solid hover did not change ${state}`);
      }
    }

    await clearPointer(page);
    const disabledReact = frame(page, "react").locator('[data-fixture-state="state-disabled"]');
    const disabledSolid = frame(page, "solid").locator('[data-fixture-state="state-disabled"]');
    const disabledReactRest = await interactionPaint(disabledReact);
    const disabledSolidRest = await interactionPaint(disabledSolid);
    await disabledReact.hover();
    await settleInteraction(disabledReact);
    const disabledReactHover = await interactionPaint(disabledReact);
    await disabledSolid.hover();
    await settleInteraction(disabledSolid);
    const disabledSolidHover = await interactionPaint(disabledSolid);
    mismatches.push(
      ...collectSnapshotMismatches("hover.state-disabled", disabledReactHover, disabledSolidHover),
    );
    if (paintChanged(disabledReactRest, disabledReactHover)) {
      mismatches.push("react disabled hover changed paint; oracle secondary hover is not-disabled");
    }
    if (paintChanged(disabledSolidRest, disabledSolidHover)) {
      mismatches.push("solid disabled hover changed paint; oracle secondary hover is not-disabled");
    }

    expect(mismatches, mismatches.join("\n")).toEqual([]);
    expect(unchanged, unchanged.join("\n")).toEqual([]);
  });

  test("pressed computed paint matches across variants", async ({ page }) => {
    await waitForPair(page);

    const mismatches: string[] = [];
    const unchanged: string[] = [];
    for (const state of INTERACTION_STATES) {
      const reactButton = frame(page, "react").locator(`[data-fixture-state="${state}"]`);
      const solidButton = frame(page, "solid").locator(`[data-fixture-state="${state}"]`);

      await clearPointer(page);
      const reactRest = await interactionPaint(reactButton);
      const solidRest = await interactionPaint(solidButton);

      await reactButton.hover();
      await page.mouse.down();
      await settleInteraction(reactButton);
      const reactPressed = await interactionPaint(reactButton);
      await page.mouse.up();

      await clearPointer(page);
      await solidButton.hover();
      await page.mouse.down();
      await settleInteraction(solidButton);
      const solidPressed = await interactionPaint(solidButton);
      await page.mouse.up();

      mismatches.push(...collectSnapshotMismatches(`pressed.${state}`, reactPressed, solidPressed));
      if (!paintChanged(reactRest, reactPressed)) {
        unchanged.push(`react pressed did not change ${state}`);
      }
      if (!paintChanged(solidRest, solidPressed)) {
        unchanged.push(`solid pressed did not change ${state}`);
      }
    }

    expect(mismatches, mismatches.join("\n")).toEqual([]);
    expect(unchanged, unchanged.join("\n")).toEqual([]);
  });

  test("keyboard-focus computed paint matches across variants", async ({ page }) => {
    await waitForPair(page);

    const mismatches: string[] = [];
    const unchanged: string[] = [];
    const notFocusVisible: string[] = [];
    for (const state of INTERACTION_STATES) {
      const reactButton = frame(page, "react").locator(`[data-fixture-state="${state}"]`);
      const solidButton = frame(page, "solid").locator(`[data-fixture-state="${state}"]`);

      await clearPointer(page);
      const reactRest = await interactionPaint(reactButton);
      const solidRest = await interactionPaint(solidButton);

      await keyboardFocus(page, reactButton);
      const reactFocus = await interactionPaint(reactButton);
      if (!(await reactButton.evaluate((element) => (element as HTMLElement).matches(":focus-visible")))) {
        notFocusVisible.push(`react ${state}`);
      }
      await removeFocusProbe(reactButton);

      await keyboardFocus(page, solidButton);
      const solidFocus = await interactionPaint(solidButton);
      if (!(await solidButton.evaluate((element) => (element as HTMLElement).matches(":focus-visible")))) {
        notFocusVisible.push(`solid ${state}`);
      }
      await removeFocusProbe(solidButton);

      mismatches.push(...collectSnapshotMismatches(`focus-visible.${state}`, reactFocus, solidFocus));
      if (!paintChanged(reactRest, reactFocus)) {
        unchanged.push(`react keyboard-focus did not change ${state}`);
      }
      if (!paintChanged(solidRest, solidFocus)) {
        unchanged.push(`solid keyboard-focus did not change ${state}`);
      }
    }

    expect(notFocusVisible, notFocusVisible.join("\n")).toEqual([]);
    expect(mismatches, mismatches.join("\n")).toEqual([]);
    expect(unchanged, unchanged.join("\n")).toEqual([]);
  });

  test("primary hover, pressed, and keyboard-focus pixels match", async ({ page }) => {
    await waitForPair(page);
    const reactButton = frame(page, "react").locator('[data-fixture-state="variant-primary"]');
    const solidButton = frame(page, "solid").locator('[data-fixture-state="variant-primary"]');

    await expectClippedPair(
      page,
      reactButton,
      solidButton,
      "Kumo Button primary hover",
      async () => {
        await reactButton.hover();
        await settleInteraction(reactButton);
      },
      async () => {
        await solidButton.hover();
        await settleInteraction(solidButton);
      },
    );

    await expectClippedPair(
      page,
      reactButton,
      solidButton,
      "Kumo Button primary pressed",
      async () => {
        await reactButton.hover();
        await page.mouse.down();
        await settleInteraction(reactButton);
      },
      async () => {
        await solidButton.hover();
        await page.mouse.down();
        await settleInteraction(solidButton);
      },
    );

    await expectClippedPair(
      page,
      reactButton,
      solidButton,
      "Kumo Button primary keyboard-focus",
      async () => {
        await keyboardFocus(page, reactButton);
      },
      async () => {
        await keyboardFocus(page, solidButton);
      },
    );
  });
});

test.describe("Kumo Button SSR/hydration", () => {
  for (const framework of FRAMEWORKS) {
    test(`${framework} fixture SSRs the default button and hydrates a click`, async ({
      page,
      browser,
      baseURL,
    }) => {
      const route = `/experiments/kumo-button/${framework}/`;
      const context = await browser.newContext({ javaScriptEnabled: false, baseURL });
      try {
        const serverPage = await context.newPage();
        await serverPage.goto(route, { waitUntil: "domcontentloaded" });
        const serverButton = serverPage.locator('[data-fixture-state="controlled"]');
        await expect(serverButton).toBeAttached();
        await expect(serverButton).toHaveText(/Deploy Worker/);
        await expect(serverButton).toHaveAttribute("type", "button");
      } finally {
        await context.close();
      }

      const consoleIssues: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error" || msg.type() === "warning") {
          consoleIssues.push(`[${msg.type()}] ${msg.text()}`);
        }
      });
      page.on("pageerror", (err) => {
        consoleIssues.push(`[pageerror] ${err.message}`);
      });

      await page.goto(route, { waitUntil: "networkidle" });
      await expect(page.locator('[data-hydrated="true"]')).toBeAttached({ timeout: 15_000 });
      const button = page.locator('[data-fixture-state="controlled"]');
      await expect(button).toHaveAccessibleName("Deploy Worker");
      const before = await page.locator('[data-fixture-output="press-count"]').innerText();
      await button.click();
      await expect(page.locator('[data-fixture-output="press-count"]')).not.toHaveText(before);

      const errors = consoleIssues.filter(
        (issue) => issue.startsWith("[error]") || issue.startsWith("[pageerror]"),
      );
      const hydrationWarnings = consoleIssues.filter((issue) => /hydrat|mismatch/i.test(issue));
      expect(errors, errors.join("\n")).toEqual([]);
      expect(hydrationWarnings, hydrationWarnings.join("\n")).toEqual([]);
    });
  }
});
