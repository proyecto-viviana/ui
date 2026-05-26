import h from "solid-js/h";
import {
  createEffect,
  createMemo,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
  Show,
  splitProps,
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
  CardPreview as SolidSpectrumCardPreview,
  CardView as SolidSpectrumCardView,
  Cell as SolidSpectrumCell,
  Checkbox as SolidSpectrumCheckbox,
  CheckboxGroup as SolidSpectrumCheckboxGroup,
  ColorArea as SolidSpectrumColorArea,
  ColorField as SolidSpectrumColorField,
  ColorSlider as SolidSpectrumColorSlider,
  ColorWheel as SolidSpectrumColorWheel,
  ColorSwatch as SolidSpectrumColorSwatch,
  ColorSwatchPicker as SolidSpectrumColorSwatchPicker,
  ComboBox as SolidSpectrumComboBox,
  ComboBoxItem as SolidSpectrumComboBoxItem,
  Column as SolidSpectrumColumn,
  Content as SolidSpectrumContent,
  ContextualHelp as SolidSpectrumContextualHelp,
  DateField as SolidSpectrumDateField,
  DateRangePicker as SolidSpectrumDateRangePicker,
  DatePicker as SolidSpectrumDatePicker,
  Disclosure as SolidSpectrumDisclosure,
  DisclosureHeader as SolidSpectrumDisclosureHeader,
  DisclosurePanel as SolidSpectrumDisclosurePanel,
  DisclosureTitle as SolidSpectrumDisclosureTitle,
  Dialog as SolidSpectrumDialog,
  DialogTrigger as SolidSpectrumDialogTrigger,
  Divider as SolidSpectrumDivider,
  DropZone as SolidSpectrumDropZone,
  Footer as SolidSpectrumFooter,
  Form as SolidSpectrumForm,
  Heading as SolidSpectrumHeading,
  Image as SolidSpectrumImage,
  ImageCoordinator as SolidSpectrumImageCoordinator,
  IllustratedMessage as SolidSpectrumIllustratedMessage,
  InlineAlert as SolidSpectrumInlineAlert,
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
  Popover as SolidSpectrumPopover,
  ProgressBar as SolidSpectrumProgressBar,
  ProgressCircle as SolidSpectrumProgressCircle,
  Provider as SolidSpectrumProvider,
  Radio as SolidSpectrumRadio,
  RadioGroup as SolidSpectrumRadioGroup,
  RangeCalendar as SolidSpectrumRangeCalendar,
  RangeSlider as SolidSpectrumRangeSlider,
  Row as SolidSpectrumRow,
  SearchField as SolidSpectrumSearchField,
  Skeleton as SolidSpectrumSkeleton,
  Slider as SolidSpectrumSlider,
  StatusLight as SolidSpectrumStatusLight,
  Switch as SolidSpectrumSwitch,
  SegmentedControl as SolidSpectrumSegmentedControl,
  SegmentedControlItem as SolidSpectrumSegmentedControlItem,
  SelectBox as SolidSpectrumSelectBox,
  SelectBoxGroup as SolidSpectrumSelectBoxGroup,
  Tab as SolidSpectrumTab,
  TabList as SolidSpectrumTabList,
  TabPanel as SolidSpectrumTabPanel,
  TableBody as SolidSpectrumTableBody,
  TableHeader as SolidSpectrumTableHeader,
  TableView as SolidSpectrumTableView,
  Tabs as SolidSpectrumTabs,
  Tag as SolidSpectrumTag,
  TagGroup as SolidSpectrumTagGroup,
  TextArea as SolidSpectrumTextArea,
  TextField as SolidSpectrumTextField,
  Text as SolidSpectrumText,
  TimeField as SolidSpectrumTimeField,
  Tooltip as SolidSpectrumTooltip,
  TooltipTrigger as SolidSpectrumTooltipTrigger,
  ToastContainer as SolidSpectrumToastContainer,
  ToastQueue as SolidSpectrumToastQueue,
  ToggleButton as SolidSpectrumToggleButton,
  ToggleButtonGroup as SolidSpectrumToggleButtonGroup,
  TreeView as SolidSpectrumTreeView,
  TreeViewItem as SolidSpectrumTreeViewItem,
  createIcon,
  createIllustration,
  parseColor as parseSolidSpectrumColor,
} from "@proyecto-viviana/solid-spectrum";
import { s2ButtonText } from "../../../../../../packages/solid-spectrum/src/button/s2-button-styles";
import {
  s2ActionButtonText,
  s2ToggleButtonText,
} from "../../../../../../packages/solid-spectrum/src/button/s2-action-button-styles";
import type { ComparisonSlug } from "@comparison/data/comparison-manifest";
import {
  comparisonActionItems as actionItems,
  comparisonTabItems as tabItems,
} from "@comparison/data/comparison-contract";
import {
  accordionDemoLocaleFromWindow,
  accordionDemoPropsFromWindow,
  normalizeAccordionDemoProps,
  serializeAccordionKeys,
  serializeAccordionDemoProps,
  type AccordionDemoProps,
} from "@comparison/data/accordion-demo";
import {
  disclosureDemoLocaleFromWindow,
  disclosureDemoPropsFromWindow,
  normalizeDisclosureDemoProps,
  serializeDisclosureDemoProps,
  type DisclosureDemoProps,
} from "@comparison/data/disclosure-demo";
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
  cardDemoPropsFromWindow,
  normalizeCardDemoProps,
  serializeCardDemoProps,
  type CardDemoProps,
} from "@comparison/data/card-demo";
import {
  cardViewDemoPropsFromWindow,
  cardViewItems,
  cardViewKeysFromValue,
  initialCardViewSelectedKeys,
  normalizeCardViewDemoProps,
  serializeCardViewDemoProps,
  serializeCardViewKeys,
  type CardViewDemoProps,
} from "@comparison/data/cardview-demo";
import {
  buttonDemoLocaleFromWindow,
  buttonDemoPropsFromWindow,
  comparisonControlsEvent,
  serializeButtonDemoProps,
  type ButtonDemoProps,
} from "@comparison/data/button-demo";
import {
  checkboxDemoPropsFromWindow,
  initialCheckboxDemoSelected,
  normalizeCheckboxDemoProps,
  serializeCheckboxDemoProps,
  type CheckboxDemoProps,
} from "@comparison/data/checkbox-demo";
import {
  checkboxGroupDemoPropsFromWindow,
  initialCheckboxGroupDemoValue,
  normalizeCheckboxGroupDemoProps,
  serializeCheckboxGroupDemoProps,
  type CheckboxGroupDemoProps,
} from "@comparison/data/checkboxgroup-demo";
import {
  colorAreaDemoDefaults,
  colorAreaDemoPropsFromWindow,
  initialColorAreaDemoValue,
  normalizeColorAreaDemoProps,
  serializeColorAreaDemoProps,
  type ColorAreaDemoProps,
} from "@comparison/data/colorarea-demo";
import {
  colorSliderEffectiveColorSpace,
  colorSliderDemoDefaults,
  colorSliderDemoPropsFromWindow,
  initialColorSliderDemoValue,
  normalizeColorSliderDemoProps,
  serializeColorSliderDemoProps,
  type ColorSliderDemoProps,
} from "@comparison/data/colorslider-demo";
import {
  colorWheelDemoDefaults,
  colorWheelDemoPropsFromWindow,
  colorWheelDemoSizeNumber,
  initialColorWheelDemoValue,
  normalizeColorWheelDemoProps,
  serializeColorWheelDemoProps,
  type ColorWheelDemoProps,
} from "@comparison/data/colorwheel-demo";
import {
  colorSwatchDemoPropsFromWindow,
  normalizeColorSwatchDemoProps,
  serializeColorSwatchDemoProps,
  type ColorSwatchDemoProps,
} from "@comparison/data/colorswatch-demo";
import {
  colorSwatchPickerDemoPropsFromWindow,
  colorSwatchPickerPalette,
  initialColorSwatchPickerDemoValue,
  normalizeColorSwatchPickerDemoProps,
  serializeColorSwatchPickerDemoProps,
  type ColorSwatchPickerDemoProps,
} from "@comparison/data/colorswatchpicker-demo";
import {
  colorFieldDemoDefaults,
  colorFieldDemoPropsFromWindow,
  initialColorFieldDemoValue,
  normalizeColorFieldDemoProps,
  serializeColorFieldDemoProps,
  type ColorFieldDemoProps,
} from "@comparison/data/colorfield-demo";
import {
  normalizeRadioGroupDemoProps,
  radioGroupDemoPropsFromWindow,
  serializeRadioGroupDemoProps,
  type RadioGroupDemoProps,
} from "@comparison/data/radiogroup-demo";
import {
  initialSegmentedControlSelectedKey,
  normalizeSegmentedControlDemoProps,
  segmentedControlDemoPropsFromWindow,
  segmentedControlItems,
  serializeSegmentedControlDemoProps,
  type SegmentedControlDemoProps,
  type SegmentedControlKey,
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
  type SelectBoxGroupDemoProps,
} from "@comparison/data/selectboxgroup-demo";
import {
  listViewDemoItems,
  initialListViewSelectedKeys,
  listViewDemoPropsFromWindow,
  listViewKeysFromValue,
  normalizeListViewDemoProps,
  serializeListViewDemoProps,
  serializeListViewKeys,
  type ListViewDemoItem,
  type ListViewDemoProps,
} from "@comparison/data/listview-demo";
import {
  disabledTagGroupKeys,
  initialTagGroupSelectedKeys,
  normalizeTagGroupDemoProps,
  serializeTagGroupDemoProps,
  serializeTagGroupKeys,
  tagGroupDemoPropsFromWindow,
  tagGroupInitialItems,
  tagGroupItems,
  tagGroupKeysFromValue,
  type TagGroupDemoProps,
} from "@comparison/data/taggroup-demo";
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
  dateFieldMaxValue,
  dateFieldMinValue,
  dateFieldDemoPropsFromWindow,
  dateFieldValueFromDemo,
  isDateFieldDateUnavailable,
  normalizeDateFieldDemoProps,
  serializeDateFieldDemoProps,
  serializeDateFieldValue,
  type DateFieldDemoProps,
} from "@comparison/data/datefield-demo";
import {
  timeFieldMaxValue,
  timeFieldMinValue,
  timeFieldDemoPropsFromWindow,
  timeFieldValueFromDemo,
  normalizeTimeFieldDemoProps,
  serializeTimeFieldDemoProps,
  serializeTimeFieldValue,
  type TimeFieldDemoProps,
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
  dropZoneDemoPropsFromWindow,
  normalizeDropZoneDemoProps,
  serializeDropZoneDemoProps,
  type DropZoneDemoProps,
} from "@comparison/data/dropzone-demo";
import {
  illustratedMessageDemoPropsFromWindow,
  normalizeIllustratedMessageDemoProps,
  serializeIllustratedMessageDemoProps,
  type IllustratedMessageDemoProps,
} from "@comparison/data/illustratedmessage-demo";
import {
  iconsDemoPropsFromWindow,
  normalizeIconsDemoProps,
  serializeIconsDemoProps,
  type IconsDemoProps,
} from "@comparison/data/icons-demo";
import {
  illustrationsDemoPropsFromWindow,
  normalizeIllustrationsDemoProps,
  serializeIllustrationsDemoProps,
  type IllustrationsDemoProps,
} from "@comparison/data/illustrations-demo";
import {
  inlineAlertDemoPropsFromWindow,
  normalizeInlineAlertDemoProps,
  serializeInlineAlertDemoProps,
  type InlineAlertDemoProps,
} from "@comparison/data/inlinealert-demo";
import {
  initialTabsDemoSelectedKey,
  normalizeTabsDemoProps,
  serializeTabsDemoProps,
  tabsDemoDisabledKeys,
  tabsDemoPropsFromWindow,
  type TabsDemoProps,
} from "@comparison/data/tabs-demo";
import {
  dialogDemoPropsFromWindow,
  normalizeDialogDemoProps,
  serializeDialogDemoProps,
  type DialogDemoProps,
} from "@comparison/data/dialog-demo";
import {
  imageDemoPropsFromWindow,
  imageMissingSource,
  imageDemoSources,
  normalizeImageDemoProps,
  serializeImageDemoProps,
  type ImageDemoProps,
  type ImageObjectFit,
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
  progressBarFormatOptionsForPreset,
  normalizeProgressBarDemoProps,
  normalizeProgressCircleDemoProps,
  progressBarDemoPropsFromWindow,
  progressCircleDemoPropsFromWindow,
  serializeProgressBarDemoProps,
  serializeProgressCircleDemoProps,
  type ProgressBarDemoProps,
  type ProgressCircleDemoProps,
} from "@comparison/data/progress-demo";
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
  initialRangeSliderDemoValue,
  normalizeRangeSliderDemoProps,
  rangeSliderDemoPropsFromWindow,
  rangeSliderFormatOptionsForPreset,
  serializeRangeSliderDemoProps,
  type RangeSliderDemoProps,
} from "@comparison/data/rangeslider-demo";
import {
  initialSliderDemoValue,
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
  contextualHelpDemoPropsFromWindow,
  isContextualHelpOpenControlChecked,
  normalizeContextualHelpDemoProps,
  serializeContextualHelpDemoProps,
  type ContextualHelpDemoProps,
} from "@comparison/data/contextualhelp-demo";
import {
  isPopoverOpenControlChecked,
  normalizePopoverDemoProps,
  popoverDemoPropsFromWindow,
  serializePopoverDemoProps,
  type PopoverDemoProps,
} from "@comparison/data/popover-demo";
import {
  isTooltipOpenControlChecked,
  normalizeTooltipDemoProps,
  serializeTooltipDemoProps,
  tooltipDemoPropsFromWindow,
  type TooltipDemoProps,
} from "@comparison/data/tooltip-demo";
import {
  normalizeToastDemoProps,
  serializeToastDemoProps,
  toastDemoPropsFromWindow,
  type ToastDemoProps,
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
type TabItem = (typeof tabItems)[number];
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

type SolidIllustrationSvgProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: "S" | "M" | "L";
};

