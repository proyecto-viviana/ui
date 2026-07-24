import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";
import {
  Virtualizer,
  ListLayout,
  GridLayout,
  WaterfallLayout,
} from "@proyecto-viviana/solidaria-components";
import { typeRoles } from "@proyecto-viviana/ui";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

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
  "var(--color-primary-700)",
];

const gridItems = Array.from({ length: 200 }, (_, i) => ({
  id: `grid-${i}`,
  label: `Card ${i + 1}`,
  fill: tileFills[i % 4],
}));

/** A virtualized tile: fixed frame, label pinned top, caption pinned bottom. */
const tile = {
  display: "flex",
  "flex-direction": "column",
  "justify-content": "space-between",
  padding: "12px",
  "border-radius": "var(--radius-lg)",
} as const;

export const Route = createFileRoute("/solid-spectrum/docs/components/virtualizer")({
  component: VirtualizerPage,
});

function VirtualizerPage() {
  return (
    <DocPage
      title="Virtualizer"
      description="Virtualizer efficiently renders large collections by only mounting visible items. It supports list, grid, waterfall, and table layouts with full keyboard navigation and drag-and-drop."
      importCode={`import {
  Virtualizer,
  ListLayout,
  GridLayout,
  WaterfallLayout,
  TableLayout
} from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic List"
        description="A virtual list rendering 1,000 items efficiently. Only visible items are mounted in the DOM."
        code={`<Virtualizer
  layout={ListLayout}
  layoutOptions={{ itemSize: 40, overscan: 5 }}
  class="viewport"
>
  <For each={items}>
    {(item) => (
      <div class="row">
        {item.label}
      </div>
    )}
  </For>
</Virtualizer>`}
      >
        <Virtualizer
          layout={ListLayout}
          layoutOptions={{ itemSize: 40, overscan: 5 }}
          class="hd-viewport"
          style={{ height: "256px" }}
        >
          <For each={listItems}>
            {(item) => (
              <div
                class={typeRoles.body}
                style={{
                  height: "40px",
                  display: "flex",
                  "align-items": "center",
                  padding: "0 16px",
                  "border-bottom": "1px solid var(--color-bg-400)",
                }}
              >
                {item.label}
              </div>
            )}
          </For>
        </Virtualizer>
      </Example>

      <Example
        title="Grid Layout"
        description="Display items in a responsive grid. Items are arranged in columns with automatic sizing."
        code={`<Virtualizer
  layout={GridLayout}
  layoutOptions={{ rowHeight: 120, columnCount: 3 }}
  class="viewport"
>
  <For each={items}>
    {(item) => (
      <div class="tile">
        {item.label}
      </div>
    )}
  </For>
</Virtualizer>`}
      >
        <Virtualizer
          layout={GridLayout}
          layoutOptions={{ rowHeight: 120, columnCount: 3 }}
          class="hd-viewport"
          style={{ height: "320px", padding: "8px" }}
        >
          <For each={gridItems}>
            {(item) => (
              <div style={{ ...tile, height: "112px", background: item.fill }}>
                <span class={typeRoles.label}>{item.label}</span>
                <span class={typeRoles.meta}>Grid item</span>
              </div>
            )}
          </For>
        </Virtualizer>
      </Example>

      <Example
        title="Waterfall Layout"
        description="A masonry-style layout where items flow into columns based on available space. Items can have varying heights."
        code={`<Virtualizer
  layout={WaterfallLayout}
  layoutOptions={{ minColumnWidth: 200, gap: 8 }}
  class="viewport"
>
  <For each={items}>
    {(item, index) => (
      <div style={{ height: \`\${80 + (index() % 5) * 30}px\` }}>
        {item.label}
      </div>
    )}
  </For>
</Virtualizer>`}
      >
        <Virtualizer
          layout={WaterfallLayout}
          layoutOptions={{ minColumnWidth: 200, gap: 8 }}
          class="hd-viewport"
          style={{ height: "384px", padding: "8px" }}
        >
          <For each={gridItems}>
            {(item, index) => (
              <div
                style={{
                  ...tile,
                  height: `${80 + (index() % 5) * 30}px`,
                  background: item.fill,
                }}
              >
                <span class={typeRoles.label}>{item.label}</span>
                <span class={typeRoles.meta}>Waterfall item</span>
              </div>
            )}
          </For>
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
            description: "The collection items to virtualize, typically rendered with <For>",
          },
          {
            name: "class",
            type: "string",
            description: "CSS class for the scroll container",
          },
          {
            name: "style",
            type: "string | JSX.CSSProperties",
            description: "Inline styles for the scroll container",
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
            description: "Minimum width of each column. Actual count adjusts to viewport.",
          },
          {
            name: "gap",
            type: "number",
            default: "0",
            description: "Gap between items in pixels",
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
