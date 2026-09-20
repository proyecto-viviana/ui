import { render } from "@solidjs/web";
import { flush } from "solid-js";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import Checkbox from "../../src/components/solid/fixtures/styled/checkbox";
import Tabs from "../../src/components/solid/fixtures/styled/tabs";
import CheckboxGroup from "../../src/components/solid/fixtures/styled/checkboxgroup";
import ColorSwatchPicker from "../../src/components/solid/fixtures/styled/colorswatchpicker";
import ColorWheel from "../../src/components/solid/fixtures/styled/colorwheel";
import RangeCalendar from "../../src/components/solid/fixtures/styled/rangecalendar";
import SegmentedControl from "../../src/components/solid/fixtures/styled/segmentedcontrol";
import { checkboxDemoDefaults, comparisonControlsEvent } from "../../src/data/checkbox-demo";
import { tabsDemoDefaults } from "../../src/data/tabs-demo";
import { checkboxGroupDemoDefaults } from "../../src/data/checkboxgroup-demo";
import { colorSwatchPickerDemoDefaults } from "../../src/data/colorswatchpicker-demo";
import { colorWheelDemoDefaults } from "../../src/data/colorwheel-demo";
import { segmentedControlDemoDefaults } from "../../src/data/segmentedcontrol-demo";
import { comparisonThemeChangeEvent } from "../../src/data/theme";

// Actual manual fixture source with real built package components, not mock
// keyed controls. This CSR proof does not certify SSR or the app's CSS pipeline.
let container: HTMLDivElement;
let dispose: (() => void) | undefined;
let assertListenersRemoved: () => void;
beforeEach(() => {
  window.history.replaceState({}, "", "/");
  container = document.createElement("div");
  document.body.append(container);
  const add = vi.spyOn(window, "addEventListener");
  const remove = vi.spyOn(window, "removeEventListener");
  const isFixtureEvent = ([type]: [string, ...unknown[]]) =>
    [comparisonControlsEvent, comparisonThemeChangeEvent].includes(type);
  assertListenersRemoved = () => {
    const registrations = add.mock.calls.filter(isFixtureEvent);
    expect(registrations).toHaveLength(2);
    expect(remove.mock.calls.filter(isFixtureEvent)).toEqual(registrations);
  };
});
afterEach(() => {
  try {
    dispose?.();
    assertListenersRemoved();
  } finally {
    dispose = undefined;
    container.remove();
    window.history.replaceState({}, "", "/");
    vi.restoreAllMocks();
  }
});
async function settle() {
  await Promise.resolve();
  flush();
  await new Promise<void>((done) => setTimeout(done, 0));
  flush();
}
function controls(component: string, props: object) {
  window.dispatchEvent(new CustomEvent(comparisonControlsEvent, { detail: { component, props } }));
}

