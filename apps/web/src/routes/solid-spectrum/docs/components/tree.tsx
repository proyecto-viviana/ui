import { createFileRoute } from "@tanstack/solid-router";
import { createSignal } from "solid-js";
import { Tree, TreeItem } from "@proyecto-viviana/solid-spectrum";
import type { Key, TreeItemData } from "@proyecto-viviana/solid-stately";
import { DocPage, Example, PropsTable, AccessibilitySection } from "@/components/docs";

type FileNode = {
  name: string;
};

function fileItem(
  key: string,
  name: string,
  children?: TreeItemData<FileNode>[],
): TreeItemData<FileNode> {
  return { key, value: { name }, textValue: name, children };
}

const fileSystemData: TreeItemData<FileNode>[] = [
  fileItem("src", "src", [
    fileItem("components", "components", [
      fileItem("Button.tsx", "Button.tsx"),
      fileItem("Dialog.tsx", "Dialog.tsx"),
      fileItem("Menu.tsx", "Menu.tsx"),
    ]),
    fileItem("hooks", "hooks", [
      fileItem("useAuth.ts", "useAuth.ts"),
      fileItem("useTheme.ts", "useTheme.ts"),
    ]),
    fileItem("index.ts", "index.ts"),
  ]),
  fileItem("tests", "tests", [
    fileItem("Button.test.tsx", "Button.test.tsx"),
    fileItem("Dialog.test.tsx", "Dialog.test.tsx"),
  ]),
  fileItem("package.json", "package.json"),
  fileItem("tsconfig.json", "tsconfig.json"),
];

const orgChartData: TreeItemData<FileNode>[] = [
  fileItem("ceo", "CEO - Maria Garcia", [
    fileItem("cto", "CTO - James Chen", [
      fileItem("lead-fe", "Frontend Lead - Anna Lee"),
      fileItem("lead-be", "Backend Lead - Omar Hassan"),
      fileItem("lead-infra", "Infra Lead - Kenji Tanaka"),
    ]),
    fileItem("cfo", "CFO - Sarah Miller", [
      fileItem("accounting", "Accounting - David Park"),
      fileItem("finance", "Finance - Lisa Wong"),
    ]),
    fileItem("cmo", "CMO - Robert Taylor", [
      fileItem("marketing", "Marketing - Emily Davis"),
      fileItem("sales", "Sales - Michael Brown"),
    ]),
  ]),
];

export const Route = createFileRoute("/solid-spectrum/docs/components/tree")({
  component: TreePage,
});

