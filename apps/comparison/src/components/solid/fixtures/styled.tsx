import h from "solid-js/h";
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  onMount,
  Show,
  type JSX,
} from "solid-js";
import { createComponent } from "solid-js/web";
import { hc, renderProp } from "../solid-h";
import {
  Accordion as SolidSpectrumAccordion,
  AccordionItem as SolidSpectrumAccordionItem,
  AccordionItemHeader as SolidSpectrumAccordionItemHeader,
  AccordionItemPanel as SolidSpectrumAccordionItemPanel,
  AccordionItemTitle as SolidSpectrumAccordionItemTitle,
  ActionBar as SolidSpectrumActionBar,
  ActionButton as SolidSpectrumActionButton,
  ActionButtonGroup as SolidSpectrumActionButtonGroup,
  ActionMenu as SolidSpectrumActionMenu,
  Avatar as SolidSpectrumAvatar,
  AvatarGroup as SolidSpectrumAvatarGroup,
  Badge as SolidSpectrumBadge,
  Breadcrumb as SolidSpectrumBreadcrumb,
  Breadcrumbs as SolidSpectrumBreadcrumbs,
  Button as SolidSpectrumButton,
  ButtonGroup as SolidSpectrumButtonGroup,
  Calendar as SolidSpectrumCalendar,
  Card as SolidSpectrumCard,
  CardView as SolidSpectrumCardView,
  Checkbox as SolidSpectrumCheckbox,
  CheckboxGroup as SolidSpectrumCheckboxGroup,
  ComboBox as SolidSpectrumComboBox,
  ComboBoxItem as SolidSpectrumComboBoxItem,
  DateRangePicker as SolidSpectrumDateRangePicker,
  DatePicker as SolidSpectrumDatePicker,
  Divider as SolidSpectrumDivider,
  Form as SolidSpectrumForm,
  Image as SolidSpectrumImage,
  ImageCoordinator as SolidSpectrumImageCoordinator,
  Keyboard as SolidSpectrumKeyboard,
  Link as SolidSpectrumLink,
  LinkButton as SolidSpectrumLinkButton,
  ListView as SolidSpectrumListView,
  ListViewItem as SolidSpectrumListViewItem,
  Menu as SolidSpectrumMenu,
  MenuItem as SolidSpectrumMenuItem,
  MenuTrigger as SolidSpectrumMenuTrigger,
  Meter as SolidSpectrumMeter,
  NumberField as SolidSpectrumNumberField,
  Picker as SolidSpectrumPicker,
  Provider as SolidSpectrumProvider,
  Radio as SolidSpectrumRadio,
  RadioGroup as SolidSpectrumRadioGroup,
  RangeCalendar as SolidSpectrumRangeCalendar,
  SearchField as SolidSpectrumSearchField,
  Skeleton as SolidSpectrumSkeleton,
  Slider as SolidSpectrumSlider,
  StatusLight as SolidSpectrumStatusLight,
  Switch as SolidSpectrumSwitch,
  SegmentedControl as SolidSpectrumSegmentedControl,
  SegmentedControlItem as SolidSpectrumSegmentedControlItem,
  SelectBox as SolidSpectrumSelectBox,
  SelectBoxGroup as SolidSpectrumSelectBoxGroup,
  TextArea as SolidSpectrumTextArea,
  TextField as SolidSpectrumTextField,
  Text as SolidSpectrumText,
  ToggleButton as SolidSpectrumToggleButton,
  ToggleButtonGroup as SolidSpectrumToggleButtonGroup,
  createIcon,
  createIllustration,
} from "@proyecto-viviana/solid-spectrum";
import { s2ButtonText } from "../../../../../../packages/solid-spectrum/src/button/s2-button-styles";
import {
  s2ActionButtonText,
  s2ToggleButtonText,
} from "../../../../../../packages/solid-spectrum/src/button/s2-action-button-styles";
import type { ComparisonSlug } from "@comparison/data/comparison-manifest";
import { comparisonActionItems as actionItems } from "@comparison/data/comparison-contract";
import {
  accordionDemoLocaleFromWindow,
  accordionDemoPropsFromWindow,
  normalizeAccordionDemoProps,
  serializeAccordionKeys,
  serializeAccordionDemoProps,
  type AccordionDemoProps,
} from "@comparison/data/accordion-demo";
import {
  actionBarCollectionItems,
  actionBarDemoPropsFromWindow,
  actionBarSelectedKeysFromCount,
  normalizeActionBarDemoProps,
  serializeActionBarDemoProps,
  serializeActionBarSelectedKeys,
  type ActionBarDemoProps,
} from "@comparison/data/actionbar-demo";
import {
  actionMenuDemoPropsFromWindow,
  actionMenuItems,
  normalizeActionMenuDemoProps,
  serializeActionMenuDemoProps,
  type ActionMenuDemoProps,
} from "@comparison/data/actionmenu-demo";
import {
  actionButtonDemoPropsFromWindow,
  serializeActionButtonDemoProps,
  type ActionButtonDemoProps,
} from "@comparison/data/actionbutton-demo";
import {
  avatarDemoPropsFromWindow,
  normalizeAvatarDemoProps,
  serializeAvatarDemoProps,
  type AvatarDemoProps,
} from "@comparison/data/avatar-demo";
import {
  avatarGroupDemoPropsFromWindow,
  avatarGroupItems,
  normalizeAvatarGroupDemoProps,
  serializeAvatarGroupDemoProps,
  type AvatarGroupDemoProps,
} from "@comparison/data/avatar-group-demo";
import {
  badgeDemoPropsFromWindow,
  normalizeBadgeDemoProps,
  serializeBadgeDemoProps,
  type BadgeDemoProps,
} from "@comparison/data/badge-demo";
import {
  breadcrumbsDemoPropsFromWindow,
  breadcrumbsItemsForSet,
  normalizeBreadcrumbsDemoProps,
  serializeBreadcrumbPath,
  serializeBreadcrumbsDemoProps,
  type BreadcrumbsDemoProps,
  type BreadcrumbsItem,
} from "@comparison/data/breadcrumbs-demo";
import {
  calendarCreateCalendarForDemo,
  calendarDateFromString,
  calendarDemoPropsFromWindow,
  calendarMaxValue,
  calendarMinValue,
  calendarVisibleMonthsFromString,
  comparisonControlsEvent as calendarControlsEvent,
  isCalendarDateUnavailable,
  normalizeCalendarDemoProps,
  serializeCalendarDemoProps,
  type CalendarDemoProps,
} from "@comparison/data/calendar-demo";
import {
  buttonDemoLocaleFromWindow,
  buttonDemoPropsFromWindow,
  comparisonControlsEvent,
  serializeButtonDemoProps,
  type ButtonDemoProps,
} from "@comparison/data/button-demo";
import {
  checkboxDemoPropsFromWindow,
  normalizeCheckboxDemoProps,
  serializeCheckboxDemoProps,
  type CheckboxDemoProps,
} from "@comparison/data/checkbox-demo";
import {
  checkboxGroupDemoPropsFromWindow,
  normalizeCheckboxGroupDemoProps,
  selectedValuesArrayFromText,
  serializeCheckboxGroupDemoProps,
  type CheckboxGroupDemoProps,
} from "@comparison/data/checkboxgroup-demo";
import {
  normalizeRadioGroupDemoProps,
  radioGroupDemoPropsFromWindow,
  serializeRadioGroupDemoProps,
  type RadioGroupDemoProps,
} from "@comparison/data/radiogroup-demo";
import {
  normalizeNumberFieldDemoProps,
  numberFieldDemoPropsFromWindow,
  serializeNumberFieldDemoProps,
  type NumberFieldDemoProps,
} from "@comparison/data/numberfield-demo";
import {
  normalizePickerDemoProps,
  pickerDemoPropsFromWindow,
  pickerItems,
  serializePickerDemoProps,
  type PickerDemoProps,
} from "@comparison/data/picker-demo";
import {
  comboBoxDemoPropsFromWindow,
  comboBoxItems,
  comboBoxLabelForKey,
  normalizeComboBoxDemoProps,
  serializeComboBoxDemoProps,
  type ComboBoxDemoProps,
} from "@comparison/data/combobox-demo";
import {
  datePickerMaxValue,
  datePickerMinValue,
  datePickerDemoPropsFromWindow,
  datePickerValueFromDemo,
  isDatePickerDateUnavailable,
  normalizeDatePickerDemoProps,
  serializeDatePickerDemoProps,
  serializeDatePickerValue,
  type DatePickerDemoProps,
} from "@comparison/data/datepicker-demo";
import {
  dateRangePickerMaxValue,
  dateRangePickerMinValue,
  dateRangePickerDemoPropsFromWindow,
  dateRangePickerValueFromDemo,
  isDateRangePickerDateUnavailable,
  normalizeDateRangePickerDemoProps,
  serializeDateRangePickerDemoProps,
  serializeDateRangePickerValue,
  type DateRangePickerDemoProps,
} from "@comparison/data/daterangepicker-demo";
import {
  comparisonControlsEvent as rangeCalendarControlsEvent,
  isRangeCalendarDateUnavailable,
  normalizeRangeCalendarDemoProps,
  rangeCalendarDateFromString,
  rangeCalendarDemoPropsFromWindow,
  rangeCalendarMaxValue,
  rangeCalendarMinValue,
  rangeCalendarValueFromDemo,
  rangeCalendarVisibleMonthsFromString,
  serializeRangeCalendarDemoProps,
  serializeRangeCalendarValue,
  type RangeCalendarDemoProps,
} from "@comparison/data/rangecalendar-demo";
import {
  dividerDemoPropsFromWindow,
  normalizeDividerDemoProps,
  serializeDividerDemoProps,
  type DividerDemoProps,
} from "@comparison/data/divider-demo";
import {
  imageDemoPropsFromWindow,
  imageMissingSource,
  imageDemoSources,
  normalizeImageDemoProps,
  serializeImageDemoProps,
  type ImageDemoProps,
} from "@comparison/data/image-demo";
import {
  formDemoPropsFromWindow,
  normalizeFormDemoProps,
  serializeFormDemoProps,
  type FormDemoProps,
} from "@comparison/data/form-demo";
import {
  linkDemoPropsFromWindow,
  normalizeLinkDemoProps,
  serializeLinkDemoProps,
  type LinkDemoProps,
} from "@comparison/data/link-demo";
import {
  defaultMenuSelectedKeys,
  menuDemoPropsFromWindow,
  menuItems,
  normalizeMenuDemoProps,
  serializeMenuDemoProps,
  serializeMenuSelectedKeys,
  type MenuDemoProps,
} from "@comparison/data/menu-demo";
import {
  meterDemoPropsFromWindow,
  normalizeMeterDemoProps,
  serializeMeterDemoProps,
  type MeterDemoProps,
} from "@comparison/data/meter-demo";
import {
  normalizeTextFieldDemoProps,
  serializeTextFieldDemoProps,
  textFieldDemoPropsFromWindow,
  type TextFieldDemoProps,
} from "@comparison/data/textfield-demo";
import {
  normalizeTextAreaDemoProps,
  serializeTextAreaDemoProps,
  textAreaDemoPropsFromWindow,
  type TextAreaDemoProps,
} from "@comparison/data/textarea-demo";
import {
  normalizeSearchFieldDemoProps,
  searchFieldDemoPropsFromWindow,
  serializeSearchFieldDemoProps,
  type SearchFieldDemoProps,
} from "@comparison/data/searchfield-demo";
import {
  normalizeSliderDemoProps,
  serializeSliderDemoProps,
  sliderDemoPropsFromWindow,
  type SliderDemoProps,
} from "@comparison/data/slider-demo";
import {
  normalizeSkeletonDemoProps,
  serializeSkeletonDemoProps,
  skeletonDemoPropsFromWindow,
  type SkeletonDemoProps,
} from "@comparison/data/skeleton-demo";
import {
  normalizeStatusLightDemoProps,
  serializeStatusLightDemoProps,
  statusLightDemoPropsFromWindow,
  type StatusLightDemoProps,
} from "@comparison/data/statuslight-demo";
import {
  normalizeSwitchDemoProps,
  serializeSwitchDemoProps,
  switchDemoPropsFromWindow,
  type SwitchDemoProps,
} from "@comparison/data/switch-demo";
import {
  actionButtonGroupDemoPropsFromWindow,
  buttonGroupDemoPropsFromWindow,
  linkButtonDemoPropsFromWindow,
  normalizeActionButtonGroupDemoProps,
  normalizeButtonGroupDemoProps,
  normalizeLinkButtonDemoProps,
  normalizeToggleButtonDemoProps,
  normalizeToggleButtonGroupDemoProps,
  selectedKeysSetFromText as selectedToggleKeysSetFromText,
  serializeActionButtonGroupDemoProps,
  serializeButtonGroupDemoProps,
  serializeLinkButtonDemoProps,
  serializeToggleButtonDemoProps,
  serializeToggleButtonGroupDemoProps,
  toggleButtonDemoPropsFromWindow,
  toggleButtonGroupDemoPropsFromWindow,
  type ActionButtonGroupDemoProps,
  type ButtonGroupDemoProps,
  type LinkButtonDemoProps,
  type ToggleButtonDemoProps,
  type ToggleButtonGroupDemoProps,
} from "@comparison/data/button-family-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
  type ComparisonResolvedTheme,
} from "@comparison/data/theme";

