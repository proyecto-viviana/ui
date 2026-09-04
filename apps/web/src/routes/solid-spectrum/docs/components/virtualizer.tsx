import { createFileRoute } from "@tanstack/solid-router";
import {
  Virtualizer,
  ListLayout,
  GridLayout,
  WaterfallLayout,
  ListBox,
  ListBoxOption,
} from "@proyecto-viviana/solidaria-components";
import { typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";
import { seo } from "@/seo";

const listItems = Array.from({ length: 1000 }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
}));

// The tiles cycle through four token-backed fills so the virtual window is visible as
// it recycles; the exact hues carry no meaning beyond telling one card from the next.
const tileFills = [
  "var(--color-bg-300)",
  "var(--color-accent-dim)",
  "var(--color-bg-400)",
  "var(--color-bg-200)",
];

const gridItems = Array.from({ length: 200 }, (_, i) => ({
  id: `grid-${i}`,
  label: `Card ${i + 1}`,
  fill: tileFills[i % 4],
}));

/** A virtualized tile: fixed frame, label pinned top, caption pinned bottom. */
const tile = {
  height: "100%",
  display: "flex",
  "flex-direction": "column",
  "justify-content": "space-between",
  padding: "12px",
  "border-radius": "var(--radius-lg)",
  color: "var(--text-primary)",
} as const;

/** Each grid option fills its layout cell; the inset keeps neighbouring tiles apart. */
const gridOption = {
  padding: "4px",
  "box-sizing": "border-box",
  outline: "none",
} as const;

export const Route = createFileRoute("/solid-spectrum/docs/components/virtualizer")({
  head: () =>
    seo({
      title: "Virtualizer",
      description:
        "Virtualizer efficiently renders large collections by only mounting visible items.",
      path: "/solid-spectrum/docs/components/virtualizer",
    }),
  component: VirtualizerPage,
});

