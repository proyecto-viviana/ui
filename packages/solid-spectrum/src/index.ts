// Public surface for the React Spectrum S2 parity package.
// Keep this barrel scoped to current S2 component targets and their required
// slots/helpers. Custom Viviana components, story helpers, and legacy aliases
// should live outside the main S2 export path.

// Provider
export { ColorSchemeContext, Provider, useTheme } from "./provider";
export type {
  ColorScheme,
  ProviderContextValue,
  ProviderInheritedProps,
  ProviderProps,
  Scale,
  ThemeContextValue,
  ValidationState,
} from "./provider";

// Accordion
export {
  Accordion,
  AccordionContext,
  AccordionItem,
  AccordionItemHeader,
  AccordionItemPanel,
  AccordionItemTitle,
} from "./accordion";
export type {
  AccordionDensity,
  AccordionItemHeaderProps,
  AccordionItemProps,
  AccordionItemPanelProps,
  AccordionItemTitleProps,
  AccordionProps,
  AccordionSize,
} from "./accordion";

// ActionBar
export { ActionBar, ActionBarContainer, ActionBarContext } from "./actionbar";
export type { ActionBarContainerProps, ActionBarProps } from "./actionbar";

// ActionGroup
export { ActionGroup } from "./actiongroup";
export type { ActionGroupProps } from "./actiongroup";

// Alert
export { Alert } from "./alert";
export type { AlertProps, AlertVariant } from "./alert";

// ActionButton / Button family
export { ActionButton } from "./button/ActionButton";
export type { ActionButtonProps, ActionButtonSize } from "./button/ActionButton";
export { ActionButtonGroup } from "./actionbuttongroup";
export type { ActionButtonGroupProps } from "./actionbuttongroup";
export {
  ActionButtonContext,
  ActionButtonGroupContext,
  Button,
  ButtonContext,
  ButtonGroupContext,
  LinkButtonContext,
  ToggleButtonContext,
  ToggleButtonGroupContext,
} from "./button";
export type {
  ButtonFillStyle,
  ButtonProps,
  ButtonSize,
  ButtonVariant,
  StaticColor,
} from "./button";
export { LinkButton } from "./button/LinkButton";
export type { LinkButtonProps } from "./button/LinkButton";
export { ButtonGroup } from "./buttongroup";
export type { ButtonGroupProps } from "./buttongroup";
export { ToggleButton } from "./button/ToggleButton";
export type { ToggleButtonProps, ToggleButtonSize } from "./button/ToggleButton";
export { ToggleButtonGroup } from "./togglebuttongroup";
export type { ToggleButtonGroupProps } from "./togglebuttongroup";
export { pressScale } from "./pressScale";

// ActionMenu / Menu
export { ActionMenu, ActionMenuContext } from "./menu/ActionMenu";
export type { ActionMenuProps } from "./menu/ActionMenu";
export {
  Collection,
  ContextualHelpTrigger,
  Menu,
  MenuButton,
  MenuContext,
  MenuItem,
  MenuSection,
  MenuSeparator,
  MenuTrigger,
  SubmenuTrigger,
  UnavailableMenuItemTrigger,
} from "./menu/index";
export type {
  MenuItemProps,
  MenuAlign,
  MenuButtonProps,
  MenuDirection,
  MenuProps,
  MenuSectionProps,
  MenuSeparatorProps,
  MenuSize,
  SubmenuTriggerProps,
  MenuTriggerProps,
  UnavailableMenuItemTriggerProps,
} from "./menu/index";

// Avatar
export { Avatar, AvatarContext, AvatarGroup, AvatarGroupContext } from "./avatar";
export type { AvatarGroupProps, AvatarGroupSize, AvatarProps, AvatarSize } from "./avatar";

// Badge
export { Badge, BadgeContext } from "./badge";
export type {
  BadgeFillStyle,
  BadgeOverflowMode,
  BadgeProps,
  BadgeSize,
  BadgeVariant,
} from "./badge";

// Breadcrumbs
export { Breadcrumb, BreadcrumbItem, Breadcrumbs, BreadcrumbsContext } from "./breadcrumbs/index";
export type {
  BreadcrumbItemProps,
  BreadcrumbProps,
  BreadcrumbsProps,
  BreadcrumbsSize,
  BreadcrumbsVariant,
  S2BreadcrumbsSize,
} from "./breadcrumbs/index";

