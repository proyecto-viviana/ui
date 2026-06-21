/**
 * solidaria-components
 *
 * Pre-wired headless components for SolidJS.
 * Port of react-aria-components.
 *
 * These components combine state management + accessibility hooks into
 * ready-to-style components using the render props pattern and data attributes.
 */

export {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type RenderPropsBase,
  type SlotProps,
  DEFAULT_SLOT,
  Provider,
  composeRenderProps,
  useRenderProps,
  useContextProps,
  useSlottedContext,
  filterDOMProps,
  removeDataAttributes,
  createDataAttributes,
  dataAttr,
} from "./utils";

export { VisuallyHidden, type VisuallyHiddenProps } from "./VisuallyHidden";

export { Button, ButtonContext, type ButtonProps, type ButtonRenderProps } from "./Button";

// ToggleSwitch (named to avoid conflict with SolidJS's Switch)
export {
  ToggleSwitch,
  ToggleSwitchContext,
  ToggleSwitch as Switch,
  ToggleSwitchContext as SwitchContext,
  // The RAC 1.19 form-field split: SwitchField wrapper + SwitchButton control.
  SwitchField,
  SwitchButton,
  SwitchFieldContext,
  type SwitchFieldProps,
  type SwitchFieldRenderProps,
  type SwitchButtonProps,
  type SwitchButtonRenderProps,
  type ToggleSwitchProps,
  type ToggleSwitchRenderProps,
  type ToggleSwitchProps as SwitchProps,
  type ToggleSwitchRenderProps as SwitchRenderProps,
} from "./Switch";

export {
  ToggleButton,
  ToggleButtonContext,
  type ToggleButtonProps,
  type ToggleButtonRenderProps,
} from "./ToggleButton";

export {
  ToggleButtonGroup,
  ToggleButtonGroupContext,
  ToggleButtonGroupStateContext,
  ToggleGroupStateContext,
  useToggleButtonGroupStateContext,
  type ToggleButtonGroupProps,
  type ToggleButtonGroupRenderProps,
  type ToggleButtonGroupStateContextValue,
} from "./ToggleButtonGroup";

export {
  Checkbox,
  CheckboxGroup,
  CheckboxContext,
  CheckboxGroupContext,
  CheckboxGroupStateContext,
  // The RAC 1.19 form-field split: CheckboxField wrapper + CheckboxButton control.
  CheckboxField,
  CheckboxButton,
  CheckboxFieldContext,
  type CheckboxFieldProps,
  type CheckboxFieldRenderProps,
  type CheckboxButtonProps,
  type CheckboxButtonRenderProps,
  type CheckboxProps,
  type CheckboxRenderProps,
  type CheckboxGroupProps,
  type CheckboxGroupRenderProps,
} from "./Checkbox";

export {
  Radio,
  RadioGroup,
  RadioContext,
  RadioGroupContext,
  RadioGroupStateContext,
  // The RAC 1.19 form-field split: RadioField wrapper + RadioButton control.
  RadioField,
  RadioButton,
  RadioFieldContext,
  type RadioFieldProps,
  type RadioFieldRenderProps,
  type RadioButtonProps,
  type RadioButtonRenderProps,
  type RadioProps,
  type RadioRenderProps,
  type RadioGroupProps,
  type RadioGroupRenderProps,
  type Orientation,
} from "./RadioGroup";

export {
  TextField,
  TextFieldContext,
  LabelContext,
  InputContext,
  TextAreaContext,
  FieldInputContext,
  Label,
  Input,
  TextArea,
  type TextFieldProps,
  type TextFieldRenderProps,
  type TextFieldContextValue,
  type LabelProps,
  type InputProps,
  type TextAreaProps,
} from "./TextField";

export { Text, TextContext, type TextProps } from "./Text";

export { Link, LinkContext, type LinkProps, type LinkRenderProps } from "./Link";

export { Keyboard, KeyboardContext, type KeyboardProps } from "./Keyboard";

export { Form, FormContext, type FormProps, type FormRenderProps } from "./Form";