it("checkbox preserves same-key nodes, remounts changed defaults and removes exact listeners", async () => {
  window.history.replaceState({}, "", "/?selectionSource=defaultSelected&defaultSelected=false");
  const add = vi.spyOn(window, "addEventListener");
  const remove = vi.spyOn(window, "removeEventListener");
  dispose = render(() => Checkbox(), container);
  await settle();
  const registrations = add.mock.calls.filter(([type]) =>
    [comparisonControlsEvent, comparisonThemeChangeEvent].includes(type),
  );
  expect(registrations).toHaveLength(2);
  const input = container.querySelector<HTMLInputElement>('input[type="checkbox"]');
  expect(input).not.toBeNull();
  expect(input?.checked).toBe(false);
  controls("checkbox", {
    ...checkboxDemoDefaults,
    selectionSource: "defaultSelected",
    children: "Changed label",
    isDisabled: true,
  });
  await settle();
  expect(container.querySelector("input")).toBe(input);
  expect(input?.disabled).toBe(true);
  expect(container.textContent).toContain("Changed label");
  controls("checkbox", {
    ...checkboxDemoDefaults,
    selectionSource: "defaultSelected",
    defaultSelected: true,
  });
  await settle();
  const replacement = container.querySelector<HTMLInputElement>('input[type="checkbox"]');
  expect(replacement).not.toBeNull();
  expect(replacement).not.toBe(input);
  expect(input?.isConnected).toBe(false);
  expect(replacement?.checked).toBe(true);
  const shell = container.querySelector<HTMLElement>("[data-comparison-color-scheme]");
  window.dispatchEvent(
    new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
  );
  await settle();
  expect(shell?.dataset.comparisonColorScheme).toBe("dark");
  expect(container.querySelector("input")).toBe(replacement);
  dispose();
  dispose = undefined;
  expect(
    remove.mock.calls.filter(([type]) =>
      [comparisonControlsEvent, comparisonThemeChangeEvent].includes(type),
    ),
  ).toEqual(registrations);
  controls("checkbox", checkboxDemoDefaults);
  window.dispatchEvent(
    new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "light" } }),
  );
  await settle();
  expect(shell?.dataset.comparisonColorScheme).toBe("dark");
  expect(replacement?.isConnected).toBe(false);
});

it("tabs retains selection nodes and focus, then remounts a structural key change", async () => {
  dispose = render(() => Tabs(), container);
  await settle();
  const tabs = [...container.querySelectorAll<HTMLButtonElement>('[role="tab"]')];
  expect(tabs).toHaveLength(3);
  tabs[1].focus();
  tabs[1].click();
  await settle();
  tabs.forEach((tab, index) => expect(container.querySelectorAll('[role="tab"]')[index]).toBe(tab));
  expect(document.activeElement).toBe(tabs[1]);
  expect(tabs[1].getAttribute("aria-selected")).toBe("true");
  controls("tabs", { ...tabsDemoDefaults, selectedKey: "parity", withIcons: true });
  await settle();
  const replacements = [...container.querySelectorAll('[role="tab"]')];
  expect(replacements).toHaveLength(3);
  expect(replacements[0]).not.toBe(tabs[0]);
  expect(tabs.every((tab) => !tab.isConnected)).toBe(true);
  expect(replacements[1].getAttribute("aria-selected")).toBe("true");
  (replacements[2] as HTMLElement).click();
  await settle();
  expect(replacements[2].getAttribute("aria-selected")).toBe("true");
});

it("tabs updates non-key controls without replacing the tablist or its tabs", async () => {
  dispose = render(() => Tabs(), container);
  await settle();
  const list = container.querySelector('[role="tablist"]');
  const root = container.querySelector("[data-density]");
  const tabs = [...container.querySelectorAll<HTMLElement>('[role="tab"]')];
  expect(tabs).toHaveLength(3);
  controls("tabs", {
    ...tabsDemoDefaults,
    ariaLabel: "Updated project tabs",
    orientation: "vertical",
    density: "compact",
    keyboardActivation: "manual",
  });
  await settle();
  expect(container.querySelector('[role="tablist"]')).toBe(list);
  expect(list?.getAttribute("aria-label")).toBe("Updated project tabs");
  expect(list?.getAttribute("aria-orientation")).toBe("vertical");
  expect(container.querySelector("[data-density]")).toBe(root);
  expect(root?.getAttribute("data-density")).toBe("compact");
  tabs.forEach((tab, index) => expect(container.querySelectorAll('[role="tab"]')[index]).toBe(tab));
  tabs[0].focus();
  tabs[0].dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowDown", bubbles: true }));
  await settle();
  expect(document.activeElement).toBe(tabs[1]);
  expect(tabs[0].getAttribute("aria-selected")).toBe("true");
  expect(tabs[1].getAttribute("aria-selected")).toBe("false");
  tabs[1].dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
  await settle();
  expect(tabs[1].getAttribute("aria-selected")).toBe("true");
  controls("tabs", { ...tabsDemoDefaults, isDisabled: true });
  await settle();
  tabs.forEach((tab, index) => {
    expect(container.querySelectorAll('[role="tab"]')[index]).toBe(tab);
    expect(tab.getAttribute("aria-disabled")).toBe("true");
  });
  controls("tabs", tabsDemoDefaults);
  await settle();
  tabs.forEach((tab, index) => {
    expect(container.querySelectorAll('[role="tab"]')[index]).toBe(tab);
    expect(tab.getAttribute("aria-disabled")).not.toBe("true");
  });
});

