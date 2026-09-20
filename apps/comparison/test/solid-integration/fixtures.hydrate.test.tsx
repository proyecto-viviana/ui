import { render } from "@solidjs/web";
import { flush } from "solid-js";
import { afterEach, beforeEach, expect, it, vi } from "vite-plus/test";
import userEvent from "@testing-library/user-event";
import Checkbox from "../../src/components/solid/fixtures/styled/checkbox";
import Tabs from "../../src/components/solid/fixtures/styled/tabs";
import CheckboxGroup from "../../src/components/solid/fixtures/styled/checkboxgroup";
import ColorSwatchPicker from "../../src/components/solid/fixtures/styled/colorswatchpicker";
import ColorWheel from "../../src/components/solid/fixtures/styled/colorwheel";
import RangeCalendar from "../../src/components/solid/fixtures/styled/rangecalendar";
import SegmentedControl from "../../src/components/solid/fixtures/styled/segmentedcontrol";
import TextField from "../../src/components/solid/fixtures/styled/textfield";
import TextArea from "../../src/components/solid/fixtures/styled/textarea";
import SearchField from "../../src/components/solid/fixtures/styled/searchfield";
import NumberField from "../../src/components/solid/fixtures/styled/numberfield";
import Slider from "../../src/components/solid/fixtures/styled/slider";
import RangeSlider from "../../src/components/solid/fixtures/styled/rangeslider";
import Switch from "../../src/components/solid/fixtures/styled/switch";
import RadioGroup from "../../src/components/solid/fixtures/styled/radiogroup";
import Avatar from "../../src/components/solid/fixtures/styled/avatar";
import AvatarGroup from "../../src/components/solid/fixtures/styled/avatargroup";
import Badge from "../../src/components/solid/fixtures/styled/badge";
import Card from "../../src/components/solid/fixtures/styled/card";
import Divider from "../../src/components/solid/fixtures/styled/divider";
import Icons from "../../src/components/solid/fixtures/styled/icons";
import IllustratedMessage from "../../src/components/solid/fixtures/styled/illustratedmessage";
import Illustrations from "../../src/components/solid/fixtures/styled/illustrations";
import InlineAlert from "../../src/components/solid/fixtures/styled/inlinealert";
import LabeledValue from "../../src/components/solid/fixtures/styled/labeledvalue";
import Link from "../../src/components/solid/fixtures/styled/link";
import LinkButton from "../../src/components/solid/fixtures/styled/linkbutton";
import Meter from "../../src/components/solid/fixtures/styled/meter";
import ProgressBar from "../../src/components/solid/fixtures/styled/progressbar";
import ProgressCircle from "../../src/components/solid/fixtures/styled/progresscircle";
import Provider from "../../src/components/solid/fixtures/styled/provider";
import Skeleton from "../../src/components/solid/fixtures/styled/skeleton";
import StatusLight from "../../src/components/solid/fixtures/styled/statuslight";
import ActionBar from "../../src/components/solid/fixtures/styled/actionbar";
import ActionButton from "../../src/components/solid/fixtures/styled/actionbutton";
import ActionButtonGroup from "../../src/components/solid/fixtures/styled/actionbuttongroup";
import ActionGroup from "../../src/components/solid/fixtures/styled/actiongroup";
import ButtonGroup from "../../src/components/solid/fixtures/styled/buttongroup";
import DropZone from "../../src/components/solid/fixtures/styled/dropzone";
import Form from "../../src/components/solid/fixtures/styled/form";
import ToggleButton from "../../src/components/solid/fixtures/styled/togglebutton";
import ToggleButtonGroup from "../../src/components/solid/fixtures/styled/togglebuttongroup";
import Toolbar from "../../src/components/solid/fixtures/styled/toolbar";
import { checkboxDemoDefaults, comparisonControlsEvent } from "../../src/data/checkbox-demo";
import { tabsDemoDefaults } from "../../src/data/tabs-demo";
import { checkboxGroupDemoDefaults } from "../../src/data/checkboxgroup-demo";
import { colorSwatchPickerDemoDefaults } from "../../src/data/colorswatchpicker-demo";
import { colorWheelDemoDefaults } from "../../src/data/colorwheel-demo";
import { segmentedControlDemoDefaults } from "../../src/data/segmentedcontrol-demo";
import { textFieldDemoDefaults } from "../../src/data/textfield-demo";
import { textAreaDemoDefaults } from "../../src/data/textarea-demo";
import { searchFieldDemoDefaults } from "../../src/data/searchfield-demo";
import { numberFieldDemoDefaults } from "../../src/data/numberfield-demo";
import { sliderDemoDefaults } from "../../src/data/slider-demo";
import { rangeSliderDemoDefaults } from "../../src/data/rangeslider-demo";
import { switchDemoDefaults } from "../../src/data/switch-demo";
import { radioGroupDemoDefaults } from "../../src/data/radiogroup-demo";
import { avatarDemoDefaults } from "../../src/data/avatar-demo";
import { avatarGroupDemoDefaults } from "../../src/data/avatar-group-demo";
import { badgeDemoDefaults } from "../../src/data/badge-demo";
import { cardDemoDefaults } from "../../src/data/card-demo";
import { dividerDemoDefaults } from "../../src/data/divider-demo";
import { iconsDemoDefaults } from "../../src/data/icons-demo";
import { illustratedMessageDemoDefaults } from "../../src/data/illustratedmessage-demo";
import { illustrationsDemoDefaults } from "../../src/data/illustrations-demo";
import { inlineAlertDemoDefaults } from "../../src/data/inlinealert-demo";
import { labeledValueDemoDefaults } from "../../src/data/labeledvalue-demo";
import { linkDemoDefaults } from "../../src/data/link-demo";
import { linkButtonDemoDefaults } from "../../src/data/button-family-demo";
import { meterDemoDefaults } from "../../src/data/meter-demo";
import { progressBarDemoDefaults, progressCircleDemoDefaults } from "../../src/data/progress-demo";
import { providerDemoDefaults } from "../../src/data/provider-demo";
import { skeletonDemoDefaults } from "../../src/data/skeleton-demo";
import { statusLightDemoDefaults } from "../../src/data/statuslight-demo";
import { actionBarDemoDefaults } from "../../src/data/actionbar-demo";
import { actionButtonDemoDefaults } from "../../src/data/actionbutton-demo";
import { actionGroupDemoDefaults } from "../../src/data/actiongroup-demo";
import {
  actionButtonGroupDemoDefaults,
  buttonGroupDemoDefaults,
  toggleButtonDemoDefaults,
  toggleButtonGroupDemoDefaults,
} from "../../src/data/button-family-demo";
import { dropZoneDemoDefaults } from "../../src/data/dropzone-demo";
import { formDemoDefaults } from "../../src/data/form-demo";
import { toolbarDemoDefaults } from "../../src/data/toolbar-demo";
import { comparisonThemeChangeEvent } from "../../src/data/theme";

