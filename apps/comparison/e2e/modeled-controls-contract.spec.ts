import { expect, test, type Locator } from "@playwright/test";
import {
  componentControlGroups,
  type ComponentControl,
  type ComponentControlGroup,
} from "../src/data/component-controls";
import { comparisonEntries } from "../src/data/comparison-manifest";
import { frameworkPanel, waitForComparisonRouteReady } from "./comparison-page";

const modeledControlGroups = Object.values(componentControlGroups)
  .filter((group) => group.coverage === "modeled")
  .sort((a, b) => a.slug.localeCompare(b.slug));

const textControlValues: Record<string, string> = {
  children: "Contract check",
  href: "https://example.com/contract-check",
  selectedKeys: "left,center",
  wrapWidth: "112",
};

const numberFieldTextControlValues: Record<string, string> = {
  value: "8",
  minValue: "0",
  maxValue: "20",
  step: "2",
};

const sliderTextControlValues: Record<string, string> = {
  value: "72",
  defaultValue: "64",
  minValue: "0",
  maxValue: "100",
  step: "5",
  fillOffset: "20",
  name: "volume",
  form: "audioForm",
};

const colorAreaTextControlValues: Record<string, string> = {
  ariaLabel: "Contract color",
  ariaLabelledBy: "colorarea-labelledby",
  ariaDescribedBy: "colorarea-describedby",
  ariaDetails: "colorarea-details",
  value: "#80C8FF",
  defaultValue: "#3366CC",
  xName: "redChannel",
  yName: "greenChannel",
  form: "colorForm",
  id: "contract-colorarea",
  slot: "color",
};

const cardTextControlValues: Record<string, string> = {
  title: "Contract Apollo",
  description: "Contract active state",
  href: "https://example.com/card",
  textValue: "Contract Apollo",
};

const cardViewTextControlValues: Record<string, string> = {
  ariaLabel: "Contract projects",
  selectedKeys: "apollo,zephyr",
  defaultSelectedKeys: "zephyr",
  disabledKeys: "zephyr",
};

const colorSliderTextControlValues: Record<string, string> = {
  ariaLabel: "Contract color slider",
  ariaLabelledBy: "colorslider-labelledby",
  ariaDescribedBy: "colorslider-describedby",
  ariaDetails: "colorslider-details",
  label: "Hue channel",
  value: "hsl(80, 100%, 50%)",
  defaultValue: "hsl(200, 100%, 50%)",
  name: "hueChannel",
  form: "colorForm",
  id: "contract-colorslider",
  slot: "color",
};

const colorWheelTextControlValues: Record<string, string> = {
  ariaLabel: "Contract color wheel",
  ariaLabelledBy: "colorwheel-labelledby",
  ariaDescribedBy: "colorwheel-describedby",
  ariaDetails: "colorwheel-details",
  value: "hsl(80, 100%, 50%)",
  defaultValue: "hsl(200, 100%, 50%)",
  name: "hueWheel",
  form: "colorForm",
  id: "contract-colorwheel",
  slot: "color",
};

const colorSwatchTextControlValues: Record<string, string> = {
  ariaLabel: "Background color",
  ariaLabelledBy: "colorswatch-labelledby",
  ariaDescribedBy: "colorswatch-describedby",
  ariaDetails: "colorswatch-details",
  color: "#ff0000",
  colorName: "Fire truck red",
  id: "contract-colorswatch",
  slot: "color",
};

const colorSwatchPickerTextControlValues: Record<string, string> = {
  ariaLabel: "Accent color",
  ariaLabelledBy: "colorswatchpicker-labelledby",
  ariaDescribedBy: "colorswatchpicker-describedby",
  ariaDetails: "colorswatchpicker-details",
  value: "#22c55e",
  defaultValue: "#3b82f6",
  id: "contract-colorswatchpicker",
  slot: "swatches",
};

const colorFieldTextControlValues: Record<string, string> = {
  ariaLabel: "Contract color field",
  ariaLabelledBy: "colorfield-labelledby",
  ariaDescribedBy: "colorfield-describedby",
  ariaDetails: "colorfield-details",
  label: "Color field",
  description: "Contract description",
  errorMessage: "Contract error",
  placeholder: "#123456",
  value: "#80C8FF",
  defaultValue: "#3366CC",
  name: "redChannel",
  form: "colorForm",
  id: "contract-colorfield",
  slot: "color",
};

const meterTextControlValues: Record<string, string> = {
  value: "45",
  minValue: "0",
  maxValue: "120",
};

const tooltipTextControlValues: Record<string, string> = {
  containerPadding: "18",
  crossOffset: "14",
  delay: "250",
};

const toastTextControlValues: Record<string, string> = {
  count: "2",
  timeout: "5000",
};

const contextualHelpTextControlValues: Record<string, string> = {
  offset: "10",
  crossOffset: "2",
  containerPadding: "14",
};

const popoverTextControlValues: Record<string, string> = {
  triggerLabel: "Contract feedback",
  ariaLabel: "Contract feedback",
  bodyText: "Contract feedback copy",
  offset: "10",
  crossOffset: "4",
  containerPadding: "16",
  maxHeight: "240",
};