// Calendar and date/time fields
export { Calendar, CalendarContext } from "./calendar/index";
export type {
  CalendarDate,
  CalendarFirstDayOfWeek,
  CalendarProps,
  CalendarSize,
  DateValue,
} from "./calendar/index";
export { DateField, DateFieldContext } from "./calendar/DateField";
export type { DateFieldProps, DateFieldSize } from "./calendar/DateField";
export { DatePicker, DatePickerContext } from "./calendar/DatePicker";
export type { DatePickerProps, DatePickerSize } from "./calendar/DatePicker";
export { DateRangePicker, DateRangePickerContext } from "./calendar/DateRangePicker";
export type { DateRangePickerProps, DateRangePickerSize } from "./calendar/DateRangePicker";
export { RangeCalendar, RangeCalendarContext } from "./calendar/RangeCalendar";
export type {
  RangeCalendarFirstDayOfWeek,
  RangeCalendarProps,
  RangeCalendarSize,
  RangeValue,
} from "./calendar/RangeCalendar";
export { TimeField, TimeFieldContext } from "./calendar/TimeField";
export type { TimeFieldProps, TimeFieldSize, TimeValue } from "./calendar/TimeField";

// Card
export {
  AssetCard,
  Card,
  CardContext,
  CardPreview,
  CollectionCardPreview,
  ProductCard,
  UserCard,
} from "./card/index";
export type {
  AssetCardProps,
  CardDensity,
  CardPreviewProps,
  CardProps,
  CardRenderProps,
  CardSize,
  CardVariant,
  ProductCardProps,
  UserCardProps,
} from "./card/index";
export { CardView, CardViewContext, Collection as CardViewCollection } from "./cardview/index";
export type {
  CardViewDensity,
  CardViewLayout,
  CardViewLoadingState,
  CardViewProps,
  CardViewSelectionStyle,
  CardViewSize,
  CardViewVariant,
} from "./cardview/index";

// Checkbox
export { Checkbox, CheckboxContext, CheckboxGroup, CheckboxGroupContext } from "./checkbox";
export type {
  CheckboxGroupLabelAlign,
  CheckboxGroupLabelPosition,
  CheckboxGroupNecessityIndicator,
  CheckboxGroupOrientation,
  CheckboxGroupProps,
  CheckboxProps,
  CheckboxSize,
} from "./checkbox";

// Color
export {
  ColorArea,
  ColorAreaContext,
  ColorEditor,
  ColorField,
  ColorFieldContext,
  ColorSlider,
  ColorSliderContext,
  ColorSwatch,
  ColorSwatchContext,
  ColorSwatchPicker,
  ColorSwatchPickerContext,
  ColorSwatchPickerItem,
  ColorWheel,
  ColorWheelContext,
  getColorChannels,
  parseColor,
} from "./color";
export type {
  Color,
  ColorAxes,
  ColorAreaProps,
  ColorEditorProps,
  ColorChannel,
  ColorChannelRange,
  ColorFieldProps,
  ColorFieldLabelAlign,
  ColorFieldLabelPosition,
  ColorFieldNecessityIndicator,
  ColorFieldSize,
  ColorFormat,
  ColorSpace,
  ColorSize,
  ColorSliderProps,
  ColorSwatchPickerDensity,
  ColorSwatchPickerItemProps,
  ColorSwatchPickerProps,
  ColorSwatchPickerRounding,
  ColorSwatchPickerSize,
  ColorSwatchProps,
  ColorSwatchRounding,
  ColorSwatchSize,
  ColorWheelProps,
} from "./color";
export type {
  SwatchPickerDensity,
  SwatchPickerRounding,
  SwatchPickerSize,
} from "./color/ColorSwatchPicker";

// ComboBox
export {
  ComboBox,
  ComboBoxButton,
  ComboBoxContext,
  ComboBoxInput,
  ComboBoxInputGroup,
  ComboBoxListBox,
  ComboBoxOption,
  ComboBoxOption as ComboBoxItem,
  ComboBoxSection,
  defaultContainsFilter,
} from "./combobox";
export type {
  ComboBoxButtonProps,
  ComboBoxInputProps,
  ComboBoxListBoxProps,
  ComboBoxOptionProps,
  ComboBoxOptionProps as ComboBoxItemProps,
  ComboBoxProps,
  ComboBoxSectionProps,
  ComboBoxSize,
  MenuTriggerAction,
} from "./combobox";

// ContextualHelp
export { ContextualHelp, ContextualHelpContext, ContextualHelpPopover } from "./contextualhelp";
export type {
  ContextualHelpPopoverProps,
  ContextualHelpProps,
  ContextualHelpStyleProps,
} from "./contextualhelp";

