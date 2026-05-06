import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { GridList, GridListItem } from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

type PhotoItem = {
  id: string;
  title: string;
  category: string;
};

const photoItems: PhotoItem[] = [
  { id: "sunset", title: "Sunset Beach", category: "Nature" },
  { id: "mountains", title: "Mountain Range", category: "Nature" },
  { id: "cityscape", title: "City Skyline", category: "Urban" },
  { id: "forest", title: "Misty Forest", category: "Nature" },
  { id: "bridge", title: "Golden Gate", category: "Urban" },
  { id: "lake", title: "Alpine Lake", category: "Nature" },
  { id: "desert", title: "Sand Dunes", category: "Nature" },
  { id: "tower", title: "Clock Tower", category: "Urban" },
  { id: "waterfall", title: "Hidden Falls", category: "Nature" },
];

type TaskItem = {
  id: string;
  title: string;
  status: string;
  priority: string;
};

const taskItems: TaskItem[] = [
  { id: "task-1", title: "Design homepage layout", status: "In Progress", priority: "High" },
  { id: "task-2", title: "Write API documentation", status: "Todo", priority: "Medium" },
  { id: "task-3", title: "Fix login redirect bug", status: "In Progress", priority: "High" },
  { id: "task-4", title: "Update dependencies", status: "Todo", priority: "Low" },
  { id: "task-5", title: "Add unit tests for auth", status: "Done", priority: "Medium" },
  { id: "task-6", title: "Optimize database queries", status: "Todo", priority: "High" },
];

export const Route = createFileRoute("/solid-spectrum/docs/components/gridlist")({
  component: GridListPage,
});