function TreePage() {
  const [selectedKeys, setSelectedKeys] = createSignal<Set<Key>>(new Set());
  const [expandedKeys, setExpandedKeys] = createSignal<Set<Key>>(new Set(["src", "components"]));

  return (
    <DocPage
      title="Tree"
      description="Tree displays hierarchical data in an expandable and collapsible structure. It supports keyboard navigation, selection, and accessible tree patterns for file browsers, org charts, and nested data."
      importCode={`import { Tree, TreeItem } from '@proyecto-viviana/solid-spectrum';`}
    >
      <Example
        title="Basic Tree View"
        description="A file system tree with expand/collapse functionality. Click the arrow icons to expand or collapse folders."
        code={`<Tree
  aria-label="File system"
  items={fileSystemData}
  expandedKeys={expandedKeys()}
  onExpandedChange={setExpandedKeys}
>
  {(item) => (
    <TreeItem id={item.key} textValue={item.textValue}>
      {item.value.name}
    </TreeItem>
  )}
</Tree>`}
      >
        <div class="max-w-md">
          <Tree
            aria-label="File system"
            items={fileSystemData}
            expandedKeys={expandedKeys()}
            onExpandedChange={(keys) => setExpandedKeys(new Set(keys))}
          >
            {(item) => (
              <TreeItem id={item.key} textValue={item.textValue}>
                {item.value.name}
              </TreeItem>
            )}
          </Tree>
        </div>
      </Example>

      <Example
        title="With Selection"
        description="Enable selection mode to allow users to select tree items. Selected items are tracked and displayed below the tree."
        code={`<Tree
  aria-label="Organization chart"
  items={orgChartData}
  selectionMode="multiple"
  selectedKeys={selectedKeys()}
  onSelectionChange={setSelectedKeys}
>
  {(item) => (
    <TreeItem id={item.key} textValue={item.textValue}>
      {item.value.name}
    </TreeItem>
  )}
</Tree>`}
      >
        <div class="max-w-md">
          <Tree
            aria-label="Organization chart"
            items={orgChartData}
            selectionMode="multiple"
            selectedKeys={selectedKeys()}
            onSelectionChange={(keys) => {
              if (keys === "all") {
                const allKeys = new Set<Key>();
                function collectKeys(nodes: TreeItemData<FileNode>[]) {
                  for (const node of nodes) {
                    allKeys.add(node.key);
                    if (node.children) collectKeys(node.children);
                  }
                }
                collectKeys(orgChartData);
                setSelectedKeys(allKeys);
              } else {
                setSelectedKeys(new Set(keys));
              }
            }}
            defaultExpandedKeys={new Set(["ceo", "cto", "cfo", "cmo"])}
          >
            {(item) => (
              <TreeItem id={item.key} textValue={item.textValue}>
                {item.value.name}
              </TreeItem>
            )}
          </Tree>
          <p class="mt-3 text-sm text-bg-500">
            Selected: {selectedKeys().size > 0 ? [...selectedKeys()].join(", ") : "None"}
          </p>
        </div>
      </Example>

      <h2>Tree Props</h2>
      <PropsTable
        props={[
          {
            name: "items",
            type: "T[]",
            description: "The data items rendered as tree nodes",
          },
          {
            name: "selectionMode",
            type: "'none' | 'single' | 'multiple'",
            default: "'none'",
            description: "How tree items can be selected",
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
            name: "expandedKeys",
            type: "Set<Key>",
            description: "Currently expanded item keys (controlled)",
          },
          {
            name: "onExpandedChange",
            type: "(keys: Set<Key>) => void",
            description: "Handler called when expanded state changes",
          },
          {
            name: "defaultExpandedKeys",
            type: "Set<Key>",
            description: "Default expanded keys (uncontrolled)",
          },
          {
            name: "aria-label",
            type: "string",
            description: "Accessible label for the tree",
          },
        ]}
      />

      <h2>TreeItem Props</h2>
      <PropsTable
        props={[
          {
            name: "id",
            type: "string",
            description: "Unique identifier for the tree item",
          },
          {
            name: "textValue",
            type: "string",
            description: "Text value for typeahead and accessibility",
          },
          {
            name: "children",
            type: "JSX.Element | ((renderProps) => JSX.Element)",
            description: "Content of the tree item, or a render function for custom content",
          },
          {
            name: "icon",
            type: "() => JSX.Element",
            description: "Optional icon to display before the content",
          },
          {
            name: "description",
            type: "string",
            description: "Optional description text below the label",
          },
        ]}
      />

      <AccessibilitySection>
        <ul class="list-disc pl-5 space-y-1 text-sm">
          <li>
            Uses <code>role="tree"</code> and <code>role="treeitem"</code> ARIA patterns
          </li>
          <li>Arrow keys navigate between visible tree items</li>
          <li>Left arrow collapses an expanded node or moves to parent</li>
          <li>Right arrow expands a collapsed node or moves to first child</li>
          <li>Home/End keys jump to first/last visible item</li>
          <li>Type-ahead search to quickly find items by text</li>
          <li>
            <code>aria-expanded</code> state is announced for expandable items
          </li>
          <li>
            Selection state is communicated via <code>aria-selected</code>
          </li>
          <li>
            Nested level is exposed via <code>aria-level</code>
          </li>
        </ul>
      </AccessibilitySection>
    </DocPage>
  );
}