type ActionItem = (typeof actionItems)[number];
type SolidStyledFixture = () => ReturnType<typeof h>;

const SolidNewIcon = createIcon((props: JSX.SvgSVGAttributes<SVGSVGElement>) => {
  const { class: className, ...rest } = props;
  return h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      width: "20",
      height: "20",
      viewBox: "0 0 20 20",
      ...rest,
      class: className,
    },
    h("path", {
      d: "m18,4.25v11.5c0,1.24072-1.00928,2.25-2.25,2.25H4.25c-1.24072,0-2.25-1.00928-2.25-2.25V4.25c0-1.24072,1.00928-2.25,2.25-2.25h11.5c1.24072,0,2.25,1.00928,2.25,2.25Zm-1.5,0c0-.41357-.33643-.75-.75-.75H4.25c-.41357,0-.75.33643-.75.75v11.5c0,.41357.33643.75.75.75h11.5c.41357,0,.75-.33643.75-.75V4.25Z",
      fill: "var(--iconPrimary, #222)",
    }),
    h("path", {
      d: "m13.76318,10c0,.42139-.3418.76318-.76318.76318h-2.23682v2.23682c0,.42139-.3418.76318-.76318.76318s-.76318-.3418-.76318-.76318v-2.23682h-2.23682c-.42139,0-.76318-.3418-.76318-.76318s.3418-.76318.76318-.76318h2.23682v-2.23682c0-.42139.3418-.76318.76318-.76318s.76318.3418.76318.76318v2.23682h2.23682c.42139,0,.76318.3418.76318.76318Z",
      fill: "var(--iconPrimary, #222)",
    }),
  )() as JSX.Element;
});

const SolidPlanIllustration = createIllustration((props: JSX.SvgSVGAttributes<SVGSVGElement>) => {
  const { class: className, ...rest } = props;
  return h(
    "svg",
    {
      xmlns: "http://www.w3.org/2000/svg",
      viewBox: "0 0 48 48",
      ...rest,
      class: className,
    },
    [
      h("rect", {
        x: "6",
        y: "10",
        width: "36",
        height: "28",
        rx: "7",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.16",
      }),
      h("path", {
        d: "M15 31V19h18v12H15Zm3-3h12v-6H18v6Z",
        fill: "var(--iconPrimary, #222)",
      }),
      h("circle", {
        cx: "17",
        cy: "15",
        r: "3",
        fill: "var(--iconPrimary, #222)",
      }),
      h("circle", {
        cx: "31",
        cy: "35",
        r: "3",
        fill: "var(--iconPrimary, #222)",
      }),
    ],
  )() as JSX.Element;
});

const selectBoxItems = [
  { id: "starter", label: "Starter", description: "For small teams" },
  { id: "pro", label: "Pro", description: "For growing teams" },
];

const radioGroupItems = [
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
];

const checkboxGroupItems = [
  { value: "email", label: "Email" },
  { value: "sms", label: "SMS" },
  { value: "push", label: "Push" },
];

const selectBoxIllustrationItems = new Set(["starter", "pro"]);

const cardItems = [
  { id: "apollo", title: "Apollo", status: "Active" },
  { id: "zephyr", title: "Zephyr", status: "Queued" },
];

const actionBarItems = [
  { id: "edit", label: "Edit" },
  { id: "copy", label: "Copy" },
  { id: "delete", label: "Delete" },
];

type SingleButtonIconPlacement = "none" | "start" | "end" | "only";

function explicitStaticColor(staticColor: string | undefined | null) {
  return staticColor === "black" || staticColor === "white" ? staticColor : undefined;
}

function staticColorBackdropClass(staticColor: string | undefined | null, className = "") {
  return [className, explicitStaticColor(staticColor) ? "comparison-static-color-backdrop" : ""]
    .filter(Boolean)
    .join(" ");
}

function staticColorBackdropValue(staticColor: string | undefined | null) {
  return explicitStaticColor(staticColor);
}

function booleanParamFromWindow(name: string, fallback = false) {
  if (typeof window === "undefined") {
    return fallback;
  }

  const value = new URLSearchParams(window.location.search).get(name);
  if (value == null) {
    return fallback;
  }

  return value === "true" || value === "on" || value === "1";
}

function queryParamFromWindow(name: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get(name);
}

function stringParamFromWindow<T extends string>(
  name: string,
  allowed: readonly T[],
  fallback: T,
): T;
function stringParamFromWindow<T extends string>(
  name: string,
  allowed: readonly T[],
  fallback: T | undefined,
): T | undefined;
function stringParamFromWindow<T extends string>(
  name: string,
  allowed: readonly T[],
  fallback: T | undefined,
) {
  const value = queryParamFromWindow(name);
  return allowed.includes(value as T) ? (value as T) : fallback;
}

function selectedKeysParamFromWindow(fallback: string[]) {
  const value = queryParamFromWindow("selectedKeys");
  return new Set(value ? value.split(",").filter(Boolean) : fallback);
}

const segmentedControlKeys = ["list", "grid", "board"] as const;
type SegmentedControlKey = (typeof segmentedControlKeys)[number];

interface SegmentedControlDemoProps {
  selectedKey: SegmentedControlKey;
  isJustified: boolean;
  isDisabled: boolean;
}

function segmentedControlDemoPropsFromWindow(): SegmentedControlDemoProps {
  return {
    selectedKey: stringParamFromWindow("selectedKey", segmentedControlKeys, "list"),
    isJustified: booleanParamFromWindow("isJustified"),
    isDisabled: booleanParamFromWindow("isDisabled"),
  };
}

function normalizeSegmentedControlDemoProps(props: Partial<SegmentedControlDemoProps>) {
  return {
    selectedKey: segmentedControlKeys.includes(props.selectedKey as SegmentedControlKey)
      ? (props.selectedKey as SegmentedControlKey)
      : "list",
    isJustified: props.isJustified === true,
    isDisabled: props.isDisabled === true,
  };
}

type SelectBoxSelectionMode = "single" | "multiple";

interface SelectBoxGroupDemoProps {
  orientation: "horizontal" | "vertical";
  selectionMode: SelectBoxSelectionMode;
  selectedKeys: string;
  isDisabled: boolean;
  disablePro: boolean;
  withIllustrations: boolean;
}

function selectedKeysSetFromValue(
  value: string | undefined,
  fallback: string[],
  selectionMode: SelectBoxSelectionMode,
) {
  const keys = String(value || fallback.join(","))
    .split(",")
    .map((key) => key.trim())
    .filter(Boolean);
  return new Set(selectionMode === "single" ? keys.slice(0, 1) : keys);
}

function selectBoxGroupDemoPropsFromWindow(): SelectBoxGroupDemoProps {
  const selectionMode = stringParamFromWindow(
    "selectionMode",
    ["single", "multiple"] as const,
    "single",
  );
  return {
    orientation: stringParamFromWindow(
      "orientation",
      ["horizontal", "vertical"] as const,
      "horizontal",
    ),
    selectionMode,
    selectedKeys: Array.from(
      selectedKeysParamFromWindow(selectionMode === "multiple" ? ["starter", "pro"] : ["starter"]),
    ).join(","),
    isDisabled: booleanParamFromWindow("isDisabled"),
    disablePro: booleanParamFromWindow("disablePro"),
    withIllustrations: booleanParamFromWindow("withIllustrations", true),
  };
}

function normalizeSelectBoxGroupDemoProps(
  props: Partial<SelectBoxGroupDemoProps>,
): SelectBoxGroupDemoProps {
  const selectionMode = props.selectionMode === "multiple" ? "multiple" : "single";
  return {
    orientation: props.orientation === "vertical" ? "vertical" : "horizontal",
    selectionMode,
    selectedKeys:
      typeof props.selectedKeys === "string" && props.selectedKeys.trim()
        ? props.selectedKeys
        : selectionMode === "multiple"
          ? "starter,pro"
          : "starter",
    isDisabled: props.isDisabled === true,
    disablePro: props.disablePro === true,
    withIllustrations: props.withIllustrations !== false,
  };
}

function solidSingleButtonFamilyChildren(
  label: string | (() => string),
  iconPlacement: SingleButtonIconPlacement | (() => SingleButtonIconPlacement),
  textClass: () => string,
) {
  const currentLabel = () => (typeof label === "function" ? label() : label);
  const currentIconPlacement = () =>
    typeof iconPlacement === "function" ? iconPlacement() : iconPlacement;

  return [
    () => {
      const text = h("span", { class: textClass(), "data-rsp-slot": "text" }, currentLabel());
      const icon = h(SolidNewIcon, { "aria-hidden": "true" });
      const placement = currentIconPlacement();

      if (placement === "start") {
        return [icon, text];
      }

      if (placement === "only") {
        return icon;
      }

      return text;
    },
  ];
}

export const solidStyledFixtures: Partial<Record<ComparisonSlug, SolidStyledFixture>> = {
  provider: renderProviderDemo,
  accordion: () => h(SolidSpectrumAccordionDemo, {}),
  actionbar: () => h(SolidSpectrumActionBarDemo, {}),
  actionmenu: () => h(SolidSpectrumActionMenuDemo, {}),
  button: () => h(SolidSpectrumButtonDemo, {}),
  actionbutton: () => h(SolidSpectrumActionButtonDemo, {}),
  actionbuttongroup: () => h(SolidSpectrumActionButtonGroupDemo, {}),
  avatar: () => h(SolidSpectrumAvatarDemo, {}),
  avatargroup: () => h(SolidSpectrumAvatarGroupDemo, {}),
  badge: () => h(SolidSpectrumBadgeDemo, {}),
  breadcrumbs: () => h(SolidSpectrumBreadcrumbsDemo, {}),
  buttongroup: () => h(SolidSpectrumButtonGroupDemo, {}),
  calendar: () => h(SolidSpectrumCalendarDemo, {}),
  checkbox: () => h(SolidSpectrumCheckboxDemo, {}),
  checkboxgroup: () => h(SolidSpectrumCheckboxGroupDemo, {}),
  combobox: () => h(SolidSpectrumComboBoxDemo, {}),
  daterangepicker: () => h(SolidSpectrumDateRangePickerDemo, {}),
  datepicker: () => h(SolidSpectrumDatePickerDemo, {}),
  rangecalendar: () => h(SolidSpectrumRangeCalendarDemo, {}),
  divider: () => h(SolidSpectrumDividerDemo, {}),
  form: () => h(SolidSpectrumFormDemo, {}),
  image: () => h(SolidSpectrumImageDemo, {}),
  link: () => h(SolidSpectrumLinkDemo, {}),
  menu: () => h(SolidSpectrumMenuDemo, {}),
  meter: () => h(SolidSpectrumMeterDemo, {}),
  numberfield: () => h(SolidSpectrumNumberFieldDemo, {}),
  picker: () => h(SolidSpectrumPickerDemo, {}),
  radiogroup: () => h(SolidSpectrumRadioGroupDemo, {}),
  linkbutton: () => h(SolidSpectrumLinkButtonDemo, {}),
  cardview: () => h(SolidSpectrumCardViewDemo, {}),
  segmentedcontrol: () => h(SolidSpectrumSegmentedControlDemo, {}),
  selectboxgroup: () => h(SolidSpectrumSelectBoxGroupDemo, {}),
  searchfield: () => h(SolidSpectrumSearchFieldDemo, {}),
  skeleton: () => h(SolidSpectrumSkeletonDemo, {}),
  slider: () => h(SolidSpectrumSliderDemo, {}),
  statuslight: () => h(SolidSpectrumStatusLightDemo, {}),
  switch: () => h(SolidSpectrumSwitchDemo, {}),
  textarea: () => h(SolidSpectrumTextAreaDemo, {}),
  textfield: () => h(SolidSpectrumTextFieldDemo, {}),
  togglebutton: () => h(SolidSpectrumToggleButtonDemo, {}),
  togglebuttongroup: () => h(SolidSpectrumToggleButtonGroupDemo, {}),
};

