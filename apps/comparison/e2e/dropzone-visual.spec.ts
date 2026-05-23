import { expect, test, type JSHandle, type Locator, type Page } from "@playwright/test";
import {
  frameworkCanvas,
  frameworkPanel,
  styledSection,
  waitForComparisonRouteReady,
} from "./comparison-page";
import {
  clearPointer,
  expectExactPreparedInPlaceScreenshotPair,
  pinComparisonTheme,
} from "./visual-diff";
import { dropZoneSizeOptions } from "../src/data/dropzone-demo";

function dropZoneQuery(params: Record<string, string | boolean> = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== "" && value !== false) {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
}

async function dropZoneFixtures(page: Page, params: Record<string, string | boolean> = {}) {
  await pinComparisonTheme(page, "dark");
  await page.goto(`/components/dropzone/${dropZoneQuery(params)}`);
  await page.addStyleTag({
    content: ".s2-topbar, astro-dev-toolbar { visibility: hidden !important; }",
  });
  await waitForComparisonRouteReady(page);
  await clearPointer(page);

  const section = await styledSection(page);
  const reactPanel = await frameworkPanel(section, "React Spectrum stack");
  const solidPanel = await frameworkPanel(section, "Solidaria stack");
  const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
  const solidCanvas = await frameworkCanvas(section, "Solidaria stack");
  const reactRoot = reactPanel.locator('[data-comparison-control-root="dropzone"]').first();
  const solidRoot = solidPanel.locator('[data-comparison-control-root="dropzone"]').first();

  await expect(reactRoot).toBeVisible();
  await expect(solidRoot).toBeVisible();

  return { reactCanvas, solidCanvas, reactPanel, solidPanel, reactRoot, solidRoot };
}

async function createDataTransfer(page: Page) {
  return page.evaluateHandle(() => {
    const dataTransfer = new DataTransfer();
    Object.defineProperty(dataTransfer, "effectAllowed", { value: "copy", configurable: true });
    dataTransfer.items.add(new File(["hello"], "hello.txt", { type: "text/plain" }));
    return dataTransfer;
  });
}

type DropZoneDragEvent = "dragenter" | "dragover" | "dragleave" | "drop";
type DragPoint = { x: number; y: number };

async function dispatchDrag(
  root: Locator,
  type: DropZoneDragEvent,
  dataTransfer: JSHandle<DataTransfer>,
  point: DragPoint = { x: 16, y: 16 },
) {
  await root.dispatchEvent(type, {
    clientX: point.x,
    clientY: point.y,
    dataTransfer,
  });
}

async function runDragGesture(
  root: Locator,
  steps: Array<{ type: DropZoneDragEvent; point?: DragPoint }>,
) {
  const dataTransfer = await createDataTransfer(root.page());
  try {
    for (const step of steps) {
      await dispatchDrag(root, step.type, dataTransfer, step.point);
    }
  } finally {
    await dataTransfer.dispose();
  }
}

async function enterDropTarget(root: Locator) {
  await runDragGesture(root, [
    { type: "dragenter" },
    { type: "dragover", point: { x: 24, y: 24 } },
  ]);
}

async function exerciseDropCallbacks(root: Locator) {
  await root.locator("button").first().dispatchEvent("click");
  await runDragGesture(root, [
    { type: "dragenter" },
    { type: "dragover", point: { x: 24, y: 24 } },
    { type: "dragleave", point: { x: 32, y: 32 } },
  ]);
  await runDragGesture(root, [
    { type: "dragenter" },
    { type: "dragover", point: { x: 24, y: 24 } },
    { type: "drop", point: { x: 32, y: 32 } },
  ]);
}

async function dropZoneContract(root: Locator) {
  return root.evaluate((element) => {
    const styles = window.getComputedStyle(element);
    const button = element.querySelector("button");
    const illustratedMessage = element.querySelector("svg")?.parentElement ?? null;
    const illustration = element.querySelector("svg");
    const illustrationStyles = illustration ? window.getComputedStyle(illustration) : null;
    const banner = Array.from(element.children).find((child) =>
      (child.textContent ?? "").includes("replace"),
    );
    const bannerStyles = banner ? window.getComputedStyle(banner) : null;

    return {
      tagName: element.tagName,
      id: element.getAttribute("id"),
      ariaLabel: element.getAttribute("aria-label"),
      ariaDescribedBy: element.getAttribute("aria-describedby"),
      ariaDetails: element.getAttribute("aria-details"),
      dataDropTarget: element.getAttribute("data-drop-target"),
      dataComparisonRoot: element.getAttribute("data-comparison-control-root"),
      dataComparisonProps: element.getAttribute("data-comparison-control-props"),
      activateCount: element.getAttribute("data-comparison-drop-activate-count"),
      dropCount: element.getAttribute("data-comparison-drop-count"),
      enterCount: element.getAttribute("data-comparison-drop-enter-count"),
      exitCount: element.getAttribute("data-comparison-drop-exit-count"),
      moveCount: element.getAttribute("data-comparison-drop-move-count"),
      buttonName: button?.getAttribute("aria-label") ?? null,
      text: element.textContent?.replace(/\s+/g, " ").trim() ?? "",
      display: styles.display,
      alignItems: styles.alignItems,
      justifyContent: styles.justifyContent,
      position: styles.position,
      fontFamily: styles.fontFamily,
      color: styles.color,
      borderStyle: styles.borderStyle,
      borderWidth: styles.borderWidth,
      borderColor: styles.borderColor,
      borderRadius: styles.borderRadius,
      paddingTop: styles.paddingTop,
      paddingRight: styles.paddingRight,
      paddingBottom: styles.paddingBottom,
      paddingLeft: styles.paddingLeft,
      backgroundColor: styles.backgroundColor,
      boxSizing: styles.boxSizing,
      width: styles.width,
      minHeight: styles.minHeight,
      illustratedMessageDisplay: illustratedMessage
        ? window.getComputedStyle(illustratedMessage).display
        : null,
      illustrationPrimary: illustrationStyles?.getPropertyValue("--iconPrimary") ?? null,
      bannerText: banner?.textContent?.replace(/\s+/g, " ").trim() ?? null,
      bannerDisplay: bannerStyles?.display ?? null,
      bannerBackgroundColor: bannerStyles?.backgroundColor ?? null,
      bannerColor: bannerStyles?.color ?? null,
    };
  });
}

