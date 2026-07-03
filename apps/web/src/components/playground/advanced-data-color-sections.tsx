import { type Accessor, createSignal, For } from "solid-js";
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
        class="lg:col-span-2"
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
        class="lg:col-span-2"
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

function TableDemo() {
  type TableRowData = {
    id: string;
    name: string;
    role: string;
    status: "Active" | "Away" | "Offline";
  };
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
    <div class="space-y-2">
      <Table<TableRowData>
        aria-label="Team members"
        items={rows}
        columns={columns}
        getKey={(item) => item.id}
        selectionMode="multiple"
        selectedKeys={selectedKeys()}
        onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
        class="w-full border-collapse text-sm"
      >
        {() => (
          <>
            <TableHeader class="bg-bg-300">
              <For each={columns}>
                {(column) => (
                  <TableColumn
                    id={column.key}
                    class="px-4 py-2 text-left font-medium text-primary-200 border-b border-bg-400"
                  >
                    {column.name}
                  </TableColumn>
                )}
              </For>
            </TableHeader>
            <TableBody class="divide-y divide-bg-400">
              {(row: TableRowData) => (
                <TableRow
                  id={row.id}
                  class="hover:bg-bg-300 transition-colors data-[selected]:bg-accent-600/20"
                >
                  {() => (
                    <>
                      <TableCell class="px-4 py-2 text-primary-100">{row.name}</TableCell>
                      <TableCell class="px-4 py-2 text-primary-300">{row.role}</TableCell>
                      <TableCell class="px-4 py-2">
                        <span
                          class={`px-2 py-0.5 rounded-full text-xs ${
                            row.status === "Active"
                              ? "bg-success-600/20 text-success-400"
                              : row.status === "Away"
                                ? "bg-warning-600/20 text-warning-400"
                                : "bg-bg-400 text-primary-400"
                          }`}
                        >
                          {row.status}
                        </span>
                      </TableCell>
                    </>
                  )}
                </TableRow>
              )}
            </TableBody>
          </>
        )}
      </Table>
      <p class="text-xs text-primary-400">
        Selected: {selectedKeys().size > 0 ? Array.from(selectedKeys()).join(", ") : "None"}
      </p>
    </div>
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
    <div class="space-y-2">
      <GridList
        aria-label="File categories"
        items={items}
        getKey={(item) => item.id}
        getTextValue={(item) => item.label}
        selectionMode="multiple"
        selectedKeys={selectedKeys()}
        onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
        class="grid grid-cols-3 gap-2"
      >
        {(item) => (
          <GridListItem
            id={item.id}
            class="flex flex-col items-center justify-center p-3 rounded-lg border border-bg-400 hover:border-accent-500 hover:bg-bg-300 cursor-pointer transition-colors data-[selected]:border-accent-500 data-[selected]:bg-accent-600/20"
          >
            <span class="text-2xl mb-1">{item.icon}</span>
            <span class="text-xs text-primary-200">{item.label}</span>
          </GridListItem>
        )}
      </GridList>
      <p class="text-xs text-primary-400">
        Selected: {selectedKeys().size > 0 ? Array.from(selectedKeys()).join(", ") : "None"}
      </p>
    </div>
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
    <div class="space-y-2">
      <Tree<TreeNodeValue>
        aria-label="Project structure"
        items={treeData}
        selectionMode="multiple"
        selectedKeys={selectedKeys()}
        onSelectionChange={(keys) => setSelectedKeys(keys as Set<string>)}
        expandedKeys={expandedKeys()}
        onExpandedChange={(keys) => setExpandedKeys(keys as Set<string>)}
        class="text-sm"
      >
        {(item, state) => (
          <TreeItem id={item.key!} class="group">
            {() => (
              <div
                class="flex items-center gap-1 px-2 py-1 rounded hover:bg-bg-300 data-[selected]:bg-accent-600/20"
                style={{ "padding-left": `${state.level * 16 + 8}px` }}
              >
                {state.isExpandable ? (
                  <TreeExpandButton class="w-4 h-4 text-primary-400 hover:text-primary-200" />
                ) : (
                  <span class="w-4" />
                )}
                <span class="text-primary-300">{item.value!.icon}</span>
                <span class="text-primary-200">{item.value!.name}</span>
              </div>
            )}
          </TreeItem>
        )}
      </Tree>
      <p class="text-xs text-primary-400">
        Selected: {selectedKeys().size > 0 ? Array.from(selectedKeys()).join(", ") : "None"}
      </p>
    </div>
  );
}

