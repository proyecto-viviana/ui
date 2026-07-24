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
  ActionGroup as SolidSpectrumActionGroup,
  StepList as SolidSpectrumStepList,
  Toolbar as SolidSpectrumToolbar,
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
  AlertDialog as SolidSpectrumAlertDialog,
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
  LabeledValue as SolidSpectrumLabeledValue,
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
  PickerItem as SolidSpectrumPickerItem,
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
  TreeViewItemContent as SolidSpectrumTreeViewItemContent,
  TreeViewLoadMoreItem as SolidSpectrumTreeViewLoadMoreItem,
  createIcon,
  createIllustration,
  parseColor as parseSolidSpectrumColor,
} from "@proyecto-viviana/solid-spectrum";
import {
  ListBox as SolidHeadlessListBox,
  ListBoxOption as SolidHeadlessListBoxOption,
  GridList as SolidHeadlessGridList,
  GridListItem as SolidHeadlessGridListItem,
  Autocomplete as SolidHeadlessAutocomplete,
  SearchField as SolidHeadlessSearchField,
  SearchFieldInput as SolidHeadlessSearchFieldInput,
  Virtualizer as SolidHeadlessVirtualizer,
  ListLayout as SolidHeadlessListLayout,
  useDragAndDrop as useSolidDragAndDrop,
  createListData as createSolidListData,
} from "@proyecto-viviana/solidaria-components";
import { createFilter as solidCreateFilter } from "@proyecto-viviana/solidaria";
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
import { dispatchComparisonCallback, pressCallbackLoggers } from "@comparison/data/event-log";
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
  listBoxDemoItems,
  listBoxDemoPropsFromWindow,
  normalizeListBoxDemoProps,
  serializeListBoxDemoProps,
  type ListBoxDemoItem,
  type ListBoxDemoProps,
} from "@comparison/data/listbox-demo";
import {
  dndListBoxDemoItems,
  dndListBoxDemoPropsFromWindow,
  normalizeDndListBoxDemoProps,
  serializeDndListBoxDemoProps,
  serializeDndListBoxOrder,
  type DndListBoxDemoItem,
  type DndListBoxDemoProps,
} from "@comparison/data/dnd-listbox-demo";
import {
  virtualizerDemoItems,
  virtualizerDemoPropsFromWindow,
  normalizeVirtualizerDemoProps,
  serializeVirtualizerDemoProps,
  virtualizerRowHeight,
  virtualizerViewportHeight,
  type VirtualizerDemoItem,
  type VirtualizerDemoProps,
} from "@comparison/data/virtualizer-demo";
import {
  autocompleteDemoItems,
  autocompleteDemoPropsFromWindow,
  normalizeAutocompleteDemoProps,
  serializeAutocompleteDemoProps,
  type AutocompleteDemoItem,
  type AutocompleteDemoProps,
} from "@comparison/data/autocomplete-demo";
import {
  gridListDemoItems,
  gridListDemoPropsFromWindow,
  gridListDemoLocaleFromWindow,
  normalizeGridListDemoProps,
  serializeGridListDemoProps,
  type GridListDemoItem,
  type GridListDemoProps,
} from "@comparison/data/gridlist-demo";
import {
  actionGroupDemoItems,
  actionGroupDemoPropsFromWindow,
  actionGroupDemoLocaleFromWindow,
  actionGroupKeysFromValue,
  normalizeActionGroupDemoProps,
  serializeActionGroupDemoProps,
  type ActionGroupDemoProps,
} from "@comparison/data/actiongroup-demo";
import {
  stepListDemoItems,
  stepListDemoPropsFromWindow,
  stepListKeysFromValue,
  normalizeStepListDemoProps,
  serializeStepListDemoProps,
  type StepListDemoProps,
} from "@comparison/data/steplist-demo";
import {
  toolbarDemoItems,
  toolbarNestedGroups,
  toolbarDemoPropsFromWindow,
  toolbarDemoLocaleFromWindow,
  normalizeToolbarDemoProps,
  serializeToolbarDemoProps,
  type ToolbarDemoProps,
} from "@comparison/data/toolbar-demo";
import {
  comparisonControlsEvent as treeViewControlsEvent,
  initialTreeViewExpandedKeys,
  initialTreeViewSelectedKeys,
  normalizeTreeViewDemoProps,
  serializeTreeViewDemoProps,
  serializeTreeViewKeys,
  treeViewDemoItems,
  treeViewDemoPropsFromWindow,
  treeViewExpandedKeysFromValue,
  treeViewKeysFromValue,
  treeViewVisibleKeys,
  type TreeViewDemoItem,
  type TreeViewDemoProps,
} from "@comparison/data/treeview-demo";
import {
  initialTableViewSelectedKeys,
  normalizeTableViewDemoProps,
  serializeTableViewDemoProps,
  serializeTableViewKeys,
  serializeTableViewSortDescriptor,
  sortTableViewRows,
  tableViewDemoItems,
  tableViewDemoLocaleFromWindow,
  tableViewDemoPropsFromWindow,
  tableViewInitialSortDescriptor,
  tableViewKeysFromValue,
  tableViewVisibleColumns,
  type TableViewDemoRow,
  type TableViewDemoProps,
  type TableViewSortDescriptor,
} from "@comparison/data/tableview-demo";
import {
  disabledTagGroupKeys,
  initialTagGroupSelectedKeys,
  normalizeTagGroupDemoProps,
  serializeTagGroupDemoProps,
  serializeTagGroupKeys,
  tagGroupDemoLocaleFromWindow,
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
  pickerDemoLocaleFromWindow,
  pickerDemoPropsFromWindow,
  pickerItems,
  pickerSelectedKeysForMode,
  serializePickerSelectedKeys,
  serializePickerDemoProps,
  type PickerDemoProps,
} from "@comparison/data/picker-demo";
import {
  comboBoxDemoLocaleFromWindow,
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
  normalizeProviderDemoProps,
  providerDemoPropsFromWindow,
  serializeProviderDemoProps,
  type ProviderDemoProps,
} from "@comparison/data/provider-demo";
import {
  normalizeTextFieldDemoProps,
  serializeTextFieldDemoProps,
  textFieldDemoPropsFromWindow,
  type TextFieldDemoProps,
} from "@comparison/data/textfield-demo";
import {
  labeledValueDemoPropsFromWindow,
  normalizeLabeledValueDemoProps,
  resolveLabeledValueDemoValue,
  serializeLabeledValueDemoProps,
  type LabeledValueDemoProps,
} from "@comparison/data/labeledvalue-demo";
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
  type ToastDemoVariant,
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
// Tier-6 custom Viviana components: imported from source so their S2 style()
// macro compiles in-app. Their brand color tokens ride in via `viviana-tokens.css`,
// imported `?inline` (as a string, not injected) and rewritten to a per-component
// scoped selector so importing them can never repaint the rest of the comparison app.
import { CalendarCard as VivianaCalendarCard } from "../../../../../../packages/viviana-ui/archive/custom/calendar-card";
import { Chip as VivianaChip } from "../../../../../../packages/viviana-ui/archive/custom/chip";
import { NavHeader as VivianaNavHeader } from "../../../../../../packages/viviana-ui/archive/custom/nav-header";
import { ProfileCard as VivianaProfileCard } from "../../../../../../packages/viviana-ui/archive/custom/profile-card";
import { ProjectCard as VivianaProjectCard } from "../../../../../../packages/viviana-ui/archive/custom/project-card";
import {
  LateralNav as VivianaLateralNav,
  NavSection as VivianaNavSection,
} from "../../../../../../packages/viviana-ui/archive/custom/lateral-nav";
import { TimelineItem as VivianaTimelineItem } from "../../../../../../packages/viviana-ui/archive/custom/timeline-item";
import {
  Conversation as VivianaConversation,
  ConversationPreview as VivianaConversationPreview,
} from "../../../../../../packages/viviana-ui/archive/custom/conversation";
import { Logo as VivianaLogo } from "../../../../../../packages/viviana-ui/archive/custom/logo";
import { Header as VivianaHeader } from "../../../../../../packages/viviana-ui/archive/custom/header";
import { PageLayout as VivianaPageLayout } from "../../../../../../packages/viviana-ui/archive/custom/page-layout";
import {
  EventCard as VivianaEventCard,
  EventListItem as VivianaEventListItem,
} from "../../../../../../packages/viviana-ui/archive/custom/event-card";
import vivianaTokensCss from "../../../../../../packages/viviana-ui/src/viviana-tokens.css?inline";

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

/**
 * ActionButton children, mirroring the React fixture's
 * `renderSingleButtonFamilyChildren` shape exactly (bare string for the
 * text-only case, `SpectrumText` for the icon-start case). Unlike the plain
 * button/toggle helper above, ActionButton must NOT hand-build a `<span>` with
 * a pre-computed text visibility class: `isPending` swaps the label for a
 * ProgressCircle on a deliberate 1s delay, and only the component owns that
 * delayed `isProgressVisible` signal. Passing a bare string lets the port's
 * `getSingleTextChild` re-wrap it in the component's own delayed
 * `s2ActionButtonText({isProgressVisible})` span, and passing `SolidSpectrumText`
 * lets it read the component's `TextContext` — the same way React lets S2's
 * `Text`/`TextContext` own the delayed visibility. Hard-coding `props.isPending`
 * in the fixture instead would hide the label immediately (defeating the 1s
 * delay) and drop the accessible name before the spinner mounts.
 */
function solidActionButtonFamilyChildren(
  label: () => string,
  iconPlacement: () => SingleButtonIconPlacement,
) {
  return [
    () => {
      const placement = iconPlacement();

      if (placement === "start") {
        return [h(SolidNewIcon, { "aria-hidden": "true" }), h(SolidSpectrumText, {}, label())];
      }

      if (placement === "only") {
        return h(SolidNewIcon, { "aria-hidden": "true" });
      }

      return label();
    },
  ];
}

