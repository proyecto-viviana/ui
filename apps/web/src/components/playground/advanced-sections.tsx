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
  ComboBoxInputGroup as StyledComboBoxInputGroup,
  ComboBoxInput as StyledComboBoxInput,
  ComboBoxButton as StyledComboBoxButton,
  ComboBoxListBox as StyledComboBoxListBox,
  ComboBoxOption as StyledComboBoxOption,
  defaultContainsFilter,
  TextArea,
  AlertDialog,
  ActionMenu,
  RangeSlider,
  ContextualHelpTrigger,
  DropZone,
  FileTrigger,
  Flex,
  Grid,
  Provider,
  useTheme,
  TextField,
} from "@proyecto-viviana/solid-spectrum";
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
        class="lg:col-span-2"
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
        class="lg:col-span-2"
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
        class="lg:col-span-2"
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
        class="lg:col-span-2"
      >
        <StyledTabsDemo onSelectionChange={(key) => props.onLastAction(`Styled Tab: ${key}`)} />
      </Section>

      <Section
        id="styled-breadcrumbs"
        visibleSections={props.visibleSections}
        title="Styled Breadcrumbs (ui)"
        description="Pre-styled navigation breadcrumbs"
        class="lg:col-span-2"
      >
        <StyledBreadcrumbsDemo onNavigate={(path) => props.onLastAction(`Navigate: ${path}`)} />
      </Section>

      <Section
        id="styled-numberfield"
        visibleSections={props.visibleSections}
        title="Styled NumberField (ui)"
        description="Number input with increment/decrement buttons"
        class="lg:col-span-2"
      >
        <StyledNumberFieldDemo onChange={(value) => props.onLastAction(`NumberField: ${value}`)} />
      </Section>

      <Section
        id="styled-searchfield"
        visibleSections={props.visibleSections}
        title="Styled SearchField (ui)"
        description="Search input with clear button"
        class="lg:col-span-2"
      >
        <StyledSearchFieldDemo onSearch={(value) => props.onLastAction(`Search: ${value}`)} />
      </Section>

      <Section
        id="styled-slider"
        visibleSections={props.visibleSections}
        title="Styled Slider (ui)"
        description="Range input with draggable thumb"
        class="lg:col-span-2"
      >
        <StyledSliderDemo onChange={(value) => props.onLastAction(`Slider: ${value}`)} />
      </Section>

      <Section
        id="styled-combobox"
        visibleSections={props.visibleSections}
        title="Styled ComboBox (ui)"
        description="Filterable dropdown with text input"
        class="lg:col-span-2"
      >
        <StyledComboBoxDemo onSelectionChange={(key) => props.onLastAction(`ComboBox: ${key}`)} />
      </Section>

      <Section
        id="actiongroup"
        visibleSections={props.visibleSections}
        title="ActionGroup (ui)"
        description="Toolbar-like action cluster with optional selection modes"
        class="lg:col-span-2"
      >
        <ActionGroupDemo onLastAction={props.onLastAction} />
      </Section>

      <Section
        id="toolbar"
        visibleSections={props.visibleSections}
        title="Toolbar (ui)"
        description="Keyboard-navigable toolbar with orientation variants"
        class="lg:col-span-2"
      >
        <ToolbarDemo onLastAction={props.onLastAction} />
      </Section>

      <Section
        id="actionbar"
        visibleSections={props.visibleSections}
        title="ActionBar (ui)"
        description="Selection-aware bulk actions with escape-to-clear support"
        class="lg:col-span-2"
      >
        <ActionBarDemo onLastAction={props.onLastAction} />
      </Section>

      {/* Disclosure Section */}
      <Section
        id="disclosure"
        visibleSections={props.visibleSections}
        title="Disclosure"
        description="Expandable/collapsible content panels"
        class="lg:col-span-2"
      >
        <div class="space-y-6">
          {/* Headless Disclosure */}
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Headless Disclosure</h4>
            <HeadlessDisclosure>
              <HeadlessDisclosureTrigger class="w-full text-left p-3 bg-bg-400 rounded hover:bg-bg-300 transition-colors">
                Headless Toggle
              </HeadlessDisclosureTrigger>
              <HeadlessDisclosurePanel class="p-3 mt-1 bg-bg-300 rounded">
                This is a headless disclosure panel built from primitives.
              </HeadlessDisclosurePanel>
            </HeadlessDisclosure>
          </div>

          {/* Single Disclosure */}
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Single Disclosure (Styled)</h4>
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
            <h4 class="text-sm font-medium text-primary-300 mb-2">Accordion (Single Expand)</h4>
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
            <h4 class="text-sm font-medium text-primary-300 mb-2">Accordion (Multiple Expand)</h4>
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
            <h4 class="text-sm font-medium text-primary-300 mb-2">Variants</h4>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </div>
          </div>
        </div>
      </Section>

      {/* Meter Section */}
      <Section
        id="meter"
        visibleSections={props.visibleSections}
        title="Meter"
        description="Display a quantity within a known range"
      >
        <div class="space-y-6">
          {/* Sizes */}
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Sizes</h4>
            <div class="space-y-3">
              <Meter label="Storage Used" value={75} />
              <Meter label="Memory" value={45} size="S" />
              <Meter label="CPU" value={90} size="L" />
            </div>
          </div>

          {/* Color variants */}
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Color Variants</h4>
            <div class="space-y-3">
              <Meter label="Positive" value={30} variant="positive" />
              <Meter label="Notice" value={65} variant="notice" />
              <Meter label="Negative" value={85} variant="negative" />
              <Meter label="Informative" value={50} variant="informative" />
            </div>
          </div>

          {/* Without label */}
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Without Label</h4>
            <Meter value={60} aria-label="Progress" />
          </div>
        </div>
      </Section>

      {/* TagGroup Section */}
      <Section
        id="taggroup"
        visibleSections={props.visibleSections}
        title="TagGroup"
        description="Selectable and removable tag collections"
      >
        <div class="space-y-6">
          {/* Basic removable tags */}
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Removable Tags</h4>
            <TagGroupDemo />
          </div>

          {/* Selection */}
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Selectable Tags</h4>
            <TagGroupSelectionDemo />
          </div>

          {/* Variants */}
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Tag Variants</h4>
            <div class="space-y-4">
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
            </div>
          </div>

          {/* Sizes */}
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Tag Sizes</h4>
            <div class="space-y-4">
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
            </div>
          </div>
        </div>
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
        class="lg:col-span-2"
      >
        <div class="space-y-4">
          <p class="text-sm text-primary-300 mb-3">Click buttons to show toast notifications</p>
          <div class="flex flex-wrap gap-3">
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
              buttonStyle="outline"
              onPress={() => toastInfo("New features are available!")}
            >
              Info Toast
            </Button>
          </div>
          <div class="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              buttonStyle="outline"
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
              buttonStyle="outline"
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
          </div>
        </div>
      </Section>

      {/* DropZone Section */}
      <Section
        id="dropzone"
        visibleSections={props.visibleSections}
        title="DropZone"
        description="Drag and drop target for files"
        class="lg:col-span-2"
      >
        <div class="space-y-4">
          <DropZone
            data-testid="dropzone-active"
            aria-label="Upload files drop zone"
            onDrop={() => props.onLastAction("DropZone: drop event")}
            class="min-h-[120px] flex items-center justify-center"
          >
            <div class="text-center">
              <p class="text-primary-200 font-medium">Drop files here</p>
              <p class="text-primary-400 text-sm mt-1">or drag items over this area</p>
            </div>
          </DropZone>
          <DropZone
            data-testid="dropzone-disabled"
            aria-label="Disabled drop zone"
            isDisabled
            class="min-h-[80px] flex items-center justify-center"
          >
            <p class="text-primary-300 text-sm">Disabled drop zone</p>
          </DropZone>
        </div>
      </Section>

      {/* FileTrigger Section */}
      <Section
        id="filetrigger"
        visibleSections={props.visibleSections}
        title="FileTrigger"
        description="Open native file picker from custom trigger"
        class="lg:col-span-2"
      >
        <div class="space-y-4">
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
            <Button variant="secondary" buttonStyle="outline">
              Disabled picker
            </Button>
          </FileTrigger>
        </div>
      </Section>

      {/* ============================================ */}
      {/* TEXTAREA */}
      {/* ============================================ */}
      <Section
        id="textarea"
        visibleSections={props.visibleSections}
        title="TextArea"
        description="Multi-line text input with auto-resize"
        class="lg:col-span-2"
      >
        <div class="space-y-6">
          <div class="grid gap-6 sm:grid-cols-2">
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
          </div>
          <div class="grid gap-6 sm:grid-cols-3">
            <TextArea label="Small" size="sm" placeholder="Small..." />
            <TextArea label="Medium" size="md" placeholder="Medium..." />
            <TextArea label="Large" size="lg" placeholder="Large..." />
          </div>
          <TextArea label="Disabled" value="Cannot edit this" isDisabled />
        </div>
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
        <div class="space-y-4">
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
        </div>
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
        <div class="flex flex-wrap gap-4">
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
        </div>
      </Section>

      {/* ============================================ */}
      {/* RANGE SLIDER */}
      {/* ============================================ */}
      <Section
        id="rangeslider"
        visibleSections={props.visibleSections}
        title="Range Slider"
        description="Dual-thumb slider for selecting a range"
        class="lg:col-span-2"
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
        <div class="flex flex-wrap gap-4 items-center">
          <div class="flex items-center gap-2">
            <span class="text-sm text-primary-200">Setting Name</span>
            <ContextualHelpTrigger
              title="What is this?"
              content="This setting controls the behavior of the feature. Enabling it will allow the system to process requests in real-time."
            />
          </div>
          <div class="flex items-center gap-2">
            <span class="text-sm text-primary-200">Advanced Option</span>
            <ContextualHelpTrigger
              title="Advanced Configuration"
              content="This option is for advanced users. Changing it may affect system performance."
              variant="info"
            />
          </div>
        </div>
      </Section>

      {/* ============================================ */}
      {/* FLEX LAYOUT */}
      {/* ============================================ */}
      <Section
        id="flex"
        visibleSections={props.visibleSections}
        title="Flex Layout"
        description="Flexible box layout component"
        class="lg:col-span-2"
      >
        <div class="space-y-6">
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Row (default)</h4>
            <Flex gap="md" wrap>
              <Button variant="primary">Item 1</Button>
              <Button variant="secondary">Item 2</Button>
              <Button variant="accent">Item 3</Button>
            </Flex>
          </div>
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Column with alignment</h4>
            <Flex direction="column" gap="sm" alignItems="start">
              <Button variant="primary">First</Button>
              <Button variant="secondary">Second</Button>
              <Button variant="accent">Third</Button>
            </Flex>
          </div>
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Space between</h4>
            <Flex justifyContent="between" alignItems="center" class="bg-bg-300 p-4 rounded-lg">
              <span class="text-primary-200">Left</span>
              <span class="text-primary-200">Center</span>
              <span class="text-primary-200">Right</span>
            </Flex>
          </div>
        </div>
      </Section>

      {/* ============================================ */}
      {/* GRID LAYOUT */}
      {/* ============================================ */}
      <Section
        id="grid"
        visibleSections={props.visibleSections}
        title="Grid Layout"
        description="CSS Grid layout component"
        class="lg:col-span-2"
      >
        <div class="space-y-6">
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">3-column grid</h4>
            <Grid columns={3} gap="md">
              <div class="bg-accent/20 p-4 rounded-lg text-center text-primary-200">1</div>
              <div class="bg-accent/20 p-4 rounded-lg text-center text-primary-200">2</div>
              <div class="bg-accent/20 p-4 rounded-lg text-center text-primary-200">3</div>
              <div class="bg-accent/20 p-4 rounded-lg text-center text-primary-200">4</div>
              <div class="bg-accent/20 p-4 rounded-lg text-center text-primary-200">5</div>
              <div class="bg-accent/20 p-4 rounded-lg text-center text-primary-200">6</div>
            </Grid>
          </div>
          <div>
            <h4 class="text-sm font-medium text-primary-300 mb-2">Auto-fill responsive</h4>
            <Grid columns="repeat(auto-fill, minmax(120px, 1fr))" gap="sm">
              <div class="bg-primary-700/30 p-3 rounded text-center text-primary-300 text-sm">
                A
              </div>
              <div class="bg-primary-700/30 p-3 rounded text-center text-primary-300 text-sm">
                B
              </div>
              <div class="bg-primary-700/30 p-3 rounded text-center text-primary-300 text-sm">
                C
              </div>
              <div class="bg-primary-700/30 p-3 rounded text-center text-primary-300 text-sm">
                D
              </div>
              <div class="bg-primary-700/30 p-3 rounded text-center text-primary-300 text-sm">
                E
              </div>
            </Grid>
          </div>
        </div>
      </Section>

      {/* ============================================ */}
      {/* THEME / PROVIDER */}
      {/* ============================================ */}
      <Section
        id="theme"
        visibleSections={props.visibleSections}
        title="Theme / Provider"
        description="Theme context and color scheme switching"
        class="lg:col-span-2"
      >
        <div class="space-y-6">
          <p class="text-sm text-primary-300">
            The Provider component wraps your application and provides theme context including color
            scheme (light/dark) and scale.
          </p>
          <div class="grid gap-4 sm:grid-cols-2">
            <div class="p-4 rounded-lg bg-bg-200 border border-primary-700/30">
              <h4 class="text-sm font-medium text-primary-200 mb-2">Current Theme</h4>
              <ThemeInfoDisplay />
            </div>
            <div class="p-4 rounded-lg bg-bg-200 border border-primary-700/30">
              <h4 class="text-sm font-medium text-primary-200 mb-2">Usage</h4>
              <pre class="text-xs text-primary-400 font-mono whitespace-pre-wrap">{`<Provider colorScheme="dark">
  <App />
</Provider>`}</pre>
            </div>
          </div>
        </div>
      </Section>

      {/* ============================================ */}
      {/* NEW COMPONENTS (Phases 8-11) */}
      {/* ============================================ */}
      <Show when={hasVisibleDataColorSections()}>
        <Suspense
          fallback={
            <div class="lg:col-span-2 rounded-xl border border-primary-700/30 bg-bg-300/40 p-4 text-sm text-primary-400">
              Loading data/color sections...
            </div>
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
    <div class="space-y-6">
      {/* Basic Checkbox Group */}
      <div>
        <h3 class="text-sm font-medium text-primary-200 mb-3">Basic Group</h3>
        <div {...(groupProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)} class="space-y-2">
          <span {...labelProps} class="text-sm font-medium text-primary-100 block mb-2">
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
        <p class="mt-2 text-xs text-primary-400">Selected: {state.value().join(", ") || "none"}</p>
      </div>

      {/* Disabled & Read-only Examples */}
      <div class="grid gap-4 sm:grid-cols-2">
        <div>
          <h3 class="text-sm font-medium text-primary-200 mb-3">Disabled Checkbox</h3>
          <DisabledCheckboxDemo />
        </div>
        <div>
          <h3 class="text-sm font-medium text-primary-200 mb-3">Read-only Checkbox</h3>
          <ReadonlyCheckboxDemo />
        </div>
      </div>
    </div>
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
    <label
      class={`flex items-center gap-3 cursor-pointer group ${
        props.isDisabled ? "opacity-50 cursor-not-allowed" : ""
      }`}
    >
      <div class="relative">
        <input
          ref={(el) => (inputRef = el)}
          type="checkbox"
          value={props.value}
          {...(getInputProps() as JSX.InputHTMLAttributes<HTMLInputElement>)}
          class="peer sr-only"
        />
        <div
          class={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center
            ${
              isChecked()
                ? "bg-accent border-accent"
                : "border-primary-400 group-hover:border-primary-200"
            }
            ${props.isDisabled ? "" : "peer-focus-visible:ring-2 peer-focus-visible:ring-accent peer-focus-visible:ring-offset-2 peer-focus-visible:ring-offset-bg-200"}
          `}
        >
          {isChecked() && (
            <svg class="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none">
              <path
                d="M2 6L5 9L10 3"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          )}
        </div>
      </div>
      <span class="text-sm text-primary-200">{props.children}</span>
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
    <div {...(groupProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)} class="space-y-2">
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
    <div {...(groupProps as unknown as JSX.HTMLAttributes<HTMLDivElement>)} class="space-y-2">
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
    <div class="space-y-4">
      <ListBox
        items={listBoxItems}
        getKey={(item) => item.id}
        selectionMode="single"
        onSelectionChange={(keys) => {
          const key = [...keys][0];
          if (key) props.onSelectionChange?.(key);
        }}
        aria-label="Choose a framework"
        class="border border-primary-600 rounded-lg overflow-hidden bg-bg-300 max-h-64 overflow-y-auto"
      >
        {(item) => (
          <ListBoxOption
            id={item.id}
            item={item}
            class="px-4 py-3 cursor-pointer outline-none transition-colors data-selected:bg-accent/20 data-focused:bg-primary-700"
          >
            <div class="flex items-center justify-between">
              <div>
                <div class="font-medium text-primary-100">{item.name}</div>
                <div class="text-sm text-primary-400">{item.description}</div>
              </div>
            </div>
          </ListBoxOption>
        )}
      </ListBox>
      <p class="text-xs text-primary-400">Use arrow keys to navigate, Enter/Space to select</p>
    </div>
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
    <div class="space-y-6">
      {/* Basic Menu */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-2">Basic Menu</h4>
        <MenuTrigger>
          <MenuButton class="px-4 py-2 bg-primary-700 hover:bg-primary-600 text-primary-100 rounded-lg border border-primary-500 transition-colors flex items-center gap-2">
            Actions
            <span class="text-xs">▼</span>
          </MenuButton>
          <Menu
            items={menuItems}
            getKey={(item) => item.id}
            onAction={(key) => props.onAction?.(String(key))}
            aria-label="Actions menu"
            class="absolute mt-1 min-w-48 bg-bg-200 border border-primary-600 rounded-lg shadow-xl overflow-hidden z-50"
          >
            {(item) => (
              <MenuItem
                id={item.id}
                class={`px-4 py-2 cursor-pointer outline-none transition-colors ${
                  item.variant === "danger"
                    ? "data-focused:bg-danger/20 text-danger"
                    : "data-focused:bg-primary-700 text-primary-100"
                }`}
              >
                {item.label}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
      </div>

      {/* Menu with Disabled Items */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-2">Menu with Disabled Items</h4>
        <MenuTrigger>
          <MenuButton class="px-4 py-2 bg-primary-700 hover:bg-primary-600 text-primary-100 rounded-lg border border-primary-500 transition-colors flex items-center gap-2">
            Menu with Disabled
            <span class="text-xs">▼</span>
          </MenuButton>
          <Menu
            items={menuItemsWithDisabled}
            getKey={(item) => item.id}
            disabledKeys={["item2", "item3"]}
            onAction={(key) => props.onAction?.(String(key))}
            aria-label="Menu with disabled items"
            class="absolute mt-1 min-w-48 bg-bg-200 border border-primary-600 rounded-lg shadow-xl overflow-hidden z-50"
          >
            {(item) => (
              <MenuItem
                id={item.id}
                class="px-4 py-2 cursor-pointer outline-none transition-colors data-focused:bg-primary-700 text-primary-100 data-disabled:opacity-50 data-disabled:cursor-not-allowed"
              >
                {item.label}
              </MenuItem>
            )}
          </Menu>
        </MenuTrigger>
        <p class="text-xs text-primary-400 mt-2">
          Items 2 and 3 are disabled. Arrow keys should skip them.
        </p>
      </div>

      <p class="text-xs text-primary-400">
        Click button to open, use arrow keys to navigate, Enter to select, Escape to close
      </p>
    </div>
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
    <div class="space-y-6">
      <div class="grid gap-6 sm:grid-cols-2">
        {/* Basic Select */}
        <div>
          <h4 class="text-sm font-medium text-primary-200 mb-2">Basic Select</h4>
          <Select
            items={selectItems}
            getKey={(item) => item.id}
            selectedKey={selectedKey()}
            onSelectionChange={handleChange}
            aria-label="Choose a breakpoint"
          >
            <SelectTrigger class="w-full px-4 py-2 bg-bg-300 border border-primary-600 rounded-lg text-primary-100 flex items-center justify-between hover:border-primary-400 transition-colors">
              <SelectValue placeholder="Select a size..." />
              <span class="text-primary-400">▼</span>
            </SelectTrigger>
            <SelectListBox class="absolute mt-1 w-full bg-bg-200 border border-primary-600 rounded-lg shadow-xl overflow-hidden z-50">
              {(item: SelectDemoItem) => (
                <SelectOption
                  id={item.id}
                  item={item}
                  class="px-4 py-2 cursor-pointer outline-none transition-colors data-selected:bg-accent/20 data-selected:text-accent data-focused:bg-primary-700 text-primary-100"
                >
                  <div class="flex items-center justify-between">
                    <div>
                      <span class="font-medium">{item.label}</span>
                      <span class="text-sm text-primary-400 ml-2">({item.size})</span>
                    </div>
                  </div>
                </SelectOption>
              )}
            </SelectListBox>
          </Select>
        </div>

        {/* Disabled Select */}
        <div>
          <h4 class="text-sm font-medium text-primary-200 mb-2">Disabled Select</h4>
          <Select
            items={selectItems}
            getKey={(item) => item.id}
            defaultSelectedKey="lg"
            isDisabled
            aria-label="Disabled select"
          >
            <SelectTrigger class="w-full px-4 py-2 bg-bg-300 border border-primary-600 rounded-lg text-primary-400 flex items-center justify-between opacity-50 cursor-not-allowed">
              <SelectValue placeholder="Select..." />
              <span class="text-primary-400">▼</span>
            </SelectTrigger>
            <SelectListBox class="hidden">
              {(item: SelectDemoItem) => (
                <SelectOption id={item.id} item={item}>
                  {item.label}
                </SelectOption>
              )}
            </SelectListBox>
          </Select>
        </div>
      </div>

      <div>
        <p class="text-xs text-primary-400">
          Click to open dropdown, use arrow keys to navigate options, Enter/Space to select, Escape
          to close. The selected value is:{" "}
          <strong class="text-primary-200">{selectedKey() || "none"}</strong>
        </p>
      </div>
    </div>
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
    <div class="space-y-6">
      <div class="grid gap-6 sm:grid-cols-3">
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
      </div>
      <p class="text-xs text-primary-400">
        Pre-styled Select with size variants. Selected:{" "}
        <strong class="text-primary-200">{selectedKey() || "none"}</strong>
      </p>
    </div>
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
    <div class="space-y-4">
      <div class="flex gap-4 flex-wrap">
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
      </div>
      <p class="text-xs text-primary-400">
        Pre-styled Menu with button variants (primary, secondary, quiet) and size options.
      </p>
    </div>
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
    <div class="grid gap-6 sm:grid-cols-3">
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
    </div>
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
    <div class="space-y-8">
      {/* Underline variant (default) */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Underline Variant</h4>
        <StyledTabs<TabItem>
          items={tabItems}
          getKey={(item: TabItem) => item.id}
          getTextValue={(item: TabItem) => item.label}
          selectedKey={selectedKey()}
          onSelectionChange={handleChange}
          variant="underline"
        >
          <StyledTabList>
            {(item: TabItem) => <StyledTab id={item.id}>{item.label}</StyledTab>}
          </StyledTabList>
          <StyledTabPanel>
            {() => {
              const selected = tabItems.find((item: TabItem) => item.id === selectedKey());
              return <p class="text-primary-300">{selected?.content}</p>;
            }}
          </StyledTabPanel>
        </StyledTabs>
      </div>

      {/* Pill variant */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Pill Variant</h4>
        <StyledTabs<TabItem>
          items={tabItems}
          getKey={(item: TabItem) => item.id}
          getTextValue={(item: TabItem) => item.label}
          defaultSelectedKey="features"
          variant="pill"
        >
          <StyledTabList>
            {(item: TabItem) => <StyledTab id={item.id}>{item.label}</StyledTab>}
          </StyledTabList>
          <StyledTabPanel>
            <p class="text-primary-300">{tabItems[1].content}</p>
          </StyledTabPanel>
        </StyledTabs>
      </div>

      {/* Boxed variant with sizes */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Boxed Variant with Sizes</h4>
        <div class="grid gap-6 sm:grid-cols-3">
          {/* Small */}
          <StyledTabs<TabItem>
            items={tabItems.slice(0, 3)}
            getKey={(item: TabItem) => item.id}
            getTextValue={(item: TabItem) => item.label}
            defaultSelectedKey="overview"
            variant="boxed"
            size="sm"
          >
            <StyledTabList>
              {(item: TabItem) => <StyledTab id={item.id}>{item.label}</StyledTab>}
            </StyledTabList>
            <StyledTabPanel>
              <p class="text-primary-400 text-sm">Small tabs content</p>
            </StyledTabPanel>
          </StyledTabs>

          {/* Medium */}
          <StyledTabs<TabItem>
            items={tabItems.slice(0, 3)}
            getKey={(item: TabItem) => item.id}
            getTextValue={(item: TabItem) => item.label}
            defaultSelectedKey="overview"
            variant="boxed"
            size="md"
          >
            <StyledTabList>
              {(item: TabItem) => <StyledTab id={item.id}>{item.label}</StyledTab>}
            </StyledTabList>
            <StyledTabPanel>
              <p class="text-primary-300">Medium tabs content</p>
            </StyledTabPanel>
          </StyledTabs>

          {/* Large */}
          <StyledTabs<TabItem>
            items={tabItems.slice(0, 3)}
            getKey={(item: TabItem) => item.id}
            getTextValue={(item: TabItem) => item.label}
            defaultSelectedKey="overview"
            variant="boxed"
            size="lg"
          >
            <StyledTabList>
              {(item: TabItem) => <StyledTab id={item.id}>{item.label}</StyledTab>}
            </StyledTabList>
            <StyledTabPanel>
              <p class="text-primary-200">Large tabs content</p>
            </StyledTabPanel>
          </StyledTabs>
        </div>
      </div>

      <p class="text-xs text-primary-400">
        Pre-styled Tabs with variants (underline, pill, boxed) and sizes (sm, md, lg). Use arrow
        keys to navigate between tabs.
      </p>
    </div>
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
    <div class="space-y-8">
      {/* Default variant */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Default Variant</h4>
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
        <h4 class="text-sm font-medium text-primary-200 mb-3">Subtle Variant</h4>
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
        <h4 class="text-sm font-medium text-primary-200 mb-3">Size Variants</h4>
        <div class="space-y-4">
          {/* Small */}
          <div>
            <span class="text-xs text-primary-400 block mb-1">Small:</span>
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
            <span class="text-xs text-primary-400 block mb-1">Medium:</span>
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
            <span class="text-xs text-primary-400 block mb-1">Large:</span>
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
        </div>
      </div>

      <p class="text-xs text-primary-400">
        Pre-styled Breadcrumbs with variants (default, subtle) and sizes (sm, md, lg). Click items
        to navigate.
      </p>
    </div>
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
    <div class="space-y-8">
      {/* Basic NumberField */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Basic NumberField</h4>
        <div class="max-w-xs">
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
        <h4 class="text-sm font-medium text-primary-200 mb-3">Size Variants</h4>
        <div class="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>
      </div>

      {/* With min/max constraints */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">With Min/Max Constraints (0-10)</h4>
        <div class="max-w-xs">
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
        <h4 class="text-sm font-medium text-primary-200 mb-3">Currency Formatting</h4>
        <div class="max-w-xs">
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
        <h4 class="text-sm font-medium text-primary-200 mb-3">Percent Formatting</h4>
        <div class="max-w-xs">
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
        <h4 class="text-sm font-medium text-primary-200 mb-3">States</h4>
        <div class="grid gap-6 sm:grid-cols-2">
          <StyledNumberField label="Disabled" defaultValue={42} isDisabled />
          <StyledNumberField
            label="Invalid"
            defaultValue={-5}
            isInvalid
            errorMessage="Value must be positive"
          />
        </div>
      </div>

      {/* Hidden stepper */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Hidden Stepper (keyboard only)</h4>
        <div class="max-w-xs">
          <StyledNumberField
            label="Amount"
            defaultValue={100}
            hideStepper
            description="Use arrow keys to adjust"
          />
        </div>
      </div>

      <p class="text-xs text-primary-400">
        NumberField with increment/decrement buttons. Supports keyboard navigation (arrows, Page
        Up/Down, Home/End), number formatting (currency, percent), min/max constraints, and step
        values.
      </p>
    </div>
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
    <div class="space-y-8">
      {/* Basic SearchField */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Basic SearchField</h4>
        <div class="max-w-md">
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
        <h4 class="text-sm font-medium text-primary-200 mb-3">Size Variants</h4>
        <div class="grid gap-6 sm:grid-cols-3">
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
        </div>
      </div>

      {/* Variant styles */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Variants</h4>
        <div class="grid gap-6 sm:grid-cols-2">
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
        </div>
      </div>

      {/* With description */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">With Description</h4>
        <div class="max-w-md">
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
        <h4 class="text-sm font-medium text-primary-200 mb-3">States</h4>
        <div class="grid gap-6 sm:grid-cols-2">
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
        </div>
      </div>

      {/* Without search icon */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Hidden Search Icon</h4>
        <div class="max-w-md">
          <StyledSearchField
            label="Filter"
            placeholder="Filter items..."
            hideSearchIcon
            onSubmit={handleSubmit}
          />
        </div>
      </div>

      <p class="text-xs text-primary-400">
        SearchField with clear button. Press Enter to submit, Escape to clear. The clear button
        appears when there's text in the field.
      </p>
    </div>
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
    <div class="space-y-8">
      {/* Basic ComboBox */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Basic ComboBox with Filtering</h4>
        <div class="max-w-md">
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
            <StyledComboBoxInputGroup>
              <StyledComboBoxInput />
              <StyledComboBoxButton />
            </StyledComboBoxInputGroup>
            <StyledComboBoxListBox>
              {(item: ComboBoxItem) => (
                <StyledComboBoxOption id={item.id}>
                  <div class="flex justify-between items-center w-full">
                    <span>{item.name}</span>
                    <span class="text-xs text-primary-400">{item.category}</span>
                  </div>
                </StyledComboBoxOption>
              )}
            </StyledComboBoxListBox>
          </StyledComboBox>
        </div>
      </div>

      {/* Size variants */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Size Variants</h4>
        <div class="grid gap-6 sm:grid-cols-3">
          <StyledComboBox<ComboBoxItem>
            items={comboBoxItems}
            getKey={(item: ComboBoxItem) => item.id}
            getTextValue={(item: ComboBoxItem) => item.name}
            defaultFilter={defaultContainsFilter}
            size="sm"
            label="Small"
            placeholder="Filter..."
          >
            <StyledComboBoxInputGroup>
              <StyledComboBoxInput />
              <StyledComboBoxButton />
            </StyledComboBoxInputGroup>
            <StyledComboBoxListBox>
              {(item: ComboBoxItem) => (
                <StyledComboBoxOption id={item.id}>{item.name}</StyledComboBoxOption>
              )}
            </StyledComboBoxListBox>
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
            <StyledComboBoxInputGroup>
              <StyledComboBoxInput />
              <StyledComboBoxButton />
            </StyledComboBoxInputGroup>
            <StyledComboBoxListBox>
              {(item: ComboBoxItem) => (
                <StyledComboBoxOption id={item.id}>{item.name}</StyledComboBoxOption>
              )}
            </StyledComboBoxListBox>
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
            <StyledComboBoxInputGroup>
              <StyledComboBoxInput />
              <StyledComboBoxButton />
            </StyledComboBoxInputGroup>
            <StyledComboBoxListBox>
              {(item: ComboBoxItem) => (
                <StyledComboBoxOption id={item.id}>{item.name}</StyledComboBoxOption>
              )}
            </StyledComboBoxListBox>
          </StyledComboBox>
        </div>
      </div>

      {/* With description and validation */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">With Description & Validation</h4>
        <div class="grid gap-6 sm:grid-cols-2">
          <StyledComboBox<ComboBoxItem>
            items={comboBoxItems}
            getKey={(item: ComboBoxItem) => item.id}
            getTextValue={(item: ComboBoxItem) => item.name}
            defaultFilter={defaultContainsFilter}
            label="Favorite Food"
            placeholder="Start typing..."
            description="Choose your favorite food from the list"
          >
            <StyledComboBoxInputGroup>
              <StyledComboBoxInput />
              <StyledComboBoxButton />
            </StyledComboBoxInputGroup>
            <StyledComboBoxListBox>
              {(item: ComboBoxItem) => (
                <StyledComboBoxOption id={item.id}>{item.name}</StyledComboBoxOption>
              )}
            </StyledComboBoxListBox>
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
            <StyledComboBoxInputGroup>
              <StyledComboBoxInput />
              <StyledComboBoxButton />
            </StyledComboBoxInputGroup>
            <StyledComboBoxListBox>
              {(item: ComboBoxItem) => (
                <StyledComboBoxOption id={item.id}>{item.name}</StyledComboBoxOption>
              )}
            </StyledComboBoxListBox>
          </StyledComboBox>
        </div>
      </div>

      {/* Disabled state */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Disabled</h4>
        <div class="max-w-md">
          <StyledComboBox<ComboBoxItem>
            items={comboBoxItems}
            getKey={(item: ComboBoxItem) => item.id}
            getTextValue={(item: ComboBoxItem) => item.name}
            defaultSelectedKey="apple"
            isDisabled
            label="Disabled ComboBox"
          >
            <StyledComboBoxInputGroup>
              <StyledComboBoxInput />
              <StyledComboBoxButton />
            </StyledComboBoxInputGroup>
            <StyledComboBoxListBox>
              {(item: ComboBoxItem) => (
                <StyledComboBoxOption id={item.id}>{item.name}</StyledComboBoxOption>
              )}
            </StyledComboBoxListBox>
          </StyledComboBox>
        </div>
      </div>

      <p class="text-xs text-primary-400">
        ComboBox combines a text input with a filterable listbox. Type to filter options, use arrow
        keys to navigate, Enter to select, Escape to close. Selected:{" "}
        <strong class="text-primary-200">{selectedKey() || "none"}</strong>
      </p>
    </div>
  );
}

function StyledSliderDemo(props: { onChange?: (value: number) => void }) {
  const [value, setValue] = createSignal(50);

  const handleChange = (newValue: number) => {
    setValue(newValue);
    props.onChange?.(newValue);
  };

  return (
    <div class="space-y-8">
      {/* Basic Slider */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Basic Slider</h4>
        <div class="max-w-md">
          <StyledSlider label="Volume" value={value()} onChange={handleChange} />
        </div>
      </div>

      {/* Size variants */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Size Variants</h4>
        <div class="grid gap-6">
          <StyledSlider label="Small" defaultValue={30} size="sm" onChange={props.onChange} />
          <StyledSlider
            label="Medium (default)"
            defaultValue={50}
            size="md"
            onChange={props.onChange}
          />
          <StyledSlider label="Large" defaultValue={70} size="lg" onChange={props.onChange} />
        </div>
      </div>

      {/* Variant styles */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Variants</h4>
        <div class="grid gap-6">
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
        </div>
      </div>

      {/* Custom range and step */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Custom Range and Step</h4>
        <div class="grid gap-6">
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
        </div>
      </div>

      {/* With formatting */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">With Formatting</h4>
        <div class="grid gap-6">
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
        </div>
      </div>

      {/* Disabled */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Disabled</h4>
        <div class="max-w-md">
          <StyledSlider label="Disabled Slider" defaultValue={50} isDisabled />
        </div>
      </div>

      {/* Without output */}
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Without Output</h4>
        <div class="max-w-md">
          <StyledSlider
            label="Brightness"
            defaultValue={75}
            showOutput={false}
            onChange={props.onChange}
          />
        </div>
      </div>

      <p class="text-xs text-primary-400">
        Slider with keyboard support (arrows, Page Up/Down, Home/End) and drag functionality.
        Supports custom ranges, steps, and number formatting.
      </p>
    </div>
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
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <Button
          variant={selectionMode() === "none" ? "primary" : "secondary"}
          size="sm"
          onPress={() => setSelectionMode("none")}
        >
          No selection
        </Button>
        <Button
          variant={selectionMode() === "single" ? "primary" : "secondary"}
          size="sm"
          onPress={() => setSelectionMode("single")}
        >
          Single
        </Button>
        <Button
          variant={selectionMode() === "multiple" ? "primary" : "secondary"}
          size="sm"
          onPress={() => setSelectionMode("multiple")}
        >
          Multiple
        </Button>
      </div>

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

      <p class="text-xs text-primary-400">
        Mode: {selectionMode()} | Selected: {Array.from(selectedKeys()).join(", ") || "none"}
      </p>
    </div>
  );
}

function ToolbarDemo(props: { onLastAction: (value: string) => void }) {
  return (
    <div class="space-y-6">
      <div>
        <h4 class="text-sm font-medium text-primary-300 mb-2">Horizontal Toolbar</h4>
        <StyledToolbar aria-label="Text formatting toolbar">
          <button
            type="button"
            class="rounded bg-bg-200 px-3 py-1 text-sm text-primary-200 hover:bg-bg-100"
            onClick={() => props.onLastAction("Toolbar: bold")}
          >
            Bold
          </button>
          <button
            type="button"
            class="rounded bg-bg-200 px-3 py-1 text-sm text-primary-200 hover:bg-bg-100"
            onClick={() => props.onLastAction("Toolbar: italic")}
          >
            Italic
          </button>
          <button
            type="button"
            class="rounded bg-bg-200 px-3 py-1 text-sm text-primary-200 hover:bg-bg-100"
            onClick={() => props.onLastAction("Toolbar: underline")}
          >
            Underline
          </button>
        </StyledToolbar>
      </div>

      <div>
        <h4 class="text-sm font-medium text-primary-300 mb-2">Vertical Toolbar</h4>
        <StyledToolbar orientation="vertical" variant="bordered" aria-label="Edit toolbar">
          <button
            type="button"
            class="rounded bg-bg-200 px-3 py-1 text-sm text-primary-200 hover:bg-bg-100"
          >
            Cut
          </button>
          <button
            type="button"
            class="rounded bg-bg-200 px-3 py-1 text-sm text-primary-200 hover:bg-bg-100"
          >
            Copy
          </button>
          <button
            type="button"
            class="rounded bg-bg-200 px-3 py-1 text-sm text-primary-200 hover:bg-bg-100"
          >
            Paste
          </button>
        </StyledToolbar>
      </div>
    </div>
  );
}

function ActionBarDemo(props: { onLastAction: (value: string) => void }) {
  const [selectedCount, setSelectedCount] = createSignal(2);

  const clearSelection = () => {
    setSelectedCount(0);
    props.onLastAction("ActionBar: clear selection");
  };

  return (
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          onPress={() => setSelectedCount((c) => Math.max(c - 1, 0))}
        >
          -1 selected
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => setSelectedCount((c) => Math.min(c + 1, 9))}
        >
          +1 selected
        </Button>
        <Button size="sm" variant="secondary" onPress={clearSelection}>
          Clear all
        </Button>
      </div>

      <StyledActionBarContainer>
        <div class="rounded-lg border border-primary-700/30 bg-bg-300 p-4 text-sm text-primary-200">
          Selected rows (mock): {selectedCount()}
        </div>
        <StyledActionBar
          selectedItemCount={selectedCount()}
          onClearSelection={clearSelection}
          aria-label="Bulk actions toolbar"
        >
          <button
            type="button"
            class="rounded bg-bg-400 px-3 py-1 text-sm text-primary-100 hover:bg-bg-500"
            onClick={() => props.onLastAction("ActionBar: archive")}
          >
            Archive
          </button>
          <button
            type="button"
            class="rounded bg-bg-400 px-3 py-1 text-sm text-primary-100 hover:bg-bg-500"
            onClick={() => props.onLastAction("ActionBar: delete")}
          >
            Delete
          </button>
        </StyledActionBar>
      </StyledActionBarContainer>
    </div>
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
    <div class="space-y-2">
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
      <p class="text-xs text-primary-400">
        Selected: {Array.from(selectedKeys()).join(", ") || "None"}
      </p>
    </div>
  );
}

// ============================================
// CALENDAR DEMOS
// ============================================

function CalendarDemo() {
  const [selectedDate, setSelectedDate] = createSignal<DateValue | null>(null);

  return (
    <div class="space-y-2">
      <Calendar aria-label="Select a date" value={selectedDate()} onChange={setSelectedDate} />
      <p class="text-xs text-primary-400">Selected: {selectedDate()?.toString() || "None"}</p>
    </div>
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
    <div class="space-y-2">
      <DatePicker label="Event Date" value={selectedDate()} onChange={setSelectedDate} />
      <p class="text-xs text-primary-400">Selected: {selectedDate()?.toString() || "None"}</p>
    </div>
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
    <div class="space-y-8">
      <div>
        <h4 class="text-sm font-medium text-primary-200 mb-3">Basic Range Slider</h4>
        <div class="max-w-md">
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
        <h4 class="text-sm font-medium text-primary-200 mb-3">With Formatting</h4>
        <div class="max-w-md">
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
      <p class="text-xs text-primary-400">
        Range: {range().start} – {range().end}
      </p>
    </div>
  );
}

// ============================================
// Theme Info Display
// ============================================

function ThemeInfoDisplay() {
  try {
    const theme = useTheme();
    return (
      <div class="space-y-1 text-sm text-primary-300">
        <p>
          Color scheme: <strong class="text-primary-200">{theme?.colorScheme ?? "default"}</strong>
        </p>
        <p>
          Scale: <strong class="text-primary-200">{theme?.scale ?? "medium"}</strong>
        </p>
      </div>
    );
  } catch {
    return <p class="text-sm text-primary-400">No Provider context available — using defaults.</p>;
  }
}
