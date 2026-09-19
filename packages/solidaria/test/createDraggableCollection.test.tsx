import { describe, it, expect, afterEach } from "vite-plus/test"; import { createRoot, createSignal, flush } from "solid-js";
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

function fakeState(draggingKeys: () => Set<string | number>) {
  return {
    get draggingKeys() {
      return draggingKeys();
    },
    getItems(keys: Set<string | number>) {
      return Array.from(keys).map((key) => ({ "text/plain": String(key) }));
    },
  } as any;
}

describe("createDraggableCollection", () => {
  it("tracks and clears global drag state as dragging keys change", () => {
    const refEl = document.createElement("div");
    const [draggingKeys, setDraggingKeys] = createSignal<Set<string | number>>(new Set(), {
      ownedWrite: true,
    });

    const dispose = createRoot((dispose) => {
      createDraggableCollection({ ref: () => refEl }, fakeState(draggingKeys));
      return dispose;
    });

    flush();
    expect(getGlobalDraggingCollectionRef()).toBeNull();
    expect(getGlobalDraggingKeys().size).toBe(0);
    expect(getGlobalDraggingTypes().size).toBe(0);

    const nextKeys = new Set<string | number>(["a", 1]);
    setDraggingKeys(nextKeys);
    flush();
    expect(getGlobalDraggingCollectionRef()).toBe(refEl);
    expect(getGlobalDraggingKeys()).toEqual(nextKeys);
    expect(getGlobalDraggingTypes()).toEqual(new Set(["text/plain"]));

    setDraggingKeys(new Set());
    flush();
    expect(getGlobalDraggingCollectionRef()).toBeNull();
    expect(getGlobalDraggingKeys().size).toBe(0);
    expect(getGlobalDraggingTypes().size).toBe(0);
    dispose();
  });

  it("clears global drag state on cleanup", () => {
    const refEl = document.createElement("div");
    const [draggingKeys] = createSignal<Set<string | number>>(new Set(["z"]));

    const dispose = createRoot((dispose) => {
      createDraggableCollection({ ref: () => refEl }, fakeState(draggingKeys));
      return dispose;
    });

    flush();
    expect(getGlobalDraggingCollectionRef()).toBe(refEl);
    expect(getGlobalDraggingKeys()).toEqual(new Set(["z"]));
    expect(getGlobalDraggingTypes()).toEqual(new Set(["text/plain"]));

    dispose();
    flush();
    expect(getGlobalDraggingCollectionRef()).toBeNull();
    expect(getGlobalDraggingKeys().size).toBe(0);
    expect(getGlobalDraggingTypes().size).toBe(0);
  });
});
