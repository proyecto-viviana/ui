import { type Accessor, createSignal, For, type JSX } from "solid-js";
import {
  RangeCalendar,
  DateField,
  TimeField,
  DateRangePicker,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
  ColorEditor,
} from "@proyecto-viviana/solid-spectrum";
import {
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
  type RangeValue,
  type TimeValue,
  parseColor,
  type Color,
} from "@proyecto-viviana/solid-stately";
// Page chrome — layout, type, and status colour — comes from the app-facing design system.
// The demos themselves stay on the packages they document: the collections and colour
// pickers below are the UNSTYLED solidaria primitives, so the state styling they need
// (`data-selected`, hover, thumb geometry) lives in styles/headless-demos.css, which is
// itself written entirely against viviana-ui tokens.
import { Badge, Flex, Grid, Text, typeRoles } from "@proyecto-viviana/ui";
import { Section, type SectionId } from "@/components/playground/sections";

export interface PlaygroundDataColorSectionsProps {
  visibleSections: Accessor<Set<SectionId>>;
}

export function PlaygroundDataColorSections(props: PlaygroundDataColorSectionsProps) {
  return (
    <>
      <Section
        id="table"
        visibleSections={props.visibleSections}
        title="Table"
        description="Data tables with sorting, selection, and keyboard navigation"
        wide
      >
        <TableDemo />
      </Section>

      <Section
        id="gridlist"
        visibleSections={props.visibleSections}
        title="GridList"
        description="Keyboard-navigable grid of selectable items"
      >
        <GridListDemo />
      </Section>

      <Section
        id="tree"
        visibleSections={props.visibleSections}
        title="Tree"
        description="Hierarchical tree view with expand/collapse"
      >
        <TreeDemo />
      </Section>

      <Section
        id="rangecalendar"
        visibleSections={props.visibleSections}
        title="Range Calendar"
        description="Select a date range"
      >
        <RangeCalendarDemo />
      </Section>

      <Section
        id="datefield"
        visibleSections={props.visibleSections}
        title="Date Field"
        description="Keyboard-editable date input with segments"
      >
        <DateFieldDemo />
      </Section>

      <Section
        id="timefield"
        visibleSections={props.visibleSections}
        title="Time Field"
        description="Keyboard-editable time input with segments"
      >
        <TimeFieldDemo />
      </Section>

      <Section
        id="colorslider"
        visibleSections={props.visibleSections}
        title="Color Slider"
        description="Adjust a single color channel"
      >
        <ColorSliderDemo />
      </Section>

      <Section
        id="colorarea"
        visibleSections={props.visibleSections}
        title="Color Area"
        description="2D color picker for saturation and brightness"
      >
        <ColorAreaDemo />
      </Section>

      <Section
        id="colorwheel"
        visibleSections={props.visibleSections}
        title="Color Wheel"
        description="Circular hue selector"
      >
        <ColorWheelDemo />
      </Section>

      <Section
        id="colorfield"
        visibleSections={props.visibleSections}
        title="Color Field"
        description="Text input for color values"
      >
        <ColorFieldDemo />
      </Section>

      <Section
        id="colorswatch"
        visibleSections={props.visibleSections}
        title="Color Swatch"
        description="Display a color preview"
      >
        <ColorSwatchDemo />
      </Section>

      <Section
        id="daterangepicker"
        visibleSections={props.visibleSections}
        title="Date Range Picker"
        description="Select a start and end date with calendar popup"
        wide
      >
        <DateRangePickerDemo />
      </Section>

      <Section
        id="colorswatchpicker"
        visibleSections={props.visibleSections}
        title="Color Swatch Picker"
        description="Pick a color from a palette of swatches"
      >
        <ColorSwatchPickerDemo />
      </Section>

      <Section
        id="coloreditor"
        visibleSections={props.visibleSections}
        title="Color Editor"
        description="Full-featured color editing widget"
      >
        <ColorEditorDemo />
      </Section>
    </>
  );
}

// ============================================
// SHARED DEMO PIECES
// ============================================

/**
 * The "Selected: …" / "Value: …" line every demo closes with.
 *
 * Carries `data-testid` because the e2e specs assert on these readouts. They
 * used to select them by tag, which broke the moment the Glasselated rebuild
 * swapped `<p>` for solid-spectrum `<Text>` (a `<span>`). The testid is the
 * contract; the element is free to change.
 */
function DemoReadout(props: { children: JSX.Element }) {
  return (
    <Text styles={typeRoles.meta} data-testid="demo-readout">
      {props.children}
    </Text>
  );
}

/** A colour chip beside its value, shared by the five picker demos. */
function ColorReadout(props: { color: string; children: JSX.Element }) {
  return (
    <Flex alignItems="center" gap={2}>
      <div class="hd-color-preview" style={{ background: props.color }} />
      <Text styles={typeRoles.meta}>{props.children}</Text>
    </Flex>
  );
}