export const solidStyledFixtures: Partial<Record<ComparisonSlug, SolidStyledFixture>> = {
  provider: () => h(SolidSpectrumProviderDemo, {}),
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
  chip: () => h(SolidChipDemo, {}),
  navheader: () => h(SolidNavHeaderDemo, {}),
  eventcard: () => h(SolidEventCardDemo, {}),
  calendarcard: () => h(SolidCalendarCardDemo, {}),
  profilecard: () => h(SolidProfileCardDemo, {}),
  projectcard: () => h(SolidProjectCardDemo, {}),
  lateralnav: () => h(SolidLateralNavDemo, {}),
  timelineitem: () => h(SolidTimelineItemDemo, {}),
  conversation: () => h(SolidConversationDemo, {}),
  logo: () => h(SolidLogoDemo, {}),
  header: () => h(SolidHeaderDemo, {}),
  pagelayout: () => h(SolidPageLayoutDemo, {}),
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
  listbox: () => h(SolidSpectrumListBoxDemo, {}),
  "dnd-listbox": () => h(SolidSpectrumDndListBoxDemo, {}),
  virtualizer: () => h(SolidSpectrumVirtualizerDemo, {}),
  autocomplete: () => h(SolidSpectrumAutocompleteDemo, {}),
  gridlist: () => h(SolidSpectrumGridListDemo, {}),
  actiongroup: () => h(SolidSpectrumActionGroupDemo, {}),
  steplist: () => h(SolidSpectrumStepListDemo, {}),
  toolbar: () => h(SolidSpectrumToolbarDemo, {}),
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
  labeledvalue: () => h(SolidSpectrumLabeledValueDemo, {}),
  tooltip: () => h(SolidSpectrumTooltipDemo, {}),
  toast: () => h(SolidSpectrumToastDemo, {}),
  togglebutton: () => h(SolidSpectrumToggleButtonDemo, {}),
  togglebuttongroup: () => h(SolidSpectrumToggleButtonGroupDemo, {}),
  treeview: () => h(SolidSpectrumTreeViewDemo, {}),
};

function SolidSpectrumProviderDemo() {
  const [demoProps, setDemoProps] = createSignal<ProviderDemoProps>(providerDemoPropsFromWindow());

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "provider") {
        setDemoProps(normalizeProviderDemoProps(event.detail.props ?? {}));
      }
    };
    window.addEventListener(comparisonControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(comparisonControlsEvent, handleControlsChange));
  });

  return hc(
    SolidSpectrumProvider,
    {
      "data-comparison-control-root": "provider",
      get "data-comparison-control-props"() {
        return serializeProviderDemoProps(demoProps());
      },
      get colorScheme() {
        return demoProps().colorScheme;
      },
      get background() {
        return demoProps().background;
      },
      style: providerShellStyle,
    },
    [
      hc("div", { class: "comparison-provider-stack" }, [
        hc("div", { class: "comparison-provider-caption" }, [
          () => `Outer provider: ${demoProps().colorScheme} / ${demoProps().background}`,
        ]),
        h(SolidSpectrumButton, { variant: "primary" }, "Inherited Action"),
        h(
          SolidSpectrumProvider,
          { colorScheme: "light", background: "base", style: nestedProviderStyle },
          h(
            "div",
            { class: "comparison-provider-caption" },
            "Nested provider: local light override",
          ),
          h(SolidSpectrumButton, { variant: "accent" }, "Nested Override"),
        ),
      ]),
    ],
  );
}

/**
 * Viviana's brand tokens, rewritten from the global `:root` / `[data-color-scheme]`
 * selectors onto a `[data-viviana-chip-scope]` island so the string can be dropped
 * into a `<style>` inside the demo without touching any `--color-*` var elsewhere
 * on the page (solid-spectrum icons read some of these vars globally). The light
 * override nests under the Provider's own `data-color-scheme="light"` div, so its
 * higher specificity wins in light mode and the pair flips together with the theme.
 */
// Rewrite the `?inline` viviana token sheet so every `:root` / light-scheme block
// binds under a per-component scope attribute instead of the document root. The
// light override stays nested one level deeper than the Provider's own
// `data-color-scheme="light"` div, so its higher specificity still wins in light
// mode and the dark/light token pair flips together with the theme. Scoping is
// mandatory: solid-spectrum icons read some of these vars globally, so a document-
// root import would repaint the rest of the comparison app.
function scopeVivianaTokens(scopeAttr: string): string {
  return vivianaTokensCss
    .replaceAll(":root {", `[${scopeAttr}] {`)
    .replaceAll('[data-color-scheme="light"] {', `[${scopeAttr}] [data-color-scheme="light"] {`);
}

const vivianaChipScopedTokensCss = scopeVivianaTokens("data-viviana-chip-scope");

const chipScopeStyle = {
  display: "inline-block",
  padding: "12px",
};

const chipRowStyle = {
  display: "flex",
  "align-items": "center",
  gap: "12px",
  "flex-wrap": "wrap",
};

const chipVariants: readonly {
  text: string;
  variant: "primary" | "secondary" | "accent" | "outline";
}[] = [
  { text: "Primary", variant: "primary" },
  { text: "Secondary", variant: "secondary" },
  { text: "Accent", variant: "accent" },
  { text: "Outline", variant: "outline" },
];

function SolidChipDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();

  return hc(
    "div",
    {
      "data-viviana-chip-scope": "true",
      "data-comparison-control-root": "chip",
      style: chipScopeStyle,
    },
    [
      h("style", {}, vivianaChipScopedTokensCss),
      hc(
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
            { style: chipRowStyle },
            chipVariants.map((entry) =>
              h(VivianaChip, { text: entry.text, variant: entry.variant }),
            ),
          ),
        ],
      ),
    ],
  );
}

const vivianaNavHeaderScopedTokensCss = scopeVivianaTokens("data-viviana-nav-header-scope");

const navHeaderScopeStyle = {
  display: "block",
  width: "420px",
  "max-width": "100%",
};

// A ≥24px icon box so the (padding-less) menu button clears the WCAG 2.5.8 24px
// target floor with margin — a realistic menu-icon size, not a hairline glyph.
const navMenuIconStyle = {
  display: "inline-flex",
  "align-items": "center",
  "justify-content": "center",
  width: "32px",
  height: "32px",
  "font-size": "20px",
  "line-height": "1",
};

function SolidNavHeaderDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();

  return hc(
    "div",
    {
      "data-viviana-nav-header-scope": "true",
      "data-comparison-control-root": "navheader",
      style: navHeaderScopeStyle,
    },
    [
      h("style", {}, vivianaNavHeaderScopedTokensCss),
      hc(
        SolidSpectrumProvider,
        {
          get colorScheme() {
            return colorScheme();
          },
          background: "base",
          style: providerShellStyle,
        },
        [
          h(VivianaNavHeader, {
            logoText: "Silapse",
            menuAriaLabel: "Open menu",
            // Decorative glyph (aria-hidden) sized to a real icon box; the button's
            // accessible name comes from `menuAriaLabel`, not this content.
            menuIcon: h("span", { "aria-hidden": "true", style: navMenuIconStyle }, "☰"),
          }),
        ],
      ),
    ],
  );
}

const vivianaEventCardScopedTokensCss = scopeVivianaTokens("data-viviana-event-card-scope");

const eventCardScopeStyle = {
  display: "flex",
  "flex-direction": "column",
  gap: "16px",
  width: "340px",
  "max-width": "100%",
};

// A viviana-token panel behind the (transparent) EventListItem so its text runs
// composite over a known `--color-bg-300` surface, the way the row is used in
// product (rows live inside a panel, not on the bare page background).
const eventListPanelStyle = {
  display: "block",
  padding: "8px",
  "border-radius": "12px",
  "background-color": "var(--color-bg-300)",
};

function SolidEventCardDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();

  return hc(
    "div",
    {
      "data-viviana-event-card-scope": "true",
      "data-comparison-control-root": "eventcard",
      style: eventCardScopeStyle,
    },
    [
      h("style", {}, vivianaEventCardScopedTokensCss),
      hc(
        SolidSpectrumProvider,
        {
          get colorScheme() {
            return colorScheme();
          },
          background: "base",
          style: providerShellStyle,
        },
        [
          // The summary card: exercises the title (accent) + author/date meta
          // (icon glyph + secondary text) contrast runs.
          h(VivianaEventCard, {
            title: "Weekly Team Sync",
            author: "María López",
            date: "Jul 15 · 10:00",
          }),
          // The compact row: the interactive D8 target and its own text runs,
          // composited over a `--color-bg-300` panel.
          hc("div", { style: eventListPanelStyle }, [
            h(VivianaEventListItem, {
              title: "Design Review",
              subtitle: "Tomorrow · 14:00",
            }),
          ]),
        ],
      ),
    ],
  );
}

const vivianaCalendarCardScopedTokensCss = scopeVivianaTokens("data-viviana-calendar-card-scope");

const calendarCardScopeStyle = {
  display: "block",
  width: "500px",
  "max-width": "100%",
};

function SolidCalendarCardDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();

  return hc(
    "div",
    {
      "data-viviana-calendar-card-scope": "true",
      "data-comparison-control-root": "calendarcard",
      style: calendarCardScopeStyle,
    },
    [
      h("style", {}, vivianaCalendarCardScopedTokensCss),
      hc(
        SolidSpectrumProvider,
        {
          get colorScheme() {
            return colorScheme();
          },
          background: "base",
          style: providerShellStyle,
        },
        [
          // The "followed calendar" card on the `--color-bg-300` surface:
          // exercises the title (primary-100), the followers line (secondary
          // connectors + bold follower-name runs, the D7 red→green fix) and the
          // primary tag chips (the interactive D8 targets / D5 focus stops).
          h(VivianaCalendarCard, {
            title: "Conciertos en el Parque",
            followers: [{ name: "María López" }, { name: "Ana Ruiz" }],
            followerCount: 5,
            tags: ["Música", "Comunidad"],
          }),
        ],
      ),
    ],
  );
}

