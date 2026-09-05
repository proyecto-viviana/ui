import { writeFile } from "node:fs/promises";
import { expect, test, type TestInfo } from "@playwright/test";
import { defaultVisualCases } from "./default-state-cases";
import { frameworkCanvas, styledSection } from "./comparison-page";
import { diffScreenshots, pinComparisonTheme, type ScreenshotDiffResult } from "./visual-diff";

type PairDiffPolicy = {
  maxMismatchRatio: number;
  maxDimensionDelta: number;
  pixelThreshold: number;
  note: string;
  kind: "asserted" | "floor";
};

async function attachPairDiffResult(
  testInfo: TestInfo,
  slug: string,
  policy: PairDiffPolicy,
  result: ScreenshotDiffResult,
) {
  const path = testInfo.outputPath(`${slug}-default-pair-diff.json`);
  await writeFile(
    path,
    JSON.stringify({ status: policy.kind, note: policy.note, ...result }, null, 2),
  );
  await testInfo.attach(`${slug}-default-pair-diff.json`, {
    contentType: "application/json",
    path,
  });
}

async function attachPairScreenshots(
  testInfo: TestInfo,
  slug: string,
  reactPath: string,
  solidPath: string,
) {
  await Promise.all([
    testInfo.attach(`${slug}-default-react.png`, {
      contentType: "image/png",
      path: reactPath,
    }),
    testInfo.attach(`${slug}-default-solid.png`, {
      contentType: "image/png",
      path: solidPath,
    }),
  ]);
}

test.describe("comparison default pair diffs", () => {
  for (const item of defaultVisualCases) {
    test(`${item.title} default state stays within asserted React vs Solid diff`, async ({
      page,
    }, testInfo) => {
      await pinComparisonTheme(page, "dark");
      const policy: PairDiffPolicy = {
        ...item.threshold,
        kind: item.kind ?? "asserted",
        note:
          item.kind === "floor"
            ? (item.floorReason ??
              "Default styled pair-diff is a named floor, not React-vs-Solid acceptance.")
            : "Default styled surfaces use an asserted pair-diff threshold until component-specific strict parity is reached.",
      };
      testInfo.annotations.push({
        type: item.kind === "floor" ? "pair-diff-floor" : "asserted-pair-diff",
        description: policy.note,
      });

      await page.goto(`/components/${item.slug}/`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("astro-island")).toHaveCount(0);

      const section = await styledSection(page);
      const reactCanvas = await frameworkCanvas(section, "React Spectrum stack");
      const solidCanvas = await frameworkCanvas(section, "Solidaria stack");

      await page.mouse.move(4, 4);
      const reactPath = testInfo.outputPath(`${item.slug}-default-react.png`);
      const solidPath = testInfo.outputPath(`${item.slug}-default-solid.png`);
      const [reactPng, solidPng] = await Promise.all([
        reactCanvas.screenshot({ animations: "disabled", path: reactPath }),
        solidCanvas.screenshot({ animations: "disabled", path: solidPath }),
      ]);
      await attachPairScreenshots(testInfo, item.slug, reactPath, solidPath);
      const result = await diffScreenshots(page, reactPng, solidPng, policy.pixelThreshold);
      await attachPairDiffResult(testInfo, item.slug, policy, result);

      console.log(
        [
          `[default-pair-diff] ${item.slug}`,
          item.kind === "floor" ? "status=floor" : "status=asserted",
          `mismatchRatio=${result.mismatchRatio.toFixed(4)}`,
          `widthDelta=${result.widthDelta}`,
          `heightDelta=${result.heightDelta}`,
          `maxChannelDelta=${result.maxChannelDelta}`,
        ].join(" "),
      );

      expect(result.widthDelta, `${item.title} default pair width delta`).toBeLessThanOrEqual(
        policy.maxDimensionDelta,
      );
      expect(result.heightDelta, `${item.title} default pair height delta`).toBeLessThanOrEqual(
        policy.maxDimensionDelta,
      );
      expect(
        result.mismatchRatio,
        `${item.title} default pair screenshot mismatch ratio ${result.mismatchRatio} exceeded ${policy.maxMismatchRatio}`,
      ).toBeLessThanOrEqual(policy.maxMismatchRatio);
    });
  }
});
