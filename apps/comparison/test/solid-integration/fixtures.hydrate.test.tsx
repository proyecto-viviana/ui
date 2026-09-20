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
import Calendar from "../../src/components/solid/fixtures/styled/calendar";
import ColorArea from "../../src/components/solid/fixtures/styled/colorarea";
import ColorField from "../../src/components/solid/fixtures/styled/colorfield";
import ColorSlider from "../../src/components/solid/fixtures/styled/colorslider";
import ColorSwatch from "../../src/components/solid/fixtures/styled/colorswatch";
import DateField from "../../src/components/solid/fixtures/styled/datefield";
import DatePicker from "../../src/components/solid/fixtures/styled/datepicker";
import DateRangePicker from "../../src/components/solid/fixtures/styled/daterangepicker";
import TimeField from "../../src/components/solid/fixtures/styled/timefield";
import ActionMenu from "../../src/components/solid/fixtures/styled/actionmenu";
import ContextualHelp from "../../src/components/solid/fixtures/styled/contextualhelp";
import Dialog from "../../src/components/solid/fixtures/styled/dialog";
import Menu from "../../src/components/solid/fixtures/styled/menu";
import Popover from "../../src/components/solid/fixtures/styled/popover";
import Tooltip from "../../src/components/solid/fixtures/styled/tooltip";
import Accordion from "../../src/components/solid/fixtures/styled/accordion";
import Breadcrumbs from "../../src/components/solid/fixtures/styled/breadcrumbs";
import Disclosure from "../../src/components/solid/fixtures/styled/disclosure";
import StepList from "../../src/components/solid/fixtures/styled/steplist";
import CardView from "../../src/components/solid/fixtures/styled/cardview";
import DndListBox from "../../src/components/solid/fixtures/styled/dnd-listbox";
import GridList from "../../src/components/solid/fixtures/styled/gridlist";
import ListBox from "../../src/components/solid/fixtures/styled/listbox";
import ListView from "../../src/components/solid/fixtures/styled/listview";
import SelectBoxGroup from "../../src/components/solid/fixtures/styled/selectboxgroup";
import TableView from "../../src/components/solid/fixtures/styled/tableview";
import TagGroup from "../../src/components/solid/fixtures/styled/taggroup";
import TreeView from "../../src/components/solid/fixtures/styled/treeview";
import Virtualizer from "../../src/components/solid/fixtures/styled/virtualizer";
import Autocomplete from "../../src/components/solid/fixtures/styled/autocomplete";
import ComboBox from "../../src/components/solid/fixtures/styled/combobox";
import Image from "../../src/components/solid/fixtures/styled/image";
import Picker from "../../src/components/solid/fixtures/styled/picker";
import Toast from "../../src/components/solid/fixtures/styled/toast";
import { globalToastQueue } from "@proyecto-viviana/solid-spectrum/Toast";
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
import { calendarDemoDefaults } from "../../src/data/calendar-demo";
import { colorAreaDemoDefaults } from "../../src/data/colorarea-demo";
import { colorFieldDemoDefaults } from "../../src/data/colorfield-demo";
import { colorSliderDemoDefaults } from "../../src/data/colorslider-demo";
import { colorSwatchDemoDefaults } from "../../src/data/colorswatch-demo";
import { dateFieldDemoDefaults } from "../../src/data/datefield-demo";
import { datePickerDemoDefaults } from "../../src/data/datepicker-demo";
import { dateRangePickerDemoDefaults } from "../../src/data/daterangepicker-demo";
import { timeFieldDemoDefaults } from "../../src/data/timefield-demo";
import { actionMenuDemoDefaults } from "../../src/data/actionmenu-demo";
import { contextualHelpDemoDefaults } from "../../src/data/contextualhelp-demo";
import { dialogDemoDefaults } from "../../src/data/dialog-demo";
import { menuDemoDefaults } from "../../src/data/menu-demo";
import { popoverDemoDefaults } from "../../src/data/popover-demo";
import { tooltipDemoDefaults } from "../../src/data/tooltip-demo";
import { accordionDemoDefaults } from "../../src/data/accordion-demo";
import { breadcrumbsDemoDefaults } from "../../src/data/breadcrumbs-demo";
import { disclosureDemoDefaults } from "../../src/data/disclosure-demo";
import { stepListDemoDefaults } from "../../src/data/steplist-demo";
import { cardViewDemoDefaults } from "../../src/data/cardview-demo";
import { dndListBoxDemoDefaults } from "../../src/data/dnd-listbox-demo";
import { gridListDemoDefaults } from "../../src/data/gridlist-demo";
import { listBoxDemoDefaults } from "../../src/data/listbox-demo";
import { listViewDemoDefaults } from "../../src/data/listview-demo";
import { selectBoxGroupDemoDefaults } from "../../src/data/selectboxgroup-demo";
import { tableViewDemoDefaults } from "../../src/data/tableview-demo";
import { tagGroupDemoDefaults } from "../../src/data/taggroup-demo";
import { treeViewDemoDefaults } from "../../src/data/treeview-demo";
import { virtualizerDemoDefaults } from "../../src/data/virtualizer-demo";
import { autocompleteDemoDefaults } from "../../src/data/autocomplete-demo";
import { comboBoxDemoDefaults } from "../../src/data/combobox-demo";
import { imageDemoDefaults, imageMissingSource } from "../../src/data/image-demo";
import { pickerDemoDefaults } from "../../src/data/picker-demo";
import { toastDemoDefaults } from "../../src/data/toast-demo";
import { comparisonCallbackEvent } from "../../src/data/event-log";
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
async function nextAnimationFrame() {
  await new Promise<void>((done) => requestAnimationFrame(() => done()));
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

const dateColorFixtures = [
  {
    component: "calendar",
    Fixture: Calendar,
    defaults: calendarDemoDefaults,
    updated: {
      ...calendarDemoDefaults,
      value: "2025-02-03",
      focusedValue: "2025-02-04",
      isInvalid: true,
    },
    value: "2025-02-03",
  },
  {
    component: "colorarea",
    Fixture: ColorArea,
    defaults: colorAreaDemoDefaults,
    updated: { ...colorAreaDemoDefaults, ariaLabel: "Updated color area", value: "#336699" },
    value: "rgb(51, 102, 153)",
  },
  {
    component: "colorfield",
    Fixture: ColorField,
    defaults: colorFieldDemoDefaults,
    updated: { ...colorFieldDemoDefaults, label: "Updated color", value: "#112233" },
    value: "rgb(17, 34, 51)",
  },
  {
    component: "colorslider",
    Fixture: ColorSlider,
    defaults: colorSliderDemoDefaults,
    updated: { ...colorSliderDemoDefaults, label: "Updated hue", value: "hsl(60, 100%, 50%)" },
    value: "hsl(60, 100%, 50%)",
  },
  {
    component: "colorswatch",
    Fixture: ColorSwatch,
    defaults: colorSwatchDemoDefaults,
    updated: {
      ...colorSwatchDemoDefaults,
      ariaLabel: "Ocean swatch",
      color: "#336699",
      colorName: "Ocean",
    },
  },
  {
    component: "datefield",
    Fixture: DateField,
    defaults: dateFieldDemoDefaults,
    updated: {
      ...dateFieldDemoDefaults,
      label: "Updated appointment",
      value: "2025-02-04",
      isRequired: true,
    },
    value: "2025-02-04",
  },
  {
    component: "datepicker",
    Fixture: DatePicker,
    defaults: datePickerDemoDefaults,
    updated: {
      ...datePickerDemoDefaults,
      label: "Updated due date",
      value: "2025-02-03",
      isRequired: true,
    },
    value: "2025-02-03",
  },
  {
    component: "daterangepicker",
    Fixture: DateRangePicker,
    defaults: dateRangePickerDemoDefaults,
    updated: {
      ...dateRangePickerDemoDefaults,
      label: "Updated trip dates",
      startValue: "2025-02-03",
      endValue: "2025-02-08",
      isRequired: true,
    },
    value: "2025-02-03/2025-02-08",
  },
  {
    component: "timefield",
    Fixture: TimeField,
    defaults: timeFieldDemoDefaults,
    updated: {
      ...timeFieldDemoDefaults,
      label: "Updated start time",
      value: "10:45:00",
      isRequired: true,
    },
    value: "10:45:00",
  },
];

it.each(dateColorFixtures)(
  "stage A $component removes exact listeners, stays inert, and cleanly remounts",
  async ({ component, Fixture, defaults, updated, value }) => {
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
    const initialProps = root?.dataset.comparisonControlProps;

    controls(component, updated);
    window.dispatchEvent(
      new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
    );
    await settle();
    expect(container.querySelector(`[data-comparison-control-root="${component}"]`)).toBe(root);
    expect(root?.dataset.comparisonColorScheme).toBe("dark");
    const liveProps = JSON.parse(root?.dataset.comparisonControlProps ?? "{}");
    for (const [key, expected] of Object.entries(updated)) {
      expect(liveProps[key]).toBe(expected);
    }
    if (value) {
      expect(root?.dataset.comparisonValue).toBe(value);
    }
    switch (component) {
      case "calendar": {
        const selected = root?.querySelector<HTMLElement>('[aria-label*="February 3, 2025"]');
        const focused = root?.querySelector<HTMLElement>('[aria-label*="February 4, 2025"]');
        expect(selected).toHaveAttribute("data-selected", "true");
        expect(focused).toHaveAttribute("tabindex", "0");
        break;
      }
      case "colorarea": {
        const inputs = root?.querySelectorAll<HTMLInputElement>('input[type="range"]');
        expect(inputs).toHaveLength(2);
        expect(inputs?.[0]).toHaveValue("51");
        expect(inputs?.[1]).toHaveValue("102");
        expect(root?.querySelector('[role="group"]')?.getAttribute("aria-label")).toContain(
          "Updated color area",
        );
        break;
      }
      case "colorfield": {
        expect(root).toHaveTextContent("Updated color");
        expect(root?.querySelector<HTMLInputElement>('input[type="text"]')).toHaveValue("#112233");
        break;
      }
      case "colorslider": {
        const input = root?.querySelector<HTMLInputElement>('input[type="range"]');
        expect(root).toHaveTextContent("Updated hue");
        expect(input).toHaveValue("60");
        expect(input?.getAttribute("aria-valuetext")).toMatch(/yellow/i);
        break;
      }
      case "colorswatch": {
        const swatch = root?.querySelector<HTMLElement>('[role="img"]');
        expect(swatch?.getAttribute("aria-label")).toBe("Ocean, Ocean swatch");
        expect(swatch?.style.background).toContain("rgb(51, 102, 153)");
        break;
      }
      case "datefield":
      case "timefield": {
        expect(root).toHaveTextContent(
          component === "datefield" ? "Updated appointment" : "Updated start time",
        );
        expect(root?.querySelector("[data-required]")).not.toBeNull();
        const expectedSegments = component === "datefield" ? ["2", "4", "2025"] : ["10", "45"];
        const segments = [...(root?.querySelectorAll<HTMLElement>('[role="spinbutton"]') ?? [])];
        for (const expected of expectedSegments) {
          expect(
            segments.some((segment) => segment.getAttribute("aria-valuenow") === expected),
          ).toBe(true);
        }
        break;
      }
      case "datepicker":
      case "daterangepicker": {
        const expectedLabel =
          component === "datepicker" ? "Updated due date" : "Updated trip dates";
        const label = [...(root?.querySelectorAll<HTMLElement>("[id]") ?? [])].find(
          (candidate) =>
            candidate.textContent?.trim() === expectedLabel &&
            root?.querySelector(`[aria-labelledby~="${candidate.id}"]`),
        );
        expect(label).not.toBeUndefined();
        expect(label?.querySelector('[aria-hidden="true"]')).not.toBeNull();
        const days = [...(root?.querySelectorAll<HTMLElement>('[role="spinbutton"]') ?? [])]
          .filter((segment) => segment.dataset.type === "day")
          .map((segment) => segment.getAttribute("aria-valuenow"));
        expect(days).toEqual(component === "datepicker" ? ["3"] : ["3", "8"]);
        break;
      }
    }
    const retainedProps = root?.dataset.comparisonControlProps;
    const retainedTheme = root?.dataset.comparisonColorScheme;

    dispose();
    dispose = undefined;
    expectExactListenerRemoval(registrations, fixtureCalls(remove.mock.calls));
    controls(component, defaults);
    window.dispatchEvent(
      new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "light" } }),
    );
    await settle();
    expect(root?.isConnected).toBe(false);
    expect(root?.dataset.comparisonControlProps).toBe(retainedProps);
    expect(root?.dataset.comparisonColorScheme).toBe(retainedTheme);

    add.mockClear();
    remove.mockClear();
    dispose = render(() => Fixture(), container);
    await settle();
    const replacement = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(replacement).not.toBeNull();
    expect(replacement).not.toBe(root);
    expect(replacement?.dataset.comparisonControlProps).toBe(initialProps);
    expect(fixtureCalls(add.mock.calls)).toHaveLength(2);
  },
);

