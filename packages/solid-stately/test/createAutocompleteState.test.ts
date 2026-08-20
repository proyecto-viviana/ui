/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import { createAutocompleteState } from "../src/autocomplete";

describe("createAutocompleteState", () => {
  it("should initialize with default empty input value", () => {
    createRoot((dispose) => {
      const state = createAutocompleteState();
      expect(state.inputValue()).toBe("");
      dispose();
    });
  });

  it("should initialize with provided default input value", () => {
    createRoot((dispose) => {
      const state = createAutocompleteState({ defaultInputValue: "hello" });
      expect(state.inputValue()).toBe("hello");
      dispose();
    });
  });

  it("should update input value when setInputValue is called", () => {
    createRoot((dispose) => {
      const state = createAutocompleteState();
      expect(state.inputValue()).toBe("");

      state.setInputValue("new value");
      expect(state.inputValue()).toBe("new value");
      dispose();
    });
  });

  it("should call onInputChange when input value changes", () => {
    createRoot((dispose) => {
      const onInputChange = vi.fn();
      const state = createAutocompleteState({ onInputChange });

      state.setInputValue("test");
      expect(onInputChange).toHaveBeenCalledWith("test");
      expect(onInputChange).toHaveBeenCalledTimes(1);
      dispose();
    });
  });

  it("should use controlled value when provided", () => {
    createRoot((dispose) => {
      const state = createAutocompleteState({ inputValue: "controlled" });
      expect(state.inputValue()).toBe("controlled");

      // setInputValue should still call onInputChange but not update internal value
      state.setInputValue("new");
      expect(state.inputValue()).toBe("controlled");
      dispose();
    });
  });

  it("should react to controlled value updates", () => {
    createRoot((dispose) => {
      const [value, setValue] = createSignal("initial");
      const state = createAutocompleteState({
        get inputValue() {
          return value();
        },
      });

      expect(state.inputValue()).toBe("initial");
      setValue("updated");
      expect(state.inputValue()).toBe("updated");
      dispose();
    });
  });

  it("should initialize focusedNodeId as null", () => {
    createRoot((dispose) => {
      const state = createAutocompleteState();
      expect(state.focusedNodeId()).toBe(null);
      dispose();
    });
  });

  it("should update focusedNodeId when setFocusedNodeId is called", () => {
    createRoot((dispose) => {
      const state = createAutocompleteState();
      expect(state.focusedNodeId()).toBe(null);

      state.setFocusedNodeId("item-1");
      expect(state.focusedNodeId()).toBe("item-1");

      state.setFocusedNodeId("item-2");
      expect(state.focusedNodeId()).toBe("item-2");

      state.setFocusedNodeId(null);
      expect(state.focusedNodeId()).toBe(null);
      dispose();
    });
  });
});
