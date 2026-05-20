import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, JSX, onMount, Show, For, Suspense, lazy } from "solid-js";
import {
  Button,
  Badge,
  Chip,
  Alert,
  Avatar,
  AvatarGroup,
  TabSwitch,
  ToggleSwitch,
  Checkbox,
  RadioGroup,
  Radio,
  Dialog,
  DialogTrigger,
  DialogFooter,
  ProfileCard,
  EventCard,
  CalendarCard,
  ConversationPreview,
  ConversationBubble,
  TimelineItem,
  PageLayout,
  TextField,
  Link,
  ProgressBar,
  Separator,
  // New styled collection components
  Select as StyledSelect,
  SelectTrigger as StyledSelectTrigger,
  SelectValue as StyledSelectValue,
  SelectListBox as StyledSelectListBox,
  SelectOption as StyledSelectOption,
  Menu as StyledMenu,
  MenuItem as StyledMenuItem,
  MenuTrigger as StyledMenuTrigger,
  MenuButton as StyledMenuButton,
  ListBox as StyledListBox,
  ListBoxOption as StyledListBoxOption,
  // Tabs
  Tabs as StyledTabs,
  TabList as StyledTabList,
  Tab as StyledTab,
  TabPanel as StyledTabPanel,
  // Breadcrumbs
  Breadcrumbs as StyledBreadcrumbs,
  BreadcrumbItem as StyledBreadcrumbItem,
  // NumberField
  NumberField as StyledNumberField,
  // SearchField
  SearchField as StyledSearchField,
  // Slider
  Slider as StyledSlider,
  // ComboBox
  ComboBox as StyledComboBox,
  ComboBoxInputGroup as StyledComboBoxInputGroup,
  ComboBoxInput as StyledComboBoxInput,
  ComboBoxButton as StyledComboBoxButton,
  ComboBoxListBox as StyledComboBoxListBox,
  ComboBoxOption as StyledComboBoxOption,
  defaultContainsFilter,
  // Tooltip
  Tooltip,
  TooltipTrigger,
  // Popover
  Popover,
  PopoverTrigger,
  PopoverHeader,
  PopoverFooter,
  // Toast
  ToastProvider,
  ToastRegion,
  addToast,
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
  // Disclosure
  Disclosure,
  DisclosureGroup,
  DisclosureTrigger,
  DisclosurePanel,
  // Meter
  Meter,
  // TagGroup
  TagGroup,
  // Calendar/DatePicker
  Calendar,
  DatePicker,
  // RangeCalendar, DateField, TimeField
  RangeCalendar,
  DateField,
  TimeField,
} from "@proyecto-viviana/solid-spectrum";
import {
  createButton,
  createCheckboxGroup,
  createCheckboxGroupItem,
  createCheckboxGroupState,
  type CheckboxGroupState,
} from "@proyecto-viviana/solidaria";
import {
  ListBox,
  ListBoxOption,
  Menu,
  MenuItem,
  MenuTrigger,
  MenuButton,
  Select,
  SelectTrigger,
  SelectValue,
  SelectListBox,
  SelectOption,
  Disclosure as HeadlessDisclosure,
  DisclosureTrigger as HeadlessDisclosureTrigger,
  DisclosurePanel as HeadlessDisclosurePanel,
  // Table
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  TableSelectionCheckbox,
  TableSelectAllCheckbox,
  // GridList
  GridList,
  GridListItem,
  GridListSelectionCheckbox,
  // Tree
  Tree,
  TreeItem,
  TreeExpandButton,
  TreeSelectionCheckbox,
  // Color
  ColorSlider,
  ColorSliderTrack,
  ColorSliderThumb,
  ColorArea,
  ColorAreaGradient,
  ColorAreaThumb,
  ColorWheel,
  ColorWheelTrack,
  ColorWheelThumb,
  ColorField,
  ColorFieldInput,
  ColorSwatch,
} from "@proyecto-viviana/solidaria-components";
import {
  CalendarDateClass as CalendarDate,
  type DateValue,
  type CalendarDate as CalendarDateType,
  type RangeValue,
  type TimeValue,
  parseColor,
  type Color,
} from "@proyecto-viviana/solid-stately";
import { Header, ThemeCreator } from "@/components";
import {
  Section,
  SectionControlPanel,
  SECTION_IDS,
  type SectionId,
} from "@/components/playground/sections";
// Fire gif for event card decoration
const fireGif = "/fire.gif";
const ADVANCED_SECTION_IDS: SectionId[] = [
  "createcheckboxgroup-hook",
  "listbox",
  "menu",
  "select",
  "styled-select",
  "styled-menu",
  "styled-listbox",
  "styled-tabs",
  "styled-breadcrumbs",
  "styled-numberfield",
  "styled-searchfield",
  "styled-slider",
  "styled-combobox",
  "actiongroup",
  "toolbar",
  "actionbar",
  "disclosure",
  "meter",
  "taggroup",
  "calendar",
  "datepicker",
  "toast",
  "dropzone",
  "filetrigger",
  "table",
  "gridlist",
  "tree",
  "rangecalendar",
  "datefield",
  "timefield",
  "colorslider",
  "colorarea",
  "colorwheel",
  "colorfield",
  "colorswatch",
  "textarea",
  "daterangepicker",
  "colorswatchpicker",
  "coloreditor",
  "contextualhelp",
  "rangeslider",
  "alertdialog",
  "actionmenu",
  "flex",
  "grid",
  "theme",
];