// Dialog
export {
  AlertDialog,
  CloseButton,
  CustomDialog,
  Dialog,
  DialogContainer,
  DialogFooter,
  DialogTrigger,
  FullscreenDialog,
  useDialogContainer,
} from "./dialog";
export type {
  AlertDialogProps,
  AlertDialogVariant,
  CloseButtonProps,
  CustomDialogProps,
  CustomDialogSize,
  DialogFooterProps,
  DialogProps,
  DialogRenderProps,
  DialogSize,
  DialogTriggerProps,
  FullscreenDialogProps,
  FullscreenDialogVariant,
} from "./dialog";

// Disclosure
export {
  Disclosure,
  DisclosureContext,
  DisclosureGroup,
  DisclosureHeader,
  DisclosurePanel,
  DisclosureTitle,
  DisclosureTrigger,
} from "./disclosure";
export type {
  DisclosureDensity,
  DisclosureGroupProps,
  DisclosureHeaderProps,
  DisclosurePanelProps,
  DisclosureProps,
  DisclosureSize,
  DisclosureTitleProps,
  DisclosureTriggerProps,
} from "./disclosure";

// Divider
export { Divider, DividerContext } from "./divider";
export type { DividerOrientation, DividerProps, DividerSize, DividerStaticColor } from "./divider";

// Separator
export { Separator } from "./separator";
export type { SeparatorProps, SeparatorSize, SeparatorVariant } from "./separator";

// DropZone
export { DropZone, DropZoneContext } from "./dropzone";
export type { DropZoneProps, DropZoneSize } from "./dropzone";

// FileTrigger
export { FileTrigger } from "./filetrigger";
export type { FileTriggerProps } from "./filetrigger";

// Form
export { Form } from "./form";
export type {
  FormLabelAlign,
  FormLabelPosition,
  FormNecessityIndicator,
  FormProps,
  FormSize,
  FormStyleProps,
} from "./form";

// Icons and illustrations
export { createIcon, createIllustration, IconContext, IllustrationContext } from "./icon";
export type { IconContextValue, SpectrumIconProps, SpectrumIllustrationProps } from "./icon";
export { CenterBaseline } from "./icon/center-baseline";
export type { CenterBaselineProps } from "./icon/center-baseline";
export { default as BellIcon } from "./icon/s2wf-icons/BellIcon";
export type { BellIconProps } from "./icon/s2wf-icons/BellIcon";
export { default as CloseIcon } from "./icon/s2wf-icons/CloseIcon";
export type { CloseIconProps } from "./icon/s2wf-icons/CloseIcon";
export { default as ContrastIcon } from "./icon/s2wf-icons/ContrastIcon";
export type { ContrastIconProps } from "./icon/s2wf-icons/ContrastIcon";
export { default as LightenIcon } from "./icon/s2wf-icons/LightenIcon";
export type { LightenIconProps } from "./icon/s2wf-icons/LightenIcon";
export { default as LinkIcon } from "./icon/s2wf-icons/LinkIcon";
export type { LinkIconProps } from "./icon/s2wf-icons/LinkIcon";
export { default as MenuHamburgerIcon } from "./icon/s2wf-icons/MenuHamburgerIcon";
export type { MenuHamburgerIconProps } from "./icon/s2wf-icons/MenuHamburgerIcon";
export { default as SearchIcon } from "./icon/s2wf-icons/SearchIcon";
export type { SearchIconProps } from "./icon/s2wf-icons/SearchIcon";

// IllustratedMessage
export { IllustratedMessage, IllustratedMessageContext } from "./illustratedmessage";
export type {
  IllustratedMessageOrientation,
  IllustratedMessageProps,
  IllustratedMessageSize,
} from "./illustratedmessage";

// Image
export { Image, ImageContext, ImageCoordinator } from "./image";
export type { ImageCoordinatorProps, ImageProps } from "./image";

// InlineAlert
export { InlineAlert, InlineAlertContext } from "./inlinealert";
export type { InlineAlertFillStyle, InlineAlertProps, InlineAlertVariant } from "./inlinealert";

// Link
export { Link, LinkContext } from "./link";
export type { LinkProps } from "./link";

// Layout
export { Flex, Grid } from "./layout";
export type { FlexProps, GridProps } from "./layout";

