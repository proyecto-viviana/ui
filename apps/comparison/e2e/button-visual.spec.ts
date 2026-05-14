import { expect, test, type Locator, type Page } from "@playwright/test";
import { frameworkCanvas, styledSection, waitForComparisonRouteReady } from "./comparison-page";
import {
  clearPointer,
  expectExactPreparedFixedScreenshotPair,
  expectExactPreparedScreenshotPair,
  expectExactScreenshotPair,
  pinComparisonTheme,
} from "./visual-diff";

type ButtonMatrixCase = {
  id: string;
  label: string;
  params: Record<string, string | boolean>;
};

const buttonMatrixCases: ButtonMatrixCase[] = [
  {
    id: "variant-primary-fill",
    label: "Button variant primary fill",
    params: { variant: "primary", fillStyle: "fill" },
  },
  {
    id: "variant-secondary-fill",
    label: "Button variant secondary fill",
    params: { variant: "secondary", fillStyle: "fill" },
  },
  {
    id: "variant-accent-fill",
    label: "Button variant accent fill",
    params: { variant: "accent", fillStyle: "fill" },
  },
  {
    id: "variant-negative-fill",
    label: "Button variant negative fill",
    params: { variant: "negative", fillStyle: "fill" },
  },
  {
    id: "variant-premium-fill",
    label: "Button variant premium fill",
    params: { variant: "premium", fillStyle: "fill" },
  },
  {
    id: "variant-genai-fill",
    label: "Button variant genai fill",
    params: { variant: "genai", fillStyle: "fill" },
  },
  {
    id: "variant-primary-outline",
    label: "Button variant primary outline",
    params: { variant: "primary", fillStyle: "outline" },
  },
  {
    id: "variant-secondary-outline",
    label: "Button variant secondary outline",
    params: { variant: "secondary", fillStyle: "outline" },
  },
  {
    id: "variant-accent-outline",
    label: "Button variant accent outline",
    params: { variant: "accent", fillStyle: "outline" },
  },
  {
    id: "variant-negative-outline",
    label: "Button variant negative outline",
    params: { variant: "negative", fillStyle: "outline" },
  },
  {
    id: "variant-premium-outline",
    label: "Button variant premium outline",
    params: { variant: "premium", fillStyle: "outline" },
  },
  {
    id: "variant-genai-outline",
    label: "Button variant genai outline",
    params: { variant: "genai", fillStyle: "outline" },
  },
  { id: "size-s", label: "Button size S", params: { size: "S" } },
  { id: "size-m", label: "Button size M", params: { size: "M" } },
  { id: "size-l", label: "Button size L", params: { size: "L" } },
  { id: "size-xl", label: "Button size XL", params: { size: "XL" } },
  {
    id: "static-white-fill",
    label: "Button staticColor white fill",
    params: { staticColor: "white", fillStyle: "fill" },
  },
  {
    id: "static-black-fill",
    label: "Button staticColor black fill",
    params: { staticColor: "black", fillStyle: "fill" },
  },
  {
    id: "static-auto-fill",
    label: "Button staticColor auto fill",
    params: { staticColor: "auto", fillStyle: "fill" },
  },
  {
    id: "static-white-outline",
    label: "Button staticColor white outline",
    params: { staticColor: "white", fillStyle: "outline" },
  },
  {
    id: "static-black-outline",
    label: "Button staticColor black outline",
    params: { staticColor: "black", fillStyle: "outline" },
  },
  {
    id: "static-auto-outline",
    label: "Button staticColor auto outline",
    params: { staticColor: "auto", fillStyle: "outline" },
  },
  { id: "disabled", label: "Button disabled", params: { isDisabled: true } },
  { id: "pending", label: "Button pending", params: { isPending: true } },
  { id: "icon-start", label: "Button icon start", params: { iconPlacement: "start" } },
  { id: "icon-only", label: "Button icon only", params: { iconPlacement: "only" } },
  {
    id: "icon-start-xl",
    label: "Button icon start XL",
    params: { iconPlacement: "start", size: "XL" },
  },
  {
    id: "icon-only-xl",
    label: "Button icon only XL",
    params: { iconPlacement: "only", size: "XL" },
  },
  {
    id: "icon-start-pending",
    label: "Button icon start pending",
    params: { iconPlacement: "start", isPending: true },
  },
];