// ============================================
// TABLE DEMO
// ============================================

type TableRowData = {
  id: string;
  name: string;
  role: string;
  status: "Active" | "Away" | "Offline";
};

// The status trio maps onto the design system's semantic badge variants rather than a
// hand-picked pair of background/foreground colours per state.
const statusVariant = {
  Active: "success",
  Away: "warning",
  Offline: "neutral",
} as const;

function TableDemo() {
  const columns = [
    { key: "name", name: "Name" },
    { key: "role", name: "Role" },
    { key: "status", name: "Status" },
  ];

  const rows: TableRowData[] = [
    { id: "1", name: "Alice Johnson", role: "Developer", status: "Active" },
    { id: "2", name: "Bob Smith", role: "Designer", status: "Active" },
    { id: "3", name: "Carol White", role: "Manager", status: "Away" },
    { id: "4", name: "David Brown", role: "Developer", status: "Active" },
    { id: "5", name: "Eve Davis", role: "QA Engineer", status: "Offline" },
  ];

  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set());

  return (
    <Flex direction="column" gap={2}>
      <Table<TableRowData>
        aria-label="Team members"
        items={rows}
        columns={columns}
        getKey={(item) => item.id}
        selectionMode="multiple"
        selectedKeys={selectedKeys()}
        onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
        class={`hd-table ${typeRoles.body}`}
      >
        {() => (
          <>
            <TableHeader>
              <For each={columns}>
                {(column) => <TableColumn id={column.key}>{column.name}</TableColumn>}
              </For>
            </TableHeader>
            <TableBody>
              {(row: TableRowData) => (
                <TableRow id={row.id}>
                  {() => (
                    <>
                      <TableCell>{row.name}</TableCell>
                      <TableCell class={typeRoles.meta}>{row.role}</TableCell>
                      <TableCell>
                        {/* Badge lays out as a block, so it needs a row of its own to size
                            to its label instead of stretching across the cell. */}
                        <Flex alignItems="center">
                          <Badge size="S" variant={statusVariant[row.status]}>
                            {row.status}
                          </Badge>
                        </Flex>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              )}
            </TableBody>
          </>
        )}
      </Table>
      <DemoReadout>
        Selected: {selectedKeys().size > 0 ? Array.from(selectedKeys()).join(", ") : "None"}
      </DemoReadout>
    </Flex>
  );
}

// ============================================
// GRIDLIST DEMO
// ============================================

function GridListDemo() {
  const items = [
    { id: "photos", label: "Photos", icon: "📷" },
    { id: "videos", label: "Videos", icon: "🎬" },
    { id: "music", label: "Music", icon: "🎵" },
    { id: "documents", label: "Documents", icon: "📄" },
    { id: "downloads", label: "Downloads", icon: "⬇️" },
    { id: "projects", label: "Projects", icon: "📁" },
  ];

  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set());

  return (
    <Flex direction="column" gap={2}>
      <GridList
        aria-label="File categories"
        items={items}
        getKey={(item) => item.id}
        getTextValue={(item) => item.label}
        selectionMode="multiple"
        selectedKeys={selectedKeys()}
        onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
        class="hd-gridlist"
      >
        {(item) => (
          <GridListItem id={item.id} class="hd-gridlist__item">
            <span style={{ "font-size": "24px" }}>{item.icon}</span>
            <span class={typeRoles.label}>{item.label}</span>
          </GridListItem>
        )}
      </GridList>
      <DemoReadout>
        Selected: {selectedKeys().size > 0 ? Array.from(selectedKeys()).join(", ") : "None"}
      </DemoReadout>
    </Flex>
  );
}

// ============================================
// TREE DEMO
// ============================================

