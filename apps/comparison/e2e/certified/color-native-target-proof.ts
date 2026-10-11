import { expect, test } from "@playwright/test";
import { scrollLocatorIntoView } from "../comparison-page";
import { scenarioThemes, type DriverScenario, type TargetResolver } from "../drivers/scenario";
import { forEachScenarioPanel } from "../drivers/walk";

/** Additive D8 proof of the painted color thumb and its native range ownership. */
export function registerColorNativeTargetProof(
  scenario: DriverScenario,
  root: string,
  thumbTarget: TargetResolver,
  axes: 1 | 2,
) {
  test.describe(`D8 native color hit areas — ${scenario.title}`, () => {
    for (const caseDef of scenario.cases) {
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
            await expect(inputs).toHaveCount(axes);
            await expect(ctx.canvas.locator(`${root} div[role="slider"]`)).toHaveCount(0);
            const primary = inputs.first();
            const disabled = caseDef.params?.isDisabled === "true";
            await expect(primary).not.toHaveAttribute("aria-hidden", "true");
            if (disabled) await expect(primary).toBeDisabled();
            else {
              await expect(primary).toBeEnabled();
              expect(await primary.evaluate((node) => (node as HTMLInputElement).tabIndex)).toBe(0);
            }
            if (axes === 2) {
              await expect(inputs.nth(1)).toHaveAttribute("aria-hidden", "true");
              expect(
                await inputs.nth(1).evaluate((node) => (node as HTMLInputElement).tabIndex),
              ).toBe(-1);
              if (disabled) await expect(inputs.nth(1)).toBeDisabled();
              else await expect(inputs.nth(1)).toBeEnabled();
            }
            const thumb = thumbTarget(ctx);
            await expect(thumb).toHaveCount(1);
            await scrollLocatorIntoView(thumb);
            const geometry = await thumb.evaluate((node) => {
              if (node.getAttribute("role") === "slider" || (node as HTMLElement).tabIndex >= 0)
                throw new Error("Painted color thumb owns native slider semantics or focus");
              const box = node.getBoundingClientRect();
              if (box.width <= 0 || box.height <= 0)
                throw new Error("Painted color thumb has no geometry");
              const x = box.x + box.width / 2;
              const y = box.y + box.height / 2;
              if (!node.contains(document.elementFromPoint(x, y)))
                throw new Error("Painted color thumb center is not pointer reachable");
              return {
                x,
                y,
                width: Math.round(box.width * 100) / 100,
                height: Math.round(box.height * 100) / 100,
              };
            });
            const readValues = () =>
              inputs.evaluateAll((nodes) => nodes.map((node) => (node as HTMLInputElement).value));
            const before = await readValues();
            await page.mouse.move(geometry.x, geometry.y);
            await page.mouse.down();
            let pressed: string[];
            try {
              if (disabled) {
                for (let index = 0; index < axes; index++)
                  await expect(inputs.nth(index)).not.toBeFocused();
              } else await expect(primary).toBeFocused();
              pressed = await readValues();
            } finally {
              await page.mouse.up();
            }
            if (disabled) {
              expect(await readValues()).toEqual(before);
              for (let index = 0; index < axes; index++)
                await expect(inputs.nth(index)).not.toBeFocused();
            } else {
              await expect(primary).toBeFocused();
              expect(await readValues()).toEqual(pressed!);
            }
            captures[ctx.framework] = {
              width: geometry.width,
              height: geometry.height,
              meets24: geometry.width >= 24 && geometry.height >= 24,
              meets44: geometry.width >= 44 && geometry.height >= 44,
              before,
              after: await readValues(),
              disabled,
            };
          },
        );
        await testInfo.attach(`d8-native-color-hit-area-${scenario.slug}-${caseDef.id}`, {
          body: Buffer.from(JSON.stringify(captures, null, 2)),
          contentType: "application/json",
        });
        expect(captures.solid).toEqual(captures.react);
      });
    }
  });
}
