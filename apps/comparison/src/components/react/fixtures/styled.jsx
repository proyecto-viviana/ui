import { jsx, jsxs } from "react/jsx-runtime";
import { Fragment, useEffect, useRef, useState } from "react";
import {
  Accordion as SpectrumAccordion,
  AccordionItem as SpectrumAccordionItem,
  AccordionItemHeader as SpectrumAccordionItemHeader,
  AccordionItemPanel as SpectrumAccordionItemPanel,
  AccordionItemTitle as SpectrumAccordionItemTitle,
  ActionBar as SpectrumActionBar,
  ActionButton as SpectrumActionButton,
  ActionButtonGroup as SpectrumActionButtonGroup,
  ActionMenu as SpectrumActionMenu,
  Avatar as SpectrumAvatar,
  AvatarGroup as SpectrumAvatarGroup,
  Badge as SpectrumBadge,
  Breadcrumb as SpectrumBreadcrumb,
  Breadcrumbs as SpectrumBreadcrumbs,
  Button as SpectrumButton,
  ButtonGroup as SpectrumButtonGroup,
  Calendar as SpectrumCalendar,
  Card as SpectrumCard,
  CardPreview as SpectrumCardPreview,
  CardView as SpectrumCardView,
  Checkbox as SpectrumCheckbox,
  CheckboxGroup as SpectrumCheckboxGroup,
  ComboBox as SpectrumComboBox,
  ComboBoxItem as SpectrumComboBoxItem,
  ContextualHelp as SpectrumContextualHelp,
  Content as SpectrumContent,
  DateRangePicker as SpectrumDateRangePicker,
  DatePicker as SpectrumDatePicker,
  Dialog as SpectrumDialog,
  DialogTrigger as SpectrumDialogTrigger,
  Divider as SpectrumDivider,
  DropZone as SpectrumDropZone,
  Footer as SpectrumFooter,
  Form as SpectrumForm,
  Heading as SpectrumHeading,
  Image as SpectrumImage,
  ImageCoordinator as SpectrumImageCoordinator,
  IllustratedMessage as SpectrumIllustratedMessage,
  InlineAlert as SpectrumInlineAlert,
  Keyboard as SpectrumKeyboard,
  Link as SpectrumLink,
  LinkButton as SpectrumLinkButton,
  ListView as SpectrumListView,
  ListViewItem as SpectrumListViewItem,
  Meter as SpectrumMeter,
  Menu as SpectrumMenu,
  MenuItem as SpectrumMenuItem,
  MenuTrigger as SpectrumMenuTrigger,
  NumberField as SpectrumNumberField,
  Picker as SpectrumPicker,
  PickerItem as SpectrumPickerItem,
  Provider as SpectrumProvider,
  Radio as SpectrumRadio,
  RadioGroup as SpectrumRadioGroup,
  RangeCalendar as SpectrumRangeCalendar,
  SearchField as SpectrumSearchField,
  Skeleton as SpectrumSkeleton,
  Slider as SpectrumSlider,
  StatusLight as SpectrumStatusLight,
  Switch as SpectrumSwitch,
  SegmentedControl as SpectrumSegmentedControl,
  SegmentedControlItem as SpectrumSegmentedControlItem,
  SelectBox as SpectrumSelectBox,
  SelectBoxGroup as SpectrumSelectBoxGroup,
  Tab as SpectrumTab,
  TabList as SpectrumTabList,
  TabPanel as SpectrumTabPanel,
  Tabs as SpectrumTabs,
  Text as SpectrumText,
  TextArea as SpectrumTextArea,
  TextField as SpectrumTextField,
  TimeField as SpectrumTimeField,
  Tooltip as SpectrumTooltip,
  TooltipTrigger as SpectrumTooltipTrigger,
  ToastContainer as SpectrumToastContainer,
  ToastQueue as SpectrumToastQueue,
  ToggleButton as SpectrumToggleButton,
  ToggleButtonGroup as SpectrumToggleButtonGroup,
  createIcon,
  createIllustration,
} from "@react-spectrum/s2";
import {
  ColorArea as SpectrumColorArea,
  parseColor as spectrumParseColor,
} from "@react-spectrum/s2/ColorArea";
import { ColorField as SpectrumColorField } from "@react-spectrum/s2/ColorField";
import {
  ColorSlider as SpectrumColorSlider,
  parseColor as spectrumParseSliderColor,
} from "@react-spectrum/s2/ColorSlider";
import {
  ColorWheel as SpectrumColorWheel,
  parseColor as spectrumParseWheelColor,
} from "@react-spectrum/s2/ColorWheel";
import {
  Disclosure as SpectrumDisclosure,
  DisclosureHeader as SpectrumDisclosureHeader,
  DisclosurePanel as SpectrumDisclosurePanel,
  DisclosureTitle as SpectrumDisclosureTitle,
} from "@react-spectrum/s2/Disclosure";
import { ColorSwatch as SpectrumColorSwatch } from "@react-spectrum/s2/ColorSwatch";
import {
  ColorSwatchPicker as SpectrumColorSwatchPicker,
  ColorSwatch as SpectrumPickerColorSwatch,
} from "@react-spectrum/s2/ColorSwatchPicker";
import { DateField as SpectrumDateField } from "@react-spectrum/s2/DateField";
import "@react-spectrum/s2/page.css";
import {
  accordionDemoLocaleFromWindow,
  accordionDemoPropsFromWindow,
  normalizeAccordionDemoProps,
  serializeAccordionKeys,
  serializeAccordionDemoProps,
} from "@comparison/data/accordion-demo";
import {
  disclosureDemoLocaleFromWindow,
  disclosureDemoPropsFromWindow,
  normalizeDisclosureDemoProps,
  serializeDisclosureDemoProps,
} from "@comparison/data/disclosure-demo";
import {
  actionBarCollectionItems,
  actionBarDemoPropsFromWindow,
  actionBarSelectedKeysFromCount,
  normalizeActionBarDemoProps,
  serializeActionBarDemoProps,
  serializeActionBarSelectedKeys,
} from "@comparison/data/actionbar-demo";
import {
  actionMenuDemoPropsFromWindow,
  actionMenuItems,
  normalizeActionMenuDemoProps,
  serializeActionMenuDemoProps,
} from "@comparison/data/actionmenu-demo";
import {
  actionButtonDemoPropsFromWindow,
  comparisonControlsEvent as actionButtonControlsEvent,
  serializeActionButtonDemoProps,
} from "@comparison/data/actionbutton-demo";
import {
  avatarDemoPropsFromWindow,
  normalizeAvatarDemoProps,
  serializeAvatarDemoProps,
} from "@comparison/data/avatar-demo";
import {
  avatarGroupDemoPropsFromWindow,
  avatarGroupItems,
  normalizeAvatarGroupDemoProps,
  serializeAvatarGroupDemoProps,
} from "@comparison/data/avatar-group-demo";
import {
  badgeDemoPropsFromWindow,
  normalizeBadgeDemoProps,
  serializeBadgeDemoProps,
} from "@comparison/data/badge-demo";
import {
  breadcrumbsDemoPropsFromWindow,
  breadcrumbsItemsForSet,
  normalizeBreadcrumbsDemoProps,
  serializeBreadcrumbPath,
  serializeBreadcrumbsDemoProps,
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
} from "@comparison/data/calendar-demo";
import {
  comparisonActionItems as actionItems,
  comparisonTabItems as tabItems,
} from "@comparison/data/comparison-contract";
import {
  buttonDemoLocaleFromWindow,
  buttonDemoPropsFromWindow,
  comparisonControlsEvent,
  serializeButtonDemoProps,
} from "@comparison/data/button-demo";
import {
  checkboxDemoPropsFromWindow,
  initialCheckboxDemoSelected,
  normalizeCheckboxDemoProps,
  serializeCheckboxDemoProps,
} from "@comparison/data/checkbox-demo";
import {
  checkboxGroupDemoPropsFromWindow,
  initialCheckboxGroupDemoValue,
  normalizeCheckboxGroupDemoProps,
  serializeCheckboxGroupDemoProps,
} from "@comparison/data/checkboxgroup-demo";
import {
  colorAreaDemoDefaults,
  colorAreaDemoPropsFromWindow,
  comparisonControlsEvent as colorAreaControlsEvent,
  initialColorAreaDemoValue,
  normalizeColorAreaDemoProps,
  serializeColorAreaDemoProps,
} from "@comparison/data/colorarea-demo";
import {
  colorSliderEffectiveColorSpace,
  colorSliderDemoDefaults,
  colorSliderDemoPropsFromWindow,
  comparisonControlsEvent as colorSliderControlsEvent,
  initialColorSliderDemoValue,
  normalizeColorSliderDemoProps,
  serializeColorSliderDemoProps,
} from "@comparison/data/colorslider-demo";
import {
  colorWheelDemoDefaults,
  colorWheelDemoPropsFromWindow,
  colorWheelDemoSizeNumber,
  comparisonControlsEvent as colorWheelControlsEvent,
  initialColorWheelDemoValue,
  normalizeColorWheelDemoProps,
  serializeColorWheelDemoProps,
} from "@comparison/data/colorwheel-demo";
import {
  colorSwatchDemoPropsFromWindow,
  comparisonControlsEvent as colorSwatchControlsEvent,
  normalizeColorSwatchDemoProps,
  serializeColorSwatchDemoProps,
} from "@comparison/data/colorswatch-demo";
import {
  colorSwatchPickerDemoPropsFromWindow,
  colorSwatchPickerPalette,
  initialColorSwatchPickerDemoValue,
  normalizeColorSwatchPickerDemoProps,
  serializeColorSwatchPickerDemoProps,
} from "@comparison/data/colorswatchpicker-demo";
import {
  colorFieldDemoDefaults,
  colorFieldDemoPropsFromWindow,
  initialColorFieldDemoValue,
  normalizeColorFieldDemoProps,
  serializeColorFieldDemoProps,
} from "@comparison/data/colorfield-demo";
import {
  normalizeRadioGroupDemoProps,
  radioGroupDemoPropsFromWindow,
  serializeRadioGroupDemoProps,
} from "@comparison/data/radiogroup-demo";
import {
  initialSegmentedControlSelectedKey,
  normalizeSegmentedControlDemoProps,
  segmentedControlDemoPropsFromWindow,
  segmentedControlItems,
  serializeSegmentedControlDemoProps,
} from "@comparison/data/segmentedcontrol-demo";
import {
  initialSelectBoxGroupSelectedKeys,
  normalizeSelectBoxGroupDemoProps,
  selectBoxGroupDemoPropsFromWindow,
  selectBoxGroupIllustrationItemIds,
  selectBoxGroupItems,
  selectBoxGroupKeysFromValue,
  serializeSelectBoxGroupDemoProps,
  serializeSelectBoxGroupKeys,
} from "@comparison/data/selectboxgroup-demo";
import {
  normalizeNumberFieldDemoProps,
  numberFieldDemoPropsFromWindow,
  serializeNumberFieldDemoProps,
} from "@comparison/data/numberfield-demo";
import {
  normalizePickerDemoProps,
  pickerDemoPropsFromWindow,
  pickerItems,
  serializePickerDemoProps,
} from "@comparison/data/picker-demo";
import {
  comboBoxDemoPropsFromWindow,
  comboBoxItems,
  comboBoxLabelForKey,
  normalizeComboBoxDemoProps,
  serializeComboBoxDemoProps,
} from "@comparison/data/combobox-demo";
import {
  dateFieldMaxValue,
  dateFieldMinValue,
  dateFieldDemoPropsFromWindow,
  dateFieldValueFromDemo,
  isDateFieldDateUnavailable,
  isDateFieldDemoValueInvalid,
  normalizeDateFieldDemoProps,
  serializeDateFieldDemoProps,
  serializeDateFieldValue,
} from "@comparison/data/datefield-demo";
import {
  timeFieldMaxValue,
  timeFieldMinValue,
  timeFieldDemoPropsFromWindow,
  timeFieldValueFromDemo,
  isTimeFieldDemoValueInvalid,
  normalizeTimeFieldDemoProps,
  serializeTimeFieldDemoProps,
  serializeTimeFieldValue,
} from "@comparison/data/timefield-demo";
import {
  datePickerMaxValue,
  datePickerMinValue,
  datePickerDemoPropsFromWindow,
  datePickerValueFromDemo,
  isDatePickerDateUnavailable,
  normalizeDatePickerDemoProps,
  serializeDatePickerDemoProps,
  serializeDatePickerValue,
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
} from "@comparison/data/rangecalendar-demo";
import {
  dividerDemoPropsFromWindow,
  normalizeDividerDemoProps,
  serializeDividerDemoProps,
} from "@comparison/data/divider-demo";
import {
  dropZoneDemoPropsFromWindow,
  normalizeDropZoneDemoProps,
  serializeDropZoneDemoProps,
} from "@comparison/data/dropzone-demo";
import {
  illustratedMessageDemoPropsFromWindow,
  normalizeIllustratedMessageDemoProps,
  serializeIllustratedMessageDemoProps,
} from "@comparison/data/illustratedmessage-demo";
import {
  inlineAlertDemoPropsFromWindow,
  normalizeInlineAlertDemoProps,
  serializeInlineAlertDemoProps,
} from "@comparison/data/inlinealert-demo";
import {
  dialogDemoPropsFromWindow,
  normalizeDialogDemoProps,
  serializeDialogDemoProps,
} from "@comparison/data/dialog-demo";
import {
  imageDemoPropsFromWindow,
  imageMissingSource,
  imageDemoSources,
  normalizeImageDemoProps,
  serializeImageDemoProps,
} from "@comparison/data/image-demo";
import {
  formDemoPropsFromWindow,
  normalizeFormDemoProps,
  serializeFormDemoProps,
} from "@comparison/data/form-demo";
import {
  linkDemoPropsFromWindow,
  normalizeLinkDemoProps,
  serializeLinkDemoProps,
} from "@comparison/data/link-demo";
import {
  defaultMenuSelectedKeys,
  menuDemoPropsFromWindow,
  menuItems,
  normalizeMenuDemoProps,
  serializeMenuDemoProps,
  serializeMenuSelectedKeys,
} from "@comparison/data/menu-demo";
import {
  meterDemoPropsFromWindow,
  normalizeMeterDemoProps,
  serializeMeterDemoProps,
} from "@comparison/data/meter-demo";
import {
  normalizeTextFieldDemoProps,
  serializeTextFieldDemoProps,
  textFieldDemoPropsFromWindow,
} from "@comparison/data/textfield-demo";
import {
  normalizeTextAreaDemoProps,
  serializeTextAreaDemoProps,
  textAreaDemoPropsFromWindow,
} from "@comparison/data/textarea-demo";
import {
  normalizeSearchFieldDemoProps,
  searchFieldDemoPropsFromWindow,
  serializeSearchFieldDemoProps,
} from "@comparison/data/searchfield-demo";
import {
  initialSliderDemoValue,
  normalizeSliderDemoProps,
  serializeSliderDemoProps,
  sliderDemoPropsFromWindow,
} from "@comparison/data/slider-demo";
import {
  normalizeSkeletonDemoProps,
  serializeSkeletonDemoProps,
  skeletonDemoPropsFromWindow,
} from "@comparison/data/skeleton-demo";
import {
  normalizeStatusLightDemoProps,
  serializeStatusLightDemoProps,
  statusLightDemoPropsFromWindow,
} from "@comparison/data/statuslight-demo";
import {
  normalizeSwitchDemoProps,
  serializeSwitchDemoProps,
  switchDemoPropsFromWindow,
} from "@comparison/data/switch-demo";
import {
  contextualHelpDemoPropsFromWindow,
  isContextualHelpOpenControlChecked,
  normalizeContextualHelpDemoProps,
  serializeContextualHelpDemoProps,
} from "@comparison/data/contextualhelp-demo";
import {
  isTooltipOpenControlChecked,
  normalizeTooltipDemoProps,
  serializeTooltipDemoProps,
  tooltipDemoPropsFromWindow,
} from "@comparison/data/tooltip-demo";
import {
  normalizeToastDemoProps,
  serializeToastDemoProps,
  toastDemoPropsFromWindow,
} from "@comparison/data/toast-demo";
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
} from "@comparison/data/button-family-demo";
import {
  comparisonThemeChangeEvent,
  getComparisonResolvedThemeFromDocument,
} from "@comparison/data/theme";