it("stage A calendar retains focused grid navigation and selection semantics", async () => {
  window.history.replaceState({}, "", "/?value=2025-02-03");
  const user = userEvent.setup({ delay: null });
  dispose = render(() => Calendar(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="calendar"]');
  const selected = container.querySelector<HTMLElement>('[aria-label*="February 3, 2025"]');
  expect(root?.dataset.comparisonValue).toBe("2025-02-03");
  expect(root?.dataset.comparisonFocusedValue).toBe("2025-02-03");
  expect(selected).not.toBeNull();
  selected?.focus();
  await user.keyboard("{ArrowRight}");
  await nextAnimationFrame();
  await settle();
  const next = container.querySelector<HTMLElement>('[aria-label*="February 4, 2025"]');
  expect(next).not.toBeNull();
  expect(next).not.toBe(selected);
  expect(next).toHaveAttribute("data-focused", "true");
  expect(next).toHaveAttribute("tabindex", "0");
  expect(root?.dataset.comparisonFocusedValue).toBe("2025-02-04");
  expect(document.activeElement).toBe(next);
  await user.keyboard("{Enter}");
  await settle();
  expect(root?.dataset.comparisonValue).toBe("2025-02-04");
  expect(document.activeElement).toBe(next);
  expect(next).toHaveAttribute("data-selected", "true");
  expect(next?.getAttribute("aria-label")).toMatch(/selected/i);
  expect(next?.closest('[role="gridcell"]')).toHaveAttribute("aria-selected", "true");
  expect(container.querySelector('[data-comparison-control-root="calendar"]')).toBe(root);
});

it.each([
  ["colorarea", ColorArea],
  ["colorslider", ColorSlider],
] as const)(
  "stage A %s retains its focused slider and publishes live/final values",
  async (component, Fixture) => {
    const user = userEvent.setup({ delay: null });
    dispose = render(() => Fixture(), container);
    await settle();
    const root = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    const slider = container.querySelector<HTMLInputElement>('input[type="range"]');
    const initialValue = root?.dataset.comparisonValue;
    const initialFinalValue = root?.dataset.comparisonFinalValue;
    const initialInputValue = slider?.value;
    const initialValueText = slider?.getAttribute("aria-valuetext");
    expect(slider).not.toBeNull();
    slider?.focus();
    await user.keyboard("{ArrowRight}");
    await settle();
    expect(container.querySelector(`[data-comparison-control-root="${component}"]`)).toBe(root);
    expect(container.querySelector('input[type="range"]')).toBe(slider);
    expect(document.activeElement).toBe(slider);
    expect(root?.dataset.comparisonValue).not.toBe(initialValue);
    expect(root?.dataset.comparisonFinalValue).not.toBe(initialFinalValue);
    expect(slider?.value).not.toBe(initialInputValue);
    expect(slider?.getAttribute("aria-valuetext")).not.toBe(initialValueText);
  },
);

const stageACollectionFixtures = [
  {
    component: "cardview",
    Fixture: CardView,
    defaults: cardViewDemoDefaults,
    update: { ...cardViewDemoDefaults, density: "spacious" },
    expectedKey: "density",
    expectedValue: "spacious",
    itemRole: "row",
    itemText: "Apollo",
  },
  {
    component: "dnd-listbox",
    Fixture: DndListBox,
    defaults: dndListBoxDemoDefaults,
    update: { ...dndListBoxDemoDefaults, selectionMode: "single" },
    expectedKey: "selectionMode",
    expectedValue: "single",
    itemRole: "option",
    itemText: "Read",
  },
  {
    component: "gridlist",
    Fixture: GridList,
    defaults: gridListDemoDefaults,
    update: { ...gridListDemoDefaults, selectionMode: "multiple" },
    expectedKey: "selectionMode",
    expectedValue: "multiple",
    itemRole: "row",
    itemText: "Read",
  },
  {
    component: "listbox",
    Fixture: ListBox,
    defaults: listBoxDemoDefaults,
    update: { ...listBoxDemoDefaults, selectionMode: "multiple" },
    expectedKey: "selectionMode",
    expectedValue: "multiple",
    itemRole: "option",
    itemText: "Read",
  },
  {
    component: "listview",
    Fixture: ListView,
    defaults: listViewDemoDefaults,
    update: { ...listViewDemoDefaults, isQuiet: true },
    expectedKey: "isQuiet",
    expectedValue: true,
    itemRole: "row",
    itemText: "Project brief.pdf",
  },
  {
    component: "selectboxgroup",
    Fixture: SelectBoxGroup,
    defaults: selectBoxGroupDemoDefaults,
    update: { ...selectBoxGroupDemoDefaults, orientation: "vertical" },
    expectedKey: "orientation",
    expectedValue: "vertical",
    itemRole: "option",
    itemText: "Starter",
  },
  {
    component: "tableview",
    Fixture: TableView,
    defaults: tableViewDemoDefaults,
    update: { ...tableViewDemoDefaults, isQuiet: true },
    expectedKey: "isQuiet",
    expectedValue: true,
    itemRole: "row",
    itemText: "Project brief.pdf",
  },
  {
    component: "taggroup",
    Fixture: TagGroup,
    defaults: tagGroupDemoDefaults,
    update: { ...tagGroupDemoDefaults, isEmphasized: true },
    expectedKey: "isEmphasized",
    expectedValue: true,
    itemRole: "row",
    itemText: "Landscape",
  },
  {
    component: "treeview",
    Fixture: TreeView,
    defaults: treeViewDemoDefaults,
    update: { ...treeViewDemoDefaults, disabledItem: "project" },
    expectedKey: "disabledItem",
    expectedValue: "project",
    itemRole: "row",
    itemText: "Weekly Report",
  },
  {
    component: "virtualizer",
    Fixture: Virtualizer,
    defaults: virtualizerDemoDefaults,
    update: { ...virtualizerDemoDefaults, selectionMode: "multiple" },
    expectedKey: "selectionMode",
    expectedValue: "multiple",
    itemRole: "option",
    itemText: "Item 0",
  },
] as const;

function stageACollectionItem(role: string, textValue: string) {
  return Array.from(container.querySelectorAll<HTMLElement>(`[role="${role}"]`)).find((element) =>
    element.textContent?.includes(textValue),
  );
}

it.each(stageACollectionFixtures)(
  "stage A collections $component removes exact listeners, retains keyed identity, stays inert, and remounts cleanly",
  async ({
    component,
    Fixture,
    defaults,
    update,
    expectedKey,
    expectedValue,
    itemRole,
    itemText,
  }) => {
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
    const item = stageACollectionItem(itemRole, itemText);
    const registrations = fixtureCalls(add.mock.calls);
    expect(root).not.toBeNull();
    expect(item).not.toBeUndefined();
    expect(registrations).toHaveLength(2);

    controls(component, update);
    theme("dark");
    await settle();
    expect(
      container.querySelector<HTMLElement>(`[data-comparison-control-root="${component}"]`),
    ).toBe(root);
    expect(stageACollectionItem(itemRole, itemText)).toBe(item);
    expect(item?.textContent).toContain(itemText);
    if (["dnd-listbox", "listbox", "virtualizer"].includes(component)) {
      expect(root?.getAttribute("aria-multiselectable")).toBe(
        update.selectionMode === "multiple" ? "true" : null,
      );
    } else {
      expect(JSON.parse(root?.dataset.comparisonControlProps ?? "{}")[expectedKey]).toBe(
        expectedValue,
      );
    }
    if (component === "treeview") {
      expect(root?.querySelector('[role="row"][data-key="project"]')).toHaveAttribute(
        "aria-disabled",
        "true",
      );
    }
    const themeShell = container.querySelector<HTMLElement>('[data-color-scheme="dark"]');
    expect(themeShell).not.toBeNull();
    const retainedProps = root?.dataset.comparisonControlProps;

    dispose();
    dispose = undefined;
    expectExactListenerRemoval(registrations, fixtureCalls(remove.mock.calls));
    controls(component, defaults);
    theme("light");
    await settle();
    expect(root?.isConnected).toBe(false);
    expect(item?.isConnected).toBe(false);
    expect(root?.dataset.comparisonControlProps).toBe(retainedProps);
    expect(themeShell?.getAttribute("data-color-scheme")).toBe("dark");

    add.mockClear();
    remove.mockClear();
    dispose = render(() => Fixture(), container);
    await settle();
    const replacement = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(replacement).not.toBeNull();
    expect(replacement).not.toBe(root);
    expect(stageACollectionItem(itemRole, itemText)).not.toBe(item);
    expect(fixtureCalls(add.mock.calls)).toHaveLength(2);
  },
);

it.each([
  ["cardview", CardView, "row", "Apollo", "Zephyr", "End", true],
  ["gridlist", GridList, "row", "Read", "Write", "ArrowDown", false],
  ["listbox", ListBox, "option", "Read", "Write", "ArrowDown", false],
  ["selectboxgroup", SelectBoxGroup, "option", "Starter", "Pro", "ArrowRight", false],
] as const)(
  "stage A collections %s moves rendered focus and selection between semantic items",
  async (_component, Fixture, role, firstText, secondText, nextKey, selectionFollowsFocus) => {
    const user = userEvent.setup({ delay: null });
    dispose = render(() => Fixture(), container);
    await settle();
    const first = stageACollectionItem(role, firstText);
    const second = stageACollectionItem(role, secondText);
    expect(first).not.toBeUndefined();
    expect(second).not.toBeUndefined();

    first?.focus();
    await user.keyboard(`{${nextKey}}`);
    await nextAnimationFrame();
    expect(document.activeElement).toBe(second);
    expect(second?.getAttribute("role")).toBe(role);
    expect(second?.textContent).toContain(secondText);

    if (!selectionFollowsFocus) {
      await user.click(second!);
      await settle();
    }
    expect(document.activeElement).toBe(second);
    expect(second?.getAttribute("aria-selected")).toBe("true");
    expect(second?.textContent).toContain(secondText);
  },
);

it("stage A collections ListView preserves row focus and publishes real selection and action", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => ListView(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="listview"]');
  const project = stageACollectionItem("row", "Project brief.pdf");
  const quarterly = stageACollectionItem("row", "Quarterly report.docx");
  const budget = stageACollectionItem("row", "Budget.xlsx");
  expect(root).not.toBeNull();
  expect(project).not.toBeUndefined();
  expect(quarterly).not.toBeUndefined();
  expect(budget).not.toBeUndefined();

  project?.focus();
  await user.keyboard("{ArrowDown}");
  await nextAnimationFrame();
  expect(document.activeElement).toBe(quarterly);
  expect(quarterly?.getAttribute("role")).toBe("row");
  expect(quarterly?.textContent).toContain("Quarterly report.docx");

  await user.click(budget!);
  await settle();
  expect(budget?.getAttribute("aria-selected")).toBe("true");
  expect(
    container.querySelector<HTMLElement>("[data-comparison-selected-keys]")?.dataset
      .comparisonSelectedKeys,
  ).toContain("budget");

  controls("listview", {
    ...listViewDemoDefaults,
    selectionMode: "none",
    selectionStyle: "highlight",
  });
  await settle();
  const actionRow = stageACollectionItem("row", "Budget.xlsx");
  await user.click(actionRow!);
  await settle();
  expect(root?.parentElement?.dataset.comparisonActionKey).toBe("budget");
  expect(actionRow?.textContent).toContain("Budget.xlsx");
});