const PlaygroundAdvancedSections = lazy(() =>
  import("@/components/playground/advanced-sections").then((module) => ({
    default: module.PlaygroundAdvancedSections,
  })),
);

export const Route = createFileRoute("/solid-spectrum/playground")({
  component: Playground,
});

function Playground() {
  const [count, setCount] = createSignal(0);
  const [lastAction, setLastAction] = createSignal("None");
  const [switchValue, setSwitchValue] = createSignal("trending");
  const [toggleOn, setToggleOn] = createSignal(false);
  const [checkboxChecked, setCheckboxChecked] = createSignal(false);
  const [radioValue, setRadioValue] = createSignal<string | null>(null);
  const [themeVars, setThemeVars] = createSignal<Record<string, string>>({});

  // Section visibility - starts with all sections HIDDEN for faster hydration
  const [visibleSections, setVisibleSections] = createSignal<Set<SectionId>>(new Set());

  // Apply theme CSS variables to the playground container
  const themeStyle = () => {
    const vars = themeVars();
    return Object.entries(vars)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");
  };

  const hasVisibleAdvancedSections = () =>
    ADVANCED_SECTION_IDS.some((id) => visibleSections().has(id));

  return (
    <ToastProvider useGlobalQueue>
      <PageLayout withHeader>
        <Header />

        <main id="main-content" class="mx-auto max-w-6xl px-6 py-12">
          {/* Enhanced header */}
          <section class="mb-10 relative" aria-labelledby="playground-heading">
            {/* Background decoration */}
            <div class="absolute -top-4 -left-4 w-24 h-24 rounded-full bg-accent/10 blur-2xl" />
            <div class="absolute top-8 right-0 w-32 h-32 rounded-full bg-primary-500/10 blur-3xl" />

            <div class="relative">
              <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/30 mb-4">
                <span class="relative flex h-2 w-2">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span class="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                <span class="text-xs font-medium text-accent-200">Interactive Demo</span>
              </div>

              <h1
                id="playground-heading"
                class="font-jost text-4xl sm:text-5xl font-bold text-primary-100 mb-4"
              >
                Component <span class="gradient-text-animated">Playground</span>
              </h1>
              <p class="text-lg text-primary-300 max-w-2xl">
                Explore and interact with all 60+ components from the Proyecto Viviana UI library.
                Toggle sections, customize themes, and see everything in action.
              </p>

              <div class="flex items-center gap-4 mt-6 text-sm text-primary-300">
                <span class="flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-success-400" />
                  Last action: {lastAction()}
                </span>
              </div>
            </div>
          </section>

          {/* Theme Creator */}
          <div class="mb-8 rounded-2xl border border-primary-700/30 bg-bg-300/50 backdrop-blur-sm overflow-hidden">
            <div class="p-4 border-b border-primary-700/30 bg-bg-400/50">
              <div class="flex items-center gap-3">
                <div class="w-8 h-8 rounded-lg bg-linear-to-br from-accent to-primary-500 flex items-center justify-center">
                  <svg
                    class="w-4 h-4 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.78-.07 2.58-.2.4-.07.74-.3.96-.63.22-.33.3-.74.21-1.13-.13-.56-.07-1.16.17-1.69.3-.67.94-1.15 1.68-1.26.12-.02.25-.03.37-.03.46 0 .91.14 1.29.41.54.39 1.21.53 1.85.39.54-.12 1-.5 1.23-1.03.22-.52.22-1.11-.01-1.62A10 10 0 0012 2z" />
                  </svg>
                </div>
                <div>
                  <h2 class="font-jost text-lg font-semibold text-primary-200">Theme Creator</h2>
                  <p class="text-xs text-primary-500">Customize colors in real-time</p>
                </div>
              </div>
            </div>
            <div class="p-4">
              <ThemeCreator onThemeChange={setThemeVars} />
            </div>
          </div>

          {/* Theme Preview Area */}
          <div class="p-6 rounded-xl bg-bg-200 border border-bg-300 mb-8" style={themeStyle()}>
            <h2 class="text-lg font-semibold text-primary-200 mb-4">Theme Preview</h2>
            <div class="flex flex-wrap gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="accent">Accent</Button>
              <Chip text="Chip" variant="primary" />
            </div>
          </div>

          {/* Section Visibility Control Panel */}
          <SectionControlPanel
            visibleSections={visibleSections}
            setVisibleSections={setVisibleSections}
          />

          <div class="grid gap-8 lg:grid-cols-2">
            <Section
              id="button"
              visibleSections={visibleSections}
              title="Button"
              description="Primary interactive element with variants and styles"
            >
              <div class="space-y-4">
                <div class="flex flex-wrap gap-3">
                  <Button onPress={() => setCount((c) => c + 1)}>Count: {count()}</Button>
                  <Button variant="secondary" onPress={() => setLastAction("Secondary clicked!")}>
                    Secondary
                  </Button>
                  <Button variant="negative" onPress={() => setLastAction("Danger clicked!")}>
                    Danger
                  </Button>
                  <Button variant="positive" onPress={() => setLastAction("Success clicked!")}>
                    Success
                  </Button>
                  <Button isDisabled>Disabled</Button>
                </div>
                <div class="flex flex-wrap gap-3">
                  <Button buttonStyle="outline" variant="primary">
                    Outline Primary
                  </Button>
                  <Button buttonStyle="outline" variant="secondary">
                    Outline Secondary
                  </Button>
                  <Button buttonStyle="outline" variant="negative">
                    Outline Danger
                  </Button>
                  <Button buttonStyle="outline" variant="positive">
                    Outline Success
                  </Button>
                </div>
              </div>
            </Section>

            <Section
              id="badge"
              visibleSections={visibleSections}
              title="Badge"
              description="Notification indicators and counts"
            >
              <div class="flex flex-wrap items-center gap-4">
                <div class="flex items-center gap-2">
                  <Badge count={5} variant="primary" />
                  <span class="text-sm text-primary-300">Primary</span>
                </div>
                <div class="flex items-center gap-2">
                  <Badge count={12} variant="accent" />
                  <span class="text-sm text-primary-300">Accent</span>
                </div>
                <div class="flex items-center gap-2">
                  <Badge count={3} variant="success" />
                  <span class="text-sm text-primary-300">Success</span>
                </div>
                <div class="flex items-center gap-2">
                  <Badge count={99} variant="warning" />
                  <span class="text-sm text-primary-300">Warning</span>
                </div>
                <div class="flex items-center gap-2">
                  <Badge count={1} variant="danger" />
                  <span class="text-sm text-primary-300">Danger</span>
                </div>
              </div>
            </Section>

            {/* Chip with both string and function icons (SSR-safe) */}
            <Section
              id="chip"
              visibleSections={visibleSections}
              title="Chip"
              description="Small labels and tag buttons"
            >
              <div class="flex flex-wrap gap-3">
                <Chip
                  text="Primary"
                  variant="primary"
                  onClick={() => setLastAction("Primary chip")}
                />
                <Chip
                  text="Secondary"
                  variant="secondary"
                  onClick={() => setLastAction("Secondary chip")}
                />
                <Chip text="Accent" variant="accent" onClick={() => setLastAction("Accent chip")} />
                <Chip
                  text="Outline"
                  variant="outline"
                  onClick={() => setLastAction("Outline chip")}
                />
                <Chip
                  text="String Icon"
                  variant="primary"
                  icon="★"
                  onClick={() => setLastAction("String icon chip")}
                />
                <Chip
                  text="Function Icon"
                  variant="accent"
                  icon={() => <span>🎉</span>}
                  onClick={() => setLastAction("Function icon chip")}
                />
              </div>
            </Section>

            <Section
              id="alert"
              visibleSections={visibleSections}
              title="Alert"
              description="Contextual feedback messages"
            >
              <div class="space-y-3">
                <Alert variant="info" title="Information">
                  This is an informational message.
                </Alert>
                <Alert variant="success" title="Success">
                  Operation completed successfully!
                </Alert>
                <Alert variant="warning" title="Warning">
                  Please review before continuing.
                </Alert>
                <Alert
                  variant="error"
                  title="Error"
                  dismissible
                  onDismiss={() => setLastAction("Alert dismissed")}
                >
                  Something went wrong.
                </Alert>
              </div>
            </Section>

            {/* Tooltip */}
            <Section
              id="tooltip"
              visibleSections={visibleSections}
              title="Tooltip"
              description="Contextual information on hover/focus"
            >
              <div class="space-y-6">
                {/* Placement variants */}
                <div>
                  <p class="text-sm text-primary-300 mb-3">Placements</p>
                  <div class="flex flex-wrap gap-4">
                    <TooltipTrigger>
                      <Button variant="secondary">Top</Button>
                      <Tooltip placement="top">Tooltip on top</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger>
                      <Button variant="secondary">Bottom</Button>
                      <Tooltip placement="bottom">Tooltip on bottom</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger>
                      <Button variant="secondary">Left</Button>
                      <Tooltip placement="left">Tooltip on left</Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger>
                      <Button variant="secondary">Right</Button>
                      <Tooltip placement="right">Tooltip on right</Tooltip>
                    </TooltipTrigger>
                  </div>
                </div>
                {/* With arrow */}
                <div>
                  <p class="text-sm text-primary-300 mb-3">With Arrow</p>
                  <div class="flex flex-wrap gap-4">
                    <TooltipTrigger>
                      <Button variant="primary">Hover me</Button>
                      <Tooltip placement="top" showArrow>
                        Tooltip with arrow
                      </Tooltip>
                    </TooltipTrigger>
                    <TooltipTrigger>
                      <Button variant="accent">Focus me</Button>
                      <Tooltip placement="bottom" showArrow variant="info">
                        Info variant with arrow
                      </Tooltip>
                    </TooltipTrigger>
                  </div>
                </div>
                {/* Delay */}
                <div>
                  <p class="text-sm text-primary-300 mb-3">Custom Delay (500ms)</p>
                  <TooltipTrigger delay={500}>
                    <Button variant="secondary" buttonStyle="outline">
                      Delayed tooltip
                    </Button>
                    <Tooltip>This tooltip has a 500ms delay</Tooltip>
                  </TooltipTrigger>
                </div>
              </div>
            </Section>

            {/* Popover */}
            <Section
              id="popover"
              visibleSections={visibleSections}
              title="Popover"
              description="Positioned overlay content triggered by user action"
            >
              <div class="space-y-6">
                {/* Basic placements */}
                <div>
                  <p class="text-sm text-primary-300 mb-3">Placement Options</p>
                  <div class="flex flex-wrap gap-3">
                    <PopoverTrigger>
                      <Button
                        variant="secondary"
                        buttonStyle="outline"
                        data-testid="popover-bottom-trigger"
                      >
                        Bottom
                      </Button>
                      <Popover placement="bottom" data-testid="popover-bottom">
                        <PopoverHeader
                          title="Bottom Popover"
                          description="This popover opens below the trigger"
                        />
                        <p class="text-sm">Content positioned at the bottom.</p>
                      </Popover>
                    </PopoverTrigger>
                    <PopoverTrigger>
                      <Button variant="secondary" buttonStyle="outline">
                        Top
                      </Button>
                      <Popover placement="top">
                        <PopoverHeader title="Top Popover" />
                        <p class="text-sm">Content positioned at the top.</p>
                      </Popover>
                    </PopoverTrigger>
                    <PopoverTrigger>
                      <Button variant="secondary" buttonStyle="outline">
                        Left
                      </Button>
                      <Popover placement="left">
                        <PopoverHeader title="Left Popover" />
                        <p class="text-sm">Content on the left side.</p>
                      </Popover>
                    </PopoverTrigger>
                    <PopoverTrigger>
                      <Button variant="secondary" buttonStyle="outline">
                        Right
                      </Button>
                      <Popover placement="right">
                        <PopoverHeader title="Right Popover" />
                        <p class="text-sm">Content on the right side.</p>
                      </Popover>
                    </PopoverTrigger>
                  </div>
                </div>
                {/* With footer actions */}
                <div>
                  <p class="text-sm text-primary-300 mb-3">With Footer Actions</p>
                  <PopoverTrigger>
                    <Button variant="primary" data-testid="popover-actions-trigger">
                      Open with Actions
                    </Button>
                    <Popover placement="bottom" size="md" data-testid="popover-actions">
                      <PopoverHeader
                        title="Confirm Action"
                        description="Are you sure you want to proceed with this action?"
                      />
                      <PopoverFooter>
                        <Button variant="secondary" buttonStyle="outline" size="sm">
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm">
                          Confirm
                        </Button>
                      </PopoverFooter>
                    </Popover>
                  </PopoverTrigger>
                </div>
                {/* Size variants */}
                <div>
                  <p class="text-sm text-primary-300 mb-3">Size Variants</p>
                  <div class="flex flex-wrap gap-3">
                    <PopoverTrigger>
                      <Button variant="secondary" buttonStyle="outline">
                        Small
                      </Button>
                      <Popover placement="bottom" size="sm">
                        <p class="text-sm">Small popover content.</p>
                      </Popover>
                    </PopoverTrigger>
                    <PopoverTrigger>
                      <Button variant="secondary" buttonStyle="outline">
                        Medium
                      </Button>
                      <Popover placement="bottom" size="md">
                        <p class="text-sm">Medium popover content with more room for details.</p>
                      </Popover>
                    </PopoverTrigger>
                    <PopoverTrigger>
                      <Button variant="secondary" buttonStyle="outline">
                        Large
                      </Button>
                      <Popover placement="bottom" size="lg">
                        <p class="text-sm">
                          Large popover content with maximum width for longer content sections.
                        </p>
                      </Popover>
                    </PopoverTrigger>
                  </div>
                </div>
              </div>
            </Section>

            <Section
              id="avatar"
              visibleSections={visibleSections}
              title="Avatar"
              description="User profile images with status"
            >
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <Avatar size="xs" alt="XS" />
                  <Avatar size="sm" alt="SM" />
                  <Avatar size="md" alt="MD" online />
                  <Avatar size="lg" alt="LG" online={false} />
                  <Avatar size="xl" alt="XL" fallback="VV" />
                </div>
                <div class="flex items-center gap-2">
                  <span class="text-sm text-primary-300">Avatar Group:</span>
                  <AvatarGroup>
                    <Avatar size="sm" alt="User 1" />
                    <Avatar size="sm" alt="User 2" />
                    <Avatar size="sm" alt="User 3" />
                  </AvatarGroup>
                </div>
              </div>
            </Section>

            <Section
              id="switch"
              visibleSections={visibleSections}
              title="Switch"
              description="Toggle and tab switch controls"
            >
              <div class="space-y-4">
                <div class="flex items-center gap-4">
                  <span class="text-sm text-primary-200">Toggle:</span>
                  <ToggleSwitch
                    aria-label="Toggle demo switch"
                    isSelected={toggleOn()}
                    onChange={setToggleOn}
                  />
                  <span class="text-sm text-primary-300">{toggleOn() ? "On" : "Off"}</span>
                </div>
                <div>
                  <span class="text-sm text-primary-200 block mb-2">Tab Switch:</span>
                  <TabSwitch
                    options={[
                      { label: "TRENDING", value: "trending" },
                      { label: "LATEST", value: "latest" },
                    ]}
                    value={switchValue()}
                    onChange={setSwitchValue}
                  />
                  <p class="text-sm text-primary-300 mt-2">Selected: {switchValue()}</p>
                </div>
              </div>
            </Section>

            <Section
              id="checkbox"
              visibleSections={visibleSections}
              title="Checkbox"
              description="Toggle selection with accessible checkbox"
            >
              <div class="space-y-4">
                <div class="space-y-3">
                  <Checkbox
                    isSelected={checkboxChecked()}
                    onChange={(checked) => {
                      setCheckboxChecked(checked);
                      setLastAction(`Checkbox: ${checked ? "checked" : "unchecked"}`);
                    }}
                  >
                    Accept terms and conditions
                  </Checkbox>
                  <Checkbox defaultSelected>Newsletter subscription</Checkbox>
                  <Checkbox isDisabled>Disabled option</Checkbox>
                  <Checkbox isIndeterminate>Indeterminate state</Checkbox>
                </div>
                <div class="flex items-center gap-4 pt-2">
                  <span class="text-sm text-primary-300">Sizes:</span>
                  <Checkbox size="sm" aria-label="Small checkbox" />
                  <Checkbox size="md" aria-label="Medium checkbox" />
                  <Checkbox size="lg" aria-label="Large checkbox" />
                </div>
              </div>
            </Section>

            <Section
              id="textfield"
              visibleSections={visibleSections}
              title="TextField"
              description="Text input with label, description, and validation"
            >
              <div class="space-y-4">
                <TextField
                  label="Email"
                  placeholder="Enter your email"
                  description="We'll never share your email"
                />
                <TextField
                  label="Password"
                  type="password"
                  placeholder="Enter your password"
                  isRequired
                />
                <TextField
                  label="Username"
                  placeholder="Choose a username"
                  isInvalid
                  errorMessage="Username is already taken"
                />
                <div class="flex gap-4">
                  <TextField label="Small" size="sm" placeholder="Small input" />
                  <TextField label="Large" size="lg" placeholder="Large input" />
                </div>
                <TextField label="Disabled" value="Can't edit this" isDisabled />
                <TextField
                  label="Filled variant"
                  variant="filled"
                  placeholder="With filled style"
                />
              </div>
            </Section>

            <Section
              id="link"
              visibleSections={visibleSections}
              title="Link"
              description="Accessible link with hover and press states"
            >
              <div class="space-y-4">
                <div class="flex flex-wrap gap-4">
                  <Link href="https://example.com" target="_blank">
                    External Link
                  </Link>
                  <Link variant="secondary" onPress={() => setLastAction("Secondary link pressed")}>
                    Secondary Link
                  </Link>
                  <Link
                    isStandalone
                    isQuiet
                    onPress={() => setLastAction("Quiet standalone link pressed")}
                  >
                    Quiet Standalone Link
                  </Link>
                </div>
                <div class="flex flex-wrap gap-4">
                  <Link href="https://example.com" aria-current="page">
                    Current Page Link
                  </Link>
                </div>
                <p class="text-sm text-primary-400">
                  Links support keyboard navigation (Enter key), hover states, and press feedback.
                </p>
              </div>
            </Section>

            <Section
              id="progressbar"
              visibleSections={visibleSections}
              title="ProgressBar"
              description="Shows progress of an operation over time"
            >
              <div class="space-y-6">
                <div class="space-y-4">
                  <ProgressBar value={25} label="Uploading..." />
                  <ProgressBar value={50} label="Processing" variant="accent" />
                  <ProgressBar value={75} label="Almost done" variant="success" />
                  <ProgressBar value={100} label="Complete" variant="success" />
                </div>
                <div class="space-y-4">
                  <span class="text-sm text-primary-300 block">Indeterminate:</span>
                  <ProgressBar isIndeterminate label="Loading..." />
                </div>
                <div class="space-y-4">
                  <span class="text-sm text-primary-300 block">Sizes:</span>
                  <ProgressBar value={60} size="sm" label="Small" />
                  <ProgressBar value={60} size="md" label="Medium" />
                  <ProgressBar value={60} size="lg" label="Large" />
                </div>
                <div class="space-y-4">
                  <span class="text-sm text-primary-300 block">Variants:</span>
                  <ProgressBar value={40} variant="primary" aria-label="Primary progress" />
                  <ProgressBar value={40} variant="accent" aria-label="Accent progress" />
                  <ProgressBar value={40} variant="success" aria-label="Success progress" />
                  <ProgressBar value={40} variant="warning" aria-label="Warning progress" />
                  <ProgressBar value={40} variant="danger" aria-label="Danger progress" />
                </div>
                <div>
                  <span class="text-sm text-primary-300 block mb-2">Custom value label:</span>
                  <ProgressBar
                    value={2}
                    minValue={0}
                    maxValue={5}
                    valueLabel="Step 2 of 5"
                    label="Setup Progress"
                  />
                </div>
              </div>
            </Section>

            <Section
              id="separator"
              visibleSections={visibleSections}
              title="Separator"
              description="Visual divider between groups of content"
            >
              <div class="space-y-6">
                <div class="space-y-4">
                  <span class="text-sm text-primary-300 block">Horizontal (default):</span>
                  <Separator />
                  <p class="text-sm text-primary-400">Content above and below the separator.</p>
                </div>
                <div>
                  <span class="text-sm text-primary-300 block mb-2">Vertical:</span>
                  <div class="flex items-center gap-4 h-8">
                    <span class="text-primary-200">Item 1</span>
                    <Separator orientation="vertical" />
                    <span class="text-primary-200">Item 2</span>
                    <Separator orientation="vertical" />
                    <span class="text-primary-200">Item 3</span>
                  </div>
                </div>
                <div class="space-y-4">
                  <span class="text-sm text-primary-300 block">Sizes:</span>
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-primary-400 w-8">sm:</span>
                      <Separator size="sm" class="flex-1" />
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-primary-400 w-8">md:</span>
                      <Separator size="md" class="flex-1" />
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-primary-400 w-8">lg:</span>
                      <Separator size="lg" class="flex-1" />
                    </div>
                  </div>
                </div>
                <div class="space-y-4">
                  <span class="text-sm text-primary-300 block">Variants:</span>
                  <div class="space-y-2">
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-primary-400 w-16">default:</span>
                      <Separator variant="default" class="flex-1" />
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-primary-400 w-16">subtle:</span>
                      <Separator variant="subtle" class="flex-1" />
                    </div>
                    <div class="flex items-center gap-2">
                      <span class="text-xs text-primary-400 w-16">strong:</span>
                      <Separator variant="strong" class="flex-1" />
                    </div>
                  </div>
                </div>
              </div>
            </Section>

            {/* RadioGroup temporarily disabled - styled Radio component needs SSR-compatible redesign */}
            {/*
          <Section id="radiogroup" visibleSections={visibleSections} title="RadioGroup" description="Single selection from multiple options">
            <div class="space-y-6">
              <RadioGroup
                label="Choose your plan"
                value={radioValue()}
                onChange={(value) => {
                  setRadioValue(value)
                  setLastAction(`Radio selected: ${value}`)
                }}
              >
                <Radio value="free">Free Plan</Radio>
                <Radio value="pro">Pro Plan</Radio>
                <Radio value="enterprise">Enterprise Plan</Radio>
              </RadioGroup>

              <div class="border-t border-bg-100 pt-4">
                <RadioGroup
                  label="Horizontal layout"
                  orientation="horizontal"
                  defaultValue="option2"
                >
                  <Radio value="option1">Option 1</Radio>
                  <Radio value="option2">Option 2</Radio>
                  <Radio value="option3">Option 3</Radio>
                </RadioGroup>
              </div>

              <div class="border-t border-bg-100 pt-4">
                <span class="text-sm text-primary-300 block mb-2">Sizes:</span>
                <div class="flex gap-8">
                  <RadioGroup aria-label="Small size" size="sm" defaultValue="a">
                    <Radio value="a">Small</Radio>
                  </RadioGroup>
                  <RadioGroup aria-label="Medium size" size="md" defaultValue="a">
                    <Radio value="a">Medium</Radio>
                  </RadioGroup>
                  <RadioGroup aria-label="Large size" size="lg" defaultValue="a">
                    <Radio value="a">Large</Radio>
                  </RadioGroup>
                </div>
              </div>

              <div class="border-t border-bg-100 pt-4">
                <RadioGroup
                  label="With validation"
                  isInvalid
                  errorMessage="Please select an option"
                  description="This field is required"
                >
                  <Radio value="a">Option A</Radio>
                  <Radio value="b">Option B</Radio>
                </RadioGroup>
              </div>
            </div>
          </Section>
          */}

            <Section
              id="profilecard"
              visibleSections={visibleSections}
              title="ProfileCard"
              description="User profile display cards"
            >
              <ProfileCard
                username="@viviana_dev"
                bio="Building accessible SolidJS components. React Aria patterns for Solid."
                followers={1234}
                following={567}
                actions={() => (
                  <div class="flex gap-2">
                    <Button variant="primary" onPress={() => setLastAction("Followed!")}>
                      Follow
                    </Button>
                    <Button
                      variant="secondary"
                      buttonStyle="outline"
                      onPress={() => setLastAction("Message!")}
                    >
                      Message
                    </Button>
                  </div>
                )}
              />
            </Section>

            <Section
              id="eventcard"
              visibleSections={visibleSections}
              title="EventCard"
              description="Event display with attendees"
            >
              <EventCard
                title="Fiesta de Taylor 2021 todos invitados"
                date="2 días"
                author="taylorswift"
                decorationImage={fireGif}
                attendees={[{ name: "Alice" }, { name: "Bob" }, { name: "Carol" }]}
                attendeeCount={42}
                actions={() => (
                  <Button variant="primary" onPress={() => setLastAction("RSVP!")}>
                    RSVP
                  </Button>
                )}
              />
            </Section>

            <Section
              id="calendarcard"
              visibleSections={visibleSections}
              title="CalendarCard"
              description="Calendar event with followers"
            >
              <CalendarCard
                title="Component Design Workshop"
                tags={["Design", "UI/UX"]}
                followers={[{ name: "Alice" }, { name: "Bob" }]}
                followerCount={15}
              />
            </Section>

            <Section
              id="conversation"
              visibleSections={visibleSections}
              title="Conversation"
              description="Chat and messaging UI"
            >
              <div class="space-y-4">
                <ConversationPreview
                  user={{ name: "Alice", online: true }}
                  lastMessage="Hey! Have you seen the new components?"
                  timestamp="2m ago"
                  unreadCount={3}
                  onClick={() => setLastAction("Opened conversation with Alice")}
                />
                <div class="rounded-lg bg-bg-300 p-4 space-y-2">
                  <ConversationBubble content="Hi there!" sender="other" timestamp="10:30 AM" />
                  <ConversationBubble
                    content="Hello! How are you?"
                    sender="user"
                    timestamp="10:31 AM"
                  />
                  <ConversationBubble
                    content="Great! Love the new UI"
                    sender="other"
                    timestamp="10:32 AM"
                  />
                </div>
              </div>
            </Section>

            <Section
              id="timelineitem"
              visibleSections={visibleSections}
              title="TimelineItem"
              description="Social activity timeline"
            >
              <div class="flex flex-wrap gap-4">
                <TimelineItem
                  type="follow"
                  leftUser={{ name: "Alice" }}
                  rightUser={{ name: "Bob" }}
                  icon={() => <span class="text-2xl">👋</span>}
                />
                <TimelineItem
                  type="like"
                  leftUser={{ name: "Carol" }}
                  rightUser={{ name: "Dave" }}
                  icon={() => <span class="text-2xl">❤️</span>}
                />
              </div>
            </Section>

            <Section
              id="dialog"
              visibleSections={visibleSections}
              title="Dialog"
              description="Modal dialog with overlay and backdrop"
              class="lg:col-span-2"
            >
              <div class="flex gap-4">
                <DialogTrigger
                  trigger={<Button variant="primary">Open Dialog</Button>}
                  content={(close) => (
                    <Dialog title="Welcome!" size="md" isDismissable={true} onClose={close}>
                      <p class="mb-4">
                        Welcome to Proyecto Viviana! A collection of accessible, beautifully styled
                        SolidJS components inspired by React Spectrum.
                      </p>
                      <DialogFooter>
                        <Button variant="primary" buttonStyle="outline" onPress={close}>
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onPress={() => {
                            setLastAction("Dialog: Get Started");
                            close();
                          }}
                        >
                          Get Started
                        </Button>
                      </DialogFooter>
                    </Dialog>
                  )}
                />

                <DialogTrigger
                  trigger={<Button variant="accent">Small Dialog</Button>}
                  content={(close) => (
                    <Dialog title="Confirmation" size="sm" isDismissable={true} onClose={close}>
                      <p class="mb-4">Are you sure you want to continue?</p>
                      <DialogFooter>
                        <Button variant="primary" buttonStyle="outline" onPress={close}>
                          No
                        </Button>
                        <Button
                          variant="negative"
                          onPress={() => {
                            setLastAction("Dialog: Confirmed");
                            close();
                          }}
                        >
                          Yes, Continue
                        </Button>
                      </DialogFooter>
                    </Dialog>
                  )}
                />

                <DialogTrigger
                  trigger={<Button variant="secondary">Large Dialog</Button>}
                  content={(close) => (
                    <Dialog title="Settings" size="lg" isDismissable={true} onClose={close}>
                      <div class="space-y-4">
                        <p>Configure your application settings below.</p>
                        <TextField label="Username" placeholder="Enter username" />
                        <TextField label="Email" placeholder="Enter email" type="email" />
                      </div>
                      <DialogFooter>
                        <Button variant="primary" buttonStyle="outline" onPress={close}>
                          Cancel
                        </Button>
                        <Button
                          variant="primary"
                          onPress={() => {
                            setLastAction("Dialog: Settings Saved");
                            close();
                          }}
                        >
                          Save Changes
                        </Button>
                      </DialogFooter>
                    </Dialog>
                  )}
                />
              </div>
            </Section>

            <Section
              id="createbutton-hook"
              visibleSections={visibleSections}
              title="createButton Hook"
              description="Low-level hook for custom implementations"
              class="lg:col-span-2"
            >
              <div class="flex flex-wrap gap-4">
                <CustomGradientButton onPress={() => setLastAction("Gradient button pressed!")}>
                  Custom Gradient Button
                </CustomGradientButton>
                <CustomOutlineButton onPress={() => setLastAction("Outline button pressed!")}>
                  Custom Outline Button
                </CustomOutlineButton>
              </div>
            </Section>

            <Show when={hasVisibleAdvancedSections()}>
              <Suspense
                fallback={
                  <div class="lg:col-span-2 rounded-xl border border-primary-700/30 bg-bg-300/40 p-4 text-sm text-primary-400">
                    Loading advanced playground sections...
                  </div>
                }
              >
                <PlaygroundAdvancedSections
                  visibleSections={visibleSections}
                  onLastAction={setLastAction}
                />
              </Suspense>
            </Show>
          </div>
        </main>
        <ToastRegion placement="bottom-end" />
      </PageLayout>
    </ToastProvider>
  );
}

function CustomGradientButton(props: { onPress?: () => void; children: string }) {
  const { buttonProps, isPressed } = createButton({
    onPress: props.onPress,
  });

  return (
    <button
      {...buttonProps}
      class={`rounded-lg bg-gradient-to-r from-primary-500 to-accent px-6 py-3 font-medium text-white shadow-md transition-all hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        isPressed() ? "scale-[0.98] shadow-sm" : ""
      }`}
    >
      {props.children}
    </button>
  );
}

function CustomOutlineButton(props: { onPress?: () => void; children: string }) {
  const { buttonProps, isPressed } = createButton({
    onPress: props.onPress,
  });

  return (
    <button
      {...buttonProps}
      class={`rounded-lg border-2 border-primary-500 bg-transparent px-6 py-3 font-medium text-primary-200 transition-all hover:bg-primary-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        isPressed() ? "scale-[0.98] bg-primary-700" : ""
      }`}
    >
      {props.children}
    </button>
  );
}