function renderProviderDemo() {
  return h(
    SolidSpectrumProvider,
    { colorScheme: "dark", background: "base", style: providerShellStyle },
    h(
      "div",
      { class: "comparison-provider-stack" },
      h("div", { class: "comparison-provider-caption" }, "Outer provider: dark / medium scale"),
      h(SolidSpectrumButton, { variant: "primary" }, "Inherited Action"),
      h(
        SolidSpectrumProvider,
        { colorScheme: "light", background: "base", style: nestedProviderStyle },
        h("div", { class: "comparison-provider-caption" }, "Nested provider: local light override"),
        h(SolidSpectrumButton, { variant: "accent" }, "Nested Override"),
      ),
    ),
  );
}

function SolidSpectrumActionBarDemo() {
  const [demoProps, setDemoProps] = createSignal<ActionBarDemoProps>(
    actionBarDemoPropsFromWindow(),
  );
  const [collectionSelectedKeys, setCollectionSelectedKeys] = createSignal<Set<string>>(
    actionBarSelectedKeysFromCount(actionBarDemoPropsFromWindow().selectedItemCount),
  );
  const [isCleared, setIsCleared] = createSignal(false);
  const [clearCount, setClearCount] = createSignal(0);
  const [actionCount, setActionCount] = createSignal(0);
  const scrollRef: { current: HTMLElement | null } = { current: null };
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const directSelectedItemCount = () => (isCleared() ? 0 : demoProps().selectedItemCount);
  const collectionSelectedCount = () => collectionSelectedKeys().size;
  const selectedItemCount = () =>
    demoProps().useCollection ? collectionSelectedCount() : directSelectedItemCount();
  const actionBarChildren = () =>
    actionBarItems.map((item) =>
      hc(
        SolidSpectrumActionButton,
        {
          onPress: () => setActionCount((count) => count + 1),
        },
        [() => [h(SolidNewIcon, { "aria-hidden": "true" }), h(SolidSpectrumText, {}, item.label)]],
      ),
    );
  const actionBar = () =>
    hc(
      SolidSpectrumActionBar,
      {
        get selectedItemCount() {
          return selectedItemCount();
        },
        get isEmphasized() {
          return demoProps().isEmphasized;
        },
        get scrollRef() {
          return demoProps().useScrollRef ? scrollRef : undefined;
        },
        "data-comparison-actionbar-root": "true",
        onClearSelection: () => {
          setClearCount((count) => count + 1);
          setIsCleared(true);
        },
      },
      actionBarChildren(),
    );
  const collection = () =>
    hc(
      "div",
      {
        class: "comparison-actionbar-collection-shell",
        "data-comparison-actionbar-collection-shell": "true",
        ref: (element: HTMLElement) => {
          scrollRef.current = element;
        },
      },
      [
        hc(
          SolidSpectrumListView,
          {
            "aria-label": "Documents",
            selectionMode: "multiple",
            class: "comparison-actionbar-collection-list",
            items: actionBarCollectionItems,
            getKey: (item: (typeof actionBarCollectionItems)[number]) => item.id,
            getTextValue: (item: (typeof actionBarCollectionItems)[number]) => item.label,
            get selectedKeys() {
              return collectionSelectedKeys();
            },
            onSelectionChange: (keys: "all" | Set<string | number>) =>
              setCollectionSelectedKeys(
                keys === "all"
                  ? actionBarSelectedKeysFromCount("all")
                  : new Set<string>(Array.from(keys, String)),
              ),
          },
          renderProp((item: (typeof actionBarCollectionItems)[number]) =>
            hc(SolidSpectrumListViewItem, { id: item.id, description: item.description }, [
              item.label,
            ]),
          ),
        ),
        hc(
          SolidSpectrumActionBar,
          {
            get selectedItemCount() {
              return collectionSelectedCount();
            },
            get isEmphasized() {
              return demoProps().isEmphasized;
            },
            "data-comparison-actionbar-root": "true",
            scrollRef,
            onClearSelection: () => setCollectionSelectedKeys(new Set<string>()),
          },
          actionBarChildren(),
        ),
      ],
    );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbar") {
        const nextProps = normalizeActionBarDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setCollectionSelectedKeys(actionBarSelectedKeysFromCount(nextProps.selectedItemCount));
        setIsCleared(false);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-actionbar-row",
          "data-comparison-control-root": "actionbar",
          get "data-comparison-control-props"() {
            return serializeActionBarDemoProps(demoProps());
          },
          get "data-comparison-actionbar-props"() {
            return serializeActionBarDemoProps(demoProps());
          },
          get "data-comparison-selected-count"() {
            return String(selectedItemCount());
          },
          get "data-comparison-clear-count"() {
            return String(clearCount());
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
          get "data-comparison-actionbar-scroll-ref"() {
            return String(demoProps().useScrollRef);
          },
          get "data-comparison-actionbar-collection"() {
            return String(demoProps().useCollection);
          },
          get "data-comparison-selected-keys"() {
            return demoProps().useCollection
              ? serializeActionBarSelectedKeys(collectionSelectedKeys())
              : "";
          },
        },
        [
          () =>
            demoProps().useCollection
              ? collection()
              : demoProps().useScrollRef
                ? hc(
                    "div",
                    {
                      class: "comparison-actionbar-scroll-shell",
                      "data-comparison-actionbar-scroll-shell": "true",
                      ref: (element: HTMLElement) => {
                        scrollRef.current = element;
                      },
                    },
                    [
                      h(
                        "div",
                        { class: "comparison-actionbar-scroll-content" },
                        actionBarItems.map((item) => h("span", {}, item.label)),
                      ),
                      actionBar(),
                    ],
                  )
                : actionBar(),
        ],
      ),
    ],
  );
}

