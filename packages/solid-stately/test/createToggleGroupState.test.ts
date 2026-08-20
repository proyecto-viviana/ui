import { describe, expect, it, vi } from "vite-plus/test";
import { createSignal } from "solid-js";
import { createToggleGroupState } from "../src";

describe("createToggleGroupState", () => {
  it("defaults to single selection mode", () => {
    const state = createToggleGroupState();

    expect(state.selectionMode).toBe("single");
    expect(state.selectedKeys.size).toBe(0);
  });

  it("toggles selected key in single mode", () => {
    const state = createToggleGroupState({
      selectionMode: "single",
    });

    state.toggleKey("a");
    expect(state.selectedKeys).toEqual(new Set(["a"]));

    state.toggleKey("a");
    expect(state.selectedKeys).toEqual(new Set());
  });

  it("respects disallowEmptySelection in single mode", () => {
    const state = createToggleGroupState({
      selectionMode: "single",
      disallowEmptySelection: true,
      defaultSelectedKeys: ["a"],
    });

    state.toggleKey("a");
    expect(state.selectedKeys).toEqual(new Set(["a"]));
  });

  it("supports multiple selection mode", () => {
    const state = createToggleGroupState({
      selectionMode: "multiple",
    });

    state.toggleKey("a");
    state.toggleKey("b");
    expect(state.selectedKeys).toEqual(new Set(["a", "b"]));

    state.toggleKey("a");
    expect(state.selectedKeys).toEqual(new Set(["b"]));
  });

  it("prevents empty selection in multiple mode when disallowed", () => {
    const state = createToggleGroupState({
      selectionMode: "multiple",
      disallowEmptySelection: true,
      defaultSelectedKeys: ["a"],
    });

    state.toggleKey("a");
    expect(state.selectedKeys).toEqual(new Set(["a"]));
  });

  it("supports controlled selectedKeys", () => {
    const [selectedKeys] = createSignal<Set<string>>(new Set(["a"]));
    const onSelectionChange = vi.fn();
    const state = createToggleGroupState(() => ({
      selectedKeys: selectedKeys(),
      onSelectionChange,
      selectionMode: "single",
    }));

    expect(state.selectedKeys).toEqual(new Set(["a"]));

    state.toggleKey("b");
    expect(onSelectionChange).toHaveBeenCalledWith(new Set(["b"]));
    expect(state.selectedKeys).toEqual(new Set(["a"]));
  });

  it("setSelected synchronizes with toggle behavior", () => {
    const state = createToggleGroupState({
      selectionMode: "multiple",
    });

    state.setSelected("a", true);
    expect(state.selectedKeys).toEqual(new Set(["a"]));

    state.setSelected("a", false);
    expect(state.selectedKeys).toEqual(new Set());
  });
});