export {
  FieldError,
  FieldErrorContext,
  type FieldErrorProps,
  type FieldErrorRenderProps,
} from "./FieldError";

export { FileTrigger, type FileTriggerProps } from "./FileTrigger";

export {
  DropZone,
  DropZoneContext,
  type DropZoneProps,
  type DropZoneRenderProps,
} from "./DropZone";

export {
  SharedElementTransition,
  SharedElement,
  useHasSharedElementTransitionScope,
  type SharedElementTransitionProps,
  type SharedElementProps,
  type SharedElementPropsBase,
  type SharedElementRenderProps,
} from "./SharedElementTransition";

export {
  Layout,
  LayoutInfo,
  Rect,
  Size,
  Point,
  type InvalidationContext,
} from "./virtualizer/Layout";

export {
  Virtualizer,
  VirtualizerContext,
  useVirtualizerContext,
  ListLayout,
  GridLayout,
  WaterfallLayout,
  TableLayout,
  type VirtualizerProps,
  type VirtualizerLayout,
  type VirtualizerLayoutClass,
  type VirtualizerContextValue,
  type VirtualizerVisibleRange,
  type VirtualizerDropTarget,
  type VirtualizerDropOperationResolver,
  type VirtualizerDropTargetResolver,
  type VirtualizerRangeContext,
  type DefaultVirtualizerLayoutOptions,
  type GridLayoutOptions,
  type WaterfallLayoutOptions,
} from "./Virtualizer";

export {
  ProgressBar,
  ProgressBarContext,
  type ProgressBarProps,
  type ProgressBarRenderProps,
} from "./ProgressBar";

export {
  Separator,
  SeparatorContext,
  type SeparatorProps,
  type SeparatorRenderProps,
} from "./Separator";

export {
  Toolbar,
  ToolbarContext,
  type ToolbarProps,
  type ToolbarRenderProps,
  type ToolbarContextValue,
} from "./Toolbar";

export {
  Autocomplete,
  AutocompleteContext,
  AutocompleteStateContext,
  AutocompleteCollectionContext,
  useAutocompleteInput,
  useAutocompleteState,
  useAutocompleteCollection,
  type AutocompleteProps,
  type AutocompleteContextValue,
  type AutocompleteCollectionContextValue,
} from "./Autocomplete";

export {
  ListBox,
  ListBoxOption,
  ListBoxOption as ListBoxItem,
  ListBoxSection,
  ListBoxLoadMoreItem,
  ListBoxContext,
  ListBoxStateContext,
  ListStateContext,
  type ListBoxProps,
  type ListBoxRenderProps,
  type ListBoxOptionProps,
  type ListBoxOptionRenderProps,
  type ListBoxOptionProps as ListBoxItemProps,
  type ListBoxOptionRenderProps as ListBoxItemRenderProps,
  type ListBoxSectionProps,
  type ListBoxLoadMoreItemProps,
} from "./ListBox";

export {
  Menu,
  MenuItem,
  MenuSection,
  MenuTrigger,
  SubmenuTrigger,
  MenuButton,
  MenuContext,
  MenuStateContext,
  MenuTriggerContext,
  RootMenuTriggerStateContext,
  type MenuProps,
  type MenuRenderProps,
  type MenuItemProps,
  type MenuItemRenderProps,
  type MenuSectionProps,
  type MenuTriggerProps,
  type SubmenuTriggerProps,
  type MenuTriggerRenderProps,
  type MenuButtonProps,
} from "./Menu";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectListBox,
  SelectOption,
  SelectContext,
  SelectValueContext,
  SelectStateContext,
  type SelectProps,
  type SelectRenderProps,
  type SelectTriggerProps,
  type SelectTriggerRenderProps,
  type SelectValueProps,
  type SelectValueRenderProps,
  type SelectListBoxProps,
  type SelectListBoxRenderProps,
  type SelectOptionProps,
  type SelectOptionRenderProps,
} from "./Select";

