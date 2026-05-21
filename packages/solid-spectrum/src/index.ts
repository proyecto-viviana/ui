// Public surface for the React Spectrum S2 parity package.
// Keep this barrel scoped to current S2 component targets and their required
// slots/helpers. Custom Viviana components, story helpers, and legacy aliases
// should live outside the main S2 export path.

// Provider
export { Provider } from "./provider";
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
export { ActionBar, ActionBarContext } from "./actionbar";
export type { ActionBarProps } from "./actionbar";

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
  Menu,
  MenuContext,
  MenuItem,
  MenuSection,
  MenuTrigger,
  SubmenuTrigger,
  UnavailableMenuItemTrigger,
} from "./menu/index";
export type {
  MenuItemProps,
  MenuAlign,
  MenuDirection,
  MenuProps,
  MenuSectionProps,
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
export { DateField } from "./calendar/DateField";
export type { DateFieldProps, DateFieldSize } from "./calendar/DateField";
export { DatePicker } from "./calendar/DatePicker";
export type { DatePickerProps, DatePickerSize } from "./calendar/DatePicker";
export { DateRangePicker } from "./calendar/DateRangePicker";
export type { DateRangePickerProps, DateRangePickerSize } from "./calendar/DateRangePicker";
export { RangeCalendar, RangeCalendarContext } from "./calendar/RangeCalendar";
export type {
  RangeCalendarFirstDayOfWeek,
  RangeCalendarProps,
  RangeCalendarSize,
  RangeValue,
} from "./calendar/RangeCalendar";
export { TimeField } from "./calendar/TimeField";
export type { TimeFieldProps, TimeFieldSize, TimeValue } from "./calendar/TimeField";

// Card
export { Card } from "./card";
export type { CardProps } from "./card";
export { CardView } from "./cardview";
export type {
  CardViewDensity,
  CardViewLayout,
  CardViewProps,
  CardViewSelectionStyle,
  CardViewSize,
  CardViewVariant,
} from "./cardview";

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
  ColorField,
  ColorSlider,
  ColorSwatch,
  ColorWheel,
  getColorChannels,
  parseColor,
} from "./color";
export type {
  Color,
  ColorAreaProps,
  ColorChannel,
  ColorFieldProps,
  ColorFormat,
  ColorSize,
  ColorSliderProps,
  ColorSwatchProps,
  ColorWheelProps,
} from "./color";
export { ColorSwatchPicker } from "./color/ColorSwatchPicker";
export type {
  ColorSwatchPickerProps,
  SwatchPickerDensity,
  SwatchPickerRounding,
  SwatchPickerSize,
} from "./color/ColorSwatchPicker";

// ComboBox
export { ComboBox, ComboBoxContext, ComboBoxOption as ComboBoxItem } from "./combobox";
export type {
  ComboBoxOptionProps as ComboBoxItemProps,
  ComboBoxProps,
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
export { Dialog, DialogTrigger } from "./dialog";
export type { DialogProps, DialogSize, DialogTriggerProps } from "./dialog";

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

// DropZone
export { DropZone } from "./dropzone";
export type { DropZoneProps } from "./dropzone";

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

// IllustratedMessage
export { IllustratedMessage } from "./illustratedmessage";
export type { IllustratedMessageProps } from "./illustratedmessage";

// Image
export { Image, ImageContext, ImageCoordinator } from "./image";
export type { ImageCoordinatorProps, ImageProps } from "./image";

// InlineAlert
export { InlineAlert } from "./inlinealert";
export type { InlineAlertProps, InlineAlertVariant } from "./inlinealert";

// Link
export { Link, LinkContext } from "./link";
export type { LinkProps } from "./link";

// ListView
export { ListView, ListViewItem } from "./list";
export type {
  ListViewItemProps,
  ListViewLayout,
  ListViewProps,
  ListViewSize,
  ListViewVariant,
} from "./list";

// Meter
export { Meter, MeterContext } from "./meter";
export type { MeterProps } from "./meter";

// NumberField
export { NumberField } from "./numberfield";
export type {
  NumberFieldProps,
  NumberFieldSize,
  NumberFieldState,
  NumberFieldVariant,
} from "./numberfield";

// Picker
export { Picker, PickerItem } from "./picker";
export type { PickerItemProps, PickerProps, PickerSize } from "./picker";

// Popover
export { Popover } from "./popover";
export type { PopoverPlacement, PopoverProps, PopoverRenderProps, PopoverSize } from "./popover";

// Progress
export { NotificationBadge, NotificationBadgeContext } from "./notificationbadge";
export type { NotificationBadgeProps } from "./notificationbadge";
export { ProgressBar } from "./progress-bar";
export type { ProgressBarProps, ProgressBarSize, ProgressBarVariant } from "./progress-bar";
export { ProgressCircle } from "./progress/ProgressCircle";
export type {
  ProgressCircleProps,
  ProgressCircleSize,
  ProgressCircleVariant,
} from "./progress/ProgressCircle";

// RadioGroup
export { Radio, RadioGroup } from "./radio";
export type { RadioGroupOrientation, RadioGroupProps, RadioGroupSize, RadioProps } from "./radio";

// SearchField
export { SearchField } from "./searchfield";
export type {
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
export { RangeSlider, Slider, SliderContext } from "./slider";
export type {
  RangeSliderProps,
  RangeSliderSize,
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
export { Switch } from "./switch";
export type { SwitchProps, SwitchSize } from "./switch";

// TableView
export {
  TableBody,
  TableCell as Cell,
  TableColumn as Column,
  TableHeader,
  TableRow as Row,
  TableView,
} from "./table";
export type {
  ColumnDefinition,
  Key,
  SortDescriptor,
  TableBodyProps,
  TableCellProps as CellProps,
  TableColumnProps as ColumnProps,
  TableHeaderProps,
  TableProps as TableViewProps,
  TableRowProps as RowProps,
  TableSize,
  TableVariant,
} from "./table";

// Tabs
export { Tab, TabList, TabPanel, Tabs } from "./tabs";
export type {
  TabOrientation,
  TabListProps,
  TabPanelProps,
  TabProps,
  TabsProps,
  TabsSize,
  TabsVariant,
} from "./tabs";

// TagGroup
export { TagGroup } from "./tag-group";
export type {
  SelectionMode,
  TagGroupProps,
  TagGroupSize,
  TagGroupVariant,
  TagProps,
} from "./tag-group";

// Text fields
export { TextArea, TextField } from "./textfield";
export type {
  TextAreaProps,
  TextAreaSize,
  TextAreaVariant,
  TextFieldProps,
  TextFieldSize,
  TextFieldVariant,
} from "./textfield";

// Toast
export { ToastContainer, ToastQueue } from "./toast";
export type { ToastContainerProps, ToastOptions } from "./toast";

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
export { TreeView, TreeViewItem, TreeViewItemContent } from "./tree";
export type {
  TreeItemData,
  TreeItemContentProps as TreeViewItemContentProps,
  TreeItemProps as TreeViewItemProps,
  TreeProps as TreeViewProps,
  TreeRenderItemState,
  TreeSize,
  TreeVariant,
} from "./tree";