const vivianaProfileCardScopedTokensCss = scopeVivianaTokens("data-viviana-profile-card-scope");

const profileCardScopeStyle = {
  display: "block",
  width: "360px",
  "max-width": "100%",
};

function SolidProfileCardDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();

  return hc(
    "div",
    {
      "data-viviana-profile-card-scope": "true",
      "data-comparison-control-root": "profilecard",
      style: profileCardScopeStyle,
    },
    [
      h("style", {}, vivianaProfileCardScopedTokensCss),
      hc(
        SolidSpectrumProvider,
        {
          get colorScheme() {
            return colorScheme();
          },
          background: "base",
          style: providerShellStyle,
        },
        [
          // The profile card on the `--color-bg-200` surface: exercises the name
          // (primary-100), the bio + stat connectors (the D7 red→green fix) and
          // the bold stat values (primary-100). A "Seguir" primary Chip is the
          // footer action — the interactive D8 target / D5 focus stop.
          h(VivianaProfileCard, {
            username: "María López",
            bio: "Organizadora de eventos culturales en Madrid.",
            followers: 12400,
            following: 320,
            actions: () => h(VivianaChip, { text: "Seguir", variant: "primary" }),
          }),
        ],
      ),
    ],
  );
}

const vivianaProjectCardScopedTokensCss = scopeVivianaTokens("data-viviana-project-card-scope");

const projectCardScopeStyle = {
  display: "block",
  width: "200px",
  "max-width": "100%",
};

// A self-contained logo tile (inline SVG data URI — no network fetch) so the card
// renders deterministically under Playwright.
const projectCardLogo =
  "data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2064%2064'%3E%3Crect%20width%3D'64'%20height%3D'64'%20rx%3D'12'%20fill%3D'%23df5c9a'%2F%3E%3Ccircle%20cx%3D'32'%20cy%3D'32'%20r%3D'14'%20fill%3D'%23ffffff'%2F%3E%3C%2Fsvg%3E";

function SolidProjectCardDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();

  return hc(
    "div",
    {
      "data-viviana-project-card-scope": "true",
      "data-comparison-control-root": "projectcard",
      style: projectCardScopeStyle,
    },
    [
      h("style", {}, vivianaProjectCardScopedTokensCss),
      hc(
        SolidSpectrumProvider,
        {
          get colorScheme() {
            return colorScheme();
          },
          background: "base",
          style: providerShellStyle,
        },
        [
          // The project tile on the `--color-bg-200` surface. `href` turns the whole
          // card into a link — the interactive D8 target / D5 focus stop (the base
          // `<div>` variant has none, the ProfileCard landmine). The caption is
          // `primary-200`, which already clears AA on the card (11.26:1 dark /
          // 8.78:1 light), so this unit certifies clean on D7.
          h(VivianaProjectCard, {
            name: "Proyecto Aurora",
            imageSrc: projectCardLogo,
            href: "https://example.com/aurora",
            size: "md",
          }),
        ],
      ),
    ],
  );
}

const vivianaLateralNavScopedTokensCss = scopeVivianaTokens("data-viviana-lateral-nav-scope");

const lateralNavScopeStyle = {
  display: "block",
  width: "300px",
  "max-width": "100%",
};

function SolidLateralNavDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();

  return hc(
    "div",
    {
      "data-viviana-lateral-nav-scope": "true",
      "data-comparison-control-root": "lateralnav",
      style: lateralNavScopeStyle,
    },
    [
      h("style", {}, vivianaLateralNavScopedTokensCss),
      hc(
        SolidSpectrumProvider,
        {
          get colorScheme() {
            return colorScheme();
          },
          background: "base",
          style: providerShellStyle,
        },
        [
          // A sidebar nav on the `--color-bg-200` surface: two sections, each an
          // accent-railed list of links. The links are the interactive D8 targets /
          // D5 focus stops; the current-page link is `active`. The default link
          // color and the link target height are the two red→green fixes.
          hc(VivianaLateralNav, {}, [
            h(VivianaNavSection, {
              title: "Panel",
              links: [
                { href: "/dashboard", label: "Panel general", active: true },
                { href: "/proyectos", label: "Proyectos" },
                { href: "/equipo", label: "Equipo" },
              ],
            }),
            h(VivianaNavSection, {
              title: "Cuenta",
              links: [
                { href: "/perfil", label: "Perfil" },
                { href: "/ajustes", label: "Ajustes" },
              ],
            }),
          ]),
        ],
      ),
    ],
  );
}

const vivianaTimelineItemScopedTokensCss = scopeVivianaTokens("data-viviana-timeline-item-scope");

const timelineItemScopeStyle = {
  display: "block",
  width: "320px",
  "max-width": "100%",
};

// Self-contained inline-SVG data-URI avatars (no network fetch) so the two
// `<img>` render deterministically under Playwright; each carries its user's
// name as `alt` (the D6 accessible name).
const timelineLeftAvatar =
  "data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2064%2064'%3E%3Crect%20width%3D'64'%20height%3D'64'%20fill%3D'%23df5c9a'%2F%3E%3C%2Fsvg%3E";
const timelineRightAvatar =
  "data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2064%2064'%3E%3Crect%20width%3D'64'%20height%3D'64'%20fill%3D'%232470a5'%2F%3E%3C%2Fsvg%3E";

function SolidTimelineItemDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();

  return hc(
    "div",
    {
      "data-viviana-timeline-item-scope": "true",
      "data-comparison-control-root": "timelineitem",
      style: timelineItemScopeStyle,
    },
    [
      h("style", {}, vivianaTimelineItemScopedTokensCss),
      hc(
        SolidSpectrumProvider,
        {
          get colorScheme() {
            return colorScheme();
          },
          background: "base",
          style: providerShellStyle,
        },
        [
          // A "follow" timeline event on the `--color-bg-200` card: two `role=img`
          // avatars + an icon over a centered message. It is purely presentational
          // (nothing focusable/interactive → no D5/D8), so the two D7 red→green
          // fixes are its correctness surface: the emphasized names (were
          // `--color-accent`) and the connecting message (was `--color-text-secondary`).
          h(VivianaTimelineItem, {
            type: "follow",
            icon: "👋",
            leftUser: { name: "María López", avatar: timelineLeftAvatar },
            rightUser: { name: "Diego Ramírez", avatar: timelineRightAvatar },
          }),
        ],
      ),
    ],
  );
}

const vivianaConversationScopedTokensCss = scopeVivianaTokens("data-viviana-conversation-scope");

const conversationScopeStyle = {
  display: "block",
  width: "360px",
  "max-width": "100%",
};

// A solid `--color-bg-200` chat panel so the transparent ConversationPreview's
// text runs measure against a defined surface (the bubbles carry their own bg).
const conversationPanelStyle = {
  display: "flex",
  "flex-direction": "column",
  gap: "8px",
  padding: "8px",
  "border-radius": "12px",
  background: "var(--color-bg-200)",
};

const conversationAvatar =
  "data:image/svg+xml,%3Csvg%20xmlns%3D'http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg'%20viewBox%3D'0%200%2064%2064'%3E%3Crect%20width%3D'64'%20height%3D'64'%20fill%3D'%23df5c9a'%2F%3E%3C%2Fsvg%3E";

const conversationMessages = [
  {
    id: "m1",
    content: "¿Vienes al evento del sábado?",
    sender: "other" as const,
    timestamp: "10:02",
  },
  { id: "m2", content: "¡Sí, allí estaré!", sender: "user" as const, timestamp: "10:04" },
];

function SolidConversationDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();

  return hc(
    "div",
    {
      "data-viviana-conversation-scope": "true",
      "data-comparison-control-root": "conversation",
      style: conversationScopeStyle,
    },
    [
      h("style", {}, vivianaConversationScopedTokensCss),
      hc(
        SolidSpectrumProvider,
        {
          get colorScheme() {
            return colorScheme();
          },
          background: "base",
          style: providerShellStyle,
        },
        [
          // A chat panel: a ConversationPreview row (the one interactive target /
          // D5 focus stop — a HeadlessButton) over a two-bubble thread (an
          // `other` bg-300 bubble + a `user` accent bubble). The muted preview
          // text and the accent-bubble/unread-badge text are the D7 red→green fixes.
          hc("div", { style: conversationPanelStyle }, [
            h(VivianaConversationPreview, {
              user: { name: "Ana Torres", avatar: conversationAvatar, online: true },
              lastMessage: "Te espero en la entrada",
              timestamp: "12:45",
              unreadCount: 3,
            }),
            h(VivianaConversation, { messages: conversationMessages }),
          ]),
        ],
      ),
    ],
  );
}

const vivianaLogoScopedTokensCss = scopeVivianaTokens("data-viviana-logo-scope");

const logoScopeStyle = {
  display: "block",
  width: "auto",
  "max-width": "100%",
};

// A `--color-bg-200` panel — the standard Tier-6 surface and the worst-case
// common background for the accent word (its lightest light-mode value), so a
// Logo green here is green on the lighter header-bg it also lives on.
const logoPanelStyle = {
  display: "inline-flex",
  padding: "24px",
  "border-radius": "12px",
  background: "var(--color-bg-200)",
};

function SolidLogoDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();

  return hc(
    "div",
    {
      "data-viviana-logo-scope": "true",
      "data-comparison-control-root": "logo",
      style: logoScopeStyle,
    },
    [
      h("style", {}, vivianaLogoScopedTokensCss),
      hc(
        SolidSpectrumProvider,
        {
          get colorScheme() {
            return colorScheme();
          },
          background: "base",
          style: providerShellStyle,
        },
        [
          // The two-word wordmark on the `--color-bg-200` panel. It is purely
          // presentational (a `<span>` of two colored word `<span>`s, nothing
          // focusable → no D5/D8). The accent word (`--color-accent`) is the D7
          // red→green fix; the default `size="lg"` renders `title-xl` at `black`
          // weight, so the driver classifies it against the large-text floor.
          hc("div", { style: logoPanelStyle }, [
            h(VivianaLogo, { size: "lg", firstWord: "Proyecto", secondWord: "Viviana" }),
          ]),
        ],
      ),
    ],
  );
}

