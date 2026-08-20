import { describe, it, expect } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import {
  CollectionBuilder,
  Collection,
  createBranchComponent,
  createLeafComponent,
  useCachedChildren,
} from "../src/collections";

describe("collections compatibility helpers", () => {
  it("CollectionBuilder maps items with render function", () => {
    const result = CollectionBuilder({
      items: [1, 2, 3],
      children: (item: number) => item * 2,
    }) as number[];

    expect(result).toEqual([2, 4, 6]);
  });

  it("Collection enables id/value metadata by default", () => {
    const result = Collection({
      items: [{ id: "x" }],
      children: () => ({ kind: "node" }),
    }) as Array<Record<string, unknown>>;

    expect(result[0]?.key).toBe("x");
    expect(result[0]?.id).toBe("x");
    expect((result[0]?.value as { id: string })?.id).toBe("x");
  });

  it("createLeafComponent and createBranchComponent return callable wrappers", () => {
    const leaf = createLeafComponent((props: { value: number }) => props.value + 1);
    const branch = createBranchComponent((props: { value: number }) => props.value + 2);

    expect(leaf({ value: 1 })).toBe(2);
    expect(branch({ value: 1 })).toBe(3);
  });

  it("node-aware leaf/branch components throw outside collection context", () => {
    const leaf = createLeafComponent((props: { value: number }, node) => node?.key);
    const branch = createBranchComponent((props: { value: number }, node) => node?.key);

    expect(() => leaf({ value: 1 })).toThrow("cannot be rendered outside a collection");
    expect(() => branch({ value: 1 })).toThrow("cannot be rendered outside a collection");
  });

  it("node-aware leaf/branch components receive node metadata from CollectionBuilder", () => {
    const leaf = createLeafComponent((props: Record<string, unknown>, node) => node?.key);
    const branch = createBranchComponent((props: Record<string, unknown>, node) => node?.key);

    const built = CollectionBuilder({
      items: [{ id: "a" }],
      addIdAndValue: true,
      children: () => ({ value: 1 }),
    }) as Array<Record<string, unknown>>;

    expect(leaf(built[0])).toBe("a");
    expect(branch(built[0])).toBe("a");
  });

  it("useCachedChildren memoizes mapped children", () => {
    createRoot((dispose) => {
      const cached = useCachedChildren({
        items: ["a", "b"],
        children: (item: string) => item.toUpperCase(),
      });

      expect(cached()).toEqual(["A", "B"]);
      dispose();
    });
  });

  it("useCachedChildren preserves object-item child identity across recomputes", () => {
    createRoot((dispose) => {
      const [tick, setTick] = createSignal(0);
      const items = [{ id: "a" }, { id: "b" }];
      const cached = useCachedChildren(() => ({
        items,
        children: (item: { id: string }) => ({ rendered: item.id, tick: tick() }),
      }));

      const first = cached() as Array<{ rendered: string; tick: number }>;
      setTick(1);
      const second = cached() as Array<{ rendered: string; tick: number }>;

      expect(second[0]).toBe(first[0]);
      expect(second[1]).toBe(first[1]);
      dispose();
    });
  });

  it("useCachedChildren invalidates primitive cache when dependencies change", () => {
    createRoot((dispose) => {
      const [version, setVersion] = createSignal(0);
      const cached = useCachedChildren(() => ({
        items: ["a"],
        dependencies: [version()],
        children: (item: string) => ({ rendered: item, version: version() }),
        getKey: (item: string) => item,
      }));

      const first = cached() as Array<{ rendered: string; version: number }>;
      expect(first[0]?.version).toBe(0);

      setVersion(1);
      const second = cached() as Array<{ rendered: string; version: number }>;
      expect(second[0]?.version).toBe(1);
      expect(second[0]).not.toBe(first[0]);
      dispose();
    });
  });

  it("useCachedChildren augments rendered object with scoped key/id/value when enabled", () => {
    createRoot((dispose) => {
      const cached = useCachedChildren({
        items: [{ id: "alpha" }],
        idScope: "scope",
        addIdAndValue: true,
        children: () => ({ kind: "node" }),
      });

      const output = cached() as Array<Record<string, unknown>>;
      expect(output[0]?.key).toBe("scope:alpha");
      expect(output[0]?.id).toBe("scope:alpha");
      expect((output[0]?.value as { id: string })?.id).toBe("alpha");
      expect((output[0]?.__collectionNode as { key: string })?.key).toBe("scope:alpha");
      dispose();
    });
  });

  it("useCachedChildren throws when key cannot be determined for object items", () => {
    createRoot((dispose) => {
      expect(() =>
        useCachedChildren({
          items: [{ label: "missing-key" }],
          children: () => ({ kind: "node" }),
        })(),
      ).toThrow("Could not determine key for item");
      dispose();
    });
  });
});
