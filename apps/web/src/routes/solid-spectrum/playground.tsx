import { createFileRoute } from "@tanstack/solid-router";
import { createSignal, JSX, onMount, Show, For, Suspense, lazy } from "solid-js";
import {
  Button,
  Badge,
  InlineAlert,
  Heading,
  Content,
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
  ToastContainer,
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
// Page chrome — layout, type, and surfaces — comes from the app-facing design system;
// the components being demonstrated below still come from their own packages.
// `Heading` is aliased because the bare `Heading` above is solid-spectrum's, which is what
// the InlineAlert demos slot into; only the page's own headings use this one.
import {
  Flex,
  Grid,
  Heading as PageHeading,
  Text,
  typeRoles,
} from "@proyecto-viviana/ui";
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

// Page chrome, described with the design system's tokens instead of a local utility
// vocabulary, so it tracks the register rather than a frozen copy of it.
const mainStyle: JSX.CSSProperties = {
  width: "100%",
  "max-width": "72rem",
  margin: "0 auto",
  padding: "48px 24px",
};

const glow: JSX.CSSProperties = {
  position: "absolute",
  "border-radius": "999px",
  opacity: 0.1,
  "pointer-events": "none",
};

const cardSurface: JSX.CSSProperties = {
  background: "var(--color-bg-300)",
  border: "1px solid var(--border-subtle)",
  "border-radius": "var(--radius-xl)",
};

const panelSurface: JSX.CSSProperties = {
  ...cardSurface,
  "margin-bottom": "32px",
  overflow: "hidden",
};

const panelHeaderSurface: JSX.CSSProperties = {
  padding: "16px",
  "border-bottom": "1px solid var(--border-subtle)",
  background: "var(--color-bg-400)",
};

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

  // Apply theme CSS variables to the playground container. Returned as an object rather
  // than a `k: v;` string so it can be merged with the preview surface's own declarations.
  const themeStyle = (): JSX.CSSProperties => themeVars() as JSX.CSSProperties;

  const hasVisibleAdvancedSections = () =>
    ADVANCED_SECTION_IDS.some((id) => visibleSections().has(id));

  return (
    <ToastProvider useGlobalQueue>
      <div
        style={{
          display: "flex",
          "flex-direction": "column",
          "min-height": "100vh",
          width: "100%",
          "background-color": "var(--color-background)",
          color: "var(--color-text)",
          "padding-top": "64px",
        }}
      >
        <Header />

        <main id="main-content" style={mainStyle}>
          {/* Enhanced header */}
          <section
            style={{ position: "relative", "margin-bottom": "40px" }}
            aria-labelledby="playground-heading"
          >
            {/* Background decoration */}
            <div style={{ ...glow, top: "-16px", left: "-16px", width: "96px", height: "96px", background: "var(--color-accent)", filter: "blur(40px)" }} />
            <div style={{ ...glow, top: "32px", right: "0", width: "128px", height: "128px", background: "var(--color-primary-500)", filter: "blur(64px)" }} />

            <div style={{ position: "relative" }}>
              <div
                style={{
                  display: "inline-flex",
                  "align-items": "center",
                  gap: "8px",
                  padding: "4px 12px",
                  "margin-bottom": "16px",
                  "border-radius": "999px",
                  background: "var(--color-accent-dim)",
                  border: "1px solid var(--color-accent)",
                }}
              >
                <span style={{ display: "inline-flex", width: "8px", height: "8px", "border-radius": "999px", background: "var(--color-accent)" }} />
                <span class={typeRoles.micro} style={{ color: "var(--color-accent)" }}>
                  Interactive Demo
                </span>
              </div>

              <PageHeading level={1} id="playground-heading" UNSAFE_style={{ "margin-bottom": "16px" }}>
                Component <span class="gradient-text-animated">Playground</span>
              </PageHeading>
              <Text styles={typeRoles.body} UNSAFE_style={{ display: "block", "max-width": "42rem" }}>
                Explore and interact with all 60+ components from the Proyecto Viviana UI library.
                Toggle sections, customize themes, and see everything in action.
              </Text>

              <div style={{ display: "flex", "align-items": "center", gap: "8px", "margin-top": "24px" }}>
                <span style={{ width: "8px", height: "8px", "border-radius": "999px", background: "var(--color-success)" }} />
                <Text styles={typeRoles.meta}>Last action: {lastAction()}</Text>
              </div>
            </div>
          </section>

          {/* Theme Creator */}
          <div style={panelSurface}>
            <div style={panelHeaderSurface}>
              <Flex alignItems="center" gap={3}>
                <div
                  style={{
                    display: "flex",
                    "align-items": "center",
                    "justify-content": "center",
                    width: "32px",
                    height: "32px",
                    "border-radius": "var(--radius-lg)",
                    background: "var(--color-accent)",
                    color: "var(--color-bg-100)",
                  }}
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                  >
                    <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.78-.07 2.58-.2.4-.07.74-.3.96-.63.22-.33.3-.74.21-1.13-.13-.56-.07-1.16.17-1.69.3-.67.94-1.15 1.68-1.26.12-.02.25-.03.37-.03.46 0 .91.14 1.29.41.54.39 1.21.53 1.85.39.54-.12 1-.5 1.23-1.03.22-.52.22-1.11-.01-1.62A10 10 0 0012 2z" />
                  </svg>
                </div>
                <div>
                  <PageHeading level={3}>Theme Creator</PageHeading>
                  <Text styles={typeRoles.meta}>Customize colors in real-time</Text>
                </div>
              </Flex>
            </div>
            <div style={{ padding: "16px" }}>
              <ThemeCreator onThemeChange={setThemeVars} />
            </div>
          </div>

          {/* Theme Preview Area */}
          {/* The creator's variables go on the INNER surface only. Applied to the whole
              panel they would also repaint its own background and heading, which is how the
              label ended up dark-on-dark; the frame stays on the page's palette so it
              remains readable whatever theme is being previewed. */}
          <div style={{ ...cardSurface, padding: "24px", "margin-bottom": "32px" }}>
            <PageHeading level={3} UNSAFE_style={{ "margin-bottom": "16px" }}>
              Theme Preview
            </PageHeading>
            <div
              style={{
                ...themeStyle(),
                padding: "16px",
                "border-radius": "var(--radius-lg)",
                background: "var(--color-background)",
              }}
            >
              <Flex wrap gap={3}>
                <Button>Primary</Button>
                <Button variant="secondary">Secondary</Button>
                <Button variant="accent">Accent</Button>
              </Flex>
            </div>
          </div>

          {/* Section Visibility Control Panel */}
          <SectionControlPanel
            visibleSections={visibleSections}
            setVisibleSections={setVisibleSections}
          />

          {/* The section grid was `grid gap-8 lg:grid-cols-2`, but neither `.gap-8` nor
              `.lg\:grid-cols-2` was ever copied into the frozen utility snapshot, so this
              rendered as one full-bleed column with no gutters. Grid's intrinsic column
              rule needs no breakpoint vocabulary and no stylesheet at all. */}
          <Grid columns="repeat(auto-fit, minmax(420px, 1fr))" gap={8} alignItems="start">
            <Section
              id="button"
              visibleSections={visibleSections}
              title="Button"
              description="Primary interactive element with variants and styles"
            >
              <Flex direction="column" gap={4}>
                <Flex wrap gap={3}>
                  <Button onPress={() => setCount((c) => c + 1)}>Count: {count()}</Button>
                  <Button variant="secondary" onPress={() => setLastAction("Secondary clicked!")}>
                    Secondary
                  </Button>
                  <Button variant="negative" onPress={() => setLastAction("Danger clicked!")}>
                    Danger
                  </Button>
                  <Button variant="accent" onPress={() => setLastAction("Accent clicked!")}>
                    Accent
                  </Button>
                  <Button isDisabled>Disabled</Button>
                </Flex>
                <Flex wrap gap={3}>
                  <Button fillStyle="outline" variant="primary">
                    Outline Primary
                  </Button>
                  <Button fillStyle="outline" variant="secondary">
                    Outline Secondary
                  </Button>
                  <Button fillStyle="outline" variant="negative">
                    Outline Danger
                  </Button>
                  <Button fillStyle="outline" variant="accent">
                    Outline Accent
                  </Button>
                </Flex>
              </Flex>
            </Section>

            <Section
              id="badge"
              visibleSections={visibleSections}
              title="Badge"
              description="Notification indicators and counts"
            >
              <Flex wrap alignItems="center" gap={4}>
                <Flex alignItems="center" gap={2}>
                  <Badge count={5} variant="primary" />
                  <Text styles={typeRoles.meta}>Primary</Text>
                </Flex>
                <Flex alignItems="center" gap={2}>
                  <Badge count={12} variant="accent" />
                  <Text styles={typeRoles.meta}>Accent</Text>
                </Flex>
                <Flex alignItems="center" gap={2}>
                  <Badge count={3} variant="success" />
                  <Text styles={typeRoles.meta}>Success</Text>
                </Flex>
                <Flex alignItems="center" gap={2}>
                  <Badge count={99} variant="warning" />
                  <Text styles={typeRoles.meta}>Warning</Text>
                </Flex>
                <Flex alignItems="center" gap={2}>
                  <Badge count={1} variant="danger" />
                  <Text styles={typeRoles.meta}>Danger</Text>
                </Flex>
              </Flex>
            </Section>

            <Section
              id="inlinealert"
              visibleSections={visibleSections}
              title="Inline Alert"
              description="Contextual in-context feedback (S2 InlineAlert)"
            >
              <Flex direction="column" gap={3}>
                <InlineAlert variant="informative">
                  <Heading>Information</Heading>
                  <Content>This is an informational message.</Content>
                </InlineAlert>
                <InlineAlert variant="positive">
                  <Heading>Success</Heading>
                  <Content>Operation completed successfully!</Content>
                </InlineAlert>
                <InlineAlert variant="notice">
                  <Heading>Warning</Heading>
                  <Content>Please review before continuing.</Content>
                </InlineAlert>
                <InlineAlert variant="negative" fillStyle="subtleFill">
                  <Heading>Error</Heading>
                  <Content>Something went wrong.</Content>
                </InlineAlert>
              </Flex>
            </Section>

            {/* Tooltip */}
            <Section
              id="tooltip"
              visibleSections={visibleSections}
              title="Tooltip"
              description="Contextual information on hover/focus"
            >
              <Flex direction="column" gap={6}>
                {/* Placement variants */}
                <div>
                  <Text styles={typeRoles.label} UNSAFE_style={{ display: "block", "margin-bottom": "12px" }}>Placements</Text>
                  <Flex wrap gap={4}>
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
                  </Flex>
                </div>
                {/* With arrow */}
                <div>
                  <Text styles={typeRoles.label} UNSAFE_style={{ display: "block", "margin-bottom": "12px" }}>With Arrow</Text>
                  <Flex wrap gap={4}>
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
                  </Flex>
                </div>
                {/* Delay */}
                <div>
                  <Text styles={typeRoles.label} UNSAFE_style={{ display: "block", "margin-bottom": "12px" }}>Custom Delay (500ms)</Text>
                  <TooltipTrigger delay={500}>
                    <Button variant="secondary" fillStyle="outline">
                      Delayed tooltip
                    </Button>
                    <Tooltip>This tooltip has a 500ms delay</Tooltip>
                  </TooltipTrigger>
                </div>
              </Flex>
            </Section>

            {/* Popover */}
            <Section
              id="popover"
              visibleSections={visibleSections}
              title="Popover"
              description="Positioned overlay content triggered by user action"
            >
              <Flex direction="column" gap={6}>
                {/* Basic placements */}
                <div>
                  <Text styles={typeRoles.label} UNSAFE_style={{ display: "block", "margin-bottom": "12px" }}>Placement Options</Text>
                  <Flex wrap gap={3}>
                    <PopoverTrigger>
                      <Button
                        variant="secondary"
                        fillStyle="outline"
                        data-testid="popover-bottom-trigger"
                      >
                        Bottom
                      </Button>
                      <Popover placement="bottom" data-testid="popover-bottom">
                        <PopoverHeader
                          title="Bottom Popover"
                          description="This popover opens below the trigger"
                        />
                        <Text styles={typeRoles.body}>Content positioned at the bottom.</Text>
                      </Popover>
                    </PopoverTrigger>
                    <PopoverTrigger>
                      <Button variant="secondary" fillStyle="outline">
                        Top
                      </Button>
                      <Popover placement="top">
                        <PopoverHeader title="Top Popover" />
                        <Text styles={typeRoles.body}>Content positioned at the top.</Text>
                      </Popover>
                    </PopoverTrigger>
                    <PopoverTrigger>
                      <Button variant="secondary" fillStyle="outline">
                        Left
                      </Button>
                      <Popover placement="left">
                        <PopoverHeader title="Left Popover" />
                        <Text styles={typeRoles.body}>Content on the left side.</Text>
                      </Popover>
                    </PopoverTrigger>
                    <PopoverTrigger>
                      <Button variant="secondary" fillStyle="outline">
                        Right
                      </Button>
                      <Popover placement="right">
                        <PopoverHeader title="Right Popover" />
                        <Text styles={typeRoles.body}>Content on the right side.</Text>
                      </Popover>
                    </PopoverTrigger>
                  </Flex>
                </div>
                {/* With footer actions */}
                <div>
                  <Text styles={typeRoles.label} UNSAFE_style={{ display: "block", "margin-bottom": "12px" }}>With Footer Actions</Text>
                  <PopoverTrigger>
                    <Button variant="primary" data-testid="popover-actions-trigger">
                      Open with Actions
                    </Button>
                    <Popover placement="bottom" size="M" data-testid="popover-actions">
                      <PopoverHeader
                        title="Confirm Action"
                        description="Are you sure you want to proceed with this action?"
                      />
                      <PopoverFooter>
                        <Button variant="secondary" fillStyle="outline" size="S">
                          Cancel
                        </Button>
                        <Button variant="primary" size="S">
                          Confirm
                        </Button>
                      </PopoverFooter>
                    </Popover>
                  </PopoverTrigger>
                </div>
                {/* Size variants */}
                <div>
                  <Text styles={typeRoles.label} UNSAFE_style={{ display: "block", "margin-bottom": "12px" }}>Size Variants</Text>
                  <Flex wrap gap={3}>
                    <PopoverTrigger>
                      <Button variant="secondary" fillStyle="outline">
                        Small
                      </Button>
                      <Popover placement="bottom" size="S">
                        <Text styles={typeRoles.body}>Small popover content.</Text>
                      </Popover>
                    </PopoverTrigger>
                    <PopoverTrigger>
                      <Button variant="secondary" fillStyle="outline">
                        Medium
                      </Button>
                      <Popover placement="bottom" size="M">
                        <Text styles={typeRoles.body}>Medium popover content with more room for details.</Text>
                      </Popover>
                    </PopoverTrigger>
                    <PopoverTrigger>
                      <Button variant="secondary" fillStyle="outline">
                        Large
                      </Button>
                      <Popover placement="bottom" size="L">
                        <Text styles={typeRoles.body}>
                          Large popover content with maximum width for longer content sections.
                        </Text>
                      </Popover>
                    </PopoverTrigger>
                  </Flex>
                </div>
              </Flex>
            </Section>

            <Section
              id="avatar"
              visibleSections={visibleSections}
              title="Avatar"
              description="User profile images with status"
            >
              <Flex direction="column" gap={4}>
                <Flex alignItems="center" gap={4}>
                  <Avatar size="xs" alt="XS" />
                  <Avatar size="sm" alt="SM" />
                  <Avatar size="md" alt="MD" online />
                  <Avatar size="lg" alt="LG" online={false} />
                  <Avatar size="xl" alt="XL" fallback="VV" />
                </Flex>
                <Flex alignItems="center" gap={2}>
                  <Text styles={typeRoles.meta}>Avatar Group:</Text>
                  <AvatarGroup>
                    <Avatar size="sm" alt="User 1" />
                    <Avatar size="sm" alt="User 2" />
                    <Avatar size="sm" alt="User 3" />
                  </AvatarGroup>
                </Flex>
              </Flex>
            </Section>

            <Section
              id="switch"
              visibleSections={visibleSections}
              title="Switch"
              description="Toggle and tab switch controls"
            >
              <Flex direction="column" gap={4}>
                <Flex alignItems="center" gap={4}>
                  <Text styles={typeRoles.body}>Toggle:</Text>
                  <ToggleSwitch
                    aria-label="Toggle demo switch"
                    isSelected={toggleOn()}
                    onChange={setToggleOn}
                  />
                  <Text styles={typeRoles.meta}>{toggleOn() ? "On" : "Off"}</Text>
                </Flex>
                <div>
                  <span class={typeRoles.label} style={{ display: "block", "margin-bottom": "8px" }}>Tab Switch:</span>
                  <TabSwitch
                    options={[
                      { label: "TRENDING", value: "trending" },
                      { label: "LATEST", value: "latest" },
                    ]}
                    value={switchValue()}
                    onChange={setSwitchValue}
                  />
                  <Text styles={typeRoles.meta} UNSAFE_style={{ display: "block", "margin-top": "8px" }}>Selected: {switchValue()}</Text>
                </div>
              </Flex>
            </Section>

            <Section
              id="checkbox"
              visibleSections={visibleSections}
              title="Checkbox"
              description="Toggle selection with accessible checkbox"
            >
              <Flex direction="column" gap={4}>
                <Flex direction="column" gap={3}>
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
                </Flex>
                <div style={{ display: "flex", "align-items": "center", gap: "16px", "padding-top": "8px" }}>
                  <Text styles={typeRoles.meta}>Sizes:</Text>
                  <Checkbox size="sm" aria-label="Small checkbox" />
                  <Checkbox size="md" aria-label="Medium checkbox" />
                  <Checkbox size="lg" aria-label="Large checkbox" />
                </div>
              </Flex>
            </Section>

            <Section
              id="textfield"
              visibleSections={visibleSections}
              title="TextField"
              description="Text input with label, description, and validation"
            >
              <Flex direction="column" gap={4}>
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
                <Flex gap={4}>
                  <TextField label="Small" size="sm" placeholder="Small input" />
                  <TextField label="Large" size="lg" placeholder="Large input" />
                </Flex>
                <TextField label="Disabled" value="Can't edit this" isDisabled />
                <TextField
                  label="Filled variant"
                  variant="filled"
                  placeholder="With filled style"
                />
              </Flex>
            </Section>

            <Section
              id="link"
              visibleSections={visibleSections}
              title="Link"
              description="Accessible link with hover and press states"
            >
              <Flex direction="column" gap={4}>
                <Flex wrap gap={4}>
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
                </Flex>
                <Flex wrap gap={4}>
                  <Link href="https://example.com" aria-current="page">
                    Current Page Link
                  </Link>
                </Flex>
                <Text styles={typeRoles.meta}>
                  Links support keyboard navigation (Enter key), hover states, and press feedback.
                </Text>
              </Flex>
            </Section>

            <Section
              id="progressbar"
              visibleSections={visibleSections}
              title="ProgressBar"
              description="Shows progress of an operation over time"
            >
              <Flex direction="column" gap={6}>
                <Flex direction="column" gap={4}>
                  <ProgressBar value={25} label="Uploading..." />
                  <ProgressBar value={50} label="Processing" />
                  <ProgressBar value={75} label="Almost done" />
                  <ProgressBar value={100} label="Complete" />
                </Flex>
                <Flex direction="column" gap={4}>
                  <span class={typeRoles.label} style={{ display: "block" }}>Indeterminate:</span>
                  <ProgressBar isIndeterminate label="Loading..." />
                </Flex>
                <Flex direction="column" gap={4}>
                  <span class={typeRoles.label} style={{ display: "block" }}>Sizes:</span>
                  <ProgressBar value={60} size="S" label="Small" />
                  <ProgressBar value={60} size="M" label="Medium" />
                  <ProgressBar value={60} size="L" label="Large" />
                  <ProgressBar value={60} size="XL" label="Extra large" />
                </Flex>
                <Flex direction="column" gap={4}>
                  <span class={typeRoles.label} style={{ display: "block" }}>Label position:</span>
                  <ProgressBar value={40} label="Top label" labelPosition="top" />
                  <ProgressBar value={40} label="Side label" labelPosition="side" />
                </Flex>
                <div>
                  <span class={typeRoles.label} style={{ display: "block", "margin-bottom": "8px" }}>Custom value label:</span>
                  <ProgressBar
                    value={2}
                    minValue={0}
                    maxValue={5}
                    valueLabel="Step 2 of 5"
                    label="Setup Progress"
                  />
                </div>
                <Grid columns="repeat(auto-fit, minmax(220px, 1fr))" gap={3}>
                  <div style={{ background: "#0f172a", padding: "16px", "border-radius": "var(--radius-md)" }}>
                    <ProgressBar value={56} label="Static white" staticColor="white" />
                  </div>
                  <div style={{ background: "#f1f5f9", padding: "16px", "border-radius": "var(--radius-md)" }}>
                    <ProgressBar value={56} label="Static black" staticColor="black" />
                  </div>
                </Grid>
              </Flex>
            </Section>

            <Section
              id="separator"
              visibleSections={visibleSections}
              title="Separator"
              description="Visual divider between groups of content"
            >
              <Flex direction="column" gap={6}>
                <Flex direction="column" gap={4}>
                  <span class={typeRoles.label} style={{ display: "block" }}>Horizontal (default):</span>
                  <Separator />
                  <Text styles={typeRoles.meta}>Content above and below the separator.</Text>
                </Flex>
                <div>
                  <span class={typeRoles.label} style={{ display: "block", "margin-bottom": "8px" }}>Vertical:</span>
                  <div style={{ display: "flex", "align-items": "center", gap: "16px", height: "32px" }}>
                    <Text styles={typeRoles.body}>Item 1</Text>
                    <Separator orientation="vertical" />
                    <Text styles={typeRoles.body}>Item 2</Text>
                    <Separator orientation="vertical" />
                    <Text styles={typeRoles.body}>Item 3</Text>
                  </div>
                </div>
                <Flex direction="column" gap={4}>
                  <span class={typeRoles.label} style={{ display: "block" }}>Sizes:</span>
                  <Flex direction="column" gap={2}>
                    <Flex alignItems="center" gap={2}>
                      <Text styles={typeRoles.meta} UNSAFE_style={{ "min-width": "32px" }}>sm:</Text>
                      <div style={{ flex: 1 }}>
                        <Separator size="sm" />
                      </div>
                    </Flex>
                    <Flex alignItems="center" gap={2}>
                      <Text styles={typeRoles.meta} UNSAFE_style={{ "min-width": "32px" }}>md:</Text>
                      <div style={{ flex: 1 }}>
                        <Separator size="md" />
                      </div>
                    </Flex>
                    <Flex alignItems="center" gap={2}>
                      <Text styles={typeRoles.meta} UNSAFE_style={{ "min-width": "32px" }}>lg:</Text>
                      <div style={{ flex: 1 }}>
                        <Separator size="lg" />
                      </div>
                    </Flex>
                  </Flex>
                </Flex>
                <Flex direction="column" gap={4}>
                  <span class={typeRoles.label} style={{ display: "block" }}>Variants:</span>
                  <Flex direction="column" gap={2}>
                    <Flex alignItems="center" gap={2}>
                      <Text styles={typeRoles.meta} UNSAFE_style={{ "min-width": "64px" }}>default:</Text>
                      <div style={{ flex: 1 }}>
                        <Separator variant="default" />
                      </div>
                    </Flex>
                    <Flex alignItems="center" gap={2}>
                      <Text styles={typeRoles.meta} UNSAFE_style={{ "min-width": "64px" }}>subtle:</Text>
                      <div style={{ flex: 1 }}>
                        <Separator variant="subtle" />
                      </div>
                    </Flex>
                    <Flex alignItems="center" gap={2}>
                      <Text styles={typeRoles.meta} UNSAFE_style={{ "min-width": "64px" }}>strong:</Text>
                      <div style={{ flex: 1 }}>
                        <Separator variant="strong" />
                      </div>
                    </Flex>
                  </Flex>
                </Flex>
              </Flex>
            </Section>

            {/* RadioGroup temporarily disabled - styled Radio component needs SSR-compatible redesign */}
            {/*
          <Section id="radiogroup" visibleSections={visibleSections} title="RadioGroup" description="Single selection from multiple options">
            <Flex direction="column" gap={6}>
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

              <div style={{ "border-top": "1px solid var(--border-subtle)", "padding-top": "16px" }}>
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

              <div style={{ "border-top": "1px solid var(--border-subtle)", "padding-top": "16px" }}>
                <span class={typeRoles.label} style={{ display: "block", "margin-bottom": "8px" }}>Sizes:</span>
                <Flex gap={8}>
                  <RadioGroup aria-label="Small size" size="sm" defaultValue="a">
                    <Radio value="a">Small</Radio>
                  </RadioGroup>
                  <RadioGroup aria-label="Medium size" size="md" defaultValue="a">
                    <Radio value="a">Medium</Radio>
                  </RadioGroup>
                  <RadioGroup aria-label="Large size" size="lg" defaultValue="a">
                    <Radio value="a">Large</Radio>
                  </RadioGroup>
                </Flex>
              </div>

              <div style={{ "border-top": "1px solid var(--border-subtle)", "padding-top": "16px" }}>
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
            </Flex>
          </Section>
          */}

            <Section
              id="dialog"
              visibleSections={visibleSections}
              title="Dialog"
              description="Modal dialog with overlay and backdrop"
              wide
            >
              <Flex gap={4}>
                <DialogTrigger
                  trigger={<Button variant="primary">Open Dialog</Button>}
                  content={(close) => (
                    <Dialog title="Welcome!" size="md" isDismissable={true} onClose={close}>
                      <p style={{ "margin-bottom": "16px" }}>
                        Welcome to Proyecto Viviana! A collection of accessible, beautifully styled
                        SolidJS components inspired by React Spectrum.
                      </p>
                      <DialogFooter>
                        <Button variant="primary" fillStyle="outline" onPress={close}>
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
                      <p style={{ "margin-bottom": "16px" }}>Are you sure you want to continue?</p>
                      <DialogFooter>
                        <Button variant="primary" fillStyle="outline" onPress={close}>
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
                      <Flex direction="column" gap={4}>
                        <p>Configure your application settings below.</p>
                        <TextField label="Username" placeholder="Enter username" />
                        <TextField label="Email" placeholder="Enter email" type="email" />
                      </Flex>
                      <DialogFooter>
                        <Button variant="primary" fillStyle="outline" onPress={close}>
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
              </Flex>
            </Section>

            <Section
              id="createbutton-hook"
              visibleSections={visibleSections}
              title="createButton Hook"
              description="Low-level hook for custom implementations"
              wide
            >
              <Flex wrap gap={4}>
                <CustomGradientButton onPress={() => setLastAction("Gradient button pressed!")}>
                  Custom Gradient Button
                </CustomGradientButton>
                <CustomOutlineButton onPress={() => setLastAction("Outline button pressed!")}>
                  Custom Outline Button
                </CustomOutlineButton>
              </Flex>
            </Section>

            <Show when={hasVisibleAdvancedSections()}>
              <Suspense
                fallback={
                  <div
                    class={typeRoles.meta}
                    style={{ "grid-column": "1 / -1", padding: "16px", background: "var(--color-bg-300)", border: "1px solid var(--border-subtle)", "border-radius": "var(--radius-xl)" }}
                  >
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
          </Grid>
        </main>
        <ToastContainer placement="bottom end" />
      </div>
    </ToastProvider>
  );
}

// The two demos below exist to show `createButton` driving a button the library does
// not ship, so they own their paint. Everything they use is a design token, not a
// utility class.
const customButton = {
  padding: "12px 24px",
  "border-radius": "var(--radius-lg)",
  cursor: "pointer",
  transition: "background-color 150ms ease, transform 150ms ease",
} as const;

function CustomGradientButton(props: { onPress?: () => void; children: string }) {
  const { buttonProps, isPressed } = createButton({
    onPress: props.onPress,
  });

  return (
    <button
      {...buttonProps}
      class={typeRoles.label}
      style={{
        ...customButton,
        border: "none",
        background: "linear-gradient(90deg, var(--color-primary-500), var(--color-accent))",
        color: "var(--color-grey-900)",
        transform: isPressed() ? "scale(0.98)" : "none",
      }}
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
      class={typeRoles.label}
      style={{
        ...customButton,
        border: "2px solid var(--color-primary-500)",
        background: isPressed() ? "var(--color-primary-700)" : "transparent",
        color: "var(--color-text)",
        transform: isPressed() ? "scale(0.98)" : "none",
      }}
    >
      {props.children}
    </button>
  );
}
