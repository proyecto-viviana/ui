import { describe, it, expect } from "vite-plus/test";
import { createRoot } from "solid-js";
import { createListData } from "../../src/data/createListData";

interface Item {
  id: number;
  name: string;
}

function createTestList(items?: Item[]) {
  return createListData<Item>({
    initialItems: items ?? [
      { id: 1, name: "One" },
      { id: 2, name: "Two" },
      { id: 3, name: "Three" },
    ],
  });
}

describe("createListData", () => {
  it("initializes with items", () => {
    createRoot((dispose) => {
      const list = createTestList();
      expect(list.items).toHaveLength(3);
      expect(list.items[0].name).toBe("One");
      dispose();
    });
  });

  it("initializes with empty list by default", () => {
    createRoot((dispose) => {
      const list = createListData<Item>({});
      expect(list.items).toHaveLength(0);
      dispose();
    });
  });

  it("getItem returns item by key", () => {
    createRoot((dispose) => {
      const list = createTestList();
      expect(list.getItem(2)?.name).toBe("Two");
      expect(list.getItem(99)).toBeUndefined();
      dispose();
    });
  });

  it("append adds items to the end", () => {
    createRoot((dispose) => {
      const list = createTestList();
      list.append({ id: 4, name: "Four" });
      expect(list.items).toHaveLength(4);
      expect(list.items[3].name).toBe("Four");
      dispose();
    });
  });

  it("prepend adds items to the beginning", () => {
    createRoot((dispose) => {
      const list = createTestList();
      list.prepend({ id: 0, name: "Zero" });
      expect(list.items).toHaveLength(4);
      expect(list.items[0].name).toBe("Zero");
      dispose();
    });
  });

  it("insert adds items at index", () => {
    createRoot((dispose) => {
      const list = createTestList();
      list.insert(1, { id: 10, name: "Inserted" });
      expect(list.items).toHaveLength(4);
      expect(list.items[1].name).toBe("Inserted");
      dispose();
    });
  });

  it("insertBefore adds items before key", () => {
    createRoot((dispose) => {
      const list = createTestList();
      list.insertBefore(2, { id: 10, name: "BeforeTwo" });
      expect(list.items).toHaveLength(4);
      expect(list.items[1].name).toBe("BeforeTwo");
      expect(list.items[2].name).toBe("Two");
      dispose();
    });
  });

  it("insertAfter adds items after key", () => {
    createRoot((dispose) => {
      const list = createTestList();
      list.insertAfter(2, { id: 10, name: "AfterTwo" });
      expect(list.items).toHaveLength(4);
      expect(list.items[2].name).toBe("AfterTwo");
      dispose();
    });
  });

  it("insertAfter with nonexistent key on empty list inserts at position 0", () => {
    createRoot((dispose) => {
      const list = createListData<{ id: number; name: string }>({
        initialItems: [],
        getKey: (item) => item.id,
      });
      list.insertAfter(999, { id: 1, name: "First" });
      expect(list.items).toHaveLength(1);
      expect(list.items[0].name).toBe("First");
      dispose();
    });
  });

  it("insertAfter with nonexistent key on non-empty list is a no-op", () => {
    createRoot((dispose) => {
      const list = createTestList();
      list.insertAfter(999, { id: 10, name: "Ghost" });
      expect(list.items).toHaveLength(3);
      dispose();
    });
  });

  it("remove removes items by key", () => {
    createRoot((dispose) => {
      const list = createTestList();
      list.remove(2);
      expect(list.items).toHaveLength(2);
      expect(list.items.find((i) => i.id === 2)).toBeUndefined();
      dispose();
    });
  });

  it("removeSelectedItems removes selected items", () => {
    createRoot((dispose) => {
      const list = createListData<Item>({
        initialItems: [
          { id: 1, name: "One" },
          { id: 2, name: "Two" },
          { id: 3, name: "Three" },
        ],
        initialSelectedKeys: [1, 3],
      });
      list.removeSelectedItems();
      expect(list.items).toHaveLength(1);
      expect(list.items[0].name).toBe("Two");
      dispose();
    });
  });

  it("move moves an item to a new index", () => {
    createRoot((dispose) => {
      const list = createTestList();
      // Move item with id=1 from index 0 to index 2
      // Before: [One, Two, Three]
      // After splice remove from 0: [Two, Three]
      // After splice insert at 2: [Two, Three, One]
      list.move(1, 2);
      expect(list.items[0].name).toBe("Two");
      expect(list.items[2].name).toBe("One");
      dispose();
    });
  });

  it("update updates an item", () => {
    createRoot((dispose) => {
      const list = createTestList();
      list.update(2, { id: 2, name: "Updated" });
      expect(list.getItem(2)?.name).toBe("Updated");
      dispose();
    });
  });

  it("update with function updater", () => {
    createRoot((dispose) => {
      const list = createTestList();
      list.update(2, (prev) => ({ ...prev, name: prev.name + "!" }));
      expect(list.getItem(2)?.name).toBe("Two!");
      dispose();
    });
  });

  it("setSelectedKeys sets selection", () => {
    createRoot((dispose) => {
      const list = createTestList();
      list.setSelectedKeys(new Set([1, 2]));
      expect(list.selectedKeys).toEqual(new Set([1, 2]));
      dispose();
    });
  });

  it("addKeysToSelection adds to selection", () => {
    createRoot((dispose) => {
      const list = createListData<Item>({
        initialItems: [{ id: 1, name: "One" }],
        initialSelectedKeys: [1],
      });
      list.addKeysToSelection(new Set([2]));
      expect((list.selectedKeys as Set<number>).has(1)).toBe(true);
      expect((list.selectedKeys as Set<number>).has(2)).toBe(true);
      dispose();
    });
  });

  it("removeKeysFromSelection removes from selection", () => {
    createRoot((dispose) => {
      const list = createListData<Item>({
        initialItems: [{ id: 1, name: "One" }],
        initialSelectedKeys: [1, 2],
      });
      list.removeKeysFromSelection(new Set([1]));
      expect((list.selectedKeys as Set<number>).has(1)).toBe(false);
      expect((list.selectedKeys as Set<number>).has(2)).toBe(true);
      dispose();
    });
  });

  it("filter works with filterText", () => {
    createRoot((dispose) => {
      const list = createListData<Item>({
        initialItems: [
          { id: 1, name: "Apple" },
          { id: 2, name: "Banana" },
          { id: 3, name: "Avocado" },
        ],
        filter: (item, text) => item.name.toLowerCase().includes(text.toLowerCase()),
      });
      expect(list.items).toHaveLength(3);
      list.setFilterText("a");
      expect(list.items).toHaveLength(3); // Apple, Banana, Avocado all contain 'a'
      list.setFilterText("av");
      expect(list.items).toHaveLength(1);
      expect(list.items[0].name).toBe("Avocado");
      dispose();
    });
  });

  it("moveBefore moves items before a key", () => {
    createRoot((dispose) => {
      const list = createTestList();
      list.moveBefore(1, [3]);
      expect(list.items[0].name).toBe("Three");
      expect(list.items[1].name).toBe("One");
      dispose();
    });
  });

  it("moveAfter moves items after a key", () => {
    createRoot((dispose) => {
      const list = createTestList();
      list.moveAfter(1, [3]);
      expect(list.items[1].name).toBe("Three");
      expect(list.items[0].name).toBe("One");
      dispose();
    });
  });
});