it("checkbox group retains live labels and remounts changed uncontrolled values", async () => {
  window.history.replaceState({}, "", "/?valueSource=defaultValue&defaultValue=email");
  dispose = render(() => CheckboxGroup(), container);
  await settle();
  const group = container.querySelector('[role="group"]');
  const email = container.querySelector<HTMLInputElement>('input[value="email"]');
  expect(email?.checked).toBe(true);
  const props = {
    ...checkboxGroupDemoDefaults,
    valueSource: "defaultValue",
    label: "Updated notifications",
  };
  controls("checkboxgroup", props);
  await settle();
  expect(container.querySelector('[role="group"]')).toBe(group);
  expect(container.querySelector('input[value="email"]')).toBe(email);
  expect(container.textContent).toContain("Updated notifications");
  controls("checkboxgroup", { ...props, defaultValue: "sms" });
  await settle();
  expect(container.querySelector('[role="group"]')).not.toBe(group);
  expect(email?.isConnected).toBe(false);
  expect(container.querySelector<HTMLInputElement>('input[value="email"]')?.checked).toBe(false);
  expect(container.querySelector<HTMLInputElement>('input[value="sms"]')?.checked).toBe(true);
  expect(container.querySelector<HTMLInputElement>('input[value="push"]')?.checked).toBe(false);
});

it("swatches retain option nodes on selection and remount on size changes", async () => {
  window.history.replaceState({}, "", "/?valueSource=value&value=%23e11d48");
  dispose = render(() => ColorSwatchPicker(), container);
  await settle();
  const list = container.querySelector('[role="listbox"]');
  const options = [...container.querySelectorAll('[role="option"]')];
  const boundaries = [...container.querySelectorAll("button")].filter((node) =>
    ["Before", "After"].includes(node.textContent ?? ""),
  );
  expect(list).not.toBeNull();
  expect(options).toHaveLength(7);
  expect(boundaries).toHaveLength(2);
  const props = { ...colorSwatchPickerDemoDefaults, valueSource: "value", value: "#3b82f6" };
  controls("colorswatchpicker", props);
  await settle();
  expect(container.querySelector('[role="listbox"]')).toBe(list);
  options.forEach((option, index) =>
    expect(container.querySelectorAll('[role="option"]')[index]).toBe(option),
  );
  expect(
    container
      .querySelector('[role="option"][aria-selected="true"] [role="img"]')
      ?.getAttribute("aria-label"),
  ).toBe("Blue");
  controls("colorswatchpicker", { ...props, size: "L" });
  await settle();
  expect(container.querySelector('[role="listbox"]')).not.toBe(list);
  expect(options.every((node) => !node.isConnected)).toBe(true);
  expect(container.querySelectorAll('[role="option"]')).toHaveLength(7);
  expect(
    container
      .querySelector('[role="option"][aria-selected="true"] [role="img"]')
      ?.getAttribute("aria-label"),
  ).toBe("Blue");
  boundaries.forEach((node) => expect(node.isConnected).toBe(true));
});