// ListBox
export { ListBox, ListBoxOption, ListBoxSection } from "./listbox";
export type { ListBoxOptionProps, ListBoxProps, ListBoxSectionProps, ListBoxSize } from "./listbox";

// ListView
export { ListView, ListViewContext, ListViewItem } from "./list";
export type {
  ListViewItemProps,
  ListViewLayout,
  ListViewLoadingState,
  ListViewOverflowMode,
  ListViewProps,
  ListViewSelectionStyle,
  ListViewSize,
  ListViewVariant,
} from "./list";

// Meter
export { Meter, MeterContext } from "./meter";
export type { MeterProps } from "./meter";

// NumberField
export { NumberField, NumberFieldContext } from "./numberfield";
export type { NumberFieldProps, NumberFieldSize, NumberFieldState } from "./numberfield";

// Picker
export { Picker, PickerContext, PickerItem, PickerSection } from "./picker";
export type { PickerItemProps, PickerProps, PickerSectionProps, PickerSize } from "./picker";

// Popover
export { Popover, PopoverFooter, PopoverHeader, PopoverTrigger } from "./popover";
export type {
  PopoverFooterProps,
  PopoverHeaderProps,
  PopoverPlacement,
  PopoverProps,
  PopoverRenderProps,
  PopoverSize,
  PopoverTriggerProps,
} from "./popover";

// Progress
export { NotificationBadge, NotificationBadgeContext } from "./notificationbadge";
export type { NotificationBadgeProps } from "./notificationbadge";
export { ProgressBar, ProgressBarContext } from "./progress-bar";
export type {
  ProgressBarLabelPosition,
  ProgressBarProps,
  ProgressBarSize,
  ProgressBarStaticColor,
} from "./progress-bar";
export { ProgressCircle, ProgressCircleContext } from "./progress/ProgressCircle";
export type {
  ProgressCircleProps,
  ProgressCircleSize,
  ProgressCircleStaticColor,
} from "./progress/ProgressCircle";

// RadioGroup
export { Radio, RadioGroup, RadioGroupContext } from "./radio";
export type { RadioGroupOrientation, RadioGroupProps, RadioGroupSize, RadioProps } from "./radio";

// SearchField
export { SearchField, SearchFieldContext } from "./searchfield";
export type {
  SearchFieldLabelAlign,
  SearchFieldLabelPosition,
  SearchFieldNecessityIndicator,
  SearchFieldProps,
  SearchFieldSize,
  SearchFieldState,
  SearchFieldVariant,
} from "./searchfield";

// SegmentedControl
export {
  SegmentedControl,
  SegmentedControlContext,
  SegmentedControlItem,
} from "./segmentedcontrol";
export type { SegmentedControlItemProps, SegmentedControlProps } from "./segmentedcontrol";

// SelectBoxGroup
export { SelectBox, SelectBoxGroup, SelectBoxGroupContext } from "./selectboxgroup";
export type { SelectBoxGroupProps, SelectBoxOrientation, SelectBoxProps } from "./selectboxgroup";

// Select
export { Select, SelectListBox, SelectOption, SelectTrigger, SelectValue } from "./select";
export type {
  SelectListBoxProps,
  SelectOptionProps,
  SelectProps,
  SelectSize,
  SelectTriggerProps,
  SelectValueProps,
} from "./select";

// Skeleton
export { Skeleton, SkeletonCollection, useIsSkeleton } from "./skeleton";
export type { SkeletonCollectionProps, SkeletonProps } from "./skeleton";

// Text content
export {
  Content,
  ContentContext,
  Footer,
  FooterContext,
  Header,
  HeaderContext,
  Heading,
  HeadingContext,
  Keyboard,
  KeyboardContext,
  Text,
  TextContext,
} from "./text";
export type {
  ContentProps,
  FooterProps,
  HeaderProps,
  HeadingProps,
  KeyboardProps,
  TextProps,
} from "./text";

// Slider
export { RangeSlider, RangeSliderContext, Slider, SliderContext } from "./slider";
export type {
  RangeSliderLabelAlign,
  RangeSliderLabelPosition,
  RangeSliderProps,
  RangeSliderSize,
  RangeSliderThumbStyle,
  RangeSliderTrackStyle,
  RangeSliderVariant,
  SliderOrientation,
  SliderProps,
  SliderSize,
  SliderState,
  SliderVariant,
} from "./slider";

// StatusLight
export { StatusLight, StatusLightContext } from "./statuslight";
export type { StatusLightProps } from "./statuslight";