it("stage A collections TableView exercises focused rows, selection, action, and sorting", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => TableView(), container);
  await settle();
  const marker = container.querySelector<HTMLElement>('[data-comparison-control-root="tableview"]');
  const project = stageACollectionItem("row", "Project brief.pdf");
  const quarterly = stageACollectionItem("row", "Quarterly report.docx");
  const budget = stageACollectionItem("row", "Budget.xlsx");
  expect(marker).not.toBeNull();
  expect(project).not.toBeUndefined();
  expect(quarterly).not.toBeUndefined();
  expect(budget).not.toBeUndefined();

  project?.focus();
  await user.keyboard("{ArrowDown}");
  await nextAnimationFrame();
  expect(document.activeElement).toBe(quarterly);
  expect(quarterly?.getAttribute("role")).toBe("row");
  expect(quarterly?.textContent).toContain("Quarterly report.docx");

  await user.click(budget!);
  await settle();
  expect(budget?.getAttribute("aria-selected")).toBe("true");
  expect(marker?.dataset.comparisonSelectedKeys).toContain("budget");

  controls("tableview", {
    ...tableViewDemoDefaults,
    selectionMode: "none",
    sortColumn: "name",
    sortDirection: "ascending",
  });
  await settle();
  const actionRow = stageACollectionItem("row", "Budget.xlsx");
  await user.click(actionRow!);
  await settle();
  expect(marker?.dataset.comparisonActionKey).toBe("budget");
  const nameHeader = Array.from(
    container.querySelectorAll<HTMLElement>('[role="columnheader"]'),
  ).find((element) => element.textContent?.includes("Name"));
  expect(nameHeader).not.toBeUndefined();
  await user.click(nameHeader!);
  await settle();
  expect(marker?.dataset.comparisonSortDescriptor).toBe("name:descending");
  expect(nameHeader?.getAttribute("aria-sort")).toBe("descending");
});

it("stage A collections TagGroup invokes its group action and removes only the requested tag", async () => {
  const user = userEvent.setup({ delay: null });
  window.history.replaceState({}, "", "/?withGroupAction=true");
  dispose = render(() => TagGroup(), container);
  await settle();
  const marker = container.querySelector<HTMLElement>('[data-comparison-control-root="taggroup"]');
  const landscape = stageACollectionItem("row", "Landscape");
  const portrait = stageACollectionItem("row", "Portrait");
  expect(marker).not.toBeNull();
  expect(landscape).not.toBeUndefined();
  expect(portrait).not.toBeUndefined();

  const groupAction = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
    (button) => button.textContent?.includes("Add tag"),
  );
  expect(groupAction).not.toBeUndefined();
  await user.click(groupAction!);
  await settle();
  expect(marker?.dataset.comparisonActionCount).toBe("1");
  expect(document.activeElement).toBe(groupAction);

  const remove = landscape?.querySelector<HTMLButtonElement>('button[aria-label="Remove"]');
  expect(remove).not.toBeNull();
  await user.click(remove!);
  await settle();
  expect(landscape?.isConnected).toBe(false);
  expect(stageACollectionItem("row", "Portrait")).toBe(portrait);
  expect(marker?.dataset.comparisonTagCount).toBe("3");
});

it("stage A collections TreeView expands and reconciles removed focus to a surviving keyed row", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => TreeView(), container);
  await settle();
  const tree = container.querySelector<HTMLElement>('[data-comparison-control-root="treeview"]');
  const documents = tree?.querySelector<HTMLElement>('[role="row"][data-key="documents"]');
  expect(tree).not.toBeNull();
  expect(documents?.getAttribute("aria-expanded")).toBe("true");

  documents?.focus();
  await user.keyboard("{ArrowLeft}");
  await settle();
  await nextAnimationFrame();
  const collapsedDocuments = tree?.querySelector<HTMLElement>('[role="row"][data-key="documents"]');
  expect(documents?.isConnected).toBe(false);
  expect(collapsedDocuments).not.toBe(documents);
  expect(collapsedDocuments?.getAttribute("data-key")).toBe("documents");
  expect(collapsedDocuments?.getAttribute("aria-expanded")).toBe("false");
  expect(document.activeElement).toBe(collapsedDocuments);

  await user.keyboard("{ArrowRight}");
  await settle();
  await nextAnimationFrame();
  const expandedDocuments = tree?.querySelector<HTMLElement>('[role="row"][data-key="documents"]');
  expect(collapsedDocuments?.isConnected).toBe(false);
  expect(expandedDocuments).not.toBe(collapsedDocuments);
  expect(expandedDocuments?.getAttribute("data-key")).toBe("documents");
  expect(expandedDocuments?.getAttribute("aria-expanded")).toBe("true");
  expect(document.activeElement).toBe(expandedDocuments);

  const archive = tree?.querySelector<HTMLElement>('[role="row"][data-key="archive"]');
  expect(tree?.querySelector<HTMLElement>('[role="row"][data-key="weekly-report"]')).not.toBeNull();
  expect(archive).not.toBeNull();
  archive?.focus();
  controls("treeview", {
    ...treeViewDemoDefaults,
    selectionSource: "selectedKeys",
    selectedKeys: "weekly-report",
    expandedSource: "expandedKeys",
    expandedKeys: "documents,project",
    itemCount: "2",
  });
  await settle();
  await nextAnimationFrame();
  expect(archive?.isConnected).toBe(false);
  const survivingWeekly = tree?.querySelector<HTMLElement>(
    '[role="row"][data-key="weekly-report"]',
  );
  expect(survivingWeekly).not.toBeNull();
  expect(survivingWeekly?.getAttribute("aria-selected")).toBe("true");
  expect(survivingWeekly?.getAttribute("role")).toBe("row");
  expect(survivingWeekly?.textContent).toContain("Weekly Report");
  const survivingPhotos = tree?.querySelector<HTMLElement>('[role="row"][data-key="photos"]');
  expect(survivingPhotos).not.toBeNull();
  expect(survivingPhotos?.getAttribute("role")).toBe("row");
  expect(survivingPhotos?.getAttribute("data-key")).toBe("photos");
  expect(survivingPhotos?.getAttribute("aria-selected")).toBe("false");
  expect(survivingPhotos?.textContent).toContain("Photos");
  expect(document.activeElement).toBe(survivingPhotos);
});

it("stage A collections DnD ListBox reorders by keyboard and publishes the live order", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => DndListBox(), container);
  await settle();
  const before = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
    (element) => element.textContent === "Before",
  );
  const listbox = container.querySelector<HTMLElement>(
    '[data-comparison-control-root="dnd-listbox"]',
  );
  const read = stageACollectionItem("option", "Read");
  expect(before).not.toBeUndefined();
  expect(listbox).not.toBeNull();
  expect(read).not.toBeUndefined();
  expect(JSON.parse(listbox?.dataset.comparisonOrder ?? "[]")).toEqual(["read", "write", "admin"]);

  before?.focus();
  await user.keyboard("{Tab}");
  expect(document.activeElement).toBe(read);
  expect(read?.getAttribute("role")).toBe("option");
  expect(read?.textContent).toContain("Read");
  await user.keyboard("{Enter}");
  await nextAnimationFrame();
  for (const key of ["ArrowDown", "ArrowDown", "Enter"]) {
    await user.keyboard(`{${key}}`);
    await settle();
  }
  expect(JSON.parse(listbox?.dataset.comparisonOrder ?? "[]")).not.toEqual([
    "read",
    "write",
    "admin",
  ]);
  expect(JSON.parse(listbox?.dataset.comparisonOrder ?? "[]")).toEqual(["write", "admin", "read"]);
  const focused = document.activeElement as HTMLElement;
  expect(focused.getAttribute("role")).toBe("option");
  expect(focused.textContent).toContain("Read");
});