const ReactButtonIcon = createIcon((props) =>
  jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    width: "20",
    height: "20",
    viewBox: "0 0 20 20",
    ...props,
    children: [
      jsx("path", {
        d: "m18,4.25v11.5c0,1.24072-1.00928,2.25-2.25,2.25H4.25c-1.24072,0-2.25-1.00928-2.25-2.25V4.25c0-1.24072,1.00928-2.25,2.25-2.25h11.5c1.24072,0,2.25,1.00928,2.25,2.25Zm-1.5,0c0-.41357-.33643-.75-.75-.75H4.25c-.41357,0-.75.33643-.75.75v11.5c0,.41357.33643.75.75.75h11.5c.41357,0,.75-.33643.75-.75V4.25Z",
        fill: "var(--iconPrimary, #222)",
      }),
      jsx("path", {
        d: "m13.76318,10c0,.42139-.3418.76318-.76318.76318h-2.23682v2.23682c0,.42139-.3418.76318-.76318.76318s-.76318-.3418-.76318-.76318v-2.23682h-2.23682c-.42139,0-.76318-.3418-.76318-.76318s.3418-.76318.76318-.76318h2.23682v-2.23682c0-.42139.3418-.76318.76318-.76318s.76318.3418.76318.76318v2.23682h2.23682c.42139,0,.76318.3418.76318.76318Z",
        fill: "var(--iconPrimary, #222)",
      }),
    ],
  }),
);

function explicitStaticColor(staticColor) {
  return staticColor === "black" || staticColor === "white" ? staticColor : undefined;
}

function staticColorBackdropProps(staticColor, className = "") {
  const staticBackdrop = explicitStaticColor(staticColor);
  const classes = [className, staticBackdrop ? "comparison-static-color-backdrop" : undefined]
    .filter(Boolean)
    .join(" ");

  return {
    className: classes || undefined,
    "data-comparison-static-color": staticBackdrop,
  };
}

const ReactPlanIllustration = createIllustration((props) =>
  jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    ...props,
    children: [
      jsx("rect", {
        x: "6",
        y: "10",
        width: "36",
        height: "28",
        rx: "7",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.16",
      }),
      jsx("path", {
        d: "M15 31V19h18v12H15Zm3-3h12v-6H18v6Z",
        fill: "var(--iconPrimary, #222)",
      }),
      jsx("circle", {
        cx: "17",
        cy: "15",
        r: "3",
        fill: "var(--iconPrimary, #222)",
      }),
      jsx("circle", {
        cx: "31",
        cy: "35",
        r: "3",
        fill: "var(--iconPrimary, #222)",
      }),
    ],
  }),
);

const ReactDropZoneIllustration = createIllustration((props) =>
  jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    ...props,
    children: [
      jsx("path", {
        d: "M24 8 12 20h7v11h10V20h7L24 8Z",
        fill: "var(--iconPrimary, #222)",
      }),
      jsx("path", {
        d: "M12 34h24v4H12v-4Z",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.42",
      }),
      jsx("path", {
        d: "M8 28h6v4H8c-2.2 0-4-1.8-4-4V14c0-2.2 1.8-4 4-4h6v4H8v14Zm26-18h6c2.2 0 4 1.8 4 4v14c0 2.2-1.8 4-4 4h-6v-4h6V14h-6v-4Z",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.18",
      }),
    ],
  }),
);

const ReactIllustratedMessageIllustration = createIllustration((props) =>
  jsxs("svg", {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 48 48",
    ...props,
    children: [
      jsx("rect", {
        x: "7",
        y: "11",
        width: "34",
        height: "28",
        rx: "6",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.14",
      }),
      jsx("path", {
        d: "M16 18h16v4H16v-4Zm0 8h11v4H16v-4Z",
        fill: "var(--iconPrimary, #222)",
      }),
      jsx("path", {
        d: "M31 29 37 23l3 3-9 9-5-5 3-3 2 2Z",
        fill: "var(--iconPrimary, #222)",
      }),
    ],
  }),
);

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

const cardItems = [
  { id: "apollo", title: "Apollo", status: "Active" },
  { id: "zephyr", title: "Zephyr", status: "Queued" },
];

const cardPreviewImageSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%232c7be5'/%3E%3Cpath d='M0 132 82 74l68 42 62-58 108 96v26H0z' fill='%23d6e9ff' opacity='.9'/%3E%3Ccircle cx='248' cy='48' r='24' fill='%23fff3b0'/%3E%3C/svg%3E";

const actionBarItems = [
  { id: "edit", label: "Edit" },
  { id: "copy", label: "Copy" },
  { id: "delete", label: "Delete" },
];

function queryParamFromWindow(name) {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get(name);
}

function selectedKeysParamFromWindow(fallback) {
  const value = queryParamFromWindow("selectedKeys");
  return new Set(value ? value.split(",").filter(Boolean) : fallback);
}

export const reactStyledFixtures = {
  provider: renderProviderDemo,
  accordion: () => jsx(ReactAccordionDemo, {}),
  disclosure: () => jsx(ReactDisclosureDemo, {}),
  actionbar: () => jsx(ReactActionBarDemo, {}),
  actionmenu: () => jsx(ReactActionMenuDemo, {}),
  button: () => jsx(ReactButtonDemo, {}),
  actionbutton: () => jsx(ReactActionButtonDemo, {}),
  actionbuttongroup: () => jsx(ReactActionButtonGroupDemo, {}),
  avatar: () => jsx(ReactAvatarDemo, {}),
  avatargroup: () => jsx(ReactAvatarGroupDemo, {}),
  badge: () => jsx(ReactBadgeDemo, {}),
  breadcrumbs: () => jsx(ReactBreadcrumbsDemo, {}),
  buttongroup: () => jsx(ReactButtonGroupDemo, {}),
  calendar: () => jsx(ReactCalendarDemo, {}),
  card: () => jsx(ReactCardDemo, {}),
  linkbutton: () => jsx(ReactLinkButtonDemo, {}),
  togglebutton: () => jsx(ReactToggleButtonDemo, {}),
  togglebuttongroup: () => jsx(ReactToggleButtonGroupDemo, {}),
  tabs: renderTabsDemo,
  textarea: () => jsx(ReactTextAreaDemo, {}),
  textfield: () => jsx(ReactTextFieldDemo, {}),
  checkbox: () => jsx(ReactCheckboxDemo, {}),
  checkboxgroup: () => jsx(ReactCheckboxGroupDemo, {}),
  colorarea: () => jsx(ReactColorAreaDemo, {}),
  colorslider: () => jsx(ReactColorSliderDemo, {}),
  colorwheel: () => jsx(ReactColorWheelDemo, {}),
  colorswatch: () => jsx(ReactColorSwatchDemo, {}),
  colorswatchpicker: () => jsx(ReactColorSwatchPickerDemo, {}),
  colorfield: () => jsx(ReactColorFieldDemo, {}),
  combobox: () => jsx(ReactComboBoxDemo, {}),
  contextualhelp: () => jsx(ReactContextualHelpDemo, {}),
  divider: () => jsx(ReactDividerDemo, {}),
  dropzone: () => jsx(ReactDropZoneDemo, {}),
  illustratedmessage: () => jsx(ReactIllustratedMessageDemo, {}),
  inlinealert: () => jsx(ReactInlineAlertDemo, {}),
  image: () => jsx(ReactImageDemo, {}),
  form: () => jsx(ReactFormDemo, {}),
  link: () => jsx(ReactLinkDemo, {}),
  meter: () => jsx(ReactMeterDemo, {}),
  menu: () => jsx(ReactMenuDemo, {}),
  numberfield: () => jsx(ReactNumberFieldDemo, {}),
  picker: () => jsx(ReactPickerDemo, {}),
  radiogroup: () => jsx(ReactRadioGroupDemo, {}),
  dialog: () => jsx(ReactDialogDemo, {}),
  datefield: () => jsx(ReactDateFieldDemo, {}),
  timefield: () => jsx(ReactTimeFieldDemo, {}),
  daterangepicker: () => jsx(ReactDateRangePickerDemo, {}),
  datepicker: () => jsx(ReactDatePickerDemo, {}),
  rangecalendar: () => jsx(ReactRangeCalendarDemo, {}),
  searchfield: () => jsx(ReactSearchFieldDemo, {}),
  skeleton: () => jsx(ReactSkeletonDemo, {}),
  switch: () => jsx(ReactSwitchDemo, {}),
  statuslight: () => jsx(ReactStatusLightDemo, {}),
  cardview: () => jsx(ReactCardViewDemo, {}),
  segmentedcontrol: () => jsx(ReactSegmentedControlDemo, {}),
  selectboxgroup: () => jsx(ReactSelectBoxGroupDemo, {}),
  slider: () => jsx(ReactSliderDemo, {}),
  tooltip: () => jsx(ReactTooltipDemo, {}),
  toast: () => jsx(ReactToastDemo, {}),
};

function renderProviderDemo() {
  return jsx(SpectrumProvider, {
    colorScheme: "dark",
    background: "base",
    UNSAFE_style: providerShellStyle,
    children: jsxs("div", {
      className: "comparison-provider-stack",
      children: [
        jsx("div", {
          className: "comparison-provider-caption",
          children: "Outer provider: dark / medium scale",
        }),
        jsx(SpectrumButton, {
          variant: "primary",
          children: "Inherited Action",
        }),
        jsxs(SpectrumProvider, {
          colorScheme: "light",
          background: "base",
          UNSAFE_style: nestedProviderStyle,
          children: [
            jsx("div", {
              className: "comparison-provider-caption",
              children: "Nested provider: local light override",
            }),
            jsx(SpectrumButton, {
              variant: "accent",
              children: "Nested Override",
            }),
          ],
        }),
      ],
    }),
  });
}

function renderReactSpectrumReference(children, colorScheme = "dark", locale = void 0) {
  return jsx(SpectrumProvider, {
    colorScheme,
    locale,
    background: "base",
    UNSAFE_style: providerShellStyle,
    children,
  });
}

function ReactActionBarDemo() {
  const [demoProps, setDemoProps] = useState(actionBarDemoPropsFromWindow);
  const [collectionSelectedKeys, setCollectionSelectedKeys] = useState(() =>
    actionBarSelectedKeysFromCount(actionBarDemoPropsFromWindow().selectedItemCount),
  );
  const [isCleared, setIsCleared] = useState(false);
  const [clearCount, setClearCount] = useState(0);
  const [actionCount, setActionCount] = useState(0);
  const scrollRef = useRef(null);
  const directSelectedItemCount = isCleared ? 0 : demoProps.selectedItemCount;
  const collectionSelectedCount = collectionSelectedKeys.size;
  const selectedItemCount = demoProps.useCollection
    ? collectionSelectedCount
    : directSelectedItemCount;

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbar") {
        const nextProps = normalizeActionBarDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setCollectionSelectedKeys(actionBarSelectedKeysFromCount(nextProps.selectedItemCount));
        setIsCleared(false);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const actionBarChildren = () =>
    actionBarItems.map((item) =>
      jsxs(
        SpectrumActionButton,
        {
          onPress: () => setActionCount((count) => count + 1),
          children: [
            jsx(ReactButtonIcon, { "aria-hidden": "true" }),
            jsx(SpectrumText, { children: item.label }),
          ],
        },
        item.id,
      ),
    );

  const actionBar = jsx(SpectrumActionBar, {
    selectedItemCount,
    isEmphasized: demoProps.isEmphasized,
    scrollRef: demoProps.useScrollRef ? scrollRef : undefined,
    "data-comparison-actionbar-root": "true",
    onClearSelection: () => {
      setClearCount((count) => count + 1);
      setIsCleared(true);
    },
    children: actionBarChildren(),
  });
  const collection = jsx(SpectrumListView, {
    "aria-label": "Documents",
    selectionMode: "multiple",
    selectedKeys: collectionSelectedKeys,
    onSelectionChange: (keys) =>
      setCollectionSelectedKeys(
        keys === "all" ? actionBarSelectedKeysFromCount("all") : new Set(keys),
      ),
    renderActionBar: () =>
      jsx(SpectrumActionBar, {
        isEmphasized: demoProps.isEmphasized,
        "data-comparison-actionbar-root": "true",
        children: actionBarChildren(),
      }),
    UNSAFE_className: "comparison-actionbar-collection-list",
    UNSAFE_style: { height: 220 },
    children: actionBarCollectionItems.map((item) =>
      jsx(
        SpectrumListViewItem,
        {
          id: item.id,
          textValue: item.label,
          children: jsxs(Fragment, {
            children: [
              jsx(SpectrumText, { children: item.label }),
              jsx(SpectrumText, { slot: "description", children: item.description }),
            ],
          }),
        },
        item.id,
      ),
    ),
  });

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-actionbar-row",
      "data-comparison-control-root": "actionbar",
      "data-comparison-control-props": serializeActionBarDemoProps(demoProps),
      "data-comparison-actionbar-props": serializeActionBarDemoProps(demoProps),
      "data-comparison-selected-count": String(selectedItemCount),
      "data-comparison-clear-count": String(clearCount),
      "data-comparison-action-count": String(actionCount),
      "data-comparison-actionbar-scroll-ref": String(demoProps.useScrollRef),
      "data-comparison-actionbar-collection": String(demoProps.useCollection),
      "data-comparison-selected-keys": demoProps.useCollection
        ? serializeActionBarSelectedKeys(collectionSelectedKeys)
        : "",
      children: demoProps.useCollection
        ? collection
        : demoProps.useScrollRef
          ? jsxs("div", {
              ref: scrollRef,
              className: "comparison-actionbar-scroll-shell",
              "data-comparison-actionbar-scroll-shell": "true",
              children: [
                jsx("div", {
                  className: "comparison-actionbar-scroll-content",
                  children: actionBarItems.map((item) =>
                    jsx("span", { children: item.label }, `scroll-${item.id}`),
                  ),
                }),
                actionBar,
              ],
            })
          : actionBar,
    }),
  );
}

function ReactActionMenuDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(actionMenuDemoPropsFromWindow);
  const [actionCount, setActionCount] = useState(0);
  const [lastAction, setLastAction] = useState("");
  const [openChangeCount, setOpenChangeCount] = useState(0);
  const [lastOpenState, setLastOpenState] = useState("false");

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionmenu") {
        setDemoProps(normalizeActionMenuDemoProps(event.detail.props ?? {}));
        setActionCount(0);
        setLastAction("");
        setOpenChangeCount(0);
        setLastOpenState("false");
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-actionmenu-row",
      "data-comparison-control-root": "actionmenu",
      "data-comparison-control-props": serializeActionMenuDemoProps(demoProps),
      "data-comparison-actionmenu-props": serializeActionMenuDemoProps(demoProps),
      "data-comparison-action-count": String(actionCount),
      "data-comparison-last-action": lastAction,
      "data-comparison-open-change-count": String(openChangeCount),
      "data-comparison-last-open-state": lastOpenState,
      children: jsx(SpectrumActionMenu, {
        size: demoProps.size,
        menuSize: demoProps.menuSize,
        align: demoProps.align,
        direction: demoProps.direction,
        shouldFlip: demoProps.shouldFlip,
        isQuiet: demoProps.isQuiet,
        isDisabled: demoProps.isDisabled,
        onAction: (key) => {
          setActionCount((count) => count + 1);
          setLastAction(String(key));
        },
        onOpenChange: (isOpen) => {
          setOpenChangeCount((count) => count + 1);
          setLastOpenState(String(isOpen));
        },
        children: actionMenuItems.map((item) =>
          jsxs(
            SpectrumMenuItem,
            {
              id: item.id,
              textValue: item.label,
              children: [
                jsx(ReactButtonIcon, { "aria-hidden": "true" }),
                jsx(SpectrumText, { slot: "label", children: item.label }),
                jsx(SpectrumText, { slot: "description", children: item.description }),
                jsx(SpectrumKeyboard, { children: item.shortcut }),
              ],
            },
            item.id,
          ),
        ),
      }),
    }),
    colorScheme,
  );
}

function ReactMenuDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(menuDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() =>
    defaultMenuSelectedKeys(menuDemoPropsFromWindow().selectionMode),
  );
  const [actionCount, setActionCount] = useState(0);
  const [lastAction, setLastAction] = useState("");
  const [openChangeCount, setOpenChangeCount] = useState(0);
  const [lastOpenState, setLastOpenState] = useState("false");
  const [selectionChangeCount, setSelectionChangeCount] = useState(0);

  useEffect(() => {
    const handleControlsChange = (event) => {
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
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const handleSelectionChange = (keys) => {
    const nextKeys =
      keys === "all"
        ? new Set(menuItems.map((item) => item.id))
        : new Set(Array.from(keys).map(String));
    setSelectedKeys(nextKeys);
    setSelectionChangeCount((count) => count + 1);
  };
  const selectionProps =
    demoProps.selectionMode === "none"
      ? {}
      : {
          selectionMode: demoProps.selectionMode,
          selectedKeys,
          onSelectionChange: handleSelectionChange,
        };

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-menu-row",
      "data-comparison-control-root": "menu",
      "data-comparison-control-props": serializeMenuDemoProps(demoProps),
      "data-comparison-menu-props": serializeMenuDemoProps(demoProps),
      "data-comparison-action-count": String(actionCount),
      "data-comparison-last-action": lastAction,
      "data-comparison-open-change-count": String(openChangeCount),
      "data-comparison-last-open-state": lastOpenState,
      "data-comparison-selection-change-count": String(selectionChangeCount),
      "data-comparison-selected-keys": serializeMenuSelectedKeys(selectedKeys),
      children: jsxs(SpectrumMenuTrigger, {
        align: demoProps.align,
        direction: demoProps.direction,
        shouldFlip: demoProps.shouldFlip,
        onOpenChange: (isOpen) => {
          setOpenChangeCount((count) => count + 1);
          setLastOpenState(String(isOpen));
        },
        children: [
          jsx(SpectrumActionButton, {
            size: demoProps.triggerSize,
            isDisabled: demoProps.isDisabled,
            "aria-label": "Layer actions",
            children: "Layer actions",
          }),
          jsx(SpectrumMenu, {
            size: demoProps.size,
            "aria-label": "Layer actions",
            onAction: (key) => {
              setActionCount((count) => count + 1);
              setLastAction(String(key));
            },
            ...selectionProps,
            children: menuItems.map((item) =>
              jsxs(
                SpectrumMenuItem,
                {
                  id: item.id,
                  textValue: item.label,
                  children: [
                    jsx(ReactButtonIcon, { "aria-hidden": "true" }),
                    jsx(SpectrumText, { slot: "label", children: item.label }),
                    jsx(SpectrumText, { slot: "description", children: item.description }),
                    jsx(SpectrumKeyboard, { children: item.shortcut }),
                  ],
                },
                item.id,
              ),
            ),
          }),
        ],
      }),
    }),
    colorScheme,
  );
}

function ReactBreadcrumbsDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(breadcrumbsDemoPropsFromWindow);
  const [pathItems, setPathItems] = useState(() =>
    breadcrumbsItemsForSet(breadcrumbsDemoPropsFromWindow().itemSet),
  );
  const [actionCount, setActionCount] = useState(0);
  const [lastAction, setLastAction] = useState("");

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "breadcrumbs") {
        const nextProps = normalizeBreadcrumbsDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setPathItems(breadcrumbsItemsForSet(nextProps.itemSet));
        setActionCount(0);
        setLastAction("");
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const handleAction = (key) => {
    const nextKey = String(key);
    const sourceItems = breadcrumbsItemsForSet(demoProps.itemSet);
    const index = sourceItems.findIndex((item) => item.id === nextKey);
    setActionCount((count) => count + 1);
    setLastAction(nextKey);
    if (index >= 0) {
      setPathItems(sourceItems.slice(0, index + 1));
    }
  };

  const breadcrumbs =
    demoProps.itemSet === "standard"
      ? jsx(SpectrumBreadcrumbs, {
          size: demoProps.size,
          isDisabled: demoProps.isDisabled,
          UNSAFE_style: { width: "100%" },
          "aria-label": "Project location",
          onAction: handleAction,
          children: pathItems.map((item) =>
            jsx(
              SpectrumBreadcrumb,
              {
                id: item.id,
                href: item.href,
                children: item.label,
              },
              item.id,
            ),
          ),
        })
      : jsx(SpectrumBreadcrumbs, {
          items: pathItems,
          size: demoProps.size,
          isDisabled: demoProps.isDisabled,
          UNSAFE_style: { width: "100%" },
          "aria-label": "Project location",
          onAction: handleAction,
          children: (item) =>
            jsx(SpectrumBreadcrumb, {
              id: item.id,
              href: item.href,
              children: item.label,
            }),
        });

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-breadcrumbs-row",
      "data-comparison-control-root": "breadcrumbs",
      "data-comparison-control-props": serializeBreadcrumbsDemoProps(demoProps),
      "data-comparison-breadcrumbs-props": serializeBreadcrumbsDemoProps(demoProps),
      "data-comparison-action-count": String(actionCount),
      "data-comparison-last-action": lastAction,
      "data-comparison-path": serializeBreadcrumbPath(pathItems),
      children: breadcrumbs,
    }),
    colorScheme,
  );
}

function ReactAccordionDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const locale = accordionDemoLocaleFromWindow();
  const [demoProps, setDemoProps] = useState(accordionDemoPropsFromWindow);
  const [expandedKeys, setExpandedKeys] = useState(() => new Set(["personal"]));
  const [expandedChangeCount, setExpandedChangeCount] = useState(0);
  const [lastExpandedChangeKeys, setLastExpandedChangeKeys] = useState("");

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "accordion") {
        setDemoProps(normalizeAccordionDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const controlledExpandedKeys = demoProps.allowsMultipleExpanded
    ? expandedKeys
    : new Set(Array.from(expandedKeys).slice(0, 1));
  const handleExpandedChange = (keys) => {
    const nextKeys = new Set(Array.from(keys).map(String));
    setExpandedKeys(nextKeys);
    setExpandedChangeCount((count) => count + 1);
    setLastExpandedChangeKeys(serializeAccordionKeys(nextKeys));
  };

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-accordion-row",
      "data-comparison-control-root": "accordion",
      "data-comparison-control-props": serializeAccordionDemoProps(demoProps),
      "data-comparison-expanded-keys": serializeAccordionKeys(controlledExpandedKeys),
      "data-comparison-expanded-change-count": String(expandedChangeCount),
      "data-comparison-expanded-change-keys": lastExpandedChangeKeys,
      children: jsxs(SpectrumAccordion, {
        UNSAFE_style: { width: 220 },
        size: demoProps.size,
        density: demoProps.density,
        isQuiet: demoProps.isQuiet,
        isDisabled: demoProps.isDisabled,
        allowsMultipleExpanded: demoProps.allowsMultipleExpanded,
        expandedKeys: controlledExpandedKeys,
        onExpandedChange: handleExpandedChange,
        children: [
          jsxs(SpectrumAccordionItem, {
            id: "personal",
            children: [
              jsx(SpectrumAccordionItemTitle, {
                children: "Personal Information",
              }),
              jsx(SpectrumAccordionItemPanel, {
                children: jsxs("div", {
                  className: "comparison-accordion-panel-copy",
                  children: [
                    jsx("span", { children: "Name" }),
                    jsx("span", { children: "Phone number" }),
                    jsx("span", { children: "Email address" }),
                  ],
                }),
              }),
            ],
          }),
          jsxs(SpectrumAccordionItem, {
            id: "billing",
            children: [
              jsxs(SpectrumAccordionItemHeader, {
                children: [
                  jsx(SpectrumAccordionItemTitle, {
                    children: "Billing Address",
                  }),
                  jsx(SpectrumActionButton, {
                    "aria-label": "More billing actions",
                    children: jsx(ReactButtonIcon, { "aria-hidden": "true" }),
                  }),
                ],
              }),
              jsx(SpectrumAccordionItemPanel, {
                children: jsxs("div", {
                  className: "comparison-accordion-panel-copy",
                  children: [
                    jsx("span", { children: "Street address" }),
                    jsx("span", { children: "City" }),
                    jsx("span", { children: "Postal code" }),
                  ],
                }),
              }),
            ],
          }),
        ],
      }),
    }),
    colorScheme,
    locale,
  );
}

function ReactDisclosureDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const locale = disclosureDemoLocaleFromWindow();
  const [demoProps, setDemoProps] = useState(disclosureDemoPropsFromWindow);
  const [expandedChangeCount, setExpandedChangeCount] = useState(0);
  const [lastExpandedChange, setLastExpandedChange] = useState("");

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "disclosure") {
        setDemoProps(normalizeDisclosureDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const handleExpandedChange = (expanded) => {
    setDemoProps((props) => normalizeDisclosureDemoProps({ ...props, isExpanded: expanded }));
    setExpandedChangeCount((count) => count + 1);
    setLastExpandedChange(String(expanded));
  };

  const title = jsx(SpectrumDisclosureTitle, {
    level: Number(demoProps.titleLevel),
    children: "System Requirements",
  });
  const header = demoProps.withHeaderAction
    ? jsxs(SpectrumDisclosureHeader, {
        children: [
          title,
          jsx(SpectrumActionButton, {
            "aria-label": "Edit system requirements",
            children: jsx(ReactButtonIcon, { "aria-hidden": "true" }),
          }),
        ],
      })
    : title;

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-disclosure-row",
      "data-comparison-control-root": "disclosure",
      "data-comparison-control-props": serializeDisclosureDemoProps(demoProps),
      "data-comparison-expanded": String(demoProps.isExpanded),
      "data-comparison-expanded-change-count": String(expandedChangeCount),
      "data-comparison-expanded-change-value": lastExpandedChange,
      children: jsxs(SpectrumDisclosure, {
        UNSAFE_style: { width: 250 },
        size: demoProps.size,
        density: demoProps.density,
        isQuiet: demoProps.isQuiet,
        isDisabled: demoProps.isDisabled,
        isExpanded: demoProps.isExpanded,
        onExpandedChange: handleExpandedChange,
        children: [
          header,
          jsx(SpectrumDisclosurePanel, {
            role: demoProps.panelRole,
            children: jsxs("div", {
              className: "comparison-disclosure-panel-copy",
              children: [
                jsx("span", { children: "macOS 14 or later" }),
                jsx("span", { children: "16 GB memory" }),
                jsx("span", { children: "20 GB available storage" }),
              ],
            }),
          }),
        ],
      }),
    }),
    colorScheme,
    locale,
  );
}

function ReactButtonDemo() {
  const [actionCount, setActionCount] = useState(0);
  const demoProps = useButtonDemoControls();
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-action-count": String(actionCount),
      "data-comparison-control-root": "button",
      "data-comparison-control-props": serializeButtonDemoProps(demoProps),
      "data-comparison-button-props": serializeButtonDemoProps(demoProps),
      children: jsx("div", {
        ...staticColorBackdropProps(demoProps.staticColor, "comparison-button-row"),
        children: jsx(SpectrumButton, {
          variant: demoProps.variant,
          fillStyle: demoProps.fillStyle,
          size: demoProps.size,
          staticColor: demoProps.staticColor,
          isDisabled: demoProps.isDisabled,
          isPending: demoProps.isPending,
          "aria-label": demoProps.iconPlacement === "only" ? demoProps.children : void 0,
          onPress: () => setActionCount((count) => count + 1),
          children: renderButtonChildren(demoProps),
        }),
      }),
    }),
    colorScheme,
    locale,
  );
}

function ReactAvatarDemo() {
  const [demoProps, setDemoProps] = useState(avatarDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "avatar") {
        setDemoProps(normalizeAvatarDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-avatar-row",
      "data-comparison-avatar-over-background": demoProps.isOverBackground ? "true" : "false",
      "data-comparison-control-root": "avatar",
      "data-comparison-control-props": serializeAvatarDemoProps(demoProps),
      children: jsx(SpectrumAvatar, {
        alt: demoProps.alt,
        src: demoProps.src || undefined,
        size: Number(demoProps.size),
        isOverBackground: demoProps.isOverBackground,
      }),
    }),
    colorScheme,
  );
}

function ReactAvatarGroupDemo() {
  const [demoProps, setDemoProps] = useState(avatarGroupDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "avatargroup") {
        setDemoProps(normalizeAvatarGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-avatar-group-row",
      "data-comparison-control-root": "avatargroup",
      "data-comparison-control-props": serializeAvatarGroupDemoProps(demoProps),
      children: [
        jsx(
          "span",
          {
            id: "avatargroup-route-description",
            hidden: true,
            children: "Avatar group route description",
          },
          "description",
        ),
        jsx(
          "div",
          {
            id: "avatargroup-route-details",
            hidden: true,
            children: "Avatar group route details",
          },
          "details",
        ),
        jsx(
          SpectrumAvatarGroup,
          {
            label: demoProps.label || undefined,
            "aria-label": demoProps.ariaLabel,
            "aria-describedby": "avatargroup-route-description",
            "aria-details": "avatargroup-route-details",
            size: Number(demoProps.size),
            children: avatarGroupItems.slice(0, Number(demoProps.count)).map((item) =>
              jsx(
                SpectrumAvatar,
                {
                  alt: item.alt,
                  src: item.src,
                },
                item.id,
              ),
            ),
          },
          "group",
        ),
      ],
    }),
    colorScheme,
  );
}

function imageFrameStyle(objectFit) {
  return {
    width: 160,
    height: 96,
    maxWidth: "100%",
    borderRadius: 6,
    objectFit,
    objectPosition: "center",
  };
}

function imageSourceForDemo(demoProps) {
  if (demoProps.sourceMode === "conditional") {
    return [
      { colorScheme: "light", srcSet: imageDemoSources.light },
      { colorScheme: "dark", srcSet: imageDemoSources.dark, media: "(min-width: 1px)" },
    ];
  }

  if (demoProps.sourceMode === "error") {
    return imageMissingSource;
  }

  return imageDemoSources.basic;
}

function ReactImageError() {
  return jsx("div", {
    className: "comparison-image-error",
    children: "Error loading image",
  });
}

function ReactImageDemo() {
  const [demoProps, setDemoProps] = useState(imageDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "image") {
        setDemoProps(normalizeImageDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const imageProps = {
    alt: demoProps.alt,
    src: imageSourceForDemo(demoProps),
    UNSAFE_style: imageFrameStyle(demoProps.objectFit),
    renderError: demoProps.sourceMode === "error" ? () => jsx(ReactImageError, {}) : undefined,
  };

  const content =
    demoProps.sourceMode === "coordinator"
      ? jsx(SpectrumImageCoordinator, {
          children: jsxs("div", {
            className: "comparison-image-coordinator-grid",
            children: [
              jsx(SpectrumImage, {
                alt: `${demoProps.alt} one`,
                src: imageDemoSources.first,
                UNSAFE_style: imageFrameStyle(demoProps.objectFit),
              }),
              jsx(SpectrumImage, {
                alt: `${demoProps.alt} two`,
                src: imageDemoSources.second,
                UNSAFE_style: imageFrameStyle(demoProps.objectFit),
              }),
            ],
          }),
        })
      : jsx(SpectrumImage, imageProps);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-image-row",
      "data-comparison-control-root": "image",
      "data-comparison-control-props": serializeImageDemoProps(demoProps),
      children: content,
    }),
    colorScheme,
  );
}

const skeletonImageStyle = {
  width: "128px",
  height: "96px",
  maxWidth: "100%",
  borderRadius: "6px",
  flexShrink: 0,
  aspectRatio: "4 / 3",
  objectFit: "cover",
  objectPosition: "center",
};

const skeletonTitleStyle = {
  fontSize: "20px",
  lineHeight: "24px",
  fontWeight: 700,
  color: "rgb(34, 34, 34)",
};

const skeletonBodyStyle = {
  fontSize: "14px",
  lineHeight: "20px",
  color: "rgb(34, 34, 34)",
};

const skeletonMetaStyle = {
  fontSize: "13px",
  lineHeight: "18px",
  color: "rgb(34, 34, 34)",
};