it("color wheel retains its slider for hue changes and remounts on size changes", async () => {
  window.history.replaceState(
    {},
    "",
    `/?${new URLSearchParams({ valueSource: "value", value: "hsl(0, 100%, 50%)", size: "192" })}`,
  );
  dispose = render(() => ColorWheel(), container);
  await settle();
  const slider = container.querySelector<HTMLInputElement>('input[type="range"]');
  expect(slider?.value).toBe("0");
  const props = {
    ...colorWheelDemoDefaults,
    valueSource: "value",
    value: "hsl(120, 100%, 50%)",
    size: "192",
  };
  controls("colorwheel", props);
  await settle();
  expect(container.querySelector('input[type="range"]')).toBe(slider);
  expect(slider?.value).toBe("120");
  controls("colorwheel", { ...props, size: "224" });
  await settle();
  expect(container.querySelector('input[type="range"]')).not.toBe(slider);
  expect(slider?.isConnected).toBe(false);
  expect(container.querySelector<HTMLInputElement>('input[type="range"]')?.value).toBe("120");
});

it("range calendar keeps its root for range updates and remounts a focus-mode change", async () => {
  window.history.replaceState({}, "", "/?locale=en-US&startValue=2025-02-03&endValue=2025-02-07");
  dispose = render(() => RangeCalendar(), container);
  await settle();
  const root = container.querySelector(".comparison-rangecalendar-root");
  expect(root).not.toBeNull();
  expect(root?.querySelector('[role="grid"]')).not.toBeNull();
  controls("rangecalendar", { startValue: "2025-02-04", endValue: "2025-02-08" });
  await settle();
  expect(container.querySelector(".comparison-rangecalendar-root")).toBe(root);
  expect(
    root?.querySelector('[data-selection-start][role="button"]')?.getAttribute("aria-label"),
  ).toContain("February 4");
  expect(
    root?.querySelector('[data-selection-end][role="button"]')?.getAttribute("aria-label"),
  ).toContain("February 8");
  controls("rangecalendar", { focusedValue: "2025-02-15" });
  await settle();
  const replacement = container.querySelector(".comparison-rangecalendar-root");
  expect(replacement).not.toBe(root);
  expect(root?.isConnected).toBe(false);
  expect(
    replacement?.querySelector('[role="button"][tabindex="0"]')?.getAttribute("aria-label"),
  ).toContain("February 15");
  expect(
    replacement?.querySelector('[data-selection-start][role="button"]')?.getAttribute("aria-label"),
  ).toContain("February 4");
});

it("keyed range calendar inherits its surrounding provider locale", async () => {
  window.history.replaceState({}, "", "/?locale=de-DE&startValue=2025-02-03&endValue=2025-02-07");
  dispose = render(() => RangeCalendar(), container);
  await settle();
  const root = container.querySelector(".comparison-rangecalendar-root");
  expect(root?.textContent).toContain("Februar");
  expect(
    root?.querySelector('[data-selection-start][role="button"]')?.getAttribute("aria-label"),
  ).toContain("Februar");
});

it("segmented control retains selected radio nodes then remounts changed defaults", async () => {
  window.history.replaceState(
    {},
    "",
    "/?selectionSource=defaultSelectedKey&defaultSelectedKey=list",
  );
  dispose = render(() => SegmentedControl(), container);
  await settle();
  const group = container.querySelector('[role="radiogroup"]');
  const radios = [...container.querySelectorAll<HTMLElement>('[role="radio"]')];
  expect(radios).toHaveLength(3);
  radios[1].click();
  await settle();
  expect(container.querySelector('[role="radiogroup"]')).toBe(group);
  radios.forEach((radio, index) =>
    expect(container.querySelectorAll('[role="radio"]')[index]).toBe(radio),
  );
  expect(radios[1].getAttribute("aria-checked")).toBe("true");
  controls("segmentedcontrol", {
    ...segmentedControlDemoDefaults,
    selectionSource: "defaultSelectedKey",
    defaultSelectedKey: "board",
  });
  await settle();
  expect(container.querySelector('[role="radiogroup"]')).not.toBe(group);
  expect(radios.every((radio) => !radio.isConnected)).toBe(true);
  expect(container.querySelectorAll('[role="radio"]')[2]?.getAttribute("aria-checked")).toBe(
    "true",
  );
});