export {
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  TabsContext,
  TabsStateContext,
  TabsStateContext as TabListStateContext,
  type TabsProps,
  type TabsRenderProps,
  type TabListProps,
  type TabListRenderProps,
  type TabProps,
  type TabRenderProps,
  type TabPanelsProps,
  type TabPanelProps,
  type TabPanelRenderProps,
} from "./Tabs";

export {
  SelectionIndicator,
  SelectionIndicatorContext,
  type SelectionIndicatorProps,
  type SelectionIndicatorRenderProps,
} from "./SelectionIndicator";

export {
  Collection,
  CollectionBuilder,
  createLeafComponent,
  createBranchComponent,
  CollectionRendererContext,
  SelectableCollectionContext,
  DefaultCollectionRenderer,
  GroupContext,
  HeaderContext,
  HeadingContext,
  Section,
  Header,
  Group,
  isCollectionSection,
  flattenCollectionEntries,
  type SectionProps,
  type HeaderProps,
  type GroupProps,
  type CollectionEntry,
  type CollectionSection,
  type CollectionDropTargetDelegate,
  type CollectionRenderer,
  type CollectionRootProps,
  type CollectionBranchProps,
  type CollectionRendererContextValue,
  type CollectionPrimitiveRenderProps,
} from "./Collection";

export {
  DragAndDropContext,
  DropIndicator,
  DropIndicatorContext,
  useDndPersistedKeys,
  useRenderDropIndicator,
  type DragAndDropContextValue,
  type DropIndicatorProps,
  type DropIndicatorRenderProps,
  type DropTargetDelegate,
} from "./DragAndDrop";
export { useDragAndDrop, type DragAndDropOptions, type DragAndDropHooks } from "./useDragAndDrop";

export {
  Breadcrumbs,
  BreadcrumbItem,
  BreadcrumbItem as Breadcrumb,
  BreadcrumbsContext,
  type BreadcrumbsProps,
  type BreadcrumbsRenderProps,
  type BreadcrumbItemProps,
  type BreadcrumbItemRenderProps,
} from "./Breadcrumbs";

export {
  NumberField,
  NumberFieldLabel,
  NumberFieldGroup,
  NumberFieldInput,
  NumberFieldIncrementButton,
  NumberFieldDecrementButton,
  NumberFieldContext,
  NumberFieldStateContext,
  type NumberFieldProps,
  type NumberFieldRenderProps,
  type NumberFieldInputProps,
  type NumberFieldInputRenderProps,
  type NumberFieldIncrementButtonProps,
  type NumberFieldDecrementButtonProps,
  type NumberFieldButtonRenderProps,
} from "./NumberField";

export {
  SearchField,
  SearchFieldLabel,
  SearchFieldInput,
  SearchFieldClearButton,
  SearchFieldContext,
  type SearchFieldProps,
  type SearchFieldRenderProps,
  type SearchFieldInputProps,
  type SearchFieldInputRenderProps,
  type SearchFieldClearButtonProps,
  type SearchFieldClearButtonRenderProps,
} from "./SearchField";

export {
  Slider,
  SliderTrack,
  SliderThumb,
  SliderFill,
  SliderOutput,
  SliderContext,
  SliderStateContext,
  SliderTrackContext,
  SliderFillContext,
  SliderOutputContext,
  type SliderProps,
  type SliderRenderProps,
  type SliderTrackProps,
  type SliderTrackRenderProps,
  type SliderThumbProps,
  type SliderThumbRenderProps,
  type SliderFillProps,
  type SliderFillRenderProps,
  type SliderOutputProps,
  type SliderOutputRenderProps,
} from "./Slider";

export {
  Tooltip,
  TooltipTrigger,
  TooltipContext,
  TooltipTriggerStateContext,
  type TooltipProps,
  type TooltipPlacement,
  type TooltipRenderProps,
  type TooltipResolvedPlacement,
  type TooltipTriggerComponentProps,
  type TooltipTriggerState,
} from "./Tooltip";

