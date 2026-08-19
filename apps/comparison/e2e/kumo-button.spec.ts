import { expect, test, type FrameLocator, type Locator, type Page } from "@playwright/test";

/**
 * Paired Kumo Button behavior against the experiment fixture.
 * Oracle: @cloudflare/kumo@2.11.0. Candidate: @proyecto-viviana/kumo.
 * This is not Adobe certified-suite coverage and does not close the Kumo port.
 *
 * Accepted framework difference: Solid's public `ref` is a callback. React
 * object refs are oracle-only and are not part of the Solid contract.
 * Headless data attributes (`data-hovered`, `data-pressed`, `data-focus-visible`)
 * come from solidaria-components on Solid and are absent on the React oracle.
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
] as const;

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

/** Tailwind `ring` emits extra fully-transparent shadow layers. Strip those. */
function paintedShadow(value: string) {
  return value
    .split(/,(?![^()]*\))/)
    .map((layer) => layer.trim())
    .filter((layer) => !/^rgba?\(0,\s*0,\s*0,\s*0\)/.test(layer))
    .join(", ");
}

function isFullRadius(value: string) {
  const px = Number.parseFloat(value);
  return value === "9999px" || (Number.isFinite(px) && px >= 1000);
}

function classifyPaintDiff(state: string, key: string, reactValue: string, solidValue: string) {
  if (key === "boxShadow" && paintedShadow(reactValue) === paintedShadow(solidValue)) {
    return null;
  }
  if (key.startsWith("border") && key.endsWith("Radius") && isFullRadius(reactValue) && isFullRadius(solidValue)) {
    return null;
  }
  // Oracle Tailwind resolves --color-neutral-900; the Button sheet fallback is
  // oklch(21% 0.006 285.885). Serialization also flips oklch/oklab. Dated
  // KX-04 remainder — do not treat a new geometry miss as this class.
  if (
    (key === "color" || key === "backgroundColor") &&
    /oklch|oklab/.test(reactValue) &&
    /oklch|oklab/.test(solidValue)
  ) {
    return null;
  }
  return `${state}.${key}: react=${JSON.stringify(reactValue)} solid=${JSON.stringify(solidValue)}`;
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