function TreeDemo() {
  type TreeNodeValue = {
    name: string;
    icon: string;
  };

  type TreeNode = {
    key: string;
    value: TreeNodeValue;
    children?: TreeNode[];
  };

  // Tree data with hierarchical structure
  const treeData: TreeNode[] = [
    {
      key: "src",
      value: { name: "src", icon: "📁" },
      children: [
        {
          key: "components",
          value: { name: "components", icon: "📁" },
          children: [
            { key: "Button.tsx", value: { name: "Button.tsx", icon: "📄" } },
            { key: "Dialog.tsx", value: { name: "Dialog.tsx", icon: "📄" } },
          ],
        },
        {
          key: "utils",
          value: { name: "utils", icon: "📁" },
          children: [{ key: "helpers.ts", value: { name: "helpers.ts", icon: "📄" } }],
        },
        { key: "index.ts", value: { name: "index.ts", icon: "📄" } },
      ],
    },
    { key: "package.json", value: { name: "package.json", icon: "📄" } },
  ];

  const [expandedKeys, setExpandedKeys] = createSignal<Set<string>>(new Set(["src", "components"]));
  const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set());

  return (
    <Flex direction="column" gap={2}>
      <Tree<TreeNodeValue>
        aria-label="Project structure"
        items={treeData}
        selectionMode="multiple"
        selectedKeys={selectedKeys()}
        onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
        expandedKeys={expandedKeys()}
        onExpandedChange={(keys) => setExpandedKeys(keys as Set<string>)}
        class={`hd-tree ${typeRoles.body}`}
      >
        {(item, state) => (
          <TreeItem id={item.key!}>
            {() => (
              <div class="hd-tree__row" style={{ "padding-left": `${state.level * 16 + 8}px` }}>
                {state.isExpandable ? (
                  <TreeExpandButton class="hd-tree__expand" />
                ) : (
                  <span style={{ width: "16px" }} />
                )}
                <span>{item.value!.icon}</span>
                <span>{item.value!.name}</span>
              </div>
            )}
          </TreeItem>
        )}
      </Tree>
      <DemoReadout>
        Selected: {selectedKeys().size > 0 ? Array.from(selectedKeys()).join(", ") : "None"}
      </DemoReadout>
    </Flex>
  );
}

// ============================================
// RANGE CALENDAR DEMO
// ============================================

function RangeCalendarDemo() {
  const [range, setRange] = createSignal<RangeValue<DateValue> | null>(null);

  return (
    <Flex direction="column" gap={2}>
      <RangeCalendar
        aria-label="Select date range"
        defaultFocusedValue={new CalendarDate(2024, 6, 15)}
        value={range()}
        onChange={setRange}
      />
      <DemoReadout>
        Range: {range() ? `${range()!.start?.toString()} - ${range()!.end?.toString()}` : "None"}
      </DemoReadout>
    </Flex>
  );
}

// ============================================
// DATEFIELD DEMO
// ============================================

function DateFieldDemo() {
  const [date, setDate] = createSignal<DateValue | null>(null);

  return (
    <Flex direction="column" gap={4}>
      <DateField label="Birth Date" value={date()} onChange={setDate} />
      <DemoReadout>Value: {date()?.toString() || "None"}</DemoReadout>
    </Flex>
  );
}

// ============================================
// TIMEFIELD DEMO
// ============================================

function TimeFieldDemo() {
  const [time, setTime] = createSignal<TimeValue | null>(null);

  return (
    <Flex direction="column" gap={4}>
      <TimeField label="Meeting Time" value={time()} onChange={setTime} />
      <DemoReadout>Value: {time()?.toString() || "None"}</DemoReadout>
    </Flex>
  );
}

// ============================================
// COLOR SLIDER DEMO
// ============================================

/** One labelled channel track. The three sliders differ only in channel, label, and unit. */
function ChannelSlider(props: {
  channel: "hue" | "saturation" | "lightness";
  label: string;
  unit: string;
  value: Color;
  onChange: (color: Color) => void;
}) {
  return (
    <ColorSlider
      channel={props.channel}
      value={props.value}
      onChange={props.onChange}
      class="hd-color-slider"
    >
      {() => (
        <>
          <Flex justifyContent="between" style={{ "margin-bottom": "4px" }}>
            <span class={typeRoles.label}>{props.label}</span>
            <span class={typeRoles.meta}>
              {Math.round(props.value.getChannelValue(props.channel))}
              {props.unit}
            </span>
          </Flex>
          <ColorSliderTrack class="hd-slider-track">
            {() => <ColorSliderThumb class="hd-slider-thumb hd-slider-thumb--centered" />}
          </ColorSliderTrack>
        </>
      )}
    </ColorSlider>
  );
}

function ColorSliderDemo() {
  const [color, setColor] = createSignal(parseColor("hsl(200, 100%, 50%)"));

  return (
    <Flex direction="column" gap={4}>
      <ChannelSlider channel="hue" label="Hue" unit="°" value={color()} onChange={setColor} />
      <ChannelSlider
        channel="saturation"
        label="Saturation"
        unit="%"
        value={color()}
        onChange={setColor}
      />
      <ChannelSlider
        channel="lightness"
        label="Lightness"
        unit="%"
        value={color()}
        onChange={setColor}
      />
      <ColorReadout color={color().toString("css")}>{color().toString("css")}</ColorReadout>
    </Flex>
  );
}

// ============================================
// COLOR AREA DEMO
// ============================================

function ColorAreaDemo() {
  const [color, setColor] = createSignal(parseColor("hsb(200, 100%, 100%)"));

  return (
    <Flex direction="column" gap={4}>
      <ColorArea
        value={color()}
        onChange={setColor}
        xChannel="saturation"
        yChannel="brightness"
        class="hd-color-area"
      >
        {() => (
          <>
            <ColorAreaGradient class="hd-color-area__gradient" />
            <ColorAreaThumb class="hd-slider-thumb" />
          </>
        )}
      </ColorArea>
      <ColorReadout color={color().toString("css")}>{color().toString("css")}</ColorReadout>
    </Flex>
  );
}

