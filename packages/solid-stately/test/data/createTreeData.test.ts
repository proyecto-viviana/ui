import { describe, it, expect } from "vite-plus/test";
import { createRoot } from "solid-js";
import { createTreeData } from "../../src/data/createTreeData";

interface TreeItem {
  id: number;
  name: string;
  children?: TreeItem[];
}

function createTestTree() {
  return createTreeData<TreeItem>({
    initialItems: [
      {
        id: 1,
        name: "A",
        children: [
          { id: 11, name: "A1", children: [] },
          { id: 12, name: "A2", children: [] },
        ],
      },
      {
        id: 2,
        name: "B",
        children: [{ id: 21, name: "B1", children: [] }],
      },
      { id: 3, name: "C", children: [] },
    ],
    getChildren: (item) => item.children ?? [],
  });
}

describe("createTreeData", () => {
  it("initializes with tree items", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      expect(tree.items).toHaveLength(3);
      expect(tree.items[0].value.name).toBe("A");
      expect(tree.items[0].children).toHaveLength(2);
      dispose();
    });
  });

  it("getItem returns a node by key", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      const node = tree.getItem(11);
      expect(node).toBeDefined();
      expect(node!.value.name).toBe("A1");
      expect(node!.parentKey).toBe(1);
      dispose();
    });
  });

  it("getItem returns undefined for missing key", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      expect(tree.getItem(999)).toBeUndefined();
      dispose();
    });
  });

  it("append adds items to root", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      tree.append(null, { id: 4, name: "D", children: [] });
      expect(tree.items).toHaveLength(4);
      expect(tree.items[3].value.name).toBe("D");
      dispose();
    });
  });

  it("append adds items to a parent", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      tree.append(1, { id: 13, name: "A3", children: [] });
      const parent = tree.getItem(1);
      expect(parent!.children).toHaveLength(3);
      expect(parent!.children![2].value.name).toBe("A3");
      dispose();
    });
  });

  it("prepend adds items to the beginning", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      tree.prepend(null, { id: 0, name: "Z", children: [] });
      expect(tree.items).toHaveLength(4);
      expect(tree.items[0].value.name).toBe("Z");
      dispose();
    });
  });

  it("insert adds items at index", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      tree.insert(null, 1, { id: 10, name: "Inserted", children: [] });
      expect(tree.items).toHaveLength(4);
      expect(tree.items[1].value.name).toBe("Inserted");
      dispose();
    });
  });

  it("insertBefore inserts before a key", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      tree.insertBefore(2, { id: 10, name: "BeforeB", children: [] });
      expect(tree.items).toHaveLength(4);
      expect(tree.items[1].value.name).toBe("BeforeB");
      expect(tree.items[2].value.name).toBe("B");
      dispose();
    });
  });

  it("insertAfter inserts after a key", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      tree.insertAfter(1, { id: 10, name: "AfterA", children: [] });
      expect(tree.items).toHaveLength(4);
      expect(tree.items[1].value.name).toBe("AfterA");
      dispose();
    });
  });

  it("remove removes a root node", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      tree.remove(3);
      expect(tree.items).toHaveLength(2);
      expect(tree.getItem(3)).toBeUndefined();
      dispose();
    });
  });

  it("remove removes a child node", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      tree.remove(11);
      const parent = tree.getItem(1);
      expect(parent!.children).toHaveLength(1);
      expect(parent!.children![0].value.name).toBe("A2");
      dispose();
    });
  });

  it("removeSelectedItems removes selected items", () => {
    createRoot((dispose) => {
      const tree = createTreeData<TreeItem>({
        initialItems: [
          { id: 1, name: "A", children: [] },
          { id: 2, name: "B", children: [] },
          { id: 3, name: "C", children: [] },
        ],
        initialSelectedKeys: [1, 3],
        getChildren: (item) => item.children ?? [],
      });
      tree.removeSelectedItems();
      expect(tree.items).toHaveLength(1);
      expect(tree.items[0].value.name).toBe("B");
      expect(tree.selectedKeys).toEqual(new Set());
      dispose();
    });
  });

  it("setSelectedKeys sets selection", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      tree.setSelectedKeys(new Set([1, 2]));
      expect(tree.selectedKeys).toEqual(new Set([1, 2]));
      dispose();
    });
  });

  it("update updates a node value", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      tree.update(11, { id: 11, name: "A1-Updated", children: [] });
      const node = tree.getItem(11);
      expect(node!.value.name).toBe("A1-Updated");
      dispose();
    });
  });

  it("move moves a node to a new parent", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      // Move A1 (id: 11) from parent A (id: 1) to parent B (id: 2)
      tree.move(11, 2, 0);
      const parentA = tree.getItem(1);
      const parentB = tree.getItem(2);
      expect(parentA!.children).toHaveLength(1);
      expect(parentA!.children![0].value.name).toBe("A2");
      expect(parentB!.children).toHaveLength(2);
      expect(parentB!.children![0].value.name).toBe("A1");
      dispose();
    });
  });

  it("move moves a node to root", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      tree.move(11, null, 0);
      expect(tree.items).toHaveLength(4);
      expect(tree.items[0].value.name).toBe("A1");
      const parentA = tree.getItem(1);
      expect(parentA!.children).toHaveLength(1);
      dispose();
    });
  });

  it("initializes with empty tree", () => {
    createRoot((dispose) => {
      const tree = createTreeData<TreeItem>({
        getChildren: (item) => item.children ?? [],
      });
      expect(tree.items).toHaveLength(0);
      dispose();
    });
  });

  it("handles deeply nested trees", () => {
    createRoot((dispose) => {
      const tree = createTreeData<TreeItem>({
        initialItems: [
          {
            id: 1,
            name: "Root",
            children: [
              {
                id: 2,
                name: "L1",
                children: [
                  {
                    id: 3,
                    name: "L2",
                    children: [],
                  },
                ],
              },
            ],
          },
        ],
        getChildren: (item) => item.children ?? [],
      });
      const deepNode = tree.getItem(3);
      expect(deepNode!.value.name).toBe("L2");
      expect(deepNode!.parentKey).toBe(2);
      dispose();
    });
  });

  it("move rejects cyclical move (node into own subtree)", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      // Try to move A (id: 1) into its own child A1 (id: 11)
      tree.move(1, 11, 0);
      // Should be a no-op
      expect(tree.items).toHaveLength(3);
      expect(tree.items[0].value.name).toBe("A");
      const a1 = tree.getItem(11);
      expect(a1!.parentKey).toBe(1);
      dispose();
    });
  });

  it("moveBefore moves item before a root key", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      // Move C (id: 3) before A (id: 1)
      tree.moveBefore(1, [3]);
      expect(tree.items).toHaveLength(3);
      expect(tree.items[0].value.name).toBe("C");
      expect(tree.items[1].value.name).toBe("A");
      expect(tree.items[2].value.name).toBe("B");
      dispose();
    });
  });

  it("moveAfter moves item after a root key", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      // Move C (id: 3) after A (id: 1)
      tree.moveAfter(1, [3]);
      expect(tree.items).toHaveLength(3);
      expect(tree.items[0].value.name).toBe("A");
      expect(tree.items[1].value.name).toBe("C");
      expect(tree.items[2].value.name).toBe("B");
      dispose();
    });
  });

  it("moveBefore moves item to a different parent", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      // Move C (id: 3) before B1 (id: 21, child of B)
      tree.moveBefore(21, [3]);
      expect(tree.items).toHaveLength(2);
      const parentB = tree.getItem(2);
      expect(parentB!.children).toHaveLength(2);
      expect(parentB!.children![0].value.name).toBe("C");
      expect(parentB!.children![1].value.name).toBe("B1");
      dispose();
    });
  });

  it("moveAfter moves item within the same parent", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      // Move A1 (id: 11) after A2 (id: 12) — both children of A
      tree.moveAfter(12, [11]);
      const parentA = tree.getItem(1);
      expect(parentA!.children).toHaveLength(2);
      expect(parentA!.children![0].value.name).toBe("A2");
      expect(parentA!.children![1].value.name).toBe("A1");
      dispose();
    });
  });

  it("moveBefore/moveAfter moves multiple items", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      // Move A (id: 1) and C (id: 3) after B (id: 2)
      tree.moveAfter(2, [1, 3]);
      expect(tree.items).toHaveLength(3);
      expect(tree.items[0].value.name).toBe("B");
      expect(tree.items[1].value.name).toBe("A");
      expect(tree.items[2].value.name).toBe("C");
      dispose();
    });
  });

  it("moveBefore/moveAfter rejects cyclical move", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      // Try to move A (id: 1) before A1 (id: 11, its own child)
      expect(() => tree.moveBefore(11, [1])).toThrow(
        "Cannot move an item to be a child of itself.",
      );
      dispose();
    });
  });

  it("moveAfter rejects cyclical move into its own subtree", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      expect(() => tree.moveAfter(11, [1])).toThrow("Cannot move an item to be a child of itself.");
      expect(tree.items.map((item) => item.value.name)).toEqual(["A", "B", "C"]);
      expect(tree.getItem(11)!.parentKey).toBe(1);
      dispose();
    });
  });

  it("moveBefore with nonexistent target key is a no-op", () => {
    createRoot((dispose) => {
      const tree = createTestTree();
      tree.moveBefore(999, [1]);
      expect(tree.items).toHaveLength(3);
      expect(tree.items[0].value.name).toBe("A");
      dispose();
    });
  });
});