function ReactSkeletonContent() {
  return jsxs("div", {
    className: "comparison-skeleton-card",
    children: [
      jsx(SpectrumImage, {
        alt: "Preview",
        src: imageDemoSources.basic,
        width: 320,
        height: 192,
        UNSAFE_style: skeletonImageStyle,
      }),
      jsxs("div", {
        className: "comparison-skeleton-copy",
        children: [
          jsx(SpectrumText, {
            UNSAFE_style: skeletonTitleStyle,
            children: "Placeholder title",
          }),
          jsx(SpectrumText, {
            UNSAFE_style: skeletonBodyStyle,
            children: "This is placeholder content approximating the length of the final content.",
          }),
          jsxs("div", {
            className: "comparison-skeleton-inline",
            children: [
              jsx(ReactButtonIcon, {}),
              jsx(SpectrumText, {
                UNSAFE_style: skeletonMetaStyle,
                children: "Here is an icon.",
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

function ReactSkeletonDemo() {
  const [demoProps, setDemoProps] = useState(skeletonDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "skeleton") {
        setDemoProps(normalizeSkeletonDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-skeleton-row",
      "data-comparison-control-root": "skeleton",
      "data-comparison-control-props": serializeSkeletonDemoProps(demoProps),
      children: jsx(SpectrumSkeleton, {
        isLoading: demoProps.isLoading,
        children: jsx(ReactSkeletonContent, {}),
      }),
    }),
    colorScheme,
  );
}

function renderButtonChildren(demoProps) {
  if (demoProps.iconPlacement === "start") {
    return [
      jsx(ReactButtonIcon, {}, "icon"),
      jsx(SpectrumText, { children: demoProps.children }, "text"),
    ];
  }

  if (demoProps.iconPlacement === "only") {
    return jsx(ReactButtonIcon, {});
  }

  return demoProps.children;
}

function renderSingleButtonFamilyChildren(label, iconPlacement) {
  if (iconPlacement === "start") {
    return [jsx(ReactButtonIcon, {}, "icon"), jsx(SpectrumText, { children: label }, "text")];
  }

  if (iconPlacement === "only") {
    return jsx(ReactButtonIcon, {});
  }

  return label;
}

function useComparisonResolvedTheme() {
  const [colorScheme, setColorScheme] = useState(getComparisonResolvedThemeFromDocument);
  useEffect(() => {
    const handleThemeChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme);
      }
    };
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setColorScheme(getComparisonResolvedThemeFromDocument());
    return () => window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
  }, []);
  return colorScheme;
}

function useButtonDemoControls() {
  const [demoProps, setDemoProps] = useState(buttonDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "button") {
        setDemoProps(event.detail.props);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);
  return demoProps;
}

function ReactActionButtonDemo() {
  const [actionCount, setActionCount] = useState(0);
  const demoProps = useActionButtonDemoControls();
  const colorScheme = useComparisonResolvedTheme();
  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(demoProps.staticColor, "comparison-button-row"),
      "data-comparison-action-count": String(actionCount),
      "data-comparison-control-root": "actionbutton",
      "data-comparison-control-props": serializeActionButtonDemoProps(demoProps),
      "data-comparison-actionbutton-props": serializeActionButtonDemoProps(demoProps),
      "data-comparison-actionbutton-pending": demoProps.isPending ? "true" : void 0,
      children: jsx(SpectrumActionButton, {
        size: demoProps.size,
        staticColor: demoProps.staticColor,
        isQuiet: demoProps.isQuiet,
        isDisabled: demoProps.isDisabled,
        isPending: demoProps.isPending,
        "aria-label": demoProps.iconPlacement === "only" ? demoProps.children : void 0,
        onPress: () => setActionCount((count) => count + 1),
        children: renderSingleButtonFamilyChildren(demoProps.children, demoProps.iconPlacement),
      }),
    }),
    colorScheme,
  );
}

function useActionButtonDemoControls() {
  const [demoProps, setDemoProps] = useState(actionButtonDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbutton") {
        setDemoProps(event.detail.props);
      }
    };
    window.addEventListener(actionButtonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(actionButtonControlsEvent, handleControlsChange);
  }, []);
  return demoProps;
}

function ReactActionButtonGroupDemo() {
  const [groupProps, setGroupProps] = useState(actionButtonGroupDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() => selectedKeysParamFromWindow(["bold"]));
  const [actionKey, setActionKey] = useState("");
  const selectedKeyText = Array.from(selectedKeys).join(",");
  const toggleKey = (key) => {
    setActionKey(key);
    setSelectedKeys(new Set([key]));
  };
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actionbuttongroup") {
        setGroupProps(normalizeActionButtonGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(groupProps.staticColor),
      "data-comparison-action-key": actionKey,
      "data-comparison-selected-keys": selectedKeyText,
      children: jsx(SpectrumActionButtonGroup, {
        "aria-label": "Formatting actions",
        "data-comparison-group-root": "actionbuttongroup",
        "data-comparison-control-root": "actionbuttongroup",
        "data-comparison-group-props": serializeActionButtonGroupDemoProps(groupProps),
        "data-comparison-control-props": serializeActionButtonGroupDemoProps(groupProps),
        size: groupProps.size,
        density: groupProps.density,
        orientation: groupProps.orientation,
        isQuiet: groupProps.isQuiet,
        isJustified: groupProps.isJustified,
        isDisabled: groupProps.isDisabled,
        staticColor: groupProps.staticColor,
        children: actionItems.map((item) =>
          jsx(
            SpectrumActionButton,
            {
              "aria-label": groupProps.iconPlacement === "only" ? item.label : void 0,
              "aria-pressed": selectedKeys.has(item.id),
              onPress: () => toggleKey(item.id),
              children: renderSingleButtonFamilyChildren(item.label, groupProps.iconPlacement),
            },
            item.id,
          ),
        ),
      }),
    }),
  );
}

function ReactButtonGroupDemo() {
  const [groupProps, setGroupProps] = useState(buttonGroupDemoPropsFromWindow);
  const wrapStyle = groupProps.wrapWidth ? { width: groupProps.wrapWidth } : undefined;
  const [actionKey, setActionKey] = useState("");
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "buttongroup") {
        setGroupProps(normalizeButtonGroupDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-action-key": actionKey,
      children: jsxs(SpectrumButtonGroup, {
        "data-comparison-group-root": "buttongroup",
        "data-comparison-control-root": "buttongroup",
        "data-comparison-group-props": serializeButtonGroupDemoProps(groupProps),
        "data-comparison-control-props": serializeButtonGroupDemoProps(groupProps),
        orientation: groupProps.orientation,
        align: groupProps.align,
        size: groupProps.size,
        isDisabled: groupProps.isDisabled,
        UNSAFE_style: wrapStyle,
        children: [
          jsx(SpectrumButton, {
            variant: "primary",
            "aria-label": groupProps.iconPlacement === "only" ? "Save" : void 0,
            onPress: () => setActionKey("save"),
            children: renderSingleButtonFamilyChildren("Save", groupProps.iconPlacement),
          }),
          jsx(SpectrumButton, {
            variant: "secondary",
            "aria-label": groupProps.iconPlacement === "only" ? "Cancel" : void 0,
            onPress: () => setActionKey("cancel"),
            children: renderSingleButtonFamilyChildren("Cancel", groupProps.iconPlacement),
          }),
        ],
      }),
    }),
  );
}

function renderBadgeChildren(demoProps) {
  if (demoProps.iconPlacement === "start") {
    return jsxs(Fragment, {
      children: [
        jsx(ReactButtonIcon, { "aria-hidden": "true" }),
        jsx(SpectrumText, { children: demoProps.children }),
      ],
    });
  }

  return demoProps.children;
}

function ReactBadgeDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(badgeDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "badge") {
        setDemoProps(normalizeBadgeDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-badge-row",
      children: jsx(SpectrumBadge, {
        "data-comparison-control-root": "badge",
        "data-comparison-control-props": serializeBadgeDemoProps(demoProps),
        id: "badge-route-root",
        "aria-label": "Badge route label",
        "aria-labelledby": "badge-route-labelledby",
        "aria-describedby": "badge-route-description",
        "aria-details": "badge-route-details",
        hidden: true,
        variant: demoProps.variant,
        fillStyle: demoProps.fillStyle,
        size: demoProps.size,
        overflowMode: demoProps.overflowMode,
        children: renderBadgeChildren(demoProps),
      }),
    }),
    colorScheme,
  );
}

function ReactStatusLightDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(statusLightDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "statuslight") {
        setDemoProps(normalizeStatusLightDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-status-light-row",
      children: jsx(SpectrumStatusLight, {
        "data-comparison-control-root": "statuslight",
        "data-comparison-control-props": serializeStatusLightDemoProps(demoProps),
        id: "statuslight-route-root",
        "aria-label": "StatusLight route label",
        "aria-describedby": "statuslight-route-description",
        "aria-details": "statuslight-route-details",
        variant: demoProps.variant,
        size: demoProps.size,
        role: demoProps.role || undefined,
        children: demoProps.children,
      }),
    }),
    colorScheme,
  );
}

function ReactDividerDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(dividerDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "divider") {
        setDemoProps(normalizeDividerDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(demoProps.staticColor, "comparison-divider-row"),
      "data-comparison-orientation": demoProps.orientation,
      children: jsx(SpectrumDivider, {
        "data-comparison-control-root": "divider",
        "data-comparison-control-props": serializeDividerDemoProps(demoProps),
        orientation: demoProps.orientation,
        size: demoProps.size,
        staticColor: demoProps.staticColor,
      }),
    }),
    colorScheme,
  );
}

function ReactDropZoneDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(dropZoneDemoPropsFromWindow);
  const [counts, setCounts] = useState({
    activate: 0,
    drop: 0,
    enter: 0,
    exit: 0,
    move: 0,
  });
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "dropzone") {
        setDemoProps(normalizeDropZoneDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const bump = (key) => {
    setCounts((current) => ({ ...current, [key]: current[key] + 1 }));
  };

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-dropzone-row",
      "data-comparison-color-scheme": colorScheme,
      children: jsx(SpectrumDropZone, {
        "data-comparison-control-root": "dropzone",
        "data-comparison-control-props": serializeDropZoneDemoProps(demoProps),
        "data-comparison-drop-activate-count": counts.activate,
        "data-comparison-drop-count": counts.drop,
        "data-comparison-drop-enter-count": counts.enter,
        "data-comparison-drop-exit-count": counts.exit,
        "data-comparison-drop-move-count": counts.move,
        id: "dropzone-route-root",
        "aria-label": demoProps.ariaLabel,
        "aria-describedby": "dropzone-route-description",
        "aria-details": "dropzone-route-details",
        size: demoProps.size,
        isFilled: demoProps.isFilled,
        replaceMessage: demoProps.replaceMessage || undefined,
        onDropActivate: () => bump("activate"),
        onDrop: () => bump("drop"),
        onDropEnter: () => bump("enter"),
        onDropExit: () => bump("exit"),
        onDropMove: () => bump("move"),
        children: jsxs(SpectrumIllustratedMessage, {
          children: [
            jsx(ReactDropZoneIllustration, { slot: "illustration" }),
            jsx(SpectrumHeading, { children: "Upload assets" }),
            jsx(SpectrumContent, { children: "Drop a PNG, SVG, or PDF." }),
            jsx("span", {
              id: "dropzone-route-description",
              hidden: true,
              children: "Drop target accepts project files.",
            }),
            jsx("span", {
              id: "dropzone-route-details",
              hidden: true,
              children: "The comparison route records drag and drop callback counts.",
            }),
          ],
        }),
      }),
    }),
    colorScheme,
  );
}

function ReactIllustratedMessageDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(illustratedMessageDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "illustratedmessage") {
        setDemoProps(normalizeIllustratedMessageDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-illustrated-message-row",
      "data-comparison-color-scheme": colorScheme,
      children: jsxs(SpectrumIllustratedMessage, {
        "data-comparison-control-root": "illustratedmessage",
        "data-comparison-control-props": serializeIllustratedMessageDemoProps(demoProps),
        id: "illustratedmessage-route-root",
        role: "status",
        "aria-label": "Asset empty state",
        "aria-describedby": "illustratedmessage-route-description",
        "aria-details": "illustratedmessage-route-details",
        size: demoProps.size,
        orientation: demoProps.orientation,
        children: [
          jsx(ReactIllustratedMessageIllustration, { slot: "illustration" }),
          jsx(SpectrumHeading, { children: "Create your first asset" }),
          jsx(SpectrumContent, { children: "Upload or import a file to begin." }),
          jsx("span", {
            id: "illustratedmessage-route-description",
            hidden: true,
            children: "Illustrated empty-state guidance.",
          }),
          jsx("span", {
            id: "illustratedmessage-route-details",
            hidden: true,
            children: "The comparison route covers illustration, heading, content, and actions.",
          }),
          demoProps.withActions
            ? jsxs(SpectrumButtonGroup, {
                children: [
                  jsx(SpectrumButton, { variant: "secondary", children: "Import" }),
                  jsx(SpectrumButton, { variant: "accent", children: "Upload" }),
                ],
              })
            : null,
        ],
      }),
    }),
    colorScheme,
  );
}

function ReactInlineAlertDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(inlineAlertDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "inlinealert") {
        setDemoProps(normalizeInlineAlertDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const isNegative = demoProps.variant === "negative";

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-inline-alert-row",
      "data-comparison-color-scheme": colorScheme,
      children: jsxs(SpectrumInlineAlert, {
        "data-comparison-control-root": "inlinealert",
        "data-comparison-control-props": serializeInlineAlertDemoProps(demoProps),
        id: "inlinealert-route-root",
        "aria-label": "Filtered alert label",
        "aria-describedby": "inlinealert-route-description",
        "aria-details": "inlinealert-route-details",
        variant: demoProps.variant,
        fillStyle: demoProps.fillStyle,
        autoFocus: demoProps.autoFocus || undefined,
        children: [
          jsx(SpectrumHeading, {
            children: isNegative ? "Payment Error" : "Payment Information",
          }),
          jsx(SpectrumContent, {
            children: isNegative
              ? "There was an error processing your request. Please try again."
              : "Enter your billing address, shipping address, and payment method to complete your purchase.",
          }),
          jsx("span", {
            id: "inlinealert-route-description",
            hidden: true,
            children: "Inline alert route description.",
          }),
          jsx("span", {
            id: "inlinealert-route-details",
            hidden: true,
            children: "The comparison route covers variant, fill style, and autofocus.",
          }),
        ],
      }),
    }),
    colorScheme,
  );
}

function ReactMeterDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(meterDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "meter") {
        setDemoProps(normalizeMeterDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(demoProps.staticColor, "comparison-meter-row"),
      children: jsx(SpectrumMeter, {
        "data-comparison-control-root": "meter",
        "data-comparison-control-props": serializeMeterDemoProps(demoProps),
        label: demoProps.label,
        value: demoProps.value,
        minValue: demoProps.minValue,
        maxValue: demoProps.maxValue,
        valueLabel: demoProps.valueLabel || undefined,
        variant: demoProps.variant,
        size: demoProps.size,
        staticColor: demoProps.staticColor || undefined,
        labelPosition: demoProps.labelPosition,
      }),
    }),
    colorScheme,
  );
}

function ReactLinkButtonDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(linkButtonDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "linkbutton") {
        setDemoProps(normalizeLinkButtonDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(demoProps.staticColor, "comparison-button-row"),
      children: jsx(SpectrumLinkButton, {
        "data-comparison-control-root": "linkbutton",
        "data-comparison-control-props": serializeLinkButtonDemoProps(demoProps),
        href: demoProps.href,
        variant: demoProps.variant,
        fillStyle: demoProps.fillStyle,
        size: demoProps.size,
        staticColor: demoProps.staticColor,
        isDisabled: demoProps.isDisabled,
        "aria-label": demoProps.iconPlacement === "only" ? demoProps.children : void 0,
        children: renderSingleButtonFamilyChildren(demoProps.children, demoProps.iconPlacement),
      }),
    }),
    colorScheme,
  );
}

function ReactLinkDemo() {
  const colorScheme = useComparisonResolvedTheme();
  const [demoProps, setDemoProps] = useState(linkDemoPropsFromWindow);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "link") {
        setDemoProps(normalizeLinkDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("p", {
      ...staticColorBackdropProps(demoProps.staticColor, "comparison-link-row"),
      children: jsx(SpectrumLink, {
        "data-comparison-control-root": "link",
        "data-comparison-control-props": serializeLinkDemoProps(demoProps),
        href: demoProps.href,
        variant: demoProps.variant,
        staticColor: demoProps.staticColor,
        isStandalone: demoProps.isStandalone,
        isQuiet: demoProps.isQuiet,
        children: demoProps.children,
      }),
    }),
    colorScheme,
  );
}

function ReactToggleButtonDemo() {
  const [demoProps, setDemoProps] = useState(toggleButtonDemoPropsFromWindow);
  const [selected, setSelected] = useState(demoProps.isSelected);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "togglebutton") {
        const nextProps = normalizeToggleButtonDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelected(nextProps.isSelected);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(demoProps.staticColor),
      "data-comparison-selected": String(selected),
      children: jsx(SpectrumToggleButton, {
        "data-comparison-control-root": "togglebutton",
        "data-comparison-control-props": serializeToggleButtonDemoProps({
          ...demoProps,
          isSelected: selected,
        }),
        size: demoProps.size,
        staticColor: demoProps.staticColor,
        isQuiet: demoProps.isQuiet,
        isEmphasized: demoProps.isEmphasized,
        isDisabled: demoProps.isDisabled,
        isSelected: selected,
        onChange: setSelected,
        "aria-label": demoProps.iconPlacement === "only" ? demoProps.children : void 0,
        children: renderSingleButtonFamilyChildren(demoProps.children, demoProps.iconPlacement),
      }),
    }),
  );
}