it("stage A collections Virtualizer windows semantic options and retains focused keyed identity", async () => {
  vi.spyOn(window, "requestAnimationFrame").mockImplementation((callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  vi.spyOn(window, "cancelAnimationFrame").mockImplementation(() => {});
  const clientHeight = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientHeight");
  vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockImplementation(
    function (this: HTMLElement) {
      if (this.getAttribute("role") === "listbox") return 240;
      return clientHeight?.get?.call(this) ?? 0;
    },
  );

  dispose = render(() => Virtualizer(), container);
  await settle();
  const listbox = container.querySelector<HTMLElement>(
    '[data-comparison-control-root="virtualizer"]',
  );
  const item0 = stageACollectionItem("option", "Item 0");
  expect(listbox).not.toBeNull();
  expect(item0).not.toBeUndefined();
  expect(container.querySelectorAll('[role="option"]').length).toBeLessThan(60);
  expect(item0?.getAttribute("aria-posinset")).toBe("1");
  expect(item0?.getAttribute("aria-setsize")).toBe("60");
  item0?.focus();
  await settle();

  listbox!.scrollTop = 2160;
  listbox?.dispatchEvent(new Event("scroll", { bubbles: false }));
  await settle();
  const item54 = stageACollectionItem("option", "Item 54");
  expect(item54).not.toBeUndefined();
  expect(item54?.getAttribute("aria-posinset")).toBe("55");
  expect(item54?.getAttribute("aria-setsize")).toBe("60");
  expect(stageACollectionItem("option", "Item 20")).toBeUndefined();
  const persistedItem0 = stageACollectionItem("option", "Item 0");
  expect(persistedItem0).not.toBeUndefined();
  expect(persistedItem0).not.toBe(item0);
  expect(item0?.isConnected).toBe(false);
  expect(persistedItem0?.closest("[data-persisted-virtual-item]")).not.toBeNull();
  expect(document.activeElement).toBe(persistedItem0);
  expect(persistedItem0?.getAttribute("role")).toBe("option");
  expect(persistedItem0?.getAttribute("data-key")).toBe("item-0");
  expect(persistedItem0?.textContent).toContain("Item 0");
});

const stageBAsyncFixtures = [
  {
    component: "autocomplete",
    Fixture: Autocomplete,
    defaults: autocompleteDemoDefaults,
    update: { ...autocompleteDemoDefaults, selectionMode: "single" },
    expectedKey: "selectionMode",
    expectedValue: "single",
  },
  {
    component: "combobox",
    Fixture: ComboBox,
    defaults: comboBoxDemoDefaults,
    update: { ...comboBoxDemoDefaults, label: "Updated plan" },
    expectedKey: "label",
    expectedValue: "Updated plan",
  },
  {
    component: "image",
    Fixture: Image,
    defaults: imageDemoDefaults,
    update: { ...imageDemoDefaults, objectFit: "contain" },
    expectedKey: "objectFit",
    expectedValue: "contain",
  },
  {
    component: "picker",
    Fixture: Picker,
    defaults: pickerDemoDefaults,
    update: { ...pickerDemoDefaults, isQuiet: true },
    expectedKey: "isQuiet",
    expectedValue: true,
  },
  {
    component: "toast",
    Fixture: Toast,
    defaults: toastDemoDefaults,
    update: { ...toastDemoDefaults, activeSide: "solid" },
    expectedKey: "activeSide",
    expectedValue: "solid",
  },
] as const;

it.each(stageBAsyncFixtures)(
  "stage B async tail $component removes exact listeners, stays inert, and remounts cleanly",
  async ({ component, Fixture, defaults, update, expectedKey, expectedValue }) => {
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
    const registrations = fixtureCalls(add.mock.calls);
    expect(root).not.toBeNull();
    expect(registrations).toHaveLength(2);

    controls(component, update);
    theme("dark");
    await settle();
    expect(
      container.querySelector<HTMLElement>(`[data-comparison-control-root="${component}"]`),
    ).toBe(root);
    expect(JSON.parse(root?.dataset.comparisonControlProps ?? "{}")[expectedKey]).toBe(
      expectedValue,
    );
    expect(container.querySelector('[data-color-scheme="dark"]')).not.toBeNull();
    const retainedProps = root?.dataset.comparisonControlProps;

    dispose();
    dispose = undefined;
    expectExactListenerRemoval(registrations, fixtureCalls(remove.mock.calls));
    controls(component, defaults);
    theme("light");
    await settle();
    expect(root?.isConnected).toBe(false);
    expect(root?.dataset.comparisonControlProps).toBe(retainedProps);

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

it("stage B async tail Autocomplete filters, virtually focuses, selects, and retains live keyed nodes", async () => {
  const user = userEvent.setup({ delay: null });
  window.history.replaceState({}, "", "/?selectionMode=single");
  dispose = render(() => Autocomplete(), container);
  await settle();
  const root = container.querySelector<HTMLElement>(
    '[data-comparison-control-root="autocomplete"]',
  );
  const input = container.querySelector<HTMLInputElement>('input[type="search"]');
  const apple = container.querySelector<HTMLElement>('[role="option"][data-key="apple"]');
  expect(root).not.toBeNull();
  expect(input).not.toBeNull();
  expect(input).toHaveAccessibleName("Search fruits");
  expect(input).toHaveAttribute("aria-controls");
  expect(apple?.textContent).toContain("Apple");

  input?.focus();
  await user.type(input!, "a");
  await settle();
  expect(
    Array.from(container.querySelectorAll<HTMLElement>('[role="option"]')).map((option) =>
      option.textContent?.trim(),
    ),
  ).toEqual(["Apple", "Banana", "Grape", "Mango", "Orange", "Peach"]);
  await user.keyboard("{ArrowDown}");
  await nextAnimationFrame();
  const activeDescendant = input?.getAttribute("aria-activedescendant");
  const focusedOption = activeDescendant
    ? (document.getElementById(activeDescendant) as HTMLElement | null)
    : null;
  expect(document.activeElement).toBe(input);
  expect(focusedOption?.getAttribute("role")).toBe("option");
  expect(focusedOption?.getAttribute("data-key")).toBe("banana");
  expect(focusedOption?.textContent).toContain("Banana");
  expect(focusedOption).toHaveAttribute("data-focused");

  await user.keyboard("{Enter}");
  await settle();
  const selectedBanana = container.querySelector<HTMLElement>('[role="option"][data-key="banana"]');
  expect(document.activeElement).toBe(input);
  expect(selectedBanana?.isConnected).toBe(true);
  expect(selectedBanana).toBe(focusedOption);
  expect(selectedBanana).toHaveAttribute("aria-selected", "true");

  controls("autocomplete", { ...autocompleteDemoDefaults, selectionMode: "multiple" });
  theme("dark");
  await settle();
  expect(container.querySelector('input[type="search"]')).toBe(input);
  expect(container.querySelector('[role="option"][data-key="apple"]')).toBe(apple);
  expect(container.querySelector('[role="option"][data-key="banana"]')).toBe(selectedBanana);
  expect(selectedBanana?.isConnected).toBe(true);
  expect(selectedBanana).toHaveAttribute("aria-selected", "true");
  expect(root?.getAttribute("aria-multiselectable")).toBeNull();
  expect(
    container.querySelector('[data-comparison-control-root="autocomplete"] [role="listbox"]'),
  ).toHaveAttribute("aria-multiselectable", "true");
  expect(document.activeElement).toBe(input);
});

it("stage B async tail ComboBox filters, navigates, selects, and returns input focus on Escape", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => ComboBox(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="combobox"]');
  const input = container.querySelector<HTMLInputElement>('[role="combobox"]');
  const trigger = container.querySelector<HTMLButtonElement>('button[aria-haspopup="listbox"]');
  expect(root).not.toBeNull();
  expect(input).not.toBeNull();
  expect(trigger).not.toBeNull();

  input?.focus();
  expect(document.activeElement).toBe(input);
  await user.click(trigger!);
  await settle();
  const listbox = document.querySelector<HTMLElement>('[role="listbox"]');
  const pro = document.querySelector<HTMLElement>('[role="option"][data-key="pro"]');
  const enterprise = document.querySelector<HTMLElement>('[role="option"][data-key="enterprise"]');
  expect(input).toHaveAttribute("aria-expanded", "true");
  expect(listbox).not.toBeNull();
  expect(pro?.textContent).toContain("Pro");
  expect(enterprise?.textContent).toContain("Enterprise");

  controls("combobox", {
    ...comboBoxDemoDefaults,
    label: "Updated plan",
    disableEnterprise: true,
  });
  theme("dark");
  await settle();
  expect(container.querySelector('[role="combobox"]')).toBe(input);
  expect(document.querySelector('[role="listbox"]')).toBe(listbox);
  expect(document.querySelector('[role="option"][data-key="pro"]')).toBe(pro);
  expect(document.querySelector('[role="option"][data-key="enterprise"]')).toBe(enterprise);
  expect(input).toHaveAccessibleName("Updated plan");
  expect(enterprise).toHaveAttribute("aria-disabled", "true");

  controls("combobox", {
    ...comboBoxDemoDefaults,
    label: "Updated plan",
    selectedKey: "none",
    inputValue: "",
    itemsPreset: "many",
  });
  await settle();
  const firstManyOption = document.querySelector<HTMLElement>(
    '[role="option"][data-key="item-01"]',
  );
  expect(pro?.isConnected).toBe(false);
  expect(enterprise?.isConnected).toBe(false);
  expect(firstManyOption?.getAttribute("role")).toBe("option");
  expect(firstManyOption?.textContent).toContain("Item 01");

  controls("combobox", {
    ...comboBoxDemoDefaults,
    label: "Updated plan",
    selectedKey: "none",
    inputValue: "",
    disableEnterprise: true,
  });
  await settle();
  expect(firstManyOption?.isConnected).toBe(false);

  const starterInItems = document.querySelector<HTMLElement>('[role="option"][data-key="starter"]');
  const proInItems = document.querySelector<HTMLElement>('[role="option"][data-key="pro"]');
  const enterpriseInItems = document.querySelector<HTMLElement>(
    '[role="option"][data-key="enterprise"]',
  );
  await user.clear(input!);
  await user.type(input!, "Sta");
  await settle();
  expect(document.querySelector('[role="option"][data-key="starter"]')).toBe(starterInItems);
  expect(document.querySelector('[role="option"][data-key="pro"]')).toBe(proInItems);
  expect(document.querySelector('[role="option"][data-key="enterprise"]')).toBe(enterpriseInItems);
  expect(starterInItems?.isConnected).toBe(true);
  expect(proInItems?.isConnected).toBe(true);
  expect(enterpriseInItems?.isConnected).toBe(true);

  controls("combobox", {
    ...comboBoxDemoDefaults,
    label: "Updated plan",
    selectedKey: "none",
    inputValue: "",
    disableEnterprise: true,
    itemsSource: "defaultItems",
    itemsPreset: "three",
  });
  await settle();
  const defaultItemsInput = container.querySelector<HTMLInputElement>('[role="combobox"]');
  await user.type(defaultItemsInput!, "Sta");
  await settle();
  const starter = document.querySelector<HTMLElement>('[role="option"][data-key="starter"]');
  expect(starter?.getAttribute("role")).toBe("option");
  expect(starter?.textContent).toContain("Starter");
  expect(document.querySelector('[role="option"][data-key="pro"]')).toBeNull();
  await user.keyboard("{ArrowDown}");
  await nextAnimationFrame();
  expect(document.activeElement).toBe(defaultItemsInput);
  expect(starter).toHaveAttribute("data-focused");
  expect(defaultItemsInput?.getAttribute("aria-activedescendant")).toBe(starter?.id);
  await user.keyboard("{Enter}");
  await settle();
  expect(defaultItemsInput).toHaveValue("Starter");
  expect(root?.dataset.comparisonValue).toBe("starter");
  expect(defaultItemsInput).toHaveAttribute("aria-expanded", "false");
  expect(document.activeElement).toBe(defaultItemsInput);

  await user.click(trigger!);
  await settle();
  expect(defaultItemsInput).toHaveAttribute("aria-expanded", "true");
  await user.keyboard("{Escape}");
  await settle();
  expect(defaultItemsInput).toHaveAttribute("aria-expanded", "false");
  expect(document.activeElement).toBe(defaultItemsInput);
});

it("stage B async tail Picker navigates, selects, and returns trigger focus on Escape", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => Picker(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="picker"]');
  const trigger = container.querySelector<HTMLButtonElement>('button[aria-haspopup="listbox"]');
  expect(root).not.toBeNull();
  expect(trigger).not.toBeNull();
  trigger?.focus();
  expect(document.activeElement).toBe(trigger);
  await user.keyboard("{ArrowDown}");
  await nextAnimationFrame();
  await settle();
  const listbox = document.querySelector<HTMLElement>('[role="listbox"]');
  const pro = document.querySelector<HTMLElement>('[role="option"][data-key="pro"]');
  expect(listbox).not.toBeNull();
  expect(pro?.textContent).toContain("Pro");
  expect(pro).toHaveAttribute("aria-selected", "true");
  expect(pro).toHaveAttribute("data-focused");
  expect(document.activeElement).toBe(pro);

  controls("picker", { ...pickerDemoDefaults, label: "Updated plan" });
  theme("dark");
  await settle();
  expect(container.querySelector('button[aria-haspopup="listbox"]')).toBe(trigger);
  expect(document.querySelector('[role="listbox"]')).toBe(listbox);
  expect(document.querySelector('[role="option"][data-key="pro"]')).toBe(pro);
  const labelledByIds = trigger?.getAttribute("aria-labelledby")?.split(" ") ?? [];
  const visibleLabel =
    labelledByIds
      .map((id) => document.getElementById(id))
      .find((element) => element?.textContent?.trim() === "Updated plan") ?? null;
  expect(visibleLabel).not.toBeNull();
  expect(labelledByIds).toContain(visibleLabel?.id);
  expect(trigger).toHaveAccessibleName("Pro Updated plan");
  expect(document.activeElement).toBe(pro);

  await user.keyboard("{ArrowDown}");
  await settle();
  const enterprise = document.querySelector<HTMLElement>('[role="option"][data-key="enterprise"]');
  expect(enterprise?.getAttribute("role")).toBe("option");
  expect(enterprise?.textContent).toContain("Enterprise");
  expect(enterprise).toHaveAttribute("data-focused");
  expect(document.activeElement).toBe(enterprise);
  await user.keyboard("{Enter}");
  await settle();
  expect(root?.dataset.comparisonValue).toBe("enterprise");
  expect(trigger?.textContent).toContain("Enterprise");
  expect(document.querySelector('[role="listbox"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);

  await user.keyboard("{ArrowDown}");
  await nextAnimationFrame();
  await settle();
  expect(document.querySelector('[role="listbox"]')).not.toBeNull();
  expect(document.activeElement).toBe(
    document.querySelector('[role="option"][data-key="enterprise"]'),
  );
  await user.keyboard("{Escape}");
  await settle();
  expect(document.querySelector('[role="listbox"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
});

it("stage B async tail Image exercises source modes and isolates stale load and error work", async () => {
  const add = vi.spyOn(window, "addEventListener");
  const remove = vi.spyOn(window, "removeEventListener");
  dispose = render(() => Image(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="image"]');
  const basic = container.querySelector<HTMLImageElement>('img[alt="Gradient landscape"]');
  expect(root).not.toBeNull();
  expect(basic?.src).toContain("Basic");
  expect(basic?.parentElement?.style.objectFit).toBe("cover");

  controls("image", { alt: "Conditional image", sourceMode: "conditional", objectFit: "contain" });
  await settle();
  const conditional = container.querySelector<HTMLImageElement>('img[alt="Conditional image"]');
  expect(basic?.isConnected).toBe(false);
  expect(conditional?.closest("picture")).not.toBeNull();
  expect(container.querySelector("source")?.getAttribute("srcset")).toContain("Light");
  expect(conditional?.closest("picture")?.parentElement?.style.objectFit).toBe("contain");
  theme("dark");
  await settle();
  expect(container.querySelector("source")?.getAttribute("srcset")).toContain("Dark");

  controls("image", { alt: "Coordinated", sourceMode: "coordinator", objectFit: "cover" });
  await settle();
  const coordinated = Array.from(container.querySelectorAll<HTMLImageElement>("img"));
  expect(coordinated.map((image) => image.alt)).toEqual(["Coordinated one", "Coordinated two"]);
  const firstWrapper = coordinated[0]?.parentElement;
  const initialClass = firstWrapper?.className;
  coordinated[0]?.dispatchEvent(new Event("load"));
  await settle();
  expect(firstWrapper?.className).toBe(initialClass);
  coordinated[1]?.dispatchEvent(new Event("load"));
  await settle();
  expect(firstWrapper?.className).not.toBe(initialClass);

  controls("image", { alt: "Missing image", sourceMode: "error", objectFit: "cover" });
  await settle();
  const missing = container.querySelector<HTMLImageElement>('img[alt="Missing image"]');
  expect(coordinated.every((image) => !image.isConnected)).toBe(true);
  expect(missing?.getAttribute("src")).toBe(imageMissingSource);
  coordinated[0]?.dispatchEvent(new Event("error"));
  coordinated[1]?.dispatchEvent(new Event("load"));
  await settle();
  expect(container.querySelector('img[alt="Missing image"]')).toBe(missing);
  expect(container.querySelector(".comparison-image-error")).toBeNull();
  missing?.dispatchEvent(new Event("error"));
  await settle();
  expect(container.querySelector(".comparison-image-error")?.textContent).toBe(
    "Error loading image",
  );

  dispose();
  dispose = undefined;
  expect(container.querySelector('[data-comparison-control-root="image"]')).toBeNull();
  add.mockClear();
  remove.mockClear();
  dispose = render(() => Image(), container);
  await settle();
  const replacement = container.querySelector<HTMLImageElement>('img[alt="Gradient landscape"]');
  expect(replacement).not.toBeNull();
  expect(replacement).not.toBe(missing);
  missing?.dispatchEvent(new Event("load"));
  missing?.dispatchEvent(new Event("error"));
  await settle();
  expect(container.querySelector('img[alt="Gradient landscape"]')).toBe(replacement);
  expect(container.querySelector(".comparison-image-error")).toBeNull();
});

it("stage B async tail Toast owns action, close, replacement, timeout, and remount cleanup", async () => {
  globalToastQueue.clear();
  const add = vi.spyOn(window, "addEventListener");
  const remove = vi.spyOn(window, "removeEventListener");
  const subscribe = globalToastQueue.subscribe.bind(globalToastQueue);
  const unsubscribes: Array<ReturnType<typeof vi.fn>> = [];
  vi.spyOn(globalToastQueue, "subscribe").mockImplementation((callback) => {
    const unsubscribe = vi.fn(subscribe(callback));
    unsubscribes.push(unsubscribe);
    return unsubscribe;
  });
  const user = userEvent.setup({ delay: null });
  dispose = render(() => Toast(), container);
  await settle();
  controls("toast", {
    ...toastDemoDefaults,
    activeSide: "solid",
    children: "Actionable toast",
    showAction: true,
    shouldCloseOnAction: true,
  });
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="toast"]');
  const neutralTrigger = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
    (button) => button.textContent?.includes("Show Neutral Toast"),
  );
  expect(root).not.toBeNull();
  expect(neutralTrigger).not.toBeUndefined();
  await user.click(neutralTrigger!);
  await settle();
  expect(document.querySelector('[role="alertdialog"]')?.textContent).toContain("Actionable toast");
  const action = Array.from(
    document.querySelectorAll<HTMLButtonElement>('[role="alertdialog"] button'),
  ).find((button) => button.textContent?.includes("Undo"));
  expect(action).not.toBeUndefined();
  await user.click(action!);
  await settle();
  expect(root?.dataset.comparisonToastActionCount).toBe("1");
  expect(root?.dataset.comparisonToastCloseCount).toBe("1");
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();

  await user.click(neutralTrigger!);
  await settle();
  const dismiss = document.querySelector<HTMLButtonElement>(
    '[role="alertdialog"] button[aria-label]',
  );
  expect(dismiss).not.toBeNull();
  await user.click(dismiss!);
  await settle();
  expect(root?.dataset.comparisonToastCloseCount).toBe("2");

  await user.click(neutralTrigger!);
  await settle();
  controls("toast", {
    ...toastDemoDefaults,
    activeSide: "solid",
    children: "Replacement toast",
  });
  await settle();
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  expect(root?.dataset.comparisonToastActionCount).toBe("0");
  expect(root?.dataset.comparisonToastCloseCount).toBe("0");
  controls("toast", { ...toastDemoDefaults, activeSide: "react" });
  await settle();
  expect(container.textContent).not.toContain("Show Neutral Toast");

  vi.useFakeTimers();
  controls("toast", {
    ...toastDemoDefaults,
    activeSide: "solid",
    children: "Timed toast",
    autoDismiss: true,
    timeout: 5000,
  });
  await Promise.resolve();
  flush();
  const timedTrigger = Array.from(container.querySelectorAll<HTMLButtonElement>("button")).find(
    (button) => button.textContent?.includes("Show Neutral Toast"),
  );
  timedTrigger?.click();
  await Promise.resolve();
  flush();
  expect(document.querySelector('[role="alertdialog"]')?.textContent).toContain("Timed toast");
  await vi.advanceTimersByTimeAsync(5000);
  flush();
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  expect(root?.dataset.comparisonToastCloseCount).toBe("1");

  timedTrigger?.click();
  await Promise.resolve();
  flush();
  expect(document.querySelector('[role="alertdialog"]')).not.toBeNull();
  const firstSubscriptionCount = unsubscribes.length;
  dispose();
  dispose = undefined;
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  expect(
    unsubscribes
      .slice(0, firstSubscriptionCount)
      .every((unsubscribe) => unsubscribe.mock.calls.length === 1),
  ).toBe(true);

  add.mockClear();
  remove.mockClear();
  dispose = render(() => Toast(), container);
  await Promise.resolve();
  flush();
  controls("toast", { ...toastDemoDefaults, activeSide: "solid" });
  await Promise.resolve();
  flush();
  const replacementRoot = container.querySelector<HTMLElement>(
    '[data-comparison-control-root="toast"]',
  );
  expect(replacementRoot).not.toBe(root);
  expect(replacementRoot?.dataset.comparisonToastActionCount).toBe("0");
  expect(replacementRoot?.dataset.comparisonToastCloseCount).toBe("0");
  await vi.advanceTimersByTimeAsync(5000);
  flush();
  expect(document.querySelector('[role="alertdialog"]')).toBeNull();
  expect(replacementRoot?.dataset.comparisonToastCloseCount).toBe("0");
  vi.useRealTimers();
});

it("stage A colorfield retains its focused input through a real edit", async () => {
  dispose = render(() => ColorField(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="colorfield"]');
  const input = container.querySelector<HTMLInputElement>('input[type="text"]');
  expect(input).not.toBeNull();
  input?.focus();
  inputValue(input!, "#112233");
  input?.dispatchEvent(new Event("change", { bubbles: true }));
  await settle();
  expect(container.querySelector('[data-comparison-control-root="colorfield"]')).toBe(root);
  expect(container.querySelector('input[type="text"]')).toBe(input);
  expect(document.activeElement).toBe(input);
  expect(root?.dataset.comparisonValue).toBe("rgb(17, 34, 51)");
});

it.each([
  ["datefield", DateField, "2025-02-04"],
  ["timefield", TimeField, "10:30:00"],
] as const)(
  "stage A %s retains the focused segment through keyboard increment",
  async (component, Fixture, expectedValue) => {
    const user = userEvent.setup({ delay: null });
    dispose = render(() => Fixture(), container);
    await settle();
    const root = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    const segments = [...container.querySelectorAll<HTMLElement>('[role="spinbutton"]')];
    const segment =
      component === "datefield"
        ? segments.find((candidate) => candidate.dataset.type === "day")
        : segments.find((candidate) => candidate.dataset.type === "hour");
    expect(segment).not.toBeUndefined();
    const initialRenderedValue = segment?.getAttribute("aria-valuenow");
    const initialRenderedText = segment?.textContent;
    segment?.focus();
    await user.keyboard("{ArrowUp}");
    await settle();
    expect(container.querySelector(`[data-comparison-control-root="${component}"]`)).toBe(root);
    expect(document.activeElement).toBe(segment);
    expect(root?.dataset.comparisonValue).toBe(expectedValue);
    expect(segment?.getAttribute("aria-valuenow")).not.toBe(initialRenderedValue);
    expect(segment?.textContent).not.toBe(initialRenderedText);
  },
);

it.each([
  ["datepicker", DatePicker],
  ["daterangepicker", DateRangePicker],
] as const)(
  "stage A %s moves deferred focus, selects a stable value, and returns focus on Escape",
  async (component, Fixture) => {
    window.history.replaceState(
      {},
      "",
      component === "datepicker"
        ? "/?value=2025-02-03"
        : "/?startValue=2025-02-03&endValue=2025-02-08",
    );
    const user = userEvent.setup({ delay: null });
    dispose = render(() => Fixture(), container);
    await settle();
    const root = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    const trigger = container.querySelector<HTMLButtonElement>('button[aria-haspopup="dialog"]');
    expect(trigger).not.toBeNull();
    trigger?.focus();
    await user.click(trigger!);
    await settle();
    expect(root?.dataset.comparisonOpen).toBe("true");
    await nextAnimationFrame();
    const selected = document.querySelector<HTMLElement>(
      '[role="dialog"] [aria-label*="February 3, 2025"]',
    );
    expect(selected).not.toBeNull();
    selected?.focus();
    await user.keyboard("{ArrowRight}");
    await nextAnimationFrame();
    await settle();
    const next = document.querySelector<HTMLElement>(
      '[role="dialog"] [aria-label*="February 4, 2025"]',
    );
    expect(next).not.toBeNull();
    expect(document.activeElement).toBe(next);
    await user.keyboard("{Enter}");
    await settle();
    if (component === "daterangepicker") {
      await nextAnimationFrame();
      await settle();
      const rangeEnd = document.querySelector<HTMLElement>(
        '[role="dialog"] [aria-label*="February 5, 2025"]',
      );
      expect(document.activeElement).toBe(rangeEnd);
      await user.keyboard("{Enter}");
      await settle();
    }
    expect(root?.dataset.comparisonValue).toBe(
      component === "datepicker" ? "2025-02-04" : "2025-02-04/2025-02-05",
    );
    const renderedDays = [...(root?.querySelectorAll<HTMLElement>('[role="spinbutton"]') ?? [])]
      .filter((segment) => segment.dataset.type === "day")
      .map((segment) => segment.getAttribute("aria-valuenow"));
    expect(renderedDays).toEqual(component === "datepicker" ? ["4"] : ["4", "5"]);
    await user.click(trigger!);
    await settle();
    await nextAnimationFrame();
    expect(root?.dataset.comparisonOpen).toBe("true");
    await user.keyboard("{Escape}");
    await settle();
    expect(root?.dataset.comparisonOpen).toBe("false");
    expect(document.activeElement).toBe(trigger);
    expect(container.querySelector(`[data-comparison-control-root="${component}"]`)).toBe(root);
  },
);

const overlayFixtures = [
  {
    component: "actionmenu",
    Fixture: ActionMenu,
    defaults: actionMenuDemoDefaults,
    updated: { ...actionMenuDemoDefaults, size: "L" as const, isQuiet: true },
  },
  {
    component: "contextualhelp",
    Fixture: ContextualHelp,
    defaults: contextualHelpDemoDefaults,
    updated: {
      ...contextualHelpDemoDefaults,
      triggerLabel: "Updated help",
      heading: "Updated guidance",
      content: "Updated contextual details",
      isOpen: true,
    },
  },
  {
    component: "dialog",
    Fixture: Dialog,
    defaults: dialogDemoDefaults,
    updated: {
      ...dialogDemoDefaults,
      triggerLabel: "Updated dialog trigger",
      title: "Updated dialog title",
      body: "Updated dialog body",
      isOpen: true,
    },
  },
  {
    component: "menu",
    Fixture: Menu,
    defaults: menuDemoDefaults,
    updated: { ...menuDemoDefaults, triggerSize: "L" as const, isDisabled: true },
  },
  {
    component: "popover",
    Fixture: Popover,
    defaults: popoverDemoDefaults,
    updated: {
      ...popoverDemoDefaults,
      triggerLabel: "Updated feedback",
      ariaLabel: "Updated feedback dialog",
      bodyText: "Updated popover body",
      isOpen: true,
    },
  },
  {
    component: "tooltip",
    Fixture: Tooltip,
    defaults: tooltipDemoDefaults,
    updated: {
      ...tooltipDemoDefaults,
      actionLabel: "Updated inspect",
      children: "Updated tooltip content",
      isOpen: true,
    },
  },
];

it.each(overlayFixtures)(
  "stage B $component removes exact listeners, stays inert, and cleanly remounts",
  async ({ component, Fixture, defaults, updated }) => {
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
    const initialProps = root?.dataset.comparisonControlProps;

    controls(component, updated);
    window.dispatchEvent(
      new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
    );
    await settle();
    expect(container.querySelector(`[data-comparison-control-root="${component}"]`)).toBe(root);
    expect(JSON.parse(root?.dataset.comparisonControlProps ?? "{}")).toMatchObject(updated);
    const trigger = container.querySelector<HTMLButtonElement>("button");
    switch (component) {
      case "actionmenu":
        expect(trigger).toHaveAttribute("data-size", "L");
        expect(trigger).toHaveAttribute("data-quiet");
        break;
      case "contextualhelp":
        expect(trigger?.getAttribute("aria-label")).toContain("Updated help");
        expect(document.querySelector('[role="dialog"]')).toHaveTextContent("Updated guidance");
        expect(document.querySelector('[role="dialog"]')).toHaveTextContent(
          "Updated contextual details",
        );
        break;
      case "dialog":
        expect(trigger).toHaveTextContent("Updated dialog trigger");
        expect(document.querySelector('[role="dialog"]')).toHaveTextContent("Updated dialog title");
        expect(document.querySelector('[role="dialog"]')).toHaveTextContent("Updated dialog body");
        break;
      case "menu":
        expect(trigger).toBeDisabled();
        break;
      case "popover":
        expect(trigger).toHaveTextContent("Updated feedback");
        expect(document.querySelector('[role="dialog"]')).toHaveAttribute(
          "aria-label",
          "Updated feedback dialog",
        );
        expect(document.querySelector('[role="dialog"]')).toHaveTextContent("Updated popover body");
        break;
      case "tooltip":
        expect(trigger).toHaveAttribute("aria-label", "Updated inspect");
        expect(document.querySelector('[role="tooltip"]')).toHaveTextContent(
          "Updated tooltip content",
        );
        break;
    }
    const retainedProps = root?.dataset.comparisonControlProps;

    dispose();
    dispose = undefined;
    expectExactListenerRemoval(registrations, fixtureCalls(remove.mock.calls));
    controls(component, defaults);
    window.dispatchEvent(
      new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "light" } }),
    );
    await settle();
    expect(root?.isConnected).toBe(false);
    expect(root?.dataset.comparisonControlProps).toBe(retainedProps);

    add.mockClear();
    remove.mockClear();
    dispose = render(() => Fixture(), container);
    await settle();
    const replacement = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(replacement).not.toBeNull();
    expect(replacement).not.toBe(root);
    expect(replacement?.dataset.comparisonControlProps).toBe(initialProps);
    expect(fixtureCalls(add.mock.calls)).toHaveLength(2);
  },
);

it.each([
  ["actionmenu", ActionMenu, "More actions"],
  ["menu", Menu, "Layer actions"],
] as const)(
  "stage B %s provides keyboard navigation, callback evidence, Escape, and focus return",
  async (component, Fixture, triggerName) => {
    const user = userEvent.setup({ delay: null });
    dispose = render(() => Fixture(), container);
    await settle();
    const root = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    const trigger = container.querySelector<HTMLButtonElement>(
      `button[aria-label="${triggerName}"]`,
    );
    expect(trigger).not.toBeNull();
    trigger?.focus();
    await user.keyboard("{Enter}");
    await settle();
    await nextAnimationFrame();
    await settle();
    const menu = document.querySelector<HTMLElement>('[role="menu"]');
    const items = [...document.querySelectorAll<HTMLElement>('[role="menuitem"]')];
    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(menu).not.toBeNull();
    expect(items.length).toBeGreaterThan(1);
    expect(menu?.contains(document.activeElement)).toBe(true);
    const initiallyFocused = document.activeElement;
    await user.keyboard("{ArrowDown}");
    await settle();
    expect(menu?.contains(document.activeElement)).toBe(true);
    expect(document.activeElement).not.toBe(initiallyFocused);
    await user.keyboard("{Enter}");
    await settle();
    expect(root?.dataset.comparisonActionCount).toBe("1");
    expect(root?.dataset.comparisonLastAction).not.toBe("");
    expect(root?.dataset.comparisonLastOpenState).toBe("false");
    expect(document.activeElement).toBe(trigger);

    await user.keyboard("{Enter}");
    await settle();
    expect(document.querySelector('[role="menu"]')).not.toBeNull();
    await user.keyboard("{Escape}");
    await settle();
    expect(document.querySelector('[role="menu"]')).toBeNull();
    expect(document.activeElement).toBe(trigger);
    expect(container.querySelector(`[data-comparison-control-root="${component}"]`)).toBe(root);
  },
);

function addPinnedOpenControl(component: "contextualhelp" | "popover" | "tooltip") {
  const form = document.createElement("form");
  form.dataset.comparisonControls = component;
  const field = document.createElement(component === "tooltip" ? "select" : "input");
  field.setAttribute("name", "isOpen");
  if (field instanceof HTMLSelectElement) {
    field.append(new Option("true", "true"));
    field.value = "true";
  } else {
    field.type = "checkbox";
    field.checked = true;
  }
  form.append(field);
  document.body.append(form);
  return () => form.remove();
}

it("stage B contextual help permits Escape close, pins external open, and keeps live semantics", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => ContextualHelp(), container);
  await settle();
  const root = container.querySelector<HTMLElement>(
    '[data-comparison-control-root="contextualhelp"]',
  );
  const trigger = container.querySelector<HTMLButtonElement>(
    'button[aria-label^="Contextual help"]',
  );
  expect(trigger).not.toBeNull();
  await user.click(trigger!);
  await settle();
  await nextAnimationFrame();
  await settle();
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
  expect(dialog).toHaveTextContent("Permission required");
  expect(dialog?.contains(document.activeElement)).toBe(true);
  controls("contextualhelp", {
    ...contextualHelpDemoDefaults,
    triggerLabel: "Live help",
    heading: "Live guidance",
    content: "Live contextual content",
    isOpen: true,
  });
  await settle();
  expect(container.querySelector('[data-comparison-control-root="contextualhelp"]')).toBe(root);
  expect(container.querySelector("button")).toBe(trigger);
  expect(trigger?.getAttribute("aria-label")).toContain("Live help");
  expect(dialog).toHaveTextContent("Live guidance");
  expect(dialog).toHaveTextContent("Live contextual content");
  await user.keyboard("{Escape}");
  await settle();
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);

  const removeControl = addPinnedOpenControl("contextualhelp");
  controls("contextualhelp", { ...contextualHelpDemoDefaults, isOpen: true });
  await settle();
  await user.keyboard("{Escape}");
  await settle();
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  expect(JSON.parse(root?.dataset.comparisonControlProps ?? "{}").isOpen).toBe(true);
  removeControl();
});