const SolidPlanIllustration = createIllustration((props: SolidIllustrationSvgProps) => {
  const { class: className, size: _size, ...rest } = props;
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

const SolidDropZoneIllustration = createIllustration((props: SolidIllustrationSvgProps) => {
  const [local, rest] = splitProps(props, ["class", "size"]);
  return h(
    "svg",
    mergeProps(
      {
        xmlns: "http://www.w3.org/2000/svg",
        viewBox: "0 0 48 48",
      },
      rest,
      {
        get class() {
          return local.class;
        },
      },
    ),
    [
      h("path", {
        d: "M24 8 12 20h7v11h10V20h7L24 8Z",
        fill: "var(--iconPrimary, #222)",
      }),
      h("path", {
        d: "M12 34h24v4H12v-4Z",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.42",
      }),
      h("path", {
        d: "M8 28h6v4H8c-2.2 0-4-1.8-4-4V14c0-2.2 1.8-4 4-4h6v4H8v14Zm26-18h6c2.2 0 4 1.8 4 4v14c0 2.2-1.8 4-4 4h-6v-4h6V14h-6v-4Z",
        fill: "var(--iconPrimary, #222)",
        opacity: "0.18",
      }),
    ],
  )() as JSX.Element;
});

const SolidIllustratedMessageIllustration = createIllustration(
  (props: SolidIllustrationSvgProps) => {
    const [local, rest] = splitProps(props, ["class", "size"]);
    return h(
      "svg",
      mergeProps(
        {
          xmlns: "http://www.w3.org/2000/svg",
          viewBox: "0 0 48 48",
        },
        rest,
        {
          get class() {
            return local.class;
          },
        },
      ),
      [
        h("rect", {
          x: "7",
          y: "11",
          width: "34",
          height: "28",
          rx: "6",
          fill: "var(--iconPrimary, #222)",
          opacity: "0.14",
        }),
        h("path", {
          d: "M16 18h16v4H16v-4Zm0 8h11v4H16v-4Z",
          fill: "var(--iconPrimary, #222)",
        }),
        h("path", {
          d: "M31 29 37 23l3 3-9 9-5-5 3-3 2 2Z",
          fill: "var(--iconPrimary, #222)",
        }),
      ],
    )() as JSX.Element;
  },
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

const cardPreviewImageSrc =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 320 180'%3E%3Crect width='320' height='180' fill='%232c7be5'/%3E%3Cpath d='M0 132 82 74l68 42 62-58 108 96v26H0z' fill='%23d6e9ff' opacity='.9'/%3E%3Ccircle cx='248' cy='48' r='24' fill='%23fff3b0'/%3E%3C/svg%3E";

const actionBarItems = [
  { id: "edit", label: "Edit" },
  { id: "copy", label: "Copy" },
  { id: "delete", label: "Delete" },
];

const collectionDocuments = [
  { id: "project-brief", name: "Project brief.pdf", description: "PDF document" },
  { id: "quarterly-report", name: "Quarterly report.docx", description: "Document" },
  { id: "budget", name: "Budget.xlsx", description: "Spreadsheet" },
];

const collectionTableColumns = [
  { key: "name", id: "name", name: "Name", isRowHeader: true },
  { key: "type", id: "type", name: "Type" },
  { key: "owner", id: "owner", name: "Owner" },
  { key: "status", id: "status", name: "Status" },
];

const collectionTableRows = [
  { id: "project-brief", name: "Project brief.pdf", type: "PDF", owner: "Maya", status: "Ready" },
  {
    id: "quarterly-report",
    name: "Quarterly report.docx",
    type: "Document",
    owner: "Noah",
    status: "Review",
  },
  { id: "budget", name: "Budget.xlsx", type: "Spreadsheet", owner: "Iris", status: "Draft" },
];

const collectionTreeItems = [
  {
    key: "documents",
    textValue: "Documents",
    value: { name: "Documents" },
    children: [
      {
        key: "project",
        textValue: "Project",
        value: { name: "Project" },
        children: [
          { key: "weekly-report", textValue: "Weekly Report", value: { name: "Weekly Report" } },
          { key: "budget", textValue: "Budget", value: { name: "Budget" } },
        ],
      },
    ],
  },
  {
    key: "photos",
    textValue: "Photos",
    value: { name: "Photos" },
    children: [{ key: "image-1", textValue: "Image 1", value: { name: "Image 1" } }],
  },
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

function queryParamFromWindow(name: string) {
  if (typeof window === "undefined") {
    return null;
  }

  return new URLSearchParams(window.location.search).get(name);
}

function selectedKeysParamFromWindow(fallback: string[]) {
  const value = queryParamFromWindow("selectedKeys");
  return new Set(value ? value.split(",").filter(Boolean) : fallback);
}

function createComparisonResolvedThemeSignal() {
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
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
  return colorScheme;
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
  disclosure: () => h(SolidSpectrumDisclosureDemo, {}),
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
  card: () => h(SolidSpectrumCardDemo, {}),
  checkbox: () => h(SolidSpectrumCheckboxDemo, {}),
  checkboxgroup: () => h(SolidSpectrumCheckboxGroupDemo, {}),
  colorarea: () => h(SolidSpectrumColorAreaDemo, {}),
  colorslider: () => h(SolidSpectrumColorSliderDemo, {}),
  colorwheel: () => h(SolidSpectrumColorWheelDemo, {}),
  colorswatch: () => h(SolidSpectrumColorSwatchDemo, {}),
  colorswatchpicker: () => h(SolidSpectrumColorSwatchPickerDemo, {}),
  colorfield: () => h(SolidSpectrumColorFieldDemo, {}),
  combobox: () => h(SolidSpectrumComboBoxDemo, {}),
  contextualhelp: () => h(SolidSpectrumContextualHelpDemo, {}),
  datefield: () => h(SolidSpectrumDateFieldDemo, {}),
  timefield: () => h(SolidSpectrumTimeFieldDemo, {}),
  daterangepicker: () => h(SolidSpectrumDateRangePickerDemo, {}),
  datepicker: () => h(SolidSpectrumDatePickerDemo, {}),
  dialog: () => h(SolidSpectrumDialogDemo, {}),
  rangecalendar: () => h(SolidSpectrumRangeCalendarDemo, {}),
  divider: () => h(SolidSpectrumDividerDemo, {}),
  dropzone: () => h(SolidSpectrumDropZoneDemo, {}),
  icons: () => h(SolidSpectrumIconsDemo, {}),
  illustrations: () => h(SolidSpectrumIllustrationsDemo, {}),
  illustratedmessage: () => h(SolidSpectrumIllustratedMessageDemo, {}),
  inlinealert: () => h(SolidSpectrumInlineAlertDemo, {}),
  form: () => h(SolidSpectrumFormDemo, {}),
  image: () => h(SolidSpectrumImageDemo, {}),
  link: () => h(SolidSpectrumLinkDemo, {}),
  listview: () => h(SolidSpectrumListViewDemo, {}),
  menu: () => h(SolidSpectrumMenuDemo, {}),
  meter: () => h(SolidSpectrumMeterDemo, {}),
  numberfield: () => h(SolidSpectrumNumberFieldDemo, {}),
  picker: () => h(SolidSpectrumPickerDemo, {}),
  popover: () => h(SolidSpectrumPopoverDemo, {}),
  progressbar: () => h(SolidSpectrumProgressBarDemo, {}),
  progresscircle: () => h(SolidSpectrumProgressCircleDemo, {}),
  radiogroup: () => h(SolidSpectrumRadioGroupDemo, {}),
  linkbutton: () => h(SolidSpectrumLinkButtonDemo, {}),
  cardview: () => h(SolidSpectrumCardViewDemo, {}),
  segmentedcontrol: () => h(SolidSpectrumSegmentedControlDemo, {}),
  selectboxgroup: () => h(SolidSpectrumSelectBoxGroupDemo, {}),
  searchfield: () => h(SolidSpectrumSearchFieldDemo, {}),
  rangeslider: () => h(SolidSpectrumRangeSliderDemo, {}),
  skeleton: () => h(SolidSpectrumSkeletonDemo, {}),
  slider: () => h(SolidSpectrumSliderDemo, {}),
  statuslight: () => h(SolidSpectrumStatusLightDemo, {}),
  switch: () => h(SolidSpectrumSwitchDemo, {}),
  tabs: () => h(SolidSpectrumTabsDemo, {}),
  tableview: () => h(SolidSpectrumTableViewDemo, {}),
  taggroup: () => h(SolidSpectrumTagGroupDemo, {}),
  textarea: () => h(SolidSpectrumTextAreaDemo, {}),
  textfield: () => h(SolidSpectrumTextFieldDemo, {}),
  tooltip: () => h(SolidSpectrumTooltipDemo, {}),
  toast: () => h(SolidSpectrumToastDemo, {}),
  togglebutton: () => h(SolidSpectrumToggleButtonDemo, {}),
  togglebuttongroup: () => h(SolidSpectrumToggleButtonGroupDemo, {}),
  treeview: () => h(SolidSpectrumTreeViewDemo, {}),
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

function SolidSpectrumIconsDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();
  const [demoProps, setDemoProps] = createSignal<IconsDemoProps>(iconsDemoPropsFromWindow());

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "icons") {
        setDemoProps(normalizeIconsDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const renderedIcons = createMemo(() => {
    const props = demoProps();
    const labelledIconProps = {
      "aria-label": props.ariaLabel,
      "data-comparison-icon": "labelled",
      ...(props.ariaHidden ? { "aria-hidden": true } : {}),
      ...(props.slot ? { slot: props.slot } : {}),
    };
    const icons = [h(SolidNewIcon, labelledIconProps)];

    if (props.showDecorative) {
      icons.push(
        h(SolidNewIcon, {
          "aria-hidden": true,
          "data-comparison-icon": "decorative",
        }),
      );
    }
    if (props.showSkeleton) {
      icons.push(
        hc(SolidSpectrumSkeleton, { isLoading: true }, [
          h(SolidNewIcon, {
            "aria-label": "Loading icon",
            "data-comparison-icon": "skeleton",
          }),
        ]),
      );
    }
    if (props.showButtonContext) {
      icons.push(
        hc(
          SolidSpectrumButton,
          {
            variant: "accent",
            "data-comparison-icon": "button-context",
          },
          [h(SolidNewIcon, { "aria-hidden": true }), h(SolidSpectrumText, {}, props.buttonLabel)],
        ),
      );
    }

    return icons;
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
          style: iconGalleryStyle,
          "data-comparison-control-root": "icons",
          get "data-comparison-control-props"() {
            return serializeIconsDemoProps(demoProps());
          },
        },
        [renderedIcons],
      ),
    ],
  );
}

function SolidSpectrumIllustrationsDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();
  const [demoProps, setDemoProps] = createSignal<IllustrationsDemoProps>(
    illustrationsDemoPropsFromWindow(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "illustrations") {
        setDemoProps(normalizeIllustrationsDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const renderedIllustrations = createMemo(() => {
    const props = demoProps();
    const labelledIllustrationProps = {
      "aria-label": props.ariaLabel,
      size: props.size,
      "data-comparison-illustration": "labelled",
      ...(props.ariaHidden ? { "aria-hidden": true } : {}),
      ...(props.slot ? { slot: props.slot } : {}),
    };
    const illustrations = [h(SolidPlanIllustration, labelledIllustrationProps)];

    if (props.showDecorative) {
      illustrations.push(
        h(SolidDropZoneIllustration, {
          "aria-hidden": true,
          size: props.decorativeSize,
          "data-comparison-illustration": "decorative",
        }),
      );
    }
    if (props.showSkeleton) {
      illustrations.push(
        hc(SolidSpectrumSkeleton, { isLoading: true }, [
          h(SolidIllustratedMessageIllustration, {
            "aria-label": "Loading illustration",
            size: props.skeletonSize,
            "data-comparison-illustration": "skeleton",
          }),
        ]),
      );
    }

    return illustrations;
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
          style: illustrationGalleryStyle,
          "data-comparison-control-root": "illustrations",
          get "data-comparison-control-props"() {
            return serializeIllustrationsDemoProps(demoProps());
          },
        },
        [renderedIllustrations],
      ),
    ],
  );
}

function SolidSpectrumProgressBarDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();
  const [demoProps, setDemoProps] = createSignal<ProgressBarDemoProps>(
    progressBarDemoPropsFromWindow(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "progressbar") {
        setDemoProps(normalizeProgressBarDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
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
            return staticColorBackdropClass(demoProps().staticColor, "comparison-progressbar-row");
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          style: progressFixtureStackStyle,
          "data-comparison-control-root": "progressbar",
          get "data-comparison-control-props"() {
            return serializeProgressBarDemoProps(demoProps());
          },
        },
        [
          h(SolidSpectrumProgressBar, {
            get label() {
              return demoProps().label;
            },
            get value() {
              return demoProps().value;
            },
            get minValue() {
              return demoProps().minValue;
            },
            get maxValue() {
              return demoProps().maxValue;
            },
            get valueLabel() {
              return demoProps().valueLabel || undefined;
            },
            get formatOptions() {
              return progressBarFormatOptionsForPreset(demoProps().formatOptions);
            },
            get size() {
              return demoProps().size;
            },
            get staticColor() {
              return demoProps().staticColor || undefined;
            },
            get labelPosition() {
              return demoProps().labelPosition;
            },
            get isIndeterminate() {
              return demoProps().isIndeterminate;
            },
            "data-comparison-progressbar": "controlled",
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumProgressCircleDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();
  const [demoProps, setDemoProps] = createSignal<ProgressCircleDemoProps>(
    progressCircleDemoPropsFromWindow(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "progresscircle") {
        setDemoProps(normalizeProgressCircleDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
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
            return staticColorBackdropClass(
              demoProps().staticColor,
              "comparison-progresscircle-row",
            );
          },
          get "data-comparison-static-color"() {
            return staticColorBackdropValue(demoProps().staticColor);
          },
          style: progressCircleRowStyle,
          "data-comparison-control-root": "progresscircle",
          get "data-comparison-control-props"() {
            return serializeProgressCircleDemoProps(demoProps());
          },
        },
        [
          h(SolidSpectrumProgressCircle, {
            get "aria-label"() {
              return demoProps().ariaLabel;
            },
            get value() {
              return demoProps().value;
            },
            get minValue() {
              return demoProps().minValue;
            },
            get maxValue() {
              return demoProps().maxValue;
            },
            get size() {
              return demoProps().size;
            },
            get staticColor() {
              return demoProps().staticColor || undefined;
            },
            get isIndeterminate() {
              return demoProps().isIndeterminate;
            },
            "data-comparison-progresscircle": "controlled",
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumRangeSliderDemo() {
  const [demoProps, setDemoProps] = createSignal<RangeSliderDemoProps>(
    rangeSliderDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(initialRangeSliderDemoValue(demoProps()));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "rangeslider") {
        const nextProps = normalizeRangeSliderDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialRangeSliderDemoValue(nextProps));
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

  const serializedProps = createMemo(() => serializeRangeSliderDemoProps(demoProps()));

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
          style: rangeSliderStackStyle,
          "data-comparison-control-root": "rangeslider",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            const currentValue = value();
            return `${currentValue.start}:${currentValue.end}`;
          },
        },
        [
          hc(SolidSpectrumRangeSlider, {
            get label() {
              return demoProps().label;
            },
            get value() {
              return demoProps().valueSource === "value" ? value() : undefined;
            },
            get defaultValue() {
              return demoProps().valueSource === "defaultValue"
                ? {
                    start: demoProps().defaultStartValue,
                    end: demoProps().defaultEndValue,
                  }
                : undefined;
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
            get labelPosition() {
              return demoProps().labelPosition;
            },
            get labelAlign() {
              return demoProps().labelAlign;
            },
            get formatOptions() {
              return rangeSliderFormatOptionsForPreset(demoProps().formatOptions);
            },
            get contextualHelp() {
              return demoProps().withContextualHelp
                ? hc(SolidSpectrumContextualHelp, {}, [
                    hc(SolidSpectrumHeading, { slot: "title" }, ["Range help"]),
                    hc(SolidSpectrumText, {}, ["Choose minimum and maximum values."]),
                  ])
                : undefined;
            },
            get startName() {
              return demoProps().startName || undefined;
            },
            get endName() {
              return demoProps().endName || undefined;
            },
            get form() {
              return demoProps().form || undefined;
            },
            get isEmphasized() {
              return demoProps().isEmphasized;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            onChange: (nextValue: { start: number; end: number }) => {
              setValue(nextValue);
              setDemoProps((current: RangeSliderDemoProps) =>
                current.valueSource === "value"
                  ? normalizeRangeSliderDemoProps({
                      ...current,
                      startValue: nextValue.start,
                      endValue: nextValue.end,
                    })
                  : current,
              );
            },
            "data-comparison-rangeslider": "modeled",
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumPopoverDemo() {
  const [demoProps, setDemoProps] = createSignal<PopoverDemoProps>(popoverDemoPropsFromWindow());
  const colorScheme = createComparisonResolvedThemeSignal();
  let anchorElement: HTMLDivElement | null = null;

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "popover") {
        setDemoProps(normalizePopoverDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  const updateOpen = (nextOpen: boolean) => {
    setDemoProps((current) =>
      current.isOpen && !nextOpen && isPopoverOpenControlChecked()
        ? current
        : normalizePopoverDemoProps({ ...current, isOpen: nextOpen }),
    );
  };
  const popoverMaxHeight = () => (demoProps().maxHeight === "" ? undefined : demoProps().maxHeight);
  const popoverSize = () => (demoProps().size === "fit" ? undefined : demoProps().size);
  const popoverForm = () =>
    demoProps().showForm
      ? hc(SolidSpectrumForm, {}, [
          hc(SolidSpectrumTextField, {
            label: "Subject",
            placeholder: "Enter a summary",
          }),
          hc(SolidSpectrumTextField, {
            label: "Description",
            isRequired: true,
            placeholder: "Enter your feedback",
          }),
          hc(SolidSpectrumSwitch, {}, [
            "Adobe can contact me for further questions concerning this feedback",
          ]),
          hc(SolidSpectrumButton, { variant: "accent" }, ["Submit"]),
        ])
      : null;
  const popoverContent = () =>
    hc("div", { style: popoverContentStyle }, [
      hc("p", { style: popoverBodyTextStyle }, [() => demoProps().bodyText]),
      popoverForm,
    ]);
  const popoverProps = {
    get placement() {
      return demoProps().placement;
    },
    get offset() {
      return demoProps().offset;
    },
    get crossOffset() {
      return demoProps().crossOffset;
    },
    get containerPadding() {
      return demoProps().containerPadding;
    },
    get shouldFlip() {
      return demoProps().shouldFlip;
    },
    get hideArrow() {
      return demoProps().hideArrow;
    },
    get maxHeight() {
      return popoverMaxHeight();
    },
    get size() {
      return popoverSize();
    },
    padding: "none",
    get "aria-label"() {
      return demoProps().ariaLabel;
    },
  };
  const dialogTriggerContent = () =>
    hc(
      SolidSpectrumDialogTrigger,
      {
        get isOpen() {
          return demoProps().isOpen;
        },
        onOpenChange: updateOpen,
      },
      [
        hc(SolidSpectrumButton, { variant: "secondary" }, [() => demoProps().triggerLabel]),
        hc(SolidSpectrumPopover, popoverProps, [popoverContent]),
      ],
    );
  const customAnchorContent = () => [
    hc(
      SolidSpectrumButton,
      {
        variant: "secondary",
        onPress: () => updateOpen(!demoProps().isOpen),
      },
      [
        () =>
          demoProps().isOpen
            ? `Close ${demoProps().triggerLabel}`
            : `Open ${demoProps().triggerLabel}`,
      ],
    ),
    hc(
      "div",
      {
        ref: (element: HTMLDivElement) => {
          anchorElement = element;
        },
        style: popoverAnchorStyle,
      },
      ["Popover anchor"],
    ),
    hc(
      SolidSpectrumPopover,
      {
        get placement() {
          return demoProps().placement;
        },
        get offset() {
          return demoProps().offset;
        },
        get crossOffset() {
          return demoProps().crossOffset;
        },
        get containerPadding() {
          return demoProps().containerPadding;
        },
        get shouldFlip() {
          return demoProps().shouldFlip;
        },
        get hideArrow() {
          return demoProps().hideArrow;
        },
        get maxHeight() {
          return popoverMaxHeight();
        },
        get size() {
          return popoverSize();
        },
        padding: "none",
        get "aria-label"() {
          return demoProps().ariaLabel;
        },
        get isOpen() {
          return demoProps().isOpen;
        },
        onOpenChange: updateOpen,
        triggerRef: () => anchorElement,
      },
      [popoverContent],
    ),
  ];
  const routedPopoverContent = () =>
    demoProps().triggerMode === "dialogTrigger" ? dialogTriggerContent() : customAnchorContent();

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
          style: popoverFixtureStyle,
          "data-comparison-control-root": "popover",
          get "data-comparison-control-props"() {
            return serializePopoverDemoProps(demoProps());
          },
          get "data-comparison-open"() {
            return String(demoProps().isOpen);
          },
          get "data-comparison-popover-trigger-mode"() {
            return demoProps().triggerMode;
          },
        },
        [routedPopoverContent],
      ),
    ],
  );
}

function SolidSpectrumListViewDemo() {
  const [demoProps, setDemoProps] = createSignal<ListViewDemoProps>(listViewDemoPropsFromWindow());
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    initialListViewSelectedKeys(demoProps()),
  );
  const [actionKey, setActionKey] = createSignal("");
  const colorScheme = createComparisonResolvedThemeSignal();
  const items = createMemo(() => listViewDemoItems(demoProps()));
  const itemKeys = createMemo(() => items().map((item) => item.id));
  const selectedKeyText = createMemo(() => serializeListViewKeys(selectedKeys()));
  let listViewRoot: HTMLElement | undefined;

  createEffect(() => {
    listViewRoot?.setAttribute(
      "data-comparison-control-props",
      serializeListViewDemoProps(demoProps()),
    );
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "listview") {
        setDemoProps((current) => {
          const nextProps = normalizeListViewDemoProps({
            ...current,
            ...(event.detail.props ?? {}),
          });
          setSelectedKeys(initialListViewSelectedKeys(nextProps));
          setActionKey("");
          return nextProps;
        });
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
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
          style: collectionFixtureStyle,
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
          get "data-comparison-action-key"() {
            return actionKey();
          },
        },
        [
          hc(
            SolidSpectrumListView,
            {
              "aria-label": "Documents",
              "data-comparison-control-root": "listview",
              ref: (element: HTMLElement) => {
                listViewRoot = element;
              },
              get "data-comparison-control-props"() {
                return serializeListViewDemoProps(demoProps());
              },
              get items() {
                return items();
              },
              getKey: (item: ListViewDemoItem) => item.id,
              getTextValue: (item: ListViewDemoItem) => item.name,
              get selectionMode() {
                return demoProps().selectionMode;
              },
              get selectionStyle() {
                return demoProps().selectionStyle;
              },
              get overflowMode() {
                return demoProps().overflowMode;
              },
              get isQuiet() {
                return demoProps().isQuiet;
              },
              get hideLinkOutIcon() {
                return demoProps().hideLinkOutIcon;
              },
              get disabledKeys() {
                return listViewKeysFromValue(demoProps().disabledKeys, [], "multiple", itemKeys());
              },
              get selectedKeys() {
                return demoProps().selectionSource === "selectedKeys" ? selectedKeys() : undefined;
              },
              get defaultSelectedKeys() {
                return demoProps().selectionSource === "defaultSelectedKeys"
                  ? listViewKeysFromValue(
                      demoProps().defaultSelectedKeys,
                      itemKeys().includes("project-brief") ? ["project-brief"] : [],
                      demoProps().selectionMode,
                      itemKeys(),
                    )
                  : undefined;
              },
              renderEmptyState: () =>
                hc(SolidSpectrumIllustratedMessage, {}, [
                  hc(SolidSpectrumHeading, {}, ["No documents"]),
                  hc(SolidSpectrumContent, {}, ["Create or upload a file to continue."]),
                ]),
              get renderActionBar() {
                return demoProps().showActionBar
                  ? (keys: "all" | Set<string | number>) =>
                      hc(
                        SolidSpectrumActionBar,
                        {
                          selectedItemCount: keys === "all" ? items().length : keys.size,
                          "data-comparison-listview-actionbar": "true",
                          onClearSelection: () => setSelectedKeys(new Set<string>()),
                        },
                        [
                          hc(SolidSpectrumActionButton, {}, [
                            hc(SolidSpectrumText, {}, ["Archive"]),
                          ]),
                        ],
                      )
                  : undefined;
              },
              onAction: (key: string | number) => setActionKey(String(key)),
              onSelectionChange: (keys: "all" | Set<string | number>) =>
                setSelectedKeys(
                  keys === "all"
                    ? new Set(items().map((item) => item.id))
                    : new Set<string>(Array.from(keys, String)),
                ),
              UNSAFE_style: collectionListStyle,
            },
            renderProp((item: ListViewDemoItem) =>
              hc(
                SolidSpectrumListViewItem,
                {
                  id: item.id,
                  textValue: item.name,
                  get isDisabled() {
                    return demoProps().disabledItem === item.id;
                  },
                  get href() {
                    return demoProps().trailingIcon === "linkOut" && item.id === "project-brief"
                      ? "https://example.com/project-brief"
                      : undefined;
                  },
                  get target() {
                    return demoProps().trailingIcon === "linkOut" && item.id === "project-brief"
                      ? "_blank"
                      : undefined;
                  },
                  get hasChildItems() {
                    return demoProps().trailingIcon === "child" && item.id === "project-brief"
                      ? true
                      : undefined;
                  },
                },
                [
                  () => (demoProps().showIcons ? h(SolidNewIcon, { "aria-hidden": "true" }) : null),
                  hc(SolidSpectrumText, { slot: "label" }, [item.name]),
                  hc(
                    Show,
                    {
                      get when() {
                        return demoProps().showDescriptions;
                      },
                    },
                    [hc(SolidSpectrumText, { slot: "description" }, [item.description])],
                  ),
                  () => {
                    const actionSlot = demoProps().itemActionSlot;
                    if (actionSlot === "buttonGroup") {
                      return hc(
                        SolidSpectrumActionButtonGroup,
                        { "aria-label": `${item.name} actions` },
                        [
                          hc(SolidSpectrumActionButton, { "aria-label": `Archive ${item.name}` }, [
                            hc(SolidSpectrumText, {}, ["Archive"]),
                          ]),
                        ],
                      );
                    }

                    if (actionSlot === "actionMenu") {
                      return hc(SolidSpectrumActionMenu, { "aria-label": `${item.name} menu` }, [
                        hc(
                          SolidSpectrumMenuItem,
                          {
                            id: `${item.id}-copy`,
                            textValue: "Copy",
                          },
                          [hc(SolidSpectrumText, {}, ["Copy"])],
                        ),
                      ]);
                    }

                    return null;
                  },
                ],
              ),
            ),
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumTableViewDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();
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
          style: collectionFixtureStyle,
          "data-comparison-control-root": "tableview",
        },
        [
          hc(
            SolidSpectrumTableView,
            {
              "aria-label": "Project documents",
              items: collectionTableRows,
              columns: collectionTableColumns,
              getKey: (row: (typeof collectionTableRows)[number]) => row.id,
              selectionMode: "multiple",
              defaultSelectedKeys: ["project-brief"],
            },
            renderProp(() => [
              hc(SolidSpectrumTableHeader, {}, [
                hc(SolidSpectrumColumn, { id: "name", isRowHeader: true }, ["Name"]),
                hc(SolidSpectrumColumn, { id: "type" }, ["Type"]),
                hc(SolidSpectrumColumn, { id: "owner" }, ["Owner"]),
                hc(SolidSpectrumColumn, { id: "status" }, ["Status"]),
              ]),
              hc(
                SolidSpectrumTableBody,
                {},
                renderProp((row: (typeof collectionTableRows)[number]) =>
                  hc(
                    SolidSpectrumRow,
                    { id: row.id, item: row },
                    renderProp(() => [
                      hc(SolidSpectrumCell, {}, [row.name]),
                      hc(SolidSpectrumCell, {}, [row.type]),
                      hc(SolidSpectrumCell, {}, [row.owner]),
                      hc(SolidSpectrumCell, {}, [row.status]),
                    ]),
                  ),
                ),
              ),
            ]),
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumTagGroupDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();
  const [demoProps, setDemoProps] = createSignal<TagGroupDemoProps>(tagGroupDemoPropsFromWindow());
  const [tags, setTags] = createSignal(tagGroupInitialItems(demoProps()));
  const [selectedKeys, setSelectedKeys] = createSignal(initialTagGroupSelectedKeys(demoProps()));
  const [actionCount, setActionCount] = createSignal(0);
  const serializedProps = createMemo(() => serializeTagGroupDemoProps(demoProps()));
  const selectedValue = createMemo(() => serializeTagGroupKeys(selectedKeys()));

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "taggroup") {
        const nextProps = normalizeTagGroupDemoProps({
          ...demoProps(),
          ...event.detail.props,
        });
        setDemoProps(nextProps);
        setTags(tagGroupInitialItems(nextProps));
        setSelectedKeys(initialTagGroupSelectedKeys(nextProps));
        setActionCount(0);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
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
          style: collectionFixtureStyle,
          "data-comparison-control-root": "taggroup",
          "data-comparison-control-props": serializedProps,
          "data-comparison-selected-keys": selectedValue,
          get "data-comparison-tag-count"() {
            return String(tags().length);
          },
          get "data-comparison-action-count"() {
            return String(actionCount());
          },
        },
        [
          hc(
            SolidSpectrumTagGroup,
            {
              get label() {
                return demoProps().label;
              },
              get items() {
                return tags();
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
              get selectionMode() {
                return demoProps().selectionMode;
              },
              get selectionBehavior() {
                return demoProps().selectionBehavior;
              },
              get selectedKeys() {
                return demoProps().selectionSource === "selectedKeys" ? selectedKeys() : undefined;
              },
              get defaultSelectedKeys() {
                return demoProps().selectionSource === "defaultSelectedKeys"
                  ? tagGroupKeysFromValue(
                      demoProps().defaultSelectedKeys,
                      ["landscape"],
                      demoProps().selectionMode,
                    )
                  : undefined;
              },
              get disabledKeys() {
                return disabledTagGroupKeys(demoProps());
              },
              get isEmphasized() {
                return demoProps().isEmphasized;
              },
              get isInvalid() {
                return demoProps().isInvalid;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get description() {
                return demoProps().showDescription
                  ? "Use tags to organize photo metadata."
                  : undefined;
              },
              get errorMessage() {
                return demoProps().isInvalid && demoProps().showErrorMessage
                  ? "Choose at least one usable tag."
                  : undefined;
              },
              renderEmptyState: () => "No categories",
              UNSAFE_style: collectionTagGroupStyle,
              get groupActionLabel() {
                return demoProps().withGroupAction ? "Add tag" : undefined;
              },
              onGroupAction: () => setActionCount((count) => count + 1),
              onAction: () => setActionCount((count) => count + 1),
              onSelectionChange: (keys: Set<string | number> | "all") =>
                setSelectedKeys(
                  keys === "all" ? new Set(tagGroupItems.map((item) => item.id)) : new Set(keys),
                ),
              get onRemove() {
                if (!demoProps().allowsRemoving) {
                  return undefined;
                }

                return (keys: Set<string | number>) => {
                  setTags((currentTags) => currentTags.filter((item) => !keys.has(item.id)));
                  setSelectedKeys((currentKeys) => {
                    const nextKeys = new Set(currentKeys);
                    for (const key of keys) {
                      nextKeys.delete(String(key));
                    }
                    return nextKeys;
                  });
                };
              },
            },
            renderProp((item: (typeof tagGroupItems)[number]) =>
              hc(
                SolidSpectrumTag,
                { id: item.id },
                demoProps().contentMode === "icon"
                  ? [
                      h(SolidNewIcon, { "aria-hidden": "true" }),
                      h(SolidSpectrumText, {}, item.name),
                    ]
                  : [item.name],
              ),
            ),
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumTreeViewDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();
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
          style: collectionFixtureStyle,
          "data-comparison-control-root": "treeview",
        },
        [
          hc(
            SolidSpectrumTreeView,
            {
              "aria-label": "Files",
              items: collectionTreeItems,
              selectionMode: "multiple",
              defaultExpandedKeys: ["documents", "project"],
              defaultSelectedKeys: ["weekly-report"],
            },
            renderProp((item: { key: string; textValue: string }) =>
              hc(SolidSpectrumTreeViewItem, { id: item.key }, [item.textValue]),
            ),
          ),
        ],
      ),
    ],
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

function SolidSpectrumDisclosureDemo() {
  const [demoProps, setDemoProps] = createSignal<DisclosureDemoProps>(
    disclosureDemoPropsFromWindow(),
  );
  const locale = disclosureDemoLocaleFromWindow();
  const [expandedChangeCount, setExpandedChangeCount] = createSignal(0);
  const [lastExpandedChange, setLastExpandedChange] = createSignal("");
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "disclosure") {
        setDemoProps(normalizeDisclosureDemoProps(event.detail.props ?? {}));
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

  const disclosureTitle = () =>
    hc(
      SolidSpectrumDisclosureTitle,
      {
        get level() {
          return Number(demoProps().titleLevel);
        },
      },
      ["System Requirements"],
    );

  const disclosureHeader = () =>
    demoProps().withHeaderAction
      ? hc(SolidSpectrumDisclosureHeader, {}, [
          disclosureTitle(),
          hc(SolidSpectrumActionButton, { "aria-label": "Edit system requirements" }, [
            h(SolidNewIcon, { "aria-hidden": "true" }),
          ]),
        ])
      : disclosureTitle();

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
          class: "comparison-disclosure-row",
          "data-comparison-control-root": "disclosure",
          get "data-comparison-control-props"() {
            return serializeDisclosureDemoProps(demoProps());
          },
          get "data-comparison-expanded"() {
            return String(demoProps().isExpanded);
          },
          get "data-comparison-expanded-change-count"() {
            return String(expandedChangeCount());
          },
          get "data-comparison-expanded-change-value"() {
            return lastExpandedChange();
          },
        },
        [
          hc(
            SolidSpectrumDisclosure,
            {
              UNSAFE_style: { width: "250px" },
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
              get isExpanded() {
                return demoProps().isExpanded;
              },
              onExpandedChange(expanded: boolean) {
                setDemoProps((props) =>
                  normalizeDisclosureDemoProps({ ...props, isExpanded: expanded }),
                );
                setExpandedChangeCount((count) => count + 1);
                setLastExpandedChange(String(expanded));
              },
            },
            [
              disclosureHeader(),
              hc(
                SolidSpectrumDisclosurePanel,
                {
                  get role() {
                    return demoProps().panelRole;
                  },
                },
                [
                  hc("div", { class: "comparison-disclosure-panel-copy" }, [
                    h("span", {}, "macOS 14 or later"),
                    h("span", {}, "16 GB memory"),
                    h("span", {}, "20 GB available storage"),
                  ]),
                ],
              ),
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
          h("span", {
            id: "avatargroup-route-description",
            hidden: true,
            children: "Avatar group route description",
          }),
          h("div", {
            id: "avatargroup-route-details",
            hidden: true,
            children: "Avatar group route details",
          }),
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
                "aria-describedby": "avatargroup-route-description",
                "aria-details": "avatargroup-route-details",
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
        id: "badge-route-root",
        "aria-label": "Badge route label",
        "aria-labelledby": "badge-route-labelledby",
        "aria-describedby": "badge-route-description",
        "aria-details": "badge-route-details",
        hidden: true,
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
        id: "statuslight-route-root",
        "aria-label": "StatusLight route label",
        "aria-describedby": "statuslight-route-description",
        "aria-details": "statuslight-route-details",
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

type DropZoneCountKey = "activate" | "drop" | "enter" | "exit" | "move";

interface DropZoneCounts {
  activate: number;
  drop: number;
  enter: number;
  exit: number;
  move: number;
}

function SolidSpectrumDropZoneDemo() {
  const [demoProps, setDemoProps] = createSignal<DropZoneDemoProps>(dropZoneDemoPropsFromWindow());
  const [counts, setCounts] = createSignal<DropZoneCounts>({
    activate: 0,
    drop: 0,
    enter: 0,
    exit: 0,
    move: 0,
  });
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "dropzone") {
        setDemoProps(normalizeDropZoneDemoProps(event.detail.props ?? {}));
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

  const bump = (key: DropZoneCountKey) => {
    setCounts((current) => ({ ...current, [key]: current[key] + 1 }));
  };

  const renderedDropZone = createMemo(() =>
    hc(SolidSpectrumDropZone, {
      "data-comparison-control-root": "dropzone",
      get "data-comparison-control-props"() {
        return serializeDropZoneDemoProps(demoProps());
      },
      get "data-comparison-drop-activate-count"() {
        return counts().activate;
      },
      get "data-comparison-drop-count"() {
        return counts().drop;
      },
      get "data-comparison-drop-enter-count"() {
        return counts().enter;
      },
      get "data-comparison-drop-exit-count"() {
        return counts().exit;
      },
      get "data-comparison-drop-move-count"() {
        return counts().move;
      },
      id: "dropzone-route-root",
      get "aria-label"() {
        return demoProps().ariaLabel;
      },
      "aria-describedby": "dropzone-route-description",
      "aria-details": "dropzone-route-details",
      get size() {
        return demoProps().size;
      },
      get isFilled() {
        return demoProps().isFilled;
      },
      get replaceMessage() {
        return demoProps().replaceMessage || undefined;
      },
      onDropActivate: () => bump("activate"),
      onDrop: () => bump("drop"),
      onDropEnter: () => bump("enter"),
      onDropExit: () => bump("exit"),
      onDropMove: () => bump("move"),
      get children() {
        return hc(SolidSpectrumIllustratedMessage, {}, [
          h(SolidDropZoneIllustration, { slot: "illustration" }),
          h(SolidSpectrumHeading, {}, "Upload assets"),
          h(SolidSpectrumContent, {}, "Drop a PNG, SVG, or PDF."),
          h(
            "span",
            {
              id: "dropzone-route-description",
              hidden: true,
            },
            "Drop target accepts project files.",
          ),
          h(
            "span",
            {
              id: "dropzone-route-details",
              hidden: true,
            },
            "The comparison route records drag and drop callback counts.",
          ),
        ]);
      },
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
          class: "comparison-dropzone-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedDropZone],
      ),
    ],
  );
}

function SolidSpectrumIllustratedMessageDemo() {
  const [demoProps, setDemoProps] = createSignal<IllustratedMessageDemoProps>(
    illustratedMessageDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "illustratedmessage") {
        setDemoProps(normalizeIllustratedMessageDemoProps(event.detail.props ?? {}));
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

  const renderedMessage = createMemo(() =>
    hc(SolidSpectrumIllustratedMessage, {
      "data-comparison-control-root": "illustratedmessage",
      get "data-comparison-control-props"() {
        return serializeIllustratedMessageDemoProps(demoProps());
      },
      id: "illustratedmessage-route-root",
      role: "status",
      "aria-label": "Asset empty state",
      "aria-describedby": "illustratedmessage-route-description",
      "aria-details": "illustratedmessage-route-details",
      get size() {
        return demoProps().size;
      },
      get orientation() {
        return demoProps().orientation;
      },
      get children() {
        const children = [
          h(SolidIllustratedMessageIllustration, { slot: "illustration" }),
          h(SolidSpectrumHeading, {}, "Create your first asset"),
          h(SolidSpectrumContent, {}, "Upload or import a file to begin."),
          h(
            "span",
            {
              id: "illustratedmessage-route-description",
              hidden: true,
            },
            "Illustrated empty-state guidance.",
          ),
          h(
            "span",
            {
              id: "illustratedmessage-route-details",
              hidden: true,
            },
            "The comparison route covers illustration, heading, content, and actions.",
          ),
        ];

        if (demoProps().withActions) {
          children.push(
            hc(SolidSpectrumButtonGroup, {}, [
              h(SolidSpectrumButton, { variant: "secondary" }, "Import"),
              h(SolidSpectrumButton, { variant: "accent" }, "Upload"),
            ]),
          );
        }

        return children;
      },
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
          class: "comparison-illustrated-message-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedMessage],
      ),
    ],
  );
}

function SolidSpectrumInlineAlertDemo() {
  const [demoProps, setDemoProps] = createSignal<InlineAlertDemoProps>(
    inlineAlertDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "inlinealert") {
        setDemoProps(normalizeInlineAlertDemoProps(event.detail.props ?? {}));
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

  const renderedAlert = createMemo(() =>
    hc(SolidSpectrumInlineAlert, {
      "data-comparison-control-root": "inlinealert",
      get "data-comparison-control-props"() {
        return serializeInlineAlertDemoProps(demoProps());
      },
      id: "inlinealert-route-root",
      "aria-label": "Filtered alert label",
      "aria-describedby": "inlinealert-route-description",
      "aria-details": "inlinealert-route-details",
      get variant() {
        return demoProps().variant;
      },
      get fillStyle() {
        return demoProps().fillStyle;
      },
      get autoFocus() {
        return demoProps().autoFocus || undefined;
      },
      get children() {
        const isNegative = demoProps().variant === "negative";

        return [
          h(SolidSpectrumHeading, {}, isNegative ? "Payment Error" : "Payment Information"),
          h(
            SolidSpectrumContent,
            {},
            isNegative
              ? "There was an error processing your request. Please try again."
              : "Enter your billing address, shipping address, and payment method to complete your purchase.",
          ),
          h(
            "span",
            {
              id: "inlinealert-route-description",
              hidden: true,
            },
            "Inline alert route description.",
          ),
          h(
            "span",
            {
              id: "inlinealert-route-details",
              hidden: true,
            },
            "The comparison route covers variant, fill style, and autofocus.",
          ),
        ];
      },
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
          class: "comparison-inline-alert-row",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
        },
        [renderedAlert],
      ),
    ],
  );
}

function solidTabChildren(item: TabItem, props: TabsDemoProps) {
  if (props.withIcons || props.labelBehavior === "hide") {
    return [h(SolidNewIcon, { "aria-hidden": "true" }), h(SolidSpectrumText, {}, item.label)];
  }

  return [item.label];
}

function solidTabList(props: TabsDemoProps) {
  if (props.composition === "static") {
    return hc(
      SolidSpectrumTabList,
      {},
      tabItems.map((item) =>
        hc(
          SolidSpectrumTab,
          {
            id: item.id,
            get isDisabled() {
              return props.disabledKey === item.id;
            },
          },
          solidTabChildren(item, props),
        ),
      ),
    );
  }

  return hc(
    SolidSpectrumTabList,
    {
      get items() {
        return tabItems as unknown as TabItem[];
      },
    },
    renderProp((item: TabItem) =>
      hc(
        SolidSpectrumTab,
        {
          id: item.id,
          get isDisabled() {
            return props.disabledKey === item.id;
          },
        },
        solidTabChildren(item, props),
      ),
    ),
  );
}

function solidTabPanels(props: TabsDemoProps) {
  return tabItems.map((item) =>
    hc(
      SolidSpectrumTabPanel,
      {
        id: item.id,
        get shouldForceMount() {
          return props.shouldForceMount;
        },
      },
      [item.content],
    ),
  );
}

function SolidSpectrumTabsDemo() {
  const [demoProps, setDemoProps] = createSignal<TabsDemoProps>(tabsDemoPropsFromWindow());
  const [selectedKey, setSelectedKey] = createSignal<string>(
    initialTabsDemoSelectedKey(demoProps()),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "tabs") {
        const nextProps = normalizeTabsDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(initialTabsDemoSelectedKey(nextProps));
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
    serializeTabsDemoProps({
      ...demoProps(),
      selectedKey: selectedKey() as TabsDemoProps["selectedKey"],
    }),
  );
  const renderKey = createMemo(() =>
    [
      demoProps().selectionSource,
      demoProps().defaultSelectedKey,
      demoProps().selectionSource === "selectedKey" ? selectedKey() : "",
      demoProps().composition,
      demoProps().disabledKey,
      demoProps().labelBehavior,
      String(demoProps().withIcons),
      String(demoProps().shouldForceMount),
    ].join(":"),
  );
  const tabsProps = createMemo(() => {
    const props = demoProps();
    const next: Record<string, unknown> = {
      "aria-label": props.ariaLabel,
      orientation: props.orientation,
      density: props.density,
      labelBehavior: props.labelBehavior,
      keyboardActivation: props.keyboardActivation,
      disabledKeys: tabsDemoDisabledKeys(props),
      isDisabled: props.isDisabled,
      onSelectionChange: (key: string) => setSelectedKey(String(key)),
    };

    if (props.selectionSource === "defaultSelectedKey") {
      next.defaultSelectedKey = props.defaultSelectedKey;
    } else {
      Object.defineProperty(next, "selectedKey", {
        enumerable: true,
        get: () => selectedKey(),
      });
    }

    return next;
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
          class: "comparison-tabs-row",
          "data-comparison-control-root": "tabs",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
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
              return renderKey();
            },
            keyed: true,
            children: ((_key: unknown) => {
              return hc(SolidSpectrumTabs, tabsProps(), [
                () => {
                  const props = demoProps();
                  return [solidTabList(props), ...solidTabPanels(props)];
                },
              ]) as unknown as JSX.Element;
            }) as (key: unknown) => JSX.Element,
          }),
        ],
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

function imageFrameStyle(objectFit: ImageObjectFit): JSX.CSSProperties {
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
  ]) as unknown as JSX.Element;
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
  const [isSelected, setIsSelected] = createSignal(initialCheckboxDemoSelected(demoProps()));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "checkbox") {
        const nextProps = normalizeCheckboxDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setIsSelected(initialCheckboxDemoSelected(nextProps));
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

  const serializedProps = createMemo(() => serializeCheckboxDemoProps(demoProps()));
  const renderKey = createMemo(() =>
    [
      demoProps().selectionSource,
      demoProps().selectionSource === "defaultSelected"
        ? demoProps().defaultSelected
        : "controlled",
      demoProps().name,
      demoProps().value,
      demoProps().form,
      demoProps().validationBehavior,
      demoProps().isRequired,
    ].join("|"),
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
          createComponent(Show, {
            get when() {
              return renderKey();
            },
            keyed: true,
            children: () =>
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
                    return demoProps().selectionSource === "isSelected" ? isSelected() : undefined;
                  },
                  get defaultSelected() {
                    return demoProps().selectionSource === "defaultSelected"
                      ? demoProps().defaultSelected
                      : undefined;
                  },
                  get isIndeterminate() {
                    return demoProps().isIndeterminate;
                  },
                  get isEmphasized() {
                    return demoProps().isEmphasized;
                  },
                  get name() {
                    return demoProps().name || undefined;
                  },
                  get value() {
                    return demoProps().value || undefined;
                  },
                  get form() {
                    return demoProps().form || undefined;
                  },
                  get validationBehavior() {
                    return demoProps().validationBehavior || undefined;
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
                  onChange: (nextSelected: boolean) => {
                    setIsSelected(nextSelected);
                    setDemoProps((current: CheckboxDemoProps) =>
                      current.selectionSource === "isSelected"
                        ? { ...current, isSelected: nextSelected }
                        : current,
                    );
                  },
                },
                [() => demoProps().children],
              ) as unknown as JSX.Element,
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumDialogDemo() {
  const [demoProps, setDemoProps] = createSignal<DialogDemoProps>(dialogDemoPropsFromWindow());
  const [isOpen, setIsOpen] = createSignal(demoProps().isOpen);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "dialog") {
        const nextProps = normalizeDialogDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setIsOpen(nextProps.isOpen);
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
    serializeDialogDemoProps({
      ...demoProps(),
      isOpen: isOpen(),
    }),
  );

  const handleOpenChange = (nextOpen: boolean) => {
    setIsOpen(nextOpen);
    setDemoProps((current) => ({ ...current, isOpen: nextOpen }));
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
          "data-comparison-control-root": "dialog",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-open"() {
            return String(isOpen());
          },
        },
        [
          hc(
            SolidSpectrumDialogTrigger,
            {
              get isOpen() {
                return isOpen();
              },
              onOpenChange: handleOpenChange,
            },
            [
              () =>
                hc(
                  SolidSpectrumButton,
                  {
                    variant: "primary",
                  },
                  [() => demoProps().triggerLabel],
                ),
              () =>
                hc(
                  SolidSpectrumDialog,
                  {
                    get size() {
                      return demoProps().size;
                    },
                    get role() {
                      return demoProps().role;
                    },
                    get isDismissible() {
                      return demoProps().isDismissible;
                    },
                    get isKeyboardDismissDisabled() {
                      return demoProps().isKeyboardDismissDisabled;
                    },
                  },
                  [
                    () => [
                      hc(
                        SolidSpectrumHeading,
                        {
                          slot: "title",
                        },
                        [() => demoProps().title],
                      ),
                      hc(SolidSpectrumContent, {}, [
                        () => hc(SolidSpectrumText, {}, [() => demoProps().body]),
                      ]),
                    ],
                  ],
                ),
            ],
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
  const [value, setValue] = createSignal<string[]>(initialCheckboxGroupDemoValue(demoProps()));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "checkboxgroup") {
        const nextProps = normalizeCheckboxGroupDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialCheckboxGroupDemoValue(nextProps));
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
  const serializedProps = createMemo(() => serializeCheckboxGroupDemoProps(demoProps()));
  const renderKey = createMemo(() =>
    [
      demoProps().valueSource,
      demoProps().valueSource === "defaultValue" ? demoProps().defaultValue : "controlled",
      demoProps().name,
      demoProps().form,
      demoProps().validationBehavior,
    ].join("|"),
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
          createComponent(Show, {
            get when() {
              return renderKey();
            },
            keyed: true,
            children: () =>
              hc(
                SolidSpectrumCheckboxGroup,
                {
                  get label() {
                    return demoProps().label;
                  },
                  get value() {
                    return demoProps().valueSource === "value" ? value() : undefined;
                  },
                  get defaultValue() {
                    return demoProps().valueSource === "defaultValue"
                      ? initialCheckboxGroupDemoValue(demoProps())
                      : undefined;
                  },
                  get size() {
                    return demoProps().size;
                  },
                  get orientation() {
                    return demoProps().orientation;
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
                  get name() {
                    return demoProps().name || undefined;
                  },
                  get form() {
                    return demoProps().form || undefined;
                  },
                  get validationBehavior() {
                    return demoProps().validationBehavior || undefined;
                  },
                  get description() {
                    return demoProps().description;
                  },
                  get errorMessage() {
                    return demoProps().errorMessage;
                  },
                  get contextualHelp() {
                    return demoProps().withContextualHelp
                      ? hc(SolidSpectrumContextualHelp, {}, [
                          hc(SolidSpectrumHeading, { slot: "title" }, ["Notification help"]),
                          hc(SolidSpectrumText, {}, [
                            "Choose every channel that should alert you.",
                          ]),
                        ])
                      : undefined;
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
                    const nextSelectedValues = nextValue.map(String);
                    setValue(nextSelectedValues);
                    setDemoProps((current: CheckboxGroupDemoProps) =>
                      current.valueSource === "value"
                        ? { ...current, selectedValues: nextSelectedValues.join(",") }
                        : current,
                    );
                  },
                },
                checkboxGroupItems.map((item) =>
                  hc(SolidSpectrumCheckbox, { value: item.value }, [item.label]),
                ),
              ) as unknown as JSX.Element,
          }),
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
            onChange: (nextValue: NonNullable<ReturnType<typeof calendarDateFromString>>) => {
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
            onFocusChange: (
              nextFocusedValue: NonNullable<ReturnType<typeof calendarDateFromString>>,
            ) => {
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
          get "data-comparison-locale"() {
            return demoProps().locale;
          },
          get "data-comparison-calendar-system"() {
            return demoProps().calendarSystem;
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
            get createCalendar() {
              return calendarCreateCalendarForDemo(demoProps().calendarSystem);
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
  const contextualHelp = createMemo(() =>
    demoProps().withContextualHelp
      ? hc(SolidSpectrumContextualHelp, {}, [
          hc(SolidSpectrumHeading, { slot: "title" }, ["Date help"]),
          hc(SolidSpectrumContent, {}, ["Choose an available project due date."]),
        ])
      : undefined,
  );

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
          get "data-comparison-locale"() {
            return demoProps().locale;
          },
          get "data-comparison-calendar-system"() {
            return demoProps().calendarSystem;
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
            get contextualHelp() {
              return contextualHelp();
            },
            get value() {
              return value() ?? undefined;
            },
            get granularity() {
              return demoProps().granularity;
            },
            get shouldForceLeadingZeros() {
              return demoProps().shouldForceLeadingZeros;
            },
            get hourCycle() {
              return demoProps().hourCycle ? Number(demoProps().hourCycle) : undefined;
            },
            get hideTimeZone() {
              return demoProps().hideTimeZone;
            },
            get locale() {
              return demoProps().locale || undefined;
            },
            get maxVisibleMonths() {
              return Number(demoProps().maxVisibleMonths);
            },
            get minValue() {
              return demoProps().constrainRange
                ? datePickerMinValue(demoProps().granularity)
                : undefined;
            },
            get maxValue() {
              return demoProps().constrainRange
                ? datePickerMaxValue(demoProps().granularity)
                : undefined;
            },
            get createCalendar() {
              return calendarCreateCalendarForDemo(demoProps().calendarSystem);
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
            get form() {
              return demoProps().form || undefined;
            },
            get validationBehavior() {
              return demoProps().validationBehavior || undefined;
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

function SolidSpectrumDateFieldDemo() {
  const initialDemoProps = dateFieldDemoPropsFromWindow();
  const [demoProps, setDemoProps] = createSignal<DateFieldDemoProps>(initialDemoProps);
  const [value, setValue] = createSignal(dateFieldValueFromDemo(initialDemoProps));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "datefield") {
        const nextProps = normalizeDateFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(() => dateFieldValueFromDemo(nextProps));
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

  const serializedProps = createMemo(() => serializeDateFieldDemoProps(demoProps()));
  const contextualHelp = createMemo(() =>
    demoProps().withContextualHelp
      ? hc(SolidSpectrumContextualHelp, {}, [
          hc(SolidSpectrumHeading, { slot: "title" }, ["Date help"]),
          hc(SolidSpectrumContent, {}, ["Choose an available appointment date."]),
        ])
      : undefined,
  );

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
          "data-comparison-control-root": "datefield",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-locale"() {
            return demoProps().locale;
          },
          get "data-comparison-value"() {
            return serializeDateFieldValue(value());
          },
        },
        [
          hc(SolidSpectrumDateField, {
            class: "comparison-datefield-root",
            get label() {
              return demoProps().label;
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
            get contextualHelp() {
              return contextualHelp();
            },
            get value() {
              return value() ?? undefined;
            },
            get granularity() {
              return demoProps().granularity;
            },
            get shouldForceLeadingZeros() {
              return demoProps().shouldForceLeadingZeros;
            },
            get hourCycle() {
              return demoProps().hourCycle ? Number(demoProps().hourCycle) : undefined;
            },
            get hideTimeZone() {
              return demoProps().hideTimeZone;
            },
            get minValue() {
              return demoProps().constrainRange
                ? dateFieldMinValue(demoProps().granularity)
                : undefined;
            },
            get maxValue() {
              return demoProps().constrainRange
                ? dateFieldMaxValue(demoProps().granularity)
                : undefined;
            },
            get isDateUnavailable() {
              return demoProps().unavailableDates ? isDateFieldDateUnavailable : undefined;
            },
            get name() {
              return demoProps().name || undefined;
            },
            get form() {
              return demoProps().form || undefined;
            },
            get validationBehavior() {
              return demoProps().validationBehavior || undefined;
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
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumTimeFieldDemo() {
  const initialDemoProps = timeFieldDemoPropsFromWindow();
  const [demoProps, setDemoProps] = createSignal<TimeFieldDemoProps>(initialDemoProps);
  const [value, setValue] = createSignal(timeFieldValueFromDemo(initialDemoProps));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "timefield") {
        const nextProps = normalizeTimeFieldDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(() => timeFieldValueFromDemo(nextProps));
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

  const serializedProps = createMemo(() => serializeTimeFieldDemoProps(demoProps()));
  const contextualHelp = createMemo(() =>
    demoProps().withContextualHelp
      ? hc(SolidSpectrumContextualHelp, {}, [
          hc(SolidSpectrumHeading, { slot: "title" }, ["Time help"]),
          hc(SolidSpectrumContent, {}, ["Choose a start time in your schedule."]),
        ])
      : undefined,
  );

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
          "data-comparison-control-root": "timefield",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-locale"() {
            return demoProps().locale;
          },
          get "data-comparison-value"() {
            return serializeTimeFieldValue(value());
          },
        },
        [
          hc(SolidSpectrumTimeField, {
            class: "comparison-timefield-root",
            get label() {
              return demoProps().label;
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
            get contextualHelp() {
              return contextualHelp();
            },
            get value() {
              return value() ?? undefined;
            },
            get granularity() {
              return demoProps().granularity;
            },
            get shouldForceLeadingZeros() {
              return demoProps().shouldForceLeadingZeros;
            },
            get hourCycle() {
              return demoProps().hourCycle ? Number(demoProps().hourCycle) : undefined;
            },
            get hideTimeZone() {
              return demoProps().hideTimeZone;
            },
            get minValue() {
              return demoProps().constrainRange ? timeFieldMinValue() : undefined;
            },
            get maxValue() {
              return demoProps().constrainRange ? timeFieldMaxValue() : undefined;
            },
            get name() {
              return demoProps().name || undefined;
            },
            get form() {
              return demoProps().form || undefined;
            },
            get validationBehavior() {
              return demoProps().validationBehavior || undefined;
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
          get "data-comparison-locale"() {
            return demoProps().locale;
          },
          get "data-comparison-calendar-system"() {
            return demoProps().calendarSystem;
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
            get granularity() {
              return demoProps().granularity;
            },
            get hourCycle() {
              return demoProps().hourCycle ? Number(demoProps().hourCycle) : undefined;
            },
            get hideTimeZone() {
              return demoProps().hideTimeZone;
            },
            get locale() {
              return demoProps().locale || undefined;
            },
            get maxVisibleMonths() {
              return Number(demoProps().maxVisibleMonths);
            },
            get minValue() {
              return demoProps().constrainRange
                ? dateRangePickerMinValue(demoProps().granularity)
                : undefined;
            },
            get maxValue() {
              return demoProps().constrainRange
                ? dateRangePickerMaxValue(demoProps().granularity)
                : undefined;
            },
            get createCalendar() {
              return calendarCreateCalendarForDemo(demoProps().calendarSystem);
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
            get form() {
              return demoProps().form || undefined;
            },
            get validationBehavior() {
              return demoProps().validationBehavior || undefined;
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
    get children(): JSX.Element {
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
      ) as unknown as JSX.Element;
    },
  });
}

function SolidSpectrumContextualHelpDemo() {
  const [demoProps, setDemoProps] = createSignal<ContextualHelpDemoProps>(
    contextualHelpDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "contextualhelp") {
        setDemoProps(normalizeContextualHelpDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setDemoProps(contextualHelpDemoPropsFromWindow());
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
          class: "comparison-button-row",
          "data-comparison-control-root": "contextualhelp",
          get "data-comparison-control-props"() {
            return serializeContextualHelpDemoProps(demoProps());
          },
        },
        [
          hc(
            SolidSpectrumContextualHelp,
            {
              get "aria-label"() {
                return demoProps().triggerLabel;
              },
              get containerPadding() {
                return demoProps().containerPadding;
              },
              get crossOffset() {
                return demoProps().crossOffset;
              },
              get isOpen() {
                return demoProps().isOpen;
              },
              get offset() {
                return demoProps().offset;
              },
              onOpenChange: (nextOpen: boolean) => {
                setDemoProps((current: ContextualHelpDemoProps) =>
                  current.isOpen && !nextOpen && isContextualHelpOpenControlChecked()
                    ? current
                    : normalizeContextualHelpDemoProps({
                        ...current,
                        isOpen: nextOpen,
                      }),
                );
              },
              get placement() {
                return demoProps().placement;
              },
              get shouldFlip() {
                return demoProps().shouldFlip;
              },
              get size() {
                return demoProps().size;
              },
              get variant() {
                return demoProps().variant;
              },
            },
            [
              hc(SolidSpectrumHeading, { slot: "title" }, [() => demoProps().heading]),
              hc(SolidSpectrumContent, {}, [() => demoProps().content]),
              hc(SolidSpectrumFooter, {}, [
                hc(SolidSpectrumLink, { isStandalone: true, href: "#", target: "_blank" }, [
                  "Learn more about segments",
                ]),
              ]),
            ],
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumTooltipDemo() {
  const [demoProps, setDemoProps] = createSignal<TooltipDemoProps>(tooltipDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "tooltip") {
        setDemoProps(normalizeTooltipDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setDemoProps(tooltipDemoPropsFromWindow());
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  const isRenderedOpen = createMemo(() => !demoProps().isDisabled && demoProps().isOpen);

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
          class: "comparison-button-row",
          "data-comparison-control-root": "tooltip",
          get "data-comparison-control-props"() {
            return serializeTooltipDemoProps(demoProps());
          },
          get "data-comparison-tooltip-props"() {
            return serializeTooltipDemoProps(demoProps());
          },
        },
        [
          hc(
            SolidSpectrumTooltipTrigger,
            {
              get containerPadding() {
                return demoProps().containerPadding;
              },
              get crossOffset() {
                return demoProps().crossOffset;
              },
              get defaultOpen() {
                return demoProps().defaultOpen;
              },
              get delay() {
                return demoProps().delay;
              },
              get isDisabled() {
                return demoProps().isDisabled;
              },
              get isOpen() {
                return isRenderedOpen();
              },
              onOpenChange: (nextOpen: boolean) => {
                setDemoProps((current: TooltipDemoProps) =>
                  current.isOpen && !nextOpen && isTooltipOpenControlChecked()
                    ? current
                    : normalizeTooltipDemoProps({
                        ...current,
                        isOpen: nextOpen,
                      }),
                );
              },
              get placement() {
                return demoProps().placement;
              },
              get shouldCloseOnPress() {
                return demoProps().shouldCloseOnPress;
              },
              get shouldFlip() {
                return demoProps().shouldFlip;
              },
              get trigger() {
                return demoProps().trigger;
              },
            },
            [
              hc(
                SolidSpectrumActionButton,
                {
                  get "aria-label"() {
                    return demoProps().actionLabel;
                  },
                },
                [h(SolidNewIcon, { "aria-hidden": "true" })],
              ),
              hc(SolidSpectrumTooltip, {}, [() => demoProps().children]),
            ],
          ),
        ],
      ),
    ],
  );
}

function solidToastQueueOptions(
  demoProps: ToastDemoProps,
  onAction: () => void,
  onClose: () => void,
) {
  return {
    actionLabel: demoProps.showAction ? demoProps.actionLabel : undefined,
    onAction: demoProps.showAction ? onAction : undefined,
    onClose,
    shouldCloseOnAction: demoProps.shouldCloseOnAction,
    timeout: demoProps.autoDismiss ? demoProps.timeout : undefined,
  };
}

function SolidSpectrumToastDemo() {
  const [demoProps, setDemoProps] = createSignal<ToastDemoProps>(toastDemoPropsFromWindow());
  const [actionCount, setActionCount] = createSignal(0);
  const [closeCount, setCloseCount] = createSignal(0);
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  let closeToasts: Array<() => void> = [];
  let suppressCloseCount = false;
  const closeExistingToasts = () => {
    suppressCloseCount = true;
    closeToasts.forEach((close) => close());
    closeToasts = [];
    suppressCloseCount = false;
  };
  const handleToastClose = () => {
    if (!suppressCloseCount) {
      setCloseCount((count) => count + 1);
    }
  };

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "toast") {
        setActionCount(0);
        setCloseCount(0);
        setDemoProps(normalizeToastDemoProps(event.detail.props ?? {}));
      }
    };
    const handleThemeChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.resolvedTheme) {
        setColorScheme(event.detail.resolvedTheme as ComparisonResolvedTheme);
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    window.addEventListener(comparisonThemeChangeEvent, handleThemeChange);
    setDemoProps(toastDemoPropsFromWindow());
    setColorScheme(getComparisonResolvedThemeFromDocument());
    onCleanup(() => {
      window.removeEventListener(comparisonControlsEvent, handleControlsChange);
      window.removeEventListener(comparisonThemeChangeEvent, handleThemeChange);
    });
  });

  createEffect(() => {
    const currentProps = demoProps();
    closeExistingToasts();
    closeToasts = Array.from({ length: currentProps.count }, (_item, index) =>
      SolidSpectrumToastQueue[currentProps.variant](
        currentProps.count > 1 ? `${currentProps.children} ${index + 1}` : currentProps.children,
        solidToastQueueOptions(
          currentProps,
          () => setActionCount((count) => count + 1),
          handleToastClose,
        ),
      ),
    );
    onCleanup(() => {
      closeExistingToasts();
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
          class: "comparison-toast-stage",
          style: { "max-width": "100%", "min-height": "96px", width: "360px" },
          "data-comparison-control-root": "toast",
          get "data-comparison-control-props"() {
            return serializeToastDemoProps(demoProps());
          },
          get "data-comparison-toast-props"() {
            return serializeToastDemoProps(demoProps());
          },
          get "data-comparison-toast-action-count"() {
            return String(actionCount());
          },
          get "data-comparison-toast-close-count"() {
            return String(closeCount());
          },
        },
        [
          h(SolidSpectrumToastContainer, {
            get placement() {
              return demoProps().placement;
            },
            get "aria-label"() {
              return demoProps()["aria-label"];
            },
            portal: false,
          }),
        ],
      ),
    ],
  );
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
  const menuWidth = createMemo(() => {
    const parsed = Number.parseInt(demoProps().menuWidth, 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  });
  const disabledKeys = createMemo(() =>
    demoProps().disableEnterprise ? ["enterprise"] : undefined,
  );
  const contextualHelp = createMemo(() =>
    demoProps().withContextualHelp
      ? hc(SolidSpectrumContextualHelp, {}, [
          hc(SolidSpectrumHeading, { slot: "title" }, ["Plan help"]),
          h("p", {}, ["Pick the plan that matches expected usage."]),
        ])
      : undefined,
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

  const serializedProps = createMemo(() => serializeComboBoxDemoProps(demoProps()));

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
      h("form", {
        hidden: true,
        get id() {
          return demoProps().form || "combobox-external-form";
        },
      }),
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
                return demoProps().selectionSource === "selectedKey" ? selectedKey() : undefined;
              },
              get defaultSelectedKey() {
                return demoProps().selectionSource === "defaultSelectedKey"
                  ? demoProps().selectedKey
                  : undefined;
              },
              get inputValue() {
                return demoProps().inputSource === "inputValue" ? inputValue() : undefined;
              },
              get defaultInputValue() {
                return demoProps().inputSource === "defaultInputValue"
                  ? demoProps().inputValue
                  : undefined;
              },
              get placeholder() {
                return demoProps().placeholder;
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
              get contextualHelp() {
                return contextualHelp();
              },
              get description() {
                return demoProps().description;
              },
              get errorMessage() {
                return demoProps().errorMessage;
              },
              get name() {
                return demoProps().name || undefined;
              },
              get form() {
                return demoProps().form || undefined;
              },
              get formValue() {
                return demoProps().formValue;
              },
              get validationBehavior() {
                return demoProps().validationBehavior;
              },
              get menuTrigger() {
                return demoProps().menuTrigger;
              },
              get direction() {
                return demoProps().direction;
              },
              get align() {
                return demoProps().align;
              },
              get menuWidth() {
                return menuWidth();
              },
              get shouldFlip() {
                return demoProps().shouldFlip;
              },
              get disabledKeys() {
                return disabledKeys();
              },
              get allowsCustomValue() {
                return demoProps().allowsCustomValue;
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
              onSelectionChange: (nextKey: unknown) => {
                if (nextKey == null) {
                  return;
                }
                const nextSelectedKey = String(nextKey);
                const nextInputValue = comboBoxLabelForKey(nextSelectedKey);
                setSelectedKey(nextSelectedKey as ComboBoxDemoProps["selectedKey"]);
                setInputValue(nextInputValue);
                setDemoProps((current: ComboBoxDemoProps) => ({
                  ...current,
                  ...(current.selectionSource === "selectedKey"
                    ? { selectedKey: nextSelectedKey as ComboBoxDemoProps["selectedKey"] }
                    : {}),
                  ...(current.inputSource === "inputValue" ? { inputValue: nextInputValue } : {}),
                }));
              },
              onInputChange: (nextValue: string) => {
                setInputValue(nextValue);
                setDemoProps((current: ComboBoxDemoProps) =>
                  current.inputSource === "inputValue"
                    ? { ...current, inputValue: nextValue }
                    : current,
                );
              },
            },
            renderProp((item: (typeof comboBoxItems)[number]) =>
              hc(
                SolidSpectrumComboBoxItem,
                {
                  id: item.id,
                  get isDisabled() {
                    return item.id === "enterprise" && demoProps().disableEnterprise;
                  },
                },
                [item.label],
              ),
            ),
          ),
        ],
      ),
    ],
  );
}

function SolidSpectrumSliderDemo() {
  const [demoProps, setDemoProps] = createSignal<SliderDemoProps>(sliderDemoPropsFromWindow());
  const [value, setValue] = createSignal(initialSliderDemoValue(demoProps()));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "slider") {
        const nextProps = normalizeSliderDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialSliderDemoValue(nextProps));
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

  const serializedProps = createMemo(() => serializeSliderDemoProps(demoProps()));

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
              return demoProps().valueSource === "value" ? value() : undefined;
            },
            get defaultValue() {
              return demoProps().valueSource === "defaultValue"
                ? demoProps().defaultValue
                : undefined;
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
            get fillOffset() {
              return demoProps().fillOffset;
            },
            get labelPosition() {
              return demoProps().labelPosition;
            },
            get labelAlign() {
              return demoProps().labelAlign;
            },
            get contextualHelp() {
              return demoProps().withContextualHelp
                ? hc(SolidSpectrumContextualHelp, {}, [
                    hc(SolidSpectrumHeading, { slot: "title" }, ["Volume help"]),
                    hc(SolidSpectrumText, {}, ["Choose an output level."]),
                  ])
                : undefined;
            },
            get name() {
              return demoProps().name || undefined;
            },
            get form() {
              return demoProps().form || undefined;
            },
            get isEmphasized() {
              return demoProps().isEmphasized;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            onChange: (nextValue: number) => {
              setValue(nextValue);
              setDemoProps((current: SliderDemoProps) =>
                current.valueSource === "value" ? { ...current, value: nextValue } : current,
              );
            },
          }),
        ],
      ),
    ],
  );
}

function parseSolidColorAreaValue(value: string, fallback = colorAreaDemoDefaults.value) {
  try {
    return parseSolidSpectrumColor(value || fallback);
  } catch {
    return parseSolidSpectrumColor(fallback);
  }
}

function solidColorToCssString(color: ReturnType<typeof parseSolidColorAreaValue>) {
  return color.toString("css");
}

function SolidSpectrumColorAreaDemo() {
  const [demoProps, setDemoProps] = createSignal<ColorAreaDemoProps>(
    colorAreaDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(
    parseSolidColorAreaValue(initialColorAreaDemoValue(demoProps())),
  );
  const [finalValue, setFinalValue] = createSignal(
    parseSolidColorAreaValue(initialColorAreaDemoValue(demoProps())),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const locale = buttonDemoLocaleFromWindow();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorarea") {
        const nextProps = normalizeColorAreaDemoProps(event.detail.props ?? {});
        const nextValue = parseSolidColorAreaValue(initialColorAreaDemoValue(nextProps));
        setDemoProps(nextProps);
        setValue(nextValue);
        setFinalValue(nextValue);
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

  const serializedProps = createMemo(() => serializeColorAreaDemoProps(demoProps()));

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
          "data-comparison-control-root": "colorarea",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return solidColorToCssString(value());
          },
          get "data-comparison-final-value"() {
            return solidColorToCssString(finalValue());
          },
        },
        [
          hc(SolidSpectrumColorArea, {
            get "aria-label"() {
              return demoProps().ariaLabel || undefined;
            },
            get "aria-labelledby"() {
              return demoProps().ariaLabelledBy || undefined;
            },
            get "aria-describedby"() {
              return demoProps().ariaDescribedBy || undefined;
            },
            get "aria-details"() {
              return demoProps().ariaDetails || undefined;
            },
            get value() {
              return demoProps().valueSource === "value" ? value() : undefined;
            },
            get defaultValue() {
              return demoProps().valueSource === "defaultValue"
                ? parseSolidColorAreaValue(
                    demoProps().defaultValue,
                    colorAreaDemoDefaults.defaultValue,
                  )
                : undefined;
            },
            get colorSpace() {
              return demoProps().colorSpace || undefined;
            },
            get xChannel() {
              return demoProps().xChannel;
            },
            get yChannel() {
              return demoProps().yChannel;
            },
            get xName() {
              return demoProps().xName || undefined;
            },
            get yName() {
              return demoProps().yName || undefined;
            },
            get form() {
              return demoProps().form || undefined;
            },
            get id() {
              return demoProps().id || undefined;
            },
            get slot() {
              return demoProps().slot || undefined;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            onChange: (nextValue: ReturnType<typeof parseSolidColorAreaValue>) => {
              setValue(nextValue);
              setDemoProps((current: ColorAreaDemoProps) =>
                current.valueSource === "value"
                  ? { ...current, value: solidColorToCssString(nextValue) }
                  : current,
              );
            },
            onChangeEnd: (nextValue: ReturnType<typeof parseSolidColorAreaValue>) => {
              setFinalValue(nextValue);
            },
          }),
        ],
      ),
    ],
  );
}

function parseSolidColorSliderValue(
  value: string,
  fallback = colorSliderDemoDefaults.value,
  colorSpace: ColorSliderDemoProps["colorSpace"] = "",
) {
  try {
    const color = parseSolidSpectrumColor(value || fallback);
    return colorSpace ? color.toFormat(colorSpace) : color;
  } catch {
    const color = parseSolidSpectrumColor(fallback);
    return colorSpace ? color.toFormat(colorSpace) : color;
  }
}

function solidColorSliderToCssString(color: ReturnType<typeof parseSolidColorSliderValue>) {
  return color.toString("css");
}

function SolidSpectrumColorSliderDemo() {
  const [demoProps, setDemoProps] = createSignal<ColorSliderDemoProps>(
    colorSliderDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(
    parseSolidColorSliderValue(
      initialColorSliderDemoValue(demoProps()),
      colorSliderDemoDefaults.value,
      colorSliderEffectiveColorSpace(demoProps()),
    ),
  );
  const [finalValue, setFinalValue] = createSignal(
    parseSolidColorSliderValue(
      initialColorSliderDemoValue(demoProps()),
      colorSliderDemoDefaults.value,
      colorSliderEffectiveColorSpace(demoProps()),
    ),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const locale = buttonDemoLocaleFromWindow();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorslider") {
        const nextProps = normalizeColorSliderDemoProps(event.detail.props ?? {});
        const nextColorSpace = colorSliderEffectiveColorSpace(nextProps);
        const nextValue = parseSolidColorSliderValue(
          initialColorSliderDemoValue(nextProps),
          colorSliderDemoDefaults.value,
          nextColorSpace,
        );
        setDemoProps(nextProps);
        setValue(nextValue);
        setFinalValue(nextValue);
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

  const serializedProps = createMemo(() => serializeColorSliderDemoProps(demoProps()));

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
          "data-comparison-control-root": "colorslider",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return solidColorSliderToCssString(value());
          },
          get "data-comparison-final-value"() {
            return solidColorSliderToCssString(finalValue());
          },
        },
        [
          hc(SolidSpectrumColorSlider, {
            get "aria-label"() {
              return demoProps().ariaLabel || undefined;
            },
            get "aria-labelledby"() {
              return demoProps().ariaLabelledBy || undefined;
            },
            get "aria-describedby"() {
              return demoProps().ariaDescribedBy || undefined;
            },
            get "aria-details"() {
              return demoProps().ariaDetails || undefined;
            },
            get value() {
              return demoProps().valueSource === "value" ? value() : undefined;
            },
            get defaultValue() {
              return demoProps().valueSource === "defaultValue"
                ? parseSolidColorSliderValue(
                    demoProps().defaultValue,
                    colorSliderDemoDefaults.defaultValue,
                    colorSliderEffectiveColorSpace(demoProps()),
                  )
                : undefined;
            },
            get label() {
              return demoProps().label || undefined;
            },
            get channel() {
              return demoProps().channel;
            },
            get colorSpace() {
              return demoProps().colorSpace || undefined;
            },
            get name() {
              return demoProps().name || undefined;
            },
            get form() {
              return demoProps().form || undefined;
            },
            get id() {
              return demoProps().id || undefined;
            },
            get slot() {
              return demoProps().slot || undefined;
            },
            get orientation() {
              return demoProps().orientation;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            onChange: (nextValue: ReturnType<typeof parseSolidColorSliderValue>) => {
              setValue(nextValue);
              setDemoProps((current: ColorSliderDemoProps) =>
                current.valueSource === "value"
                  ? { ...current, value: solidColorSliderToCssString(nextValue) }
                  : current,
              );
            },
            onChangeEnd: (nextValue: ReturnType<typeof parseSolidColorSliderValue>) => {
              setFinalValue(nextValue);
            },
          }),
        ],
      ),
    ],
  );
}

function parseSolidColorWheelValue(value: string, fallback = colorWheelDemoDefaults.value) {
  try {
    return parseSolidSpectrumColor(value || fallback);
  } catch {
    return parseSolidSpectrumColor(fallback);
  }
}

function solidColorWheelToCssString(color: ReturnType<typeof parseSolidColorWheelValue>) {
  return color.toString("css");
}

function SolidSpectrumColorWheelDemo() {
  const [demoProps, setDemoProps] = createSignal<ColorWheelDemoProps>(
    colorWheelDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(
    parseSolidColorWheelValue(initialColorWheelDemoValue(demoProps())),
  );
  const [finalValue, setFinalValue] = createSignal(
    parseSolidColorWheelValue(initialColorWheelDemoValue(demoProps())),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const locale = buttonDemoLocaleFromWindow();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorwheel") {
        const nextProps = normalizeColorWheelDemoProps(event.detail.props ?? {});
        const nextValue = parseSolidColorWheelValue(initialColorWheelDemoValue(nextProps));
        setDemoProps(nextProps);
        setValue(nextValue);
        setFinalValue(nextValue);
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

  const serializedProps = createMemo(() => serializeColorWheelDemoProps(demoProps()));

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
          "data-comparison-control-root": "colorwheel",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return solidColorWheelToCssString(value());
          },
          get "data-comparison-final-value"() {
            return solidColorWheelToCssString(finalValue());
          },
        },
        [
          hc(SolidSpectrumColorWheel, {
            get "aria-label"() {
              return demoProps().ariaLabel || undefined;
            },
            get "aria-labelledby"() {
              return demoProps().ariaLabelledBy || undefined;
            },
            get "aria-describedby"() {
              return demoProps().ariaDescribedBy || undefined;
            },
            get "aria-details"() {
              return demoProps().ariaDetails || undefined;
            },
            get value() {
              return demoProps().valueSource === "value" ? value() : undefined;
            },
            get defaultValue() {
              return demoProps().valueSource === "defaultValue"
                ? parseSolidColorWheelValue(
                    demoProps().defaultValue,
                    colorWheelDemoDefaults.defaultValue,
                  )
                : undefined;
            },
            get size() {
              return colorWheelDemoSizeNumber(demoProps());
            },
            get name() {
              return demoProps().name || undefined;
            },
            get form() {
              return demoProps().form || undefined;
            },
            get id() {
              return demoProps().id || undefined;
            },
            get slot() {
              return demoProps().slot || undefined;
            },
            get isDisabled() {
              return demoProps().isDisabled;
            },
            onChange: (nextValue: ReturnType<typeof parseSolidColorWheelValue>) => {
              setValue(nextValue);
              setDemoProps((current: ColorWheelDemoProps) =>
                current.valueSource === "value"
                  ? { ...current, value: solidColorWheelToCssString(nextValue) }
                  : current,
              );
            },
            onChangeEnd: (nextValue: ReturnType<typeof parseSolidColorWheelValue>) => {
              setFinalValue(nextValue);
            },
          }),
        ],
      ),
    ],
  );
}

function SolidSpectrumColorSwatchDemo() {
  const [demoProps, setDemoProps] = createSignal<ColorSwatchDemoProps>(
    colorSwatchDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const locale = buttonDemoLocaleFromWindow();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorswatch") {
        setDemoProps(normalizeColorSwatchDemoProps(event.detail.props ?? {}));
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

  const serializedProps = createMemo(() => serializeColorSwatchDemoProps(demoProps()));

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
          "data-comparison-control-root": "colorswatch",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumColorSwatch, {
            get color() {
              return demoProps().color || undefined;
            },
            get colorName() {
              return demoProps().colorName || undefined;
            },
            get size() {
              return demoProps().size;
            },
            get rounding() {
              return demoProps().rounding;
            },
            get "aria-label"() {
              return demoProps().ariaLabel || undefined;
            },
            get "aria-labelledby"() {
              return demoProps().ariaLabelledBy || undefined;
            },
            get "aria-describedby"() {
              return demoProps().ariaDescribedBy || undefined;
            },
            get "aria-details"() {
              return demoProps().ariaDetails || undefined;
            },
            get id() {
              return demoProps().id || undefined;
            },
            get slot() {
              return demoProps().slot || undefined;
            },
          }),
        ],
      ),
    ],
  );
}

function solidColorSwatchPickerToCssString(
  color: ReturnType<typeof parseSolidSpectrumColor> | null | undefined,
) {
  return (color?.toString("css") ?? "").replace(
    /^rgba\((\d+),\s*(\d+),\s*(\d+),\s*(?:1|1\.0+)\)$/i,
    "rgb($1, $2, $3)",
  );
}

function SolidSpectrumColorSwatchPickerDemo() {
  const [demoProps, setDemoProps] = createSignal<ColorSwatchPickerDemoProps>(
    colorSwatchPickerDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(initialColorSwatchPickerDemoValue(demoProps()));
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const locale = buttonDemoLocaleFromWindow();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorswatchpicker") {
        const nextProps = normalizeColorSwatchPickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setValue(initialColorSwatchPickerDemoValue(nextProps));
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

  const serializedProps = createMemo(() => serializeColorSwatchPickerDemoProps(demoProps()));

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
          "data-comparison-control-root": "colorswatchpicker",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return value();
          },
        },
        [
          hc(
            SolidSpectrumColorSwatchPicker,
            {
              get value() {
                return demoProps().valueSource === "value" ? demoProps().value : undefined;
              },
              get defaultValue() {
                return demoProps().valueSource === "defaultValue"
                  ? demoProps().defaultValue
                  : undefined;
              },
              get density() {
                return demoProps().density;
              },
              get size() {
                return demoProps().size;
              },
              get rounding() {
                return demoProps().rounding;
              },
              get "aria-label"() {
                return demoProps().ariaLabel || undefined;
              },
              get "aria-labelledby"() {
                return demoProps().ariaLabelledBy || undefined;
              },
              get "aria-describedby"() {
                return demoProps().ariaDescribedBy || undefined;
              },
              get "aria-details"() {
                return demoProps().ariaDetails || undefined;
              },
              get id() {
                return demoProps().id || undefined;
              },
              get slot() {
                return demoProps().slot || undefined;
              },
              onChange: (nextValue: ReturnType<typeof parseSolidSpectrumColor>) => {
                const nextString = solidColorSwatchPickerToCssString(nextValue);
                setValue(nextString);
                setDemoProps((current: ColorSwatchPickerDemoProps) =>
                  current.valueSource === "value" ? { ...current, value: nextString } : current,
                );
              },
            },
            colorSwatchPickerPalette.map((item) =>
              hc(SolidSpectrumColorSwatch, {
                color: item.color,
                colorName: item.colorName,
              }),
            ),
          ),
        ],
      ),
    ],
  );
}

function parseSolidColorFieldValue(value: string, fallback = colorFieldDemoDefaults.value) {
  try {
    return value ? parseSolidSpectrumColor(value) : null;
  } catch {
    return parseSolidSpectrumColor(fallback);
  }
}

function solidColorFieldToCssString(color: ReturnType<typeof parseSolidColorFieldValue>) {
  return color?.toString("css") ?? "";
}

function SolidSpectrumColorFieldDemo() {
  const [demoProps, setDemoProps] = createSignal<ColorFieldDemoProps>(
    colorFieldDemoPropsFromWindow(),
  );
  const [value, setValue] = createSignal(
    parseSolidColorFieldValue(initialColorFieldDemoValue(demoProps())),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const locale = buttonDemoLocaleFromWindow();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "colorfield") {
        const nextProps = normalizeColorFieldDemoProps(event.detail.props ?? {});
        const nextValue = parseSolidColorFieldValue(initialColorFieldDemoValue(nextProps));
        setDemoProps(nextProps);
        setValue(nextValue);
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

  const serializedProps = createMemo(() => serializeColorFieldDemoProps(demoProps()));

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
          "data-comparison-control-root": "colorfield",
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-value"() {
            return solidColorFieldToCssString(value());
          },
        },
        [
          hc(SolidSpectrumColorField, {
            get "aria-label"() {
              return demoProps().ariaLabel || undefined;
            },
            get "aria-labelledby"() {
              return demoProps().ariaLabelledBy || undefined;
            },
            get "aria-describedby"() {
              return demoProps().ariaDescribedBy || undefined;
            },
            get "aria-details"() {
              return demoProps().ariaDetails || undefined;
            },
            get value() {
              return demoProps().valueSource === "value" ? value() : undefined;
            },
            get defaultValue() {
              return demoProps().valueSource === "defaultValue"
                ? parseSolidColorFieldValue(
                    demoProps().defaultValue,
                    colorFieldDemoDefaults.defaultValue,
                  )
                : undefined;
            },
            get label() {
              return demoProps().label || undefined;
            },
            get description() {
              return demoProps().description || undefined;
            },
            get errorMessage() {
              return demoProps().errorMessage || undefined;
            },
            get placeholder() {
              return demoProps().placeholder || undefined;
            },
            get channel() {
              return demoProps().channel || undefined;
            },
            get colorSpace() {
              return demoProps().colorSpace || undefined;
            },
            get name() {
              return demoProps().name || undefined;
            },
            get form() {
              return demoProps().form || undefined;
            },
            get id() {
              return demoProps().id || undefined;
            },
            get slot() {
              return demoProps().slot || undefined;
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
            get validationBehavior() {
              return demoProps().validationBehavior || undefined;
            },
            get isWheelDisabled() {
              return demoProps().isWheelDisabled;
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
            onChange: (nextValue: ReturnType<typeof parseSolidColorFieldValue>) => {
              setValue(nextValue);
              setDemoProps((current: ColorFieldDemoProps) =>
                current.valueSource === "value"
                  ? { ...current, value: solidColorFieldToCssString(nextValue) }
                  : current,
              );
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
        disallowEmptySelection: props.disallowEmptySelection,
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
  const [selectedKey, setSelectedKey] = createSignal<SegmentedControlKey>(
    initialSegmentedControlSelectedKey(demoProps()),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  let segmentedControlRoot: HTMLElement | undefined;

  createEffect(() => {
    segmentedControlRoot?.setAttribute(
      "data-comparison-control-props",
      serializeSegmentedControlDemoProps(demoProps()),
    );
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "segmentedcontrol") {
        const nextProps = normalizeSegmentedControlDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKey(initialSegmentedControlSelectedKey(nextProps));
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

  const renderKey = createMemo(() =>
    [
      demoProps().selectionSource,
      demoProps().selectionSource === "defaultSelectedKey"
        ? demoProps().defaultSelectedKey
        : demoProps().selectedKey,
      demoProps().disabledKey,
      demoProps().iconPlacement,
      demoProps().isJustified,
      demoProps().isDisabled,
    ].join("|"),
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
          get "data-comparison-selected-key"() {
            return selectedKey();
          },
        },
        [
          createComponent(Show, {
            get when() {
              return renderKey();
            },
            keyed: true,
            children: () =>
              hc(
                SolidSpectrumSegmentedControl,
                {
                  "aria-label": "View mode",
                  "data-comparison-control-root": "segmentedcontrol",
                  ref: (element: HTMLElement) => {
                    segmentedControlRoot = element;
                  },
                  "data-comparison-control-props": serializeSegmentedControlDemoProps(demoProps()),
                  isJustified: demoProps().isJustified,
                  isDisabled: demoProps().isDisabled,
                  get selectedKey() {
                    return demoProps().selectionSource === "selectedKey" ? selectedKey() : null;
                  },
                  get defaultSelectedKey() {
                    return demoProps().selectionSource === "defaultSelectedKey"
                      ? demoProps().defaultSelectedKey
                      : undefined;
                  },
                  onSelectionChange: (key: string | number) =>
                    setSelectedKey(String(key) as SegmentedControlKey),
                },
                segmentedControlItems.map((item) =>
                  hc(
                    SolidSpectrumSegmentedControlItem,
                    {
                      id: item.id,
                      get isDisabled() {
                        return demoProps().disabledKey === item.id;
                      },
                      get "aria-label"() {
                        return demoProps().iconPlacement === "only" ? item.label : undefined;
                      },
                    },
                    solidSingleButtonFamilyChildren(
                      item.label,
                      () => demoProps().iconPlacement,
                      () => s2ToggleButtonText,
                    ),
                  ),
                ),
              ) as unknown as JSX.Element,
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
    initialSelectBoxGroupSelectedKeys(demoProps()),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const selectedKeyText = createMemo(() => serializeSelectBoxGroupKeys(selectedKeys()));
  let selectBoxGroupRoot: HTMLElement | undefined;

  createEffect(() => {
    selectBoxGroupRoot?.setAttribute(
      "data-comparison-control-props",
      serializeSelectBoxGroupDemoProps(demoProps()),
    );
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "selectboxgroup") {
        setDemoProps((current) => {
          const nextProps = normalizeSelectBoxGroupDemoProps({
            ...current,
            ...(event.detail.props ?? {}),
          });
          setSelectedKeys(initialSelectBoxGroupSelectedKeys(nextProps));
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
                return serializeSelectBoxGroupDemoProps(demoProps());
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
              get items() {
                return selectBoxGroupItems;
              },
              getKey: (item: (typeof selectBoxGroupItems)[number]) => item.id,
              getTextValue: (item: (typeof selectBoxGroupItems)[number]) => item.label,
              get disabledKeys() {
                return selectBoxGroupKeysFromValue(demoProps().disabledKeys, [], "multiple");
              },
              get selectedKeys() {
                return demoProps().selectionSource === "selectedKeys" ? selectedKeys() : undefined;
              },
              get defaultSelectedKeys() {
                return demoProps().selectionSource === "defaultSelectedKeys"
                  ? selectBoxGroupKeysFromValue(
                      demoProps().defaultSelectedKeys,
                      ["starter"],
                      demoProps().selectionMode,
                    )
                  : undefined;
              },
              onSelectionChange: (keys: "all" | Set<string | number>) =>
                setSelectedKeys(
                  keys === "all"
                    ? new Set(selectBoxGroupItems.map((item) => item.id))
                    : new Set<string>(Array.from(keys, String)),
                ),
            },
            renderProp((item: (typeof selectBoxGroupItems)[number]) =>
              hc(
                SolidSpectrumSelectBox,
                {
                  id: item.id,
                  textValue: item.label,
                  get isDisabled() {
                    return demoProps().disabledItem === item.id;
                  },
                },
                [
                  ...(demoProps().withIllustrations &&
                  selectBoxGroupIllustrationItemIds.has(item.id)
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
  const [demoProps, setDemoProps] = createSignal<CardViewDemoProps>(cardViewDemoPropsFromWindow());
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    initialCardViewSelectedKeys(demoProps()),
  );
  const colorScheme = createComparisonResolvedThemeSignal();
  const selectedKeyText = createMemo(() => serializeCardViewKeys(selectedKeys()));
  let cardViewRoot: HTMLElement | undefined;

  createEffect(() => {
    cardViewRoot?.setAttribute(
      "data-comparison-control-props",
      serializeCardViewDemoProps(demoProps()),
    );
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "cardview") {
        setDemoProps((current) => {
          const nextProps = normalizeCardViewDemoProps({
            ...current,
            ...(event.detail.props ?? {}),
          });
          setSelectedKeys(initialCardViewSelectedKeys(nextProps));
          return nextProps;
        });
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
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
              get "aria-label"() {
                return demoProps().ariaLabel;
              },
              "data-comparison-control-root": "cardview",
              ref: (element: HTMLElement) => {
                cardViewRoot = element;
              },
              get "data-comparison-control-props"() {
                return serializeCardViewDemoProps(demoProps());
              },
              items: cardViewItems,
              getKey: (item: (typeof cardViewItems)[number]) => item.id,
              getTextValue: (item: (typeof cardViewItems)[number]) => item.title,
              get layout() {
                return demoProps().layout;
              },
              get size() {
                return demoProps().size;
              },
              get density() {
                return demoProps().density;
              },
              get variant() {
                return demoProps().variant;
              },
              get selectionMode() {
                return demoProps().selectionMode;
              },
              get selectionStyle() {
                return demoProps().selectionStyle;
              },
              get disabledKeys() {
                return cardViewKeysFromValue(demoProps().disabledKeys, [], "multiple");
              },
              UNSAFE_style: cardViewDemoStyle,
              get selectedKeys() {
                return demoProps().selectionSource === "selectedKeys" ? selectedKeys() : undefined;
              },
              get defaultSelectedKeys() {
                return demoProps().selectionSource === "defaultSelectedKeys"
                  ? cardViewKeysFromValue(
                      demoProps().defaultSelectedKeys,
                      ["apollo"],
                      demoProps().selectionMode,
                    )
                  : undefined;
              },
              get renderActionBar() {
                return demoProps().showActionBar
                  ? (keys: "all" | Set<string | number>) =>
                      hc(
                        SolidSpectrumActionBar,
                        {
                          selectedItemCount: keys === "all" ? cardViewItems.length : keys.size,
                          "data-comparison-cardview-actionbar": "true",
                          onClearSelection: () => setSelectedKeys(new Set<string>()),
                        },
                        [
                          hc(SolidSpectrumActionButton, {}, [
                            hc(SolidSpectrumText, {}, ["Archive"]),
                          ]),
                        ],
                      )
                  : undefined;
              },
              onSelectionChange: (keys: "all" | Set<string | number>) =>
                setSelectedKeys(
                  keys === "all"
                    ? new Set(cardViewItems.map((item) => item.id))
                    : new Set<string>(Array.from(keys, String)),
                ),
            },
            renderProp((item: (typeof cardViewItems)[number]) =>
              hc(
                SolidSpectrumCard,
                {
                  id: item.id,
                  textValue: `${item.title} ${item.status}`,
                  get isDisabled() {
                    return demoProps().disabledItem === item.id;
                  },
                },
                [
                  hc(SolidSpectrumContent, {}, [
                    hc(SolidSpectrumText, { slot: "title" }, [item.title]),
                    hc(
                      Show,
                      {
                        get when() {
                          return demoProps().showDescriptions;
                        },
                      },
                      [hc(SolidSpectrumText, { slot: "description" }, [item.status])],
                    ),
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

function SolidSpectrumCardDemo() {
  const [demoProps, setDemoProps] = createSignal<CardDemoProps>(cardDemoPropsFromWindow());
  const colorScheme = createComparisonResolvedThemeSignal();

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "card") {
        setDemoProps((current) =>
          normalizeCardDemoProps({ ...current, ...(event.detail.props ?? {}) }),
        );
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
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
          "data-comparison-control-root": "card",
          get "data-comparison-control-props"() {
            return serializeCardDemoProps(demoProps());
          },
        },
        [
          hc(
            SolidSpectrumSkeleton,
            {
              get isLoading() {
                return demoProps().skeleton;
              },
            },
            [
              hc(
                SolidSpectrumCard,
                {
                  get size() {
                    return demoProps().size;
                  },
                  get density() {
                    return demoProps().density;
                  },
                  get variant() {
                    return demoProps().variant;
                  },
                  get href() {
                    return demoProps().href || undefined;
                  },
                  get target() {
                    return demoProps().href ? "_blank" : undefined;
                  },
                  get rel() {
                    return demoProps().href ? "noreferrer" : undefined;
                  },
                  get isDisabled() {
                    return demoProps().isDisabled;
                  },
                  get textValue() {
                    return demoProps().textValue;
                  },
                  UNSAFE_style: { width: "240px" },
                },
                [
                  () => [
                    ...(demoProps().showPreview
                      ? [
                          hc(SolidSpectrumCardPreview, {}, [
                            hc(SolidSpectrumImage, { src: cardPreviewImageSrc, alt: "" }),
                          ]),
                        ]
                      : []),
                    hc(SolidSpectrumContent, {}, [
                      hc(SolidSpectrumText, { slot: "title" }, [() => demoProps().title]),
                      hc(SolidSpectrumText, { slot: "description" }, [
                        () => demoProps().description,
                      ]),
                    ]),
                    ...(demoProps().showFooter
                      ? [
                          hc(SolidSpectrumFooter, {}, [
                            hc(SolidSpectrumStatusLight, { variant: "positive" }, ["Synced"]),
                          ]),
                        ]
                      : []),
                  ],
                ],
              ),
            ],
          ),
        ],
      ),
    ],
  );
}

const providerShellStyle = {
  padding: "0",
  background: "transparent",
};

const iconGalleryStyle = {
  display: "flex",
  "align-items": "center",
  gap: "16px",
  padding: "12px",
};

const illustrationGalleryStyle = {
  display: "flex",
  "align-items": "center",
  gap: "24px",
  padding: "12px",
};

const progressFixtureStackStyle = {
  display: "flex",
  "flex-direction": "column",
  gap: "24px",
  width: "360px",
  padding: "12px",
};

const progressCircleRowStyle = {
  display: "flex",
  "align-items": "center",
  gap: "24px",
  padding: "12px",
};

const rangeSliderStackStyle = {
  display: "flex",
  "flex-direction": "column",
  gap: "28px",
  width: "420px",
  padding: "12px",
};

const popoverFixtureStyle = {
  display: "flex",
  "flex-direction": "column",
  "align-items": "center",
  gap: "16px",
  "min-height": "360px",
  width: "420px",
  padding: "12px",
};

const popoverAnchorStyle = {
  padding: "8px",
  "border-radius": "8px",
  background: "color-mix(in srgb, CanvasText 8%, Canvas)",
  font: "13px system-ui, sans-serif",
};

const popoverContentStyle = {
  width: "300px",
  padding: "12px",
};

const popoverBodyTextStyle = {
  margin: "0 0 12px",
  font: "14px system-ui, sans-serif",
};

const collectionFixtureStyle = {
  width: "440px",
  padding: "12px",
};

const collectionListStyle = {
  width: "100%",
  height: "220px",
};

const collectionTagGroupStyle = {
  "max-width": "320px",
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
