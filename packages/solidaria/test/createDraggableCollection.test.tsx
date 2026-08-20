import { describe, it, expect, afterEach } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import {
  createDraggableCollection,
  getGlobalDraggingCollectionRef,
  getGlobalDraggingKeys,
  getGlobalDraggingTypes,
  setGlobalDraggingCollectionRef,
  setGlobalDraggingKeys,
  setGlobalDraggingTypes,
} from "../src/dnd/createDraggableCollection";

afterEach(() => {
  setGlobalDraggingCollectionRef(null);
  setGlobalDraggingKeys(new Set());
  setGlobalDraggingTypes(new Set());
});

describe("createDraggableCollection", () => {
  it("tracks and clears global drag state as dragging keys change", async () => {
    createRoot((dispose) => {
      const refEl = document.createElement("div");
      const [draggingKeys, setDraggingKeys] = createSignal<Set<string | number>>(new Set());

      createDraggableCollection(
        {
          ref: () => refEl,
        },
        {
          get draggingKeys() {
            return draggingKeys();
          },
          getItems(keys: Set<string | number>) {
            return Array.from(keys).map((key) => ({ "text/plain": String(key) }));
          },
        } as any,
      );

      expect(getGlobalDraggingCollectionRef()).toBeNull();
      expect(getGlobalDraggingKeys().size).toBe(0);
      expect(getGlobalDraggingTypes().size).toBe(0);

      const nextKeys = new Set<string | number>(["a", 1]);
      setDraggingKeys(nextKeys);
      queueMicrotask(() => {
        expect(getGlobalDraggingCollectionRef()).toBe(refEl);
        expect(getGlobalDraggingKeys()).toEqual(nextKeys);
        expect(getGlobalDraggingTypes()).toEqual(new Set(["text/plain"]));

        setDraggingKeys(new Set());
        queueMicrotask(() => {
          expect(getGlobalDraggingCollectionRef()).toBeNull();
          expect(getGlobalDraggingKeys().size).toBe(0);
          expect(getGlobalDraggingTypes().size).toBe(0);
          dispose();
        });
      });
    });
    await Promise.resolve();
    await Promise.resolve();
  });

  it("clears global drag state on cleanup", async () => {
    createRoot((dispose) => {
      const refEl = document.createElement("div");
      const [draggingKeys] = createSignal<Set<string | number>>(new Set(["z"]));

      createDraggableCollection(
        {
          ref: () => refEl,
        },
        {
          get draggingKeys() {
            return draggingKeys();
          },
          getItems(keys: Set<string | number>) {
            return Array.from(keys).map((key) => ({ "text/plain": String(key) }));
          },
        } as any,
      );

      queueMicrotask(() => {
        expect(getGlobalDraggingCollectionRef()).toBe(refEl);
        expect(getGlobalDraggingKeys()).toEqual(new Set(["z"]));
        expect(getGlobalDraggingTypes()).toEqual(new Set(["text/plain"]));

        dispose();

        expect(getGlobalDraggingCollectionRef()).toBeNull();
        expect(getGlobalDraggingKeys().size).toBe(0);
        expect(getGlobalDraggingTypes().size).toBe(0);
      });
    });
    await Promise.resolve();
  });
});
