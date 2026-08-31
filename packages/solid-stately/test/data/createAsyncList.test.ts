import { describe, it, expect, vi } from "vite-plus/test";
import { createRoot, createEffect } from "solid-js";
import { createAsyncList } from "../../src/data/createAsyncList";

interface Item {
  id: number;
  name: string;
}

function waitForIdle(list: { loadingState: string }, timeout = 2000): Promise<void> {
  return new Promise((resolve, reject) => {
    const start = Date.now();
    const check = () => {
      if (list.loadingState === "idle") {
        resolve();
      } else if (Date.now() - start > timeout) {
        reject(new Error(`Timed out waiting for idle state. Current: ${list.loadingState}`));
      } else {
        setTimeout(check, 10);
      }
    };
    check();
  });
}

describe("createAsyncList", () => {
  it("starts in loading state and loads items", async () => {
    await createRoot(async (dispose) => {
      const list = createAsyncList<Item>({
        load: async () => ({
          items: [
            { id: 1, name: "One" },
            { id: 2, name: "Two" },
          ],
        }),
      });

      expect(list.isLoading).toBe(true);
      await waitForIdle(list);
      expect(list.items).toHaveLength(2);
      expect(list.items[0].name).toBe("One");
      expect(list.isLoading).toBe(false);
      dispose();
    });
  });

  it("handles load errors", async () => {
    await createRoot(async (dispose) => {
      const list = createAsyncList<Item>({
        load: async () => {
          throw new Error("Load failed");
        },
      });

      // Wait for error state
      await new Promise((resolve) => setTimeout(resolve, 50));
      expect(list.loadingState).toBe("error");
      expect(list.error?.message).toBe("Load failed");
      dispose();
    });
  });

  it("reload reloads the data", async () => {
    let loadCount = 0;
    await createRoot(async (dispose) => {
      const list = createAsyncList<Item>({
        load: async () => {
          loadCount++;
          return { items: [{ id: loadCount, name: `Item ${loadCount}` }] };
        },
      });

      await waitForIdle(list);
      expect(loadCount).toBe(1);
      expect(list.items).toHaveLength(1);

      list.reload();
      await waitForIdle(list);
      expect(loadCount).toBe(2);
      dispose();
    });
  });

  it("supports pagination with loadMore", async () => {
    let page = 0;
    await createRoot(async (dispose) => {
      const list = createAsyncList<Item, string>({
        load: async ({ cursor }) => {
          page++;
          if (!cursor) {
            return {
              items: [{ id: 1, name: "Page1" }],
              cursor: "page2",
            };
          }
          return {
            items: [{ id: 2, name: "Page2" }],
          };
        },
      });

      await waitForIdle(list);
      expect(list.items).toHaveLength(1);
      expect(page).toBe(1);

      list.loadMore();
      await waitForIdle(list);
      expect(list.items).toHaveLength(2);
      expect(list.items[1].name).toBe("Page2");
      dispose();
    });
  });

  it("sort triggers sorting", async () => {
    await createRoot(async (dispose) => {
      const list = createAsyncList<Item>({
        load: async ({ sortDescriptor }) => {
          const items = [
            { id: 1, name: "Banana" },
            { id: 2, name: "Apple" },
          ];
          if (sortDescriptor?.direction === "ascending") {
            items.sort((a, b) => a.name.localeCompare(b.name));
          }
          return { items };
        },
      });

      await waitForIdle(list);
      expect(list.items[0].name).toBe("Banana");

      list.sort({ column: "name", direction: "ascending" });
      await waitForIdle(list);
      expect(list.items[0].name).toBe("Apple");
      dispose();
    });
  });

  it("setSelectedKeys works", async () => {
    await createRoot(async (dispose) => {
      const list = createAsyncList<Item>({
        load: async () => ({
          items: [{ id: 1, name: "One" }],
        }),
      });

      await waitForIdle(list);
      list.setSelectedKeys(new Set([1]));
      expect((list.selectedKeys as Set<number>).has(1)).toBe(true);
      dispose();
    });
  });

  it("getItem returns item by key", async () => {
    await createRoot(async (dispose) => {
      const list = createAsyncList<Item>({
        load: async () => ({
          items: [
            { id: 1, name: "One" },
            { id: 2, name: "Two" },
          ],
        }),
      });

      await waitForIdle(list);
      expect(list.getItem(2)?.name).toBe("Two");
      expect(list.getItem(99)).toBeUndefined();
      dispose();
    });
  });

  it("append adds items", async () => {
    await createRoot(async (dispose) => {
      const list = createAsyncList<Item>({
        load: async () => ({
          items: [{ id: 1, name: "One" }],
        }),
      });

      await waitForIdle(list);
      list.append({ id: 2, name: "Two" });
      expect(list.items).toHaveLength(2);
      dispose();
    });
  });

  it("remove removes items", async () => {
    await createRoot(async (dispose) => {
      const list = createAsyncList<Item>({
        load: async () => ({
          items: [
            { id: 1, name: "One" },
            { id: 2, name: "Two" },
          ],
        }),
      });

      await waitForIdle(list);
      list.remove(1);
      expect(list.items).toHaveLength(1);
      expect(list.items[0].name).toBe("Two");
      dispose();
    });
  });

  it("setFilterText triggers filtering", async () => {
    let lastFilterText = "";
    await createRoot(async (dispose) => {
      const list = createAsyncList<Item>({
        load: async ({ filterText }) => {
          lastFilterText = filterText ?? "";
          const items = [
            { id: 1, name: "Apple" },
            { id: 2, name: "Banana" },
          ];
          return {
            items: filterText
              ? items.filter((i) => i.name.toLowerCase().includes(filterText.toLowerCase()))
              : items,
          };
        },
      });

      await waitForIdle(list);
      expect(list.items).toHaveLength(2);

      list.setFilterText("apple");
      await waitForIdle(list);
      expect(lastFilterText).toBe("apple");
      dispose();
    });
  });

  it("supports initialSortDescriptor", async () => {
    await createRoot(async (dispose) => {
      const list = createAsyncList<Item>({
        initialSortDescriptor: { column: "name", direction: "ascending" },
        load: async ({ sortDescriptor }) => ({
          items: [{ id: 1, name: "One" }],
          sortDescriptor,
        }),
      });

      await waitForIdle(list);
      expect(list.sortDescriptor?.column).toBe("name");
      expect(list.sortDescriptor?.direction).toBe("ascending");
      dispose();
    });
  });

  it("ignores loadMore when already loading", async () => {
    await createRoot(async (dispose) => {
      const list = createAsyncList<Item>({
        load: async () => ({
          items: [{ id: 1, name: "One" }],
        }),
      });

      // loadMore during initial load should be ignored
      list.loadMore();
      await waitForIdle(list);
      expect(list.items).toHaveLength(1);
      dispose();
    });
  });

  it("handles synchronous load function", async () => {
    await createRoot(async (dispose) => {
      const list = createAsyncList<Item>({
        load: () => ({
          items: [{ id: 1, name: "Sync" }],
        }),
      });

      await waitForIdle(list);
      expect(list.items).toHaveLength(1);
      expect(list.items[0].name).toBe("Sync");
      dispose();
    });
  });
});