function ReactToggleButtonGroupDemo() {
  const [groupProps, setGroupProps] = useState(toggleButtonGroupDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() =>
    selectedToggleKeysSetFromText(groupProps.selectedKeys, ["left"], groupProps.selectionMode),
  );
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "togglebuttongroup") {
        const nextProps = normalizeToggleButtonGroupDemoProps(event.detail.props ?? {});
        setGroupProps(nextProps);
        setSelectedKeys(
          selectedToggleKeysSetFromText(nextProps.selectedKeys, ["left"], nextProps.selectionMode),
        );
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      ...staticColorBackdropProps(groupProps.staticColor),
      "data-comparison-selected-keys": Array.from(selectedKeys).join(","),
      children: jsxs(SpectrumToggleButtonGroup, {
        "aria-label": "Text alignment",
        "data-comparison-group-root": "togglebuttongroup",
        "data-comparison-control-root": "togglebuttongroup",
        "data-comparison-group-props": serializeToggleButtonGroupDemoProps({
          ...groupProps,
          selectedKeys: Array.from(selectedKeys).join(","),
        }),
        "data-comparison-control-props": serializeToggleButtonGroupDemoProps({
          ...groupProps,
          selectedKeys: Array.from(selectedKeys).join(","),
        }),
        selectionMode: groupProps.selectionMode,
        disallowEmptySelection: groupProps.disallowEmptySelection,
        size: groupProps.size,
        density: groupProps.density,
        orientation: groupProps.orientation,
        isQuiet: groupProps.isQuiet,
        isEmphasized: groupProps.isEmphasized,
        isJustified: groupProps.isJustified,
        isDisabled: groupProps.isDisabled,
        staticColor: groupProps.staticColor,
        selectedKeys,
        onSelectionChange: (keys) =>
          setSelectedKeys(keys === "all" ? new Set() : new Set(Array.from(keys, String))),
        children: [
          jsx(SpectrumToggleButton, {
            id: "left",
            "aria-label": groupProps.iconPlacement === "only" ? "Left" : void 0,
            children: renderSingleButtonFamilyChildren("Left", groupProps.iconPlacement),
          }),
          jsx(SpectrumToggleButton, {
            id: "center",
            "aria-label": groupProps.iconPlacement === "only" ? "Center" : void 0,
            children: renderSingleButtonFamilyChildren("Center", groupProps.iconPlacement),
          }),
          jsx(SpectrumToggleButton, {
            id: "right",
            "aria-label": groupProps.iconPlacement === "only" ? "Right" : void 0,
            children: renderSingleButtonFamilyChildren("Right", groupProps.iconPlacement),
          }),
        ],
      }),
    }),
    colorScheme,
  );
}

function ReactSegmentedControlDemo() {
  const [demoProps, setDemoProps] = useState(segmentedControlDemoPropsFromWindow);
  const [selectedKey, setSelectedKey] = useState(() =>
    initialSegmentedControlSelectedKey(demoProps),
  );
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "segmentedcontrol") {
        const nextProps = normalizeSegmentedControlDemoProps(event.detail.props);
        setDemoProps(nextProps);
        setSelectedKey(initialSegmentedControlSelectedKey(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const selectionProps =
    demoProps.selectionSource === "defaultSelectedKey"
      ? { defaultSelectedKey: demoProps.defaultSelectedKey }
      : { selectedKey };
  const renderKey = [
    demoProps.selectionSource,
    demoProps.selectionSource === "defaultSelectedKey"
      ? demoProps.defaultSelectedKey
      : demoProps.selectedKey,
    demoProps.disabledKey,
    demoProps.iconPlacement,
    demoProps.isJustified,
    demoProps.isDisabled,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-key": selectedKey,
      children: jsxs(
        SpectrumSegmentedControl,
        {
          "aria-label": "View mode",
          "data-comparison-control-root": "segmentedcontrol",
          "data-comparison-control-props": serializeSegmentedControlDemoProps(demoProps),
          isJustified: demoProps.isJustified,
          isDisabled: demoProps.isDisabled,
          ...selectionProps,
          onSelectionChange: (key) => setSelectedKey(String(key)),
          children: segmentedControlItems.map((item) =>
            jsx(
              SpectrumSegmentedControlItem,
              {
                id: item.id,
                isDisabled: demoProps.disabledKey === item.id,
                "aria-label": demoProps.iconPlacement === "only" ? item.label : void 0,
                children: renderSingleButtonFamilyChildren(item.label, demoProps.iconPlacement),
              },
              item.id,
            ),
          ),
        },
        renderKey,
      ),
    }),
    colorScheme,
  );
}

function ReactSelectBoxGroupDemo() {
  const [demoProps, setDemoProps] = useState(selectBoxGroupDemoPropsFromWindow);
  const [selectedKeys, setSelectedKeys] = useState(() =>
    initialSelectBoxGroupSelectedKeys(demoProps),
  );
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "selectboxgroup") {
        setDemoProps((current) => {
          const nextProps = normalizeSelectBoxGroupDemoProps({ ...current, ...event.detail.props });
          setSelectedKeys(initialSelectBoxGroupSelectedKeys(nextProps));
          return nextProps;
        });
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const selectionProps =
    demoProps.selectionSource === "defaultSelectedKeys"
      ? {
          defaultSelectedKeys: selectBoxGroupKeysFromValue(
            demoProps.defaultSelectedKeys,
            ["starter"],
            demoProps.selectionMode,
          ),
        }
      : { selectedKeys };
  const renderKey = [
    demoProps.orientation,
    demoProps.selectionMode,
    demoProps.selectionSource,
    demoProps.selectionSource === "defaultSelectedKeys"
      ? demoProps.defaultSelectedKeys
      : demoProps.selectedKeys,
    demoProps.disabledKeys,
    demoProps.disabledItem,
    demoProps.isDisabled,
    demoProps.withIllustrations,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-keys": serializeSelectBoxGroupKeys(selectedKeys),
      children: jsx(
        SpectrumSelectBoxGroup,
        {
          "aria-label": "Plans",
          "data-comparison-control-root": "selectboxgroup",
          "data-comparison-control-props": serializeSelectBoxGroupDemoProps(demoProps),
          orientation: demoProps.orientation,
          selectionMode: demoProps.selectionMode,
          isDisabled: demoProps.isDisabled,
          disabledKeys: selectBoxGroupKeysFromValue(demoProps.disabledKeys, [], "multiple"),
          ...selectionProps,
          onSelectionChange: (keys) =>
            setSelectedKeys(
              keys === "all" ? new Set(selectBoxGroupItems.map((item) => item.id)) : new Set(keys),
            ),
          children: selectBoxGroupItems.map((item) =>
            jsxs(
              SpectrumSelectBox,
              {
                id: item.id,
                textValue: item.label,
                isDisabled: demoProps.disabledItem === item.id,
                children: [
                  demoProps.withIllustrations && selectBoxGroupIllustrationItemIds.has(item.id)
                    ? jsx(ReactPlanIllustration, { slot: "illustration" })
                    : null,
                  jsx(SpectrumText, { slot: "label", children: item.label }),
                  jsx(SpectrumText, { slot: "description", children: item.description }),
                ],
              },
              item.id,
            ),
          ),
        },
        renderKey,
      ),
    }),
    colorScheme,
  );
}

function ReactCardViewDemo() {
  const [selectedKeys, setSelectedKeys] = useState(() => new Set(["apollo"]));
  const colorScheme = useComparisonResolvedTheme();
  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-keys": Array.from(selectedKeys).join(","),
      children: jsx(SpectrumCardView, {
        "aria-label": "Projects",
        items: cardItems,
        size: "S",
        density: "compact",
        variant: "secondary",
        selectionMode: "single",
        selectionStyle: "highlight",
        UNSAFE_style: cardViewDemoStyle,
        selectedKeys,
        onSelectionChange: (keys) => setSelectedKeys(keys === "all" ? new Set() : new Set(keys)),
        children: (item) =>
          jsx(SpectrumCard, {
            id: item.id,
            textValue: item.title,
            children: jsxs(SpectrumContent, {
              children: [
                jsx(SpectrumText, { slot: "title", children: item.title }),
                jsx(SpectrumText, { slot: "description", children: item.status }),
              ],
            }),
          }),
      }),
    }),
    colorScheme,
  );
}

function ReactCardDemo() {
  const colorScheme = useComparisonResolvedTheme();
  return renderReactSpectrumReference(
    jsx(SpectrumCard, {
      size: "M",
      density: "regular",
      variant: "primary",
      UNSAFE_style: { width: 240 },
      children: [
        jsx(SpectrumCardPreview, {
          children: jsx(SpectrumImage, { src: cardPreviewImageSrc, alt: "" }),
        }),
        jsxs(SpectrumContent, {
          children: [
            jsx(SpectrumText, { slot: "title", children: "Apollo" }),
            jsx(SpectrumText, { slot: "description", children: "Active" }),
          ],
        }),
      ],
    }),
    colorScheme,
  );
}

function renderTabsDemo() {
  return renderReactSpectrumReference(
    jsxs(SpectrumTabs, {
      "aria-label": "React Spectrum tabs",
      children: [
        jsx(SpectrumTabList, {
          items: tabItems,
          children: (item) => jsx(SpectrumTab, { id: item.id, children: item.label }),
        }),
        tabItems.map((item) =>
          jsx(SpectrumTabPanel, { id: item.id, children: item.content }, item.id),
        ),
      ],
    }),
  );
}

function ReactTextFieldDemo() {
  const [demoProps, setDemoProps] = useState(textFieldDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.value);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "textfield") {
        const nextProps = normalizeTextFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "textfield",
      "data-comparison-control-props": serializeTextFieldDemoProps({
        ...demoProps,
        value,
      }),
      "data-comparison-value": value,
      children: jsx(SpectrumTextField, {
        label: demoProps.label,
        value,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, value: nextValue }));
        },
      }),
    }),
    colorScheme,
  );
}

function ReactFormDemo() {
  const [demoProps, setDemoProps] = useState(formDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.value);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "form") {
        const nextProps = normalizeFormDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-form-row",
      children: jsxs(SpectrumForm, {
        "data-comparison-control-root": "form",
        "data-comparison-control-props": serializeFormDemoProps({
          ...demoProps,
          value,
        }),
        "data-comparison-value": value,
        size: demoProps.size,
        labelPosition: demoProps.labelPosition,
        labelAlign: demoProps.labelAlign,
        necessityIndicator: demoProps.necessityIndicator,
        validationBehavior: demoProps.validationBehavior,
        isRequired: demoProps.isRequired,
        isDisabled: demoProps.isDisabled,
        isEmphasized: demoProps.isEmphasized,
        onSubmit: (event) => event.preventDefault(),
        children: [
          jsx(SpectrumTextField, {
            "data-comparison-form-field": "name",
            label: demoProps.label,
            name: "name",
            value,
            description: "Inherited from the parent form.",
            onChange: (nextValue) => {
              setValue(nextValue);
              setDemoProps((current) => ({ ...current, value: nextValue }));
            },
          }),
          jsx(SpectrumButton, {
            "data-comparison-form-submit": "true",
            type: "submit",
            children: demoProps.actionLabel,
          }),
        ],
      }),
    }),
    colorScheme,
  );
}

function ReactTextAreaDemo() {
  const [demoProps, setDemoProps] = useState(textAreaDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.value);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "textarea") {
        const nextProps = normalizeTextAreaDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "textarea",
      "data-comparison-control-props": serializeTextAreaDemoProps({
        ...demoProps,
        value,
      }),
      "data-comparison-value": value,
      children: jsx(SpectrumTextArea, {
        label: demoProps.label,
        value,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, value: nextValue }));
        },
      }),
    }),
    colorScheme,
  );
}

function ReactNumberFieldDemo() {
  const [demoProps, setDemoProps] = useState(numberFieldDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.value);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "numberfield") {
        const nextProps = normalizeNumberFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "numberfield",
      "data-comparison-control-props": serializeNumberFieldDemoProps({
        ...demoProps,
        value,
      }),
      "data-comparison-value": String(value),
      children: jsx(SpectrumNumberField, {
        label: demoProps.label,
        value,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        minValue: demoProps.minValue,
        maxValue: demoProps.maxValue,
        step: demoProps.step,
        hideStepper: demoProps.hideStepper,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, value: nextValue }));
        },
      }),
    }),
    colorScheme,
  );
}

function ReactPickerDemo() {
  const [demoProps, setDemoProps] = useState(pickerDemoPropsFromWindow);
  const [selectedKey, setSelectedKey] = useState(() => demoProps.selectedKey);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "picker") {
        const nextProps = normalizePickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(nextProps.selectedKey);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "picker",
      "data-comparison-control-props": serializePickerDemoProps({
        ...demoProps,
        selectedKey,
      }),
      "data-comparison-value": selectedKey,
      children: jsx(SpectrumPicker, {
        label: demoProps.label,
        selectedKey,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isQuiet: demoProps.isQuiet,
        isDisabled: demoProps.isDisabled,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onSelectionChange: (nextKey) => {
          const nextSelectedKey = String(nextKey);
          setSelectedKey(nextSelectedKey);
          setDemoProps((current) => ({ ...current, selectedKey: nextSelectedKey }));
        },
        children: pickerItems.map((item) =>
          jsx(SpectrumPickerItem, { id: item.id, children: item.label }, item.id),
        ),
      }),
    }),
    colorScheme,
  );
}

function ReactComboBoxDemo() {
  const [demoProps, setDemoProps] = useState(comboBoxDemoPropsFromWindow);
  const [selectedKey, setSelectedKey] = useState(() => demoProps.selectedKey);
  const [inputValue, setInputValue] = useState(() => demoProps.inputValue);
  const colorScheme = useComparisonResolvedTheme();
  const menuWidth = Number.parseInt(demoProps.menuWidth, 10);
  const numericMenuWidth = Number.isFinite(menuWidth) && menuWidth > 0 ? menuWidth : undefined;
  const disabledKeys = demoProps.disableEnterprise ? ["enterprise"] : undefined;
  const selectionProps =
    demoProps.selectionSource === "selectedKey"
      ? { selectedKey }
      : { defaultSelectedKey: demoProps.selectedKey };
  const inputProps =
    demoProps.inputSource === "inputValue"
      ? { inputValue }
      : { defaultInputValue: demoProps.inputValue };
  const contextualHelp = demoProps.withContextualHelp
    ? jsxs(SpectrumContextualHelp, {
        children: [
          jsx(SpectrumHeading, { slot: "title", children: "Plan help" }),
          jsx(SpectrumContent, { children: "Pick the plan that matches expected usage." }),
        ],
      })
    : undefined;
  const renderKey = [
    demoProps.selectionSource,
    demoProps.selectionSource === "defaultSelectedKey" ? demoProps.selectedKey : "controlled",
    demoProps.inputSource,
    demoProps.inputSource === "defaultInputValue" ? demoProps.inputValue : "controlled",
    demoProps.withContextualHelp,
  ].join("|");

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "combobox") {
        const nextProps = normalizeComboBoxDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(nextProps.selectedKey);
        setInputValue(nextProps.inputValue);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsxs(Fragment, {
      children: [
        demoProps.form ? jsx("form", { id: demoProps.form, hidden: true }) : null,
        jsx("div", {
          "data-comparison-control-root": "combobox",
          "data-comparison-control-props": serializeComboBoxDemoProps(demoProps),
          "data-comparison-value": selectedKey,
          "data-comparison-input-value": inputValue,
          children: jsx(
            SpectrumComboBox,
            {
              label: demoProps.label,
              ...selectionProps,
              ...inputProps,
              placeholder: demoProps.placeholder,
              size: demoProps.size,
              labelPosition: demoProps.labelPosition,
              labelAlign: demoProps.labelAlign,
              necessityIndicator: demoProps.necessityIndicator,
              contextualHelp,
              description: demoProps.description,
              errorMessage: demoProps.errorMessage,
              name: demoProps.name || undefined,
              form: demoProps.form || undefined,
              formValue: demoProps.formValue,
              validationBehavior: demoProps.validationBehavior,
              menuTrigger: demoProps.menuTrigger,
              direction: demoProps.direction,
              align: demoProps.align,
              menuWidth: numericMenuWidth,
              shouldFlip: demoProps.shouldFlip,
              disabledKeys,
              allowsCustomValue: demoProps.allowsCustomValue,
              isDisabled: demoProps.isDisabled,
              isReadOnly: demoProps.isReadOnly,
              isRequired: demoProps.isRequired,
              isInvalid: demoProps.isInvalid,
              onSelectionChange: (nextKey) => {
                if (nextKey == null) {
                  return;
                }
                const nextSelectedKey = String(nextKey);
                const nextInputValue = comboBoxLabelForKey(nextSelectedKey);
                setSelectedKey(nextSelectedKey);
                setInputValue(nextInputValue);
                setDemoProps((current) => ({
                  ...current,
                  ...(current.selectionSource === "selectedKey"
                    ? { selectedKey: nextSelectedKey }
                    : {}),
                  ...(current.inputSource === "inputValue" ? { inputValue: nextInputValue } : {}),
                }));
              },
              onInputChange: (nextValue) => {
                setInputValue(nextValue);
                setDemoProps((current) =>
                  current.inputSource === "inputValue"
                    ? { ...current, inputValue: nextValue }
                    : current,
                );
              },
              children: (item) =>
                jsx(
                  SpectrumComboBoxItem,
                  {
                    id: item.id,
                    isDisabled: item.id === "enterprise" && demoProps.disableEnterprise,
                    children: item.label,
                  },
                  item.id,
                ),
              items: comboBoxItems,
            },
            renderKey,
          ),
        }),
      ],
    }),
    colorScheme,
  );
}