async function expectRadioValues(
  page: Page,
  name: string,
  values: readonly string[],
  checked: string,
) {
  await expect(
    page
      .locator(`input[name="${name}"]`)
      .evaluateAll((inputs) => inputs.map((input) => (input as HTMLInputElement).value)),
  ).resolves.toEqual([...values]);
  await expect(page.locator(`input[name="${name}"]:checked`)).toHaveValue(checked);
}

test.describe("comparison DropZone visual parity", () => {
  test("DropZone default state is pixel-identical", async ({ page }) => {
    const fixtures = await dropZoneFixtures(page);

    await expectExactPreparedInPlaceScreenshotPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "DropZone default",
      async () => {},
      async () => {},
    );
  });

  test("DropZone prop controls match the S2 viewer surface and drive both implementations", async ({
    page,
  }) => {
    const fixtures = await dropZoneFixtures(page, {
      size: "L",
      isFilled: true,
      replaceMessage: "Replace current file",
      ariaLabel: "Project upload",
    });

    await expectRadioValues(page, "size", dropZoneSizeOptions, "L");
    await expect(page.locator('input[name="isFilled"]')).toBeChecked();
    await expect(page.locator('input[name="replaceMessage"]')).toHaveValue("Replace current file");
    await expect(page.locator('input[name="ariaLabel"]')).toHaveValue("Project upload");

    const expectedProps = JSON.stringify({
      size: "L",
      isFilled: true,
      replaceMessage: "Replace current file",
      ariaLabel: "Project upload",
    });

    await expect(fixtures.reactRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
    await expect(fixtures.solidRoot).toHaveAttribute(
      "data-comparison-control-props",
      expectedProps,
    );
  });

  test("DropZone root contract matches React Spectrum across sizes and labels", async ({
    page,
  }) => {
    for (const params of [
      { size: "S", ariaLabel: "Small upload" },
      { size: "M", ariaLabel: "Upload files" },
      {
        size: "L",
        isFilled: true,
        replaceMessage: "Replace current file",
        ariaLabel: "Project upload",
      },
    ] as const) {
      const fixtures = await dropZoneFixtures(page, params);

      await expect(dropZoneContract(fixtures.solidRoot)).resolves.toEqual(
        await dropZoneContract(fixtures.reactRoot),
      );
    }
  });

  test("DropZone filled drag target state is pixel-identical", async ({ page }) => {
    const fixtures = await dropZoneFixtures(page, {
      isFilled: true,
      replaceMessage: "Drop file to replace",
    });

    await expectExactPreparedInPlaceScreenshotPair(
      page,
      fixtures.reactRoot,
      fixtures.solidRoot,
      "DropZone filled drag target",
      () => enterDropTarget(fixtures.reactRoot),
      () => enterDropTarget(fixtures.solidRoot),
    );

    await expect(fixtures.reactRoot).toHaveAttribute("data-drop-target", "true");
    await expect(fixtures.solidRoot).toHaveAttribute("data-drop-target", "true");
    await expect(dropZoneContract(fixtures.solidRoot)).resolves.toEqual(
      await dropZoneContract(fixtures.reactRoot),
    );
  });

  test("DropZone drop callbacks match React Spectrum", async ({ page }) => {
    const fixtures = await dropZoneFixtures(page);

    await exerciseDropCallbacks(fixtures.reactRoot);
    await exerciseDropCallbacks(fixtures.solidRoot);

    await expect(fixtures.reactRoot).toHaveAttribute("data-comparison-drop-count", "1");
    await expect(fixtures.solidRoot).toHaveAttribute("data-comparison-drop-count", "1");
    await expect(fixtures.reactRoot).not.toHaveAttribute("data-comparison-drop-enter-count", "0");
    await expect(fixtures.solidRoot).not.toHaveAttribute("data-comparison-drop-enter-count", "0");
    await expect(fixtures.reactRoot).not.toHaveAttribute("data-comparison-drop-move-count", "0");
    await expect(fixtures.solidRoot).not.toHaveAttribute("data-comparison-drop-move-count", "0");
    await expect(dropZoneContract(fixtures.solidRoot)).resolves.toEqual(
      await dropZoneContract(fixtures.reactRoot),
    );
  });
});