export {
  ComboBox,
  ComboBoxValue,
  ComboBoxInput,
  ComboBoxLabel,
  ComboBoxDescription,
  ComboBoxErrorMessage,
  ComboBoxButton,
  ComboBoxListBox,
  ComboBoxOption,
  ComboBoxTagGroup,
  ComboBoxTag,
  ComboBoxContext,
  ComboBoxStateContext,
  ComboBoxValueContext,
  defaultContainsFilter,
  type ComboBoxProps,
  type ComboBoxRenderProps,
  type ComboBoxValueProps,
  type ComboBoxValueRenderProps,
  type ComboBoxInputProps,
  type ComboBoxInputRenderProps,
  type ComboBoxLabelProps,
  type ComboBoxDescriptionProps,
  type ComboBoxErrorMessageProps,
  type ComboBoxButtonProps,
  type ComboBoxButtonRenderProps,
  type ComboBoxListBoxProps,
  type ComboBoxListBoxRenderProps,
  type ComboBoxOptionProps,
  type ComboBoxOptionRenderProps,
  type ComboBoxTagGroupProps,
  type ComboBoxTagProps,
} from "./ComboBox";

export {
  Dialog,
  DialogTrigger,
  DialogContext,
  DialogTriggerContext,
  useDialogTrigger,
  Heading,
  DialogHeading,
  type DialogProps,
  type DialogRenderProps,
  type DialogTriggerProps,
  type HeadingProps,
} from "./Dialog";

export {
  Modal,
  ModalOverlay,
  ModalContext,
  OverlayTriggerStateContext,
  useOverlayTriggerState,
  type ModalProps,
  type ModalOverlayProps,
  type ModalRenderProps,
  type OverlayTriggerState,
} from "./Modal";

export {
  Popover,
  PopoverTrigger,
  PopoverContext,
  PopoverTriggerContext,
  usePopoverTrigger,
  OverlayArrow,
  type PopoverProps,
  type PopoverRenderProps,
  type PopoverTriggerProps,
  type PopoverTriggerContextValue,
  type OverlayArrowProps,
} from "./Popover";

export {
  Toast,
  Toast as UNSTABLE_Toast,
  ToastRegion as UNSTABLE_ToastRegion,
  ToastRegion as UNSTABLE_ToastList,
  Toast as UNSTABLE_ToastContent,
  ToastRegion,
  ToastProvider,
  ToastContext,
  ToastContext as UNSTABLE_ToastStateContext,
  ToastTitle,
  ToastDescription,
  ToastCloseButton,
  DefaultToast,
  useToastContext,
  globalToastQueue,
  addToast,
  type ToastContent,
  type ToastProps,
  type ToastRenderProps,
  type ToastRegionProps,
  type ToastRegionRenderProps,
  type ToastProviderProps,
  type ToastTitleProps,
  type ToastDescriptionProps,
  type ToastCloseButtonProps,
  type DefaultToastProps,
} from "./Toast";

export {
  Disclosure,
  DisclosureGroup,
  DisclosureTrigger,
  DisclosurePanel,
  DisclosureContext,
  DisclosureGroupContext,
  DisclosureStateContext,
  DisclosureGroupStateContext,
  useDisclosureContext,
  useDisclosureGroupContext,
  type DisclosureProps,
  type DisclosureRenderProps,
  type DisclosureGroupProps,
  type DisclosureGroupRenderProps,
  type DisclosureTriggerProps,
  type DisclosurePanelProps,
  type DisclosureState,
  type DisclosureGroupState,
} from "./Disclosure";

export { Meter, MeterContext, type MeterProps, type MeterRenderProps } from "./Meter";

export {
  TagGroup,
  TagList,
  Tag,
  TagRemoveButton,
  TagGroupContext,
  TagListStateContext,
  TagListStateContext as TagListContext,
  useTagGroupContext,
  type TagGroupProps,
  type TagGroupRenderProps,
  type TagListProps,
  type TagListRenderProps,
  type TagProps,
  type TagRenderProps,
  type TagRemoveButtonProps,
} from "./TagGroup";

