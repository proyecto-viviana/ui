import { expect, test } from "@playwright/test";
import { scenarioThemes, type DriverScenario } from "../drivers/scenario";
import { forEachScenarioPanel } from "../drivers/walk";

/** D8 native ownership and painted pointer target proof; complements clipped-input census. */
export function registerSliderNativeTargetProof(
  scenario: DriverScenario,
  root: string,
  count: number,
) {
  test.describe(`D8 native slider hit areas — ${scenario.title}`, () => {
    for (const caseDef of scenario.cases.filter((item) =>
      ["default", "size-s", "size-l", "size-xl", "thumb-precise"].includes(item.id),
    )) {
      test(caseDef.id, async ({ page }, testInfo) => {
        test.setTimeout(120_000);
        const captures: Record<string, unknown> = {};
        await forEachScenarioPanel(
          page,
          scenario,
          caseDef,
          scenarioThemes(scenario, caseDef)[0],
          async (ctx) => {
            const inputs = ctx.canvas.locator(`${root} input[type="range"]`);
            await expect(inputs).toHaveCount(count);
            await expect(ctx.canvas.locator(`${root} div[role="slider"]`)).toHaveCount(0);
            const measurements = [];
            for (let index = 0; index < count; index++) {
              const input = inputs.nth(index);
              await expect(input).not.toHaveAttribute("aria-hidden", "true");
              const measurement = await input.evaluate((node) => {
                const native = node as HTMLInputElement;
                // Both real S2 trees nest the native input in VisuallyHidden, then
                // the thumb container, whose other direct div owns the painted hit area.
                const thumb = native.parentElement?.parentElement;
                const area =
                  thumb &&
                  Array.from(thumb.children).find(
                    (child) => child.tagName === "DIV" && !child.contains(native),
                  );
                if (!thumb || !area)
                  throw new Error("Native slider thumb/hit-area structure missing");
                if (thumb.hasAttribute("tabindex") || thumb.getAttribute("role") === "slider")
                  throw new Error("Thumb container still owns focus or slider semantics");
                const box = area.getBoundingClientRect();
                if (box.width <= 0 || box.height <= 0)
                  throw new Error("Painted slider hit area has no geometry");
                const x = box.x + box.width / 2,
                  y = box.y + box.height / 2;
                if (!thumb.contains(document.elementFromPoint(x, y)))
                  throw new Error("Thumb hit-area center is not pointer reachable");
                return {
                  x,
                  y,
                  width: Math.round(box.width * 100) / 100,
                  height: Math.round(box.height * 100) / 100,
                  value: native.value,
                };
              });
              await ctx.page.mouse.move(measurement.x, measurement.y);
              await ctx.page.mouse.down();
              try {
                await expect(input).toBeFocused();
              } finally {
                await ctx.page.mouse.up();
              }
              await expect(input).toBeFocused();
              await expect(input).toHaveValue(measurement.value);
              // Position is panel-specific; actual pointer reachability was asserted above.
              measurements.push({
                width: measurement.width,
                height: measurement.height,
                meets24: measurement.width >= 24 && measurement.height >= 24,
                meets44: measurement.width >= 44 && measurement.height >= 44,
              });
            }
            captures[ctx.framework] = measurements;
          },
        );
        await testInfo.attach(`d8-native-hit-area-${scenario.slug}-${caseDef.id}`, {
          body: Buffer.from(JSON.stringify(captures, null, 2)),
          contentType: "application/json",
        });
        expect(captures.solid).toEqual(captures.react);
      });
    }
  });
}