const dateRangePickerTextControlValues: Record<string, string> = {
  startValue: "2025-02-03T08:45:00",
  endValue: "2025-02-14T17:30:00",
  startName: "startDate",
  endName: "endDate",
  form: "tripForm",
};

const datePickerTextControlValues: Record<string, string> = {
  value: "2025-02-03T08:45:00",
  name: "dueDate",
  form: "projectForm",
};

const dateFieldTextControlValues: Record<string, string> = {
  value: "2025-02-03T08:45:00",
  name: "appointmentDate",
  form: "appointmentForm",
};

const timeFieldTextControlValues: Record<string, string> = {
  value: "09:45:30",
  name: "startTime",
  form: "scheduleForm",
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
    if (group.slug === "numberfield" && control.name in numberFieldTextControlValues) {
      return numberFieldTextControlValues[control.name];
    }
    if (group.slug === "slider" && control.name in sliderTextControlValues) {
      return sliderTextControlValues[control.name];
    }
    if (group.slug === "colorarea" && control.name in colorAreaTextControlValues) {
      return colorAreaTextControlValues[control.name];
    }
    if (group.slug === "card" && control.name in cardTextControlValues) {
      return cardTextControlValues[control.name];
    }
    if (group.slug === "cardview" && control.name in cardViewTextControlValues) {
      return cardViewTextControlValues[control.name];
    }
    if (group.slug === "colorslider" && control.name in colorSliderTextControlValues) {
      return colorSliderTextControlValues[control.name];
    }
    if (group.slug === "colorwheel" && control.name in colorWheelTextControlValues) {
      return colorWheelTextControlValues[control.name];
    }
    if (group.slug === "colorswatch" && control.name in colorSwatchTextControlValues) {
      return colorSwatchTextControlValues[control.name];
    }
    if (group.slug === "colorswatchpicker" && control.name in colorSwatchPickerTextControlValues) {
      return colorSwatchPickerTextControlValues[control.name];
    }
    if (group.slug === "colorfield" && control.name in colorFieldTextControlValues) {
      return colorFieldTextControlValues[control.name];
    }
    if (group.slug === "meter" && control.name in meterTextControlValues) {
      return meterTextControlValues[control.name];
    }
    if (group.slug === "tooltip" && control.name in tooltipTextControlValues) {
      return tooltipTextControlValues[control.name];
    }
    if (group.slug === "toast" && control.name in toastTextControlValues) {
      return toastTextControlValues[control.name];
    }
    if (group.slug === "contextualhelp" && control.name in contextualHelpTextControlValues) {
      return contextualHelpTextControlValues[control.name];
    }
    if (group.slug === "popover" && control.name in popoverTextControlValues) {
      return popoverTextControlValues[control.name];
    }
    if (group.slug === "daterangepicker" && control.name in dateRangePickerTextControlValues) {
      return dateRangePickerTextControlValues[control.name];
    }
    if (group.slug === "datepicker" && control.name in datePickerTextControlValues) {
      return datePickerTextControlValues[control.name];
    }
    if (group.slug === "datefield" && control.name in dateFieldTextControlValues) {
      return dateFieldTextControlValues[control.name];
    }
    if (group.slug === "timefield" && control.name in timeFieldTextControlValues) {
      return timeFieldTextControlValues[control.name];
    }
    if (control.name === "selectedKeys" && group.slug === "selectboxgroup") {
      return "starter,pro";
    }
    if (control.name === "selectedValues" && group.slug === "checkboxgroup") {
      return "email,sms";
    }
    if (control.name === "selectedValue" && group.slug === "radiogroup") {
      return "pro";
    }
    return textControlValues[control.name] ?? `${group.slug}-${control.name}`;
  }

  return nonDefaultOption(control);
}

function expectedSerializedValue(
  group: ComponentControlGroup,
  control: ComponentControl,
  value: string | boolean,
) {
  if (control.name === "wrapWidth") {
    return Number(value);
  }
  if (group.slug === "numberfield" && control.name in numberFieldTextControlValues) {
    return Number(value);
  }
  if (
    group.slug === "slider" &&
    ["value", "defaultValue", "minValue", "maxValue", "step", "fillOffset"].includes(control.name)
  ) {
    return Number(value);
  }
  if (group.slug === "meter" && control.name in meterTextControlValues) {
    return Number(value);
  }
  if (group.slug === "tooltip" && control.name in tooltipTextControlValues) {
    return Number(value);
  }
  if (group.slug === "tooltip" && control.name === "isOpen") {
    return value === "true" ? true : value === "false" ? false : undefined;
  }
  if (group.slug === "toast" && control.name in toastTextControlValues) {
    return Number(value);
  }
  if (group.slug === "contextualhelp" && control.name in contextualHelpTextControlValues) {
    return Number(value);
  }
  if (
    group.slug === "popover" &&
    ["offset", "crossOffset", "containerPadding", "maxHeight"].includes(control.name)
  ) {
    return Number(value);
  }
  if (group.slug === "actionbar" && control.name === "selectedItemCount" && value !== "all") {
    return Number(value);
  }
  return value;
}