// Switch
export { Switch, SwitchContext, TabSwitch, ToggleSwitch } from "./switch";
export type { SwitchProps, SwitchSize, TabSwitchProps, ToggleSwitchProps } from "./switch";

// TableView
export {
  ResizableTableContainer,
  Table,
  TableBody,
  TableCell,
  TableCell as Cell,
  TableContext,
  EditableCell,
  TableColumn,
  TableColumn as Column,
  TableFooter,
  TableHeader,
  TableRow,
  TableRow as Row,
  TableSelectAllCheckbox,
  TableSelectionCheckbox,
  TableView,
} from "./table";
export type {
  ColumnDefinition,
  Key,
  ResizableTableContainerProps,
  SortDescriptor,
  TableAlign,
  TableBodyProps,
  TableCellProps,
  TableCellProps as CellProps,
  EditableCellProps,
  TableColumnProps,
  TableColumnProps as ColumnProps,
  TableDensity,
  TableFooterProps,
  TableHeaderProps,
  TableOverflowMode,
  TableProps,
  TableProps as TableViewProps,
  TableRowProps,
  TableRowProps as RowProps,
  TableSize,
  TableVariant,
} from "./table";

// Tabs
export { Tab, TabList, TabPanel, TabPanels, Tabs, TabsContext } from "./Tabs";
export type {
  KeyboardActivation,
  TabListProps,
  TabOrientation,
  TabPanelProps,
  TabPanelsProps,
  TabProps,
  TabsDensity,
  TabsLabelBehavior,
  TabsProps,
} from "./Tabs";

// TagGroup
export { Tag, TagGroup, TagGroupContext } from "./tag-group";
export type {
  SelectionMode,
  TagGroupProps,
  TagGroupSize,
  TagGroupVariant,
  TagProps,
} from "./tag-group";

// Text fields
export { TextArea, TextAreaContext, TextField, TextFieldContext } from "./textfield";
export type {
  TextAreaProps,
  TextAreaSize,
  TextAreaVariant,
  TextFieldProps,
  TextFieldSize,
  TextFieldVariant,
} from "./textfield";

// Toast
export {
  addToast,
  Toast,
  ToastContainer,
  ToastProvider,
  ToastQueue,
  ToastRegion,
  toastError,
  toastInfo,
  toastSuccess,
  toastWarning,
} from "./toast";
export type {
  ToastContainerProps,
  ToastOptions,
  ToastPlacement,
  ToastProps,
  ToastProviderProps,
  ToastRegionProps,
  ToastVariant,
} from "./toast";

// Toolbar
export { Toolbar } from "./toolbar";
export type { ToolbarProps, ToolbarSize, ToolbarVariant } from "./toolbar";

// Tooltip
export { Tooltip, TooltipTrigger } from "./tooltip";
export type {
  TooltipPlacement,
  TooltipProps,
  TooltipRenderProps,
  TooltipTriggerProps,
  TooltipVariant,
} from "./tooltip";

// TreeView
export {
  Collection as TreeViewCollection,
  Tree,
  TreeExpandButton,
  TreeItem,
  TreeItemContent,
  TreeLoadMoreItem,
  TreeSelectionCheckbox,
  TreeView,
  TreeViewContext,
  TreeViewItem,
  TreeViewItemContent,
  TreeViewLoadMoreItem,
} from "./tree";
export type {
  TreeExpandButtonProps,
  TreeItemData,
  TreeItemContentProps,
  TreeItemContentProps as TreeViewItemContentProps,
  TreeItemProps,
  TreeItemProps as TreeViewItemProps,
  TreeLoadMoreItemProps,
  TreeLoadMoreItemProps as TreeViewLoadMoreItemProps,
  TreeLoadingState,
  TreeOverflowMode,
  TreeProps,
  TreeProps as TreeViewProps,
  TreeRenderItemState,
  TreeSelectionStyle,
} from "./tree";

// Support exports — hooks, helpers, and collection data.
// Mirrors React S2's re-exports of the underlying React Aria / React Stately
// utilities; here they come from our equivalent workspace packages. The
// list-data primitives keep their Solid `create*` names internally and are
// re-exported under S2's `use*` names for parity with the upstream surface.
export { mergeStyles } from "./style/runtime";
export { Autocomplete } from "@proyecto-viviana/solidaria-components";
export { useLocale } from "@proyecto-viviana/solidaria";
export {
  createListData as useListData,
  createTreeData as useTreeData,
  createAsyncList as useAsyncList,
} from "@proyecto-viviana/solid-stately";
