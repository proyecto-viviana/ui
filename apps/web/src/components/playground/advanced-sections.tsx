import { type Accessor, createSignal, For, JSX, Show, Suspense, lazy } from "solid-js";
import {
  Button,
  Meter,
  TagGroup,
  Disclosure,
  DisclosureGroup,
  DisclosureTrigger,
  DisclosurePanel,
  DatePicker,
  Calendar,
  RangeCalendar,
  DateField,
  TimeField,
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
  addToast,
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
  Tabs as StyledTabs,
  TabList as StyledTabList,
  Tab as StyledTab,
  TabPanel as StyledTabPanel,
  Breadcrumbs as StyledBreadcrumbs,
  BreadcrumbItem as StyledBreadcrumbItem,
  NumberField as StyledNumberField,
  SearchField as StyledSearchField,
  Slider as StyledSlider,
  ActionGroup as StyledActionGroup,
  Toolbar as StyledToolbar,
  ActionBar as StyledActionBar,
  ActionBarContainer as StyledActionBarContainer,
  ComboBox as StyledComboBox,
  ComboBoxOption as StyledComboBoxOption,
  defaultContainsFilter,
  TextArea,
  AlertDialog,
  ActionMenu,
  RangeSlider,
  ContextualHelpTrigger,
  DropZone,
  FileTrigger,
  Provider,
  useTheme,
  TextField,
} from "@proyecto-viviana/solid-spectrum";
// Page chrome — layout, type, and surfaces — comes from the app-facing design system.
// Flex/Grid mirror the solid-spectrum copies apart from this package's added `style`
// pass-through, so the sections below that demo them still demo the same layout.
import { ActionButton, Flex, Grid, Heading, Text, Well, typeRoles } from "@proyecto-viviana/ui";
import {
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
  DropZone as HeadlessDropZone,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  GridList,
  GridListItem,
  Tree,
  TreeItem,
  TreeExpandButton,
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
import { Section, type SectionId } from "@/components/playground/sections";

export interface PlaygroundAdvancedSectionsProps {
  visibleSections: Accessor<Set<SectionId>>;
  onLastAction: (value: string) => void;
}

const DATA_COLOR_SECTION_IDS: SectionId[] = [
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
  "daterangepicker",
  "colorswatchpicker",
  "coloreditor",
];

const PlaygroundDataColorSections = lazy(() =>
  import("@/components/playground/advanced-data-color-sections").then((module) => ({
    default: module.PlaygroundDataColorSections,
  })),
);

export function PlaygroundAdvancedSections(props: PlaygroundAdvancedSectionsProps) {
  const hasVisibleDataColorSections = () =>
    DATA_COLOR_SECTION_IDS.some((id) => props.visibleSections().has(id));

  return (
    <>
      <Section
        id="createcheckboxgroup-hook"
        visibleSections={props.visibleSections}
        title="createCheckboxGroup Hook"
        description="Accessible checkbox group with ARIA support"
        wide
      >
        <CheckboxGroupDemo
          onSelectionChange={(values) =>
            props.onLastAction(`Selected: ${values.join(", ") || "none"}`)
          }
        />
      </Section>

      <Section
        id="listbox"
        visibleSections={props.visibleSections}
        title="ListBox"
        description="Accessible list with keyboard navigation and selection"
      >
        <ListBoxDemo onSelectionChange={(key) => props.onLastAction(`ListBox selected: ${key}`)} />
      </Section>

      <Section
        id="menu"
        visibleSections={props.visibleSections}
        title="Menu"
        description="Dropdown menu with keyboard navigation"
      >
        <MenuDemo onAction={(action) => props.onLastAction(`Menu action: ${action}`)} />
      </Section>

      {/* Select (headless) works fine */}
      <Section
        id="select"
        visibleSections={props.visibleSections}
        title="Select"
        description="Accessible dropdown select with keyboard support"
        wide
      >
        <SelectDemo onSelectionChange={(key) => props.onLastAction(`Select changed: ${key}`)} />
      </Section>

      {/* TESTING: Styled Select re-enabled after fixing inline arrow functions */}
      <Section
        id="styled-select"
        visibleSections={props.visibleSections}
        title="Styled Select (ui)"
        description="Pre-styled select with size variants"
      >
        <StyledSelectDemo
          onSelectionChange={(key) => props.onLastAction(`Styled Select: ${key}`)}
        />
      </Section>

      <Section
        id="styled-menu"
        visibleSections={props.visibleSections}
        title="Styled Menu (ui)"
        description="Pre-styled dropdown menu with variants"
      >
        <StyledMenuDemo onAction={(action) => props.onLastAction(`Styled Menu: ${action}`)} />
      </Section>

      <Section
        id="styled-listbox"
        visibleSections={props.visibleSections}
        title="Styled ListBox (ui)"
        description="Pre-styled list with selection"
        wide
      >
        <StyledListBoxDemo
          onSelectionChange={(key) => props.onLastAction(`Styled ListBox: ${key}`)}
        />
      </Section>

      <Section
        id="styled-tabs"
        visibleSections={props.visibleSections}
        title="Styled Tabs (ui)"
        description="Pre-styled tabs with variants"
        wide
      >
        <StyledTabsDemo onSelectionChange={(key) => props.onLastAction(`Styled Tab: ${key}`)} />
      </Section>

      <Section
        id="styled-breadcrumbs"
        visibleSections={props.visibleSections}
        title="Styled Breadcrumbs (ui)"
        description="Pre-styled navigation breadcrumbs"
        wide
      >
        <StyledBreadcrumbsDemo onNavigate={(path) => props.onLastAction(`Navigate: ${path}`)} />
      </Section>

      <Section
        id="styled-numberfield"
        visibleSections={props.visibleSections}
        title="Styled NumberField (ui)"
        description="Number input with increment/decrement buttons"
        wide
      >
        <StyledNumberFieldDemo onChange={(value) => props.onLastAction(`NumberField: ${value}`)} />
      </Section>

      <Section
        id="styled-searchfield"
        visibleSections={props.visibleSections}
        title="Styled SearchField (ui)"
        description="Search input with clear button"
        wide
      >
        <StyledSearchFieldDemo onSearch={(value) => props.onLastAction(`Search: ${value}`)} />
      </Section>

      <Section
        id="styled-slider"
        visibleSections={props.visibleSections}
        title="Styled Slider (ui)"
        description="Range input with draggable thumb"
        wide
      >
        <StyledSliderDemo onChange={(value) => props.onLastAction(`Slider: ${value}`)} />
      </Section>

      <Section
        id="styled-combobox"
        visibleSections={props.visibleSections}
        title="Styled ComboBox (ui)"
        description="Filterable dropdown with text input"
        wide
      >
        <StyledComboBoxDemo onSelectionChange={(key) => props.onLastAction(`ComboBox: ${key}`)} />
      </Section>

      <Section
        id="actiongroup"
        visibleSections={props.visibleSections}
        title="ActionGroup (ui)"
        description="Toolbar-like action cluster with optional selection modes"
        wide
      >
        <ActionGroupDemo onLastAction={props.onLastAction} />
      </Section>

      <Section
        id="toolbar"
        visibleSections={props.visibleSections}
        title="Toolbar (ui)"
        description="Keyboard-navigable toolbar with orientation variants"
        wide
      >
        <ToolbarDemo onLastAction={props.onLastAction} />
      </Section>

      <Section
        id="actionbar"
        visibleSections={props.visibleSections}
        title="ActionBar (ui)"
        description="Selection-aware bulk actions with escape-to-clear support"
        wide
      >
        <ActionBarDemo onLastAction={props.onLastAction} />
      </Section>

      {/* Disclosure Section */}
      <Section
        id="disclosure"
        visibleSections={props.visibleSections}
        title="Disclosure"
        description="Expandable/collapsible content panels"
        wide
      >
        <Flex direction="column" gap={6}>
          {/* Headless Disclosure */}
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Headless Disclosure
            </Heading>
            <HeadlessDisclosure>
              <HeadlessDisclosureTrigger
                style={{
                  width: "100%",
                  "text-align": "left",
                  padding: "12px",
                  background: "var(--color-bg-400)",
                  "border-radius": "var(--radius-md)",
                }}
              >
                Headless Toggle
              </HeadlessDisclosureTrigger>
              <HeadlessDisclosurePanel
                style={{
                  padding: "12px",
                  "margin-top": "4px",
                  background: "var(--color-bg-300)",
                  "border-radius": "var(--radius-md)",
                }}
              >
                This is a headless disclosure panel built from primitives.
              </HeadlessDisclosurePanel>
            </HeadlessDisclosure>
          </div>

          {/* Single Disclosure */}
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Single Disclosure (Styled)
            </Heading>
            <Disclosure variant="bordered">
              <DisclosureTrigger>What is a Disclosure?</DisclosureTrigger>
              <DisclosurePanel>
                A disclosure is a widget that can be toggled to show or hide content. It's useful
                for FAQs, collapsible sections, and progressive disclosure patterns.
              </DisclosurePanel>
            </Disclosure>
          </div>

          {/* Accordion (DisclosureGroup) */}
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Accordion (Single Expand)
            </Heading>
            <DisclosureGroup variant="bordered">
              <Disclosure id="section-1">
                <DisclosureTrigger>Section 1: Introduction</DisclosureTrigger>
                <DisclosurePanel>
                  This is the content for section 1. Only one section can be expanded at a time in
                  this accordion mode.
                </DisclosurePanel>
              </Disclosure>
              <Disclosure id="section-2">
                <DisclosureTrigger>Section 2: Features</DisclosureTrigger>
                <DisclosurePanel>
                  This is the content for section 2. When you expand this, section 1 will collapse
                  automatically.
                </DisclosurePanel>
              </Disclosure>
              <Disclosure id="section-3">
                <DisclosureTrigger>Section 3: Conclusion</DisclosureTrigger>
                <DisclosurePanel>
                  This is the content for section 3. The accordion pattern is great for FAQs and
                  settings pages.
                </DisclosurePanel>
              </Disclosure>
            </DisclosureGroup>
          </div>

          {/* Multiple Expand Accordion */}
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Accordion (Multiple Expand)
            </Heading>
            <DisclosureGroup allowsMultipleExpanded variant="filled">
              <Disclosure id="multi-1">
                <DisclosureTrigger>Panel A</DisclosureTrigger>
                <DisclosurePanel>Multiple panels can be open at once in this mode.</DisclosurePanel>
              </Disclosure>
              <Disclosure id="multi-2">
                <DisclosureTrigger>Panel B</DisclosureTrigger>
                <DisclosurePanel>Try opening both panels!</DisclosurePanel>
              </Disclosure>
            </DisclosureGroup>
          </div>

          {/* Variants */}
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Variants
            </Heading>
            <Grid columns="repeat(auto-fit, minmax(260px, 1fr))" gap={4}>
              <Disclosure variant="default">
                <DisclosureTrigger>Default Variant</DisclosureTrigger>
                <DisclosurePanel>Simple border-bottom style.</DisclosurePanel>
              </Disclosure>
              <Disclosure variant="bordered">
                <DisclosureTrigger>Bordered Variant</DisclosureTrigger>
                <DisclosurePanel>Full border with rounded corners.</DisclosurePanel>
              </Disclosure>
              <Disclosure variant="filled">
                <DisclosureTrigger>Filled Variant</DisclosureTrigger>
                <DisclosurePanel>Background fill style.</DisclosurePanel>
              </Disclosure>
              <Disclosure variant="ghost">
                <DisclosureTrigger>Ghost Variant</DisclosureTrigger>
                <DisclosurePanel>Minimal style with hover effects.</DisclosurePanel>
              </Disclosure>
            </Grid>
          </div>
        </Flex>
      </Section>

      {/* Meter Section */}
      <Section
        id="meter"
        visibleSections={props.visibleSections}
        title="Meter"
        description="Display a quantity within a known range"
      >
        <Flex direction="column" gap={6}>
          {/* Sizes */}
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Sizes
            </Heading>
            <Flex direction="column" gap={3}>
              <Meter label="Storage Used" value={75} />
              <Meter label="Memory" value={45} size="S" />
              <Meter label="CPU" value={90} size="L" />
            </Flex>
          </div>

          {/* Color variants */}
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Color Variants
            </Heading>
            <Flex direction="column" gap={3}>
              <Meter label="Positive" value={30} variant="positive" />
              <Meter label="Notice" value={65} variant="notice" />
              <Meter label="Negative" value={85} variant="negative" />
              <Meter label="Informative" value={50} variant="informative" />
            </Flex>
          </div>

          {/* Without label */}
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Without Label
            </Heading>
            <Meter value={60} aria-label="Progress" />
          </div>
        </Flex>
      </Section>

      {/* TagGroup Section */}
      <Section
        id="taggroup"
        visibleSections={props.visibleSections}
        title="TagGroup"
        description="Selectable and removable tag collections"
      >
        <Flex direction="column" gap={6}>
          {/* Basic removable tags */}
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Removable Tags
            </Heading>
            <TagGroupDemo />
          </div>

          {/* Selection */}
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Selectable Tags
            </Heading>
            <TagGroupSelectionDemo />
          </div>

          {/* Variants */}
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Tag Variants
            </Heading>
            <Flex direction="column" gap={4}>
              <TagGroup
                items={[
                  { id: "1", name: "Default" },
                  { id: "2", name: "Style" },
                ]}
                variant="default"
                size="md"
              >
                {(item) => item.name}
              </TagGroup>
              <TagGroup
                items={[
                  { id: "1", name: "Outline" },
                  { id: "2", name: "Style" },
                ]}
                variant="outline"
                size="md"
              >
                {(item) => item.name}
              </TagGroup>
              <TagGroup
                items={[
                  { id: "1", name: "Solid" },
                  { id: "2", name: "Style" },
                ]}
                variant="solid"
                size="md"
              >
                {(item) => item.name}
              </TagGroup>
            </Flex>
          </div>

          {/* Sizes */}
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Tag Sizes
            </Heading>
            <Flex direction="column" gap={4}>
              <TagGroup
                items={[
                  { id: "1", name: "Small" },
                  { id: "2", name: "Tags" },
                ]}
                size="sm"
              >
                {(item) => item.name}
              </TagGroup>
              <TagGroup
                items={[
                  { id: "1", name: "Medium" },
                  { id: "2", name: "Tags" },
                ]}
                size="md"
              >
                {(item) => item.name}
              </TagGroup>
              <TagGroup
                items={[
                  { id: "1", name: "Large" },
                  { id: "2", name: "Tags" },
                ]}
                size="lg"
              >
                {(item) => item.name}
              </TagGroup>
            </Flex>
          </div>
        </Flex>
      </Section>

      {/* Calendar Section */}
      <Section
        id="calendar"
        visibleSections={props.visibleSections}
        title="Calendar"
        description="Date selection calendars with navigation"
      >
        <CalendarDemo />
      </Section>

      {/* DatePicker Section */}
      <Section
        id="datepicker"
        visibleSections={props.visibleSections}
        title="DatePicker"
        description="Date field with calendar popup"
      >
        <DatePickerDemo />
      </Section>

      {/* Toast Section */}
      <Section
        id="toast"
        visibleSections={props.visibleSections}
        title="Toast"
        description="Toast notifications with auto-dismiss and variants"
        wide
      >
        <Flex direction="column" gap={4}>
          <Text styles={typeRoles.body}>Click buttons to show toast notifications</Text>
          <Flex wrap gap={3}>
            <Button variant="primary" onPress={() => toastSuccess("Changes saved successfully!")}>
              Success Toast
            </Button>
            <Button
              variant="negative"
              onPress={() => toastError("Something went wrong. Please try again.")}
            >
              Error Toast
            </Button>
            <Button
              variant="secondary"
              onPress={() => toastWarning("Your session will expire in 5 minutes.")}
            >
              Warning Toast
            </Button>
            <Button
              variant="secondary"
              fillStyle="outline"
              onPress={() => toastInfo("New features are available!")}
            >
              Info Toast
            </Button>
          </Flex>
          <Flex wrap gap={3}>
            <Button
              variant="secondary"
              fillStyle="outline"
              onPress={() =>
                addToast(
                  {
                    title: "Custom Toast",
                    description: "This toast has both title and description with a longer timeout.",
                    type: "info",
                  },
                  { timeout: 10000 },
                )
              }
            >
              With Description
            </Button>
            <Button
              variant="secondary"
              fillStyle="outline"
              onPress={() =>
                addToast(
                  {
                    title: "Action Required",
                    description: "Click the button below to take action.",
                    type: "warning",
                    action: {
                      label: "Take Action",
                      onAction: () => props.onLastAction("Toast action clicked!"),
                    },
                  },
                  { timeout: 15000 },
                )
              }
            >
              With Action
            </Button>
          </Flex>
        </Flex>
      </Section>

      {/* DropZone Section */}
      <Section
        id="dropzone"
        visibleSections={props.visibleSections}
        title="DropZone"
        description="Drag and drop target for files"
        wide
      >
        <Flex direction="column" gap={4}>
          <DropZone
            data-testid="dropzone-active"
            aria-label="Upload files drop zone"
            onDrop={() => props.onLastAction("DropZone: drop event")}
            UNSAFE_style={{
              "min-height": "120px",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
            }}
          >
            <div style={{ "text-align": "center" }}>
              <Text styles={typeRoles.label}>Drop files here</Text>
              <Text styles={typeRoles.meta}>or drag items over this area</Text>
            </div>
          </DropZone>
          {/* S2 DropZone has no isDisabled (upstream drops it); demo the disabled
              state on the headless layer instead. */}
          <HeadlessDropZone
            data-testid="dropzone-disabled"
            aria-label="Disabled drop zone"
            isDisabled
            style={{
              "min-height": "80px",
              display: "flex",
              "align-items": "center",
              "justify-content": "center",
            }}
          >
            <Text styles={typeRoles.meta}>Disabled drop zone</Text>
          </HeadlessDropZone>
        </Flex>
      </Section>

      {/* FileTrigger Section */}
      <Section
        id="filetrigger"
        visibleSections={props.visibleSections}
        title="FileTrigger"
        description="Open native file picker from custom trigger"
        wide
      >
        <Flex direction="column" gap={4}>
          <FileTrigger
            acceptedFileTypes={["image/png", "image/jpeg"]}
            onSelect={(files) => {
              const first = files?.[0];
              props.onLastAction(
                first ? `File selected: ${first.name}` : "File selection canceled",
              );
            }}
          >
            <Button variant="primary">Choose file</Button>
          </FileTrigger>
          <FileTrigger disabled>
            <Button variant="secondary" fillStyle="outline">
              Disabled picker
            </Button>
          </FileTrigger>
        </Flex>
      </Section>

      {/* ============================================ */}
      {/* TEXTAREA */}
      {/* ============================================ */}
      <Section
        id="textarea"
        visibleSections={props.visibleSections}
        title="TextArea"
        description="Multi-line text input with auto-resize"
        wide
      >
        <Flex direction="column" gap={6}>
          <Grid columns="repeat(auto-fit, minmax(240px, 1fr))" gap={6}>
            <TextArea
              label="Description"
              placeholder="Enter a description..."
              description="Tell us about yourself"
            />
            <TextArea
              label="With Validation"
              placeholder="Required field..."
              isRequired
              isInvalid
              errorMessage="This field is required"
            />
          </Grid>
          <Grid columns="repeat(auto-fit, minmax(180px, 1fr))" gap={6}>
            <TextArea label="Small" size="sm" placeholder="Small..." />
            <TextArea label="Medium" size="md" placeholder="Medium..." />
            <TextArea label="Large" size="lg" placeholder="Large..." />
          </Grid>
          <TextArea label="Disabled" value="Cannot edit this" isDisabled />
        </Flex>
      </Section>

      {/* ============================================ */}
      {/* ALERT DIALOG */}
      {/* ============================================ */}
      <Section
        id="alertdialog"
        visibleSections={props.visibleSections}
        title="Alert Dialog"
        description="Confirmation dialog requiring user action"
      >
        <Flex direction="column" gap={4}>
          <AlertDialog
            title="Delete Item"
            variant="destructive"
            primaryActionLabel="Delete"
            cancelLabel="Cancel"
            onPrimaryAction={() => props.onLastAction("AlertDialog: deleted")}
            onCancel={() => props.onLastAction("AlertDialog: cancelled")}
            trigger={<Button variant="negative">Delete Item</Button>}
          >
            Are you sure you want to delete this item? This action cannot be undone.
          </AlertDialog>
          <AlertDialog
            title="Save Changes"
            variant="confirmation"
            primaryActionLabel="Save"
            cancelLabel="Discard"
            onPrimaryAction={() => props.onLastAction("AlertDialog: saved")}
            onCancel={() => props.onLastAction("AlertDialog: discarded")}
            trigger={<Button variant="primary">Save Changes</Button>}
          >
            You have unsaved changes. Would you like to save them before leaving?
          </AlertDialog>
        </Flex>
      </Section>

      {/* ============================================ */}
      {/* ACTION MENU */}
      {/* ============================================ */}
      <Section
        id="actionmenu"
        visibleSections={props.visibleSections}
        title="Action Menu"
        description="Simplified menu trigger with action items"
      >
        <Flex wrap gap={4}>
          <ActionMenu
            label="Actions"
            onAction={(key) => props.onLastAction(`ActionMenu: ${key}`)}
            items={[
              { id: "edit", label: "Edit" },
              { id: "duplicate", label: "Duplicate" },
              { id: "archive", label: "Archive" },
              { id: "delete", label: "Delete" },
            ]}
          />
          <ActionMenu
            label="More Options"
            onAction={(key) => props.onLastAction(`ActionMenu: ${key}`)}
            items={[
              { id: "settings", label: "Settings" },
              { id: "help", label: "Help" },
              { id: "about", label: "About" },
            ]}
          />
        </Flex>
      </Section>

      {/* ============================================ */}
      {/* RANGE SLIDER */}
      {/* ============================================ */}
      <Section
        id="rangeslider"
        visibleSections={props.visibleSections}
        title="Range Slider"
        description="Dual-thumb slider for selecting a range"
        wide
      >
        <RangeSliderDemo onChange={(start, end) => props.onLastAction(`Range: ${start}–${end}`)} />
      </Section>

      {/* ============================================ */}
      {/* CONTEXTUAL HELP */}
      {/* ============================================ */}
      <Section
        id="contextualhelp"
        visibleSections={props.visibleSections}
        title="Contextual Help"
        description="Help button with popover content"
      >
        <Flex wrap gap={4} alignItems="center">
          <Flex alignItems="center" gap={2}>
            <Text styles={typeRoles.body}>Setting Name</Text>
            <ContextualHelpTrigger
              title="What is this?"
              content="This setting controls the behavior of the feature. Enabling it will allow the system to process requests in real-time."
            />
          </Flex>
          <Flex alignItems="center" gap={2}>
            <Text styles={typeRoles.body}>Advanced Option</Text>
            <ContextualHelpTrigger
              title="Advanced Configuration"
              content="This option is for advanced users. Changing it may affect system performance."
              variant="info"
            />
          </Flex>
        </Flex>
      </Section>

      {/* ============================================ */}
      {/* FLEX LAYOUT */}
      {/* ============================================ */}
      <Section
        id="flex"
        visibleSections={props.visibleSections}
        title="Flex Layout"
        description="Flexible box layout component"
        wide
      >
        <Flex direction="column" gap={6}>
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Row (default)
            </Heading>
            <Flex gap="md" wrap>
              <Button variant="primary">Item 1</Button>
              <Button variant="secondary">Item 2</Button>
              <Button variant="accent">Item 3</Button>
            </Flex>
          </div>
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Column with alignment
            </Heading>
            <Flex direction="column" gap="sm" alignItems="start">
              <Button variant="primary">First</Button>
              <Button variant="secondary">Second</Button>
              <Button variant="accent">Third</Button>
            </Flex>
          </div>
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Space between
            </Heading>
            <Flex justifyContent="between" alignItems="center" class="demo-row">
              <Text styles={typeRoles.body}>Left</Text>
              <Text styles={typeRoles.body}>Center</Text>
              <Text styles={typeRoles.body}>Right</Text>
            </Flex>
          </div>
        </Flex>
      </Section>

      {/* ============================================ */}
      {/* GRID LAYOUT */}
      {/* ============================================ */}
      <Section
        id="grid"
        visibleSections={props.visibleSections}
        title="Grid Layout"
        description="CSS Grid layout component"
        wide
      >
        <Flex direction="column" gap={6}>
          <div>
            <Heading level={4} styles={typeRoles.label}>
              3-column grid
            </Heading>
            <Grid columns={3} gap="md">
              <Well style={{ "text-align": "center", background: "var(--color-accent-dim)" }}>
                1
              </Well>
              <Well style={{ "text-align": "center", background: "var(--color-accent-dim)" }}>
                2
              </Well>
              <Well style={{ "text-align": "center", background: "var(--color-accent-dim)" }}>
                3
              </Well>
              <Well style={{ "text-align": "center", background: "var(--color-accent-dim)" }}>
                4
              </Well>
              <Well style={{ "text-align": "center", background: "var(--color-accent-dim)" }}>
                5
              </Well>
              <Well style={{ "text-align": "center", background: "var(--color-accent-dim)" }}>
                6
              </Well>
            </Grid>
          </div>
          <div>
            <Heading level={4} styles={typeRoles.label}>
              Auto-fill responsive
            </Heading>
            <Grid columns="repeat(auto-fill, minmax(120px, 1fr))" gap="sm">
              <Well style={{ "text-align": "center" }}>
                <Text styles={typeRoles.meta}>A</Text>
              </Well>
              <Well style={{ "text-align": "center" }}>
                <Text styles={typeRoles.meta}>B</Text>
              </Well>
              <Well style={{ "text-align": "center" }}>
                <Text styles={typeRoles.meta}>C</Text>
              </Well>
              <Well style={{ "text-align": "center" }}>
                <Text styles={typeRoles.meta}>D</Text>
              </Well>
              <Well style={{ "text-align": "center" }}>
                <Text styles={typeRoles.meta}>E</Text>
              </Well>
            </Grid>
          </div>
        </Flex>
      </Section>

      {/* ============================================ */}
      {/* THEME / PROVIDER */}
      {/* ============================================ */}
      <Section
        id="theme"
        visibleSections={props.visibleSections}
        title="Theme / Provider"
        description="Theme context and color scheme switching"
        wide
      >
        <Flex direction="column" gap={6}>
          <Text styles={typeRoles.body}>
            The Provider component wraps your application and provides theme context including color
            scheme (light/dark) and scale.
          </Text>
          <Grid columns="repeat(auto-fit, minmax(240px, 1fr))" gap={4}>
            <Well>
              <Heading level={4} styles={typeRoles.label}>
                Current Theme
              </Heading>
              <ThemeInfoDisplay />
            </Well>
            <Well>
              <Heading level={4} styles={typeRoles.label}>
                Usage
              </Heading>
              <pre
                class={typeRoles.terminal}
                style={{ "white-space": "pre-wrap" }}
              >{`<Provider colorScheme="dark">
  <App />
</Provider>`}</pre>
            </Well>
          </Grid>
        </Flex>
      </Section>

      {/* ============================================ */}
      {/* NEW COMPONENTS (Phases 8-11) */}
      {/* ============================================ */}
      <Show when={hasVisibleDataColorSections()}>
        <Suspense
          fallback={
            <Well style={{ "grid-column": "1 / -1" }}>
              <Text styles={typeRoles.meta}>Loading data/color sections...</Text>
            </Well>
          }
        >
          <PlaygroundDataColorSections visibleSections={props.visibleSections} />
        </Suspense>
      </Show>
    </>
  );
}

function CheckboxGroupDemo(props: { onSelectionChange?: (values: string[]) => void }) {
  const state = createCheckboxGroupState(() => ({
    defaultValue: ["notifications"],
    onChange: props.onSelectionChange,
  }));

  const { groupProps, labelProps } = createCheckboxGroup(() => ({ label: "Preferences" }), state);

  return (
    <Flex direction="column" gap={6}>
      {/* Basic Checkbox Group */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Basic Group
        </Heading>
        <div
          {...(groupProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}
          style={{ display: "flex", "flex-direction": "column", gap: "8px" }}
        >
          <span
            {...labelProps}
            class={typeRoles.label}
            style={{ display: "block", "margin-bottom": "8px" }}
          >
            Notification Settings
          </span>
          <CustomCheckbox value="notifications" state={state}>
            Enable notifications
          </CustomCheckbox>
          <CustomCheckbox value="emails" state={state}>
            Email updates
          </CustomCheckbox>
          <CustomCheckbox value="marketing" state={state}>
            Marketing communications
          </CustomCheckbox>
        </div>
        <Text styles={typeRoles.meta}>Selected: {state.value().join(", ") || "none"}</Text>
      </div>

      {/* Disabled & Read-only Examples */}
      <Grid columns="repeat(auto-fit, minmax(240px, 1fr))" gap={4}>
        <div>
          <Heading level={4} styles={typeRoles.label}>
            Disabled Checkbox
          </Heading>
          <DisabledCheckboxDemo />
        </div>
        <div>
          <Heading level={4} styles={typeRoles.label}>
            Read-only Checkbox
          </Heading>
          <ReadonlyCheckboxDemo />
        </div>
      </Grid>
    </Flex>
  );
}

function CustomCheckbox(props: {
  value: string;
  state: CheckboxGroupState;
  children: JSX.Element;
  isDisabled?: boolean;
  isReadOnly?: boolean;
}) {
  let inputRef: HTMLInputElement | null = null;

  const result = createCheckboxGroupItem(
    () => ({
      value: props.value,
      isDisabled: props.isDisabled,
      isReadOnly: props.isReadOnly,
      children: props.children,
    }),
    props.state,
    () => inputRef,
  );

  const isChecked = () => props.state.value().includes(props.value);
  const getInputProps = () => result.inputProps;

  return (
    <label class="hd-check" data-disabled={props.isDisabled || undefined}>
      <span style={{ position: "relative", display: "inline-flex" }}>
        <input
          ref={(el) => (inputRef = el)}
          type="checkbox"
          value={props.value}
          {...(getInputProps() as JSX.InputHTMLAttributes<HTMLInputElement>)}
          class="hd-check__input"
        />
        <span class="hd-check__box" data-checked={isChecked() || undefined}>
          {isChecked() && (
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6L5 9L10 3"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          )}
        </span>
      </span>
      <Text styles={typeRoles.body}>{props.children}</Text>
    </label>
  );
}

function DisabledCheckboxDemo() {
  const state = createCheckboxGroupState(() => ({
    defaultValue: ["option1"],
    isDisabled: true,
  }));

  const { groupProps } = createCheckboxGroup(() => ({}), state);

  return (
    <div
      {...(groupProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}
      style={{ display: "flex", "flex-direction": "column", gap: "8px" }}
    >
      <CustomCheckbox value="option1" state={state} isDisabled>
        Disabled (checked)
      </CustomCheckbox>
      <CustomCheckbox value="option2" state={state} isDisabled>
        Disabled (unchecked)
      </CustomCheckbox>
    </div>
  );
}

function ReadonlyCheckboxDemo() {
  const state = createCheckboxGroupState(() => ({
    defaultValue: ["readonly1"],
    isReadOnly: true,
  }));

  const { groupProps } = createCheckboxGroup(() => ({}), state);

  return (
    <div
      {...(groupProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)}
      style={{ display: "flex", "flex-direction": "column", gap: "8px" }}
    >
      <CustomCheckbox value="readonly1" state={state} isReadOnly>
        Read-only (checked)
      </CustomCheckbox>
      <CustomCheckbox value="readonly2" state={state} isReadOnly>
        Read-only (unchecked)
      </CustomCheckbox>
    </div>
  );
}

// ============================================
// ListBox Demo
// ============================================

const listBoxItems = [
  { id: "react", name: "React", description: "A JavaScript library for building user interfaces" },
  {
    id: "solid",
    name: "SolidJS",
    description: "Simple and performant reactivity for building user interfaces",
  },
  { id: "vue", name: "Vue", description: "The progressive JavaScript framework" },
  { id: "svelte", name: "Svelte", description: "Cybernetically enhanced web apps" },
  {
    id: "angular",
    name: "Angular",
    description: "Platform for building mobile and desktop web applications",
  },
];

function ListBoxDemo(props: { onSelectionChange?: (key: string | number) => void }) {
  return (
    <Flex direction="column" gap={4}>
      <ListBox
        items={listBoxItems}
        getKey={(item) => item.id}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const key = [...keys][0];
          if (key) props.onSelectionChange?.(key);
        }}
        aria-label="Choose a framework"
        class="hd-listbox"
      >
        {(item) => (
          <ListBoxOption id={item.id} item={item} class="hd-option">
            <Flex alignItems="center" justifyContent="between">
              <div>
                <Text styles={typeRoles.label}>{item.name}</Text>
                <Text styles={typeRoles.meta}>{item.description}</Text>
              </div>
            </Flex>
          </ListBoxOption>
        )}
      </ListBox>
      <Text styles={typeRoles.meta}>Use arrow keys to navigate, Enter/Space to select</Text>
    </Flex>
  );
}

// ============================================
// Menu Demo
// ============================================

const menuItems = [
  { id: "edit", label: "Edit", variant: "default" },
  { id: "duplicate", label: "Duplicate", variant: "default" },
  { id: "share", label: "Share", variant: "default" },
  { id: "delete", label: "Delete", variant: "danger" },
];

// Menu items with some disabled for testing disabled key navigation
const menuItemsWithDisabled = [
  { id: "item1", label: "First Item" },
  { id: "item2", label: "Second Item (disabled)" },
  { id: "item3", label: "Third Item (disabled)" },
  { id: "item4", label: "Fourth Item" },
  { id: "item5", label: "Fifth Item" },
];

function MenuDemo(props: { onAction?: (action: string) => void }) {
  return (
    <Flex direction="column" gap={6}>
      {/* Basic Menu */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Basic Menu
        </Heading>
        <MenuTrigger>
          <MenuButton
            style={{
              display: "inline-flex",
              "align-items": "center",
              gap: "8px",
              padding: "8px 16px",
              background: "var(--color-primary-700)",
              color: "var(--color-primary-100)",
              border: "1px solid var(--color-primary-500)",
              "border-radius": "var(--radius-lg)",
            }}
          >
            Actions
            <Text styles={typeRoles.micro}>▼</Text>
          </MenuButton>
          <Menu
            items={menuItems}
            getKey={(item) => item.id}
            onAction={(key) => props.onAction?.(String(key))}
            aria-label="Actions menu"
            style={{
              position: "absolute",
              "margin-top": "4px",
              "min-width": "12rem",
              "z-index": 50,
              background: "var(--color-bg-200)",
              border: "1px solid var(--color-primary-600)",
              "border-radius": "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            {(item) => (
              <MenuItem
                id={item.id}
                class={`hd-menu-item${item.variant === "danger" ? " hd-menu-item--danger" : ""}`}
              >
                {item.label}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
      </div>

      {/* Menu with Disabled Items */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Menu with Disabled Items
        </Heading>
        <MenuTrigger>
          <MenuButton
            style={{
              display: "inline-flex",
              "align-items": "center",
              gap: "8px",
              padding: "8px 16px",
              background: "var(--color-primary-700)",
              color: "var(--color-primary-100)",
              border: "1px solid var(--color-primary-500)",
              "border-radius": "var(--radius-lg)",
            }}
          >
            Menu with Disabled
            <Text styles={typeRoles.micro}>▼</Text>
          </MenuButton>
          <Menu
            items={menuItemsWithDisabled}
            getKey={(item) => item.id}
            disabledKeys={["item2", "item3"]}
            onAction={(key) => props.onAction?.(String(key))}
            aria-label="Menu with disabled items"
            style={{
              position: "absolute",
              "margin-top": "4px",
              "min-width": "12rem",
              "z-index": 50,
              background: "var(--color-bg-200)",
              border: "1px solid var(--color-primary-600)",
              "border-radius": "var(--radius-lg)",
              overflow: "hidden",
            }}
          >
            {(item) => (
              <MenuItem id={item.id} class="hd-menu-item">
                {item.label}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
        <Text styles={typeRoles.meta}>
          Items 2 and 3 are disabled. Arrow keys should skip them.
        </Text>
      </div>

      <Text styles={typeRoles.meta}>
        Click button to open, use arrow keys to navigate, Enter to select, Escape to close
      </Text>
    </Flex>
  );
}

// ============================================
// Select Demo
// ============================================

const selectItems = [
  { id: "sm", label: "Small", size: "640px" },
  { id: "md", label: "Medium", size: "768px" },
  { id: "lg", label: "Large", size: "1024px" },
  { id: "xl", label: "Extra Large", size: "1280px" },
  { id: "2xl", label: "2X Large", size: "1536px" },
];
type SelectDemoItem = (typeof selectItems)[number];

function SelectDemo(props: { onSelectionChange?: (key: string | number | null) => void }) {
  const [selectedKey, setSelectedKey] = createSignal<string | number | null>("md");

  const handleChange = (key: string | number | null) => {
    setSelectedKey(key);
    props.onSelectionChange?.(key);
  };

  return (
    <Flex direction="column" gap={6}>
      <Grid columns="repeat(auto-fit, minmax(240px, 1fr))" gap={6}>
        {/* Basic Select */}
        <div>
          <Heading level={4} styles={typeRoles.label}>
            Basic Select
          </Heading>
          <Select
            items={selectItems}
            getKey={(item) => item.id}
            selectedKey={selectedKey()}
            onSelectionChange={handleChange}
            aria-label="Choose a breakpoint"
          >
            <SelectTrigger class="hd-select-trigger">
              <SelectValue placeholder="Select a size..." />
              <Text styles={typeRoles.meta}>▼</Text>
            </SelectTrigger>
            <SelectListBox
              style={{
                position: "absolute",
                "margin-top": "4px",
                width: "100%",
                "z-index": 50,
                background: "var(--color-bg-200)",
                border: "1px solid var(--color-primary-600)",
                "border-radius": "var(--radius-lg)",
                overflow: "hidden",
              }}
            >
              {(item: SelectDemoItem) => (
                <SelectOption id={item.id} item={item} class="hd-option">
                  <Flex alignItems="center" justifyContent="between">
                    <div>
                      <Text styles={typeRoles.label}>{item.label}</Text>
                      <Text styles={typeRoles.meta}>&nbsp;({item.size})</Text>
                    </div>
                  </Flex>
                </SelectOption>
              )}
            </SelectListBox>
          </Select>
        </div>

        {/* Disabled Select */}
        <div>
          <Heading level={4} styles={typeRoles.label}>
            Disabled Select
          </Heading>
          <Select
            items={selectItems}
            getKey={(item) => item.id}
            defaultSelectedKey="lg"
            isDisabled
            aria-label="Disabled select"
          >
            <SelectTrigger class="hd-select-trigger" data-disabled>
              <SelectValue placeholder="Select..." />
              <Text styles={typeRoles.meta}>▼</Text>
            </SelectTrigger>
            <SelectListBox style={{ display: "none" }}>
              {(item: SelectDemoItem) => (
                <SelectOption id={item.id} item={item}>
                  {item.label}
                </SelectOption>
              )}
            </SelectListBox>
          </Select>
        </div>
      </Grid>

      <div>
        <Text styles={typeRoles.meta}>
          Click to open dropdown, use arrow keys to navigate options, Enter/Space to select, Escape
          to close. The selected value is: <strong>{selectedKey() || "none"}</strong>
        </Text>
      </div>
    </Flex>
  );
}

// ============================================
// Styled Select Demo (ui package)
// ============================================

interface FruitItem {
  id: string;
  label: string;
}

const styledSelectItems: FruitItem[] = [
  { id: "apple", label: "Apple" },
  { id: "banana", label: "Banana" },
  { id: "cherry", label: "Cherry" },
  { id: "date", label: "Date" },
  { id: "elderberry", label: "Elderberry" },
];

function StyledSelectDemo(props: { onSelectionChange?: (key: string | number | null) => void }) {
  const [selectedKey, setSelectedKey] = createSignal<string | number | null>(null);

  const handleChange = (key: string | number | null) => {
    setSelectedKey(key);
    props.onSelectionChange?.(key);
  };

  return (
    <Flex direction="column" gap={6}>
      <Grid columns="repeat(auto-fit, minmax(180px, 1fr))" gap={6}>
        {/* Small size */}
        <StyledSelect<FruitItem>
          items={styledSelectItems}
          getKey={(item: FruitItem) => item.id}
          getTextValue={(item: FruitItem) => item.label}
          selectedKey={selectedKey()}
          onSelectionChange={handleChange}
          size="sm"
          label="Small"
          placeholder="Pick a fruit..."
        >
          <StyledSelectTrigger>
            <StyledSelectValue />
          </StyledSelectTrigger>
          <StyledSelectListBox>
            {(item: FruitItem) => (
              <StyledSelectOption id={item.id}>{item.label}</StyledSelectOption>
            )}
          </StyledSelectListBox>
        </StyledSelect>

        {/* Medium size (default) */}
        <StyledSelect<FruitItem>
          items={styledSelectItems}
          getKey={(item: FruitItem) => item.id}
          getTextValue={(item: FruitItem) => item.label}
          selectedKey={selectedKey()}
          onSelectionChange={handleChange}
          size="md"
          label="Medium"
          placeholder="Pick a fruit..."
        >
          <StyledSelectTrigger>
            <StyledSelectValue />
          </StyledSelectTrigger>
          <StyledSelectListBox>
            {(item: FruitItem) => (
              <StyledSelectOption id={item.id}>{item.label}</StyledSelectOption>
            )}
          </StyledSelectListBox>
        </StyledSelect>

        {/* Large size */}
        <StyledSelect<FruitItem>
          items={styledSelectItems}
          getKey={(item: FruitItem) => item.id}
          getTextValue={(item: FruitItem) => item.label}
          selectedKey={selectedKey()}
          onSelectionChange={handleChange}
          size="lg"
          label="Large"
          placeholder="Pick a fruit..."
        >
          <StyledSelectTrigger>
            <StyledSelectValue />
          </StyledSelectTrigger>
          <StyledSelectListBox>
            {(item: FruitItem) => (
              <StyledSelectOption id={item.id}>{item.label}</StyledSelectOption>
            )}
          </StyledSelectListBox>
        </StyledSelect>
      </Grid>
      <Text styles={typeRoles.meta}>
        Pre-styled Select with size variants. Selected: <strong>{selectedKey() || "none"}</strong>
      </Text>
    </Flex>
  );
}

// ============================================
// Styled Menu Demo (ui package)
// ============================================

interface MenuItemData {
  id: string;
  label: string;
  shortcut?: string;
  isSeparator?: boolean;
  isDestructive?: boolean;
}

const styledMenuItems: MenuItemData[] = [
  { id: "new", label: "New File", shortcut: "⌘N" },
  { id: "open", label: "Open...", shortcut: "⌘O" },
  { id: "save", label: "Save", shortcut: "⌘S" },
  { id: "separator", label: "", isSeparator: true },
  { id: "delete", label: "Delete", isDestructive: true },
];

interface SimpleMenuItem {
  id: string;
  label: string;
}

function StyledMenuDemo(props: { onAction?: (action: string) => void }) {
  return (
    <Flex direction="column" gap={4}>
      <Flex wrap gap={4}>
        {/* Primary variant */}
        <StyledMenuTrigger size="md">
          <StyledMenuButton variant="primary">File Menu</StyledMenuButton>
          <StyledMenu<MenuItemData>
            items={styledMenuItems.filter((i: MenuItemData) => !i.isSeparator)}
            getKey={(item: MenuItemData) => item.id}
            onAction={(key: string | number) => props.onAction?.(String(key))}
            aria-label="File menu"
          >
            {(item: MenuItemData) => (
              <StyledMenuItem
                id={item.id}
                shortcut={item.shortcut}
                isDestructive={item.isDestructive}
              >
                {item.label}
              </StyledMenuItem>
            )}
          </StyledMenu>
        </StyledMenuTrigger>

        {/* Secondary variant */}
        <StyledMenuTrigger size="md">
          <StyledMenuButton variant="secondary">Edit Menu</StyledMenuButton>
          <StyledMenu<SimpleMenuItem>
            items={[
              { id: "cut", label: "Cut" },
              { id: "copy", label: "Copy" },
              { id: "paste", label: "Paste" },
            ]}
            getKey={(item: SimpleMenuItem) => item.id}
            onAction={(key: string | number) => props.onAction?.(String(key))}
            aria-label="Edit menu"
          >
            {(item: SimpleMenuItem) => <StyledMenuItem id={item.id}>{item.label}</StyledMenuItem>}
          </StyledMenu>
        </StyledMenuTrigger>

        {/* Quiet variant */}
        <StyledMenuTrigger size="sm">
          <StyledMenuButton variant="quiet">More</StyledMenuButton>
          <StyledMenu<SimpleMenuItem>
            items={[
              { id: "settings", label: "Settings" },
              { id: "help", label: "Help" },
            ]}
            getKey={(item: SimpleMenuItem) => item.id}
            onAction={(key: string | number) => props.onAction?.(String(key))}
            aria-label="More options"
          >
            {(item: SimpleMenuItem) => <StyledMenuItem id={item.id}>{item.label}</StyledMenuItem>}
          </StyledMenu>
        </StyledMenuTrigger>
      </Flex>
      <Text styles={typeRoles.meta}>
        Pre-styled Menu with button variants (primary, secondary, quiet) and size options.
      </Text>
    </Flex>
  );
}

// ============================================
// Styled ListBox Demo (ui package)
// ============================================

interface MailboxItem {
  id: string;
  label: string;
  description: string;
}

const styledListBoxItems: MailboxItem[] = [
  { id: "inbox", label: "Inbox", description: "24 unread messages" },
  { id: "drafts", label: "Drafts", description: "3 draft messages" },
  { id: "sent", label: "Sent", description: "156 sent messages" },
  { id: "archive", label: "Archive", description: "1,234 archived" },
  { id: "trash", label: "Trash", description: "12 items" },
];

type SelectionKeys = "all" | Set<string | number>;

function StyledListBoxDemo(props: { onSelectionChange?: (key: string | number) => void }) {
  return (
    <Grid columns="repeat(auto-fit, minmax(180px, 1fr))" gap={6}>
      {/* Small size */}
      <StyledListBox<MailboxItem>
        items={styledListBoxItems}
        getKey={(item: MailboxItem) => item.id}
        getTextValue={(item: MailboxItem) => item.label}
        selectionMode="single"
        size="sm"
        label="Small ListBox"
        onSelectionChange={(keys: SelectionKeys) => {
          if (keys !== "all") {
            const key = [...keys][0];
            if (key) props.onSelectionChange?.(key);
          }
        }}
      >
        {(item: MailboxItem) => (
          <StyledListBoxOption id={item.id} description={item.description}>
            {item.label}
          </StyledListBoxOption>
        )}
      </StyledListBox>

      {/* Medium size */}
      <StyledListBox<MailboxItem>
        items={styledListBoxItems}
        getKey={(item: MailboxItem) => item.id}
        getTextValue={(item: MailboxItem) => item.label}
        selectionMode="single"
        size="md"
        label="Medium ListBox"
        onSelectionChange={(keys: SelectionKeys) => {
          if (keys !== "all") {
            const key = [...keys][0];
            if (key) props.onSelectionChange?.(key);
          }
        }}
      >
        {(item: MailboxItem) => (
          <StyledListBoxOption id={item.id} description={item.description}>
            {item.label}
          </StyledListBoxOption>
        )}
      </StyledListBox>

      {/* Large size */}
      <StyledListBox<MailboxItem>
        items={styledListBoxItems}
        getKey={(item: MailboxItem) => item.id}
        getTextValue={(item: MailboxItem) => item.label}
        selectionMode="single"
        size="lg"
        label="Large ListBox"
        onSelectionChange={(keys: SelectionKeys) => {
          if (keys !== "all") {
            const key = [...keys][0];
            if (key) props.onSelectionChange?.(key);
          }
        }}
      >
        {(item: MailboxItem) => (
          <StyledListBoxOption id={item.id} description={item.description}>
            {item.label}
          </StyledListBoxOption>
        )}
      </StyledListBox>
    </Grid>
  );
}

// ============================================
// Styled Tabs Demo (ui package)
// ============================================

interface TabItem {
  id: string;
  label: string;
  content: string;
}

const tabItems: TabItem[] = [
  {
    id: "overview",
    label: "Overview",
    content: "This is the overview panel content. It provides a summary of all features.",
  },
  {
    id: "features",
    label: "Features",
    content:
      "Explore the rich features including accessibility, keyboard navigation, and customization.",
  },
  {
    id: "specs",
    label: "Specifications",
    content: "Technical specifications and requirements for integration.",
  },
  {
    id: "reviews",
    label: "Reviews",
    content: "User reviews and testimonials about the component library.",
  },
];

function StyledTabsDemo(props: { onSelectionChange?: (key: string | number) => void }) {
  const [selectedKey, setSelectedKey] = createSignal<string | number>("overview");

  const handleChange = (key: string | number) => {
    setSelectedKey(key);
    props.onSelectionChange?.(key);
  };

  return (
    <Flex direction="column" gap={8}>
      {/* Controlled selection (regular density, the default) */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Controlled Selection
        </Heading>
        <StyledTabs<TabItem>
          items={tabItems}
          getKey={(item: TabItem) => item.id}
          getTextValue={(item: TabItem) => item.label}
          selectedKey={selectedKey()}
          onSelectionChange={handleChange}
          aria-label="Styled tab variants"
        >
          <StyledTabList>
            {(item: TabItem) => <StyledTab id={item.id}>{item.label}</StyledTab>}
          </StyledTabList>
          <StyledTabPanel>
            {() => {
              const selected = tabItems.find((item: TabItem) => item.id === selectedKey());
              return <Text styles={typeRoles.body}>{selected?.content}</Text>;
            }}
          </StyledTabPanel>
        </StyledTabs>
      </div>

      {/* Compact density */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Compact Density
        </Heading>
        <StyledTabs<TabItem>
          items={tabItems}
          getKey={(item: TabItem) => item.id}
          getTextValue={(item: TabItem) => item.label}
          defaultSelectedKey="features"
          density="compact"
          aria-label="Compact tab example"
        >
          <StyledTabList>
            {(item: TabItem) => <StyledTab id={item.id}>{item.label}</StyledTab>}
          </StyledTabList>
          <StyledTabPanel>
            <Text styles={typeRoles.body}>{tabItems[1].content}</Text>
          </StyledTabPanel>
        </StyledTabs>
      </div>

      {/* Densities and orientation */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Densities and Orientation
        </Heading>
        <Grid columns="repeat(auto-fit, minmax(180px, 1fr))" gap={6}>
          {/* Regular density */}
          <StyledTabs<TabItem>
            items={tabItems.slice(0, 3)}
            getKey={(item: TabItem) => item.id}
            getTextValue={(item: TabItem) => item.label}
            defaultSelectedKey="overview"
            density="regular"
            aria-label="Regular density tabs"
          >
            <StyledTabList>
              {(item: TabItem) => <StyledTab id={item.id}>{item.label}</StyledTab>}
            </StyledTabList>
            <StyledTabPanel>
              <Text styles={typeRoles.meta}>Regular density content</Text>
            </StyledTabPanel>
          </StyledTabs>

          {/* Compact density */}
          <StyledTabs<TabItem>
            items={tabItems.slice(0, 3)}
            getKey={(item: TabItem) => item.id}
            getTextValue={(item: TabItem) => item.label}
            defaultSelectedKey="overview"
            density="compact"
            aria-label="Compact density tabs"
          >
            <StyledTabList>
              {(item: TabItem) => <StyledTab id={item.id}>{item.label}</StyledTab>}
            </StyledTabList>
            <StyledTabPanel>
              <Text styles={typeRoles.body}>Compact density content</Text>
            </StyledTabPanel>
          </StyledTabs>

          {/* Vertical orientation */}
          <StyledTabs<TabItem>
            items={tabItems.slice(0, 3)}
            getKey={(item: TabItem) => item.id}
            getTextValue={(item: TabItem) => item.label}
            defaultSelectedKey="overview"
            orientation="vertical"
            aria-label="Vertical tabs"
          >
            <StyledTabList>
              {(item: TabItem) => <StyledTab id={item.id}>{item.label}</StyledTab>}
            </StyledTabList>
            <StyledTabPanel>
              <Text styles={typeRoles.body}>Vertical orientation content</Text>
            </StyledTabPanel>
          </StyledTabs>
        </Grid>
      </div>

      <Text styles={typeRoles.meta}>
        Pre-styled Tabs with regular/compact densities and horizontal/vertical orientation. Use
        arrow keys to navigate between tabs.
      </Text>
    </Flex>
  );
}

// ============================================
// Styled Breadcrumbs Demo (ui package)
// ============================================

interface BreadcrumbData {
  id: string;
  label: string;
  href?: string;
  isCurrent?: boolean;
}

const breadcrumbItems: BreadcrumbData[] = [
  { id: "home", label: "Home", href: "/" },
  { id: "products", label: "Products", href: "/products" },
  { id: "category", label: "Electronics", href: "/products/electronics" },
  { id: "item", label: "Smartphones", isCurrent: true },
];

function StyledBreadcrumbsDemo(props: { onNavigate?: (path: string) => void }) {
  return (
    <Flex direction="column" gap={8}>
      {/* Default variant */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Default Variant
        </Heading>
        <StyledBreadcrumbs<BreadcrumbData>
          items={breadcrumbItems}
          getKey={(item: BreadcrumbData) => item.id}
          aria-label="Default breadcrumbs demo"
        >
          {(item: BreadcrumbData) => (
            <StyledBreadcrumbItem
              isCurrent={item.isCurrent}
              href={item.href}
              onPress={() => props.onNavigate?.(item.href ?? item.label)}
            >
              {item.label}
            </StyledBreadcrumbItem>
          )}
        </StyledBreadcrumbs>
      </div>

      {/* Subtle variant */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Subtle Variant
        </Heading>
        <StyledBreadcrumbs<BreadcrumbData>
          items={breadcrumbItems}
          getKey={(item: BreadcrumbData) => item.id}
          variant="subtle"
          aria-label="Subtle breadcrumbs demo"
        >
          {(item: BreadcrumbData) => (
            <StyledBreadcrumbItem
              isCurrent={item.isCurrent}
              href={item.href}
              onPress={() => props.onNavigate?.(item.href ?? item.label)}
            >
              {item.label}
            </StyledBreadcrumbItem>
          )}
        </StyledBreadcrumbs>
      </div>

      {/* Size variants */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Size Variants
        </Heading>
        <Flex direction="column" gap={4}>
          {/* Small */}
          <div>
            <Text styles={typeRoles.meta}>Small:</Text>
            <StyledBreadcrumbs<BreadcrumbData>
              items={breadcrumbItems.slice(0, 3)}
              getKey={(item: BreadcrumbData) => item.id}
              size="sm"
              aria-label="Small breadcrumbs demo"
            >
              {(item: BreadcrumbData) => (
                <StyledBreadcrumbItem isCurrent={item.id === "category"} href={item.href}>
                  {item.label}
                </StyledBreadcrumbItem>
              )}
            </StyledBreadcrumbs>
          </div>

          {/* Medium */}
          <div>
            <Text styles={typeRoles.meta}>Medium:</Text>
            <StyledBreadcrumbs<BreadcrumbData>
              items={breadcrumbItems.slice(0, 3)}
              getKey={(item: BreadcrumbData) => item.id}
              size="md"
              aria-label="Medium breadcrumbs demo"
            >
              {(item: BreadcrumbData) => (
                <StyledBreadcrumbItem isCurrent={item.id === "category"} href={item.href}>
                  {item.label}
                </StyledBreadcrumbItem>
              )}
            </StyledBreadcrumbs>
          </div>

          {/* Large */}
          <div>
            <Text styles={typeRoles.meta}>Large:</Text>
            <StyledBreadcrumbs<BreadcrumbData>
              items={breadcrumbItems.slice(0, 3)}
              getKey={(item: BreadcrumbData) => item.id}
              size="lg"
              aria-label="Large breadcrumbs demo"
            >
              {(item: BreadcrumbData) => (
                <StyledBreadcrumbItem isCurrent={item.id === "category"} href={item.href}>
                  {item.label}
                </StyledBreadcrumbItem>
              )}
            </StyledBreadcrumbs>
          </div>
        </Flex>
      </div>

      <Text styles={typeRoles.meta}>
        Pre-styled Breadcrumbs with variants (default, subtle) and sizes (sm, md, lg). Click items
        to navigate.
      </Text>
    </Flex>
  );
}

// ============================================
// Styled NumberField Demo (ui package)
// ============================================

function StyledNumberFieldDemo(props: { onChange?: (value: number) => void }) {
  const [value, setValue] = createSignal(50);
  const [currencyValue, setCurrencyValue] = createSignal(99.99);

  const handleChange = (newValue: number) => {
    setValue(newValue);
    props.onChange?.(newValue);
  };

  return (
    <Flex direction="column" gap={8}>
      {/* Basic NumberField */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Basic NumberField
        </Heading>
        <div style={{ "max-width": "20rem" }}>
          <StyledNumberField
            label="Quantity"
            value={value()}
            onChange={handleChange}
            minValue={0}
            maxValue={100}
            step={1}
          />
        </div>
      </div>

      {/* Size variants */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Size Variants
        </Heading>
        <Grid columns="repeat(auto-fit, minmax(160px, 1fr))" gap={6}>
          <StyledNumberField label="Small" defaultValue={10} size="S" minValue={0} maxValue={50} />
          <StyledNumberField
            label="Medium (default)"
            defaultValue={25}
            size="M"
            minValue={0}
            maxValue={50}
          />
          <StyledNumberField label="Large" defaultValue={40} size="L" minValue={0} maxValue={50} />
          <StyledNumberField
            label="Extra large"
            defaultValue={45}
            size="XL"
            minValue={0}
            maxValue={50}
          />
        </Grid>
      </div>

      {/* With min/max constraints */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          With Min/Max Constraints (0-10)
        </Heading>
        <div style={{ "max-width": "20rem" }}>
          <StyledNumberField
            label="Rating"
            defaultValue={5}
            minValue={0}
            maxValue={10}
            step={1}
            description="Enter a rating from 0 to 10"
          />
        </div>
      </div>

      {/* Currency formatting */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Currency Formatting
        </Heading>
        <div style={{ "max-width": "20rem" }}>
          <StyledNumberField
            label="Price"
            value={currencyValue()}
            onChange={setCurrencyValue}
            minValue={0}
            step={0.01}
            formatOptions={{
              style: "currency",
              currency: "USD",
            }}
          />
        </div>
      </div>

      {/* Percent formatting */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Percent Formatting
        </Heading>
        <div style={{ "max-width": "20rem" }}>
          <StyledNumberField
            label="Discount"
            defaultValue={0.15}
            minValue={0}
            maxValue={1}
            step={0.01}
            formatOptions={{
              style: "percent",
            }}
          />
        </div>
      </div>

      {/* Disabled state */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          States
        </Heading>
        <Grid columns="repeat(auto-fit, minmax(240px, 1fr))" gap={6}>
          <StyledNumberField label="Disabled" defaultValue={42} isDisabled />
          <StyledNumberField
            label="Invalid"
            defaultValue={-5}
            isInvalid
            errorMessage="Value must be positive"
          />
        </Grid>
      </div>

      {/* Hidden stepper */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Hidden Stepper (keyboard only)
        </Heading>
        <div style={{ "max-width": "20rem" }}>
          <StyledNumberField
            label="Amount"
            defaultValue={100}
            hideStepper
            description="Use arrow keys to adjust"
          />
        </div>
      </div>

      <Text styles={typeRoles.meta}>
        NumberField with increment/decrement buttons. Supports keyboard navigation (arrows, Page
        Up/Down, Home/End), number formatting (currency, percent), min/max constraints, and step
        values.
      </Text>
    </Flex>
  );
}

// ============================================
// Styled SearchField Demo (ui package)
// ============================================

function StyledSearchFieldDemo(props: { onSearch?: (value: string) => void }) {
  const [value, setValue] = createSignal("");

  const handleSubmit = (searchValue: string) => {
    props.onSearch?.(searchValue);
  };

  return (
    <Flex direction="column" gap={8}>
      {/* Basic SearchField */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Basic SearchField
        </Heading>
        <div style={{ "max-width": "28rem" }}>
          <StyledSearchField
            label="Search"
            placeholder="Search for items..."
            value={value()}
            onChange={setValue}
            onSubmit={handleSubmit}
            onClear={() => setValue("")}
          />
        </div>
      </div>

      {/* Size variants */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Size Variants
        </Heading>
        <Grid columns="repeat(auto-fit, minmax(180px, 1fr))" gap={6}>
          <StyledSearchField
            label="Small"
            placeholder="Search..."
            size="sm"
            onSubmit={handleSubmit}
          />
          <StyledSearchField
            label="Medium (default)"
            placeholder="Search..."
            size="md"
            onSubmit={handleSubmit}
          />
          <StyledSearchField
            label="Large"
            placeholder="Search..."
            size="lg"
            onSubmit={handleSubmit}
          />
        </Grid>
      </div>

      {/* Variant styles */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Variants
        </Heading>
        <Grid columns="repeat(auto-fit, minmax(240px, 1fr))" gap={6}>
          <StyledSearchField
            label="Outline (default)"
            placeholder="Search..."
            variant="outline"
            onSubmit={handleSubmit}
          />
          <StyledSearchField
            label="Filled"
            placeholder="Search..."
            variant="filled"
            onSubmit={handleSubmit}
          />
        </Grid>
      </div>

      {/* With description */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          With Description
        </Heading>
        <div style={{ "max-width": "28rem" }}>
          <StyledSearchField
            label="Product Search"
            placeholder="Enter product name or SKU..."
            description="Press Enter to search, Escape to clear"
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      {/* States */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          States
        </Heading>
        <Grid columns="repeat(auto-fit, minmax(240px, 1fr))" gap={6}>
          <StyledSearchField
            label="Disabled"
            placeholder="Can't search..."
            defaultValue="disabled search"
            isDisabled
          />
          <StyledSearchField
            label="Invalid"
            placeholder="Search..."
            defaultValue="invalid query"
            isInvalid
            errorMessage="Invalid search query"
          />
        </Grid>
      </div>

      <Text styles={typeRoles.meta}>
        SearchField with clear button. Press Enter to submit, Escape to clear. The clear button
        appears when there's text in the field.
      </Text>
    </Flex>
  );
}

// ============================================
// Styled Slider Demo (ui package)
// ============================================

// ============================================
// Styled ComboBox Demo (ui package)
// ============================================

interface ComboBoxItem {
  id: string;
  name: string;
  category: string;
}

const comboBoxItems: ComboBoxItem[] = [
  { id: "apple", name: "Apple", category: "Fruit" },
  { id: "banana", name: "Banana", category: "Fruit" },
  { id: "cherry", name: "Cherry", category: "Fruit" },
  { id: "carrot", name: "Carrot", category: "Vegetable" },
  { id: "celery", name: "Celery", category: "Vegetable" },
  { id: "cucumber", name: "Cucumber", category: "Vegetable" },
  { id: "date", name: "Date", category: "Fruit" },
  { id: "elderberry", name: "Elderberry", category: "Fruit" },
];

function StyledComboBoxDemo(props: { onSelectionChange?: (key: string | number | null) => void }) {
  const [selectedKey, setSelectedKey] = createSignal<string | number | null>(null);
  const [requiredKey, setRequiredKey] = createSignal<string | number | null>(null);
  const [requiredTouched, setRequiredTouched] = createSignal(false);

  const handleChange = (key: string | number | null) => {
    setSelectedKey(key);
    props.onSelectionChange?.(key);
  };

  const handleRequiredChange = (key: string | number | null) => {
    setRequiredKey(key);
  };

  const handleRequiredBlur = () => {
    setRequiredTouched(true);
  };

  const isRequiredInvalid = () => requiredTouched() && !requiredKey();

  return (
    <Flex direction="column" gap={8}>
      {/* Basic ComboBox */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Basic ComboBox with Filtering
        </Heading>
        <div style={{ "max-width": "28rem" }}>
          <StyledComboBox<ComboBoxItem>
            items={comboBoxItems}
            getKey={(item: ComboBoxItem) => item.id}
            getTextValue={(item: ComboBoxItem) => item.name}
            selectedKey={selectedKey()}
            onSelectionChange={handleChange}
            defaultFilter={defaultContainsFilter}
            label="Select a food"
            placeholder="Type to filter..."
          >
            {(item: ComboBoxItem) => (
              <StyledComboBoxOption id={item.id}>
                <div
                  style={{
                    display: "flex",
                    "justify-content": "space-between",
                    "align-items": "center",
                    width: "100%",
                  }}
                >
                  <span>{item.name}</span>
                  <Text styles={typeRoles.meta}>{item.category}</Text>
                </div>
              </StyledComboBoxOption>
            )}
          </StyledComboBox>
        </div>
      </div>

      {/* Size variants */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Size Variants
        </Heading>
        <Grid columns="repeat(auto-fit, minmax(180px, 1fr))" gap={6}>
          <StyledComboBox<ComboBoxItem>
            items={comboBoxItems}
            getKey={(item: ComboBoxItem) => item.id}
            getTextValue={(item: ComboBoxItem) => item.name}
            defaultFilter={defaultContainsFilter}
            size="sm"
            label="Small"
            placeholder="Filter..."
          >
            {(item: ComboBoxItem) => (
              <StyledComboBoxOption id={item.id}>{item.name}</StyledComboBoxOption>
            )}
          </StyledComboBox>

          <StyledComboBox<ComboBoxItem>
            items={comboBoxItems}
            getKey={(item: ComboBoxItem) => item.id}
            getTextValue={(item: ComboBoxItem) => item.name}
            defaultFilter={defaultContainsFilter}
            size="md"
            label="Medium"
            placeholder="Filter..."
          >
            {(item: ComboBoxItem) => (
              <StyledComboBoxOption id={item.id}>{item.name}</StyledComboBoxOption>
            )}
          </StyledComboBox>

          <StyledComboBox<ComboBoxItem>
            items={comboBoxItems}
            getKey={(item: ComboBoxItem) => item.id}
            getTextValue={(item: ComboBoxItem) => item.name}
            defaultFilter={defaultContainsFilter}
            size="lg"
            label="Large"
            placeholder="Filter..."
          >
            {(item: ComboBoxItem) => (
              <StyledComboBoxOption id={item.id}>{item.name}</StyledComboBoxOption>
            )}
          </StyledComboBox>
        </Grid>
      </div>

      {/* With description and validation */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          With Description & Validation
        </Heading>
        <Grid columns="repeat(auto-fit, minmax(240px, 1fr))" gap={6}>
          <StyledComboBox<ComboBoxItem>
            items={comboBoxItems}
            getKey={(item: ComboBoxItem) => item.id}
            getTextValue={(item: ComboBoxItem) => item.name}
            defaultFilter={defaultContainsFilter}
            label="Favorite Food"
            placeholder="Start typing..."
            description="Choose your favorite food from the list"
          >
            {(item: ComboBoxItem) => (
              <StyledComboBoxOption id={item.id}>{item.name}</StyledComboBoxOption>
            )}
          </StyledComboBox>

          <StyledComboBox<ComboBoxItem>
            items={comboBoxItems}
            getKey={(item: ComboBoxItem) => item.id}
            getTextValue={(item: ComboBoxItem) => item.name}
            defaultFilter={defaultContainsFilter}
            selectedKey={requiredKey()}
            onSelectionChange={handleRequiredChange}
            onBlur={handleRequiredBlur}
            label="Required Food"
            placeholder="Select one..."
            isInvalid={isRequiredInvalid()}
            errorMessage={isRequiredInvalid() ? "Please select a food item" : undefined}
          >
            {(item: ComboBoxItem) => (
              <StyledComboBoxOption id={item.id}>{item.name}</StyledComboBoxOption>
            )}
          </StyledComboBox>
        </Grid>
      </div>

      {/* Disabled state */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Disabled
        </Heading>
        <div style={{ "max-width": "28rem" }}>
          <StyledComboBox<ComboBoxItem>
            items={comboBoxItems}
            getKey={(item: ComboBoxItem) => item.id}
            getTextValue={(item: ComboBoxItem) => item.name}
            defaultSelectedKey="apple"
            isDisabled
            label="Disabled ComboBox"
          >
            {(item: ComboBoxItem) => (
              <StyledComboBoxOption id={item.id}>{item.name}</StyledComboBoxOption>
            )}
          </StyledComboBox>
        </div>
      </div>

      <Text styles={typeRoles.meta}>
        ComboBox combines a text input with a filterable listbox. Type to filter options, use arrow
        keys to navigate, Enter to select, Escape to close. Selected:{" "}
        <strong>{selectedKey() || "none"}</strong>
      </Text>
    </Flex>
  );
}

function StyledSliderDemo(props: { onChange?: (value: number) => void }) {
  const [value, setValue] = createSignal(50);

  const handleChange = (newValue: number) => {
    setValue(newValue);
    props.onChange?.(newValue);
  };

  return (
    <Flex direction="column" gap={8}>
      {/* Basic Slider */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Basic Slider
        </Heading>
        <div style={{ "max-width": "28rem" }}>
          <StyledSlider label="Volume" value={value()} onChange={handleChange} />
        </div>
      </div>

      {/* Size variants */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Size Variants
        </Heading>
        <Grid gap={6}>
          <StyledSlider label="Small" defaultValue={30} size="sm" onChange={props.onChange} />
          <StyledSlider
            label="Medium (default)"
            defaultValue={50}
            size="md"
            onChange={props.onChange}
          />
          <StyledSlider label="Large" defaultValue={70} size="lg" onChange={props.onChange} />
        </Grid>
      </div>

      {/* Variant styles */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Variants
        </Heading>
        <Grid gap={6}>
          <StyledSlider
            label="Default"
            defaultValue={40}
            variant="default"
            onChange={props.onChange}
          />
          <StyledSlider
            label="Accent"
            defaultValue={60}
            variant="accent"
            onChange={props.onChange}
          />
        </Grid>
      </div>

      {/* Custom range and step */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Custom Range and Step
        </Heading>
        <Grid gap={6}>
          <StyledSlider
            label="Temperature (°C)"
            defaultValue={22}
            minValue={16}
            maxValue={30}
            step={0.5}
            showMinMax
            onChange={props.onChange}
          />
          <StyledSlider
            label="Rating"
            defaultValue={3}
            minValue={1}
            maxValue={5}
            step={1}
            showMinMax
            onChange={props.onChange}
          />
        </Grid>
      </div>

      {/* With formatting */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          With Formatting
        </Heading>
        <Grid gap={6}>
          <StyledSlider
            label="Price"
            defaultValue={500}
            minValue={0}
            maxValue={1000}
            step={50}
            formatOptions={{ style: "currency", currency: "USD" }}
            onChange={props.onChange}
          />
          <StyledSlider
            label="Discount"
            defaultValue={25}
            minValue={0}
            maxValue={100}
            formatOptions={{ style: "percent", maximumFractionDigits: 0 }}
            onChange={(v) => props.onChange?.(v / 100)}
          />
        </Grid>
      </div>

      {/* Disabled */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Disabled
        </Heading>
        <div style={{ "max-width": "28rem" }}>
          <StyledSlider label="Disabled Slider" defaultValue={50} isDisabled />
        </div>
      </div>

      {/* Without output */}
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Without Output
        </Heading>
        <div style={{ "max-width": "28rem" }}>
          <StyledSlider
            label="Brightness"
            defaultValue={75}
            showOutput={false}
            onChange={props.onChange}
          />
        </div>
      </div>

      <Text styles={typeRoles.meta}>
        Slider with keyboard support (arrows, Page Up/Down, Home/End) and drag functionality.
        Supports custom ranges, steps, and number formatting.
      </Text>
    </Flex>
  );
}

interface DemoActionItem {
  id: string;
  label: string;
  [key: string]: unknown;
}

function ActionGroupDemo(props: { onLastAction: (value: string) => void }) {
  const items: DemoActionItem[] = [
    { id: "cut", label: "Cut" },
    { id: "copy", label: "Copy" },
    { id: "paste", label: "Paste" },
  ];

  const [selectionMode, setSelectionMode] = createSignal<"none" | "single" | "multiple">("single");
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string | number>>(new Set(["copy"]));

  const handleSelectionChange = (keys: "all" | Set<string | number>) => {
    if (keys === "all") {
      return;
    }
    setSelectedKeys(keys);
    props.onLastAction(`ActionGroup selection: ${Array.from(keys).join(", ") || "none"}`);
  };

  return (
    <Flex direction="column" gap={4}>
      <Flex wrap gap={2}>
        <Button
          variant={selectionMode() === "none" ? "primary" : "secondary"}
          size="S"
          onPress={() => setSelectionMode("none")}
        >
          No selection
        </Button>
        <Button
          variant={selectionMode() === "single" ? "primary" : "secondary"}
          size="S"
          onPress={() => setSelectionMode("single")}
        >
          Single
        </Button>
        <Button
          variant={selectionMode() === "multiple" ? "primary" : "secondary"}
          size="S"
          onPress={() => setSelectionMode("multiple")}
        >
          Multiple
        </Button>
      </Flex>

      <StyledActionGroup<DemoActionItem>
        aria-label="Editor actions"
        items={items}
        selectionMode={selectionMode()}
        selectedKeys={selectedKeys()}
        onSelectionChange={handleSelectionChange}
        onAction={(key) => props.onLastAction(`ActionGroup action: ${String(key)}`)}
      >
        {(item) => item.label}
      </StyledActionGroup>

      <Text styles={typeRoles.meta}>
        Mode: {selectionMode()} | Selected: {Array.from(selectedKeys()).join(", ") || "none"}
      </Text>
    </Flex>
  );
}

function ToolbarDemo(props: { onLastAction: (value: string) => void }) {
  return (
    <Flex direction="column" gap={6}>
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Horizontal Toolbar
        </Heading>
        <StyledToolbar aria-label="Text formatting toolbar">
          <ActionButton size="S" onPress={() => props.onLastAction("Toolbar: bold")}>
            Bold
          </ActionButton>
          <ActionButton size="S" onPress={() => props.onLastAction("Toolbar: italic")}>
            Italic
          </ActionButton>
          <ActionButton size="S" onPress={() => props.onLastAction("Toolbar: underline")}>
            Underline
          </ActionButton>
        </StyledToolbar>
      </div>

      <div>
        <Heading level={4} styles={typeRoles.label}>
          Vertical Toolbar
        </Heading>
        <StyledToolbar orientation="vertical" aria-label="Edit toolbar">
          <ActionButton size="S">Cut</ActionButton>
          <ActionButton size="S">Copy</ActionButton>
          <ActionButton size="S">Paste</ActionButton>
        </StyledToolbar>
      </div>
    </Flex>
  );
}

function ActionBarDemo(props: { onLastAction: (value: string) => void }) {
  const [selectedCount, setSelectedCount] = createSignal(2);

  const clearSelection = () => {
    setSelectedCount(0);
    props.onLastAction("ActionBar: clear selection");
  };

  return (
    <Flex direction="column" gap={4}>
      <Flex wrap gap={2}>
        <Button
          size="S"
          variant="secondary"
          onPress={() => setSelectedCount((c) => Math.max(c - 1, 0))}
        >
          -1 selected
        </Button>
        <Button
          size="S"
          variant="secondary"
          onPress={() => setSelectedCount((c) => Math.min(c + 1, 9))}
        >
          +1 selected
        </Button>
        <Button size="S" variant="secondary" onPress={clearSelection}>
          Clear all
        </Button>
      </Flex>

      <StyledActionBarContainer>
        <Well>
          <Text styles={typeRoles.body}>Selected rows (mock): {selectedCount()}</Text>
        </Well>
        <StyledActionBar
          selectedItemCount={selectedCount()}
          onClearSelection={clearSelection}
          aria-label="Bulk actions toolbar"
        >
          <ActionButton size="S" onPress={() => props.onLastAction("ActionBar: archive")}>
            Archive
          </ActionButton>
          <ActionButton size="S" onPress={() => props.onLastAction("ActionBar: delete")}>
            Delete
          </ActionButton>
        </StyledActionBar>
      </StyledActionBarContainer>
    </Flex>
  );
}

// TagGroup Demo Components
interface TagItem {
  id: string;
  name: string;
}

function TagGroupDemo() {
  const [tags, setTags] = createSignal<TagItem[]>([
    { id: "1", name: "React" },
    { id: "2", name: "SolidJS" },
    { id: "3", name: "Vue" },
    { id: "4", name: "Angular" },
    { id: "5", name: "Svelte" },
  ]);

  const handleRemove = (keys: Set<string | number>) => {
    setTags((prev) => prev.filter((tag) => !keys.has(tag.id)));
  };

  return (
    <TagGroup label="Frameworks" items={tags()} onRemove={handleRemove}>
      {(item) => item.name}
    </TagGroup>
  );
}

function TagGroupSelectionDemo() {
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string | number>>(new Set(["ts"]));

  const items: TagItem[] = [
    { id: "ts", name: "TypeScript" },
    { id: "js", name: "JavaScript" },
    { id: "rust", name: "Rust" },
    { id: "go", name: "Go" },
    { id: "py", name: "Python" },
  ];

  const handleSelectionChange = (keys: "all" | Set<string | number>) => {
    if (keys === "all") {
      setSelectedKeys(new Set(items.map((i) => i.id)));
    } else {
      setSelectedKeys(keys);
    }
  };

  return (
    <Flex direction="column" gap={2}>
      <TagGroup
        label="Languages"
        items={items}
        selectionMode="multiple"
        selectedKeys={selectedKeys()}
        onSelectionChange={handleSelectionChange}
        variant="outline"
      >
        {(item) => item.name}
      </TagGroup>
      <Text styles={typeRoles.meta}>
        Selected: {Array.from(selectedKeys()).join(", ") || "None"}
      </Text>
    </Flex>
  );
}

// ============================================
// CALENDAR DEMOS
// ============================================

function CalendarDemo() {
  const [selectedDate, setSelectedDate] = createSignal<DateValue | null>(null);

  return (
    <Flex direction="column" gap={2}>
      <Calendar aria-label="Select a date" value={selectedDate()} onChange={setSelectedDate} />
      <Text styles={typeRoles.meta}>Selected: {selectedDate()?.toString() || "None"}</Text>
    </Flex>
  );
}

function CalendarDisabledDemo() {
  const today = new CalendarDate(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate(),
  );

  // Disable weekends
  const isDateUnavailable = (date: DateValue) => {
    const d = date as CalendarDateType;
    const jsDate = new Date(d.year, d.month - 1, d.day);
    const day = jsDate.getDay();
    return day === 0 || day === 6; // Sunday = 0, Saturday = 6
  };

  return (
    <Calendar
      aria-label="Select a weekday"
      isDateUnavailable={isDateUnavailable}
      defaultValue={today}
    />
  );
}

// ============================================
// DATEPICKER DEMOS
// ============================================

function DatePickerDemo() {
  const [selectedDate, setSelectedDate] = createSignal<DateValue | null>(null);

  return (
    <Flex direction="column" gap={2}>
      <DatePicker label="Event Date" value={selectedDate()} onChange={setSelectedDate} />
      <Text styles={typeRoles.meta}>Selected: {selectedDate()?.toString() || "None"}</Text>
    </Flex>
  );
}

function DatePickerRangeDemo() {
  const today = new CalendarDate(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    new Date().getDate(),
  );
  const minDate = today;
  const maxDate = new CalendarDate(today.year, today.month + 3, today.day);

  return (
    <DatePicker
      label="Booking Date"
      minValue={minDate}
      maxValue={maxDate}
      placeholderValue={today}
    />
  );
}

// ============================================
// Range Slider Demo
// ============================================

function RangeSliderDemo(props: { onChange?: (start: number, end: number) => void }) {
  const [range, setRange] = createSignal({ start: 20, end: 80 });

  return (
    <Flex direction="column" gap={8}>
      <div>
        <Heading level={4} styles={typeRoles.label}>
          Basic Range Slider
        </Heading>
        <div style={{ "max-width": "28rem" }}>
          <RangeSlider
            label="Price Range"
            value={range()}
            onChange={(val) => {
              setRange(val);
              props.onChange?.(val.start, val.end);
            }}
          />
        </div>
      </div>
      <div>
        <Heading level={4} styles={typeRoles.label}>
          With Formatting
        </Heading>
        <div style={{ "max-width": "28rem" }}>
          <RangeSlider
            label="Budget"
            defaultValue={{ start: 200, end: 800 }}
            minValue={0}
            maxValue={1000}
            step={50}
            formatOptions={{ style: "currency", currency: "USD" }}
          />
        </div>
      </div>
      <Text styles={typeRoles.meta}>
        Range: {range().start} – {range().end}
      </Text>
    </Flex>
  );
}

// ============================================
// Theme Info Display
// ============================================

function ThemeInfoDisplay() {
  try {
    const theme = useTheme();
    return (
      <Flex direction="column" gap={1}>
        <p>
          Color scheme: <strong>{theme?.colorScheme ?? "default"}</strong>
        </p>
        <p>
          Scale: <strong>{theme?.scale ?? "medium"}</strong>
        </p>
      </Flex>
    );
  } catch {
    return <Text styles={typeRoles.body}>No Provider context available — using defaults.</Text>;
  }
}
