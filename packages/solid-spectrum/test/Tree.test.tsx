/**
 * @vitest-environment jsdom
 */
import { createSignal } from "solid-js";
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";
import {
  Text,
  TreeView,
  TreeViewContext,
  TreeViewItem,
  TreeViewItemContent,
  TreeViewLoadMoreItem,
  type TreeItemData,
  type TreeSelectionStyle,
} from "../src";
import * as treeViewSubpath from "../src/TreeView";
import packageJson from "../package.json";

interface FileItem {
  id: string;
  label: string;
  description?: string;
}

const files: TreeItemData<FileItem>[] = [
  {
    id: "projects",
    value: { id: "projects", label: "Projects", description: "Pinned work" },
    textValue: "Projects",
    children: [
      {
        id: "brief",
        value: { id: "brief", label: "Project brief", description: "Planning notes" },
        textValue: "Project brief",
      },
      {
        id: "report",
        value: { id: "report", label: "Quarterly report", description: "Finance packet" },
        textValue: "Quarterly report",
      },
    ],
  },
  {
    id: "archive",
    value: { id: "archive", label: "Archive", description: "Closed work" },
    textValue: "Archive",
  },
];

function normalizeKeys(keys: "all" | Set<unknown>) {
  return keys === "all"
    ? new Set(["projects", "brief", "report", "archive"])
    : new Set(Array.from(keys, String));
}

function itemKey(item: TreeItemData<FileItem>) {
  return String(item.id ?? item.key);
}

function FileTree(props: {
  defaultExpandedKeys?: string[];
  selectionMode?: "none" | "single" | "multiple";
  selectionStyle?: TreeSelectionStyle;
  defaultSelectedKeys?: string[];
  disabledKeys?: string[];
}) {
  return (
    <TreeView
      aria-label="Files"
      items={files}
      defaultExpandedKeys={props.defaultExpandedKeys}
      selectionMode={props.selectionMode}
      selectionStyle={props.selectionStyle}
      defaultSelectedKeys={props.defaultSelectedKeys}
      disabledKeys={props.disabledKeys}
    >
      {(item) => (
        <TreeViewItem id={itemKey(item)} textValue={item.textValue}>
          <TreeViewItemContent>
            <Text slot="label">{item.value?.label ?? item.textValue}</Text>
            {item.value?.description ? (
              <Text slot="description">{item.value.description}</Text>
            ) : null}
          </TreeViewItemContent>
        </TreeViewItem>
      )}
    </TreeView>
  );
}