// ============================================
// RANGE CALENDAR DEMO
// ============================================

function RangeCalendarDemo() {
  const [range, setRange] = createSignal<RangeValue<DateValue> | null>(null);

  return (
    <div class="space-y-2">
      <RangeCalendar
        aria-label="Select date range"
        defaultFocusedValue={new CalendarDate(2024, 6, 15)}
        value={range()}
        onChange={setRange}
      />
      <p class="text-xs text-primary-400">
        Range: {range() ? `${range()!.start?.toString()} - ${range()!.end?.toString()}` : "None"}
      </p>
    </div>
  );
}

// ============================================
// DATEFIELD DEMO
// ============================================

function DateFieldDemo() {
  const [date, setDate] = createSignal<DateValue | null>(null);

  return (
    <div class="space-y-4">
      <DateField label="Birth Date" value={date()} onChange={setDate} />
      <p class="text-xs text-primary-400">Value: {date()?.toString() || "None"}</p>
    </div>
  );
}

// ============================================
// TIMEFIELD DEMO
// ============================================

function TimeFieldDemo() {
  const [time, setTime] = createSignal<TimeValue | null>(null);

  return (
    <div class="space-y-4">
      <TimeField label="Meeting Time" value={time()} onChange={setTime} />
      <p class="text-xs text-primary-400">Value: {time()?.toString() || "None"}</p>
    </div>
  );
}

// ============================================
// COLOR SLIDER DEMO
// ============================================

function ColorSliderDemo() {
  const [color, setColor] = createSignal(parseColor("hsl(200, 100%, 50%)"));

  return (
    <div class="space-y-4">
      <ColorSlider channel="hue" value={color()} onChange={setColor} class="w-full">
        {() => (
          <>
            <div class="flex justify-between text-sm text-primary-300 mb-1">
              <span>Hue</span>
              <span>{Math.round(color().getChannelValue("hue"))}°</span>
            </div>
            <ColorSliderTrack class="h-6 rounded-md">
              {() => (
                <ColorSliderThumb class="w-4 h-4 rounded-full border-2 border-white shadow-md transform -translate-y-1/2 top-1/2" />
              )}
            </ColorSliderTrack>
          </>
        )}
      </ColorSlider>
      <ColorSlider channel="saturation" value={color()} onChange={setColor} class="w-full">
        {() => (
          <>
            <div class="flex justify-between text-sm text-primary-300 mb-1">
              <span>Saturation</span>
              <span>{Math.round(color().getChannelValue("saturation"))}%</span>
            </div>
            <ColorSliderTrack class="h-6 rounded-md">
              {() => (
                <ColorSliderThumb class="w-4 h-4 rounded-full border-2 border-white shadow-md transform -translate-y-1/2 top-1/2" />
              )}
            </ColorSliderTrack>
          </>
        )}
      </ColorSlider>
      <ColorSlider channel="lightness" value={color()} onChange={setColor} class="w-full">
        {() => (
          <>
            <div class="flex justify-between text-sm text-primary-300 mb-1">
              <span>Lightness</span>
              <span>{Math.round(color().getChannelValue("lightness"))}%</span>
            </div>
            <ColorSliderTrack class="h-6 rounded-md">
              {() => (
                <ColorSliderThumb class="w-4 h-4 rounded-full border-2 border-white shadow-md transform -translate-y-1/2 top-1/2" />
              )}
            </ColorSliderTrack>
          </>
        )}
      </ColorSlider>
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded border border-bg-400"
          style={{ background: color().toString("css") }}
        />
        <span class="text-xs text-primary-400">{color().toString("css")}</span>
      </div>
    </div>
  );
}

// ============================================
// COLOR AREA DEMO
// ============================================

function ColorAreaDemo() {
  const [color, setColor] = createSignal(parseColor("hsb(200, 100%, 100%)"));

  return (
    <div class="space-y-4">
      <ColorArea
        value={color()}
        onChange={setColor}
        xChannel="saturation"
        yChannel="brightness"
        class="w-48 h-48 rounded-lg overflow-hidden"
      >
        {() => (
          <>
            <ColorAreaGradient class="w-full h-full" />
            <ColorAreaThumb class="w-4 h-4 rounded-full border-2 border-white shadow-md" />
          </>
        )}
      </ColorArea>
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded border border-bg-400"
          style={{ background: color().toString("css") }}
        />
        <span class="text-xs text-primary-400">{color().toString("css")}</span>
      </div>
    </div>
  );
}