export {
  Calendar,
  CalendarHeading,
  CalendarButton,
  CalendarGrid,
  CalendarGridHeader,
  CalendarGridBody,
  CalendarHeaderCell,
  CalendarCell,
  CalendarContext,
  CalendarContext as CalendarStateContext,
  useCalendarContext,
  type CalendarProps,
  type CalendarRenderProps,
  type CalendarHeadingProps,
  type CalendarButtonProps,
  type CalendarGridProps,
  type CalendarGridHeaderProps,
  type CalendarGridBodyProps,
  type CalendarGridRenderProps,
  type CalendarCellProps,
  type CalendarCellRenderProps,
  type CalendarHeaderCellProps,
  type CalendarState,
  type CalendarDate,
  type DateValue,
} from "./Calendar";

export {
  CalendarMonthPicker,
  CalendarYearPicker,
  type CalendarMonthPickerProps,
  type CalendarMonthPickerAria,
  type CalendarMonthPickerItem,
  type CalendarYearPickerProps,
  type CalendarYearPickerAria,
  type CalendarYearPickerItem,
  type CalendarYearPickerFormatOptions,
} from "./CalendarPicker";

export {
  RangeCalendar,
  RangeCalendarHeading,
  RangeCalendarButton,
  RangeCalendarGrid,
  RangeCalendarCell,
  RangeCalendarContext,
  RangeCalendarStateContext,
  useRangeCalendarContext,
  type RangeCalendarProps,
  type RangeCalendarRenderProps,
  type RangeCalendarHeadingProps,
  type RangeCalendarButtonProps,
  type RangeCalendarGridProps,
  type RangeCalendarGridRenderProps,
  type RangeCalendarCellProps,
  type RangeCalendarCellRenderProps,
  type RangeCalendarState,
  type RangeValue,
} from "./RangeCalendar";

export {
  DateField,
  DateFieldLabel,
  DateFieldDescription,
  DateFieldErrorMessage,
  DateInput,
  DateSegment,
  DateFieldContext,
  DateFieldStateContext,
  useDateFieldContext,
  type DateFieldProps,
  type DateFieldRenderProps,
  type DateInputProps,
  type DateInputRenderProps,
  type DateSegmentProps,
  type DateSegmentRenderProps,
  type DateFieldLabelProps,
  type DateFieldDescriptionProps,
  type DateFieldErrorMessageProps,
  type DateFieldContextValue,
  type DateFieldState,
  type DateSegmentType,
} from "./DateField";

export {
  TimeField,
  TimeFieldLabel,
  TimeFieldDescription,
  TimeFieldErrorMessage,
  TimeInput,
  TimeSegment,
  TimeFieldContext,
  TimeFieldStateContext,
  useTimeFieldContext,
  type TimeFieldProps,
  type TimeFieldRenderProps,
  type TimeInputProps,
  type TimeInputRenderProps,
  type TimeSegmentProps,
  type TimeSegmentRenderProps,
  type TimeFieldLabelProps,
  type TimeFieldDescriptionProps,
  type TimeFieldErrorMessageProps,
  type TimeFieldContextValue,
  type TimeFieldState,
  type TimeSegmentType,
  type TimeValue,
} from "./TimeField";

export { HiddenTimeInput, type HiddenTimeInputProps } from "./HiddenTimeInput";

export {
  DatePicker,
  DateRangePicker,
  DatePickerLabel,
  DatePickerDescription,
  DatePickerErrorMessage,
  DateRangePickerLabel,
  DateRangePickerDescription,
  DateRangePickerErrorMessage,
  DatePickerButton,
  DateRangePickerButton,
  DatePickerContent,
  DateRangePickerContent,
  HiddenDateInput,
  DatePickerContext,
  DateRangePickerContext,
  DatePickerStateContext,
  DateRangePickerStateContext,
  useDatePickerContext,
  useDateRangePickerContext,
  type DatePickerProps,
  type DateRangePickerProps,
  type DatePickerRenderProps,
  type DateRangePickerRenderProps,
  type DatePickerButtonProps,
  type DateRangePickerButtonProps,
  type DatePickerButtonRenderProps,
  type DatePickerContentProps,
  type DateRangePickerContentProps,
  type DatePickerLabelProps,
  type DatePickerDescriptionProps,
  type DatePickerErrorMessageProps,
  type DateRangePickerLabelProps,
  type DateRangePickerDescriptionProps,
  type DateRangePickerErrorMessageProps,
  type DatePickerContextValue,
  type DateRangePickerContextValue,
  type HiddenDateInputProps,
} from "./DatePicker";