const buttonForcedColorCases: ButtonMatrixCase[] = [
  { id: "default", label: "Button default forced colors", params: {} },
  {
    id: "outline",
    label: "Button outline forced colors",
    params: { fillStyle: "outline" },
  },
  {
    id: "disabled",
    label: "Button disabled forced colors",
    params: { isDisabled: true },
  },
  {
    id: "pending",
    label: "Button pending forced colors",
    params: { isPending: true },
  },
  {
    id: "premium",
    label: "Button premium forced colors",
    params: { variant: "premium" },
  },
];

async function frameworkCard(
  section: Locator,
  framework: "React Spectrum stack" | "Solidaria stack",
) {
  const card = section.locator(
    framework === "React Spectrum stack"
      ? '.s2-framework-panel[data-framework="react"]'
      : '.s2-framework-panel[data-framework="solid"]',
  );
  await expect(card).toHaveCount(1);
  return card;
}

function buttonQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    search.set(key, String(value));
  }
  const query = search.toString();
  return query ? `?${query}` : "";
}

async function buttonFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/button/${buttonQuery(params)}`);
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactCard = await frameworkCard(section, "React Spectrum stack");
  const solidCard = await frameworkCard(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");

  return {
    reactCanvas,
    solidCanvas,
    reactRow: reactCard.locator(".comparison-button-row"),
    solidRow: solidCard.locator(".comparison-button-row"),
    reactButton: reactCard.getByRole("button", { name: "Save" }),
    solidButton: solidCard.getByRole("button", { name: "Save" }),
    reactButtonElement: reactCard.locator("button").first(),
    solidButtonElement: solidCard.locator("button").first(),
  };
}

async function buttonComputedContract(button: Locator) {
  return button.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const label = element.querySelector('[data-rsp-slot="text"], [data-slot="label"]');
    const labelRect = label?.getBoundingClientRect();
    const buttonRect = element.getBoundingClientRect();
    const centerDelta = labelRect
      ? Number(
          (labelRect.top + labelRect.height / 2 - (buttonRect.top + buttonRect.height / 2)).toFixed(
            4,
          ),
        )
      : null;

    return {
      cursor: styles.cursor,
      backgroundColor: styles.backgroundColor,
      color: styles.color,
      borderColor: styles.borderColor,
      borderRadius: styles.borderRadius,
      borderWidth: styles.borderWidth,
      height: styles.height,
      padding: styles.padding,
      lineHeight: styles.lineHeight,
      direction: styles.direction,
      transform: styles.transform,
      willChange: styles.willChange,
      textCenterDelta: centerDelta,
    };
  });
}

async function setComparisonTheme(page: Page, theme: "light" | "dark") {
  await page.locator(`input[name="comparisonTheme"][value="${theme}"]`).check();
}

async function buttonGradientBackground(button: Locator) {
  return button.evaluate((element) => {
    const childGradient = Array.from(element.children)
      .map((child) => window.getComputedStyle(child).backgroundImage)
      .find((background) => background !== "none");
    const pseudoGradient = window.getComputedStyle(element, "::before").backgroundImage;

    return childGradient ?? pseudoGradient;
  });
}

async function buttonGradientContract(button: Locator) {
  return button.evaluate((element) => {
    const gradientElement = Array.from(element.children).find(
      (child) => window.getComputedStyle(child).backgroundImage !== "none",
    );
    if (!gradientElement) {
      return null;
    }

    const styles = window.getComputedStyle(gradientElement);
    return {
      backgroundImage: styles.backgroundImage,
      colorScheme: styles.colorScheme,
      g0: styles.getPropertyValue("--g0").trim(),
      g1: styles.getPropertyValue("--g1").trim(),
      g2: styles.getPropertyValue("--g2").trim(),
      gp: styles.getPropertyValue("--gp").trim(),
    };
  });
}

async function buttonParityContract(reactButton: Locator, solidButton: Locator) {
  const react = await buttonComputedContract(reactButton);
  const solid = await buttonComputedContract(solidButton);
  const reactGradient = await buttonGradientContract(reactButton);
  const solidGradient = await buttonGradientContract(solidButton);

  return {
    buttonMatches: JSON.stringify(solid) === JSON.stringify(react),
    gradientMatches: JSON.stringify(solidGradient) === JSON.stringify(reactGradient),
    react,
    solid,
    reactGradient,
    solidGradient,
  };
}

async function buttonFullContract(button: Locator) {
  return {
    button: await buttonComputedContract(button),
    gradient: await buttonGradientContract(button),
  };
}

async function buttonPendingVisualContract(button: Locator) {
  const contract = await buttonFullContract(button);

  return {
    backgroundColor: contract.button.backgroundColor,
    color: contract.button.color,
    borderColor: contract.button.borderColor,
    borderWidth: contract.button.borderWidth,
    gradientBackground: contract.gradient?.backgroundImage ?? null,
  };
}

type ButtonIconPlacement = "start" | "only";
type ButtonIconAlignmentCase = {
  iconPlacement: ButtonIconPlacement;
  size: "S" | "M" | "L" | "XL";
};

const buttonIconAlignmentCases: ButtonIconAlignmentCase[] = [
  { iconPlacement: "start", size: "S" },
  { iconPlacement: "start", size: "M" },
  { iconPlacement: "start", size: "L" },
  { iconPlacement: "start", size: "XL" },
  { iconPlacement: "only", size: "S" },
  { iconPlacement: "only", size: "M" },
  { iconPlacement: "only", size: "L" },
  { iconPlacement: "only", size: "XL" },
];

function expectNear(
  actual: number | null,
  expected: number | null,
  tolerance: number,
  label: string,
) {
  expect(actual, `${label} actual value`).not.toBeNull();
  expect(expected, `${label} expected value`).not.toBeNull();
  expect(Math.abs((actual ?? 0) - (expected ?? 0)), label).toBeLessThanOrEqual(tolerance);
}

async function buttonIconAlignmentContract(button: Locator) {
  return button.evaluate((element) => {
    const numberOrNull = (value: number | undefined | null) =>
      value == null ? null : Number(value.toFixed(4));
    const rootRect = element.getBoundingClientRect();
    const rootCenterY = rootRect.top + rootRect.height / 2;
    const svgs = Array.from(element.querySelectorAll("svg"));
    const icon = svgs.find((svg) => {
      const styles = window.getComputedStyle(svg);
      return svg.closest('[role="progressbar"]') == null && styles.visibility !== "hidden";
    });
    const label = element.querySelector<HTMLElement>('[data-rsp-slot="text"], [data-slot="label"]');
    const iconRect = icon?.getBoundingClientRect();
    const labelRect = label?.getBoundingClientRect();
    const iconCenterY = iconRect ? iconRect.top + iconRect.height / 2 : null;
    const labelCenterY = labelRect ? labelRect.top + labelRect.height / 2 : null;
    const order =
      iconRect && labelRect ? (iconRect.left < labelRect.left ? "start" : "end") : "only";
    const gap =
      iconRect && labelRect
        ? order === "start"
          ? labelRect.left - iconRect.right
          : iconRect.left - labelRect.right
        : null;

    return {
      rootHeight: Number(rootRect.height.toFixed(4)),
      rootWidth: Number(rootRect.width.toFixed(4)),
      order,
      iconWidth: numberOrNull(iconRect?.width),
      iconHeight: numberOrNull(iconRect?.height),
      iconCenterDelta: numberOrNull(iconCenterY == null ? null : iconCenterY - rootCenterY),
      labelCenterDelta: numberOrNull(labelCenterY == null ? null : labelCenterY - rootCenterY),
      iconLabelCenterDelta: numberOrNull(
        iconCenterY == null || labelCenterY == null ? null : iconCenterY - labelCenterY,
      ),
      gap: numberOrNull(gap),
    };
  });
}

async function buttonDirectionContract(button: Locator) {
  return button.evaluate((element) => ({
    providerDir: element.closest("[dir]")?.getAttribute("dir") ?? null,
    direction: window.getComputedStyle(element).direction,
  }));
}

async function buttonPendingAlignmentContract(button: Locator) {
  return button.evaluate((element) => {
    const numberOrNull = (value: number | undefined | null) =>
      value == null ? null : Number(value.toFixed(4));
    const rootRect = element.getBoundingClientRect();
    const rootCenterY = rootRect.top + rootRect.height / 2;
    const progress = element.querySelector<HTMLElement>('[role="progressbar"]');
    const progressRect = progress?.getBoundingClientRect();
    const progressCenterY = progressRect ? progressRect.top + progressRect.height / 2 : null;
    const icon = Array.from(element.querySelectorAll("svg")).find(
      (svg) => svg.closest('[role="progressbar"]') == null,
    );
    const label = element.querySelector<HTMLElement>('[data-rsp-slot="text"], [data-slot="label"]');

    return {
      rootHeight: Number(rootRect.height.toFixed(4)),
      progressWidth: numberOrNull(progressRect?.width),
      progressHeight: numberOrNull(progressRect?.height),
      progressCenterDelta: numberOrNull(
        progressCenterY == null ? null : progressCenterY - rootCenterY,
      ),
      iconVisibility: icon ? window.getComputedStyle(icon).visibility : null,
      labelVisibility: label ? window.getComputedStyle(label).visibility : null,
    };
  });
}

async function buttonPendingProgressCircleContract(button: Locator) {
  return button.evaluate((element) => {
    const progress = element.querySelector<HTMLElement>('[role="progressbar"]');
    const progressStyles = progress ? window.getComputedStyle(progress) : null;
    const circles = progress ? Array.from(progress.querySelectorAll("circle")) : [];
    const circleStyles = circles.map((circle) => window.getComputedStyle(circle));

    return {
      containerBackground: progressStyles?.getPropertyValue("--s2-container-bg").trim() ?? null,
      hcmStroke: circleStyles[0]?.stroke ?? null,
      hcmStrokeWidth: circleStyles[0]?.strokeWidth ?? null,
      trackStroke: circleStyles[1]?.stroke ?? null,
      trackStrokeWidth: circleStyles[1]?.strokeWidth ?? null,
      fillStroke: circleStyles[2]?.stroke ?? null,
      fillStrokeWidth: circleStyles[2]?.strokeWidth ?? null,
      fillRotate: circleStyles[2]?.rotate ?? null,
      fillTransformOrigin: circleStyles[2]?.transformOrigin ?? null,
      fillStrokeLinecap: circles[2]?.getAttribute("stroke-linecap") ?? null,
      fillStrokeDasharray: circles[2]?.getAttribute("stroke-dasharray") ?? null,
    };
  });
}

async function expectButtonParitySettled(reactButton: Locator, solidButton: Locator) {
  await expect
    .poll(() => buttonParityContract(reactButton, solidButton), {
      intervals: [50, 100, 200, 300],
      timeout: 1_500,
    })
    .toMatchObject({
      buttonMatches: true,
      gradientMatches: true,
    });
}

async function expectComputedButtonParity(reactButton: Locator, solidButton: Locator) {
  expect(await buttonComputedContract(solidButton)).toEqual(
    await buttonComputedContract(reactButton),
  );
}

async function expectExactButtonPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  label: string,
) {
  await expectExactScreenshotPair(page, reactTarget, solidTarget, label);
}

async function expectExactPreparedButtonPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  label: string,
  prepareReact: () => Promise<void>,
  prepareSolid: () => Promise<void>,
) {
  await expectExactPreparedScreenshotPair(
    page,
    reactTarget,
    solidTarget,
    label,
    prepareReact,
    prepareSolid,
  );
}

async function expectExactPreparedFixedButtonPair(
  page: Page,
  reactTarget: Locator,
  solidTarget: Locator,
  label: string,
  prepareReact: () => Promise<void>,
  prepareSolid: () => Promise<void>,
) {
  await expectExactPreparedFixedScreenshotPair(
    page,
    reactTarget,
    solidTarget,
    label,
    prepareReact,
    prepareSolid,
  );
}

test.describe("comparison Button visual parity", () => {
  test("Button default control is pixel-identical", async ({ page }) => {
    const fixtures = await buttonFixtures(page);

    await clearPointer(page);
    await expectExactButtonPair(
      page,
      fixtures.reactRow,
      fixtures.solidRow,
      "Button default control",
    );
  });

  test("Button hover state is pixel-identical", async ({ page }) => {
    const fixtures = await buttonFixtures(page);

    await expectExactPreparedFixedButtonPair(
      page,
      fixtures.reactRow,
      fixtures.solidRow,
      "Button hover",
      async () => {
        await fixtures.reactButton.hover();
        await expect(fixtures.reactButton).toHaveAttribute("data-hovered", "true");
      },
      async () => {
        await fixtures.solidButton.hover();
        await expect(fixtures.solidButton).toHaveAttribute("data-hovered", "true");
      },
    );
  });

  test("Button focus-visible state is pixel-identical", async ({ page }) => {
    const fixtures = await buttonFixtures(page);

    await expectExactPreparedButtonPair(
      page,
      fixtures.reactCanvas,
      fixtures.solidCanvas,
      "Button focus-visible",
      async () => {
        await fixtures.reactButton.focus();
        await expect(fixtures.reactButton).toHaveAttribute("data-focus-visible", "true");
      },
      async () => {
        await fixtures.solidButton.focus();
        await expect(fixtures.solidButton).toHaveAttribute("data-focus-visible", "true");
      },
    );
  });

  test("Button pressed state is pixel-identical", async ({ page }) => {
    const fixtures = await buttonFixtures(page);

    await expectExactPreparedFixedButtonPair(
      page,
      fixtures.reactRow,
      fixtures.solidRow,
      "Button pressed",
      async () => {
        await fixtures.reactButton.hover();
        await page.mouse.down();
        await expect(fixtures.reactButton).toHaveAttribute("data-pressed", "true");
      },
      async () => {
        await fixtures.solidButton.hover();
        await page.mouse.down();
        await expect(fixtures.solidButton).toHaveAttribute("data-pressed", "true");
      },
    );
  });

  test("Button delayed pending spinner is pixel-identical", async ({ page }) => {
    const fixtures = await buttonFixtures(page, { isPending: true });

    await expect(fixtures.reactRow.getByRole("progressbar", { name: "pending" })).toBeVisible();
    await expect(fixtures.solidRow.getByRole("progressbar", { name: "pending" })).toBeVisible();
    await expectExactButtonPair(
      page,
      fixtures.reactRow,
      fixtures.solidRow,
      "Button delayed pending spinner",
    );
  });

  test("Button prop controls drive both implementations", async ({ page }) => {
    const fixtures = await buttonFixtures(page);

    await page.getByLabel("children").fill("Delete");
    await page.getByLabel("variant").selectOption("negative");
    await page.locator('input[name="fillStyle"][value="outline"]').check();
    await page.locator('input[name="size"][value="L"]').check();
    await page.locator('input[name="staticColor"][value="white"]').check();

    const reactRoot = fixtures.reactCanvas.locator("[data-comparison-button-props]").first();
    const solidRoot = fixtures.solidCanvas.locator("[data-comparison-button-props]").first();
    const expected = JSON.stringify({
      children: "Delete",
      variant: "negative",
      fillStyle: "outline",
      size: "L",
      staticColor: "white",
      iconPlacement: "none",
      isDisabled: false,
      isPending: false,
    });

    await expect(reactRoot).toHaveAttribute("data-comparison-button-props", expected);
    await expect(solidRoot).toHaveAttribute("data-comparison-button-props", expected);
    await expect(fixtures.reactCanvas.getByRole("button", { name: "Delete" })).toBeVisible();
    await expect(fixtures.solidCanvas.getByRole("button", { name: "Delete" })).toHaveAttribute(
      "data-variant",
      "negative",
    );
    await expect(fixtures.solidCanvas.getByRole("button", { name: "Delete" })).toHaveAttribute(
      "data-style",
      "outline",
    );
    await expect(fixtures.solidCanvas.getByRole("button", { name: "Delete" })).toHaveAttribute(
      "data-size",
      "L",
    );
  });

  test("Button color scheme control drives React and Solid examples", async ({ page }) => {
    const fixtures = await buttonFixtures(page);

    await setComparisonTheme(page, "light");
    await expect(fixtures.solidCanvas.locator("[data-comparison-color-scheme]")).toHaveAttribute(
      "data-comparison-color-scheme",
      "light",
    );
    await expect
      .poll(async () => ({
        react: await buttonComputedContract(fixtures.reactButton),
        solid: await buttonComputedContract(fixtures.solidButton),
      }))
      .toMatchObject({
        react: {
          backgroundColor: "rgb(41, 41, 41)",
          color: "rgb(255, 255, 255)",
          borderColor: "rgb(41, 41, 41)",
        },
        solid: {
          backgroundColor: "rgb(41, 41, 41)",
          color: "rgb(255, 255, 255)",
          borderColor: "rgb(41, 41, 41)",
        },
      });

    await setComparisonTheme(page, "dark");
    await expect(fixtures.solidCanvas.locator("[data-comparison-color-scheme]")).toHaveAttribute(
      "data-comparison-color-scheme",
      "dark",
    );
    await expect
      .poll(async () => ({
        react: await buttonComputedContract(fixtures.reactButton),
        solid: await buttonComputedContract(fixtures.solidButton),
      }))
      .toMatchObject({
        react: {
          backgroundColor: "rgb(219, 219, 219)",
          color: "rgb(17, 17, 17)",
          borderColor: "rgb(219, 219, 219)",
        },
        solid: {
          backgroundColor: "rgb(219, 219, 219)",
          color: "rgb(17, 17, 17)",
          borderColor: "rgb(219, 219, 219)",
        },
      });
  });

  test("Button light theme variant styles match React Spectrum", async ({ page }) => {
    const variants = ["primary", "secondary", "accent", "negative"] as const;
    const fillStyles = ["fill", "outline"] as const;

    for (const fillStyle of fillStyles) {
      for (const variant of variants) {
        const fixtures = await buttonFixtures(page, { variant, fillStyle });

        await setComparisonTheme(page, "light");
        await expect
          .poll(async () => {
            const react = await buttonComputedContract(fixtures.reactButton);
            const solid = await buttonComputedContract(fixtures.solidButton);
            return JSON.stringify({
              react,
              solid,
              matches: JSON.stringify(react) === JSON.stringify(solid),
            });
          })
          .toContain('"matches":true');
      }
    }
  });

  test("Button light theme hover styles match React Spectrum", async ({ page }) => {
    const variants = ["primary", "secondary", "accent", "negative"] as const;
    const fillStyles = ["fill", "outline"] as const;

    for (const fillStyle of fillStyles) {
      for (const variant of variants) {
        const fixtures = await buttonFixtures(page, { variant, fillStyle });

        await setComparisonTheme(page, "light");
        await fixtures.reactButton.hover();
        await expect(fixtures.reactButton).toHaveAttribute("data-hovered", "true");
        await page.waitForTimeout(220);
        const reactContract = await buttonComputedContract(fixtures.reactButton);

        await fixtures.solidButton.hover();
        await expect(fixtures.solidButton).toHaveAttribute("data-hovered", "true");
        await page.waitForTimeout(220);
        expect(await buttonComputedContract(fixtures.solidButton)).toEqual(reactContract);
      }
    }
  });

  test("Button premium and genai gradient states match React Spectrum", async ({ page }) => {
    for (const colorScheme of ["light", "dark"] as const) {
      for (const variant of ["premium", "genai"] as const) {
        const fixtures = await buttonFixtures(page, { variant, fillStyle: "fill" });
        await setComparisonTheme(page, colorScheme);
        await clearPointer(page);
        await expectButtonParitySettled(fixtures.reactButton, fixtures.solidButton);

        await fixtures.reactButton.hover();
        await expect(fixtures.reactButton).toHaveAttribute("data-hovered", "true");
        await page.waitForTimeout(220);
        const reactHover = await buttonFullContract(fixtures.reactButton);

        await fixtures.solidButton.hover();
        await expect(fixtures.solidButton).toHaveAttribute("data-hovered", "true");
        await page.waitForTimeout(220);
        expect(await buttonFullContract(fixtures.solidButton)).toEqual(reactHover);

        await fixtures.reactButton.hover();
        await page.waitForTimeout(220);
        await page.mouse.down();
        await expect(fixtures.reactButton).toHaveAttribute("data-pressed", "true");
        await page.waitForTimeout(220);
        const reactPressed = await buttonFullContract(fixtures.reactButton);
        await page.mouse.up();

        await fixtures.solidButton.hover();
        await page.waitForTimeout(220);
        await page.mouse.down();
        await expect(fixtures.solidButton).toHaveAttribute("data-pressed", "true");
        await page.waitForTimeout(220);
        expect(await buttonFullContract(fixtures.solidButton)).toEqual(reactPressed);
        await page.mouse.up();
      }
    }
  });

  test("Button outline L and XL text remains centered like React Spectrum", async ({ page }) => {
    for (const size of ["L", "XL"] as const) {
      const fixtures = await buttonFixtures(page, {
        variant: "primary",
        fillStyle: "outline",
        size,
      });

      await expectComputedButtonParity(fixtures.reactButton, fixtures.solidButton);
      const solidContract = await buttonComputedContract(fixtures.solidButton);
      expect(solidContract.textCenterDelta).toBe(0);
    }
  });

  test("Button staticColor computed styles match React Spectrum across variants", async ({
    page,
  }) => {
    const variants = ["primary", "secondary", "accent", "negative", "premium", "genai"] as const;
    const fillStyles = ["fill", "outline"] as const;
    const staticColors = ["white", "black"] as const;

    for (const staticColor of staticColors) {
      for (const fillStyle of fillStyles) {
        for (const variant of variants) {
          const fixtures = await buttonFixtures(page, { variant, fillStyle, staticColor });

          await expectComputedButtonParity(fixtures.reactButton, fixtures.solidButton);
          if (variant === "premium" || variant === "genai") {
            await expect(buttonGradientBackground(fixtures.solidButton)).resolves.toBe(
              await buttonGradientBackground(fixtures.reactButton),
            );
          }
        }
      }
    }
  });

  test("Button pending styles normalize variant color across variants", async ({ page }) => {
    const variants = ["primary", "secondary", "accent", "negative", "premium", "genai"] as const;
    const fillStyles = ["fill", "outline"] as const;
    let fillPendingBaseline: Awaited<ReturnType<typeof buttonPendingVisualContract>> | undefined;
    let outlinePendingBaseline: Awaited<ReturnType<typeof buttonPendingVisualContract>> | undefined;

    for (const fillStyle of fillStyles) {
      for (const variant of variants) {
        const fixtures = await buttonFixtures(page, { variant, fillStyle, isPending: true });

        await expect(fixtures.reactRow.getByRole("progressbar", { name: "pending" })).toBeVisible();
        await expect(fixtures.solidRow.getByRole("progressbar", { name: "pending" })).toBeVisible();
        await expectButtonParitySettled(fixtures.reactButtonElement, fixtures.solidButtonElement);

        const solidPending = await buttonPendingVisualContract(fixtures.solidButtonElement);
        const shouldUseOutlineBaseline =
          fillStyle === "outline" && variant !== "premium" && variant !== "genai";

        if (shouldUseOutlineBaseline) {
          outlinePendingBaseline ??= solidPending;
          expect(solidPending).toEqual(outlinePendingBaseline);
        } else {
          fillPendingBaseline ??= solidPending;
          expect(solidPending).toEqual(fillPendingBaseline);
        }
      }
    }
  });

  test("Button pending ProgressCircle colors match React Spectrum across variants and staticColor", async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const variants = ["primary", "secondary", "accent", "negative", "premium", "genai"] as const;
    const fillStyles = ["fill", "outline"] as const;
    const staticColors = [undefined, "white", "black", "auto"] as const;

    for (const staticColor of staticColors) {
      for (const fillStyle of fillStyles) {
        for (const variant of variants) {
          const fixtures = await buttonFixtures(page, {
            variant,
            fillStyle,
            isPending: true,
            ...(staticColor ? { staticColor } : {}),
          });

          await expect(
            fixtures.reactRow.getByRole("progressbar", { name: "pending" }),
          ).toBeVisible();
          await expect(
            fixtures.solidRow.getByRole("progressbar", { name: "pending" }),
          ).toBeVisible();
          await expect(
            buttonPendingProgressCircleContract(fixtures.solidButtonElement),
          ).resolves.toEqual(
            await buttonPendingProgressCircleContract(fixtures.reactButtonElement),
          );
        }
      }
    }
  });

  test("Button icon geometry is aligned with React Spectrum across placements and sizes", async ({
    page,
  }) => {
    for (const item of buttonIconAlignmentCases) {
      await test.step(`${item.iconPlacement} ${item.size}`, async () => {
        const fixtures = await buttonFixtures(page, item);
        const react = await buttonIconAlignmentContract(fixtures.reactButtonElement);
        const solid = await buttonIconAlignmentContract(fixtures.solidButtonElement);

        expect(solid.order).toBe(react.order);
        expectNear(solid.rootHeight, react.rootHeight, 0.5, "button root height");
        expectNear(solid.iconWidth, react.iconWidth, 0.5, "icon width");
        expectNear(solid.iconHeight, react.iconHeight, 0.5, "icon height");
        expectNear(solid.iconCenterDelta, react.iconCenterDelta, 0.75, "icon vertical centerline");
        expect(
          Math.abs(solid.iconCenterDelta ?? 0),
          "solid icon root centerline",
        ).toBeLessThanOrEqual(1);

        if (item.iconPlacement === "only") {
          expect(solid.labelCenterDelta).toBeNull();
          expect(solid.gap).toBeNull();
        } else {
          expectNear(
            solid.labelCenterDelta,
            react.labelCenterDelta,
            0.75,
            "text vertical centerline",
          );
          expectNear(
            solid.iconLabelCenterDelta,
            react.iconLabelCenterDelta,
            0.75,
            "icon-to-text vertical centerline",
          );
          expectNear(solid.gap, react.gap, 1, "icon text gap");
        }
      });
    }
  });

  test("Button RTL icon geometry matches React Spectrum", async ({ page }) => {
    const fixtures = await buttonFixtures(page, {
      locale: "ar-SA",
      iconPlacement: "start",
      size: "M",
    });

    await expectComputedButtonParity(fixtures.reactButton, fixtures.solidButton);
    const reactDirection = await buttonDirectionContract(fixtures.reactButtonElement);
    const solidDirection = await buttonDirectionContract(fixtures.solidButtonElement);

    expect(reactDirection).toEqual({
      providerDir: "rtl",
      direction: "rtl",
    });
    expect(solidDirection).toEqual(reactDirection);

    const react = await buttonIconAlignmentContract(fixtures.reactButtonElement);
    const solid = await buttonIconAlignmentContract(fixtures.solidButtonElement);

    expect(solid.order).toBe(react.order);
    expectNear(solid.rootHeight, react.rootHeight, 0.5, "RTL button root height");
    expectNear(solid.iconWidth, react.iconWidth, 0.5, "RTL icon width");
    expectNear(solid.iconHeight, react.iconHeight, 0.5, "RTL icon height");
    expectNear(solid.iconCenterDelta, react.iconCenterDelta, 0.75, "RTL icon centerline");
    expectNear(solid.labelCenterDelta, react.labelCenterDelta, 0.75, "RTL label centerline");
    expectNear(solid.gap, react.gap, 1, "RTL icon text gap");
  });

  test("Button pending indicator remains centered when icon content is present", async ({
    page,
  }) => {
    for (const item of [
      { iconPlacement: "start", size: "M" },
      { iconPlacement: "only", size: "M" },
      { iconPlacement: "start", size: "XL" },
    ] satisfies ButtonIconAlignmentCase[]) {
      await test.step(`${item.iconPlacement} ${item.size}`, async () => {
        const fixtures = await buttonFixtures(page, { ...item, isPending: true });
        await expect(fixtures.reactRow.getByRole("progressbar", { name: "pending" })).toBeVisible();
        await expect(fixtures.solidRow.getByRole("progressbar", { name: "pending" })).toBeVisible();

        const react = await buttonPendingAlignmentContract(fixtures.reactButtonElement);
        const solid = await buttonPendingAlignmentContract(fixtures.solidButtonElement);

        expectNear(solid.rootHeight, react.rootHeight, 0.5, "pending button root height");
        expectNear(solid.progressWidth, react.progressWidth, 0.5, "pending progress width");
        expectNear(solid.progressHeight, react.progressHeight, 0.5, "pending progress height");
        expectNear(
          solid.progressCenterDelta,
          react.progressCenterDelta,
          0.75,
          "pending progress vertical centerline",
        );
        expect(
          Math.abs(solid.progressCenterDelta ?? 0),
          "solid pending progress root centerline",
        ).toBeLessThanOrEqual(1);
        expect(solid.iconVisibility).toBe(react.iconVisibility);
        expect(solid.labelVisibility).toBe(react.labelVisibility);
      });
    }
  });

  test("Button forced-colors computed styles match React Spectrum", async ({ page }) => {
    await page.emulateMedia({ forcedColors: "active" });

    for (const item of buttonForcedColorCases) {
      await test.step(item.label, async () => {
        const fixtures = await buttonFixtures(page, item.params);

        if (item.params.isPending === true) {
          await expect(
            fixtures.reactRow.getByRole("progressbar", { name: "pending" }),
          ).toBeVisible();
          await expect(
            fixtures.solidRow.getByRole("progressbar", { name: "pending" }),
          ).toBeVisible();
          await page.waitForTimeout(250);
        }

        await expectButtonParitySettled(fixtures.reactButtonElement, fixtures.solidButtonElement);
        expect(await buttonFullContract(fixtures.solidButtonElement)).toEqual(
          await buttonFullContract(fixtures.reactButtonElement),
        );
      });
    }
  });

  for (const item of buttonMatrixCases) {
    test(`${item.label} is pixel-identical`, async ({ page }) => {
      const fixtures = await buttonFixtures(page, item.params);

      if (item.params.isPending === true) {
        await expect(fixtures.reactRow.getByRole("progressbar", { name: "pending" })).toBeVisible();
        await expect(fixtures.solidRow.getByRole("progressbar", { name: "pending" })).toBeVisible();
      }

      await clearPointer(page);
      await expectExactButtonPair(page, fixtures.reactRow, fixtures.solidRow, item.label);
    });
  }
});