it("stage B dialog preserves its trigger owner, live content, callback, and focus restoration", async () => {
  const user = userEvent.setup({ delay: null });
  const callbacks: CustomEvent[] = [];
  const onCallback = (event: Event) => callbacks.push(event as CustomEvent);
  document.addEventListener(comparisonCallbackEvent, onCallback);
  dispose = render(() => Dialog(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="dialog"]');
  const trigger = container.querySelector<HTMLButtonElement>("button");
  await user.click(trigger!);
  await settle();
  await nextAnimationFrame();
  await settle();
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
  expect(dialog).not.toBeNull();
  expect(dialog?.contains(document.activeElement)).toBe(true);
  const focusedDialogDescendant = document.activeElement;
  controls("dialog", {
    ...dialogDemoDefaults,
    triggerLabel: "Live dialog trigger",
    title: "Live dialog title",
    body: "Live dialog body",
    isOpen: true,
  });
  await settle();
  expect(container.querySelector('[data-comparison-control-root="dialog"]')).toBe(root);
  expect(container.querySelector("button")).toBe(trigger);
  expect(trigger).toHaveTextContent("Live dialog trigger");
  expect(document.querySelector('[role="dialog"]')).toBe(dialog);
  expect(document.activeElement).toBe(focusedDialogDescendant);
  expect(dialog).toHaveTextContent("Live dialog title");
  expect(dialog).toHaveTextContent("Live dialog body");
  controls("dialog", {
    ...dialogDemoDefaults,
    role: "alertdialog",
    title: "Structural alert title",
    body: "Structural alert body",
    isOpen: true,
  });
  await settle();
  const alertDialog = document.querySelector<HTMLElement>('[role="alertdialog"]');
  expect(container.querySelector('[data-comparison-control-root="dialog"]')).toBe(root);
  expect(container.querySelector("button")).toBe(trigger);
  expect(dialog?.isConnected).toBe(false);
  expect(alertDialog).toHaveTextContent("Structural alert title");
  expect(alertDialog).toHaveTextContent("Structural alert body");
  await user.keyboard("{Escape}");
  await settle();
  expect(root?.dataset.comparisonOpen).toBe("false");
  expect(document.querySelector('[role="dialog"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);
  expect(
    callbacks.some(
      (event) => event.detail.component === "dialog" && event.detail.value === "false",
    ),
  ).toBe(true);
  document.removeEventListener(comparisonCallbackEvent, onCallback);
});

it("stage B popover permits Escape close, pins external open, and retains live descendants", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => Popover(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="popover"]');
  const trigger = container.querySelector<HTMLButtonElement>("button");
  await user.click(trigger!);
  await settle();
  await nextAnimationFrame();
  await settle();
  const dialog = document.querySelector<HTMLElement>('[role="dialog"]');
  expect(dialog).toHaveAttribute("aria-label", "Feedback");
  expect(dialog?.contains(document.activeElement)).toBe(true);
  expect(container.querySelector("button")).toBe(trigger);
  const focusedPopoverDescendant = document.activeElement;
  controls("popover", {
    ...popoverDemoDefaults,
    triggerLabel: "Live feedback",
    ariaLabel: "Live feedback dialog",
    bodyText: "Live popover content",
    isOpen: true,
  });
  await settle();
  expect(container.querySelector('[data-comparison-control-root="popover"]')).toBe(root);
  expect(container.querySelector("button")).toBe(trigger);
  expect(document.querySelector('[role="dialog"]')).toBe(dialog);
  expect(document.activeElement).toBe(focusedPopoverDescendant);
  expect(trigger).toHaveTextContent("Live feedback");
  expect(dialog).toHaveAttribute("aria-label", "Live feedback dialog");
  expect(dialog).toHaveTextContent("Live popover content");
  await user.keyboard("{Escape}");
  await settle();
  expect(root?.dataset.comparisonOpen).toBe("false");
  expect(document.activeElement).toBe(trigger);

  controls("popover", {
    ...popoverDemoDefaults,
    triggerMode: "customAnchor",
  });
  await settle();
  const customTrigger = container.querySelector<HTMLButtonElement>("button");
  expect(container.querySelector('[data-comparison-control-root="popover"]')).toBe(root);
  expect(trigger?.isConnected).toBe(false);
  expect(dialog?.isConnected).toBe(false);
  expect(customTrigger).toHaveTextContent("Open Feedback");
  expect(container).toHaveTextContent("Popover anchor");

  const removeControl = addPinnedOpenControl("popover");
  controls("popover", { ...popoverDemoDefaults, isOpen: true });
  await settle();
  await user.keyboard("{Escape}");
  await settle();
  expect(document.querySelector('[role="dialog"]')).not.toBeNull();
  expect(root?.dataset.comparisonOpen).toBe("true");
  removeControl();
});

it("stage B tooltip uses its focus delay, supports permitted and pinned close, and updates live", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => Tooltip(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="tooltip"]');
  controls("tooltip", {
    ...tooltipDemoDefaults,
    trigger: "hover",
    delay: 10,
    actionLabel: "Focus inspect",
  });
  await settle();
  const trigger = container.querySelector<HTMLButtonElement>('button[aria-label="Focus inspect"]');
  const hoverEvent = new Event("pointerenter", { cancelable: true, bubbles: true });
  Object.defineProperty(hoverEvent, "pointerType", { value: "mouse" });
  trigger?.dispatchEvent(hoverEvent);
  await new Promise<void>((done) => setTimeout(done, 50));
  await nextAnimationFrame();
  flush();
  const tooltip = document.querySelector<HTMLElement>('[role="tooltip"]');
  expect(tooltip).toHaveTextContent("Tooltip content");
  expect(trigger).toHaveAttribute("aria-describedby", tooltip?.id);
  trigger?.focus();
  expect(document.activeElement).toBe(trigger);
  controls("tooltip", {
    ...tooltipDemoDefaults,
    trigger: "hover",
    delay: 10,
    actionLabel: "Live inspect",
    children: "Live tooltip content",
    isOpen: true,
  });
  await settle();
  expect(container.querySelector('[data-comparison-control-root="tooltip"]')).toBe(root);
  expect(container.querySelector("button")).toBe(trigger);
  expect(trigger).toHaveAttribute("aria-label", "Live inspect");
  expect(tooltip).toHaveTextContent("Live tooltip content");
  await user.keyboard("{Escape}");
  await settle();
  expect(document.querySelector('[role="tooltip"]')).toBeNull();
  expect(document.activeElement).toBe(trigger);

  const removeControl = addPinnedOpenControl("tooltip");
  controls("tooltip", { ...tooltipDemoDefaults, trigger: "hover", delay: 10, isOpen: true });
  await settle();
  await user.keyboard("{Escape}");
  await settle();
  expect(document.querySelector('[role="tooltip"]')).not.toBeNull();
  expect(JSON.parse(root?.dataset.comparisonControlProps ?? "{}").isOpen).toBe(true);
  removeControl();
});

const navigationFixtures = [
  {
    component: "accordion",
    Fixture: Accordion,
    defaults: accordionDemoDefaults,
    updated: {
      ...accordionDemoDefaults,
      size: "L" as const,
      density: "compact" as const,
      isQuiet: true,
      allowsMultipleExpanded: true,
    },
  },
  {
    component: "breadcrumbs",
    Fixture: Breadcrumbs,
    defaults: breadcrumbsDemoDefaults,
    updated: { ...breadcrumbsDemoDefaults, size: "L" as const, isDisabled: true },
  },
  {
    component: "disclosure",
    Fixture: Disclosure,
    defaults: disclosureDemoDefaults,
    updated: {
      ...disclosureDemoDefaults,
      size: "L" as const,
      density: "compact" as const,
      isQuiet: true,
      isExpanded: false,
    },
  },
  {
    component: "steplist",
    Fixture: StepList,
    defaults: stepListDemoDefaults,
    updated: {
      ...stepListDemoDefaults,
      disabledKeys: "fallback-offer",
      isReadOnly: true,
    },
  },
];

it.each(navigationFixtures)(
  "stage C $component removes exact listeners, stays inert, and cleanly remounts",
  async ({ component, Fixture, defaults, updated }) => {
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
    const initialProps = root?.dataset.comparisonControlProps;

    controls(component, updated);
    window.dispatchEvent(
      new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "dark" } }),
    );
    await settle();
    expect(container.querySelector(`[data-comparison-control-root="${component}"]`)).toBe(root);
    expect(JSON.parse(root?.dataset.comparisonControlProps ?? "{}")).toMatchObject(updated);
    switch (component) {
      case "accordion": {
        const group = root?.querySelector<HTMLElement>('[data-rsp-component="DisclosureGroup"]');
        expect(group).toHaveAttribute("data-size", "L");
        expect(group).toHaveAttribute("data-density", "compact");
        expect(group).toHaveAttribute("data-quiet", "true");
        break;
      }
      case "breadcrumbs": {
        const list = root?.querySelector<HTMLOListElement>('ol[aria-label="Project location"]');
        expect(list).toHaveAttribute("data-disabled", "true");
        expect(list?.querySelector('[data-disabled="true"]')).not.toBeNull();
        break;
      }
      case "disclosure": {
        const disclosure = root?.querySelector<HTMLElement>('[data-rsp-component="Disclosure"]');
        expect(disclosure).toHaveAttribute("data-size", "L");
        expect(disclosure).toHaveAttribute("data-density", "compact");
        expect(disclosure).toHaveAttribute("data-quiet", "true");
        expect(root?.querySelector("button")).toHaveAttribute("aria-expanded", "false");
        break;
      }
      case "steplist": {
        expect(root).toHaveAttribute("aria-label", "Checkout steps");
        for (const link of root?.querySelectorAll('[role="link"]') ?? []) {
          expect(link).toHaveAttribute("aria-disabled", "true");
        }
        break;
      }
    }
    const themeShell = container.querySelector<HTMLElement>("[data-color-scheme]");
    expect(themeShell).toHaveAttribute("data-color-scheme", "dark");
    const retainedProps = root?.dataset.comparisonControlProps;

    dispose();
    dispose = undefined;
    expectExactListenerRemoval(registrations, fixtureCalls(remove.mock.calls));
    controls(component, defaults);
    window.dispatchEvent(
      new CustomEvent(comparisonThemeChangeEvent, { detail: { resolvedTheme: "light" } }),
    );
    await settle();
    expect(root?.isConnected).toBe(false);
    expect(root?.dataset.comparisonControlProps).toBe(retainedProps);
    expect(themeShell).toHaveAttribute("data-color-scheme", "dark");

    add.mockClear();
    remove.mockClear();
    dispose = render(() => Fixture(), container);
    await settle();
    const replacement = container.querySelector<HTMLElement>(
      `[data-comparison-control-root="${component}"]`,
    );
    expect(replacement).not.toBeNull();
    expect(replacement).not.toBe(root);
    expect(replacement?.dataset.comparisonControlProps).toBe(initialProps);
    expect(fixtureCalls(add.mock.calls)).toHaveLength(2);
  },
);