// ============================================
// COLOR WHEEL DEMO
// ============================================

function ColorWheelDemo() {
  const [color, setColor] = createSignal(parseColor("hsl(200, 100%, 50%)"));

  return (
    <Flex direction="column" gap={4}>
      <ColorWheel value={color()} onChange={setColor}>
        {() => (
          <>
            <ColorWheelTrack class="hd-color-wheel__track" />
            <ColorWheelThumb class="hd-slider-thumb" />
          </>
        )}
      </ColorWheel>
      <ColorReadout color={color().toString("css")}>
        Hue: {Math.round(color().getChannelValue("hue"))}°
      </ColorReadout>
    </Flex>
  );
}

// ============================================
// COLOR FIELD DEMO
// ============================================

function ColorFieldDemo() {
  const [color, setColor] = createSignal<Color | null>(parseColor("#3b82f6"));

  return (
    <Flex direction="column" gap={4}>
      <ColorField label="Color" value={color()} onChange={setColor}>
        {/* ColorField renders its own `label`, so the row below is just the swatch and
            the input — a second hand-written label would duplicate it. */}
        {() => (
          <Flex alignItems="center" gap={2} style={{ "margin-top": "4px" }}>
            <div
              class="hd-color-preview"
              style={{ background: color()?.toString("css") || "transparent" }}
            />
            <ColorFieldInput class="hd-color-input" />
          </Flex>
        )}
      </ColorField>
      <DemoReadout>Value: {color()?.toString("css") || "None"}</DemoReadout>
    </Flex>
  );
}

// ============================================
// COLOR SWATCH DEMO
// ============================================

function ColorSwatchDemo() {
  const colors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#14b8a6",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#6b7280",
    "#000000",
  ];

  const [selectedColor, setSelectedColor] = createSignal(colors[5]);

  return (
    <Flex direction="column" gap={4}>
      <Flex wrap gap={2}>
        <For each={colors}>
          {(color) => (
            <button
              type="button"
              onClick={() => setSelectedColor(color)}
              aria-label={`Select color ${color}`}
              class="hd-swatch-button"
              data-selected={selectedColor() === color ? "" : undefined}
            >
              <ColorSwatch color={parseColor(color)} class="hd-swatch" />
            </button>
          )}
        </For>
      </Flex>
      <Flex alignItems="center" gap={2}>
        <ColorSwatch color={parseColor(selectedColor())} class="hd-swatch hd-swatch--lg" />
        <Text styles={typeRoles.meta}>{selectedColor()}</Text>
      </Flex>
    </Flex>
  );
}

// ============================================
// DATE RANGE PICKER DEMO
// ============================================

function DateRangePickerDemo() {
  const [range, setRange] = createSignal<RangeValue<DateValue> | null>(null);

  return (
    <Flex direction="column" gap={4}>
      {/* An intrinsic column rule sizes this pair, so no breakpoint vocabulary is needed. */}
      <Grid columns="repeat(auto-fit, minmax(260px, 1fr))" gap={6}>
        <DateRangePicker label="Trip Dates" value={range()} onChange={setRange} />
        <DateRangePicker label="Disabled" isDisabled />
      </Grid>
      <DemoReadout>
        Range: {range() ? `${range()!.start?.toString()} – ${range()!.end?.toString()}` : "None"}
      </DemoReadout>
    </Flex>
  );
}

// ============================================
// COLOR SWATCH PICKER DEMO
// ============================================

function ColorSwatchPickerDemo() {
  const [color, setColor] = createSignal<Color>(parseColor("#3b82f6"));

  const swatchColors = [
    "#ef4444",
    "#f97316",
    "#eab308",
    "#22c55e",
    "#14b8a6",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#f43f5e",
    "#6366f1",
  ];

  return (
    <Flex direction="column" gap={4}>
      <ColorSwatchPicker value={color()} onChange={setColor} aria-label="Pick a color">
        <For each={swatchColors}>{(c) => <ColorSwatchPickerItem color={parseColor(c)} />}</For>
      </ColorSwatchPicker>
      <ColorReadout color={color().toString("css")}>{color().toString("css")}</ColorReadout>
    </Flex>
  );
}

// ============================================
// COLOR EDITOR DEMO
// ============================================

function ColorEditorDemo() {
  const [color, setColor] = createSignal<Color>(parseColor("hsl(200, 100%, 50%)"));

  return (
    <Flex direction="column" gap={4}>
      <ColorEditor value={color()} onChange={setColor} />
      <ColorReadout color={color().toString("css")}>{color().toString("css")}</ColorReadout>
    </Flex>
  );
}