describe("TreeView (solid-spectrum)", () => {
  afterEach(() => cleanup());

  it("exports the public TreeView surface and package subpath", () => {
    expect(treeViewSubpath.TreeView).toBe(TreeView);
    expect(treeViewSubpath.TreeViewItem).toBe(TreeViewItem);
    expect(treeViewSubpath.TreeViewItemContent).toBe(TreeViewItemContent);
    expect(treeViewSubpath.TreeViewLoadMoreItem).toBe(TreeViewLoadMoreItem);
    expect(treeViewSubpath.TreeViewContext).toBe(TreeViewContext);
    expect(packageJson.exports["./TreeView"]).toMatchObject({
      types: "./dist/TreeView.d.ts",
      solid: "./dist/TreeView.jsx",
      import: "./dist/TreeView.js",
      default: "./dist/TreeView.js",
    });
  });

  it("renders dynamic id-based items with S2 treegrid semantics and slots", () => {
    render(() => (
      <FileTree
        defaultExpandedKeys={["projects"]}
        selectionMode="multiple"
        defaultSelectedKeys={["brief"]}
      />
    ));

    const tree = screen.getByRole("treegrid", { name: "Files" });
    expect(tree).toHaveAttribute("data-tree-view");
    expect(tree).toHaveAttribute("data-selection-style", "checkbox");
    expect(tree).toHaveAttribute("data-overflow-mode", "truncate");
    expect(tree.getAttribute("class")).not.toContain("bg-bg-400");
    expect(tree.getAttribute("class")).not.toContain("rounded-lg");

    const projects = screen.getByRole("row", { name: /Projects/ });
    expect(projects).toHaveAttribute("aria-expanded", "true");
    expect(projects.querySelector('button[data-rsp-slot="expand-button"]')).toBeInTheDocument();

    const projectBrief = screen.getByRole("row", { name: /Project brief/ });
    expect(projectBrief).toHaveAttribute("data-selected", "true");
    expect(within(projectBrief).getByRole("checkbox", { name: "Select" })).toBeChecked();
    expect(screen.getByText("Project brief")).toHaveAttribute("data-rsp-slot", "label");
    expect(screen.getByText("Planning notes")).toHaveAttribute("data-rsp-slot", "description");

    const archive = screen.getByRole("row", { name: /Archive/ });
    expect(
      archive.querySelector('button[data-rsp-slot="expand-button"][aria-label="Expand"]'),
    ).toBeInTheDocument();
  });

  it("passes direct item fields to dynamic render functions", () => {
    const directItems = [
      {
        id: "docs",
        label: "Documents",
        description: "Direct collection item",
        textValue: "Documents",
        children: [
          {
            id: "api",
            label: "API reference",
            description: "Nested direct item",
            textValue: "API reference",
          },
        ],
      },
    ] as any;

    render(() => (
      <TreeView aria-label="Direct files" items={directItems} defaultExpandedKeys={["docs"]}>
        {(item: any) => (
          <TreeViewItem id={item.id} textValue={item.textValue}>
            <TreeViewItemContent>
              <Text slot="label">{item.label}</Text>
              <Text slot="description">{item.description}</Text>
            </TreeViewItemContent>
          </TreeViewItem>
        )}
      </TreeView>
    ));

    expect(screen.getByRole("row", { name: /Documents/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByText("Direct collection item")).toHaveAttribute(
      "data-rsp-slot",
      "description",
    );
    expect(screen.getByRole("row", { name: /API reference/ })).toBeInTheDocument();
  });

  it("supports controlled highlight selection with replace behavior", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    function Demo() {
      const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set(["brief"]));
      return (
        <TreeView
          aria-label="Files"
          items={files}
          defaultExpandedKeys={["projects"]}
          selectionMode="single"
          selectionStyle="highlight"
          selectedKeys={selectedKeys()}
          onSelectionChange={(keys) => {
            const nextKeys = normalizeKeys(keys);
            setSelectedKeys(new Set(Array.from(nextKeys, String)));
            onSelectionChange(keys);
          }}
        >
          {(item) => <TreeViewItem id={itemKey(item)}>{item.value?.label}</TreeViewItem>}
        </TreeView>
      );
    }

    render(() => <Demo />);

    const tree = screen.getByRole("treegrid", { name: "Files" });
    expect(tree).toHaveAttribute("data-selection-style", "highlight");

    const projectBrief = screen.getByRole("row", { name: /Project brief/ });
    const quarterlyReport = screen.getByRole("row", { name: /Quarterly report/ });
    expect(projectBrief).toHaveAttribute("data-selected", "true");
    expect(within(projectBrief).queryByRole("checkbox", { name: "Select" })).toBeNull();

    await user.click(quarterlyReport);

    await waitFor(() => {
      expect(screen.getByRole("row", { name: /Project brief/ })).not.toHaveAttribute(
        "data-selected",
      );
      expect(screen.getByRole("row", { name: /Quarterly report/ })).toHaveAttribute(
        "data-selected",
        "true",
      );
    });
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["report"]));
  });

  it("supports checkbox selection with toggle behavior", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    function Demo(props: { selectionStyle: TreeSelectionStyle }) {
      const [selectedKeys, setSelectedKeys] = createSignal<Set<string>>(new Set(["brief"]));
      return (
        <TreeView
          aria-label="Files"
          items={files}
          defaultExpandedKeys={["projects"]}
          selectionMode="multiple"
          selectionStyle={props.selectionStyle}
          selectedKeys={selectedKeys()}
          onSelectionChange={(keys) => {
            const nextKeys = normalizeKeys(keys);
            setSelectedKeys(new Set(Array.from(nextKeys, String)));
            onSelectionChange(keys);
          }}
        >
          {(item) => <TreeViewItem id={itemKey(item)}>{item.value?.label}</TreeViewItem>}
        </TreeView>
      );
    }

    render(() => <Demo selectionStyle="checkbox" />);

    const projectBrief = screen.getByRole("row", { name: /Project brief/ });
    const quarterlyReport = screen.getByRole("row", { name: /Quarterly report/ });
    expect(projectBrief).toHaveAttribute("data-selected", "true");
    expect(within(projectBrief).getByRole("checkbox", { name: "Select" })).toBeChecked();

    await user.click(quarterlyReport);

    await waitFor(() => {
      expect(screen.getByRole("row", { name: /Project brief/ })).toHaveAttribute(
        "data-selected",
        "true",
      );
      expect(screen.getByRole("row", { name: /Quarterly report/ })).toHaveAttribute(
        "data-selected",
        "true",
      );
    });
    expect(onSelectionChange).toHaveBeenLastCalledWith(new Set(["brief", "report"]));
  });

  it("supports disabledKeys without rendering a selectable checkbox", () => {
    render(() => (
      <FileTree
        defaultExpandedKeys={["projects"]}
        selectionMode="multiple"
        disabledKeys={["archive"]}
      />
    ));

    const archive = screen.getByRole("row", { name: /Archive/ });
    expect(archive).toHaveAttribute("aria-disabled", "true");
    expect(within(archive).queryByRole("checkbox", { name: "Select" })).toBeNull();
  });

  it("supports dynamic TreeViewItem isDisabled props", () => {
    render(() => (
      <TreeView
        aria-label="Files"
        items={files}
        defaultExpandedKeys={["projects"]}
        selectionMode="multiple"
      >
        {(item) => (
          <TreeViewItem
            id={itemKey(item)}
            textValue={item.textValue}
            isDisabled={itemKey(item) === "report"}
          >
            {item.value?.label}
          </TreeViewItem>
        )}
      </TreeView>
    ));

    const report = screen.getByRole("row", { name: /Quarterly report/ });
    expect(report).toHaveAttribute("aria-disabled", "true");
    expect(within(report).queryByRole("checkbox", { name: "Select" })).toBeNull();
  });

  it("renders link items as data-href rows", () => {
    render(() => (
      <TreeView aria-label="Links" items={[{ id: "docs", textValue: "Documentation" }]}>
        {() => (
          <TreeViewItem
            id="docs"
            textValue="Documentation"
            href="https://example.com/docs"
            target="_blank"
            rel="noreferrer"
          >
            Documentation
          </TreeViewItem>
        )}
      </TreeView>
    ));

    const docs = screen.getByRole("row", { name: "Documentation" });
    expect(docs.tagName).toBe("DIV");
    expect(docs).not.toHaveAttribute("href");
    expect(docs).toHaveAttribute("data-target", "_blank");
    expect(docs).toHaveAttribute("data-href", "https://example.com/docs");
  });

  it("supports static TreeViewItem children", () => {
    render(() => (
      <TreeView aria-label="Static files" selectionMode="single" defaultSelectedKeys={["archive"]}>
        <TreeViewItem id="projects" textValue="Projects">
          Projects
        </TreeViewItem>
        <TreeViewItem id="archive" textValue="Archive">
          Archive
        </TreeViewItem>
      </TreeView>
    ));

    expect(screen.getByRole("row", { name: "Projects" })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: "Archive" })).toHaveAttribute("data-selected", "true");
  });

  it("normalizes icon, actions, and action menu slots inside item content", () => {
    render(() => (
      <TreeView aria-label="Slotted files" items={[files[0]]}>
        {(item) => (
          <TreeViewItem id={itemKey(item)} textValue="Projects">
            <TreeViewItemContent>
              <svg slot="icon" aria-hidden="true" data-testid="project-icon" />
              <Text slot="label">Projects</Text>
              <Text slot="description">Pinned work</Text>
              <span slot="actions">
                <button type="button">Archive</button>
              </span>
              <span slot="actionmenu">
                <button type="button">More</button>
              </span>
            </TreeViewItemContent>
          </TreeViewItem>
        )}
      </TreeView>
    ));

    const projects = screen.getByRole("row", { name: /Projects/ });
    expect(projects.querySelector('[data-rsp-slot="icon"]')).toBeInTheDocument();
    expect(projects.querySelector('[data-rsp-slot="actions"]')).toBeInTheDocument();
    expect(projects.querySelector('[data-rsp-slot="actionmenu"]')).toBeInTheDocument();
    expect(screen.getByText("Projects")).toHaveAttribute("data-rsp-slot", "label");
    expect(screen.getByText("Pinned work")).toHaveAttribute("data-rsp-slot", "description");
  });

  it("renders empty state content in the treegrid", () => {
    render(() => (
      <TreeView aria-label="Empty files" items={[]} renderEmptyState={() => "No files"}>
        {() => null}
      </TreeView>
    ));

    expect(screen.getByRole("treegrid", { name: "Empty files" })).toHaveAttribute(
      "data-empty",
      "true",
    );
    expect(screen.getByText("No files")).toBeInTheDocument();
  });

  it("renders the S2 load-more progress indicator for loading collections", () => {
    const onLoadMore = vi.fn();

    render(() => (
      <TreeView
        aria-label="Loading files"
        items={files}
        hasMore
        onLoadMore={onLoadMore}
        loadingState="loadingMore"
      >
        {(item) => <TreeViewItem id={itemKey(item)}>{item.value?.label}</TreeViewItem>}
      </TreeView>
    ));

    expect(screen.getByRole("treegrid", { name: "Loading files" })).toHaveAttribute(
      "data-loading-state",
      "loadingMore",
    );
    expect(screen.getByRole("progressbar", { name: "Loading more" })).toBeInTheDocument();
  });

  it("passes selected keys to renderActionBar", () => {
    render(() => (
      <TreeView
        aria-label="Files"
        items={files}
        selectionMode="multiple"
        defaultSelectedKeys={["projects", "archive"]}
        renderActionBar={(keys) => (
          <output data-testid="selection-count">
            {keys === "all" ? "all" : `${keys.size} selected`}
          </output>
        )}
      >
        {(item) => <TreeViewItem id={itemKey(item)}>{item.value?.label}</TreeViewItem>}
      </TreeView>
    ));

    expect(screen.getByTestId("selection-count")).toHaveTextContent("2 selected");
  });

  it("merges TreeViewContext props", () => {
    const ref = vi.fn();

    render(() => (
      <TreeViewContext.Provider
        value={{
          "aria-label": "Context files",
          selectionStyle: "highlight",
          overflowMode: "wrap",
          ref,
        }}
      >
        <TreeView items={files}>
          {(item) => <TreeViewItem id={itemKey(item)}>{item.value?.label}</TreeViewItem>}
        </TreeView>
      </TreeViewContext.Provider>
    ));

    const tree = screen.getByRole("treegrid", { name: "Context files" });
    expect(tree).toHaveAttribute("data-selection-style", "highlight");
    expect(tree).toHaveAttribute("data-overflow-mode", "wrap");
    expect(ref).toHaveBeenCalledWith(tree);
  });
});