it("stage C accordion keeps focused headers live through expansion and visual controls", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => Accordion(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="accordion"]');
  const group = root?.querySelector<HTMLElement>('[data-rsp-component="DisclosureGroup"]');
  const personal = [
    ...(root?.querySelectorAll<HTMLButtonElement>("button[aria-expanded]") ?? []),
  ].find((button) => button.textContent?.includes("Personal Information"));
  const billing = [
    ...(root?.querySelectorAll<HTMLButtonElement>("button[aria-expanded]") ?? []),
  ].find((button) => button.textContent?.includes("Billing Address"));
  expect(personal).toHaveAttribute("aria-expanded", "true");
  expect(billing).toHaveAttribute("aria-expanded", "false");
  billing?.focus();
  await user.keyboard("{Enter}");
  await settle();
  expect(document.activeElement).toBe(billing);
  expect(personal).toHaveAttribute("aria-expanded", "false");
  expect(billing).toHaveAttribute("aria-expanded", "true");
  expect(root?.dataset.comparisonExpandedKeys).toBe("billing");
  expect(root?.dataset.comparisonExpandedChangeCount).toBe("1");
  expect(root?.dataset.comparisonExpandedChangeKeys).toBe("billing");

  controls("accordion", {
    ...accordionDemoDefaults,
    size: "L",
    density: "compact",
    isQuiet: true,
    allowsMultipleExpanded: true,
  });
  await settle();
  expect(container.querySelector('[data-comparison-control-root="accordion"]')).toBe(root);
  expect(root?.querySelector('[data-rsp-component="DisclosureGroup"]')).toBe(group);
  expect(root?.querySelectorAll("button[aria-expanded]")[1]).toBe(billing);
  expect(document.activeElement).toBe(billing);
  expect(group).toHaveAttribute("data-size", "L");
  expect(group).toHaveAttribute("data-density", "compact");
  expect(group).toHaveAttribute("data-quiet", "true");
  await user.keyboard("{Enter}");
  await settle();
  expect(billing).toHaveAttribute("aria-expanded", "false");
  expect(root?.dataset.comparisonExpandedKeys).toBe("");
  expect(root?.dataset.comparisonExpandedChangeCount).toBe("2");
  expect(document.activeElement).toBe(billing);
});