const vivianaHeaderScopedTokensCss = scopeVivianaTokens("data-viviana-header-scope");

const headerScopeStyle = {
  display: "block",
  width: "640px",
  "max-width": "100%",
};

function SolidHeaderDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();

  return hc(
    "div",
    {
      "data-viviana-header-scope": "true",
      "data-comparison-control-root": "header",
      style: headerScopeStyle,
    },
    [
      h("style", {}, vivianaHeaderScopedTokensCss),
      hc(
        SolidSpectrumProvider,
        {
          get colorScheme() {
            return colorScheme();
          },
          background: "base",
          style: providerShellStyle,
        },
        [
          // The Header app-bar (`--color-header-bg`) composes two already-certified
          // leaves: the two-tone Logo wordmark (left) and certified solid-fill Chips
          // as nav actions (right, in the `<nav>` slot). Every text run is therefore
          // pre-certified — the Logo tones (now green on the lighter header-bg) and
          // the chip labels (on their own solid fills) — so Header is a clean-green
          // composition cert. The chips are the D5/D8 interactive targets.
          hc(
            VivianaHeader,
            {
              logoProps: { firstWord: "Proyecto", secondWord: "Viviana" },
            },
            [
              h(VivianaChip, { text: "Docs", variant: "primary" }),
              h(VivianaChip, { text: "Playground", variant: "accent" }),
            ],
          ),
        ],
      ),
    ],
  );
}

const vivianaPageLayoutScopedTokensCss = scopeVivianaTokens("data-viviana-page-layout-scope");

// PageLayout is `min-height: 100vh` by design; the scope clips it to a
// representative window so the preview stays bounded (a demo-harness choice,
// like Header's 640px width — the component keeps its authentic full height).
const pageLayoutScopeStyle = {
  display: "block",
  width: "480px",
  "max-width": "100%",
  height: "360px",
  overflow: "hidden",
};

// The page-content region. Nothing sets `color`, so both runs inherit the
// PageLayout's `--color-text` on its `--color-background` surface — exactly the
// base surface/text pairing the D7 driver certifies. The heading is on the
// large-text path (24px/700 → 3:1 floor); the body is normal text (4.5:1).
const pageLayoutContentStyle = {
  display: "flex",
  "flex-direction": "column",
  gap: "8px",
  padding: "24px",
};
const pageLayoutHeadingStyle = { margin: "0", "font-size": "24px", "font-weight": "700" };
const pageLayoutBodyStyle = { margin: "0", "font-size": "16px" };

function SolidPageLayoutDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();

  return hc(
    "div",
    {
      "data-viviana-page-layout-scope": "true",
      "data-comparison-control-root": "pagelayout",
      style: pageLayoutScopeStyle,
    },
    [
      h("style", {}, vivianaPageLayoutScopedTokensCss),
      hc(
        SolidSpectrumProvider,
        {
          get colorScheme() {
            return colorScheme();
          },
          background: "base",
          style: providerShellStyle,
        },
        [
          // The full-height page shell paints its own two base tokens — the
          // `--color-background` surface and the inherited `--color-text` body
          // color — and passes its children straight through (no chrome, no
          // roles, nothing focusable). A heading + paragraph ride that paint as
          // the only text runs the D7 driver measures, so the cert pins exactly
          // the base surface/text pairing PageLayout owns, in both themes.
          hc(VivianaPageLayout, {}, [
            hc("div", { style: pageLayoutContentStyle }, [
              h("h1", { style: pageLayoutHeadingStyle }, "Panel general"),
              h(
                "p",
                { style: pageLayoutBodyStyle },
                "Silapse organiza tus proyectos, tu equipo y tu calendario en un solo lugar.",
              ),
            ]),
          ]),
        ],
      ),
    ],
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

function SolidSpectrumListBoxDemo() {
  const [demoProps, setDemoProps] = createSignal<ListBoxDemoProps>(listBoxDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "listbox") {
        setDemoProps(normalizeListBoxDemoProps(event.detail.props ?? {}));
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

  const renderedListBox = createMemo(() =>
    hc(
      SolidHeadlessListBox,
      {
        "aria-label": "Permissions",
        get selectionMode() {
          return demoProps().selectionMode;
        },
        "data-comparison-control-root": "listbox",
        get "data-comparison-control-props"() {
          return serializeListBoxDemoProps(demoProps());
        },
        items: listBoxDemoItems,
        getKey: (item: ListBoxDemoItem) => item.id,
        getTextValue: (item: ListBoxDemoItem) => item.label,
      },
      renderProp((item: ListBoxDemoItem) =>
        hc(SolidHeadlessListBoxOption, { id: item.id, textValue: item.label }, [item.label]),
      ),
    ),
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
          class: "comparison-listbox-row",
        },
        [h("button", {}, "Before"), renderedListBox, h("button", {}, "After")],
      ),
    ],
  );
}

// Keyboard-DnD port: the Solid `useDragAndDrop`/`createListData` pair driving the
// headless ListBox, mirroring the RAC reorderable-ListBox oracle field for field
// (getItems + onReorder branching on dropPosition → moveBefore/moveAfter). The
// live item order is published on the listbox root as `data-comparison-order` so
// the reorder cert pair-diffs the keyboard-drag result against RAC.
function SolidSpectrumDndListBoxDemo() {
  const [demoProps, setDemoProps] = createSignal<DndListBoxDemoProps>(
    dndListBoxDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  const list = createSolidListData<DndListBoxDemoItem>({ initialItems: dndListBoxDemoItems });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "dnd-listbox") {
        setDemoProps(normalizeDndListBoxDemoProps(event.detail.props ?? {}));
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

  const { dragAndDropHooks } = useSolidDragAndDrop<DndListBoxDemoItem>({
    getItems: (keys) =>
      [...keys].map((key) => {
        const item = list.getItem(key);
        return { "text/plain": item?.label ?? String(key) };
      }),
    onReorder(e) {
      if (e.target.dropPosition === "before") {
        list.moveBefore(e.target.key, e.keys);
      } else if (e.target.dropPosition === "after") {
        list.moveAfter(e.target.key, e.keys);
      }
    },
  });

  const renderedListBox = createMemo(() =>
    hc(
      SolidHeadlessListBox,
      {
        "aria-label": "Permissions",
        get selectionMode() {
          return demoProps().selectionMode;
        },
        get items() {
          return list.items;
        },
        dragAndDropHooks,
        getKey: (item: DndListBoxDemoItem) => item.id,
        getTextValue: (item: DndListBoxDemoItem) => item.label,
        "data-comparison-control-root": "dnd-listbox",
        get "data-comparison-control-props"() {
          return serializeDndListBoxDemoProps(demoProps());
        },
        // Publish the live reorder result on the listbox root via a ref effect
        // rather than a spread-delivered `data-*` prop. The React oracle re-renders
        // the whole tree on each store change so a spread attribute stays live for
        // it; Solid renders the root once and binds spread attributes statically, so
        // a reactive test-only attribute routed through the DOM-prop spread would
        // freeze at first paint. An explicit ref effect (the same reactive path the
        // component's own `data-focused`/`data-orientation` attributes use) keeps the
        // published order in lockstep with `list.items` after each keyboard drop.
        ref: (el: HTMLElement) => {
          createEffect(() => {
            el.setAttribute("data-comparison-order", serializeDndListBoxOrder(list.items));
          });
        },
      },
      renderProp((item: DndListBoxDemoItem) =>
        hc(SolidHeadlessListBoxOption, { id: item.id, textValue: item.label }, [item.label]),
      ),
    ),
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
          class: "comparison-listbox-row",
        },
        [h("button", {}, "Before"), renderedListBox, h("button", {}, "After")],
      ),
    ],
  );
}

// Virtualizer port: our solidaria-components `Virtualizer` + `ListLayout`
// wrapping the headless ListBox. `itemSize` on the layout is aligned to the RAC
// oracle's `rowSize`, and every option is forced to the shared row height (our
// port windows by slicing + spacer divs, so option height is CSS-driven, not
// layout-positioned like RAC's absolute rects). Same viewport height + content
// extent as the oracle → the strictly-visible window is geometry-determined.
function SolidSpectrumVirtualizerDemo() {
  const [demoProps, setDemoProps] = createSignal<VirtualizerDemoProps>(
    virtualizerDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "virtualizer") {
        setDemoProps(normalizeVirtualizerDemoProps(event.detail.props ?? {}));
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

  const renderedVirtualizer = createMemo(() =>
    hc(
      SolidHeadlessVirtualizer,
      {
        // Pass the layout CLASS through a getter: hc's unwrapAccessorProps treats
        // any zero-arg function value as a reactive accessor and would invoke the
        // constructor without `new` (Virtualizer does `new local.layout()`). A
        // getter has no `.value`, so hc leaves it untouched and hands over the class.
        get layout() {
          return SolidHeadlessListLayout;
        },
        layoutOptions: { itemSize: virtualizerRowHeight },
        style: {
          height: `${virtualizerViewportHeight}px`,
          width: "240px",
          overflow: "auto",
          "box-sizing": "border-box",
        },
      },
      [
        hc(
          SolidHeadlessListBox,
          {
            "aria-label": "Files",
            get selectionMode() {
              return demoProps().selectionMode;
            },
            "data-comparison-control-root": "virtualizer",
            get "data-comparison-control-props"() {
              return serializeVirtualizerDemoProps(demoProps());
            },
            items: virtualizerDemoItems,
            getKey: (item: VirtualizerDemoItem) => item.id,
            getTextValue: (item: VirtualizerDemoItem) => item.label,
          },
          renderProp((item: VirtualizerDemoItem) =>
            hc(
              SolidHeadlessListBoxOption,
              {
                id: item.id,
                textValue: item.label,
                style: {
                  height: `${virtualizerRowHeight}px`,
                  "min-height": "0",
                  "box-sizing": "border-box",
                  display: "flex",
                  "align-items": "center",
                },
              },
              [item.label],
            ),
          ),
        ),
      ],
    ),
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
          class: "comparison-listbox-row",
        },
        [h("button", {}, "Before"), renderedVirtualizer, h("button", {}, "After")],
      ),
    ],
  );
}