function VirtualizerPage() {
  return (
    <DocPage
      title="Virtualizer"
      description="Virtualizer efficiently renders large collections by only mounting visible items. It renders no DOM of its own: wrap a collection component such as ListBox, GridList, Table, or Tree, and that collection element becomes the scroll container. It supports list, grid, waterfall, and table layouts with full keyboard navigation and drag-and-drop."
      importCode={`import {
  Virtualizer,
  ListLayout,
  GridLayout,
  WaterfallLayout,
  TableLayout
} from '@proyecto-viviana/solidaria-components';`}
    >
      <Example
        title="Basic List"
        description="A virtual list rendering 1,000 items efficiently. Only visible items are mounted in the DOM. The ListBox is the scroller, so give it the height and overflow."
        code={`<Virtualizer layout={ListLayout} layoutOptions={{ itemSize: 40, overscan: 5 }}>
  <ListBox
    aria-label="Virtualized list"
    selectionMode="multiple"
    items={items}
    getKey={(item) => item.id}
    getTextValue={(item) => item.label}
    class="viewport"
    style={{ height: "256px" }}
  >
    {(item) => (
      <ListBoxOption id={item.id} textValue={item.label} class="row">
        {item.label}
      </ListBoxOption>
    )}
  </ListBox>
</Virtualizer>`}
      >
        <Virtualizer layout={ListLayout} layoutOptions={{ itemSize: 40, overscan: 5 }}>
          <ListBox
            aria-label="Virtualized list"
            selectionMode="multiple"
            items={listItems}
            getKey={(item) => item.id}
            getTextValue={(item) => item.label}
            class="hd-viewport"
            style={{ height: "256px" }}
          >
            {(item) => (
              <ListBoxOption
                id={item.id}
                textValue={item.label}
                class={`hd-option ${typeRoles.body}`}
                style={{
                  height: "40px",
                  "box-sizing": "border-box",
                  display: "flex",
                  "align-items": "center",
                  padding: "0 16px",
                  "border-bottom": "1px solid var(--color-bg-400)",
                }}
              >
                {item.label}
              </ListBoxOption>
            )}
          </ListBox>
        </Virtualizer>
      </Example>

      <Example
        title="Grid Layout"
        description='Display items in a fixed-column grid. GridLayout windows rows of rowHeight with columnCount items each; set layout="grid" on the ListBox so arrow keys move across columns, and lay the collection content out in the same columns.'
        code={`<Virtualizer layout={GridLayout} layoutOptions={{ rowHeight: 120, columnCount: 3 }}>
  <ListBox
    aria-label="Virtualized grid"
    layout="grid"
    items={items}
    getKey={(item) => item.id}
    getTextValue={(item) => item.label}
    class="viewport viewport--grid"
    style={{
      height: "320px",
      "--grid-columns": "repeat(3, minmax(0, 1fr))",
      "--grid-row-height": "120px",
    }}
  >
    {(item) => (
      <ListBoxOption id={item.id} textValue={item.label}>
        <div class="tile">{item.label}</div>
      </ListBoxOption>
    )}
  </ListBox>
</Virtualizer>`}
      >
        <Virtualizer layout={GridLayout} layoutOptions={{ rowHeight: 120, columnCount: 3 }}>
          <ListBox
            aria-label="Virtualized grid"
            layout="grid"
            items={gridItems}
            getKey={(item) => item.id}
            getTextValue={(item) => item.label}
            class="hd-viewport hd-viewport--grid"
            style={{
              height: "320px",
              "--hd-grid-columns": "repeat(3, minmax(0, 1fr))",
              "--hd-grid-row-height": "120px",
            }}
          >
            {(item) => (
              <ListBoxOption id={item.id} textValue={item.label} style={gridOption}>
                <div style={{ ...tile, background: item.fill }}>
                  <span class={typeRoles.label} style={{ color: "var(--text-primary)" }}>
                    {item.label}
                  </span>
                  <span class={typeRoles.meta} style={{ color: "var(--text-primary)" }}>
                    Grid item
                  </span>
                </div>
              </ListBoxOption>
            )}
          </ListBox>
        </Virtualizer>
      </Example>

      <Example
        title="Waterfall Layout"
        description="Columns follow the available width: WaterfallLayout derives the column count from minColumnWidth and gap against the measured collection width, and windows rows of rowHeight. Match it with an auto-fill grid on the collection content."
        code={`<Virtualizer
  layout={WaterfallLayout}
  layoutOptions={{ minColumnWidth: 200, gap: 8, rowHeight: 120 }}
>
  <ListBox
    aria-label="Virtualized waterfall"
    layout="grid"
    items={items}
    getKey={(item) => item.id}
    getTextValue={(item) => item.label}
    class="viewport viewport--grid"
    style={{
      height: "384px",
      "--grid-columns": "repeat(auto-fill, minmax(200px, 1fr))",
      "--grid-row-height": "120px",
      "--grid-gap": "8px",
    }}
  >
    {(item) => (
      <ListBoxOption id={item.id} textValue={item.label}>
        <div class="tile">{item.label}</div>
      </ListBoxOption>
    )}
  </ListBox>
</Virtualizer>`}
      >
        <Virtualizer
          layout={WaterfallLayout}
          layoutOptions={{ minColumnWidth: 200, gap: 8, rowHeight: 120 }}
        >
          <ListBox
            aria-label="Virtualized waterfall"
            layout="grid"
            items={gridItems}
            getKey={(item) => item.id}
            getTextValue={(item) => item.label}
            class="hd-viewport hd-viewport--grid"
            style={{
              height: "384px",
              "--hd-grid-columns": "repeat(auto-fill, minmax(200px, 1fr))",
              "--hd-grid-row-height": "120px",
              "--hd-grid-gap": "8px",
            }}
          >
            {(item) => (
              <ListBoxOption id={item.id} textValue={item.label} style={gridOption}>
                <div style={{ ...tile, background: item.fill }}>
                  <span class={typeRoles.label} style={{ color: "var(--text-primary)" }}>
                    {item.label}
                  </span>
                  <span class={typeRoles.meta} style={{ color: "var(--text-primary)" }}>
                    Waterfall item
                  </span>
                </div>
              </ListBoxOption>
            )}
          </ListBox>
        </Virtualizer>
      </Example>

      <h2>Virtualizer Props</h2>
      <PropsTable
        props={[
          {
            name: "layout",
            type: "VirtualizerLayoutClass<O> | VirtualizerLayout<O>",
            description:
              "Layout implementation (ListLayout, GridLayout, WaterfallLayout, TableLayout) or a custom layout object",
          },
          {
            name: "layoutOptions",
            type: "O",
            description:
              "Options passed to the layout. Varies by layout type (e.g., itemSize for ListLayout, columnCount for GridLayout)",
          },
          {
            name: "children",
            type: "JSX.Element",
            description:
              "The collection to virtualize (ListBox, GridList, Table, Tree). Virtualizer renders no element; the collection element is the scroll container, so size and overflow belong on it",
          },
          {
            name: "renderDropIndicator",
            type: "(index: number, position: 'before' | 'after' | 'on') => JSX.Element",
            description: "Render function for drag-and-drop indicators",
          },
          {
            name: "getDropOperation",
            type: "(target, types, allowedOperations) => DropOperation",
            description: "Resolver for determining allowed drop operations",
          },
        ]}
      />

      <h2>Layout Options</h2>

      <h3>ListLayout / TableLayout</h3>
      <PropsTable
        props={[
          {
            name: "itemSize",
            type: "number",
            default: "40",
            description: "Height of each row in pixels",
          },
          {
            name: "overscan",
            type: "number",
            default: "5",
            description: "Number of extra items to render beyond the visible area",
          },
        ]}
      />

      <h3>GridLayout</h3>
      <PropsTable
        props={[
          {
            name: "rowHeight",
            type: "number",
            description: "Height of each row in pixels",
          },
          {
            name: "columnCount",
            type: "number",
            description: "Number of columns in the grid",
          },
        ]}
      />

      <h3>WaterfallLayout</h3>
      <PropsTable
        props={[
          {
            name: "minColumnWidth",
            type: "number",
            default: "200",
            description:
              "Minimum width of each column. The column count is derived from it and the measured collection width.",
          },
          {
            name: "gap",
            type: "number",
            default: "0",
            description:
              "Horizontal gap between columns in pixels, counted when deriving the column count",
          },
          {
            name: "rowHeight",
            type: "number",
            description: "Height of each row in pixels",
          },
        ]}
      />

      <h2>Context</h2>
      <p class={typeRoles.meta} style={{ "margin-bottom": "16px" }}>
        Child components can access virtualizer state via <code>useVirtualizerContext()</code>. This
        provides <code>getVisibleRange()</code>, <code>getLayoutInfo()</code>, and drop target
        resolution for building custom virtualized collection components.
      </p>

      <AccessibilitySection>
        <li>
          Keyboard navigation works seamlessly across virtualized items using{" "}
          <code>aria-activedescendant</code>
        </li>
        <li>Focus management preserves scroll position when items are focused via keyboard</li>
        <li>Screen readers announce the total item count and current position</li>
        <li>Drag and drop indicators are announced to assistive technologies</li>
        <li>Integrates with ListBox, Table, GridList, and Tree for full a11y support</li>
      </AccessibilitySection>
    </DocPage>
  );
}