it("stage C breadcrumbs retains links within modes and replaces only the item-mode branch", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => Breadcrumbs(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="breadcrumbs"]');
  const standardList = root?.querySelector<HTMLOListElement>('ol[aria-label="Project location"]');
  const home = [...(standardList?.querySelectorAll<HTMLElement>('[role="link"]') ?? [])].find(
    (link) => link.textContent?.includes("Home"),
  );
  const current = [
    ...(standardList?.querySelectorAll<HTMLElement>('[aria-current="page"]') ?? []),
  ].find((item) => item.textContent?.includes("Breadcrumbs"));
  const initialClass = home?.className;
  expect(current).not.toBeUndefined();
  home?.focus();
  controls("breadcrumbs", { ...breadcrumbsDemoDefaults, size: "L" });
  await settle();
  expect(container.querySelector('[data-comparison-control-root="breadcrumbs"]')).toBe(root);
  expect(root?.querySelector('ol[aria-label="Project location"]')).toBe(standardList);
  expect(
    [...(standardList?.querySelectorAll<HTMLElement>('[role="link"]') ?? [])].find((link) =>
      link.textContent?.includes("Home"),
    ),
  ).toBe(home);
  expect(document.activeElement).toBe(home);
  expect(home?.className).not.toBe(initialClass);

  await user.keyboard("{Enter}");
  await settle();
  expect(root?.dataset.comparisonActionCount).toBe("1");
  expect(root?.dataset.comparisonLastAction).toBe("home");
  expect(root?.dataset.comparisonPath).toBe("home");
  expect(home?.isConnected).toBe(false);
  const narrowedList = root?.querySelector<HTMLOListElement>('ol[aria-label="Project location"]');
  expect(narrowedList?.querySelector('[aria-current="page"]')).toHaveTextContent("Home");

  controls("breadcrumbs", { ...breadcrumbsDemoDefaults, size: "L", itemSet: "overflow" });
  await settle();
  const overflowList = root?.querySelector<HTMLOListElement>('ol[aria-label="Project location"]');
  const overflowHome = [
    ...(overflowList?.querySelectorAll<HTMLElement>('[role="link"]') ?? []),
  ].find((link) => link.textContent?.includes("Home"));
  expect(container.querySelector('[data-comparison-control-root="breadcrumbs"]')).toBe(root);
  expect(narrowedList?.isConnected).toBe(false);
  expect(overflowList).not.toBe(narrowedList);
  expect(root?.dataset.comparisonPath).toBe("home,files,projects,reports,annual-report");
  expect(overflowList?.querySelector('[aria-current="page"]')).toHaveTextContent("Annual report");
  expect(overflowHome).not.toBeUndefined();
  const overflowClass = overflowHome?.className;
  overflowHome?.focus();
  controls("breadcrumbs", { ...breadcrumbsDemoDefaults, itemSet: "overflow" });
  await settle();
  expect(root?.querySelector('ol[aria-label="Project location"]')).toBe(overflowList);
  expect(
    [...(overflowList?.querySelectorAll<HTMLElement>('[role="link"]') ?? [])].find((link) =>
      link.textContent?.includes("Home"),
    ),
  ).toBe(overflowHome);
  expect(document.activeElement).toBe(overflowHome);
  expect(overflowHome?.className).not.toBe(overflowClass);
});

