/**
 * Tests for createTreeGridState and TableCollection tree-grid mode.
 */

import { describe, it, expect, vi } from "vite-plus/test"; import { flush, createRoot } from "solid-js";
import {
  createTreeGridState,
  createTableCollection,
  type ColumnDefinition,
  type RowDefinition,
} from "../src/table";
import type { Key } from "../src/collections/types";

interface Item {
  name: string;
  type: string;
}

const treeColumns: ColumnDefinition<Item>[] = [
  { key: "name", name: "Name", isRowHeader: true },
  { key: "type", name: "Type" },
];

// projects > project-1 > (file-1, file-2), project-2 ; documents > doc-1
const treeRows: RowDefinition<Item>[] = [
  {
    key: "projects",
    value: { name: "Projects", type: "folder" },
    childRows: [
      {
        key: "project-1",
        value: { name: "Project 1", type: "folder" },
        childRows: [
          { key: "file-1", value: { name: "File 1", type: "file" } },
          { key: "file-2", value: { name: "File 2", type: "file" } },
        ],
      },
      { key: "project-2", value: { name: "Project 2", type: "file" } },
    ],
  },
  {
    key: "documents",
    value: { name: "Documents", type: "folder" },
    childRows: [{ key: "doc-1", value: { name: "Doc 1", type: "file" } }],
  },
];

const keysOf = (collection: { [Symbol.iterator](): Iterator<{ key: Key }> }): Key[] =>
  [...collection].map((row) => row.key);

describe("TableCollection (tree-grid mode)", () => {
  it("only flattens top-level rows when nothing is expanded", () => {
    const collection = createTableCollection({
      columns: treeColumns,
      rows: treeRows,
      expandedKeys: new Set<Key>(),
    });

    flush();
    expect(collection.size).toBe(2);
    flush();
    expect(keysOf(collection)).toEqual(["projects", "documents"]);
    // Collapsed descendants are absent from the key map (selection parity with upstream).
    flush();
    expect(collection.getItem("project-1")).toBeNull();
    flush();
    expect(collection.getItem("file-1")).toBeNull();
  });

  it("resolves treeColumn to the first row-header column and counts user columns", () => {
    const collection = createTableCollection({
      columns: treeColumns,
      rows: treeRows,
      expandedKeys: new Set<Key>(),
    });

    flush();
    expect(collection.treeColumn).toBe("name");
    flush();
    expect(collection.userColumnCount).toBe(2);
  });

  it("honours an explicit treeColumn override", () => {
    const collection = createTableCollection({
      columns: treeColumns,
      rows: treeRows,
      expandedKeys: new Set<Key>(),
      treeColumn: "type",
    });

    flush();
    expect(collection.treeColumn).toBe("type");
  });

  it("keeps the full child structure on the body's rows for aria-posinset/setsize", () => {
    const collection = createTableCollection({
      columns: treeColumns,
      rows: treeRows,
      expandedKeys: new Set<Key>(),
    });

    // body keeps top-level rows even though child rows are collapsed
    flush();
    expect(collection.body.childNodes.map((n) => n.key)).toEqual(["projects", "documents"]);

    const projects = collection.body.childNodes[0];
    // [name cell, type cell, project-1 row, project-2 row]
    flush();
    expect(projects.childNodes.map((n) => n.type)).toEqual(["rowheader", "cell", "item", "item"]);
    flush();
    expect(projects.childNodes.filter((n) => n.type === "item").map((n) => n.key)).toEqual([
      "project-1",
      "project-2",
    ]);
    flush();
    expect(projects.firstChildKey).toBe("projects-name");
    flush();
    expect(projects.lastChildKey).toBe("project-2");
  });

  it("marks expandable rows and their expanded state", () => {
    const collection = createTableCollection({
      columns: treeColumns,
      rows: treeRows,
      expandedKeys: new Set<Key>(["projects"]),
    });

    flush();
    const projects = collection.getItem("projects")!;
    expect(projects.isExpandable).toBe(true);
    flush();
    expect(projects.isExpanded).toBe(true);
    flush();
    expect(projects.level).toBe(0);

    flush();
    const project1 = collection.getItem("project-1")!;
    expect(project1.isExpandable).toBe(true);
    flush();
    expect(project1.isExpanded).toBe(false);
    flush();
    expect(project1.level).toBe(1);
    flush();
    expect(project1.parentKey).toBe("projects");

    flush();
    const project2 = collection.getItem("project-2")!;
    expect(project2.isExpandable).toBe(false);
  });

  it("flattens one expanded level in document order", () => {
    const collection = createTableCollection({
      columns: treeColumns,
      rows: treeRows,
      expandedKeys: new Set<Key>(["projects"]),
    });

    flush();
    expect(keysOf(collection)).toEqual(["projects", "project-1", "project-2", "documents"]);
    flush();
    expect(collection.size).toBe(4);
    // project-1 is collapsed, so its files are still hidden
    flush();
    expect(collection.getItem("file-1")).toBeNull();
  });

  it("flattens nested expanded levels", () => {
    const collection = createTableCollection({
      columns: treeColumns,
      rows: treeRows,
      expandedKeys: new Set<Key>(["projects", "project-1"]),
    });

    flush();
    expect(keysOf(collection)).toEqual([
      "projects",
      "project-1",
      "file-1",
      "file-2",
      "project-2",
      "documents",
    ]);
    flush();
    const file1 = collection.getItem("file-1")!;
    expect(file1.level).toBe(2);
    flush();
    expect(file1.parentKey).toBe("project-1");
    flush();
    expect(file1.isExpandable).toBe(false);
  });

  it("expands everything when expandedKeys is 'all'", () => {
    const collection = createTableCollection({
      columns: treeColumns,
      rows: treeRows,
      expandedKeys: "all",
    });

    flush();
    expect(keysOf(collection)).toEqual([
      "projects",
      "project-1",
      "file-1",
      "file-2",
      "project-2",
      "documents",
      "doc-1",
    ]);
    flush();
    expect(collection.size).toBe(7);
  });

  it("navigates visible rows in flattened order", () => {
    const collection = createTableCollection({
      columns: treeColumns,
      rows: treeRows,
      expandedKeys: new Set<Key>(["projects"]),
    });

    flush();
    expect(collection.getFirstKey()).toBe("projects");
    flush();
    expect(collection.getLastKey()).toBe("documents");
    flush();
    expect(collection.getKeyAfter("projects")).toBe("project-1");
    flush();
    expect(collection.getKeyAfter("project-2")).toBe("documents");
    flush();
    expect(collection.getKeyBefore("documents")).toBe("project-2");
    flush();
    expect(collection.at(1)?.key).toBe("project-1");
  });

  it("does not treat childRows as a tree when expandedKeys is omitted", () => {
    const collection = createTableCollection({
      columns: treeColumns,
      rows: treeRows,
    });

    flush();
    expect(collection.treeColumn).toBeNull();
    flush();
    expect(collection.size).toBe(2);
    // childRows ignored entirely in flat mode
    flush();
    expect(collection.getItem("project-1")).toBeNull();
    flush();
    expect(collection.body.childNodes[0].childNodes.every((n) => n.type !== "item")).toBe(true);
  });
});