function SolidSpectrumAutocompleteDemo() {
  const [demoProps, setDemoProps] = createSignal<AutocompleteDemoProps>(
    autocompleteDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );
  // Locale-collated contains() — the faithful port of react-aria useFilter,
  // matching the React oracle's useFilter({ sensitivity: "base" }).contains.
  const filter = solidCreateFilter({ sensitivity: "base" });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "autocomplete") {
        setDemoProps(normalizeAutocompleteDemoProps(event.detail.props ?? {}));
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

  const renderedAutocomplete = createMemo(() =>
    hc(
      SolidHeadlessAutocomplete,
      {
        filter: (textValue: string, inputValue: string) => filter().contains(textValue, inputValue),
      },
      [
        hc(
          "div",
          {
            "data-comparison-control-root": "autocomplete",
            get "data-comparison-control-props"() {
              return serializeAutocompleteDemoProps(demoProps());
            },
          },
          [
            // The input is delivered as a render-prop thunk, not a static array
            // child: `hc`'s array path instantiates a component child eagerly the
            // moment SearchField first forces its `children` getter, and that
            // force comes from an outer reactive scope that is NOT under
            // SearchFieldContext.Provider — so SearchFieldInput's useContext would
            // read null and throw. A render-prop defers instantiation to
            // SearchField's own `children(childRenderValues)` call, which runs
            // inside its providers. Same `<div><input/></div>` DOM as RAC's
            // `<SearchField><Input/></SearchField>`.
            hc(
              SolidHeadlessSearchField,
              { "aria-label": "Search fruits" },
              renderProp(() => hc(SolidHeadlessSearchFieldInput, {}, [])),
            ),
            hc(
              SolidHeadlessListBox,
              {
                "aria-label": "Fruits",
                get selectionMode() {
                  return demoProps().selectionMode;
                },
                items: autocompleteDemoItems,
                getKey: (item: AutocompleteDemoItem) => item.id,
                getTextValue: (item: AutocompleteDemoItem) => item.label,
              },
              renderProp((item: AutocompleteDemoItem) =>
                hc(SolidHeadlessListBoxOption, { id: item.id, textValue: item.label }, [
                  item.label,
                ]),
              ),
            ),
          ],
        ),
      ],
    ),
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
          class: "comparison-listbox-row",
        },
        [h("button", {}, "Before"), renderedAutocomplete, h("button", {}, "After")],
      ),
    ],
  );
}

function SolidSpectrumGridListDemo() {
  const [demoProps, setDemoProps] = createSignal<GridListDemoProps>(gridListDemoPropsFromWindow());
  const locale = gridListDemoLocaleFromWindow();
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "gridlist") {
        setDemoProps(normalizeGridListDemoProps(event.detail.props ?? {}));
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

  const renderedGridList = createMemo(() =>
    hc(
      SolidHeadlessGridList,
      {
        "aria-label": "Permissions",
        get selectionMode() {
          return demoProps().selectionMode;
        },
        get orientation() {
          return demoProps().orientation;
        },
        get keyboardNavigationBehavior() {
          return demoProps().keyboardNavigationBehavior;
        },
        "data-comparison-control-root": "gridlist",
        get "data-comparison-control-props"() {
          return serializeGridListDemoProps(demoProps());
        },
        items: gridListDemoItems,
        getKey: (item: GridListDemoItem) => item.id,
        getTextValue: (item: GridListDemoItem) => item.label,
      },
      renderProp((item: GridListDemoItem) =>
        hc(SolidHeadlessGridListItem, { id: item.id, textValue: item.label }, [item.label]),
      ),
    ),
  );

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
          class: "comparison-gridlist-row",
        },
        [h("button", {}, "Before"), renderedGridList, h("button", {}, "After")],
      ),
    ],
  );
}

function SolidSpectrumActionGroupDemo() {
  const [demoProps, setDemoProps] = createSignal<ActionGroupDemoProps>(
    actionGroupDemoPropsFromWindow(),
  );
  const locale = actionGroupDemoLocaleFromWindow();
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "actiongroup") {
        setDemoProps(normalizeActionGroupDemoProps(event.detail.props ?? {}));
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

  const renderedActionGroup = createMemo(() =>
    hc(SolidSpectrumActionGroup, {
      "aria-label": "Text style",
      get selectionMode() {
        return demoProps().selectionMode;
      },
      get orientation() {
        return demoProps().orientation;
      },
      get defaultSelectedKeys() {
        return actionGroupKeysFromValue(demoProps().defaultSelectedKeys);
      },
      get disabledKeys() {
        return actionGroupKeysFromValue(demoProps().disabledKeys);
      },
      "data-comparison-control-root": "actiongroup",
      get "data-comparison-control-props"() {
        return serializeActionGroupDemoProps(demoProps());
      },
      items: actionGroupDemoItems,
    }),
  );

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
          class: "comparison-gridlist-row",
        },
        [h("button", {}, "Before"), renderedActionGroup, h("button", {}, "After")],
      ),
    ],
  );
}