// Actual manual fixture source with real built package components, not mock
// keyed controls. This CSR proof does not certify SSR or the app's CSS pipeline.
let container: HTMLDivElement;
let dispose: (() => void) | undefined;
let assertListenersRemoved: () => void;
let expectedFixtureRegistrations: 1 | 2;
function expectExactListenerRemoval(
  registrations: [string, ...unknown[]][],
  removals: [string, ...unknown[]][],
) {
  expect(removals).toHaveLength(registrations.length);
  for (const registration of registrations) {
    expect(removals).toContainEqual(registration);
  }
}
beforeEach(() => {
  window.history.replaceState({}, "", "/");
  container = document.createElement("div");
  document.body.append(container);
  const add = vi.spyOn(window, "addEventListener");
  const remove = vi.spyOn(window, "removeEventListener");
  const isFixtureEvent = ([type]: [string, ...unknown[]]) =>
    [comparisonControlsEvent, comparisonThemeChangeEvent].includes(type);
  expectedFixtureRegistrations = 2;
  assertListenersRemoved = () => {
    const registrations = add.mock.calls.filter(isFixtureEvent);
    expect(registrations).toHaveLength(expectedFixtureRegistrations);
    expectExactListenerRemoval(registrations, remove.mock.calls.filter(isFixtureEvent));
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
function inputValue(element: HTMLInputElement | HTMLTextAreaElement, value: string) {
  element.value = value;
  element.dispatchEvent(new InputEvent("input", { bubbles: true, data: value }));
}
function keyDown(element: Element, key: string) {
  element.dispatchEvent(new KeyboardEvent("keydown", { key, bubbles: true }));
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

it("text field keeps its live input through input, controls, and theme changes", async () => {
  dispose = render(() => TextField(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="textfield"]');
  const input = container.querySelector<HTMLInputElement>("input");
  expect(root).not.toBeNull();
  expect(input).not.toBeNull();
  inputValue(input!, "Lifecycle text");
  await settle();
  expect(root?.dataset.comparisonValue).toBe("Lifecycle text");
  expect(container.querySelector("input")).toBe(input);
  controls("textfield", { ...textFieldDemoDefaults, label: "Renamed", isDisabled: true });
  window.dispatchEvent(
    new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
  );
  await settle();
  expect(container.querySelector("input")).toBe(input);
  expect(input?.disabled).toBe(true);
  expect(container.textContent).toContain("Renamed");
  expect(root?.dataset.comparisonColorScheme).toBe("dark");
});

it("text area keeps its live control through multiline input and live props", async () => {
  dispose = render(() => TextArea(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="textarea"]');
  const textarea = container.querySelector<HTMLTextAreaElement>("textarea");
  expect(root).not.toBeNull();
  expect(textarea).not.toBeNull();
  inputValue(textarea!, "First line\nSecond line");
  await settle();
  expect(root?.dataset.comparisonValue).toBe("First line\nSecond line");
  controls("textarea", { ...textAreaDemoDefaults, label: "Updated notes", isReadOnly: true });
  window.dispatchEvent(
    new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
  );
  await settle();
  expect(container.querySelector("textarea")).toBe(textarea);
  expect(textarea?.readOnly).toBe(true);
  expect(container.textContent).toContain("Updated notes");
  expect(root?.dataset.comparisonColorScheme).toBe("dark");
});

it("search field retains its focused searchbox for input, clear, props, and theme", async () => {
  dispose = render(() => SearchField(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="searchfield"]');
  const shell = container.querySelector<HTMLElement>("[data-comparison-value]");
  const input = container.querySelector<HTMLInputElement>('input[type="search"]');
  expect(root).not.toBeNull();
  expect(shell).not.toBeNull();
  expect(input).not.toBeNull();
  input?.focus();
  expect(document.activeElement).toBe(input);
  inputValue(input!, "active query");
  await settle();
  expect(shell?.dataset.comparisonValue).toBe("active query");
  expect(container.querySelector('input[type="search"]')).toBe(input);
  const clear = container.querySelector<HTMLButtonElement>("button");
  expect(clear).not.toBeNull();
  clear?.click();
  await settle();
  expect(shell?.dataset.comparisonValue).toBe("");
  expect(shell?.dataset.comparisonClearCount).toBe("1");
  controls("searchfield", { ...searchFieldDemoDefaults, label: "Find projects", isDisabled: true });
  window.dispatchEvent(
    new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
  );
  await settle();
  expect(container.querySelector('input[type="search"]')).toBe(input);
  expect(input?.disabled).toBe(true);
  expect(container.textContent).toContain("Find projects");
  expect(shell?.dataset.comparisonColorScheme).toBe("dark");
});

it("number field retains its spinbutton and steps from the keyboard", async () => {
  dispose = render(() => NumberField(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="numberfield"]');
  const input = container.querySelector<HTMLInputElement>('input:not([type="hidden"])');
  expect(root).not.toBeNull();
  expect(input).not.toBeNull();
  input?.focus();
  expect(document.activeElement).toBe(input);
  keyDown(input!, "ArrowUp");
  await settle();
  expect(root?.dataset.comparisonValue).toBe("6");
  expect(container.querySelector('input:not([type="hidden"])')).toBe(input);
  expect(document.activeElement).toBe(input);
  controls("numberfield", { ...numberFieldDemoDefaults, label: "Seats", isDisabled: true });
  window.dispatchEvent(
    new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
  );
  await settle();
  expect(container.querySelector('input:not([type="hidden"])')).toBe(input);
  expect(input?.disabled).toBe(true);
  expect(container.textContent).toContain("Seats");
  expect(root?.dataset.comparisonColorScheme).toBe("dark");
});

it("slider retains its live thumb and handles keyboard stepping", async () => {
  dispose = render(() => Slider(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="slider"]');
  const thumb = container.querySelector<HTMLElement>('[role="slider"]');
  expect(root).not.toBeNull();
  expect(thumb?.getAttribute("aria-valuenow")).toBe("40");
  thumb?.focus();
  expect(document.activeElement).toBe(thumb);
  keyDown(thumb!, "ArrowRight");
  await settle();
  expect(thumb?.getAttribute("aria-valuenow")).toBe("41");
  expect(root?.dataset.comparisonValue).toBe("41");
  expect(container.querySelector('[role="slider"]')).toBe(thumb);
  expect(document.activeElement).toBe(thumb);
  controls("slider", { ...sliderDemoDefaults, label: "Output", isEmphasized: true });
  window.dispatchEvent(
    new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
  );
  await settle();
  expect(container.querySelector('[role="slider"]')).toBe(thumb);
  expect(container.textContent).toContain("Output");
  expect(root?.dataset.comparisonColorScheme).toBe("dark");
});

it("range slider retains and independently steps both live thumbs", async () => {
  dispose = render(() => RangeSlider(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="rangeslider"]');
  const thumbs = [...container.querySelectorAll<HTMLElement>('[role="slider"]')];
  expect(root).not.toBeNull();
  expect(thumbs).toHaveLength(2);
  expect(thumbs[0].getAttribute("aria-valuenow")).toBe("30");
  expect(thumbs[1].getAttribute("aria-valuenow")).toBe("60");
  thumbs[0].focus();
  expect(document.activeElement).toBe(thumbs[0]);
  keyDown(thumbs[0], "ArrowRight");
  await settle();
  expect(thumbs[0].getAttribute("aria-valuenow")).toBe("31");
  expect(container.querySelectorAll('[role="slider"]')[0]).toBe(thumbs[0]);
  expect(document.activeElement).toBe(thumbs[0]);
  thumbs[1].focus();
  expect(document.activeElement).toBe(thumbs[1]);
  keyDown(thumbs[1], "ArrowLeft");
  await settle();
  expect(thumbs[1].getAttribute("aria-valuenow")).toBe("59");
  expect(root?.dataset.comparisonValue).toBe("31:59");
  const stepped = [...container.querySelectorAll('[role="slider"]')];
  expect(stepped[0]).toBe(thumbs[0]);
  expect(stepped[1]).toBe(thumbs[1]);
  expect(document.activeElement).toBe(thumbs[1]);
  controls("rangeslider", { ...rangeSliderDemoDefaults, label: "Budget", isEmphasized: true });
  window.dispatchEvent(
    new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
  );
  await settle();
  const retained = [...container.querySelectorAll('[role="slider"]')];
  expect(retained[0]).toBe(thumbs[0]);
  expect(retained[1]).toBe(thumbs[1]);
  expect(container.textContent).toContain("Budget");
  expect(root?.dataset.comparisonColorScheme).toBe("dark");
});

it("switch retains its live input and toggles from Space", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => Switch(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="switch"]');
  const input = container.querySelector<HTMLInputElement>('[role="switch"]');
  expect(root).not.toBeNull();
  expect(input?.checked).toBe(false);
  input?.focus();
  await user.keyboard(" ");
  await settle();
  expect(input?.checked).toBe(true);
  expect(root?.dataset.comparisonSelected).toBe("true");
  controls("switch", { ...switchDemoDefaults, children: "Bluetooth", isEmphasized: true });
  window.dispatchEvent(
    new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
  );
  await settle();
  expect(container.querySelector('[role="switch"]')).toBe(input);
  expect(container.textContent).toContain("Bluetooth");
  expect(root?.dataset.comparisonColorScheme).toBe("dark");
});

it("radio group retains its live radios and moves selection with ArrowDown", async () => {
  dispose = render(() => RadioGroup(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="radiogroup"]');
  const radios = [...container.querySelectorAll<HTMLInputElement>('input[type="radio"]')];
  expect(root).not.toBeNull();
  expect(radios).toHaveLength(3);
  expect(radios[0].checked).toBe(true);
  radios[0].focus();
  keyDown(radios[0], "ArrowDown");
  await settle();
  expect(radios[1].checked).toBe(true);
  expect(root?.dataset.comparisonSelectedValue).toBe("pro");
  controls("radiogroup", {
    ...radioGroupDemoDefaults,
    label: "Workspace plan",
    isEmphasized: true,
  });
  window.dispatchEvent(
    new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
  );
  await settle();
  const retained = [...container.querySelectorAll('input[type="radio"]')];
  radios.forEach((radio, index) => expect(retained[index]).toBe(radio));
  expect(container.textContent).toContain("Workspace plan");
  expect(root?.dataset.comparisonColorScheme).toBe("dark");
});

it.each([
  ["textfield", TextField, textFieldDemoDefaults],
  ["textarea", TextArea, textAreaDemoDefaults],
  ["searchfield", SearchField, searchFieldDemoDefaults],
  ["numberfield", NumberField, numberFieldDemoDefaults],
  ["slider", Slider, sliderDemoDefaults],
  ["rangeslider", RangeSlider, rangeSliderDemoDefaults],
  ["switch", Switch, switchDemoDefaults],
  ["radiogroup", RadioGroup, radioGroupDemoDefaults],
])(
  "%s removes its exact listeners on disposal and installs a clean remount",
  async (component, Fixture, defaults) => {
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const fixtureCalls = (calls: [string, ...unknown[]][]) =>
      calls.filter(([type]) =>
        [comparisonControlsEvent, comparisonThemeChangeEvent].includes(type),
      );

    dispose = render(() => Fixture(), container);
    await settle();
    const root = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(root).not.toBeNull();
    const registrations = fixtureCalls(add.mock.calls);
    expect(registrations).toHaveLength(2);
    const retainedScheme = root?.dataset.comparisonColorScheme;

    dispose();
    dispose = undefined;
    expectExactListenerRemoval(registrations, fixtureCalls(remove.mock.calls));
    controls(component, defaults);
    window.dispatchEvent(
      new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
    );
    await settle();
    expect(root?.isConnected).toBe(false);
    expect(root?.dataset.comparisonColorScheme).toBe(retainedScheme);

    add.mockClear();
    remove.mockClear();
    dispose = render(() => Fixture(), container);
    await settle();
    const replacement = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(replacement).not.toBeNull();
    expect(replacement).not.toBe(root);
    expect(fixtureCalls(add.mock.calls)).toHaveLength(2);
  },
);

const actionControlFixtures = [
  {
    component: "actionbar",
    Fixture: ActionBar,
    defaults: actionBarDemoDefaults,
    updated: { ...actionBarDemoDefaults, selectedItemCount: 1, isEmphasized: true },
    registrations: 2,
  },
  {
    component: "actionbutton",
    Fixture: ActionButton,
    defaults: actionButtonDemoDefaults,
    updated: {
      ...actionButtonDemoDefaults,
      children: "Updated inspect",
      size: "L",
      isDisabled: true,
    },
    registrations: 2,
  },
  {
    component: "actionbuttongroup",
    Fixture: ActionButtonGroup,
    defaults: actionButtonGroupDemoDefaults,
    updated: {
      ...actionButtonGroupDemoDefaults,
      density: "compact",
      orientation: "vertical",
      isQuiet: true,
    },
    registrations: 1,
  },
  {
    component: "actiongroup",
    Fixture: ActionGroup,
    defaults: actionGroupDemoDefaults,
    updated: {
      ...actionGroupDemoDefaults,
      selectionMode: "multiple",
      orientation: "vertical",
      defaultSelectedKeys: "bold",
      disabledKeys: "underline",
    },
    registrations: 2,
  },
  {
    component: "buttongroup",
    Fixture: ButtonGroup,
    defaults: buttonGroupDemoDefaults,
    updated: {
      ...buttonGroupDemoDefaults,
      orientation: "vertical",
      align: "end",
      isDisabled: true,
    },
    registrations: 1,
  },
  {
    component: "dropzone",
    Fixture: DropZone,
    defaults: dropZoneDemoDefaults,
    updated: {
      ...dropZoneDemoDefaults,
      size: "L",
      isFilled: true,
      replaceMessage: "Replace asset",
      ariaLabel: "Updated upload area",
    },
    registrations: 2,
  },
  {
    component: "form",
    Fixture: Form,
    defaults: formDemoDefaults,
    updated: {
      ...formDemoDefaults,
      label: "Updated project",
      value: "Updated value",
      actionLabel: "Save project",
      isRequired: true,
    },
    registrations: 2,
  },
  {
    component: "togglebutton",
    Fixture: ToggleButton,
    defaults: toggleButtonDemoDefaults,
    updated: {
      ...toggleButtonDemoDefaults,
      children: "Updated pin",
      isEmphasized: true,
      isSelected: true,
    },
    registrations: 1,
  },
  {
    component: "togglebuttongroup",
    Fixture: ToggleButtonGroup,
    defaults: toggleButtonGroupDemoDefaults,
    updated: {
      ...toggleButtonGroupDemoDefaults,
      selectionMode: "multiple",
      selectedKeys: "left,center",
      orientation: "vertical",
      isEmphasized: true,
    },
    registrations: 2,
  },
  {
    component: "toolbar",
    Fixture: Toolbar,
    defaults: toolbarDemoDefaults,
    updated: { ...toolbarDemoDefaults, orientation: "vertical" },
    registrations: 2,
  },
];

function expectActionControlSemantics(component: string, root: HTMLElement) {
  switch (component) {
    case "actionbar":
      expect(root.dataset.comparisonSelectedCount).toBe("1");
      break;
    case "actionbutton":
      expect(root.querySelector("button")?.disabled).toBe(true);
      expect(root.textContent).toContain("Updated inspect");
      break;
    case "actionbuttongroup":
    case "actiongroup":
    case "togglebuttongroup":
    case "toolbar":
      expect(root.getAttribute("aria-orientation")).toBe("vertical");
      break;
    case "buttongroup":
      expect(
        [...root.querySelectorAll<HTMLButtonElement>("button")].every((button) => button.disabled),
      ).toBe(true);
      break;
    case "dropzone":
      expect(root.querySelector("button")?.getAttribute("aria-label")).toBe("Updated upload area");
      break;
    case "form": {
      const input = root.querySelector<HTMLInputElement>("input");
      expect(input?.value).toBe("Updated value");
      expect(input?.required || input?.getAttribute("aria-required") === "true").toBe(true);
      expect(root.textContent).toContain("Updated project");
      expect(root.textContent).toContain("Save project");
      break;
    }
    case "togglebutton":
      expect(root.getAttribute("aria-pressed")).toBe("true");
      expect(root.textContent).toContain("Updated pin");
      break;
  }
}

it.each(actionControlFixtures)(
  "action/basic controls $component removes exact listeners, stays inert, and cleanly remounts",
  async ({ component, Fixture, defaults, updated, registrations: expectedRegistrations }) => {
    expectedFixtureRegistrations = expectedRegistrations as 1 | 2;
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const fixtureCalls = (calls: [string, ...unknown[]][]) =>
      calls.filter(([type]) =>
        [comparisonControlsEvent, comparisonThemeChangeEvent].includes(type),
      );

    dispose = render(() => Fixture(), container);
    await settle();
    const root = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(root).not.toBeNull();
    const listenerRegistrations = fixtureCalls(add.mock.calls);
    expect(listenerRegistrations).toHaveLength(expectedRegistrations);
    const initialProps = root?.dataset.comparisonControlProps;

    controls(component, updated);
    if (expectedRegistrations === 2) {
      theme("dark");
    }
    await settle();
    const liveRoot = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(liveRoot).not.toBeNull();
    const liveProps = JSON.parse(liveRoot?.dataset.comparisonControlProps ?? "{}");
    for (const [key, value] of Object.entries(updated)) {
      expect(liveProps[key]).toBe(value);
    }
    expectActionControlSemantics(component, liveRoot!);
    const themeShell =
      expectedRegistrations === 2
        ? container.querySelector<HTMLElement>("[data-color-scheme]")
        : null;
    if (themeShell) {
      expect(themeShell.getAttribute("data-color-scheme")).toBe("dark");
    }
    const retainedProps = liveRoot?.dataset.comparisonControlProps;
    const retainedTheme = themeShell?.getAttribute("data-color-scheme");

    dispose();
    dispose = undefined;
    expectExactListenerRemoval(listenerRegistrations, fixtureCalls(remove.mock.calls));
    controls(component, defaults);
    theme("light");
    await settle();
    expect(liveRoot?.isConnected).toBe(false);
    expect(liveRoot?.dataset.comparisonControlProps).toBe(retainedProps);
    expect(themeShell?.getAttribute("data-color-scheme")).toBe(retainedTheme);

    add.mockClear();
    remove.mockClear();
    dispose = render(() => Fixture(), container);
    await settle();
    const replacement = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(replacement).not.toBeNull();
    expect(replacement).not.toBe(liveRoot);
    expect(replacement?.dataset.comparisonControlProps).toBe(initialProps);
    expect(fixtureCalls(add.mock.calls)).toHaveLength(expectedRegistrations);
  },
);

it.each([
  ["actionbar", ActionBar, 2, "Edit", "data-comparison-action-count", "1"],
  ["actionbutton", ActionButton, 2, "Inspect", "data-comparison-action-count", "1"],
  ["actionbuttongroup", ActionButtonGroup, 1, "Bold", "data-comparison-action-key", "bold"],
  ["buttongroup", ButtonGroup, 1, "Save", "data-comparison-action-key", "save"],
] as const)(
  "action/basic controls %s observes press through the focused rendered button",
  async (component, Fixture, registrations, label, resultAttribute, result) => {
    expectedFixtureRegistrations = registrations;
    dispose = render(() => Fixture(), container);
    await settle();
    const button = [...container.querySelectorAll<HTMLButtonElement>("button")].find(
      (candidate) => candidate.textContent?.trim() === label,
    );
    const resultRoot = container.querySelector<HTMLElement>(`[${resultAttribute}]`);
    expect(button).not.toBeUndefined();
    expect(resultRoot).not.toBeNull();
    button?.focus();
    button?.click();
    await settle();
    expect(container.querySelector(`[${resultAttribute}]`)).toBe(resultRoot);
    expect(resultRoot?.getAttribute(resultAttribute)).toBe(result);
    expect(button?.isConnected).toBe(true);
    expect(document.activeElement).toBe(button);
  },
);

it("action/basic controls ToggleButton retains focus and identity through keyboard toggle", async () => {
  expectedFixtureRegistrations = 1;
  const user = userEvent.setup({ delay: null });
  dispose = render(() => ToggleButton(), container);
  await settle();
  const button = container.querySelector<HTMLButtonElement>(
    '[data-comparison-control-root="togglebutton"]',
  );
  const shell = container.querySelector<HTMLElement>("[data-comparison-selected]");
  expect(button?.getAttribute("aria-pressed")).toBe("false");
  button?.focus();
  await user.keyboard(" ");
  await settle();
  expect(container.querySelector('[data-comparison-control-root="togglebutton"]')).toBe(button);
  expect(button?.getAttribute("aria-pressed")).toBe("true");
  expect(shell?.dataset.comparisonSelected).toBe("true");
  expect(document.activeElement).toBe(button);
});

it("action/basic controls ToggleButtonGroup retains controls through selection", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => ToggleButtonGroup(), container);
  await settle();
  const root = container.querySelector<HTMLElement>(
    '[data-comparison-control-root="togglebuttongroup"]',
  );
  const radios = [...container.querySelectorAll<HTMLElement>('[role="radio"]')];
  expect(radios).toHaveLength(3);
  radios[1].focus();
  await user.keyboard(" ");
  await settle();
  expect(container.querySelector('[data-comparison-control-root="togglebuttongroup"]')).toBe(root);
  radios.forEach((radio, index) =>
    expect(container.querySelectorAll('[role="radio"]')[index]).toBe(radio),
  );
  expect(radios[1].getAttribute("aria-checked")).toBe("true");
  expect(
    container
      .querySelector("[data-comparison-selected-keys]")
      ?.getAttribute("data-comparison-selected-keys"),
  ).toBe("center");
  expect(document.activeElement).toBe(radios[1]);
});

it("action/basic controls ActionGroup observes selection and keyboard focus on rendered items", async () => {
  window.history.replaceState({}, "", "/?selectionMode=single");
  dispose = render(() => ActionGroup(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="actiongroup"]');
  const radios = [...container.querySelectorAll<HTMLElement>('[role="radio"]')];
  expect(radios).toHaveLength(3);
  radios[0].focus();
  radios[0].click();
  await settle();
  expect(radios[0].getAttribute("aria-checked")).toBe("true");
  keyDown(radios[0], "ArrowRight");
  await settle();
  expect(container.querySelector('[data-comparison-control-root="actiongroup"]')).toBe(root);
  radios.forEach((radio, index) =>
    expect(container.querySelectorAll('[role="radio"]')[index]).toBe(radio),
  );
  expect(document.activeElement).toBe(radios[1]);
});

it("action/basic controls Toolbar moves focus without replacing rendered controls", async () => {
  dispose = render(() => Toolbar(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="toolbar"]');
  const buttons = [...root!.querySelectorAll<HTMLButtonElement>("button")];
  expect(buttons).toHaveLength(3);
  buttons[0].focus();
  keyDown(buttons[0], "ArrowRight");
  await settle();
  expect(container.querySelector('[data-comparison-control-root="toolbar"]')).toBe(root);
  buttons.forEach((button, index) => expect(root?.querySelectorAll("button")[index]).toBe(button));
  expect(document.activeElement).toBe(buttons[1]);
});

it.each([
  ["dropzone", DropZone, "button"],
  ["form", Form, "input"],
] as const)(
  "action/basic controls %s retains its focused native control across live props and theme",
  async (component, Fixture, selector) => {
    dispose = render(() => Fixture(), container);
    await settle();
    const root = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    const control = root?.querySelector<HTMLElement>(selector);
    expect(control).not.toBeNull();
    control?.focus();
    controls(
      component,
      component === "dropzone"
        ? { ...dropZoneDemoDefaults, ariaLabel: "Retained upload area", size: "L" }
        : { ...formDemoDefaults, label: "Retained project", value: "Retained value" },
    );
    theme("dark");
    await settle();
    expect(container.querySelector(`[data-comparison-control-root="${component}"]`)).toBe(root);
    expect(root?.querySelector(selector)).toBe(control);
    expect(document.activeElement).toBe(control);
    if (component === "dropzone") {
      expect(control?.getAttribute("aria-label")).toBe("Retained upload area");
    } else {
      expect((control as HTMLInputElement | undefined)?.value).toBe("Retained value");
    }
  },
);

const presentationFixtures = [
  {
    component: "avatar",
    Fixture: Avatar,
    defaults: avatarDemoDefaults,
    updated: { ...avatarDemoDefaults, alt: "Updated avatar", size: "40", isOverBackground: true },
    expected: { alt: "Updated avatar", size: "40", isOverBackground: true },
  },
  {
    component: "avatargroup",
    Fixture: AvatarGroup,
    defaults: avatarGroupDemoDefaults,
    updated: {
      ...avatarGroupDemoDefaults,
      label: "2 members",
      ariaLabel: "Updated collaborators",
      size: "32",
      count: "2",
    },
    expected: { label: "2 members", ariaLabel: "Updated collaborators", count: "2" },
  },
  {
    component: "badge",
    Fixture: Badge,
    defaults: badgeDemoDefaults,
    updated: {
      ...badgeDemoDefaults,
      children: "Draft",
      variant: "positive",
      fillStyle: "outline",
      size: "M",
    },
    expected: { children: "Draft", variant: "positive", fillStyle: "outline", size: "M" },
  },
  {
    component: "card",
    Fixture: Card,
    defaults: cardDemoDefaults,
    updated: {
      ...cardDemoDefaults,
      title: "Updated card",
      description: "Updated description",
      density: "compact",
    },
    expected: { title: "Updated card", description: "Updated description", density: "compact" },
  },
  {
    component: "divider",
    Fixture: Divider,
    defaults: dividerDemoDefaults,
    updated: { ...dividerDemoDefaults, orientation: "vertical", size: "L", staticColor: "black" },
    expected: { orientation: "vertical", size: "L", staticColor: "black" },
  },
  {
    component: "icons",
    Fixture: Icons,
    defaults: iconsDemoDefaults,
    updated: { ...iconsDemoDefaults, ariaLabel: "Updated icon", buttonLabel: "Updated action" },
    expected: { ariaLabel: "Updated icon", buttonLabel: "Updated action" },
  },
  {
    component: "illustratedmessage",
    Fixture: IllustratedMessage,
    defaults: illustratedMessageDemoDefaults,
    updated: { ...illustratedMessageDemoDefaults, size: "L", orientation: "horizontal" },
    expected: { size: "L", orientation: "horizontal", withActions: true },
  },
  {
    component: "illustrations",
    Fixture: Illustrations,
    defaults: illustrationsDemoDefaults,
    updated: { ...illustrationsDemoDefaults, ariaLabel: "Updated illustration", size: "M" },
    expected: { ariaLabel: "Updated illustration", size: "M" },
  },
  {
    component: "inlinealert",
    Fixture: InlineAlert,
    defaults: inlineAlertDemoDefaults,
    updated: { ...inlineAlertDemoDefaults, variant: "negative", fillStyle: "boldFill" },
    expected: { variant: "negative", fillStyle: "boldFill" },
  },
  {
    component: "labeledvalue",
    Fixture: LabeledValue,
    defaults: labeledValueDemoDefaults,
    updated: { ...labeledValueDemoDefaults, label: "Updated label", value: "Updated value" },
    expected: { label: "Updated label", value: "Updated value" },
  },
  {
    component: "link",
    Fixture: Link,
    defaults: linkDemoDefaults,
    updated: {
      ...linkDemoDefaults,
      children: "Updated link",
      href: "https://example.com/updated",
      isStandalone: true,
    },
    expected: {
      children: "Updated link",
      href: "https://example.com/updated",
      isStandalone: true,
    },
  },
  {
    component: "linkbutton",
    Fixture: LinkButton,
    defaults: linkButtonDemoDefaults,
    updated: {
      ...linkButtonDemoDefaults,
      children: "Updated docs",
      href: "https://example.com/updated-docs",
      size: "L",
    },
    expected: { children: "Updated docs", href: "https://example.com/updated-docs", size: "L" },
  },
  {
    component: "meter",
    Fixture: Meter,
    defaults: meterDemoDefaults,
    updated: { ...meterDemoDefaults, label: "Updated meter", value: 33, valueLabel: "33 GB" },
    expected: { label: "Updated meter", value: 33, valueLabel: "33 GB" },
  },
  {
    component: "progressbar",
    Fixture: ProgressBar,
    defaults: progressBarDemoDefaults,
    updated: {
      ...progressBarDemoDefaults,
      label: "Updated progress",
      value: 25,
      valueLabel: "Quarter",
    },
    expected: { label: "Updated progress", value: 25, valueLabel: "Quarter" },
  },
  {
    component: "progresscircle",
    Fixture: ProgressCircle,
    defaults: progressCircleDemoDefaults,
    updated: { ...progressCircleDemoDefaults, ariaLabel: "Updated circle", value: 25 },
    expected: { ariaLabel: "Updated circle", value: 25 },
  },
  {
    component: "provider",
    Fixture: Provider,
    defaults: providerDemoDefaults,
    updated: { ...providerDemoDefaults, colorScheme: "light", background: "layer-1" },
    expected: { colorScheme: "light", background: "layer-1" },
  },
  {
    component: "skeleton",
    Fixture: Skeleton,
    defaults: skeletonDemoDefaults,
    updated: { ...skeletonDemoDefaults, isLoading: false },
    expected: { isLoading: false },
  },
  {
    component: "statuslight",
    Fixture: StatusLight,
    defaults: statusLightDemoDefaults,
    updated: {
      ...statusLightDemoDefaults,
      children: "Updated status",
      variant: "positive",
      role: "status",
    },
    expected: { children: "Updated status", variant: "positive", role: "status" },
  },
];

function theme(resolvedTheme: "light" | "dark") {
  window.dispatchEvent(new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme } }));
}

function expectPresentationSemantics(component: string, root: HTMLElement) {
  switch (component) {
    case "avatar":
      expect(root.querySelector("img")?.getAttribute("alt")).toBe("Updated avatar");
      expect(root.dataset.comparisonAvatarOverBackground).toBe("true");
      break;
    case "avatargroup":
      expect(root.textContent).toContain("2 members");
      expect(root.querySelector('[aria-label="Updated collaborators"]')).not.toBeNull();
      break;
    case "badge":
      expect(root.textContent).toContain("Draft");
      break;
    case "card":
      expect(root.textContent).toContain("Updated card");
      expect(root.textContent).toContain("Updated description");
      break;
    case "divider":
      expect(root.getAttribute("aria-orientation")).toBe("vertical");
      break;
    case "icons":
      expect(
        root.querySelector('[data-comparison-icon="labelled"]')?.getAttribute("aria-label"),
      ).toBe("Updated icon");
      expect(root.querySelector('[data-comparison-icon="button-context"]')?.textContent).toContain(
        "Updated action",
      );
      break;
    case "illustrations":
      expect(
        root.querySelector('[data-comparison-illustration="labelled"]')?.getAttribute("aria-label"),
      ).toBe("Updated illustration");
      break;
    case "inlinealert":
      expect(root.textContent).toContain("Payment Error");
      break;
    case "labeledvalue":
      expect(root.textContent).toContain("Updated label");
      expect(root.textContent).toContain("Updated value");
      break;
    case "link":
    case "linkbutton":
      expect(root.getAttribute("href")).toContain("updated");
      break;
    case "meter":
      expect(root.getAttribute("aria-valuenow")).toBe("33");
      expect(root.textContent).toContain("33 GB");
      break;
    case "progressbar":
    case "progresscircle":
      expect(root.querySelector('[role="progressbar"]')?.getAttribute("aria-valuenow")).toBe("25");
      break;
    case "provider":
      expect(root.textContent).toContain("Outer provider: light / layer-1");
      break;
    case "statuslight":
      expect(root.textContent).toContain("Updated status");
      expect(root.getAttribute("role")).toBe("status");
      break;
  }
}

it.each(presentationFixtures)(
  "presentation leaves $component removes exact listeners, stays inert, and cleanly remounts",
  async ({ component, Fixture, defaults, updated, expected }) => {
    if (component === "provider") {
      expectedFixtureRegistrations = 1;
    }
    const add = vi.spyOn(window, "addEventListener");
    const remove = vi.spyOn(window, "removeEventListener");
    const fixtureCalls = (calls: [string, ...unknown[]][]) =>
      calls.filter(([type]) =>
        [comparisonControlsEvent, comparisonThemeChangeEvent].includes(type),
      );

    dispose = render(() => Fixture(), container);
    await settle();
    const root = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(root).not.toBeNull();
    const registrations = fixtureCalls(add.mock.calls);
    expect(registrations).toHaveLength(component === "provider" ? 1 : 2);
    const initialProps = root?.dataset.comparisonControlProps;
    const skeletonChild =
      component === "skeleton" ? root?.querySelector<HTMLElement>('[data-rsp-slot="text"]') : null;
    if (component === "skeleton") {
      expect(skeletonChild).not.toBeNull();
      expect(skeletonChild?.hasAttribute("inert")).toBe(true);
    }

    controls(component, updated);
    if (component !== "provider") {
      theme("dark");
    }
    await settle();
    const liveRoot = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(liveRoot).not.toBeNull();
    const liveProps = JSON.parse(liveRoot?.dataset.comparisonControlProps ?? "{}");
    for (const [key, value] of Object.entries(expected)) {
      expect(liveProps[key]).toBe(value);
    }
    expectPresentationSemantics(component, liveRoot!);
    if (component === "skeleton") {
      expect(liveRoot?.querySelector('[data-rsp-slot="text"]')).toBe(skeletonChild);
      expect(skeletonChild?.hasAttribute("inert")).toBe(false);
    }
    const themeShell = container.querySelector<HTMLElement>("[data-color-scheme]");
    expect(themeShell?.getAttribute("data-color-scheme")).toBe(
      component === "provider" ? "light" : "dark",
    );
    const retainedProps = liveRoot?.dataset.comparisonControlProps;
    const retainedTheme = themeShell?.getAttribute("data-color-scheme");

    dispose();
    dispose = undefined;
    expectExactListenerRemoval(registrations, fixtureCalls(remove.mock.calls));
    controls(component, defaults);
    theme(component === "provider" ? "dark" : "light");
    await settle();
    expect(liveRoot?.isConnected).toBe(false);
    expect(liveRoot?.dataset.comparisonControlProps).toBe(retainedProps);
    expect(themeShell?.getAttribute("data-color-scheme")).toBe(retainedTheme);

    add.mockClear();
    remove.mockClear();
    dispose = render(() => Fixture(), container);
    await settle();
    const replacement = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(replacement).not.toBeNull();
    expect(replacement).not.toBe(liveRoot);
    expect(replacement?.dataset.comparisonControlProps).toBe(initialProps);
    expect(fixtureCalls(add.mock.calls)).toHaveLength(component === "provider" ? 1 : 2);
  },
);

it.each([
  ["link", Link, linkDemoDefaults, "Updated link", "https://example.com/updated"],
  [
    "linkbutton",
    LinkButton,
    linkButtonDemoDefaults,
    "Updated docs",
    "https://example.com/updated-docs",
  ],
])(
  "presentation leaves %s retains its focused anchor across label, href, and theme updates",
  async (component, Fixture, defaults, label, href) => {
    dispose = render(() => Fixture(), container);
    await settle();
    const anchor = container.querySelector<HTMLAnchorElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(anchor).not.toBeNull();
    anchor?.focus();
    controls(component, { ...defaults, children: label, href });
    theme("dark");
    await settle();
    expect(container.querySelector(`[data-comparison-control-root="${component}"]`)).toBe(anchor);
    expect(document.activeElement).toBe(anchor);
    expect(anchor?.textContent).toContain(label);
    expect(anchor?.href).toBe(href);
  },
);

it("presentation leaves the link-backed card retains its focused anchor", async () => {
  window.history.replaceState({}, "", "/?href=https%3A%2F%2Fexample.com%2Fcard");
  dispose = render(() => Card(), container);
  await settle();
  const anchor = container.querySelector<HTMLAnchorElement>("a");
  expect(anchor).not.toBeNull();
  anchor?.focus();
  controls("card", { title: "Retained card", description: "Retained description" });
  theme("dark");
  await settle();
  expect(container.querySelector("a")).toBe(anchor);
  expect(document.activeElement).toBe(anchor);
  expect(anchor?.textContent).toContain("Retained card");
});

it("presentation leaves Provider retains its focused outer button", async () => {
  expectedFixtureRegistrations = 1;
  dispose = render(() => Provider(), container);
  await settle();
  const button = container.querySelector<HTMLButtonElement>("button");
  expect(button).not.toBeNull();
  button?.focus();
  controls("provider", { colorScheme: "light", background: "layer-1" });
  await settle();
  expect(container.querySelector("button")).toBe(button);
  expect(document.activeElement).toBe(button);
  expect(
    container.querySelector('[data-comparison-control-root="provider"]')?.textContent,
  ).toContain("Outer provider: light / layer-1");
});

it("presentation leaves Icons retains button context and contains structural removal", async () => {
  dispose = render(() => Icons(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="icons"]');
  const labelled = container.querySelector('[data-comparison-icon="labelled"]');
  const button = container.querySelector<HTMLButtonElement>(
    '[data-comparison-icon="button-context"]',
  );
  expect(button).not.toBeNull();
  button?.focus();
  controls("icons", { ...iconsDemoDefaults, ariaLabel: "Retained icon", buttonLabel: "Retained" });
  theme("dark");
  await settle();
  expect(container.querySelector('[data-comparison-control-root="icons"]')).toBe(root);
  expect(container.querySelector('[data-comparison-icon="labelled"]')).toBe(labelled);
  expect(container.querySelector('[data-comparison-icon="button-context"]')).toBe(button);
  expect(document.activeElement).toBe(button);
  expect(button?.textContent).toContain("Retained");
  controls("icons", { ...iconsDemoDefaults, showButtonContext: false });
  await settle();
  expect(container.querySelector('[data-comparison-control-root="icons"]')).toBe(root);
  expect(container.querySelector('[data-comparison-icon="labelled"]')).toBe(labelled);
  expect(button?.isConnected).toBe(false);
});

it("presentation leaves IllustratedMessage retains its action across props and theme", async () => {
  dispose = render(() => IllustratedMessage(), container);
  await settle();
  const root = container.querySelector<HTMLElement>(
    '[data-comparison-control-root="illustratedmessage"]',
  );
  const action = [...container.querySelectorAll<HTMLButtonElement>("button")].find(
    (node) => node.textContent === "Import",
  );
  expect(action).not.toBeUndefined();
  action?.focus();
  controls("illustratedmessage", {
    ...illustratedMessageDemoDefaults,
    size: "L",
    orientation: "horizontal",
  });
  theme("dark");
  await settle();
  expect(container.querySelector('[data-comparison-control-root="illustratedmessage"]')).toBe(root);
  expect(
    [...container.querySelectorAll("button")].find((node) => node.textContent === "Import"),
  ).toBe(action);
  expect(document.activeElement).toBe(action);
  controls("illustratedmessage", { ...illustratedMessageDemoDefaults, withActions: false });
  await settle();
  expect(container.querySelector('[data-comparison-control-root="illustratedmessage"]')).toBe(root);
  expect(action?.isConnected).toBe(false);
});

it("presentation leaves InlineAlert retains its autofocus root", async () => {
  window.history.replaceState({}, "", "/?autoFocus=true");
  dispose = render(() => InlineAlert(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="inlinealert"]');
  expect(root).not.toBeNull();
  expect(document.activeElement).toBe(root);
  controls("inlinealert", { variant: "negative", fillStyle: "boldFill", autoFocus: true });
  theme("dark");
  await settle();
  expect(container.querySelector('[data-comparison-control-root="inlinealert"]')).toBe(root);
  expect(document.activeElement).toBe(root);
  expect(root?.textContent).toContain("Payment Error");
});

it.each([
  ["meter", Meter, meterDemoDefaults, { label: "Live meter", value: 17, valueLabel: "17 GB" }],
  [
    "statuslight",
    StatusLight,
    statusLightDemoDefaults,
    { children: "Live status", variant: "positive", role: "status" },
  ],
])(
  "presentation leaves %s retains its semantic root across live text and value",
  async (component, Fixture, defaults, update) => {
    dispose = render(() => Fixture(), container);
    await settle();
    const root = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(root).not.toBeNull();
    controls(component, { ...defaults, ...update });
    theme("dark");
    await settle();
    expect(container.querySelector(`[data-comparison-control-root="${component}"]`)).toBe(root);
    expect(root?.textContent).toContain(component === "meter" ? "17 GB" : "Live status");
    if (component === "meter") {
      expect(root?.getAttribute("aria-valuenow")).toBe("17");
    } else {
      expect(root?.getAttribute("role")).toBe("status");
    }
  },
);