function ReactSliderDemo() {
  const [demoProps, setDemoProps] = useState(sliderDemoPropsFromWindow);
  const [value, setValue] = useState(() => initialSliderDemoValue(demoProps));
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "slider") {
        const nextProps = normalizeSliderDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialSliderDemoValue(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);
  const valueProps =
    demoProps.valueSource === "defaultValue" ? { defaultValue: demoProps.defaultValue } : { value };
  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "defaultValue" ? demoProps.defaultValue : "controlled",
    demoProps.minValue,
    demoProps.maxValue,
    demoProps.step,
    demoProps.fillOffset,
    demoProps.labelPosition,
    demoProps.labelAlign,
    demoProps.name,
    demoProps.form,
    demoProps.withContextualHelp,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "slider",
      "data-comparison-control-props": serializeSliderDemoProps(demoProps),
      "data-comparison-value": String(value),
      children: jsx(
        SpectrumSlider,
        {
          label: demoProps.label,
          ...valueProps,
          minValue: demoProps.minValue,
          maxValue: demoProps.maxValue,
          step: demoProps.step,
          size: demoProps.size,
          trackStyle: demoProps.trackStyle,
          thumbStyle: demoProps.thumbStyle,
          fillOffset: demoProps.fillOffset,
          labelPosition: demoProps.labelPosition,
          labelAlign: demoProps.labelAlign,
          contextualHelp: demoProps.withContextualHelp
            ? jsxs(SpectrumContextualHelp, {
                children: [
                  jsx(SpectrumHeading, { children: "Volume help" }),
                  jsx(SpectrumContent, { children: "Choose an output level." }),
                ],
              })
            : undefined,
          name: demoProps.name || undefined,
          form: demoProps.form || undefined,
          isEmphasized: demoProps.isEmphasized,
          isDisabled: demoProps.isDisabled,
          onChange: (nextValue) => {
            setValue(nextValue);
            setDemoProps((current) =>
              current.valueSource === "value" ? { ...current, value: nextValue } : current,
            );
          },
        },
        renderKey,
      ),
    }),
    colorScheme,
  );
}

function parseSpectrumColorForDemo(value, fallback = colorAreaDemoDefaults.value) {
  try {
    return spectrumParseColor(value || fallback);
  } catch {
    return spectrumParseColor(fallback);
  }
}

function colorToCssString(color) {
  return color?.toString?.("css") ?? "";
}

function colorSwatchPickerToCssString(color) {
  return colorToCssString(color).replace(
    /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(?:1|1\.0+)\)$/i,
    "rgb($1, $2, $3)",
  );
}

function ReactColorAreaDemo() {
  const [demoProps, setDemoProps] = useState(colorAreaDemoPropsFromWindow);
  const [value, setValue] = useState(() =>
    parseSpectrumColorForDemo(initialColorAreaDemoValue(demoProps)),
  );
  const [finalValue, setFinalValue] = useState(() =>
    parseSpectrumColorForDemo(initialColorAreaDemoValue(demoProps)),
  );
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorarea") {
        const nextProps = normalizeColorAreaDemoProps(event.detail.props ?? {});
        const nextValue = parseSpectrumColorForDemo(initialColorAreaDemoValue(nextProps));
        setDemoProps(nextProps);
        setValue(nextValue);
        setFinalValue(nextValue);
      }
    };
    window.addEventListener(colorAreaControlsEvent, handleControlsChange);
    return () => window.removeEventListener(colorAreaControlsEvent, handleControlsChange);
  }, []);

  const valueProps =
    demoProps.valueSource === "defaultValue"
      ? {
          defaultValue: parseSpectrumColorForDemo(
            demoProps.defaultValue,
            colorAreaDemoDefaults.defaultValue,
          ),
        }
      : { value };
  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "defaultValue" ? demoProps.defaultValue : "controlled",
    demoProps.colorSpace,
    demoProps.xChannel,
    demoProps.yChannel,
    demoProps.ariaLabel,
    demoProps.ariaLabelledBy,
    demoProps.ariaDescribedBy,
    demoProps.ariaDetails,
    demoProps.id,
    demoProps.slot,
    demoProps.xName,
    demoProps.yName,
    demoProps.form,
    demoProps.isDisabled,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "colorarea",
      "data-comparison-control-props": serializeColorAreaDemoProps(demoProps),
      "data-comparison-value": colorToCssString(value),
      "data-comparison-final-value": colorToCssString(finalValue),
      children: jsx(
        SpectrumColorArea,
        {
          "aria-label": demoProps.ariaLabel || undefined,
          "aria-labelledby": demoProps.ariaLabelledBy || undefined,
          "aria-describedby": demoProps.ariaDescribedBy || undefined,
          "aria-details": demoProps.ariaDetails || undefined,
          ...valueProps,
          colorSpace: demoProps.colorSpace || undefined,
          xChannel: demoProps.xChannel,
          yChannel: demoProps.yChannel,
          xName: demoProps.xName || undefined,
          yName: demoProps.yName || undefined,
          form: demoProps.form || undefined,
          id: demoProps.id || undefined,
          slot: demoProps.slot || undefined,
          isDisabled: demoProps.isDisabled,
          onChange: (nextValue) => {
            setValue(nextValue);
            setDemoProps((current) =>
              current.valueSource === "value"
                ? { ...current, value: colorToCssString(nextValue) }
                : current,
            );
          },
          onChangeEnd: setFinalValue,
        },
        renderKey,
      ),
    }),
    colorScheme,
    locale,
  );
}

function parseSpectrumColorSliderValue(
  value,
  fallback = colorSliderDemoDefaults.value,
  colorSpace = "",
) {
  try {
    const color = spectrumParseSliderColor(value || fallback);
    return colorSpace ? color.toFormat(colorSpace) : color;
  } catch {
    const color = spectrumParseSliderColor(fallback);
    return colorSpace ? color.toFormat(colorSpace) : color;
  }
}

function ReactColorSliderDemo() {
  const [demoProps, setDemoProps] = useState(colorSliderDemoPropsFromWindow);
  const [value, setValue] = useState(() =>
    parseSpectrumColorSliderValue(
      initialColorSliderDemoValue(demoProps),
      colorSliderDemoDefaults.value,
      colorSliderEffectiveColorSpace(demoProps),
    ),
  );
  const [finalValue, setFinalValue] = useState(() =>
    parseSpectrumColorSliderValue(
      initialColorSliderDemoValue(demoProps),
      colorSliderDemoDefaults.value,
      colorSliderEffectiveColorSpace(demoProps),
    ),
  );
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorslider") {
        const nextProps = normalizeColorSliderDemoProps(event.detail.props ?? {});
        const nextColorSpace = colorSliderEffectiveColorSpace(nextProps);
        const nextValue = parseSpectrumColorSliderValue(
          initialColorSliderDemoValue(nextProps),
          colorSliderDemoDefaults.value,
          nextColorSpace,
        );
        setDemoProps(nextProps);
        setValue(nextValue);
        setFinalValue(nextValue);
      }
    };
    window.addEventListener(colorSliderControlsEvent, handleControlsChange);
    return () => window.removeEventListener(colorSliderControlsEvent, handleControlsChange);
  }, []);

  const valueProps =
    demoProps.valueSource === "defaultValue"
      ? {
          defaultValue: parseSpectrumColorSliderValue(
            demoProps.defaultValue,
            colorSliderDemoDefaults.defaultValue,
            colorSliderEffectiveColorSpace(demoProps),
          ),
        }
      : { value };
  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "defaultValue" ? demoProps.defaultValue : "controlled",
    demoProps.channel,
    demoProps.colorSpace,
    demoProps.orientation,
    demoProps.ariaLabel,
    demoProps.ariaLabelledBy,
    demoProps.ariaDescribedBy,
    demoProps.ariaDetails,
    demoProps.id,
    demoProps.slot,
    demoProps.label,
    demoProps.name,
    demoProps.form,
    demoProps.isDisabled,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "colorslider",
      "data-comparison-control-props": serializeColorSliderDemoProps(demoProps),
      "data-comparison-value": colorToCssString(value),
      "data-comparison-final-value": colorToCssString(finalValue),
      children: jsx(
        SpectrumColorSlider,
        {
          "aria-label": demoProps.ariaLabel || undefined,
          "aria-labelledby": demoProps.ariaLabelledBy || undefined,
          "aria-describedby": demoProps.ariaDescribedBy || undefined,
          "aria-details": demoProps.ariaDetails || undefined,
          ...valueProps,
          label: demoProps.label || undefined,
          channel: demoProps.channel,
          colorSpace: demoProps.colorSpace || undefined,
          name: demoProps.name || undefined,
          form: demoProps.form || undefined,
          id: demoProps.id || undefined,
          slot: demoProps.slot || undefined,
          orientation: demoProps.orientation,
          isDisabled: demoProps.isDisabled,
          onChange: (nextValue) => {
            setValue(nextValue);
            setDemoProps((current) =>
              current.valueSource === "value"
                ? { ...current, value: colorToCssString(nextValue) }
                : current,
            );
          },
          onChangeEnd: setFinalValue,
        },
        renderKey,
      ),
    }),
    colorScheme,
    locale,
  );
}

function parseSpectrumColorWheelValue(value, fallback = colorWheelDemoDefaults.value) {
  try {
    return spectrumParseWheelColor(value || fallback);
  } catch {
    return spectrumParseWheelColor(fallback);
  }
}

function ReactColorWheelDemo() {
  const [demoProps, setDemoProps] = useState(colorWheelDemoPropsFromWindow);
  const [value, setValue] = useState(() =>
    parseSpectrumColorWheelValue(initialColorWheelDemoValue(demoProps)),
  );
  const [finalValue, setFinalValue] = useState(() =>
    parseSpectrumColorWheelValue(initialColorWheelDemoValue(demoProps)),
  );
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorwheel") {
        const nextProps = normalizeColorWheelDemoProps(event.detail.props ?? {});
        const nextValue = parseSpectrumColorWheelValue(initialColorWheelDemoValue(nextProps));
        setDemoProps(nextProps);
        setValue(nextValue);
        setFinalValue(nextValue);
      }
    };
    window.addEventListener(colorWheelControlsEvent, handleControlsChange);
    return () => window.removeEventListener(colorWheelControlsEvent, handleControlsChange);
  }, []);

  const valueProps =
    demoProps.valueSource === "defaultValue"
      ? {
          defaultValue: parseSpectrumColorWheelValue(
            demoProps.defaultValue,
            colorWheelDemoDefaults.defaultValue,
          ),
        }
      : { value };
  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "defaultValue" ? demoProps.defaultValue : "controlled",
    demoProps.size,
    demoProps.ariaLabel,
    demoProps.ariaLabelledBy,
    demoProps.ariaDescribedBy,
    demoProps.ariaDetails,
    demoProps.id,
    demoProps.slot,
    demoProps.name,
    demoProps.form,
    demoProps.isDisabled,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "colorwheel",
      "data-comparison-control-props": serializeColorWheelDemoProps(demoProps),
      "data-comparison-value": colorToCssString(value),
      "data-comparison-final-value": colorToCssString(finalValue),
      children: jsx(
        SpectrumColorWheel,
        {
          "aria-label": demoProps.ariaLabel || undefined,
          "aria-labelledby": demoProps.ariaLabelledBy || undefined,
          "aria-describedby": demoProps.ariaDescribedBy || undefined,
          "aria-details": demoProps.ariaDetails || undefined,
          ...valueProps,
          size: colorWheelDemoSizeNumber(demoProps),
          name: demoProps.name || undefined,
          form: demoProps.form || undefined,
          id: demoProps.id || undefined,
          slot: demoProps.slot || undefined,
          isDisabled: demoProps.isDisabled,
          onChange: (nextValue) => {
            setValue(nextValue);
            setDemoProps((current) =>
              current.valueSource === "value"
                ? { ...current, value: colorToCssString(nextValue) }
                : current,
            );
          },
          onChangeEnd: setFinalValue,
        },
        renderKey,
      ),
    }),
    colorScheme,
    locale,
  );
}

function ReactColorSwatchDemo() {
  const [demoProps, setDemoProps] = useState(colorSwatchDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorswatch") {
        setDemoProps(normalizeColorSwatchDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(colorSwatchControlsEvent, handleControlsChange);
    return () => window.removeEventListener(colorSwatchControlsEvent, handleControlsChange);
  }, []);

  const renderKey = [
    demoProps.color,
    demoProps.colorName,
    demoProps.size,
    demoProps.rounding,
    demoProps.ariaLabel,
    demoProps.ariaLabelledBy,
    demoProps.ariaDescribedBy,
    demoProps.ariaDetails,
    demoProps.id,
    demoProps.slot,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "colorswatch",
      "data-comparison-control-props": serializeColorSwatchDemoProps(demoProps),
      children: jsx(
        SpectrumColorSwatch,
        {
          color: demoProps.color || undefined,
          colorName: demoProps.colorName || undefined,
          size: demoProps.size,
          rounding: demoProps.rounding,
          "aria-label": demoProps.ariaLabel || undefined,
          "aria-labelledby": demoProps.ariaLabelledBy || undefined,
          "aria-describedby": demoProps.ariaDescribedBy || undefined,
          "aria-details": demoProps.ariaDetails || undefined,
          id: demoProps.id || undefined,
          slot: demoProps.slot || undefined,
        },
        renderKey,
      ),
    }),
    colorScheme,
    locale,
  );
}

function ReactColorSwatchPickerDemo() {
  const [demoProps, setDemoProps] = useState(colorSwatchPickerDemoPropsFromWindow);
  const [value, setValue] = useState(() => initialColorSwatchPickerDemoValue(demoProps));
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorswatchpicker") {
        const nextProps = normalizeColorSwatchPickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialColorSwatchPickerDemoValue(nextProps));
      }
    };
    window.addEventListener(colorSwatchControlsEvent, handleControlsChange);
    return () => window.removeEventListener(colorSwatchControlsEvent, handleControlsChange);
  }, []);

  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "value" ? demoProps.value : demoProps.defaultValue,
    demoProps.density,
    demoProps.size,
    demoProps.rounding,
    demoProps.ariaLabel,
    demoProps.ariaLabelledBy,
    demoProps.ariaDescribedBy,
    demoProps.ariaDetails,
    demoProps.id,
    demoProps.slot,
  ].join("|");

  const pickerProps = {
    density: demoProps.density,
    size: demoProps.size,
    rounding: demoProps.rounding,
    "aria-label": demoProps.ariaLabel || undefined,
    "aria-labelledby": demoProps.ariaLabelledBy || undefined,
    "aria-describedby": demoProps.ariaDescribedBy || undefined,
    "aria-details": demoProps.ariaDetails || undefined,
    id: demoProps.id || undefined,
    slot: demoProps.slot || undefined,
    onChange: (nextValue) => {
      const nextString = colorSwatchPickerToCssString(nextValue);
      setValue(nextString);
      setDemoProps((current) =>
        current.valueSource === "value" ? { ...current, value: nextString } : current,
      );
    },
  };

  if (demoProps.valueSource === "value") {
    pickerProps.value = demoProps.value;
  } else {
    pickerProps.defaultValue = demoProps.defaultValue;
  }

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "colorswatchpicker",
      "data-comparison-control-props": serializeColorSwatchPickerDemoProps(demoProps),
      "data-comparison-value": value,
      children: jsx(
        SpectrumColorSwatchPicker,
        {
          ...pickerProps,
          children: colorSwatchPickerPalette.map((item) =>
            jsx(
              SpectrumPickerColorSwatch,
              {
                color: item.color,
                colorName: item.colorName,
              },
              item.color,
            ),
          ),
        },
        renderKey,
      ),
    }),
    colorScheme,
    locale,
  );
}

function parseSpectrumColorFieldValue(value, fallback = colorFieldDemoDefaults.value) {
  try {
    return value ? spectrumParseColor(value) : null;
  } catch {
    return spectrumParseColor(fallback);
  }
}