export {
  Table,
  TableHeader,
  TableColumn,
  TableColumn as Column,
  ColumnResizer,
  TableBody,
  TableFooter,
  TableLoadMoreItem,
  TableRow,
  TableRow as Row,
  TableCell,
  TableCell as Cell,
  ResizableTableContainer,
  useTableOptions,
  TableSelectionCheckbox,
  TableSelectAllCheckbox,
  TableContext,
  TableStateContext,
  TableColumnResizeStateContext,
  TableRowContext,
  type TableProps,
  type TableRenderProps,
  type TableHeaderProps,
  type TableHeaderRenderProps,
  type TableColumnProps,
  type TableColumnRenderProps,
  type ColumnResizerProps,
  type ColumnResizerRenderProps,
  type TableBodyProps,
  type TableBodyRenderProps,
  type TableFooterProps,
  type TableFooterRenderProps,
  type ResizableTableContainerProps,
  type TableLoadMoreItemProps,
  type TableRowProps,
  type TableRowRenderProps,
  type TableCellProps,
  type TableCellRenderProps,
} from "./Table";

export {
  GridList,
  GridListHeader,
  GridListItem,
  GridListSection,
  GridListSelectionCheckbox,
  GridListLoadMoreItem,
  GridListContext,
  GridListHeaderContext,
  GridListHeaderInnerContext,
  GridListStateContext,
  type GridListProps,
  type GridListRenderProps,
  type GridListItemProps,
  type GridListItemRenderProps,
  type GridListHeaderProps,
  type GridListSectionProps,
  type GridListLoadMoreItemProps,
} from "./GridList";

export {
  Tree,
  TreeItem,
  TreeItemContent,
  TreeHeader,
  TreeSection,
  TreeExpandButton,
  TreeSelectionCheckbox,
  TreeLoadMoreItem,
  TreeContext,
  TreeStateContext,
  TreeItemContext,
  type TreeProps,
  type TreeRenderProps,
  type TreeRenderItemState,
  type TreeItemProps,
  type TreeItemRenderProps,
  type TreeItemContentProps,
  type TreeItemContentRenderProps,
  type TreeHeaderProps,
  type TreeSectionProps,
  type TreeExpandButtonProps,
  type TreeLoadMoreItemProps,
} from "./Tree";

export {
  ColorSlider,
  ColorSliderLabel,
  ColorSliderOutput,
  ColorSliderTrack,
  ColorSliderThumb,
  ColorThumb,
  ColorSliderContext,
  ColorSliderStateContext,
  type ColorSliderProps,
  type ColorSliderRenderProps,
  type ColorSliderLabelProps,
  type ColorSliderOutputProps,
  type ColorSliderTrackProps,
  type ColorSliderTrackRenderProps,
  type ColorSliderThumbProps,
  type ColorSliderThumbRenderProps,
  ColorArea,
  ColorAreaGradient,
  ColorAreaThumb,
  ColorAreaContext,
  ColorAreaStateContext,
  type ColorAreaProps,
  type ColorAreaRenderProps,
  type ColorAreaGradientProps,
  type ColorAreaGradientRenderProps,
  type ColorAreaThumbProps,
  type ColorAreaThumbRenderProps,
  ColorWheel,
  ColorWheelTrack,
  ColorWheelThumb,
  ColorWheelContext,
  ColorWheelStateContext,
  ColorWheelTrackContext,
  type ColorWheelProps,
  type ColorWheelRenderProps,
  type ColorWheelTrackProps,
  type ColorWheelTrackRenderProps,
  type ColorWheelThumbProps,
  type ColorWheelThumbRenderProps,
  ColorField,
  ColorFieldInput,
  ColorFieldContext,
  ColorFieldStateContext,
  ColorPicker,
  ColorPickerContext,
  ColorPickerStateContext,
  type ColorFieldProps,
  type ColorFieldRenderProps,
  type ColorFieldInputProps,
  type ColorFieldInputRenderProps,
  type ColorPickerProps,
  type ColorPickerRenderProps,
  ColorSwatch,
  ColorSwatchContext,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  ColorSwatchPickerContext,
  type ColorSwatchProps,
  type ColorSwatchRenderProps,
  type ColorSwatchPickerProps,
  type ColorSwatchPickerRenderProps,
  type ColorSwatchPickerItemProps,
  type ColorSwatchPickerItemRenderProps,
} from "./Color";