it("stage C disclosure preserves live focus and confines header-action structure", async () => {
  const user = userEvent.setup({ delay: null });
  dispose = render(() => Disclosure(), container);
  await settle();
  const root = container.querySelector<HTMLElement>('[data-comparison-control-root="disclosure"]');
  const disclosure = root?.querySelector<HTMLElement>('[data-rsp-component="Disclosure"]');
  const trigger = [
    ...(root?.querySelectorAll<HTMLButtonElement>("button[aria-expanded]") ?? []),
  ].find((button) => button.textContent?.includes("System Requirements"));
  const action = root?.querySelector<HTMLButtonElement>(
    'button[aria-label="Edit system requirements"]',
  );
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  trigger?.focus();
  await user.keyboard("{Enter}");
  await settle();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(root?.dataset.comparisonExpandedChangeCount).toBe("1");
  expect(root?.dataset.comparisonExpandedChangeValue).toBe("false");
  await user.keyboard("{Enter}");
  await settle();
  expect(trigger).toHaveAttribute("aria-expanded", "true");
  expect(root?.dataset.comparisonExpandedChangeCount).toBe("2");
  expect(document.activeElement).toBe(trigger);

  controls("disclosure", {
    ...disclosureDemoDefaults,
    size: "L",
    density: "compact",
    isQuiet: true,
  });
  await settle();
  expect(container.querySelector('[data-comparison-control-root="disclosure"]')).toBe(root);
  expect(root?.querySelector('[data-rsp-component="Disclosure"]')).toBe(disclosure);
  expect(root?.querySelector("button[aria-expanded]")).toBe(trigger);
  expect(root?.querySelector('button[aria-label="Edit system requirements"]')).toBe(action);
  expect(document.activeElement).toBe(trigger);
  expect(disclosure).toHaveAttribute("data-size", "L");
  expect(disclosure).toHaveAttribute("data-density", "compact");
  expect(disclosure).toHaveAttribute("data-quiet", "true");

  controls("disclosure", {
    ...disclosureDemoDefaults,
    size: "L",
    density: "compact",
    isQuiet: true,
    withHeaderAction: false,
  });
  await settle();
  const replacementTrigger = root?.querySelector<HTMLButtonElement>("button[aria-expanded]");
  expect(container.querySelector('[data-comparison-control-root="disclosure"]')).toBe(root);
  expect(root?.querySelector('[data-rsp-component="Disclosure"]')).toBe(disclosure);
  expect(action?.isConnected).toBe(false);
  expect(trigger?.isConnected).toBe(false);
  expect(replacementTrigger).not.toBe(trigger);
  expect(replacementTrigger).toHaveTextContent("System Requirements");
  expect(root?.querySelector('button[aria-label="Edit system requirements"]')).toBeNull();
});

it("stage C steplist uses initialization defaults and keeps live navigation descendants", async () => {
  window.history.replaceState(
    {},
    "",
    "/?defaultSelectedKey=details&defaultLastCompletedStep=details",
  );
  const user = userEvent.setup({ delay: null });
  dispose = render(() => StepList(), container);
  await settle();
  const root = container.querySelector<HTMLOListElement>(
    '[data-comparison-control-root="steplist"]',
  );
  const before = [...container.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent === "Before",
  );
  const after = [...container.querySelectorAll<HTMLButtonElement>("button")].find(
    (button) => button.textContent === "After",
  );
  const links = [...(root?.querySelectorAll<HTMLAnchorElement>('[role="link"]') ?? [])];
  expect(links).toHaveLength(4);
  expect(links[0]).toHaveAttribute("aria-current", "step");
  expect(links[0].closest("li")).toHaveAttribute("data-completed");
  before?.focus();
  await user.tab();
  expect(document.activeElement).toBe(links[0]);
  await user.tab();
  expect(document.activeElement).toBe(links[1]);
  await user.tab();
  expect(document.activeElement).toBe(after);

  links[1].focus();
  await user.keyboard("{Enter}");
  await settle();
  expect(links[0]).not.toHaveAttribute("aria-current");
  expect(links[1]).toHaveAttribute("aria-current", "step");
  expect(links[1].closest("li")).toHaveAttribute("data-selected");
  expect(document.activeElement).toBe(links[1]);

  controls("steplist", {
    defaultSelectedKey: "details",
    defaultLastCompletedStep: "details",
    disabledKeys: "fallback-offer",
    isDisabled: false,
    isReadOnly: false,
  });
  await settle();
  expect(container.querySelector('[data-comparison-control-root="steplist"]')).toBe(root);
  expect([...(root?.querySelectorAll('[role="link"]') ?? [])]).toEqual(links);
  expect(document.activeElement).toBe(links[1]);
  expect(links[1]).toHaveAttribute("aria-current", "step");
  expect(links[2]).toHaveAttribute("aria-disabled", "true");
  controls("steplist", {
    defaultSelectedKey: "details",
    defaultLastCompletedStep: "details",
    disabledKeys: "fallback-offer",
    isDisabled: false,
    isReadOnly: true,
  });
  await settle();
  expect(container.querySelector('[data-comparison-control-root="steplist"]')).toBe(root);
  expect([...(root?.querySelectorAll('[role="link"]') ?? [])]).toEqual(links);
  expect(document.activeElement).toBe(links[1]);
  expect(links[1]).toHaveAttribute("aria-current", "step");
  for (const link of links) {
    expect(link).toHaveAttribute("aria-disabled", "true");
  }
});

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