function ReactColorFieldDemo() {
  const [demoProps, setDemoProps] = useState(colorFieldDemoPropsFromWindow);
  const [value, setValue] = useState(() =>
    parseSpectrumColorFieldValue(initialColorFieldDemoValue(demoProps)),
  );
  const colorScheme = useComparisonResolvedTheme();
  const locale = buttonDemoLocaleFromWindow();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorfield") {
        const nextProps = normalizeColorFieldDemoProps(event.detail.props ?? {});
        const nextValue = parseSpectrumColorFieldValue(initialColorFieldDemoValue(nextProps));
        setDemoProps(nextProps);
        setValue(nextValue);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const valueProps =
    demoProps.valueSource === "defaultValue"
      ? {
          defaultValue: parseSpectrumColorFieldValue(
            demoProps.defaultValue,
            colorFieldDemoDefaults.defaultValue,
          ),
        }
      : { value };
  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "defaultValue" ? demoProps.defaultValue : "controlled",
    demoProps.channel,
    demoProps.colorSpace,
    demoProps.ariaLabel,
    demoProps.ariaLabelledBy,
    demoProps.ariaDescribedBy,
    demoProps.ariaDetails,
    demoProps.id,
    demoProps.slot,
    demoProps.label,
    demoProps.description,
    demoProps.errorMessage,
    demoProps.placeholder,
    demoProps.name,
    demoProps.form,
    demoProps.isDisabled,
    demoProps.isReadOnly,
    demoProps.isRequired,
    demoProps.isInvalid,
    demoProps.validationBehavior,
    demoProps.isWheelDisabled,
    demoProps.size,
    demoProps.labelPosition,
    demoProps.labelAlign,
    demoProps.necessityIndicator,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "colorfield",
      "data-comparison-control-props": serializeColorFieldDemoProps(demoProps),
      "data-comparison-value": colorToCssString(value),
      children: jsx(
        SpectrumColorField,
        {
          "aria-label": demoProps.ariaLabel || undefined,
          "aria-labelledby": demoProps.ariaLabelledBy || undefined,
          "aria-describedby": demoProps.ariaDescribedBy || undefined,
          "aria-details": demoProps.ariaDetails || undefined,
          ...valueProps,
          label: demoProps.label || undefined,
          description: demoProps.description || undefined,
          errorMessage: demoProps.errorMessage || undefined,
          placeholder: demoProps.placeholder || undefined,
          channel: demoProps.channel || undefined,
          colorSpace: demoProps.colorSpace || undefined,
          name: demoProps.name || undefined,
          form: demoProps.form || undefined,
          id: demoProps.id || undefined,
          slot: demoProps.slot || undefined,
          isDisabled: demoProps.isDisabled,
          isReadOnly: demoProps.isReadOnly,
          isRequired: demoProps.isRequired,
          isInvalid: demoProps.isInvalid,
          validationBehavior: demoProps.validationBehavior || undefined,
          isWheelDisabled: demoProps.isWheelDisabled,
          size: demoProps.size,
          labelPosition: demoProps.labelPosition,
          labelAlign: demoProps.labelAlign,
          necessityIndicator: demoProps.necessityIndicator,
          onChange: (nextValue) => {
            setValue(nextValue);
            setDemoProps((current) =>
              current.valueSource === "value"
                ? { ...current, value: colorToCssString(nextValue) }
                : current,
            );
          },
        },
        renderKey,
      ),
    }),
    colorScheme,
    locale,
  );
}

function ReactDialogDemo() {
  const [demoProps, setDemoProps] = useState(dialogDemoPropsFromWindow);
  const [isOpen, setIsOpen] = useState(() => demoProps.isOpen);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "dialog") {
        const nextProps = normalizeDialogDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setIsOpen(nextProps.isOpen);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const serializedProps = serializeDialogDemoProps({
    ...demoProps,
    isOpen,
  });

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "dialog",
      "data-comparison-control-props": serializedProps,
      "data-comparison-open": String(isOpen),
      children: jsxs(SpectrumDialogTrigger, {
        isOpen,
        onOpenChange: (nextOpen) => {
          setIsOpen(nextOpen);
          setDemoProps((current) => ({ ...current, isOpen: nextOpen }));
        },
        children: [
          jsx(SpectrumButton, { variant: "primary", children: demoProps.triggerLabel }),
          jsxs(SpectrumDialog, {
            isDismissible: demoProps.isDismissible,
            isKeyboardDismissDisabled: demoProps.isKeyboardDismissDisabled,
            role: demoProps.role,
            size: demoProps.size,
            children: [
              jsx(SpectrumHeading, { slot: "title", children: demoProps.title }),
              jsx(SpectrumContent, {
                children: jsx(SpectrumText, {
                  children: demoProps.body,
                }),
              }),
            ],
          }),
        ],
      }),
    }),
    colorScheme,
  );
}

function ReactCheckboxDemo() {
  const [demoProps, setDemoProps] = useState(checkboxDemoPropsFromWindow);
  const [isSelected, setIsSelected] = useState(() => initialCheckboxDemoSelected(demoProps));
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "checkbox") {
        const nextProps = normalizeCheckboxDemoProps(event.detail.props);
        setDemoProps(nextProps);
        setIsSelected(initialCheckboxDemoSelected(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);
  const selectionProps =
    demoProps.selectionSource === "defaultSelected"
      ? { defaultSelected: demoProps.defaultSelected }
      : { isSelected };
  const renderKey = [
    demoProps.selectionSource,
    demoProps.selectionSource === "defaultSelected" ? demoProps.defaultSelected : "controlled",
    demoProps.name,
    demoProps.value,
    demoProps.form,
    demoProps.validationBehavior,
    demoProps.isRequired,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-checked": String(isSelected),
      children: jsx(
        SpectrumCheckbox,
        {
          "data-comparison-control-root": "checkbox",
          "data-comparison-control-props": serializeCheckboxDemoProps(demoProps),
          size: demoProps.size,
          ...selectionProps,
          isIndeterminate: demoProps.isIndeterminate,
          isEmphasized: demoProps.isEmphasized,
          name: demoProps.name || undefined,
          value: demoProps.value || undefined,
          form: demoProps.form || undefined,
          validationBehavior: demoProps.validationBehavior || undefined,
          isDisabled: demoProps.isDisabled,
          isReadOnly: demoProps.isReadOnly,
          isRequired: demoProps.isRequired,
          isInvalid: demoProps.isInvalid,
          onChange: (nextSelected) => {
            setIsSelected(nextSelected);
            setDemoProps((current) =>
              current.selectionSource === "isSelected"
                ? { ...current, isSelected: nextSelected }
                : current,
            );
          },
          children: demoProps.children,
        },
        renderKey,
      ),
    }),
    colorScheme,
  );
}

function ReactCheckboxGroupDemo() {
  const [demoProps, setDemoProps] = useState(checkboxGroupDemoPropsFromWindow);
  const [value, setValue] = useState(() => initialCheckboxGroupDemoValue(demoProps));
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "checkboxgroup") {
        const nextProps = normalizeCheckboxGroupDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialCheckboxGroupDemoValue(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const selectedValues = value.join(",");
  const valueProps =
    demoProps.valueSource === "defaultValue"
      ? { defaultValue: initialCheckboxGroupDemoValue(demoProps) }
      : { value };
  const renderKey = [
    demoProps.valueSource,
    demoProps.valueSource === "defaultValue" ? demoProps.defaultValue : "controlled",
    demoProps.name,
    demoProps.form,
    demoProps.validationBehavior,
  ].join("|");

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-values": selectedValues,
      "data-comparison-control-root": "checkboxgroup",
      "data-comparison-control-props": serializeCheckboxGroupDemoProps(demoProps),
      children: jsx(
        SpectrumCheckboxGroup,
        {
          label: demoProps.label,
          ...valueProps,
          size: demoProps.size,
          orientation: demoProps.orientation,
          labelPosition: demoProps.labelPosition,
          labelAlign: demoProps.labelAlign,
          necessityIndicator: demoProps.necessityIndicator,
          name: demoProps.name || undefined,
          form: demoProps.form || undefined,
          validationBehavior: demoProps.validationBehavior || undefined,
          description: demoProps.description,
          errorMessage: demoProps.errorMessage,
          contextualHelp: demoProps.withContextualHelp
            ? jsxs(SpectrumContextualHelp, {
                children: [
                  jsx(SpectrumHeading, { children: "Notification help" }),
                  jsx(SpectrumContent, { children: "Choose every channel that should alert you." }),
                ],
              })
            : undefined,
          isEmphasized: demoProps.isEmphasized,
          isDisabled: demoProps.isDisabled,
          isReadOnly: demoProps.isReadOnly,
          isRequired: demoProps.isRequired,
          isInvalid: demoProps.isInvalid,
          onChange: (nextValue) => {
            const nextSelectedValues = nextValue.map(String);
            setValue(nextSelectedValues);
            setDemoProps((current) =>
              current.valueSource === "value"
                ? { ...current, selectedValues: nextSelectedValues.join(",") }
                : current,
            );
          },
          children: checkboxGroupItems.map((item) =>
            jsx(SpectrumCheckbox, { value: item.value, children: item.label }, item.value),
          ),
        },
        renderKey,
      ),
    }),
    colorScheme,
  );
}

function ReactRadioGroupDemo() {
  const [demoProps, setDemoProps] = useState(radioGroupDemoPropsFromWindow);
  const [value, setValue] = useState(() => demoProps.selectedValue);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "radiogroup") {
        const nextProps = normalizeRadioGroupDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.selectedValue);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected-value": value,
      "data-comparison-control-root": "radiogroup",
      "data-comparison-control-props": serializeRadioGroupDemoProps({
        ...demoProps,
        selectedValue: value,
      }),
      children: jsx(SpectrumRadioGroup, {
        label: demoProps.label,
        value,
        size: demoProps.size,
        orientation: demoProps.orientation,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isEmphasized: demoProps.isEmphasized,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, selectedValue: nextValue }));
        },
        children: radioGroupItems.map((item) =>
          jsx(SpectrumRadio, { value: item.value, children: item.label }, item.value),
        ),
      }),
    }),
    colorScheme,
  );
}

function ReactCalendarDemo() {
  const [demoProps, setDemoProps] = useState(calendarDemoPropsFromWindow);
  const [value, setValue] = useState(() =>
    calendarDateFromString(calendarDemoPropsFromWindow().value),
  );
  const [focusedValue, setFocusedValue] = useState(() =>
    calendarDateFromString(
      calendarDemoPropsFromWindow().focusedValue || calendarDemoPropsFromWindow().value,
    ),
  );
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "calendar") {
        setDemoProps((currentProps) => {
          const nextProps = normalizeCalendarDemoProps({
            ...currentProps,
            ...(event.detail.props ?? {}),
          });
          setValue(calendarDateFromString(nextProps.value));
          setFocusedValue(calendarDateFromString(nextProps.focusedValue || nextProps.value));
          return nextProps;
        });
      }
    };
    window.addEventListener(calendarControlsEvent, handleControlsChange);
    return () => window.removeEventListener(calendarControlsEvent, handleControlsChange);
  }, []);

  const selectedValue = value;
  const visibleMonths = calendarVisibleMonthsFromString(demoProps.visibleMonths);
  const resolvedVisibleMonths = visibleMonths ?? 1;
  const calendarReferenceWidth = `${resolvedVisibleMonths * 224 + (resolvedVisibleMonths - 1) * 24}px`;
  const calendarProps = {
    "aria-label": "Event date",
    onChange: (nextValue) => setValue(nextValue),
    minValue: demoProps.constrainRange ? calendarMinValue : undefined,
    maxValue: demoProps.constrainRange ? calendarMaxValue : undefined,
    isDateUnavailable: demoProps.unavailableDates ? isCalendarDateUnavailable : undefined,
    isDisabled: demoProps.isDisabled,
    isReadOnly: demoProps.isReadOnly,
    isInvalid: demoProps.isInvalid,
    errorMessage: demoProps.errorMessage,
    firstDayOfWeek: demoProps.firstDayOfWeek || undefined,
    visibleMonths,
    pageBehavior: demoProps.pageBehavior || undefined,
    selectionAlignment: demoProps.selectionAlignment || undefined,
    createCalendar: calendarCreateCalendarForDemo(demoProps.calendarSystem),
    focusedValue: demoProps.focusedValue ? (focusedValue ?? undefined) : undefined,
    onFocusChange: (nextFocusedValue) => setFocusedValue(nextFocusedValue),
    UNSAFE_className: "comparison-calendar-root",
    UNSAFE_style: {
      "--cell-responsive-size": "32px",
      width: calendarReferenceWidth,
      maxWidth: "100%",
    },
  };

  if (selectedValue) {
    calendarProps.value = selectedValue;
  }

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "calendar",
      "data-comparison-control-props": serializeCalendarDemoProps(demoProps),
      "data-comparison-value": selectedValue ? String(selectedValue) : "",
      "data-comparison-focused-value": focusedValue ? String(focusedValue) : "",
      "data-comparison-color-scheme": colorScheme,
      children: jsx(SpectrumCalendar, calendarProps),
    }),
    colorScheme,
    demoProps.locale || undefined,
  );
}

function ReactRangeCalendarDemo() {
  const initialDemoProps = rangeCalendarDemoPropsFromWindow();
  const [demoProps, setDemoProps] = useState(() => initialDemoProps);
  const [value, setValue] = useState(() => rangeCalendarValueFromDemo(initialDemoProps));
  const [focusedValue, setFocusedValue] = useState(() =>
    rangeCalendarDateFromString(initialDemoProps.focusedValue || initialDemoProps.startValue),
  );
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "rangecalendar") {
        setDemoProps((currentProps) => {
          const nextProps = normalizeRangeCalendarDemoProps({
            ...currentProps,
            ...(event.detail.props ?? {}),
          });
          setValue(rangeCalendarValueFromDemo(nextProps));
          setFocusedValue(
            rangeCalendarDateFromString(nextProps.focusedValue || nextProps.startValue),
          );
          return nextProps;
        });
      }
    };
    window.addEventListener(rangeCalendarControlsEvent, handleControlsChange);
    return () => window.removeEventListener(rangeCalendarControlsEvent, handleControlsChange);
  }, []);

  const selectedValue = value;
  const visibleMonths = rangeCalendarVisibleMonthsFromString(demoProps.visibleMonths);
  const resolvedVisibleMonths = visibleMonths ?? 1;
  const calendarReferenceWidth = `${resolvedVisibleMonths * 224 + (resolvedVisibleMonths - 1) * 24}px`;
  const rangeCalendarProps = {
    "aria-label": "Trip dates",
    value: selectedValue ?? undefined,
    onChange: (nextValue) => setValue(nextValue),
    minValue: demoProps.constrainRange ? rangeCalendarMinValue : undefined,
    maxValue: demoProps.constrainRange ? rangeCalendarMaxValue : undefined,
    isDateUnavailable: demoProps.unavailableDates ? isRangeCalendarDateUnavailable : undefined,
    allowsNonContiguousRanges: demoProps.allowsNonContiguousRanges,
    isDisabled: demoProps.isDisabled,
    isReadOnly: demoProps.isReadOnly,
    isInvalid: demoProps.isInvalid,
    errorMessage: demoProps.errorMessage,
    firstDayOfWeek: demoProps.firstDayOfWeek || undefined,
    visibleMonths,
    pageBehavior: demoProps.pageBehavior || undefined,
    selectionAlignment: demoProps.selectionAlignment || undefined,
    createCalendar: calendarCreateCalendarForDemo(demoProps.calendarSystem),
    focusedValue: demoProps.focusedValue ? (focusedValue ?? undefined) : undefined,
    onFocusChange: (nextFocusedValue) => setFocusedValue(nextFocusedValue),
    UNSAFE_className: "comparison-rangecalendar-root",
    UNSAFE_style: {
      "--cell-responsive-size": "32px",
      width: calendarReferenceWidth,
      maxWidth: "100%",
    },
  };

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "rangecalendar",
      "data-comparison-control-props": serializeRangeCalendarDemoProps(demoProps),
      "data-comparison-value": serializeRangeCalendarValue(selectedValue),
      "data-comparison-focused-value": focusedValue ? String(focusedValue) : "",
      "data-comparison-color-scheme": colorScheme,
      "data-comparison-locale": demoProps.locale,
      "data-comparison-calendar-system": demoProps.calendarSystem,
      children: jsx(SpectrumRangeCalendar, rangeCalendarProps),
    }),
    colorScheme,
    demoProps.locale || undefined,
  );
}

function ReactDatePickerDemo() {
  const initialDemoProps = datePickerDemoPropsFromWindow();
  const [demoProps, setDemoProps] = useState(() => initialDemoProps);
  const [value, setValue] = useState(() => datePickerValueFromDemo(initialDemoProps));
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "datepicker") {
        const nextProps = normalizeDatePickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(datePickerValueFromDemo(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const contextualHelp = demoProps.withContextualHelp
    ? jsxs(SpectrumContextualHelp, {
        children: [
          jsx(SpectrumHeading, { slot: "title", children: "Date help" }),
          jsx(SpectrumContent, { children: "Choose an available project due date." }),
        ],
      })
    : undefined;

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-value": serializeDatePickerValue(value),
      "data-comparison-open": String(isOpen),
      "data-comparison-color-scheme": colorScheme,
      "data-comparison-locale": demoProps.locale,
      "data-comparison-calendar-system": demoProps.calendarSystem,
      children: jsx(SpectrumDatePicker, {
        "data-comparison-control-root": "datepicker",
        "data-comparison-control-props": serializeDatePickerDemoProps(demoProps),
        label: demoProps.label,
        size: demoProps.size,
        contextualHelp,
        value: value ?? undefined,
        granularity: demoProps.granularity,
        shouldForceLeadingZeros: demoProps.shouldForceLeadingZeros,
        hourCycle: demoProps.hourCycle ? Number(demoProps.hourCycle) : undefined,
        hideTimeZone: demoProps.hideTimeZone,
        maxVisibleMonths: Number(demoProps.maxVisibleMonths),
        minValue: demoProps.constrainRange ? datePickerMinValue(demoProps.granularity) : undefined,
        maxValue: demoProps.constrainRange ? datePickerMaxValue(demoProps.granularity) : undefined,
        createCalendar: calendarCreateCalendarForDemo(demoProps.calendarSystem),
        isDateUnavailable: demoProps.unavailableDates ? isDatePickerDateUnavailable : undefined,
        firstDayOfWeek: demoProps.firstDayOfWeek || undefined,
        pageBehavior: demoProps.pageBehavior || undefined,
        name: demoProps.name || undefined,
        form: demoProps.form || undefined,
        validationBehavior: demoProps.validationBehavior || undefined,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => setValue(nextValue),
        onOpenChange: setIsOpen,
        UNSAFE_className: "comparison-datepicker-root",
      }),
    }),
    colorScheme,
    demoProps.locale || void 0,
  );
}