export {
  ContextualHelpTrigger,
  type ContextualHelpTriggerProps,
  type ContextualHelpTriggerRenderProps,
} from "./ContextualHelpTrigger";

export {
  ColorEditor,
  type ColorEditorProps,
  type ColorEditorRenderProps,
  type ColorEditorColorSpace,
} from "./ColorEditor";

export {
  StepList,
  Step,
  StepListStateContext,
  StepListContext,
  useStepListState,
  type StepListProps,
  type StepListRenderProps,
  type StepListItemRenderProps,
  type StepProps,
} from "./StepList";

export {
  Landmark,
  LandmarkContext,
  useLandmarkController,
  type LandmarkProps,
  type LandmarkRenderProps,
  type AriaLandmarkRole,
  type LandmarkController,
} from "./Landmark";

export {
  ActionBar,
  ActionBarContainer,
  ActionBarSelectionCount,
  ActionBarClearButton,
  ActionBarContext,
  useActionBarContext,
  type ActionBarProps,
  type ActionBarRenderProps,
  type ActionBarContainerProps,
  type ActionBarSelectionCountProps,
  type ActionBarClearButtonProps,
  type ActionBarContextValue,
} from "./ActionBar";

export {
  ActionGroup,
  ActionGroupContext,
  ActionGroupStateContext,
  useActionGroupContext,
  type ActionGroupProps,
  type ActionGroupRenderProps,
  type ActionGroupItemRenderProps,
  type ActionGroupItem,
  type ActionGroupContextValue,
} from "./ActionGroup";

export {
  Alert,
  AlertContext,
  AlertDismissButton,
  type AlertProps,
  type AlertRenderProps,
  type AlertVariant,
  type AlertContextValue,
  type AlertDismissButtonProps,
} from "./Alert";

export { Icon, IconContext, type IconProps, type IconRenderProps } from "./Icon";

export { Focusable, type FocusableProps } from "./Focusable";

export { Pressable, type PressableProps } from "./Pressable";

export {
  RouterProvider,
  RouterContext,
  useRouter,
  type RouterProviderProps,
  type RouterContextValue,
  type RouterOptions,
} from "./RouterProvider";

export { DIRECTORY_DRAG_TYPE } from "@proyecto-viviana/solid-stately";
export { isDirectoryDropItem, isFileDropItem, isTextDropItem } from "@proyecto-viviana/solidaria";
export { createDrag as useDrag, createDrop as useDrop } from "@proyecto-viviana/solidaria";

export {
  isRTL,
  I18nProvider,
  useLocale,
  createFilter as useFilter,
} from "@proyecto-viviana/solidaria";

export { SSRProvider } from "@proyecto-viviana/solidaria";

export { parseColor, FormValidationContext } from "@proyecto-viviana/solid-stately";

export { ToastQueue as UNSTABLE_ToastQueue } from "@proyecto-viviana/solid-stately";

// Data hooks (aliased to match RAC's useXxx naming)
export {
  createListData,
  createListData as useListData,
  createTreeData,
  createTreeData as useTreeData,
  createAsyncList,
  createAsyncList as useAsyncList,
  getColorChannels,
  type ListOptions,
  type ListData,
  type TreeOptions,
  type TreeData,
  type TreeDataNode,
  type AsyncListOptions,
  type AsyncListData,
  type AsyncListLoadFunction,
  type SortDescriptor,
  type LoadingState,
} from "@proyecto-viviana/solid-stately";