function SolidSpectrumActionMenuDemo() {
  const [demoProps, setDemoProps] = createSignal<ActionMenuDemoProps>(
    actionMenuDemoPropsFromWindow(),
  );
  const [actionCount, setActionCount] = createSignal(0);
  const [lastAction, setLastAction] = createSignal("");
  const [openChangeCount, setOpenChangeCount] = createSignal(0);
  const [lastOpenState, setLastOpenState] = createSignal("false");
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionmenu") {
        setDemoProps(normalizeActionMenuDemoProps(event.detail.props ?? {}));
        setActionCount(0);
        setLastAction("");
        setOpenChangeCount(0);
        setLastOpenState("false");
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-actionmenu-row",
          "data-comparison-control-root": "actionmenu",
          get "data-comparison-control-props"() {
            return serializeActionMenuDemoProps(demoProps());
          },
          get "data-comparison-actionmenu-props"() {
            return serializeActionMenuDemoProps(demoProps());
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
          get "data-comparison-last-action"() {
            return lastAction();
          },
          get "data-comparison-open-change-count"() {
            return String(openChangeCount());
          },
          get "data-comparison-last-open-state"() {
            return lastOpenState();
          },
        },
        [
          hc(
            SolidSpectrumActionMenu,
            {
              get size() {
                return demoProps().size;
              },
              get menuSize() {
                return demoProps().menuSize;
              },
              get align() {
                return demoProps().align;
              },
              get direction() {
                return demoProps().direction;
              },
              get shouldFlip() {
                return demoProps().shouldFlip;
              },
              get isQuiet() {
                return demoProps().isQuiet;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              onAction: (key: unknown) => {
                setActionCount((count) => count + 1);
                setLastAction(String(key));
              },
              onOpenChange: (isOpen: boolean) => {
                setOpenChangeCount((count) => count + 1);
                setLastOpenState(String(isOpen));
              },
            },
            [
              () =>
                actionMenuItems.map((item) =>
                  hc(
                    SolidSpectrumMenuItem,
                    {
                      id: item.id,
                      textValue: item.label,
                    },
                    [
                      () => [
                        h(SolidNewIcon, { "aria-hidden": "true" }),
                        h(SolidSpectrumText, { slot: "label" }, item.label),
                        h(SolidSpectrumText, { slot: "description" }, item.description),
                        h(SolidSpectrumKeyboard, {}, item.shortcut),
                      ],
                    ],
                  ),
                ),
            ],
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumMenuDemo() {
  const [demoProps, setDemoProps] = createSignal<MenuDemoProps>(menuDemoPropsFromWindow());
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    defaultMenuSelectedKeys(menuDemoPropsFromWindow().selectionMode),
  );
  const [actionCount, setActionCount] = createSignal(0);
  const [lastAction, setLastAction] = createSignal("");
  const [openChangeCount, setOpenChangeCount] = createSignal(0);
  const [lastOpenState, setLastOpenState] = createSignal("false");
  const [selectionChangeCount, setSelectionChangeCount] = createSignal(0);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "menu") {
        const nextProps = normalizeMenuDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKeys(defaultMenuSelectedKeys(nextProps.selectionMode));
        setActionCount(0);
        setLastAction("");
        setOpenChangeCount(0);
        setLastOpenState("false");
        setSelectionChangeCount(0);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const activeSelectionMode = () =>
    demoProps().selectionMode === "none" ? undefined : demoProps().selectionMode;
  const handleSelectionChange = (keys: unknown) => {
    const nextKeys =
      keys === "all"
        ? new Set(menuItems.map((item) => item.id))
        : new Set(Array.from(keys as Iterable<unknown>).map(String));
    setSelectedKeys(nextKeys);
    setSelectionChangeCount((count) => count + 1);
  };

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-menu-row",
          "data-comparison-control-root": "menu",
          get "data-comparison-control-props"() {
            return serializeMenuDemoProps(demoProps());
          },
          get "data-comparison-menu-props"() {
            return serializeMenuDemoProps(demoProps());
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
          get "data-comparison-last-action"() {
            return lastAction();
          },
          get "data-comparison-open-change-count"() {
            return String(openChangeCount());
          },
          get "data-comparison-last-open-state"() {
            return lastOpenState();
          },
          get "data-comparison-selection-change-count"() {
            return String(selectionChangeCount());
          },
          get "data-comparison-selected-keys"() {
            return serializeMenuSelectedKeys(selectedKeys());
          },
        },
        [
          hc(
            SolidSpectrumMenuTrigger,
            {
              get align() {
                return demoProps().align;
              },
              get direction() {
                return demoProps().direction;
              },
              get shouldFlip() {
                return demoProps().shouldFlip;
              },
              onOpenChange: (isOpen: boolean) => {
                setOpenChangeCount((count) => count + 1);
                setLastOpenState(String(isOpen));
              },
            },
            [
              h(
                SolidSpectrumActionButton,
                {
                  get size() {
                    return demoProps().triggerSize;
                  },
                  get isDisabled() {
                    return demoProps().isDisabled;
                  },
                  "aria-label": "Layer actions",
                },
                "Layer actions",
              ),
              hc(
                SolidSpectrumMenu,
                {
                  get size() {
                    return demoProps().size;
                  },
                  "aria-label": "Layer actions",
                  get selectionMode() {
                    return activeSelectionMode();
                  },
                  get selectedKeys() {
                    return activeSelectionMode() ? selectedKeys() : undefined;
                  },
                  onSelectionChange: handleSelectionChange,
                  onAction: (key: unknown) => {
                    setActionCount((count) => count + 1);
                    setLastAction(String(key));
                  },
                },
                [
                  () =>
                    menuItems.map((item) =>
                      hc(
                        SolidSpectrumMenuItem,
                        {
                          id: item.id,
                          textValue: item.label,
                        },
                        [
                          () => [
                            h(SolidNewIcon, { "aria-hidden": "true" }),
                            h(SolidSpectrumText, { slot: "label" }, item.label),
                            h(SolidSpectrumText, { slot: "description" }, item.description),
                            h(SolidSpectrumKeyboard, {}, item.shortcut),
                          ],
                        ],
                      ),
                    ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumBreadcrumbsDemo() {
  const [demoProps, setDemoProps] = createSignal<BreadcrumbsDemoProps>(
    breadcrumbsDemoPropsFromWindow(),
  );
  const [pathItems, setPathItems] = createSignal<BreadcrumbsItem[]>(
    breadcrumbsItemsForSet(breadcrumbsDemoPropsFromWindow().itemSet),
  );
  const [actionCount, setActionCount] = createSignal(0);
  const [lastAction, setLastAction] = createSignal("");
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "breadcrumbs") {
        const nextProps = normalizeBreadcrumbsDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setPathItems(breadcrumbsItemsForSet(nextProps.itemSet));
        setActionCount(0);
        setLastAction("");
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const handleAction = (key: string | number) => {
    const nextKey = String(key);
    const sourceItems = breadcrumbsItemsForSet(demoProps().itemSet);
    const index = sourceItems.findIndex((item) => item.id === nextKey);
    setActionCount((count) => count + 1);
    setLastAction(nextKey);
    if (index >= 0) {
      setPathItems(sourceItems.slice(0, index + 1));
    }
  };

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-breadcrumbs-row",
          "data-comparison-control-root": "breadcrumbs",
          get "data-comparison-control-props"() {
            return serializeBreadcrumbsDemoProps(demoProps());
          },
          get "data-comparison-breadcrumbs-props"() {
            return serializeBreadcrumbsDemoProps(demoProps());
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
          get "data-comparison-last-action"() {
            return lastAction();
          },
          get "data-comparison-path"() {
            return serializeBreadcrumbPath(pathItems());
          },
        },
        [
          () =>
            demoProps().itemSet === "standard"
              ? hc(
                  SolidSpectrumBreadcrumbs,
                  {
                    get size() {
                      return demoProps().size;
                    },
                    get isDisabled() {
                      return demoProps().isDisabled;
                    },
                    UNSAFE_style: { width: "100%" },
                    "aria-label": "Project location",
                    onAction: handleAction,
                  },
                  [
                    () =>
                      pathItems().map((item) =>
                        h(
                          SolidSpectrumBreadcrumb,
                          {
                            id: item.id,
                            href: item.href,
                          },
                          item.label,
                        ),
                      ),
                  ],
                )
              : hc(
                  SolidSpectrumBreadcrumbs,
                  {
                    get items() {
                      return pathItems();
                    },
                    getKey: (item: BreadcrumbsItem) => item.id,
                    get size() {
                      return demoProps().size;
                    },
                    get isDisabled() {
                      return demoProps().isDisabled;
                    },
                    UNSAFE_style: { width: "100%" },
                    "aria-label": "Project location",
                    onAction: handleAction,
                  },
                  renderProp((item: BreadcrumbsItem) =>
                    h(
                      SolidSpectrumBreadcrumb,
                      {
                        id: item.id,
                        href: item.href,
                      },
                      item.label,
                    ),
                  ),
                ),
        ],
      ),
    ],
  );
}

function SolidSpectrumAccordionDemo() {
  const [demoProps, setDemoProps] = createSignal<AccordionDemoProps>(
    accordionDemoPropsFromWindow(),
  );
  const locale = accordionDemoLocaleFromWindow();
  const [expandedKeys, setExpandedKeys] = createSignal<Set<string>>(new Set(["personal"]));
  const [expandedChangeCount, setExpandedChangeCount] = createSignal(0);
  const [lastExpandedChangeKeys, setLastExpandedChangeKeys] = createSignal("");
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "accordion") {
        setDemoProps(normalizeAccordionDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const controlledExpandedKeys = createMemo(() => {
    const keys = Array.from(expandedKeys());
    return new Set(demoProps().allowsMultipleExpanded ? keys : keys.slice(0, 1));
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      locale,
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-accordion-row",
          "data-comparison-control-root": "accordion",
          get "data-comparison-control-props"() {
            return serializeAccordionDemoProps(demoProps());
          },
          get "data-comparison-expanded-keys"() {
            return serializeAccordionKeys(controlledExpandedKeys());
          },
          get "data-comparison-expanded-change-count"() {
            return String(expandedChangeCount());
          },
          get "data-comparison-expanded-change-keys"() {
            return lastExpandedChangeKeys();
          },
        },
        [
          hc(
            SolidSpectrumAccordion,
            {
              UNSAFE_style: { width: "220px" },
              get size() {
                return demoProps().size;
              },
              get density() {
                return demoProps().density;
              },
              get isQuiet() {
                return demoProps().isQuiet;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get allowsMultipleExpanded() {
                return demoProps().allowsMultipleExpanded;
              },
              get expandedKeys() {
                return controlledExpandedKeys();
              },
              onExpandedChange(keys: Set<string>) {
                const nextKeys = new Set(Array.from(keys).map(String));
                setExpandedKeys(nextKeys);
                setExpandedChangeCount((count) => count + 1);
                setLastExpandedChangeKeys(serializeAccordionKeys(nextKeys));
              },
            },
            [
              hc(SolidSpectrumAccordionItem, { id: "personal" }, [
                hc(SolidSpectrumAccordionItemTitle, {}, ["Personal Information"]),
                hc(SolidSpectrumAccordionItemPanel, {}, [
                  hc("div", { class: "comparison-accordion-panel-copy" }, [
                    h("span", {}, "Name"),
                    h("span", {}, "Phone number"),
                    h("span", {}, "Email address"),
                  ]),
                ]),
              ]),
              hc(SolidSpectrumAccordionItem, { id: "billing" }, [
                hc(SolidSpectrumAccordionItemHeader, {}, [
                  hc(SolidSpectrumAccordionItemTitle, {}, ["Billing Address"]),
                  hc(SolidSpectrumActionButton, { "aria-label": "More billing actions" }, [
                    h(SolidNewIcon, { "aria-hidden": "true" }),
                  ]),
                ]),
                hc(SolidSpectrumAccordionItemPanel, {}, [
                  hc("div", { class: "comparison-accordion-panel-copy" }, [
                    h("span", {}, "Street address"),
                    h("span", {}, "City"),
                    h("span", {}, "Postal code"),
                  ]),
                ]),
              ]),
            ],
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumAvatarDemo() {
  const [demoProps, setDemoProps] = createSignal<AvatarDemoProps>(avatarDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "avatar") {
        setDemoProps(normalizeAvatarDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-avatar-row",
          get "data-comparison-avatar-over-background"() {
            return demoProps().isOverBackground ? "true" : "false";
          },
          "data-comparison-control-root": "avatar",
          get "data-comparison-control-props"() {
            return serializeAvatarDemoProps(demoProps());
          },
        },
        [
          () =>
            h(SolidSpectrumAvatar, {
              get alt() {
                return demoProps().alt;
              },
              get src() {
                return demoProps().src || undefined;
              },
              get size() {
                return Number(demoProps().size);
              },
              get isOverBackground() {
                return demoProps().isOverBackground;
              },
            }),
        ],
      ),
    ],
  );
}

function SolidSpectrumAvatarGroupDemo() {
  const [demoProps, setDemoProps] = createSignal<AvatarGroupDemoProps>(
    avatarGroupDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "avatargroup") {
        setDemoProps(normalizeAvatarGroupDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-avatar-group-row",
          "data-comparison-control-root": "avatargroup",
          get "data-comparison-control-props"() {
            return serializeAvatarGroupDemoProps(demoProps());
          },
        },
        [
          () =>
            hc(
              SolidSpectrumAvatarGroup,
              {
                get label() {
                  return demoProps().label || undefined;
                },
                get "aria-label"() {
                  return demoProps().ariaLabel;
                },
                get size() {
                  return Number(demoProps().size) as 16 | 20 | 24 | 28 | 32 | 36 | 40;
                },
              },
              avatarGroupItems
                .slice(0, Number(demoProps().count))
                .map((item) => h(SolidSpectrumAvatar, { alt: item.alt, src: item.src })),
            ),
        ],
      ),
    ],
  );
}

function solidBadgeChildren(props: BadgeDemoProps) {
  if (props.iconPlacement === "start") {
    return [
      () => [h(SolidNewIcon, { "aria-hidden": "true" }), h(SolidSpectrumText, {}, props.children)],
    ];
  }

  return [props.children];
}

function SolidSpectrumBadgeDemo() {
  const [demoProps, setDemoProps] = createSignal<BadgeDemoProps>(badgeDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "badge") {
        setDemoProps(normalizeBadgeDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const renderedBadge = createMemo(() => {
    const props = demoProps();

    return hc(
      SolidSpectrumBadge,
      {
        "data-comparison-control-root": "badge",
        "data-comparison-control-props": serializeBadgeDemoProps(props),
        variant: props.variant,
        fillStyle: props.fillStyle,
        size: props.size,
        overflowMode: props.overflowMode,
      },
      solidBadgeChildren(props),
    );
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-badge-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedBadge],
      ),
    ],
  );
}

function SolidSpectrumStatusLightDemo() {
  const [demoProps, setDemoProps] = createSignal<StatusLightDemoProps>(
    statusLightDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "statuslight") {
        setDemoProps(normalizeStatusLightDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const renderedStatusLight = createMemo(() => {
    const props = demoProps();

    return hc(
      SolidSpectrumStatusLight,
      {
        "data-comparison-control-root": "statuslight",
        "data-comparison-control-props": serializeStatusLightDemoProps(props),
        variant: props.variant,
        size: props.size,
        role: props.role || undefined,
      },
      [props.children],
    );
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-status-light-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedStatusLight],
      ),
    ],
  );
}

function SolidSpectrumDividerDemo() {
  const [demoProps, setDemoProps] = createSignal<DividerDemoProps>(dividerDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "divider") {
        setDemoProps(normalizeDividerDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const renderedDivider = createMemo(() => {
    const props = demoProps();

    return h(SolidSpectrumDivider, {
      "data-comparison-control-root": "divider",
      "data-comparison-control-props": serializeDividerDemoProps(props),
      orientation: props.orientation,
      size: props.size,
      staticColor: props.staticColor,
    });
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get class() {
            return staticColorBackdropClass(demoProps().staticColor, "comparison-divider-row");
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          get "data-comparison-orientation"() {
            return demoProps().orientation;
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedDivider],
      ),
    ],
  );
}

function SolidSpectrumMeterDemo() {
  const [demoProps, setDemoProps] = createSignal<MeterDemoProps>(meterDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "meter") {
        setDemoProps(normalizeMeterDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const renderedMeter = createMemo(() => {
    const props = demoProps();

    return h(SolidSpectrumMeter, {
      "data-comparison-control-root": "meter",
      "data-comparison-control-props": serializeMeterDemoProps(props),
      label: props.label,
      value: props.value,
      minValue: props.minValue,
      maxValue: props.maxValue,
      valueLabel: props.valueLabel || undefined,
      variant: props.variant,
      size: props.size,
      staticColor: props.staticColor || undefined,
      labelPosition: props.labelPosition,
    });
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get class() {
            return staticColorBackdropClass(demoProps().staticColor, "comparison-meter-row");
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedMeter],
      ),
    ],
  );
}

function imageFrameStyle(objectFit: string): JSX.CSSProperties {
  return {
    width: "160px",
    height: "96px",
    "max-width": "100%",
    "border-radius": "6px",
    "object-fit": objectFit,
    "object-position": "center",
  };
}

function imageSourceForDemo(demoProps: ImageDemoProps) {
  if (demoProps.sourceMode === "conditional") {
    return [
      { colorScheme: "light" as const, srcSet: imageDemoSources.light },
      {
        colorScheme: "dark" as const,
        srcSet: imageDemoSources.dark,
        media: "(min-width: 1px)",
      },
    ];
  }

  if (demoProps.sourceMode === "error") {
    return imageMissingSource;
  }

  return imageDemoSources.basic;
}

function SolidImageError() {
  return h("div", { class: "comparison-image-error" }, "Error loading image");
}

function SolidSpectrumImageDemo() {
  const [demoProps, setDemoProps] = createSignal<ImageDemoProps>(imageDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "image") {
        setDemoProps(normalizeImageDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const image = () => {
    const props = demoProps();
    if (props.sourceMode === "coordinator") {
      return hc(SolidSpectrumImageCoordinator, {}, [
        h("div", { class: "comparison-image-coordinator-grid" }, [
          h(SolidSpectrumImage, {
            alt: `${props.alt} one`,
            src: imageDemoSources.first,
            UNSAFE_style: imageFrameStyle(props.objectFit),
          }),
          h(SolidSpectrumImage, {
            alt: `${props.alt} two`,
            src: imageDemoSources.second,
            UNSAFE_style: imageFrameStyle(props.objectFit),
          }),
        ]),
      ]);
    }

    return h(SolidSpectrumImage, {
      alt: props.alt,
      src: imageSourceForDemo(props),
      UNSAFE_style: imageFrameStyle(props.objectFit),
      renderError: props.sourceMode === "error" ? SolidImageError : undefined,
    });
  };

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-image-row",
          "data-comparison-control-root": "image",
          get "data-comparison-control-props"() {
            return serializeImageDemoProps(demoProps());
          },
        },
        [image],
      ),
    ],
  );
}

const skeletonImageStyle: JSX.CSSProperties = {
  width: "128px",
  height: "96px",
  "max-width": "100%",
  "border-radius": "6px",
  "flex-shrink": 0,
  "aspect-ratio": "4 / 3",
  "object-fit": "cover",
  "object-position": "center",
};

const skeletonTitleStyle: JSX.CSSProperties = {
  "font-size": "20px",
  "line-height": "24px",
  "font-weight": 700,
  color: "rgb(34, 34, 34)",
};

const skeletonBodyStyle: JSX.CSSProperties = {
  "font-size": "14px",
  "line-height": "20px",
  color: "rgb(34, 34, 34)",
};

const skeletonMetaStyle: JSX.CSSProperties = {
  "font-size": "13px",
  "line-height": "18px",
  color: "rgb(34, 34, 34)",
};

function SolidSkeletonContent() {
  return h("div", { class: "comparison-skeleton-card" }, [
    h(SolidSpectrumImage, {
      alt: "Preview",
      src: imageDemoSources.basic,
      width: 320,
      height: 192,
      UNSAFE_style: skeletonImageStyle,
    }),
    h("div", { class: "comparison-skeleton-copy" }, [
      h(SolidSpectrumText, { UNSAFE_style: skeletonTitleStyle }, "Placeholder title"),
      h(
        SolidSpectrumText,
        { UNSAFE_style: skeletonBodyStyle },
        "This is placeholder content approximating the length of the final content.",
      ),
      h("div", { class: "comparison-skeleton-inline" }, [
        h(SolidNewIcon, {}),
        h(SolidSpectrumText, { UNSAFE_style: skeletonMetaStyle }, "Here is an icon."),
      ]),
    ]),
  ]) as JSX.Element;
}

function SolidSpectrumSkeletonDemo() {
  const [demoProps, setDemoProps] = createSignal<SkeletonDemoProps>(skeletonDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "skeleton") {
        setDemoProps(normalizeSkeletonDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-skeleton-row",
          "data-comparison-control-root": "skeleton",
          get "data-comparison-control-props"() {
            return serializeSkeletonDemoProps(demoProps());
          },
        },
        [
          hc(
            SolidSpectrumSkeleton,
            {
              get isLoading() {
                return demoProps().isLoading;
              },
            },
            [h(SolidSkeletonContent, {})],
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumButtonDemo() {
  const [actionCount, setActionCount] = createSignal(0);
  const [demoProps, setDemoProps] = createSignal(buttonDemoPropsFromWindow());
  const locale = buttonDemoLocaleFromWindow();
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "button") {
        setDemoProps(event.detail.props as ButtonDemoProps);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const renderedButton = createMemo(() => {
    const props = demoProps();
    const children =
      props.iconPlacement === "start"
        ? [
            () => h(SolidNewIcon, { "aria-hidden": "true" }),
            () =>
              h(
                "span",
                {
                  class: s2ButtonText({ isProgressVisible: props.isPending }),
                  "data-rsp-slot": "text",
                },
                props.children,
              ),
          ]
        : props.iconPlacement === "only"
          ? [() => h(SolidNewIcon, { "aria-hidden": "true" })]
          : [
              () =>
                h(
                  "span",
                  {
                    class: s2ButtonText({ isProgressVisible: props.isPending }),
                    "data-rsp-slot": "text",
                  },
                  props.children,
                ),
            ];

    return hc(
      SolidSpectrumButton,
      {
        isDisabled: props.isDisabled,
        isPending: props.isPending,
        variant: props.variant,
        fillStyle: props.fillStyle,
        size: props.size,
        staticColor: props.staticColor,
        ...(props.iconPlacement === "only" ? { "aria-label": props.children } : {}),
        onPress: (_event: unknown) => {
          if (!props.isPending) {
            setActionCount((count) => count + 1);
          }
        },
      },
      children,
    );
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      locale,
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
          "data-comparison-control-root": "button",
          get "data-comparison-control-props"() {
            return serializeButtonDemoProps(demoProps());
          },
          get "data-comparison-button-props"() {
            return serializeButtonDemoProps(demoProps());
          },
        },
        [
          hc(
            "div",
            {
              get class() {
                return staticColorBackdropClass(demoProps().staticColor, "comparison-button-row");
              },
              get "data-comparison-static-color"() {
                return staticColorBackdropValue(demoProps().staticColor);
              },
            },
            [renderedButton],
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumCheckboxDemo() {
  const [demoProps, setDemoProps] = createSignal(checkboxDemoPropsFromWindow());
  const [isSelected, setIsSelected] = createSignal(demoProps().isSelected);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "checkbox") {
        const nextProps = normalizeCheckboxDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setIsSelected(nextProps.isSelected);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() =>
    serializeCheckboxDemoProps({
      ...demoProps(),
      isSelected: isSelected(),
    }),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-checked"() {
            return String(isSelected());
          },
        },
        [
          hc(
            SolidSpectrumCheckbox,
            {
              "data-comparison-control-root": "checkbox",
              get "data-comparison-control-props"() {
                return serializedProps();
              },
              get size() {
                return demoProps().size;
              },
              get isSelected() {
                return isSelected();
              },
              get isIndeterminate() {
                return demoProps().isIndeterminate;
              },
              get isEmphasized() {
                return demoProps().isEmphasized;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get isReadOnly() {
                return demoProps().isReadOnly;
              },
              get isInvalid() {
                return demoProps().isInvalid;
              },
              onChange: (nextSelected: boolean) => {
                setIsSelected(nextSelected);
                setDemoProps((current: CheckboxDemoProps) => ({
                  ...current,
                  isSelected: nextSelected,
                }));
              },
            },
            [() => demoProps().children],
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumCheckboxGroupDemo() {
  const [demoProps, setDemoProps] = createSignal<CheckboxGroupDemoProps>(
    checkboxGroupDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal<string[]>(
    selectedValuesArrayFromText(demoProps().selectedValues, ["email"]),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "checkboxgroup") {
        const nextProps = normalizeCheckboxGroupDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(selectedValuesArrayFromText(nextProps.selectedValues, ["email"]));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const selectedValues = createMemo(() => value().join(","));
  const serializedProps = createMemo(() =>
    serializeCheckboxGroupDemoProps({
      ...demoProps(),
      selectedValues: selectedValues(),
    }),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected-values"() {
            return selectedValues();
          },
          "data-comparison-control-root": "checkboxgroup",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(
            SolidSpectrumCheckboxGroup,
            {
              get label() {
                return demoProps().label;
              },
              get value() {
                return value();
              },
              get size() {
                return demoProps().size;
              },
              get orientation() {
                return demoProps().orientation;
              },
              get description() {
                return demoProps().description;
              },
              get errorMessage() {
                return demoProps().errorMessage;
              },
              get isEmphasized() {
                return demoProps().isEmphasized;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get isReadOnly() {
                return demoProps().isReadOnly;
              },
              get isRequired() {
                return demoProps().isRequired;
              },
              get isInvalid() {
                return demoProps().isInvalid;
              },
              onChange: (nextValue: string[]) => {
                setValue(nextValue.map(String));
                setDemoProps((current: CheckboxGroupDemoProps) => ({
                  ...current,
                  selectedValues: nextValue.join(","),
                }));
              },
            },
            checkboxGroupItems.map((item) =>
              hc(SolidSpectrumCheckbox, { value: item.value }, [item.label]),
            ),
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumCalendarDemo() {
  const [demoProps, setDemoProps] = createSignal<CalendarDemoProps>(calendarDemoPropsFromWindow());
  const [value, setValue] = createSignal(
    calendarDateFromString(calendarDemoPropsFromWindow().value),
  );
  const [focusedValue, setFocusedValue] = createSignal(
    calendarDateFromString(
      calendarDemoPropsFromWindow().focusedValue || calendarDemoPropsFromWindow().value,
    ),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "calendar") {
        const nextProps = normalizeCalendarDemoProps({
          ...demoProps(),
          ...(event.detail.props ?? {}),
        });
        setDemoProps(nextProps);
        setValue(() => calendarDateFromString(nextProps.value));
        setFocusedValue(() => calendarDateFromString(nextProps.focusedValue || nextProps.value));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(calendarControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(calendarControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() => serializeCalendarDemoProps(demoProps()));

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      get locale() {
        return demoProps().locale || undefined;
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-value"() {
            return value() ? String(value()) : "";
          },
          get "data-comparison-focused-value"() {
            return focusedValue() ? String(focusedValue()) : "";
          },
          "data-comparison-control-root": "calendar",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumCalendar, {
            class: "comparison-calendar-root",
            "aria-label": "Event date",
            get value() {
              return value() ?? undefined;
            },
            onChange: (nextValue) => {
              setValue(() => nextValue);
            },
            get minValue() {
              return demoProps().constrainRange ? calendarMinValue : undefined;
            },
            get maxValue() {
              return demoProps().constrainRange ? calendarMaxValue : undefined;
            },
            get isDateUnavailable() {
              return demoProps().unavailableDates ? isCalendarDateUnavailable : undefined;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get firstDayOfWeek() {
              return demoProps().firstDayOfWeek || undefined;
            },
            get visibleMonths() {
              return calendarVisibleMonthsFromString(demoProps().visibleMonths);
            },
            get pageBehavior() {
              return demoProps().pageBehavior || undefined;
            },
            get selectionAlignment() {
              return demoProps().selectionAlignment || undefined;
            },
            get createCalendar() {
              return calendarCreateCalendarForDemo(demoProps().calendarSystem);
            },
            get focusedValue() {
              return demoProps().focusedValue ? (focusedValue() ?? undefined) : undefined;
            },
            onFocusChange: (nextFocusedValue) => {
              setFocusedValue(() => nextFocusedValue);
            },
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumRangeCalendarDemo() {
  const [demoProps, setDemoProps] = createSignal<RangeCalendarDemoProps>(
    rangeCalendarDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(rangeCalendarValueFromDemo(demoProps()));
  const [focusedValue, setFocusedValue] = createSignal(
    rangeCalendarDateFromString(demoProps().focusedValue || demoProps().startValue),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "rangecalendar") {
        const nextProps = normalizeRangeCalendarDemoProps({
          ...demoProps(),
          ...(event.detail.props ?? {}),
        });
        setDemoProps(nextProps);
        setValue(() => rangeCalendarValueFromDemo(nextProps));
        setFocusedValue(() =>
          rangeCalendarDateFromString(nextProps.focusedValue || nextProps.startValue),
        );
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(rangeCalendarControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(rangeCalendarControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() => serializeRangeCalendarDemoProps(demoProps()));

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-value"() {
            return serializeRangeCalendarValue(value());
          },
          get "data-comparison-focused-value"() {
            return focusedValue() ? String(focusedValue()) : "";
          },
          "data-comparison-control-root": "rangecalendar",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumRangeCalendar, {
            class: "comparison-rangecalendar-root",
            "aria-label": "Trip dates",
            get value() {
              return value() ?? undefined;
            },
            onChange: (nextValue: ReturnType<typeof value>) => {
              setValue(() => nextValue);
            },
            get minValue() {
              return demoProps().constrainRange ? rangeCalendarMinValue : undefined;
            },
            get maxValue() {
              return demoProps().constrainRange ? rangeCalendarMaxValue : undefined;
            },
            get isDateUnavailable() {
              return demoProps().unavailableDates ? isRangeCalendarDateUnavailable : undefined;
            },
            get allowsNonContiguousRanges() {
              return demoProps().allowsNonContiguousRanges;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get firstDayOfWeek() {
              return demoProps().firstDayOfWeek || undefined;
            },
            get visibleMonths() {
              return rangeCalendarVisibleMonthsFromString(demoProps().visibleMonths);
            },
            get pageBehavior() {
              return demoProps().pageBehavior || undefined;
            },
            get selectionAlignment() {
              return demoProps().selectionAlignment || undefined;
            },
            get focusedValue() {
              return demoProps().focusedValue ? (focusedValue() ?? undefined) : undefined;
            },
            onFocusChange: (nextFocusedValue: ReturnType<typeof focusedValue>) => {
              setFocusedValue(() => nextFocusedValue);
            },
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumDatePickerDemo() {
  const initialDemoProps = datePickerDemoPropsFromWindow();
  const [demoProps, setDemoProps] = createSignal<DatePickerDemoProps>(initialDemoProps);
  const [value, setValue] = createSignal(datePickerValueFromDemo(initialDemoProps));
  const [isOpen, setIsOpen] = createSignal(false);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "datepicker") {
        const nextProps = normalizeDatePickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(datePickerValueFromDemo(nextProps));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() => serializeDatePickerDemoProps(demoProps()));

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-value"() {
            return serializeDatePickerValue(value());
          },
          get "data-comparison-open"() {
            return String(isOpen());
          },
          "data-comparison-control-root": "datepicker",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumDatePicker, {
            class: "comparison-datepicker-root",
            get label() {
              return demoProps().label;
            },
            get size() {
              return demoProps().size;
            },
            get value() {
              return value() ?? undefined;
            },
            get maxVisibleMonths() {
              return Number(demoProps().maxVisibleMonths);
            },
            get minValue() {
              return demoProps().constrainRange ? datePickerMinValue : undefined;
            },
            get maxValue() {
              return demoProps().constrainRange ? datePickerMaxValue : undefined;
            },
            get isDateUnavailable() {
              return demoProps().unavailableDates ? isDatePickerDateUnavailable : undefined;
            },
            get firstDayOfWeek() {
              return demoProps().firstDayOfWeek || undefined;
            },
            get pageBehavior() {
              return demoProps().pageBehavior || undefined;
            },
            get name() {
              return demoProps().name || undefined;
            },
            get description() {
              return demoProps().description;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isRequired() {
              return demoProps().isRequired;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            onChange: setValue,
            onOpenChange: setIsOpen,
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumDateRangePickerDemo() {
  const initialDemoProps = dateRangePickerDemoPropsFromWindow();
  const [demoProps, setDemoProps] = createSignal<DateRangePickerDemoProps>(initialDemoProps);
  const [value, setValue] = createSignal(dateRangePickerValueFromDemo(initialDemoProps));
  const [isOpen, setIsOpen] = createSignal(false);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "daterangepicker") {
        const nextProps = normalizeDateRangePickerDemoProps({
          ...demoProps(),
          ...(event.detail.props ?? {}),
        });
        setDemoProps(nextProps);
        setValue(() => dateRangePickerValueFromDemo(nextProps));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() => serializeDateRangePickerDemoProps(demoProps()));

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-value"() {
            return serializeDateRangePickerValue(value());
          },
          get "data-comparison-open"() {
            return String(isOpen());
          },
          "data-comparison-control-root": "daterangepicker",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumDateRangePicker, {
            class: "comparison-daterangepicker-root",
            get label() {
              return demoProps().label;
            },
            get size() {
              return demoProps().size;
            },
            get value() {
              return value() ?? undefined;
            },
            get maxVisibleMonths() {
              return Number(demoProps().maxVisibleMonths);
            },
            get minValue() {
              return demoProps().constrainRange ? dateRangePickerMinValue : undefined;
            },
            get maxValue() {
              return demoProps().constrainRange ? dateRangePickerMaxValue : undefined;
            },
            get isDateUnavailable() {
              return demoProps().unavailableDates ? isDateRangePickerDateUnavailable : undefined;
            },
            get allowsNonContiguousRanges() {
              return demoProps().allowsNonContiguousRanges;
            },
            get firstDayOfWeek() {
              return demoProps().firstDayOfWeek || undefined;
            },
            get pageBehavior() {
              return demoProps().pageBehavior || undefined;
            },
            get startName() {
              return demoProps().startName || undefined;
            },
            get endName() {
              return demoProps().endName || undefined;
            },
            get description() {
              return demoProps().description;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isRequired() {
              return demoProps().isRequired;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            onChange: (nextValue: ReturnType<typeof value>) => {
              setValue(() => nextValue ?? null);
            },
            onOpenChange: setIsOpen,
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumRadioGroupDemo() {
  const [demoProps, setDemoProps] = createSignal<RadioGroupDemoProps>(
    radioGroupDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(demoProps().selectedValue);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "radiogroup") {
        const nextProps = normalizeRadioGroupDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.selectedValue);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() =>
    serializeRadioGroupDemoProps({
      ...demoProps(),
      selectedValue: value(),
    }),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected-value"() {
            return value();
          },
          "data-comparison-control-root": "radiogroup",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(
            SolidSpectrumRadioGroup,
            {
              get label() {
                return demoProps().label;
              },
              get value() {
                return value();
              },
              get size() {
                return demoProps().size;
              },
              get orientation() {
                return demoProps().orientation;
              },
              get description() {
                return demoProps().description;
              },
              get errorMessage() {
                return demoProps().errorMessage;
              },
              get isEmphasized() {
                return demoProps().isEmphasized;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get isReadOnly() {
                return demoProps().isReadOnly;
              },
              get isRequired() {
                return demoProps().isRequired;
              },
              get isInvalid() {
                return demoProps().isInvalid;
              },
              onChange: (nextValue: string) => {
                setValue(nextValue);
                setDemoProps((current: RadioGroupDemoProps) => ({
                  ...current,
                  selectedValue: nextValue,
                }));
              },
            },
            radioGroupItems.map((item) =>
              hc(SolidSpectrumRadio, { value: item.value }, [item.label]),
            ),
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumSwitchDemo() {
  const [demoProps, setDemoProps] = createSignal<SwitchDemoProps>(switchDemoPropsFromWindow());
  const [isSelected, setIsSelected] = createSignal(demoProps().isSelected);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "switch") {
        const nextProps = normalizeSwitchDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setIsSelected(nextProps.isSelected);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() =>
    serializeSwitchDemoProps({
      ...demoProps(),
      isSelected: isSelected(),
    }),
  );

  return createComponent(SolidSpectrumProvider, {
    get colorScheme() {
      return colorScheme();
    },
    background: "base",
    style: providerShellStyle,
    get children() {
      return h(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected"() {
            return String(isSelected());
          },
          "data-comparison-control-root": "switch",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          createComponent(SolidSpectrumSwitch, {
            get size() {
              return demoProps().size;
            },
            get isSelected() {
              return isSelected();
            },
            get isEmphasized() {
              return demoProps().isEmphasized;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            onChange: (nextSelected: boolean) => {
              setIsSelected(nextSelected);
              setDemoProps((current: SwitchDemoProps) => ({
                ...current,
                isSelected: nextSelected,
              }));
            },
            get children() {
              return demoProps().children;
            },
          }),
        ],
      );
    },
  });
}

function SolidSpectrumTextFieldDemo() {
  const [demoProps, setDemoProps] = createSignal<TextFieldDemoProps>(
    textFieldDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(demoProps().value);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "textfield") {
        const nextProps = normalizeTextFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() =>
    serializeTextFieldDemoProps({
      ...demoProps(),
      value: value(),
    }),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-value"() {
            return value();
          },
        },
        [
          hc(SolidSpectrumTextField, {
            "data-comparison-control-root": "textfield",
            get "data-comparison-control-props"() {
              return serializedProps();
            },
            get label() {
              return demoProps().label;
            },
            get value() {
              return value();
            },
            get placeholder() {
              return demoProps().placeholder;
            },
            get size() {
              return demoProps().size;
            },
            get description() {
              return demoProps().description;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isRequired() {
              return demoProps().isRequired;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) => {
              const nextValue = event.currentTarget.value;
              setValue(nextValue);
              setDemoProps((current: TextFieldDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
            onChange: (nextValue: string) => {
              setValue(nextValue);
              setDemoProps((current: TextFieldDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumFormDemo() {
  const [demoProps, setDemoProps] = createSignal<FormDemoProps>(formDemoPropsFromWindow());
  const [value, setValue] = createSignal(demoProps().value);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "form") {
        const nextProps = normalizeFormDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() =>
    serializeFormDemoProps({
      ...demoProps(),
      value: value(),
    }),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          class: "comparison-form-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [
          hc(
            SolidSpectrumForm,
            {
              "data-comparison-control-root": "form",
              get "data-comparison-control-props"() {
                return serializedProps();
              },
              get "data-comparison-value"() {
                return value();
              },
              get size() {
                return demoProps().size;
              },
              get labelPosition() {
                return demoProps().labelPosition;
              },
              get labelAlign() {
                return demoProps().labelAlign;
              },
              get necessityIndicator() {
                return demoProps().necessityIndicator;
              },
              get validationBehavior() {
                return demoProps().validationBehavior;
              },
              get isRequired() {
                return demoProps().isRequired;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get isEmphasized() {
                return demoProps().isEmphasized;
              },
              onSubmit: (event: SubmitEvent) => event.preventDefault(),
            },
            [
              hc(SolidSpectrumTextField, {
                "data-comparison-form-field": "name",
                get label() {
                  return demoProps().label;
                },
                name: "name",
                get value() {
                  return value();
                },
                description: "Inherited from the parent form.",
                onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) => {
                  const nextValue = event.currentTarget.value;
                  setValue(nextValue);
                  setDemoProps((current: FormDemoProps) => ({
                    ...current,
                    value: nextValue,
                  }));
                },
                onChange: (nextValue: string) => {
                  setValue(nextValue);
                  setDemoProps((current: FormDemoProps) => ({
                    ...current,
                    value: nextValue,
                  }));
                },
              }),
              hc(
                SolidSpectrumButton,
                {
                  "data-comparison-form-submit": "true",
                  type: "submit",
                },
                [
                  () =>
                    h(
                      "span",
                      {
                        class: s2ButtonText({ isProgressVisible: false }),
                        "data-rsp-slot": "text",
                      },
                      demoProps().actionLabel,
                    ),
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumTextAreaDemo() {
  const [demoProps, setDemoProps] = createSignal<TextAreaDemoProps>(textAreaDemoPropsFromWindow());
  const [value, setValue] = createSignal(demoProps().value);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "textarea") {
        const nextProps = normalizeTextAreaDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() =>
    serializeTextAreaDemoProps({
      ...demoProps(),
      value: value(),
    }),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-value"() {
            return value();
          },
        },
        [
          hc(SolidSpectrumTextArea, {
            "data-comparison-control-root": "textarea",
            get "data-comparison-control-props"() {
              return serializedProps();
            },
            get label() {
              return demoProps().label;
            },
            get value() {
              return value();
            },
            get placeholder() {
              return demoProps().placeholder;
            },
            get size() {
              return demoProps().size;
            },
            get description() {
              return demoProps().description;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isRequired() {
              return demoProps().isRequired;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            onInput: (event: InputEvent & { currentTarget: HTMLTextAreaElement }) => {
              const nextValue = event.currentTarget.value;
              setValue(nextValue);
              setDemoProps((current: TextAreaDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
            onChange: (nextValue: string) => {
              setValue(nextValue);
              setDemoProps((current: TextAreaDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumNumberFieldDemo() {
  const [demoProps, setDemoProps] = createSignal<NumberFieldDemoProps>(
    numberFieldDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(demoProps().value);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "numberfield") {
        const nextProps = normalizeNumberFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() =>
    serializeNumberFieldDemoProps({
      ...demoProps(),
      value: value(),
    }),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          "data-comparison-control-root": "numberfield",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return String(value());
          },
        },
        [
          hc(SolidSpectrumNumberField, {
            get label() {
              return demoProps().label;
            },
            get value() {
              return value();
            },
            get placeholder() {
              return demoProps().placeholder;
            },
            get size() {
              return demoProps().size;
            },
            get description() {
              return demoProps().description;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get minValue() {
              return demoProps().minValue;
            },
            get maxValue() {
              return demoProps().maxValue;
            },
            get step() {
              return demoProps().step;
            },
            get hideStepper() {
              return demoProps().hideStepper;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isRequired() {
              return demoProps().isRequired;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) => {
              const nextValue = Number(event.currentTarget.value);
              if (Number.isFinite(nextValue)) {
                setValue(nextValue);
                setDemoProps((current: NumberFieldDemoProps) => ({
                  ...current,
                  value: nextValue,
                }));
              }
            },
            onChange: (nextValue: number) => {
              setValue(nextValue);
              setDemoProps((current: NumberFieldDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumPickerDemo() {
  const [demoProps, setDemoProps] = createSignal<PickerDemoProps>(pickerDemoPropsFromWindow());
  const [selectedKey, setSelectedKey] = createSignal(demoProps().selectedKey);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "picker") {
        const nextProps = normalizePickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(nextProps.selectedKey);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() =>
    serializePickerDemoProps({
      ...demoProps(),
      selectedKey: selectedKey(),
    }),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          "data-comparison-control-root": "picker",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return selectedKey();
          },
        },
        [
          hc(SolidSpectrumPicker, {
            items: pickerItems,
            getKey: (item: (typeof pickerItems)[number]) => item.id,
            getTextValue: (item: (typeof pickerItems)[number]) => item.label,
            get label() {
              return demoProps().label;
            },
            get selectedKey() {
              return selectedKey();
            },
            get placeholder() {
              return demoProps().placeholder;
            },
            get size() {
              return demoProps().size;
            },
            get description() {
              return demoProps().description;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get isQuiet() {
              return demoProps().isQuiet;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isRequired() {
              return demoProps().isRequired;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            onSelectionChange: (nextKey: unknown) => {
              const nextSelectedKey = String(nextKey);
              setSelectedKey(nextSelectedKey as PickerDemoProps["selectedKey"]);
              setDemoProps((current: PickerDemoProps) => ({
                ...current,
                selectedKey: nextSelectedKey as PickerDemoProps["selectedKey"],
              }));
            },
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumComboBoxDemo() {
  const [demoProps, setDemoProps] = createSignal<ComboBoxDemoProps>(comboBoxDemoPropsFromWindow());
  const [selectedKey, setSelectedKey] = createSignal(demoProps().selectedKey);
  const [inputValue, setInputValue] = createSignal(demoProps().inputValue);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "combobox") {
        const nextProps = normalizeComboBoxDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(nextProps.selectedKey);
        setInputValue(nextProps.inputValue);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() =>
    serializeComboBoxDemoProps({
      ...demoProps(),
      selectedKey: selectedKey(),
      inputValue: inputValue(),
    }),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          "data-comparison-control-root": "combobox",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return selectedKey();
          },
          get "data-comparison-input-value"() {
            return inputValue();
          },
        },
        [
          hc(
            SolidSpectrumComboBox,
            {
              items: comboBoxItems,
              getKey: (item: (typeof comboBoxItems)[number]) => item.id,
              getTextValue: (item: (typeof comboBoxItems)[number]) => item.label,
              get label() {
                return demoProps().label;
              },
              get selectedKey() {
                return selectedKey();
              },
              get inputValue() {
                return inputValue();
              },
              get placeholder() {
                return demoProps().placeholder;
              },
              get size() {
                return demoProps().size;
              },
              get description() {
                return demoProps().description;
              },
              get errorMessage() {
                return demoProps().errorMessage;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get isRequired() {
                return demoProps().isRequired;
              },
              get isInvalid() {
                return demoProps().isInvalid;
              },
              onSelectionChange: (nextKey: unknown) => {
                const nextSelectedKey = String(nextKey);
                setSelectedKey(nextSelectedKey as ComboBoxDemoProps["selectedKey"]);
                setInputValue(comboBoxLabelForKey(nextSelectedKey));
                setDemoProps((current: ComboBoxDemoProps) => ({
                  ...current,
                  selectedKey: nextSelectedKey as ComboBoxDemoProps["selectedKey"],
                  inputValue: comboBoxLabelForKey(nextSelectedKey),
                }));
              },
              onInputChange: (nextValue: string) => {
                setInputValue(nextValue);
                setDemoProps((current: ComboBoxDemoProps) => ({
                  ...current,
                  inputValue: nextValue,
                }));
              },
            },
            renderProp((item: (typeof comboBoxItems)[number]) =>
              hc(SolidSpectrumComboBoxItem, { id: item.id }, item.label),
            ),
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumSliderDemo() {
  const [demoProps, setDemoProps] = createSignal<SliderDemoProps>(sliderDemoPropsFromWindow());
  const [value, setValue] = createSignal(demoProps().value);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "slider") {
        const nextProps = normalizeSliderDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() =>
    serializeSliderDemoProps({
      ...demoProps(),
      value: value(),
    }),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          "data-comparison-control-root": "slider",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return String(value());
          },
        },
        [
          hc(SolidSpectrumSlider, {
            get label() {
              return demoProps().label;
            },
            get value() {
              return value();
            },
            get minValue() {
              return demoProps().minValue;
            },
            get maxValue() {
              return demoProps().maxValue;
            },
            get step() {
              return demoProps().step;
            },
            get size() {
              return demoProps().size;
            },
            get trackStyle() {
              return demoProps().trackStyle;
            },
            get thumbStyle() {
              return demoProps().thumbStyle;
            },
            get isEmphasized() {
              return demoProps().isEmphasized;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            onChange: (nextValue: number) => {
              setValue(nextValue);
              setDemoProps((current: SliderDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumSearchFieldDemo() {
  const [demoProps, setDemoProps] = createSignal<SearchFieldDemoProps>(
    searchFieldDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(demoProps().value);
  const [clearCount, setClearCount] = createSignal(0);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "searchfield") {
        const nextProps = normalizeSearchFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const serializedProps = createMemo(() =>
    serializeSearchFieldDemoProps({
      ...demoProps(),
      value: value(),
    }),
  );

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-value"() {
            return value();
          },
          get "data-comparison-clear-count"() {
            return String(clearCount());
          },
        },
        [
          hc(SolidSpectrumSearchField, {
            "data-comparison-control-root": "searchfield",
            get "data-comparison-control-props"() {
              return serializedProps();
            },
            get label() {
              return demoProps().label;
            },
            get value() {
              return value();
            },
            get placeholder() {
              return demoProps().placeholder;
            },
            get size() {
              return demoProps().size;
            },
            get description() {
              return demoProps().description;
            },
            get errorMessage() {
              return demoProps().errorMessage;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            get isReadOnly() {
              return demoProps().isReadOnly;
            },
            get isRequired() {
              return demoProps().isRequired;
            },
            get isInvalid() {
              return demoProps().isInvalid;
            },
            onInput: (event: InputEvent & { currentTarget: HTMLInputElement }) => {
              const nextValue = event.currentTarget.value;
              setValue(nextValue);
              setDemoProps((current: SearchFieldDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
            onChange: (nextValue: string) => {
              setValue(nextValue);
              setDemoProps((current: SearchFieldDemoProps) => ({
                ...current,
                value: nextValue,
              }));
            },
            onClear: () => {
              setValue("");
              setDemoProps((current: SearchFieldDemoProps) => ({
                ...current,
                value: "",
              }));
              setClearCount((count) => count + 1);
            },
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumActionButtonDemo() {
  const [actionCount, setActionCount] = createSignal(0);
  const [demoProps, setDemoProps] = createSignal(actionButtonDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbutton") {
        setDemoProps(event.detail.props as ActionButtonDemoProps);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const renderedActionButton = createMemo(() => {
    const props = demoProps();

    return hc(
      SolidSpectrumActionButton,
      {
        size: props.size,
        staticColor: props.staticColor,
        isQuiet: props.isQuiet,
        isDisabled: props.isDisabled,
        isPending: props.isPending,
        ...(props.iconPlacement === "only" ? { "aria-label": props.children } : {}),
        onPress: (_event: unknown) => {
          if (!props.isPending) {
            setActionCount((count) => count + 1);
          }
        },
      },
      solidSingleButtonFamilyChildren(props.children, props.iconPlacement, () =>
        s2ActionButtonText({ isProgressVisible: props.isPending }),
      ),
    );
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get class() {
            return staticColorBackdropClass(demoProps().staticColor, "comparison-button-row");
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
          "data-comparison-control-root": "actionbutton",
          get "data-comparison-control-props"() {
            return serializeActionButtonDemoProps(demoProps());
          },
          get "data-comparison-actionbutton-props"() {
            return serializeActionButtonDemoProps(demoProps());
          },
          get "data-comparison-actionbutton-pending"() {
            return demoProps().isPending ? "true" : undefined;
          },
        },
        [renderedActionButton],
      ),
    ],
  );
}

function SolidSpectrumActionButtonGroupDemo() {
  const [groupProps, setGroupProps] = createSignal<ActionButtonGroupDemoProps>(
    actionButtonGroupDemoPropsFromWindow(),
  );
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    selectedKeysParamFromWindow(["bold"]),
  );
  const [actionKey, setActionKey] = createSignal("");
  const selectedKeyText = createMemo(() => Array.from(selectedKeys()).join(","));
  const toggleKey = (key: string) => {
    setActionKey(key);
    setSelectedKeys(new Set([key]));
  };

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbuttongroup") {
        setGroupProps(normalizeActionButtonGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const renderedGroup = createMemo(() => {
    const props = groupProps();
    return hc(
      SolidSpectrumActionButtonGroup,
      {
        "aria-label": "Formatting actions",
        "data-comparison-group-root": "actionbuttongroup",
        "data-comparison-control-root": "actionbuttongroup",
        "data-comparison-group-props": serializeActionButtonGroupDemoProps(props),
        "data-comparison-control-props": serializeActionButtonGroupDemoProps(props),
        size: props.size,
        density: props.density,
        orientation: props.orientation,
        isQuiet: props.isQuiet,
        isJustified: props.isJustified,
        isDisabled: props.isDisabled,
        staticColor: props.staticColor,
      },
      actionItems.map((item: ActionItem) =>
        hc(
          SolidSpectrumActionButton,
          {
            "aria-label": props.iconPlacement === "only" ? item.label : undefined,
            get "aria-pressed"() {
              return selectedKeys().has(item.id);
            },
            onPress: (_event: unknown) => toggleKey(item.id),
          },
          solidSingleButtonFamilyChildren(item.label, props.iconPlacement, () =>
            s2ActionButtonText({ isProgressVisible: false }),
          ),
        ),
      ),
    );
  });

  return hc(
    SolidSpectrumProvider,
    { colorScheme: "dark", background: "base", style: providerShellStyle },
    [
      hc(
        "div",
        {
          get class() {
            return staticColorBackdropClass(groupProps().staticColor);
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(groupProps().staticColor);
          },
          get "data-comparison-action-key"() {
            return actionKey();
          },
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
        },
        [renderedGroup],
      ),
    ],
  );
}

function SolidSpectrumButtonGroupDemo() {
  const [groupProps, setGroupProps] = createSignal<ButtonGroupDemoProps>(
    buttonGroupDemoPropsFromWindow(),
  );
  const [actionKey, setActionKey] = createSignal("");

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "buttongroup") {
        setGroupProps(normalizeButtonGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const renderedGroup = createMemo(() => {
    const props = groupProps();
    return hc(
      SolidSpectrumButtonGroup,
      {
        "aria-label": "Approval actions",
        "data-comparison-group-root": "buttongroup",
        "data-comparison-control-root": "buttongroup",
        "data-comparison-group-props": serializeButtonGroupDemoProps(props),
        "data-comparison-control-props": serializeButtonGroupDemoProps(props),
        orientation: props.orientation,
        align: props.align,
        size: props.size,
        isDisabled: props.isDisabled,
        UNSAFE_style: props.wrapWidth ? { width: `${props.wrapWidth}px` } : undefined,
      },
      [
        hc(
          SolidSpectrumButton,
          {
            variant: "primary",
            "aria-label": props.iconPlacement === "only" ? "Save" : undefined,
            onPress: (_event: unknown) => setActionKey("save"),
          },
          solidSingleButtonFamilyChildren("Save", props.iconPlacement, () =>
            s2ButtonText({ isProgressVisible: false }),
          ),
        ),
        hc(
          SolidSpectrumButton,
          {
            variant: "secondary",
            "aria-label": props.iconPlacement === "only" ? "Cancel" : undefined,
            onPress: (_event: unknown) => setActionKey("cancel"),
          },
          solidSingleButtonFamilyChildren("Cancel", props.iconPlacement, () =>
            s2ButtonText({ isProgressVisible: false }),
          ),
        ),
      ],
    );
  });

  return hc(
    SolidSpectrumProvider,
    { colorScheme: "dark", background: "base", style: providerShellStyle },
    [
      hc(
        "div",
        {
          get "data-comparison-action-key"() {
            return actionKey();
          },
        },
        [renderedGroup],
      ),
    ],
  );
}

function SolidSpectrumLinkButtonDemo() {
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const [demoProps, setDemoProps] = createSignal<LinkButtonDemoProps>(
    linkButtonDemoPropsFromWindow(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "linkbutton") {
        setDemoProps(normalizeLinkButtonDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const renderedLinkButton = createMemo(() => {
    const props = demoProps();
    return hc(
      SolidSpectrumLinkButton,
      {
        "data-comparison-control-root": "linkbutton",
        "data-comparison-control-props": serializeLinkButtonDemoProps(props),
        href: props.href,
        variant: props.variant,
        fillStyle: props.fillStyle,
        size: props.size,
        staticColor: props.staticColor,
        isDisabled: props.isDisabled,
        "aria-label": props.iconPlacement === "only" ? props.children : undefined,
      },
      solidSingleButtonFamilyChildren(props.children, props.iconPlacement, () =>
        s2ButtonText({ isProgressVisible: false }),
      ),
    );
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get class() {
            return staticColorBackdropClass(demoProps().staticColor, "comparison-button-row");
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedLinkButton],
      ),
    ],
  );
}

function SolidSpectrumLinkDemo() {
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const [demoProps, setDemoProps] = createSignal<LinkDemoProps>(linkDemoPropsFromWindow());

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "link") {
        setDemoProps(normalizeLinkDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const renderedLink = createMemo(() => {
    const props = demoProps();
    return hc(
      SolidSpectrumLink,
      {
        "data-comparison-control-root": "link",
        "data-comparison-control-props": serializeLinkDemoProps(props),
        href: props.href,
        variant: props.variant,
        staticColor: props.staticColor,
        isStandalone: props.isStandalone,
        isQuiet: props.isQuiet,
      },
      [props.children],
    );
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "p",
        {
          get class() {
            return staticColorBackdropClass(demoProps().staticColor, "comparison-link-row");
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedLink],
      ),
    ],
  );
}

function SolidSpectrumToggleButtonDemo() {
  const [demoProps, setDemoProps] = createSignal<ToggleButtonDemoProps>(
    toggleButtonDemoPropsFromWindow(),
  );
  const [selected, setSelected] = createSignal(demoProps().isSelected);

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "togglebutton") {
        const nextProps = normalizeToggleButtonDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelected(nextProps.isSelected);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const renderedToggleButton = createMemo(() => {
    const props = demoProps();
    const isSelected = selected();
    return hc(
      SolidSpectrumToggleButton,
      {
        "data-comparison-control-root": "togglebutton",
        "data-comparison-control-props": serializeToggleButtonDemoProps({
          ...props,
          isSelected,
        }),
        size: props.size,
        staticColor: props.staticColor,
        isQuiet: props.isQuiet,
        isEmphasized: props.isEmphasized,
        isDisabled: props.isDisabled,
        "aria-label": props.iconPlacement === "only" ? props.children : undefined,
        isSelected,
        onChange: setSelected,
      },
      solidSingleButtonFamilyChildren(
        props.children,
        props.iconPlacement,
        () => s2ToggleButtonText,
      ),
    );
  });

  return hc(
    SolidSpectrumProvider,
    { colorScheme: "dark", background: "base", style: providerShellStyle },
    [
      hc(
        "div",
        {
          get class() {
            return staticColorBackdropClass(demoProps().staticColor);
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          get "data-comparison-selected"() {
            return String(selected());
          },
        },
        [renderedToggleButton],
      ),
    ],
  );
}

function SolidSpectrumToggleButtonGroupDemo() {
  const [groupProps, setGroupProps] = createSignal<ToggleButtonGroupDemoProps>(
    toggleButtonGroupDemoPropsFromWindow(),
  );
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    selectedToggleKeysSetFromText(groupProps().selectedKeys, ["left"], groupProps().selectionMode),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const selectedKeyText = createMemo(() => Array.from(selectedKeys()).join(","));

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "togglebuttongroup") {
        const nextProps = normalizeToggleButtonGroupDemoProps(event.detail.props ?? {});
        setGroupProps(nextProps);
        setSelectedKeys(
          selectedToggleKeysSetFromText(nextProps.selectedKeys, ["left"], nextProps.selectionMode),
        );
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const renderedGroup = createMemo(() => {
    const props = groupProps();
    const selectedText = selectedKeyText();
    const serializedProps = serializeToggleButtonGroupDemoProps({
      ...props,
      selectedKeys: selectedText,
    });

    return hc(
      SolidSpectrumToggleButtonGroup,
      {
        "aria-label": "Text alignment",
        "data-comparison-group-root": "togglebuttongroup",
        "data-comparison-control-root": "togglebuttongroup",
        "data-comparison-group-props": serializedProps,
        "data-comparison-control-props": serializedProps,
        selectionMode: props.selectionMode,
        size: props.size,
        density: props.density,
        orientation: props.orientation,
        isQuiet: props.isQuiet,
        isEmphasized: props.isEmphasized,
        isJustified: props.isJustified,
        isDisabled: props.isDisabled,
        staticColor: props.staticColor,
        selectedKeys: selectedKeys(),
        onSelectionChange: (keys: Set<string | number>) =>
          setSelectedKeys(new Set(Array.from(keys, String))),
      },
      [
        hc(
          SolidSpectrumToggleButton,
          {
            id: "left",
            "aria-label": props.iconPlacement === "only" ? "Left" : undefined,
          },
          solidSingleButtonFamilyChildren("Left", props.iconPlacement, () => s2ToggleButtonText),
        ),
        hc(
          SolidSpectrumToggleButton,
          {
            id: "center",
            "aria-label": props.iconPlacement === "only" ? "Center" : undefined,
          },
          solidSingleButtonFamilyChildren("Center", props.iconPlacement, () => s2ToggleButtonText),
        ),
        hc(
          SolidSpectrumToggleButton,
          {
            id: "right",
            "aria-label": props.iconPlacement === "only" ? "Right" : undefined,
          },
          solidSingleButtonFamilyChildren("Right", props.iconPlacement, () => s2ToggleButtonText),
        ),
      ],
    );
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get class() {
            return staticColorBackdropClass(groupProps().staticColor);
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(groupProps().staticColor);
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
        },
        [renderedGroup],
      ),
    ],
  );
}

function SolidSpectrumSegmentedControlDemo() {
  const [demoProps, setDemoProps] = createSignal<SegmentedControlDemoProps>(
    segmentedControlDemoPropsFromWindow(),
  );
  const [selectedKey, setSelectedKey] = createSignal(demoProps().selectedKey);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  let segmentedControlRoot: HTMLElement | undefined;

  createEffect(() => {
    segmentedControlRoot?.setAttribute(
      "data-comparison-control-props",
      JSON.stringify(demoProps()),
    );
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "segmentedcontrol") {
        const nextProps = normalizeSegmentedControlDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(nextProps.selectedKey);
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected-key"() {
            return selectedKey();
          },
        },
        [
          createComponent(Show, {
            get when() {
              return `${selectedKey()}|${demoProps().isJustified}|${demoProps().isDisabled}`;
            },
            keyed: true,
            children: (_key: string) =>
              hc(
                SolidSpectrumSegmentedControl,
                {
                  "aria-label": "View mode",
                  "data-comparison-control-root": "segmentedcontrol",
                  ref: (element: HTMLElement) => {
                    segmentedControlRoot = element;
                  },
                  "data-comparison-control-props": JSON.stringify(demoProps()),
                  isJustified: demoProps().isJustified,
                  isDisabled: demoProps().isDisabled,
                  selectedKey: selectedKey(),
                  onSelectionChange: (key: string | number) =>
                    setSelectedKey(String(key) as SegmentedControlKey),
                },
                [
                  hc(SolidSpectrumSegmentedControlItem, { id: "list" }, ["List"]),
                  hc(SolidSpectrumSegmentedControlItem, { id: "grid" }, ["Grid"]),
                  hc(SolidSpectrumSegmentedControlItem, { id: "board" }, ["Board"]),
                ],
              ),
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumSelectBoxGroupDemo() {
  const [demoProps, setDemoProps] = createSignal<SelectBoxGroupDemoProps>(
    selectBoxGroupDemoPropsFromWindow(),
  );
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    selectedKeysSetFromValue(demoProps().selectedKeys, ["starter"], demoProps().selectionMode),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const selectedKeyText = createMemo(() => Array.from(selectedKeys()).join(","));
  let selectBoxGroupRoot: HTMLElement | undefined;

  createEffect(() => {
    selectBoxGroupRoot?.setAttribute("data-comparison-control-props", JSON.stringify(demoProps()));
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "selectboxgroup") {
        setDemoProps((current) => {
          const nextProps = normalizeSelectBoxGroupDemoProps({
            ...current,
            ...(event.detail.props ?? {}),
          });
          setSelectedKeys(
            selectedKeysSetFromValue(nextProps.selectedKeys, ["starter"], nextProps.selectionMode),
          );
          return nextProps;
        });
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
        },
        [
          hc(
            SolidSpectrumSelectBoxGroup,
            {
              "aria-label": "Plans",
              "data-comparison-control-root": "selectboxgroup",
              ref: (element: HTMLElement) => {
                selectBoxGroupRoot = element;
              },
              get "data-comparison-control-props"() {
                return JSON.stringify(demoProps());
              },
              get orientation() {
                return demoProps().orientation;
              },
              get selectionMode() {
                return demoProps().selectionMode;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              items: selectBoxItems,
              getKey: (item: (typeof selectBoxItems)[number]) => item.id,
              getTextValue: (item: (typeof selectBoxItems)[number]) => item.label,
              get selectedKeys() {
                return selectedKeys();
              },
              onSelectionChange: (keys: "all" | Set<string | number>) =>
                setSelectedKeys(
                  keys === "all" ? new Set<string>() : new Set<string>(Array.from(keys, String)),
                ),
            },
            renderProp((item: (typeof selectBoxItems)[number]) =>
              hc(
                SolidSpectrumSelectBox,
                {
                  id: item.id,
                  textValue: item.label,
                  isDisabled: demoProps().disablePro && item.id === "pro",
                },
                [
                  ...(demoProps().withIllustrations && selectBoxIllustrationItems.has(item.id)
                    ? [
                        hc(SolidPlanIllustration, {
                          slot: "illustration",
                          size: "S",
                          "data-rsp-slot": "illustration",
                        }),
                      ]
                    : []),
                  hc("span", { slot: "label", "data-rsp-slot": "label" }, [item.label]),
                  hc("span", { slot: "description", "data-rsp-slot": "description" }, [
                    item.description,
                  ]),
                ],
              ),
            ),
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumCardViewDemo() {
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set(["apollo"]));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const selectedKeyText = createMemo(() => Array.from(selectedKeys()).join(","));

  onMount(() => {
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange));
  });

  return hc(
    SolidSpectrumProvider,
    {
      get colorScheme() {
        return colorScheme();
      },
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
        },
        [
          hc(
            SolidSpectrumCardView,
            {
              "aria-label": "Projects",
              items: cardItems,
              getKey: (item: (typeof cardItems)[number]) => item.id,
              getTextValue: (item: (typeof cardItems)[number]) => item.title,
              size: "S",
              density: "compact",
              variant: "secondary",
              selectionMode: "single",
              selectionStyle: "highlight",
              UNSAFE_style: cardViewDemoStyle,
              get selectedKeys() {
                return selectedKeys();
              },
              onSelectionChange: (keys: "all" | Set<string | number>) =>
                setSelectedKeys(
                  keys === "all" ? new Set<string>() : new Set<string>(Array.from(keys, String)),
                ),
            },
            renderProp((item: (typeof cardItems)[number]) =>
              hc(SolidSpectrumCard, {}, [
                hc("strong", {}, [item.title]),
                " ",
                hc("span", {}, [item.status]),
              ]),
            ),
          ),
        ],
      ),
    ],
  );
}

const providerShellStyle = {
  padding: 0,
  background: "transparent",
};

const cardViewDemoStyle = {
  width: "360px",
  height: "180px",
};

const nestedProviderStyle = {
  padding: "16px",
  margin: "16px 0 0",
  "border-radius": "16px",
};