function ReactDateFieldDemo() {
  const initialDemoProps = dateFieldDemoPropsFromWindow();
  const [demoProps, setDemoProps] = useState(() => initialDemoProps);
  const [value, setValue] = useState(() => dateFieldValueFromDemo(initialDemoProps));
  const colorScheme = useComparisonResolvedTheme();
  const serializedProps = serializeDateFieldDemoProps(demoProps);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "datefield") {
        const nextProps = normalizeDateFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(dateFieldValueFromDemo(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const contextualHelp = demoProps.withContextualHelp
    ? jsxs(SpectrumContextualHelp, {
        children: [
          jsx(SpectrumHeading, { slot: "title", children: "Date help" }),
          jsx(SpectrumContent, { children: "Choose an available appointment date." }),
        ],
      })
    : undefined;
  const isAriaBuiltinInvalid =
    demoProps.validationBehavior === "aria" && isDateFieldDemoValueInvalid(demoProps, value);
  const isInvalid = demoProps.isInvalid || isAriaBuiltinInvalid;

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "datefield",
      "data-comparison-control-props": serializedProps,
      "data-comparison-react-builtin-invalid": String(isAriaBuiltinInvalid),
      "data-comparison-value": serializeDateFieldValue(value),
      "data-comparison-locale": demoProps.locale,
      "data-comparison-color-scheme": colorScheme,
      children: jsx(
        SpectrumDateField,
        {
          label: demoProps.label,
          size: demoProps.size,
          labelPosition: demoProps.labelPosition,
          labelAlign: demoProps.labelAlign,
          necessityIndicator: demoProps.necessityIndicator,
          contextualHelp,
          value: value ?? undefined,
          granularity: demoProps.granularity,
          shouldForceLeadingZeros: demoProps.shouldForceLeadingZeros,
          hourCycle: demoProps.hourCycle ? Number(demoProps.hourCycle) : undefined,
          hideTimeZone: demoProps.hideTimeZone,
          minValue: demoProps.constrainRange ? dateFieldMinValue(demoProps.granularity) : undefined,
          maxValue: demoProps.constrainRange ? dateFieldMaxValue(demoProps.granularity) : undefined,
          isDateUnavailable: demoProps.unavailableDates ? isDateFieldDateUnavailable : undefined,
          name: demoProps.name || undefined,
          form: demoProps.form || undefined,
          validationBehavior: demoProps.validationBehavior || undefined,
          description: demoProps.description,
          errorMessage: demoProps.errorMessage,
          isDisabled: demoProps.isDisabled,
          isReadOnly: demoProps.isReadOnly,
          isRequired: demoProps.isRequired,
          isInvalid,
          onChange: (nextValue) => setValue(nextValue),
          UNSAFE_className: "comparison-datefield-root",
        },
        serializedProps,
      ),
    }),
    colorScheme,
    demoProps.locale || void 0,
  );
}

function ReactTimeFieldDemo() {
  const initialDemoProps = timeFieldDemoPropsFromWindow();
  const [demoProps, setDemoProps] = useState(() => initialDemoProps);
  const [value, setValue] = useState(() => timeFieldValueFromDemo(initialDemoProps));
  const colorScheme = useComparisonResolvedTheme();
  const serializedProps = serializeTimeFieldDemoProps(demoProps);
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "timefield") {
        const nextProps = normalizeTimeFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(timeFieldValueFromDemo(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const contextualHelp = demoProps.withContextualHelp
    ? jsxs(SpectrumContextualHelp, {
        children: [
          jsx(SpectrumHeading, { slot: "title", children: "Time help" }),
          jsx(SpectrumContent, { children: "Choose a start time in your schedule." }),
        ],
      })
    : undefined;
  const isAriaBuiltinInvalid =
    demoProps.validationBehavior === "aria" && isTimeFieldDemoValueInvalid(demoProps, value);
  const isInvalid = demoProps.isInvalid || isAriaBuiltinInvalid;

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-control-root": "timefield",
      "data-comparison-control-props": serializedProps,
      "data-comparison-react-builtin-invalid": String(isAriaBuiltinInvalid),
      "data-comparison-value": serializeTimeFieldValue(value),
      "data-comparison-locale": demoProps.locale,
      "data-comparison-color-scheme": colorScheme,
      children: jsx(SpectrumTimeField, {
        label: demoProps.label,
        size: demoProps.size,
        labelPosition: demoProps.labelPosition,
        labelAlign: demoProps.labelAlign,
        necessityIndicator: demoProps.necessityIndicator,
        contextualHelp,
        value: value ?? undefined,
        granularity: demoProps.granularity,
        shouldForceLeadingZeros: demoProps.shouldForceLeadingZeros,
        hourCycle: demoProps.hourCycle ? Number(demoProps.hourCycle) : undefined,
        hideTimeZone: demoProps.hideTimeZone,
        minValue: demoProps.constrainRange ? timeFieldMinValue() : undefined,
        maxValue: demoProps.constrainRange ? timeFieldMaxValue() : undefined,
        name: demoProps.name || undefined,
        form: demoProps.form || undefined,
        validationBehavior: demoProps.validationBehavior || undefined,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid,
        onChange: (nextValue) => setValue(nextValue),
        UNSAFE_className: "comparison-timefield-root",
      }),
    }),
    colorScheme,
    demoProps.locale || void 0,
  );
}

function ReactDateRangePickerDemo() {
  const initialDemoProps = dateRangePickerDemoPropsFromWindow();
  const [demoProps, setDemoProps] = useState(() => initialDemoProps);
  const [value, setValue] = useState(() => dateRangePickerValueFromDemo(initialDemoProps));
  const [isOpen, setIsOpen] = useState(false);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "daterangepicker") {
        const nextProps = normalizeDateRangePickerDemoProps({
          ...demoProps,
          ...(event.detail.props ?? {}),
        });
        setDemoProps(nextProps);
        setValue(dateRangePickerValueFromDemo(nextProps));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, [demoProps]);

  const dateRangePickerProps = {
    "data-comparison-control-root": "daterangepicker",
    "data-comparison-control-props": serializeDateRangePickerDemoProps(demoProps),
    "data-comparison-locale": demoProps.locale,
    "data-comparison-calendar-system": demoProps.calendarSystem,
    label: demoProps.label,
    size: demoProps.size,
    value: value ?? undefined,
    granularity: demoProps.granularity,
    hourCycle: demoProps.hourCycle ? Number(demoProps.hourCycle) : undefined,
    hideTimeZone: demoProps.hideTimeZone,
    maxVisibleMonths: Number(demoProps.maxVisibleMonths),
    minValue: demoProps.constrainRange ? dateRangePickerMinValue(demoProps.granularity) : undefined,
    maxValue: demoProps.constrainRange ? dateRangePickerMaxValue(demoProps.granularity) : undefined,
    createCalendar: calendarCreateCalendarForDemo(demoProps.calendarSystem),
    isDateUnavailable: demoProps.unavailableDates ? isDateRangePickerDateUnavailable : undefined,
    allowsNonContiguousRanges: demoProps.allowsNonContiguousRanges,
    firstDayOfWeek: demoProps.firstDayOfWeek || undefined,
    pageBehavior: demoProps.pageBehavior || undefined,
    startName: demoProps.startName || undefined,
    endName: demoProps.endName || undefined,
    form: demoProps.form || undefined,
    validationBehavior: demoProps.validationBehavior || undefined,
    description: demoProps.description,
    errorMessage: demoProps.errorMessage,
    isDisabled: demoProps.isDisabled,
    isReadOnly: demoProps.isReadOnly,
    isRequired: demoProps.isRequired,
    isInvalid: demoProps.isInvalid,
    onChange: (nextValue) => setValue(nextValue),
    onOpenChange: setIsOpen,
    UNSAFE_className: "comparison-daterangepicker-root",
  };

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-value": serializeDateRangePickerValue(value),
      "data-comparison-open": String(isOpen),
      "data-comparison-color-scheme": colorScheme,
      children: jsx(SpectrumDateRangePicker, dateRangePickerProps),
    }),
    colorScheme,
    demoProps.locale || undefined,
  );
}

function ReactSearchFieldDemo() {
  const [demoProps, setDemoProps] = useState(searchFieldDemoPropsFromWindow);
  const [value, setValue] = useState(() => searchFieldDemoPropsFromWindow().value);
  const [clearCount, setClearCount] = useState(0);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "searchfield") {
        const nextProps = normalizeSearchFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(nextProps.value);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const serializedProps = serializeSearchFieldDemoProps({
    ...demoProps,
    value,
  });

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-value": value,
      "data-comparison-clear-count": String(clearCount),
      children: jsx(SpectrumSearchField, {
        "data-comparison-control-root": "searchfield",
        "data-comparison-control-props": serializedProps,
        label: demoProps.label,
        value,
        placeholder: demoProps.placeholder,
        size: demoProps.size,
        description: demoProps.description,
        errorMessage: demoProps.errorMessage,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        isRequired: demoProps.isRequired,
        isInvalid: demoProps.isInvalid,
        onChange: (nextValue) => {
          setValue(nextValue);
          setDemoProps((current) => ({ ...current, value: nextValue }));
        },
        onClear: () => {
          setValue("");
          setDemoProps((current) => ({ ...current, value: "" }));
          setClearCount((count) => count + 1);
        },
      }),
    }),
    colorScheme,
  );
}

function ReactSwitchDemo() {
  const [demoProps, setDemoProps] = useState(switchDemoPropsFromWindow);
  const [isSelected, setIsSelected] = useState(() => demoProps.isSelected);
  const colorScheme = useComparisonResolvedTheme();
  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "switch") {
        const nextProps = normalizeSwitchDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setIsSelected(nextProps.isSelected);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      "data-comparison-selected": String(isSelected),
      "data-comparison-control-root": "switch",
      "data-comparison-control-props": serializeSwitchDemoProps({
        ...demoProps,
        isSelected,
      }),
      children: jsx(SpectrumSwitch, {
        size: demoProps.size,
        isSelected,
        isEmphasized: demoProps.isEmphasized,
        isDisabled: demoProps.isDisabled,
        isReadOnly: demoProps.isReadOnly,
        onChange: (nextSelected) => {
          setIsSelected(nextSelected);
          setDemoProps((current) => ({ ...current, isSelected: nextSelected }));
        },
        children: demoProps.children,
      }),
    }),
    colorScheme,
  );
}

function ReactContextualHelpDemo() {
  const [demoProps, setDemoProps] = useState(contextualHelpDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "contextualhelp") {
        setDemoProps(normalizeContextualHelpDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    setDemoProps(contextualHelpDemoPropsFromWindow());
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-button-row",
      "data-comparison-control-root": "contextualhelp",
      "data-comparison-control-props": serializeContextualHelpDemoProps(demoProps),
      children: jsxs(SpectrumContextualHelp, {
        "aria-label": demoProps.triggerLabel,
        containerPadding: demoProps.containerPadding,
        crossOffset: demoProps.crossOffset,
        isOpen: demoProps.isOpen,
        offset: demoProps.offset,
        onOpenChange: (nextOpen) => {
          setDemoProps((current) =>
            current.isOpen && !nextOpen && isContextualHelpOpenControlChecked()
              ? current
              : normalizeContextualHelpDemoProps({
                  ...current,
                  isOpen: nextOpen,
                }),
          );
        },
        placement: demoProps.placement,
        shouldFlip: demoProps.shouldFlip,
        size: demoProps.size,
        variant: demoProps.variant,
        children: [
          jsx(SpectrumHeading, { children: demoProps.heading }),
          jsx(SpectrumContent, { children: demoProps.content }),
          jsx(SpectrumFooter, {
            children: jsx(SpectrumLink, {
              isStandalone: true,
              href: "#",
              target: "_blank",
              children: "Learn more about segments",
            }),
          }),
        ],
      }),
    }),
    colorScheme,
  );
}

function ReactTooltipDemo() {
  const [demoProps, setDemoProps] = useState(tooltipDemoPropsFromWindow);
  const colorScheme = useComparisonResolvedTheme();

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "tooltip") {
        setDemoProps(normalizeTooltipDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    setDemoProps(tooltipDemoPropsFromWindow());
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  const isRenderedOpen = demoProps.isDisabled ? false : demoProps.isOpen;

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-button-row",
      "data-comparison-control-root": "tooltip",
      "data-comparison-control-props": serializeTooltipDemoProps(demoProps),
      "data-comparison-tooltip-props": serializeTooltipDemoProps(demoProps),
      children: jsxs(SpectrumTooltipTrigger, {
        delay: demoProps.delay,
        isDisabled: demoProps.isDisabled,
        isOpen: isRenderedOpen,
        onOpenChange: (nextOpen) => {
          setDemoProps((current) =>
            current.isOpen && !nextOpen && isTooltipOpenControlChecked()
              ? current
              : normalizeTooltipDemoProps({
                  ...current,
                  isOpen: nextOpen,
                }),
          );
        },
        placement: demoProps.placement,
        shouldCloseOnPress: demoProps.shouldCloseOnPress,
        shouldFlip: demoProps.shouldFlip,
        trigger: demoProps.trigger,
        children: [
          jsx(SpectrumActionButton, {
            "aria-label": demoProps.actionLabel,
            children: jsx(ReactButtonIcon, {}),
          }),
          jsx(SpectrumTooltip, { children: demoProps.children }),
        ],
      }),
    }),
    colorScheme,
  );
}

function toastQueueOptions(demoProps, onAction, onClose) {
  return {
    actionLabel: demoProps.showAction ? demoProps.actionLabel : undefined,
    onAction: demoProps.showAction ? onAction : undefined,
    onClose,
    shouldCloseOnAction: demoProps.shouldCloseOnAction,
    timeout: demoProps.autoDismiss ? demoProps.timeout : undefined,
  };
}

function ReactToastDemo() {
  const [demoProps, setDemoProps] = useState(toastDemoPropsFromWindow);
  const [actionCount, setActionCount] = useState(0);
  const [closeCount, setCloseCount] = useState(0);
  const closeRefs = useRef([]);
  const suppressCloseCountRef = useRef(false);
  const colorScheme = useComparisonResolvedTheme();
  const handleToastClose = () => {
    if (!suppressCloseCountRef.current) {
      setCloseCount((count) => count + 1);
    }
  };

  useEffect(() => {
    const handleControlsChange = (event) => {
      if (event instanceof CustomEvent && event.detail?.component === "toast") {
        setActionCount(0);
        setCloseCount(0);
        setDemoProps(normalizeToastDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    setDemoProps(toastDemoPropsFromWindow());
    return () => window.removeEventListener(comparisonControlsEvent, handleControlsChange);
  }, []);

  useEffect(() => {
    suppressCloseCountRef.current = true;
    closeRefs.current.forEach((close) => close());
    closeRefs.current = [];
    suppressCloseCountRef.current = false;
    closeRefs.current = Array.from({ length: demoProps.count }, (_item, index) =>
      SpectrumToastQueue[demoProps.variant](
        demoProps.count > 1 ? `${demoProps.children} ${index + 1}` : demoProps.children,
        toastQueueOptions(demoProps, () => setActionCount((count) => count + 1), handleToastClose),
      ),
    );

    return () => {
      suppressCloseCountRef.current = true;
      closeRefs.current.forEach((close) => close());
      closeRefs.current = [];
      suppressCloseCountRef.current = false;
    };
  }, [demoProps]);

  return renderReactSpectrumReference(
    jsx("div", {
      className: "comparison-toast-stage",
      style: { maxWidth: "100%", minHeight: 96, width: 360 },
      "data-comparison-control-root": "toast",
      "data-comparison-control-props": serializeToastDemoProps(demoProps),
      "data-comparison-toast-props": serializeToastDemoProps(demoProps),
      "data-comparison-toast-action-count": String(actionCount),
      "data-comparison-toast-close-count": String(closeCount),
      children: jsx(SpectrumToastContainer, {
        placement: demoProps.placement,
        "aria-label": demoProps["aria-label"],
        PRIVATE_forceReducedMotion: true,
      }),
    }),
    colorScheme,
  );
}

const providerShellStyle = {
  padding: 0,
  background: "transparent",
};

const cardViewDemoStyle = {
  width: 360,
  height: 180,
};

const nestedProviderStyle = {
  padding: 16,
  marginTop: 16,
  borderRadius: 16,
};