describe("createTreeGridState", () => {
  const baseOptions = () => ({
    columns: treeColumns,
    rows: treeRows,
  });

  it("collapses all rows by default", () => {
    createRoot((dispose) => {
      const state = createTreeGridState<Item>(() => baseOptions());

      flush();
      expect(state.expandedKeys).toEqual(new Set());
      flush();
      expect(state.collection.size).toBe(2);
      flush();
      expect(state.treeColumn).toBe("name");
      flush();
      expect(state.userColumnCount).toBe(2);
      flush();
      expect(state.keyMap.has("projects")).toBe(true);
      flush();
      expect(state.keyMap.has("project-1")).toBe(false);

      dispose();
    });
  });

  it("seeds expansion from UNSTABLE_defaultExpandedKeys (uncontrolled)", () => {
    createRoot((dispose) => {
      const state = createTreeGridState<Item>(() => ({
        ...baseOptions(),
        UNSTABLE_defaultExpandedKeys: ["projects"],
      }));

      flush();
      expect(state.expandedKeys).toEqual(new Set(["projects"]));
      flush();
      expect(state.collection.size).toBe(4);

      dispose();
    });
  });

  it("toggleKey expands and collapses, calling onExpandedChange", () => {
    createRoot((dispose) => {
      const onExpandedChange = vi.fn();
      const state = createTreeGridState<Item>(() => ({
        ...baseOptions(),
        UNSTABLE_onExpandedChange: onExpandedChange,
      }));

      state.toggleKey("projects");
      flush();
      expect(onExpandedChange).toHaveBeenLastCalledWith(new Set(["projects"]));
      flush();
      expect(state.expandedKeys).toEqual(new Set(["projects"]));
      flush();
      expect(state.collection.size).toBe(4);
      flush();
      expect(state.collection.getItem("project-1")).not.toBeNull();

      state.toggleKey("project-1");
      flush();
      expect(state.expandedKeys).toEqual(new Set(["projects", "project-1"]));
      flush();
      expect(state.collection.size).toBe(6);

      state.toggleKey("projects");
      flush();
      expect(state.expandedKeys).toEqual(new Set(["project-1"]));
      // projects collapsed, so its (still-expanded) descendants are hidden again
      flush();
      expect(state.collection.size).toBe(2);

      dispose();
    });
  });

  it("does not mutate internal state when controlled, but still reports changes", () => {
    createRoot((dispose) => {
      const onExpandedChange = vi.fn();
      const state = createTreeGridState<Item>(() => ({
        ...baseOptions(),
        UNSTABLE_expandedKeys: ["projects"],
        UNSTABLE_onExpandedChange: onExpandedChange,
      }));

      flush();
      expect(state.expandedKeys).toEqual(new Set(["projects"]));
      flush();
      expect(state.collection.size).toBe(4);

      state.toggleKey("projects");
      // Controlled: parent is expected to update the prop; the change is reported but the
      // collection stays in sync with the (unchanged) controlled value.
      flush();
      expect(onExpandedChange).toHaveBeenLastCalledWith(new Set([]));
      flush();
      expect(state.expandedKeys).toEqual(new Set(["projects"]));
      flush();
      expect(state.collection.size).toBe(4);

      dispose();
    });
  });

  it("materialises expandable rows when collapsing one from 'all'", () => {
    createRoot((dispose) => {
      const onExpandedChange = vi.fn();
      const state = createTreeGridState<Item>(() => ({
        ...baseOptions(),
        UNSTABLE_expandedKeys: "all",
        UNSTABLE_onExpandedChange: onExpandedChange,
      }));

      flush();
      expect(state.collection.size).toBe(7);

      state.toggleKey("projects");
      // All expandable rows are {projects, project-1, documents}; collapsing projects leaves
      // the rest expanded.
      flush();
      expect(onExpandedChange).toHaveBeenLastCalledWith(new Set(["project-1", "documents"]));

      dispose();
    });
  });
});
