import { createFileRoute } from "@tanstack/solid-router";
import { For } from "solid-js";
import {
  Virtualizer,
  ListLayout,
  GridLayout,
  WaterfallLayout,
} from "@proyecto-viviana/solid-spectrum";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

const listItems = Array.from({ length: 1000 }, (_, i) => ({
  id: `item-${i}`,
  label: `Item ${i + 1}`,
}));

const gridItems = Array.from({ length: 200 }, (_, i) => ({
  id: `grid-${i}`,
  label: `Card ${i + 1}`,
  color: ["bg-primary-700/30", "bg-accent/20", "bg-primary-500/20", "bg-primary-600/30"][i % 4],
}));

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
  class="h-64 overflow-auto"
>
  <For each={items}>
    {(item) => (
      <div class="h-10 px-4 flex items-center border-b">
        {item.label}
      </div>
    )}
  </For>
</Virtualizer>`}
      >
        <div class="rounded-lg border border-primary-700/30 overflow-hidden">
          <Virtualizer
            layout={ListLayout}
            layoutOptions={{ itemSize: 40, overscan: 5 }}
            class="h-64 overflow-auto"
          >
            <For each={listItems}>
              {(item) => (
                <div class="h-10 px-4 flex items-center border-b border-primary-700/20 text-sm text-primary-300 hover:bg-primary-700/10 transition-colors">
                  {item.label}
                </div>
              )}
            </For>
          </Virtualizer>
        </div>
      </Example>

      <Example
        title="Grid Layout"
        description="Display items in a responsive grid. Items are arranged in columns with automatic sizing."
        code={`<Virtualizer
  layout={GridLayout}
  layoutOptions={{ rowHeight: 120, columnCount: 3 }}
  class="h-80 overflow-auto"
>
  <For each={items}>
    {(item) => (
      <div class="h-28 p-3 rounded-lg bg-primary-700/20">
        {item.label}
      </div>
    )}
  </For>
</Virtualizer>`}
      >
        <div class="rounded-lg border border-primary-700/30 overflow-hidden">
          <Virtualizer
            layout={GridLayout}
            layoutOptions={{ rowHeight: 120, columnCount: 3 }}
            class="h-80 overflow-auto p-2"
          >
            <For each={gridItems}>
              {(item) => (
                <div class={`h-28 p-3 rounded-lg ${item.color} flex flex-col justify-between`}>
                  <span class="text-sm font-medium text-primary-200">{item.label}</span>
                  <span class="text-xs text-primary-500">Grid item</span>
                </div>
              )}
            </For>
          </Virtualizer>
        </div>
      </Example>

      <Example
        title="Waterfall Layout"
        description="A masonry-style layout where items flow into columns based on available space. Items can have varying heights."
        code={`<Virtualizer
  layout={WaterfallLayout}
  layoutOptions={{ minColumnWidth: 200, gap: 8 }}
  class="h-96 overflow-auto"
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
        <div class="rounded-lg border border-primary-700/30 overflow-hidden">
          <Virtualizer
            layout={WaterfallLayout}
            layoutOptions={{ minColumnWidth: 200, gap: 8 }}
            class="h-96 overflow-auto p-2"
          >
            <For each={gridItems}>
              {(item, index) => (
                <div
                  class={`${item.color} rounded-lg p-3 flex flex-col justify-between`}
                  style={{ height: `${80 + (index() % 5) * 30}px` }}
                >
                  <span class="text-sm font-medium text-primary-200">{item.label}</span>
                  <span class="text-xs text-primary-500">Waterfall item</span>
                </div>
              )}
            </For>
          </Virtualizer>
        </div>
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
      <p class="text-sm text-primary-400 mb-4">
        Child components can access virtualizer state via <code>useVirtualizerContext()</code>. This
        provides <code>getVisibleRange()</code>, <code>getLayoutInfo()</code>, and drop target
        resolution for building custom virtualized collection components.
      </p>

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Keyboard navigation works seamlessly across virtualized items using{" "}
            <code>aria-activedescendant</code>
          </li>
          <li>Focus management preserves scroll position when items are focused via keyboard</li>
          <li>Screen readers announce the total item count and current position</li>
          <li>Drag and drop indicators are announced to assistive technologies</li>
          <li>Integrates with ListBox, Table, GridList, and Tree for full a11y support</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