// ============================================
// COLOR WHEEL DEMO
// ============================================

function ColorWheelDemo() {
  const [color, setColor] = createSignal(parseColor("hsl(200, 100%, 50%)"));

  return (
    <div class="space-y-4">
      <ColorWheel value={color()} onChange={setColor}>
        {() => (
          <>
            <ColorWheelTrack class="rounded-full w-48 h-48" />
            <ColorWheelThumb class="w-4 h-4 rounded-full border-2 border-white shadow-md" />
          </>
        )}
      </ColorWheel>
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded border border-bg-400"
          style={{ background: color().toString("css") }}
        />
        <span class="text-xs text-primary-400">
          Hue: {Math.round(color().getChannelValue("hue"))}°
        </span>
      </div>
    </div>
  );
}

// ============================================
// COLOR FIELD DEMO
// ============================================

function ColorFieldDemo() {
  const [color, setColor] = createSignal<Color | null>(parseColor("#3b82f6"));

  return (
    <div class="space-y-4">
      <ColorField label="Color" value={color()} onChange={setColor}>
        {() => (
          <>
            <div class="text-sm text-primary-300 mb-1">Color</div>
            <div class="flex items-center gap-2">
              <div
                class="w-8 h-8 rounded border border-bg-400"
                style={{ background: color()?.toString("css") || "transparent" }}
              />
              <ColorFieldInput class="flex-1 px-3 py-2 rounded-md border border-bg-400 bg-bg-200 text-primary-100 focus:outline-none focus:border-accent-500" />
            </div>
          </>
        )}
      </ColorField>
      <p class="text-xs text-primary-400">Value: {color()?.toString("css") || "None"}</p>
    </div>
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
    <div class="space-y-4">
      <div class="flex flex-wrap gap-2">
        <For each={colors}>
          {(color) => (
            <button
              onClick={() => setSelectedColor(color)}
              aria-label={`Select color ${color}`}
              class={`rounded-lg overflow-hidden transition-transform ${selectedColor() === color ? "ring-2 ring-accent-500 ring-offset-2 ring-offset-bg-200 scale-110" : ""}`}
            >
              <ColorSwatch color={parseColor(color)} class="w-8 h-8" />
            </button>
          )}
        </For>
      </div>
      <div class="flex items-center gap-2">
        <ColorSwatch color={parseColor(selectedColor())} class="w-12 h-12 rounded-lg" />
        <span class="text-sm text-primary-300">{selectedColor()}</span>
      </div>
    </div>
  );
}

// ============================================
// DATE RANGE PICKER DEMO
// ============================================

function DateRangePickerDemo() {
  const [range, setRange] = createSignal<RangeValue<DateValue> | null>(null);

  return (
    <div class="space-y-4">
      <div class="grid gap-6 sm:grid-cols-2">
        <DateRangePicker label="Trip Dates" value={range()} onChange={setRange} />
        <DateRangePicker label="Disabled" isDisabled />
      </div>
      <p class="text-xs text-primary-400">
        Range: {range() ? `${range()!.start?.toString()} – ${range()!.end?.toString()}` : "None"}
      </p>
    </div>
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
    <div class="space-y-4">
      <ColorSwatchPicker value={color()} onChange={setColor} aria-label="Pick a color">
        <For each={swatchColors}>{(c) => <ColorSwatchPickerItem color={parseColor(c)} />}</For>
      </ColorSwatchPicker>
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded border border-bg-400"
          style={{ background: color().toString("css") }}
        />
        <span class="text-sm text-primary-300">{color().toString("css")}</span>
      </div>
    </div>
  );
}

// ============================================
// COLOR EDITOR DEMO
// ============================================

function ColorEditorDemo() {
  const [color, setColor] = createSignal<Color>(parseColor("hsl(200, 100%, 50%)"));

  return (
    <div class="space-y-4">
      <ColorEditor value={color()} onChange={setColor} />
      <div class="flex items-center gap-2">
        <div
          class="w-8 h-8 rounded border border-bg-400"
          style={{ background: color().toString("css") }}
        />
        <span class="text-sm text-primary-300">{color().toString("css")}</span>
      </div>
    </div>
  );
}