function defaultValuesForGroup(group: ComponentControlGroup) {
  return Object.fromEntries(group.controls.map((control) => [control.name, control.defaultValue]));
}

function controlsInInteractionOrder(group: ComponentControlGroup) {
  return [...group.controls].sort((left, right) => {
    if (left.name === "isOpen" && right.name !== "isOpen") return 1;
    if (right.name === "isOpen" && left.name !== "isOpen") return -1;
    return 0;
  });
}

async function controlDefaultsFromForm(form: Locator) {
  return form.evaluate((element) =>
    JSON.parse((element as HTMLFormElement).dataset.controlDefaults ?? "{}"),
  ) as Promise<Record<string, unknown>>;
}

async function expectControlDefault(form: Locator, control: ComponentControl) {
  if (control.kind === "switch") {
    await expect(form.locator(`input[type="checkbox"][name="${control.name}"]`)).toBeChecked({
      checked: Boolean(control.defaultValue),
    });
    return;
  }

  if (control.kind === "text") {
    const expectedValue = String(control.defaultValue).replace(/\r?\n/g, "");
    await expect(form.locator(`input[name="${control.name}"]`)).toHaveValue(expectedValue);
    return;
  }

  if (control.kind === "select") {
    await expect(form.locator(`select[name="${control.name}"]`)).toHaveValue(
      String(control.defaultValue),
    );
    return;
  }

  const expectedValue = String(control.defaultValue);
  if (control.options?.some((option) => option.value === expectedValue)) {
    await expect(form.locator(`input[type="radio"][name="${control.name}"]:checked`)).toHaveValue(
      expectedValue,
    );
  } else {
    await expect(form.locator(`input[type="radio"][name="${control.name}"]:checked`)).toHaveCount(
      0,
    );
  }
}

async function setControlValue(form: Locator, control: ComponentControl, value: string | boolean) {
  if (control.kind === "switch") {
    const checkbox = form.locator(`input[type="checkbox"][name="${control.name}"]`);
    await expect(checkbox).toHaveCount(1);
    if (control.name === "isOpen") {
      await checkbox.evaluate((element, checked) => {
        const input = element as HTMLInputElement;
        input.checked = checked;
        input.dispatchEvent(new Event("input", { bubbles: true }));
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }, Boolean(value));
      await expect(checkbox).toBeChecked({ checked: Boolean(value) });
      return;
    }
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

async function expectFormPreviewProps(panel: Locator, expectedProps: Record<string, unknown>) {
  await expect(
    panel.getByRole("textbox", { name: String(expectedProps.label) }).first(),
  ).toHaveValue(String(expectedProps.value));
  await expect(
    panel.getByRole("button", { name: String(expectedProps.actionLabel) }).first(),
  ).toBeDisabled({ disabled: Boolean(expectedProps.isDisabled) });
}

test.describe("modeled comparison controls contract", () => {
  for (const group of modeledControlGroups) {
    test(`${group.title} side-panel controls drive both stacks`, async ({ page }) => {
      const entry = liveStyledEntry(group);
      expect(entry, `${group.slug} should be live on both styled stacks`).toBeTruthy();

      await page.goto(`/components/${group.slug}/`);
      await waitForComparisonRouteReady(page);

      const form = page.locator(`[data-comparison-controls="${group.slug}"]`);
      await expect(form).toHaveCount(1);
      await expect(form).toHaveAttribute("data-control-coverage", "modeled");
      await expect.poll(() => controlDefaultsFromForm(form)).toEqual(defaultValuesForGroup(group));
      for (const control of group.controls) {
        await expectControlDefault(form, control);
      }

      const expectedProps: Record<string, unknown> = {};
      for (const control of controlsInInteractionOrder(group)) {
        const value = testValueForControl(group, control);
        expectedProps[control.name] = expectedSerializedValue(group, control, value);
        await setControlValue(form, control, value);
      }

      const section = page.locator("#example").filter({
        has: page.locator("h2", { hasText: "Example" }),
      });
      await expect(section).toHaveCount(1);
      const reactPanel = await frameworkPanel(section, "React Spectrum stack");
      const solidPanel = await frameworkPanel(section, "Solidaria stack");
      const reactRoot = reactPanel.locator(`[data-comparison-control-root="${group.slug}"]`);
      const solidRoot = solidPanel.locator(`[data-comparison-control-root="${group.slug}"]`);

      await expect(reactRoot).toHaveCount(1);
      await expect(solidRoot).toHaveCount(1);
      await expect(reactRoot).toBeVisible();
      await expect(solidRoot).toBeVisible();
      if (group.slug === "form") {
        await expectFormPreviewProps(reactPanel, expectedProps);
        await expectFormPreviewProps(solidPanel, expectedProps);
      } else {
        await expectSerializedProps(reactRoot, expectedProps);
        await expectSerializedProps(solidRoot, expectedProps);
      }
    });
  }
});
