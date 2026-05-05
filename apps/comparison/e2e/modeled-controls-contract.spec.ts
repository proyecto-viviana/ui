import { expect, test, type Locator } from "@playwright/test";
import {
  componentControlGroups,
  type ComponentControl,
  type ComponentControlGroup,
} from "../src/data/component-controls";
import { comparisonEntries } from "../src/data/comparison-manifest";
import { frameworkPanel, styledSection } from "./comparison-page";

const modeledControlGroups = Object.values(componentControlGroups)
  .filter((group) => group.coverage === "modeled")
  .sort((a, b) => a.slug.localeCompare(b.slug));

const textControlValues: Record<string, string> = {
  children: "Contract check",
  href: "https://example.com/contract-check",
  selectedKeys: "left,center",
  wrapWidth: "112",
};

function liveStyledEntry(group: ComponentControlGroup) {
  return comparisonEntries.find(
    (entry) =>
      entry.slug === group.slug &&
      entry.layers.styled.react === "live" &&
      entry.layers.styled.solid === "live",
  );
}

function nonDefaultOption(control: ComponentControl) {
  const option = control.options?.find((item) => item.value !== String(control.defaultValue));
  if (!option) {
    throw new Error(`No non-default option configured for ${control.name}`);
  }
  return option.value;
}

function testValueForControl(group: ComponentControlGroup, control: ComponentControl) {
  if (control.kind === "switch") {
    return !control.defaultValue;
  }

  if (control.kind === "text") {
    if (control.name === "selectedKeys" && group.slug === "selectboxgroup") {
      return "starter,pro";
    }
    return textControlValues[control.name] ?? `${group.slug}-${control.name}`;
  }

  return nonDefaultOption(control);
}

function expectedSerializedValue(control: ComponentControl, value: string | boolean) {
  if (control.name === "wrapWidth") {
    return Number(value);
  }
  return value;
}

async function setControlValue(form: Locator, control: ComponentControl, value: string | boolean) {
  if (control.kind === "switch") {
    const checkbox = form.locator(`input[type="checkbox"][name="${control.name}"]`);
    await expect(checkbox).toHaveCount(1);
    if (value) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
    return;
  }

  if (control.kind === "text") {
    const input = form.locator(`input[name="${control.name}"]`);
    await expect(input).toHaveCount(1);
    await input.fill(String(value));
    return;
  }

  if (control.kind === "select") {
    const select = form.locator(`select[name="${control.name}"]`);
    await expect(select).toHaveCount(1);
    await select.selectOption(String(value));
    return;
  }

  const radio = form.locator(`input[type="radio"][name="${control.name}"][value="${value}"]`);
  await expect(radio).toHaveCount(1);
  await radio.check();
}

async function serializedControlProps(root: Locator) {
  const value = await root.getAttribute("data-comparison-control-props");
  return JSON.parse(value ?? "{}") as Record<string, unknown>;
}

async function expectSerializedProps(root: Locator, expectedProps: Record<string, unknown>) {
  await expect.poll(async () => serializedControlProps(root)).toMatchObject(expectedProps);
}

test.describe("modeled comparison controls contract", () => {
  for (const group of modeledControlGroups) {
    test(`${group.title} side-panel controls drive both stacks`, async ({ page }) => {
      const entry = liveStyledEntry(group);
      expect(entry, `${group.slug} should be live on both styled stacks`).toBeTruthy();

      await page.goto(`/components/${group.slug}/`);
      await page.waitForLoadState("networkidle");
      await expect(page.locator("astro-island")).toHaveCount(0);

      const form = page.locator(`[data-comparison-controls="${group.slug}"]`);
      await expect(form).toHaveCount(1);
      await expect(form).toHaveAttribute("data-control-coverage", "modeled");

      const expectedProps: Record<string, unknown> = {};
      for (const control of group.controls) {
        const value = testValueForControl(group, control);
        expectedProps[control.name] = expectedSerializedValue(control, value);
        await setControlValue(form, control, value);
      }

      const section = await styledSection(page);
      const reactPanel = await frameworkPanel(section, "React Spectrum stack");
      const solidPanel = await frameworkPanel(section, "Solidaria stack");
      const reactRoot = reactPanel.locator(`[data-comparison-control-root="${group.slug}"]`);
      const solidRoot = solidPanel.locator(`[data-comparison-control-root="${group.slug}"]`);

      await expect(reactRoot).toHaveCount(1);
      await expect(solidRoot).toHaveCount(1);
      await expect(reactRoot).toBeVisible();
      await expect(solidRoot).toBeVisible();
      await expectSerializedProps(reactRoot, expectedProps);
      await expectSerializedProps(solidRoot, expectedProps);
    });
  }
});