function GridListPage() {
  const [singleSelected, setSingleSelected] = createSignal<Set<Key>>(new Set());
  const [multiSelected, setMultiSelected] = createSignal<Set<Key>>(new Set());

  const priorityColor: Record<string, string> = {
    High: "bg-red-100 text-red-700",
    Medium: "bg-yellow-100 text-yellow-700",
    Low: "bg-green-100 text-green-700",
  };

  const statusIcon: Record<string, string> = {
    Todo: "[ ]",
    "In Progress": "[~]",
    Done: "[x]",
  };

  return (
    <DocPage
      title="GridList"
      description="GridList displays a list of interactive items with support for keyboard navigation and selection. Unlike a simple list, GridList items can contain interactive content and use grid-based arrow key navigation."
      importCode={`import { GridList, GridListItem } from '@proyecto-viviana/solidaria-components';`}
    >
      <Example
        title="Basic Grid"
        description="A photo gallery grid with single selection. Click an item to select it."
        code={`<GridList
  aria-label="Photo gallery"
  items={photos}
  selectionMode="single"
  selectedKeys={selected()}
  onSelectionChange={setSelected}
>
  {(item) => (
    <GridListItem id={item.id} textValue={item.title}>
      <div>{item.title}</div>
      <div>{item.category}</div>
    </GridListItem>
  )}
</GridList>`}
      >
        <div class="max-w-lg">
          <GridList
            aria-label="Photo gallery"
            items={photoItems}
            getKey={(item) => item.id}
            getTextValue={(item) => item.title}
            selectionMode="single"
            selectedKeys={singleSelected()}
            onSelectionChange={(keys) => {
              if (keys === "all") {
                setSingleSelected(new Set(photoItems.map((p) => p.id)));
              } else {
                setSingleSelected(new Set(keys));
              }
            }}
          >
            {(item) => (
              <GridListItem id={item.id} textValue={item.title}>
                {(renderProps) => (
                  <div
                    class="flex items-center justify-between px-3 py-2 rounded-md border cursor-default select-none transition-colors"
                    classList={{
                      "border-primary-400 bg-primary-50": renderProps.isSelected,
                      "border-bg-200 hover:border-bg-300 hover:bg-bg-50": !renderProps.isSelected,
                    }}
                  >
                    <div>
                      <div class="text-sm font-medium">{item.title}</div>
                      <div class="text-xs text-bg-500">{item.category}</div>
                    </div>
                    {renderProps.isSelected && (
                      <svg class="w-4 h-4 text-primary-500" viewBox="0 0 20 20" fill="currentColor">
                        <path
                          fill-rule="evenodd"
                          d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                          clip-rule="evenodd"
                        />
                      </svg>
                    )}
                  </div>
                )}
              </GridListItem>
            )}
          </GridList>
          <p class="mt-2 text-sm text-bg-500">
            Selected: {singleSelected().size > 0 ? [...singleSelected()].join(", ") : "None"}
          </p>
        </div>
      </Example>

      <Example
        title="Multi-Select"
        description="A task list with multiple selection enabled. Click items to toggle their selection, or use Shift+Click to select a range."
        code={`<GridList
  aria-label="Task list"
  items={tasks}
  selectionMode="multiple"
  selectedKeys={multiSelected()}
  onSelectionChange={setMultiSelected}
>
  {(item) => (
    <GridListItem id={item.id} textValue={item.title}>
      <span>{item.status}</span>
      <span>{item.title}</span>
      <span>{item.priority}</span>
    </GridListItem>
  )}
</GridList>`}
      >
        <div class="max-w-lg">
          <GridList
            aria-label="Task list"
            items={taskItems}
            getKey={(item) => item.id}
            getTextValue={(item) => item.title}
            selectionMode="multiple"
            selectedKeys={multiSelected()}
            onSelectionChange={(keys) => {
              if (keys === "all") {
                setMultiSelected(new Set(taskItems.map((t) => t.id)));
              } else {
                setMultiSelected(new Set(keys));
              }
            }}
          >
            {(item) => (
              <GridListItem id={item.id} textValue={item.title}>
                {(renderProps) => (
                  <div
                    class="flex items-center gap-3 px-3 py-2 rounded-md border cursor-default select-none transition-colors"
                    classList={{
                      "border-primary-400 bg-primary-50": renderProps.isSelected,
                      "border-bg-200 hover:border-bg-300 hover:bg-bg-50": !renderProps.isSelected,
                    }}
                  >
                    <span class="font-mono text-xs text-bg-400 w-6">{statusIcon[item.status]}</span>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium truncate">{item.title}</div>
                      <div class="text-xs text-bg-500">{item.status}</div>
                    </div>
                    <span
                      class={`text-xs px-2 py-0.5 rounded-full font-medium ${priorityColor[item.priority]}`}
                    >
                      {item.priority}
                    </span>
                  </div>
                )}
              </GridListItem>
            )}
          </GridList>
          <p class="mt-2 text-sm text-bg-500">
            Selected ({multiSelected().size}):{" "}
            {multiSelected().size > 0 ? [...multiSelected()].join(", ") : "None"}
          </p>
        </div>
      </Example>

      <h2>GridList Props</h2>
      <PropsTable
        props={[
          {
            name: "items",
            type: "T[]",
            description: "Data items rendered as grid list entries",
          },
          {
            name: "getKey",
            type: "(item: T) => Key",
            description: "Function to extract a unique key from each item",
          },
          {
            name: "getTextValue",
            type: "(item: T) => string",
            description: "Function to extract the text value for typeahead",
          },
          {
            name: "selectionMode",
            type: "'none' | 'single' | 'multiple'",
            default: "'none'",
            description: "How grid items can be selected",
          },
          {
            name: "selectedKeys",
            type: "Set<Key> | 'all'",
            description: "Currently selected item keys (controlled)",
          },
          {
            name: "onSelectionChange",
            type: "(keys: Set<Key> | 'all') => void",
            description: "Handler called when selection changes",
          },
          {
            name: "disabledKeys",
            type: "Iterable<Key>",
            description: "Keys of items that cannot be selected or interacted with",
          },
          {
            name: "aria-label",
            type: "string",
            description: "Accessible label for the grid list",
          },
        ]}
      />

      <h2>GridListItem Props</h2>
      <PropsTable
        props={[
          {
            name: "id",
            type: "string",
            description: "Unique identifier for the grid list item",
          },
          {
            name: "textValue",
            type: "string",
            description: "Text value used for typeahead and accessibility",
          },
          {
            name: "isDisabled",
            type: "boolean",
            default: "false",
            description: "Whether the item is disabled",
          },
          {
            name: "children",
            type: "JSX.Element | (renderProps) => JSX.Element",
            description: "Item content, or a render function receiving selection/focus state",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses <code>role="grid"</code> and <code>role="row"</code> ARIA patterns
          </li>
          <li>Arrow keys navigate between items in the grid</li>
          <li>Space or Enter toggles selection on the focused item</li>
          <li>Home/End keys jump to first/last item</li>
          <li>Shift+Arrow extends selection in multi-select mode</li>
          <li>Ctrl+A selects all items in multi-select mode</li>
          <li>
            <code>aria-selected</code> communicates selection state to screen readers
          </li>
          <li>Type-ahead search for quick navigation by text content</li>
          <li>Focus management follows the roving tabindex pattern</li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