// Solid StepList: the solid-spectrum styled StepList over the base
// `createStepList` / `createStepListState` port. The fixed four-step wizard +
// prop-driven completion/selection state pair-diffs against the hand-wired v3
// hooks oracle (React panel). No locale plumbing — D10 is scoped out for
// StepList (see the certified spec).
function SolidSpectrumStepListDemo() {
  const [demoProps, setDemoProps] = createSignal<StepListDemoProps>(stepListDemoPropsFromWindow());
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "steplist") {
        setDemoProps(normalizeStepListDemoProps(event.detail.props ?? {}));
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

  const renderedStepList = createMemo(() =>
    hc(SolidSpectrumStepList, {
      "aria-label": "Checkout steps",
      items: stepListDemoItems,
      get defaultSelectedKey() {
        return demoProps().defaultSelectedKey || undefined;
      },
      get defaultLastCompletedStep() {
        return demoProps().defaultLastCompletedStep || undefined;
      },
      get disabledKeys() {
        return stepListKeysFromValue(demoProps().disabledKeys);
      },
      get isDisabled() {
        return demoProps().isDisabled;
      },
      get isReadOnly() {
        return demoProps().isReadOnly;
      },
      "data-comparison-control-root": "steplist",
      get "data-comparison-control-props"() {
        return serializeStepListDemoProps(demoProps());
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
      hc("div", { class: "comparison-gridlist-row" }, [
        h("button", {}, "Before"),
        renderedStepList,
        h("button", {}, "After"),
      ]),
    ],
  );
}

// Solid Toolbar: solid-spectrum's Toolbar is a bare passthrough over the base
// solidaria-components Toolbar (mirroring S2's `<RACToolbar {...props} />`), so
// this fixture drives the base `createToolbar` port directly. "flat" places a
// native Size text input among the buttons (the D5 text-input-guard probe);
// "nested" wraps controls in child toolbars that downgrade to role=group.
function SolidSpectrumToolbarDemo() {
  const [demoProps, setDemoProps] = createSignal<ToolbarDemoProps>(toolbarDemoPropsFromWindow());
  const locale = toolbarDemoLocaleFromWindow();
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "toolbar") {
        setDemoProps(normalizeToolbarDemoProps(event.detail.props ?? {}));
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

  const toolbarChildren = (content: ToolbarDemoProps["content"]) => {
    if (content === "nested") {
      return toolbarNestedGroups.map((grp) =>
        hc(
          SolidSpectrumToolbar,
          { "aria-label": grp.id },
          grp.items.map((item) => h("button", {}, item.label)),
        ),
      );
    }
    return toolbarDemoItems.map((item) =>
      item.id === "size"
        ? h("input", { type: "text", "aria-label": item.label })
        : h("button", {}, item.label),
    );
  };

  const renderedToolbar = createMemo(() => {
    const props = demoProps();
    return hc(
      SolidSpectrumToolbar,
      {
        "aria-label": "Text formatting",
        orientation: props.orientation,
        "data-comparison-control-root": "toolbar",
        "data-comparison-control-props": serializeToolbarDemoProps(props),
      },
      toolbarChildren(props.content),
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
      hc("div", { class: "comparison-gridlist-row" }, [
        h("button", {}, "Before"),
        renderedToolbar,
        h("button", {}, "After"),
      ]),
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
  const [demoProps, setDemoProps] = createSignal<TableViewDemoProps>(
    tableViewDemoPropsFromWindow(),
  );
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    initialTableViewSelectedKeys(demoProps()),
  );
  const [sortDescriptor, setSortDescriptor] = createSignal<TableViewSortDescriptor | undefined>(
    tableViewInitialSortDescriptor(demoProps()),
  );
  const [actionKey, setActionKey] = createSignal("");
  const colorScheme = createComparisonResolvedThemeSignal();
  const locale = tableViewDemoLocaleFromWindow();
  const baseRows = createMemo(() => tableViewDemoItems(demoProps()));
  const itemKeys = createMemo(() => baseRows().map((item) => item.id));
  const rows = createMemo(() => sortTableViewRows(baseRows(), sortDescriptor()));
  const visibleColumns = createMemo(() => tableViewVisibleColumns(demoProps()));
  const selectedKeyText = createMemo(() => serializeTableViewKeys(selectedKeys()));

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "tableview") {
        const nextProps = normalizeTableViewDemoProps({
          ...demoProps(),
          ...(event.detail.props ?? {}),
        });
        setDemoProps(nextProps);
        setSelectedKeys(initialTableViewSelectedKeys(nextProps));
        setSortDescriptor(tableViewInitialSortDescriptor(nextProps));
        setActionKey("");
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
      locale,
      background: "base",
      style: providerShellStyle,
    },
    [
      hc(
        "div",
        {
          style: { ...collectionFixtureStyle, width: "520px" },
          "data-comparison-control-root": "tableview",
          get "data-comparison-control-props"() {
            return serializeTableViewDemoProps(demoProps());
          },
          get "data-comparison-selected-keys"() {
            return selectedKeyText();
          },
          get "data-comparison-action-key"() {
            return actionKey();
          },
          get "data-comparison-sort-descriptor"() {
            return serializeTableViewSortDescriptor(sortDescriptor());
          },
        },
        [
          hc("button", {}, ["Before"]),
          hc(
            SolidSpectrumTableView,
            {
              "aria-label": "Project documents",
              get items() {
                return rows();
              },
              get columns() {
                return visibleColumns();
              },
              getKey: (row: TableViewDemoRow) => row.id,
              getTextValue: (row: TableViewDemoRow, column: { id?: keyof TableViewDemoRow }) =>
                column.id ? String(row[column.id] ?? "") : "",
              get density() {
                return demoProps().density;
              },
              get overflowMode() {
                return demoProps().overflowMode;
              },
              get isQuiet() {
                return demoProps().isQuiet;
              },
              get selectionMode() {
                return demoProps().selectionMode;
              },
              get disabledKeys() {
                return tableViewKeysFromValue(demoProps().disabledKeys, [], "multiple", itemKeys());
              },
              get selectedKeys() {
                return demoProps().selectionSource === "selectedKeys" ? selectedKeys() : undefined;
              },
              get defaultSelectedKeys() {
                return demoProps().selectionSource === "defaultSelectedKeys"
                  ? tableViewKeysFromValue(
                      demoProps().defaultSelectedKeys,
                      itemKeys().includes("project-brief") ? ["project-brief"] : [],
                      demoProps().selectionMode,
                      itemKeys(),
                    )
                  : undefined;
              },
              get sortDescriptor() {
                return sortDescriptor();
              },
              onSortChange: (descriptor: TableViewSortDescriptor) => setSortDescriptor(descriptor),
              onSelectionChange: (keys: "all" | Set<string | number>) =>
                setSelectedKeys(
                  keys === "all"
                    ? new Set(rows().map((item) => item.id))
                    : new Set<string>(Array.from(keys, String)),
                ),
              onAction: (key: string | number) => setActionKey(String(key)),
              get renderActionBar() {
                return demoProps().showActionBar
                  ? (keys: "all" | Set<string | number>) =>
                      hc(
                        SolidSpectrumActionBar,
                        {
                          selectedItemCount: keys === "all" ? rows().length : keys.size,
                          "data-comparison-tableview-actionbar": "true",
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
              UNSAFE_style: { ...collectionTableStyle, height: "260px" },
            },
            renderProp(() => [
              hc(
                SolidSpectrumTableHeader,
                {},
                visibleColumns().map((column) =>
                  hc(
                    SolidSpectrumColumn,
                    {
                      id: column.id,
                      isRowHeader: column.isRowHeader,
                      get align() {
                        return demoProps().showDividers ? column.align : undefined;
                      },
                      get showDivider() {
                        return demoProps().showDividers ? column.showDivider : undefined;
                      },
                      get allowsSorting() {
                        return demoProps().sortColumn !== "none";
                      },
                      get allowsResizing() {
                        return demoProps().allowsResizing;
                      },
                      get width() {
                        if (!demoProps().allowsResizing) {
                          return undefined;
                        }
                        return column.id === "status"
                          ? 112
                          : column.id === "type"
                            ? 128
                            : undefined;
                      },
                      get minWidth() {
                        return demoProps().allowsResizing && column.id === "name" ? 180 : undefined;
                      },
                      get maxWidth() {
                        return demoProps().allowsResizing && column.id === "name" ? 320 : undefined;
                      },
                    },
                    [column.name],
                  ),
                ),
              ),
              hc(
                SolidSpectrumTableBody,
                {
                  renderEmptyState: () =>
                    hc(SolidSpectrumIllustratedMessage, {}, [
                      hc(SolidSpectrumHeading, {}, ["No documents"]),
                      hc(SolidSpectrumContent, {}, ["Create or upload a file to continue."]),
                    ]),
                },
                renderProp((row: TableViewDemoRow) =>
                  hc(
                    SolidSpectrumRow,
                    {
                      id: row.id,
                      item: row,
                      textValue: row.name,
                      get isDisabled() {
                        return demoProps().disabledItem === row.id;
                      },
                      get href() {
                        return demoProps().rowLinks && row.id === "project-brief"
                          ? "https://example.com/project-brief"
                          : undefined;
                      },
                      get target() {
                        return demoProps().rowLinks && row.id === "project-brief"
                          ? "_blank"
                          : undefined;
                      },
                    },
                    renderProp(() =>
                      visibleColumns().map((column) =>
                        hc(
                          SolidSpectrumCell,
                          {
                            get align() {
                              return demoProps().showDividers ? column.align : undefined;
                            },
                            get showDivider() {
                              return demoProps().showDividers ? column.showDivider : undefined;
                            },
                          },
                          [row[column.id]],
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ]),
          ),
          hc("button", {}, ["After"]),
        ],
      ),
    ],
  );
}

function SolidSpectrumTagGroupDemo() {
  const colorScheme = createComparisonResolvedThemeSignal();
  const locale = tagGroupDemoLocaleFromWindow();
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
      // Threaded so the D10 RTL driver's `?locale=ar-AE` gives the Provider
      // `direction: 'rtl'` and `createTag` flips its inline-axis nav.
      locale,
      background: "base",
      style: providerShellStyle,
    },
    [
      // Boundary buttons flank the grid so the D5 walk can Tab into the group and
      // Shift+Tab into it from after — exercising entry-direction in both ways.
      h("button", {}, "Before"),
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
                  keys === "all"
                    ? new Set(tagGroupItems.map((item) => item.id))
                    : new Set<string>(Array.from(keys, String)),
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
      h("button", {}, "After"),
    ],
  );
}

function SolidSpectrumTreeViewDemo() {
  const [demoProps, setDemoProps] = createSignal<TreeViewDemoProps>(treeViewDemoPropsFromWindow());
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(
    initialTreeViewSelectedKeys(demoProps()),
  );
  const [expandedKeys, setExpandedKeys] = createSignal<Set<string>>(
    initialTreeViewExpandedKeys(demoProps()),
  );
  const [actionKey, setActionKey] = createSignal("");
  const [loadMoreCount, setLoadMoreCount] = createSignal(0);
  const colorScheme = createComparisonResolvedThemeSignal();
  const items = createMemo(() => treeViewDemoItems(demoProps()));
  const itemKeys = createMemo(() => treeViewVisibleKeys(demoProps()));
  const selectedKeyText = createMemo(() => serializeTreeViewKeys(selectedKeys()));
  const expandedKeyText = createMemo(() => serializeTreeViewKeys(expandedKeys()));
  let treeViewRoot: HTMLElement | undefined;

  createEffect(() => {
    treeViewRoot?.setAttribute(
      "data-comparison-control-props",
      serializeTreeViewDemoProps(demoProps()),
    );
  });

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "treeview") {
        setDemoProps((current) => {
          const nextProps = normalizeTreeViewDemoProps({
            ...current,
            ...(event.detail.props ?? {}),
          });
          setSelectedKeys(initialTreeViewSelectedKeys(nextProps));
          setExpandedKeys(initialTreeViewExpandedKeys(nextProps));
          setActionKey("");
          setLoadMoreCount(0);
          return nextProps;
        });
      }
    };
    window.addEventListener(treeViewControlsEvent, handleControlsChange);
    onCleanup(() => window.removeEventListener(treeViewControlsEvent, handleControlsChange));
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
          get "data-comparison-expanded-keys"() {
            return expandedKeyText();
          },
          get "data-comparison-action-key"() {
            return actionKey();
          },
          get "data-comparison-load-more-count"() {
            return String(loadMoreCount());
          },
        },
        [
          hc("button", {}, ["Before"]),
          hc(
            SolidSpectrumTreeView,
            {
              "aria-label": "Files",
              "data-comparison-control-root": "treeview",
              ref: (element: HTMLElement) => {
                treeViewRoot = element;
              },
              get "data-comparison-control-props"() {
                return serializeTreeViewDemoProps(demoProps());
              },
              get items() {
                return items();
              },
              get selectionMode() {
                return demoProps().selectionMode;
              },
              get selectionStyle() {
                return demoProps().selectionStyle;
              },
              get disabledKeys() {
                return treeViewKeysFromValue(demoProps().disabledKeys, [], "multiple", itemKeys());
              },
              get selectedKeys() {
                return demoProps().selectionSource === "selectedKeys" ? selectedKeys() : undefined;
              },
              get defaultSelectedKeys() {
                return demoProps().selectionSource === "defaultSelectedKeys"
                  ? treeViewKeysFromValue(
                      demoProps().defaultSelectedKeys,
                      itemKeys().includes("weekly-report") ? ["weekly-report"] : [],
                      demoProps().selectionMode,
                      itemKeys(),
                    )
                  : undefined;
              },
              get expandedKeys() {
                return demoProps().expandedSource === "expandedKeys" ? expandedKeys() : undefined;
              },
              get defaultExpandedKeys() {
                return demoProps().expandedSource === "defaultExpandedKeys"
                  ? treeViewExpandedKeysFromValue(
                      demoProps().defaultExpandedKeys,
                      ["documents", "project"].filter((key) => itemKeys().includes(key)),
                      itemKeys(),
                    )
                  : undefined;
              },
              renderEmptyState: () =>
                hc(SolidSpectrumIllustratedMessage, {}, [
                  hc(SolidSpectrumHeading, {}, ["No files"]),
                  hc(SolidSpectrumContent, {}, ["Create or upload a file to continue."]),
                ]),
              get renderActionBar() {
                return demoProps().showActionBar
                  ? (keys: "all" | Set<string | number>) =>
                      hc(
                        SolidSpectrumActionBar,
                        {
                          selectedItemCount: keys === "all" ? itemKeys().length : keys.size,
                          "data-comparison-treeview-actionbar": "true",
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
                  keys === "all" ? new Set(itemKeys()) : new Set<string>(Array.from(keys, String)),
                ),
              onExpandedChange: (keys: Set<string | number>) =>
                setExpandedKeys(new Set<string>(Array.from(keys, String))),
              UNSAFE_style: collectionTreeStyle,
            },
            renderProp((item: TreeViewDemoItem) => [
              hc(
                SolidSpectrumTreeViewItem,
                {
                  id: item.id,
                  textValue: item.title,
                  get isDisabled() {
                    return demoProps().disabledItem === item.id;
                  },
                  get href() {
                    return demoProps().linkItem === item.id
                      ? `https://example.com/treeview/${item.id}`
                      : undefined;
                  },
                  get target() {
                    return demoProps().linkItem === item.id ? "_blank" : undefined;
                  },
                },
                [
                  hc(SolidSpectrumTreeViewItemContent, {}, [
                    () =>
                      demoProps().showIcons ? h(SolidNewIcon, { "aria-hidden": "true" }) : null,
                    hc(SolidSpectrumText, {}, [item.title]),
                    () => {
                      const actionSlot = demoProps().itemActionSlot;
                      if (actionSlot === "buttonGroup") {
                        return hc(
                          SolidSpectrumActionButtonGroup,
                          { "aria-label": `${item.title} actions` },
                          [
                            hc(
                              SolidSpectrumActionButton,
                              { "aria-label": `Archive ${item.title}` },
                              [h(SolidNewIcon, { "aria-hidden": "true" })],
                            ),
                          ],
                        );
                      }

                      if (actionSlot === "actionMenu") {
                        return hc(SolidSpectrumActionMenu, { "aria-label": `${item.title} menu` }, [
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
                  ]),
                ],
              ),
              () =>
                demoProps().showLoadMore && item.id === "image-1"
                  ? hc(SolidSpectrumTreeViewLoadMoreItem, {
                      onLoadMore: () => setLoadMoreCount((count) => count + 1),
                      level: 2,
                      get loadingState() {
                        return demoProps().loadingState;
                      },
                    })
                  : null,
            ]),
          ),
          hc("button", {}, ["After"]),
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
  // Mirrors the React fixture's renderKey: remount only on structural control
  // changes. The live `selectedKey()` signal must NOT be in the key — keying on
  // it remounted the whole Tabs subtree on every user selection, destroying the
  // focused tab node (focus fell to body, data-focus-visible lost) while the
  // React panel updated in place via the controlled prop.
  const renderKey = createMemo(() =>
    [
      demoProps().selectionSource,
      demoProps().defaultSelectedKey,
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
      onSelectionChange: (key: string) => {
        dispatchComparisonCallback("tabs", "onSelectionChange", {
          target: document.activeElement,
          value: key,
        });
        setSelectedKey(String(key));
      },
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
  const pressLog = pressCallbackLoggers("button");
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
        ...pressLog,
        onPress: (event: unknown) => {
          pressLog.onPress(event as { target?: unknown; pointerType?: string });
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
    dispatchComparisonCallback("dialog", "onOpenChange", {
      target: document.activeElement,
      value: nextOpen,
    });
    // Track open state in its own signal only. Folding `isOpen` back into
    // `demoProps` is redundant — `serializedProps` already overlays `isOpen()`
    // — and harmful in Solid: the role-conditional child below reads
    // `demoProps()`, so perturbing it on every open/close re-runs that thunk and
    // recreates the whole Dialog subtree (tearing the focused section's portal
    // out mid-gesture, before `keyup`). React reconciles the same conditional by
    // type and keeps it mounted; decoupling `isOpen` here matches that so the D4
    // event-sequence oracle isolates dismiss/focus behavior, not fixture churn.
    setIsOpen(nextOpen);
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
                demoProps().role === "alertdialog"
                  ? hc(
                      SolidSpectrumAlertDialog,
                      {
                        get title() {
                          return demoProps().title;
                        },
                        get variant() {
                          return demoProps().variant;
                        },
                        get size() {
                          // AlertDialog is S | M | L only; fold XL onto L.
                          return demoProps().size === "XL" ? "L" : demoProps().size;
                        },
                        get primaryActionLabel() {
                          return demoProps().primaryActionLabel;
                        },
                        get secondaryActionLabel() {
                          return demoProps().secondaryActionLabel || undefined;
                        },
                        get cancelLabel() {
                          return demoProps().cancelLabel || undefined;
                        },
                      },
                      [() => demoProps().body],
                    )
                  : hc(
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
  const contextualHelp = createMemo(() =>
    demoProps().withContextualHelp
      ? hc(SolidSpectrumContextualHelp, {}, [
          hc(SolidSpectrumHeading, { slot: "title" }, ["Plan help"]),
          hc(SolidSpectrumContent, {}, ["Choose the plan that matches this workspace."]),
        ])
      : undefined,
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
                return contextualHelp();
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
              hc(SolidSpectrumHeading, {}, [() => demoProps().heading]),
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

const solidToastTriggerConfigs = [
  {
    variant: "neutral",
    label: "Show Neutral Toast",
    buttonVariant: "secondary",
    message: (demoProps: ToastDemoProps) => demoProps.children,
  },
  {
    variant: "positive",
    label: "Show Positive Toast",
    buttonVariant: "primary",
    message: () => "Toast is done!",
  },
  {
    variant: "negative",
    label: "Show Negative Toast",
    buttonVariant: "negative",
    message: () => "Toast is burned!",
  },
  {
    variant: "info",
    label: "Show Info Toast",
    buttonVariant: "accent",
    message: () => "Toasting…",
  },
] as const satisfies ReadonlyArray<{
  variant: ToastDemoVariant;
  label: string;
  buttonVariant: "secondary" | "primary" | "negative" | "accent";
  message: (demoProps: ToastDemoProps) => string;
}>;

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
  const triggerToast = (variant: ToastDemoVariant) => {
    const currentProps = demoProps();
    const config = solidToastTriggerConfigs.find((item) => item.variant === variant);
    if (!config || currentProps.activeSide !== "solid") {
      return;
    }

    let trackedClose = () => {};
    const closeToast = SolidSpectrumToastQueue[variant](
      config.message(currentProps),
      solidToastQueueOptions(
        currentProps,
        () => setActionCount((count) => count + 1),
        () => {
          closeToasts = closeToasts.filter((close) => close !== trackedClose);
          handleToastClose();
        },
      ),
    );
    trackedClose = () => closeToast();
    closeToasts = [...closeToasts, trackedClose];
  };
  const solidToastTriggers = () =>
    hc(
      SolidSpectrumButtonGroup,
      {},
      solidToastTriggerConfigs.map((config) =>
        hc(
          SolidSpectrumButton,
          {
            variant: config.buttonVariant,
            onPress: () => triggerToast(config.variant),
          },
          [config.label],
        ),
      ),
    );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "toast") {
        closeExistingToasts();
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
          style: { "max-width": "100%", "min-height": "160px", width: "420px" },
          "data-comparison-control-root": "toast",
          get "data-comparison-control-props"() {
            return serializeToastDemoProps(demoProps());
          },
          get "data-comparison-toast-props"() {
            return serializeToastDemoProps(demoProps());
          },
          get "data-comparison-toast-active-side"() {
            return demoProps().activeSide;
          },
          get "data-comparison-toast-is-active"() {
            return String(demoProps().activeSide === "solid");
          },
          get "data-comparison-toast-action-count"() {
            return String(actionCount());
          },
          get "data-comparison-toast-close-count"() {
            return String(closeCount());
          },
        },
        [
          // ToastContainer owns global queue subscriptions; only the trigger surface is inactive.
          hc(SolidSpectrumToastContainer, {
            get placement() {
              return demoProps().placement;
            },
            get "aria-label"() {
              return demoProps()["aria-label"];
            },
            PRIVATE_forceReducedMotion: true,
          }),
          hc(
            "div",
            {
              get hidden() {
                return demoProps().activeSide !== "solid" ? true : undefined;
              },
            },
            [solidToastTriggers()],
          ),
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
          // The control-root marker sits on the wrapper (matching React and the
          // other field fixtures) so the field grid is `${root} > div` on BOTH
          // stacks; putting it on the component would land it on the grid root
          // itself, shifting every child selector by one level vs React.
          "data-comparison-control-root": "textfield",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumTextField, {
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

function SolidSpectrumLabeledValueDemo() {
  const [demoProps, setDemoProps] = createSignal<LabeledValueDemoProps>(
    labeledValueDemoPropsFromWindow(),
  );
  const [colorScheme, setColorScheme] = createSignal<ComparisonResolvedTheme>(
    getComparisonResolvedThemeFromDocument(),
  );

  onMount(() => {
    const handleControlsChange = (event: Event) => {
      if (event instanceof CustomEvent && event.detail?.component === "labeledvalue") {
        setDemoProps(normalizeLabeledValueDemoProps(event.detail.props ?? {}));
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

  const serializedProps = createMemo(() => serializeLabeledValueDemoProps(demoProps()));

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
          // The control-root marker sits on the wrapper (matching the field fixtures) so the
          // LabeledValue field grid is `${root} > div` on both stacks.
          "data-comparison-control-root": "labeledvalue",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
        },
        [
          hc(SolidSpectrumLabeledValue, {
            get label() {
              return demoProps().label;
            },
            get value() {
              return resolveLabeledValueDemoValue(demoProps());
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
          // The control-root marker sits on the wrapper (matching React and the
          // other field fixtures) so the field grid is `${root} > div` on BOTH
          // stacks; putting it on the component would land it on the grid root
          // itself, shifting every child selector by one level vs React.
          "data-comparison-control-root": "textarea",
          get "data-comparison-control-props"() {
            return serializedProps();
          },
          get "data-comparison-color-scheme"() {
            return colorScheme();
          },
          get "data-comparison-value"() {
            return value();
          },
        },
        [
          hc(SolidSpectrumTextArea, {
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
  const [selectedKeys, setSelectedKeys] = createSignal(
    pickerSelectedKeysForMode(demoProps().selectedKey, demoProps().selectionMode),
  );
  const [loadMoreCount, setLoadMoreCount] = createSignal(0);
  const locale = pickerDemoLocaleFromWindow();
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
  const selectedKey = createMemo(() => selectedKeys()[0] ?? demoProps().selectedKey);
  const selectedItem = createMemo(() => pickerItems.find((item) => item.id === selectedKey()));
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
      if (event instanceof CustomEvent && event.detail?.component === "picker") {
        const nextProps = normalizePickerDemoProps(event.detail.props ?? {});
        setDemoProps(nextProps);
        setSelectedKeys(pickerSelectedKeysForMode(nextProps.selectedKey, nextProps.selectionMode));
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

  const serializedProps = createMemo(() => serializePickerDemoProps(demoProps()));

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
      h("form", {
        hidden: true,
        get id() {
          return demoProps().form || "picker-external-form";
        },
      }),
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
            return serializePickerSelectedKeys(selectedKeys(), demoProps().selectionMode);
          },
          get "data-comparison-load-more-count"() {
            return String(loadMoreCount());
          },
        },
        [
          hc(
            SolidSpectrumPicker,
            {
              items: pickerItems,
              getKey: (item: (typeof pickerItems)[number]) => item.id,
              getTextValue: (item: (typeof pickerItems)[number]) => item.label,
              get label() {
                return demoProps().label;
              },
              get selectedKey() {
                if (
                  demoProps().selectionSource !== "value" ||
                  demoProps().selectionMode === "multiple"
                ) {
                  return undefined;
                }
                return selectedKey();
              },
              get defaultSelectedKey() {
                if (
                  demoProps().selectionSource !== "defaultValue" ||
                  demoProps().selectionMode === "multiple"
                ) {
                  return undefined;
                }
                return demoProps().selectedKey;
              },
              get selectedKeys() {
                if (
                  demoProps().selectionSource !== "value" ||
                  demoProps().selectionMode !== "multiple"
                ) {
                  return undefined;
                }
                return selectedKeys();
              },
              get defaultSelectedKeys() {
                if (
                  demoProps().selectionSource !== "defaultValue" ||
                  demoProps().selectionMode !== "multiple"
                ) {
                  return undefined;
                }
                return pickerSelectedKeysForMode(
                  demoProps().selectedKey,
                  demoProps().selectionMode,
                );
              },
              get selectionMode() {
                return demoProps().selectionMode;
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
              get validationBehavior() {
                return demoProps().validationBehavior;
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
              get loadingState() {
                return demoProps().loadingState === "idle" ? undefined : demoProps().loadingState;
              },
              get onLoadMore() {
                return demoProps().loadingState === "idle"
                  ? undefined
                  : () => setLoadMoreCount((count) => count + 1);
              },
              get renderValue() {
                return demoProps().withRenderValue
                  ? (items: Array<(typeof pickerItems)[number]>) =>
                      h("span", { "data-comparison-render-value": "true" }, [
                        items.length > 1
                          ? `${items.map((item) => item.label).join(" + ")} plans`
                          : `${items[0]?.label ?? selectedItem()?.label ?? "Selected"} plan`,
                      ])
                  : undefined;
              },
              get disabledKeys() {
                return disabledKeys();
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
              onSelectionChange: (nextValue: unknown) => {
                if (demoProps().selectionMode === "multiple") {
                  return;
                }
                const nextSelectedKeys = nextValue == null ? [] : [String(nextValue)];
                if (nextSelectedKeys.length === 0) {
                  return;
                }
                const nextSelectedKey = nextSelectedKeys[0] as PickerDemoProps["selectedKey"];
                setSelectedKeys(nextSelectedKeys as Array<PickerDemoProps["selectedKey"]>);
                setDemoProps((current: PickerDemoProps) => ({
                  ...current,
                  ...(current.selectionSource === "value"
                    ? { selectedKey: nextSelectedKey as PickerDemoProps["selectedKey"] }
                    : {}),
                }));
              },
              onSelectionChangeKeys: (nextKeys: unknown) => {
                if (demoProps().selectionMode !== "multiple") {
                  return;
                }
                const nextSelectedKeys =
                  nextKeys instanceof Set
                    ? Array.from(nextKeys).map(String)
                    : nextKeys === "all"
                      ? []
                      : [];
                if (nextSelectedKeys.length === 0) {
                  return;
                }
                const nextSelectedKey = nextSelectedKeys[0] as PickerDemoProps["selectedKey"];
                setSelectedKeys(nextSelectedKeys as Array<PickerDemoProps["selectedKey"]>);
                setDemoProps((current: PickerDemoProps) => ({
                  ...current,
                  ...(current.selectionSource === "value"
                    ? { selectedKey: nextSelectedKey as PickerDemoProps["selectedKey"] }
                    : {}),
                }));
              },
            },
            renderProp((item: (typeof pickerItems)[number]) =>
              hc(
                SolidSpectrumPickerItem,
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

function SolidSpectrumComboBoxDemo() {
  const locale = comboBoxDemoLocaleFromWindow();
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
      // Threaded so the D10 RTL driver's `?locale=ar-AE` gives the Provider
      // `direction: 'rtl'` and the portaled listbox popover inherits `dir="rtl"`.
      locale,
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
          // Boundary buttons flank the picker so the certified D5 walk enters the grid via
          // a real Tab keypress (the faithful roving entry) instead of a synthetic
          // container `.focus()`: the latter navigates `focusedKey` but does not pull DOM
          // focus onto the selected swatch in Solid (createFocusWithin's onFocus is
          // non-bubbling), so it diverges from React's synchronous delegate. They sit
          // outside the `role="listbox"` roving scope.
          h("button", {}, "Before"),
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
          h("button", {}, "After"),
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
  const contextualHelp = createMemo(() =>
    demoProps().withContextualHelp
      ? hc(SolidSpectrumContextualHelp, {}, [
          hc(SolidSpectrumHeading, {}, ["Search syntax"]),
          hc(SolidSpectrumContent, {}, [
            hc("p", {}, ["Use project names, owners, or status keywords."]),
          ]),
        ])
      : undefined,
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
            get name() {
              return demoProps().name;
            },
            get form() {
              return demoProps().form;
            },
            get validationBehavior() {
              return demoProps().validationBehavior;
            },
            get type() {
              return demoProps().type;
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
      solidActionButtonFamilyChildren(
        () => props.children,
        () => props.iconPlacement,
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
  const locale = buttonDemoLocaleFromWindow();

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
    // Pass `isSelected` as the reactive `selected` accessor (hc unwraps a
    // zero-arg function prop into a reactive getter) rather than reading
    // `selected()` here. Reading it inside this memo would retrack it, so every
    // toggle would recompute the memo and rebuild the whole element — unmounting
    // the live <button> and dropping keyboard focus to <body>. Deferring the
    // read keeps the same instance and updates `isSelected` in place, matching
    // compiled JSX `isSelected={selected()}` and React's controlled reconcile.
    return hc(
      SolidSpectrumToggleButton,
      {
        "data-comparison-control-root": "togglebutton",
        get "data-comparison-control-props"() {
          return serializeToggleButtonDemoProps({ ...props, isSelected: selected() });
        },
        size: props.size,
        staticColor: props.staticColor,
        isQuiet: props.isQuiet,
        isEmphasized: props.isEmphasized,
        isDisabled: props.isDisabled,
        "aria-label": props.iconPlacement === "only" ? props.children : undefined,
        isSelected: selected,
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
    { colorScheme: "dark", locale, background: "base", style: providerShellStyle },
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
    // Read only the control-panel props here so this memo re-runs — rebuilding
    // the group and its ToggleButton children — ONLY on a control edit, never on
    // a selection change. Reading `selectedKeys()`/`selectedKeyText()` in this
    // creation scope would retrack the selection signal, so every toggle would
    // recompute the memo and unmount the pressed button, dropping keyboard focus
    // (the memo-rebuild anti-pattern D4 catches — see the ToggleButton unit).
    // Selection is threaded reactively instead: `selectedKeys` is passed as the
    // raw accessor (hc's `unwrapAccessorProps` turns it into a live getter, the
    // way compiled JSX binds `selectedKeys={selectedKeys()}`), and the serialized
    // control-props data attributes are getters that read the current selection
    // lazily — both update in place without rebuilding, matching React's
    // controlled reconcile.
    const props = groupProps();
    const serializeWithSelection = () =>
      serializeToggleButtonGroupDemoProps({ ...props, selectedKeys: selectedKeyText() });

    return hc(
      SolidSpectrumToggleButtonGroup,
      {
        "aria-label": "Text alignment",
        "data-comparison-group-root": "togglebuttongroup",
        "data-comparison-control-root": "togglebuttongroup",
        get "data-comparison-group-props"() {
          return serializeWithSelection();
        },
        get "data-comparison-control-props"() {
          return serializeWithSelection();
        },
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
        selectedKeys: selectedKeys,
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

const collectionTableStyle = {
  width: "100%",
};

const collectionTreeStyle = {
  width: "100%",
  "max-height": "280px",
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
