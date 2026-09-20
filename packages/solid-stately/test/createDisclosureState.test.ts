/**
 * Tests for createDisclosureState and createDisclosureGroupState
 *
 * Based on @react-stately/disclosure useDisclosureState and useDisclosureGroupState.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createSignal } from "./owned-signal";
import { flush, createRoot } from "solid-js";
import {
  createDisclosureState,
  createDisclosureGroupState,
} from "../src/disclosure/createDisclosureState";

describe("createDisclosureState", () => {
  describe("basic state management", () => {
    it("should default to collapsed", () => {
      createRoot((dispose) => {
        const state = createDisclosureState();

        flush();
        expect(state.isExpanded()).toBe(false);

        dispose();
      });
    });

    it("should use defaultExpanded for initial value", () => {
      createRoot((dispose) => {
        const state = createDisclosureState({
          defaultExpanded: true,
        });

        flush();
        expect(state.isExpanded()).toBe(true);

        dispose();
      });
    });

    it("should use isExpanded for controlled mode", () => {
      createRoot((dispose) => {
        const state = createDisclosureState({
          isExpanded: true,
        });

        flush();
        expect(state.isExpanded()).toBe(true);

        dispose();
      });
    });
  });

  describe("expand and collapse", () => {
    it("should expand", () => {
      createRoot((dispose) => {
        const state = createDisclosureState();

        flush();
        expect(state.isExpanded()).toBe(false);
        state.expand();
        flush();
        expect(state.isExpanded()).toBe(true);

        dispose();
      });
    });

    it("should collapse", () => {
      createRoot((dispose) => {
        const state = createDisclosureState({
          defaultExpanded: true,
        });

        flush();
        expect(state.isExpanded()).toBe(true);
        state.collapse();
        flush();
        expect(state.isExpanded()).toBe(false);

        dispose();
      });
    });

    it("should toggle", () => {
      createRoot((dispose) => {
        const state = createDisclosureState();

        flush();
        expect(state.isExpanded()).toBe(false);
        state.toggle();
        flush();
        expect(state.isExpanded()).toBe(true);
        state.toggle();
        flush();
        expect(state.isExpanded()).toBe(false);

        dispose();
      });
    });

    it("should set expanded state directly", () => {
      createRoot((dispose) => {
        const state = createDisclosureState();

        state.setExpanded(true);
        flush();
        expect(state.isExpanded()).toBe(true);

        state.setExpanded(false);
        flush();
        expect(state.isExpanded()).toBe(false);

        dispose();
      });
    });
  });

  describe("onChange callback", () => {
    it("should call onExpandedChange when expanding", () => {
      createRoot((dispose) => {
        const onExpandedChange = vi.fn();
        const state = createDisclosureState({ onExpandedChange });

        state.expand();

        flush();
        expect(onExpandedChange).toHaveBeenCalledWith(true);
        flush();
        expect(onExpandedChange).toHaveBeenCalledTimes(1);

        dispose();
      });
    });

    it("should call onExpandedChange when collapsing", () => {
      createRoot((dispose) => {
        const onExpandedChange = vi.fn();
        const state = createDisclosureState({
          defaultExpanded: true,
          onExpandedChange,
        });

        state.collapse();

        flush();
        expect(onExpandedChange).toHaveBeenCalledWith(false);
        flush();
        expect(onExpandedChange).toHaveBeenCalledTimes(1);

        dispose();
      });
    });

    it("should call onExpandedChange when toggling", () => {
      createRoot((dispose) => {
        const onExpandedChange = vi.fn();
        const state = createDisclosureState({ onExpandedChange });

        state.toggle();
        flush();
        expect(onExpandedChange).toHaveBeenCalledWith(true);

        state.toggle();
        flush();
        expect(onExpandedChange).toHaveBeenCalledWith(false);

        flush();
        expect(onExpandedChange).toHaveBeenCalledTimes(2);

        dispose();
      });
    });
  });

  describe("controlled mode", () => {
    it("should not update internal state in controlled mode", () => {
      createRoot((dispose) => {
        const onExpandedChange = vi.fn();
        const state = createDisclosureState({
          isExpanded: false,
          onExpandedChange,
        });

        state.expand();

        // Value should NOT change in controlled mode
        flush();
        expect(state.isExpanded()).toBe(false);
        // But onExpandedChange should be called
        flush();
        expect(onExpandedChange).toHaveBeenCalledWith(true);

        dispose();
      });
    });

    it("should be possible to control the value", () => {
      createRoot((dispose) => {
        const [isExpanded, setIsExpanded] = createSignal(false);
        const state = createDisclosureState({
          get isExpanded() {
            return isExpanded();
          },
        });

        flush();
        expect(state.isExpanded()).toBe(false);

        setIsExpanded(true);
        flush();
        expect(state.isExpanded()).toBe(true);

        setIsExpanded(false);
        flush();
        expect(state.isExpanded()).toBe(false);

        dispose();
      });
    });
  });
});

describe("createDisclosureGroupState", () => {
  describe("basic state management", () => {
    it("should have no expanded keys by default", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState();

        flush();
        expect(state.expandedKeys().size).toBe(0);

        dispose();
      });
    });

    it("should use defaultExpandedKeys for initial state", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState({
          defaultExpandedKeys: ["key1", "key2"],
        });

        flush();
        expect(state.expandedKeys().has("key1")).toBe(true);
        flush();
        expect(state.expandedKeys().has("key2")).toBe(true);
        flush();
        expect(state.expandedKeys().size).toBe(2);

        dispose();
      });
    });

    it("should use expandedKeys for controlled mode", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState({
          expandedKeys: new Set(["key1"]),
        });

        flush();
        expect(state.expandedKeys().has("key1")).toBe(true);
        flush();
        expect(state.expandedKeys().size).toBe(1);

        dispose();
      });
    });
  });

  describe("single selection mode (default)", () => {
    it("should toggle key on and off", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState();

        state.toggleKey("key1");
        flush();
        expect(state.isExpanded("key1")).toBe(true);

        state.toggleKey("key1");
        flush();
        expect(state.isExpanded("key1")).toBe(false);

        dispose();
      });
    });

    it("should collapse previous item when expanding new one", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState();

        state.toggleKey("key1");
        flush();
        expect(state.isExpanded("key1")).toBe(true);
        flush();
        expect(state.expandedKeys().size).toBe(1);

        state.toggleKey("key2");
        flush();
        expect(state.isExpanded("key1")).toBe(false);
        flush();
        expect(state.isExpanded("key2")).toBe(true);
        flush();
        expect(state.expandedKeys().size).toBe(1);

        dispose();
      });
    });

    it("should allow all items to be collapsed", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState();

        state.toggleKey("key1");
        flush();
        expect(state.expandedKeys().size).toBe(1);

        state.toggleKey("key1");
        flush();
        expect(state.expandedKeys().size).toBe(0);

        dispose();
      });
    });

    it("should trim over-expanded default keys to the first key", async () => {
      let dispose!: () => void;
      const onExpandedChange = vi.fn();
      const state = createRoot((d) => {
        dispose = d;
        return createDisclosureGroupState({
          defaultExpandedKeys: ["key1", "key2", "key3"],
          onExpandedChange,
        });
      });

      flush();
      expect([...state.expandedKeys()]).toEqual(["key1", "key2", "key3"]);

      await Promise.resolve();

      flush();
      expect([...state.expandedKeys()]).toEqual(["key1"]);
      flush();
      expect(onExpandedChange).toHaveBeenCalledWith(new Set(["key1"]));

      dispose();
    });

    it("should request controlled over-expanded keys be trimmed without mutating controlled state", async () => {
      let dispose!: () => void;
      const onExpandedChange = vi.fn();
      const state = createRoot((d) => {
        dispose = d;
        return createDisclosureGroupState({
          expandedKeys: ["key1", "key2"],
          onExpandedChange,
        });
      });

      flush();
      expect([...state.expandedKeys()]).toEqual(["key1", "key2"]);

      await Promise.resolve();

      flush();
      expect([...state.expandedKeys()]).toEqual(["key1", "key2"]);
      flush();
      expect(onExpandedChange).toHaveBeenCalledWith(new Set(["key1"]));

      dispose();
    });
  });

  describe("multiple selection mode", () => {
    it("should allow multiple items to be expanded", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState({
          allowsMultipleExpanded: true,
        });

        state.toggleKey("key1");
        state.toggleKey("key2");
        state.toggleKey("key3");

        flush();
        expect(state.isExpanded("key1")).toBe(true);
        flush();
        expect(state.isExpanded("key2")).toBe(true);
        flush();
        expect(state.isExpanded("key3")).toBe(true);
        flush();
        expect(state.expandedKeys().size).toBe(3);

        dispose();
      });
    });

    it("should toggle individual items independently", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState({
          allowsMultipleExpanded: true,
        });

        state.toggleKey("key1");
        state.toggleKey("key2");
        flush();
        expect(state.expandedKeys().size).toBe(2);

        state.toggleKey("key1");
        flush();
        expect(state.isExpanded("key1")).toBe(false);
        flush();
        expect(state.isExpanded("key2")).toBe(true);
        flush();
        expect(state.expandedKeys().size).toBe(1);

        dispose();
      });
    });
  });

  describe("isExpanded method", () => {
    it("should check if key is expanded", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState({
          defaultExpandedKeys: ["key1"],
        });

        flush();
        expect(state.isExpanded("key1")).toBe(true);
        flush();
        expect(state.isExpanded("key2")).toBe(false);
        flush();
        expect(state.isExpanded("key3")).toBe(false);

        dispose();
      });
    });
  });

  describe("setExpandedKeys", () => {
    it("should replace all expanded keys", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState({
          allowsMultipleExpanded: true,
          defaultExpandedKeys: ["key1", "key2"],
        });

        flush();
        expect(state.expandedKeys().size).toBe(2);

        state.setExpandedKeys(new Set(["key3", "key4"]));

        flush();
        expect(state.isExpanded("key1")).toBe(false);
        flush();
        expect(state.isExpanded("key2")).toBe(false);
        flush();
        expect(state.isExpanded("key3")).toBe(true);
        flush();
        expect(state.isExpanded("key4")).toBe(true);

        dispose();
      });
    });
  });

  describe("onExpandedChange callback", () => {
    it("should call onExpandedChange when keys change", () => {
      createRoot((dispose) => {
        const onExpandedChange = vi.fn();
        const state = createDisclosureGroupState({ onExpandedChange });

        state.toggleKey("key1");

        flush();
        expect(onExpandedChange).toHaveBeenCalledWith(new Set(["key1"]));

        dispose();
      });
    });

    it("should call onExpandedChange with empty set when all collapsed", () => {
      createRoot((dispose) => {
        const onExpandedChange = vi.fn();
        const state = createDisclosureGroupState({
          defaultExpandedKeys: ["key1"],
          onExpandedChange,
        });

        state.toggleKey("key1");

        flush();
        expect(onExpandedChange).toHaveBeenCalledWith(new Set());

        dispose();
      });
    });
  });

  describe("disabled state", () => {
    it("should expose isDisabled", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState({
          isDisabled: true,
        });

        flush();
        expect(state.isDisabled).toBe(true);

        dispose();
      });
    });

    it("should default isDisabled to false", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState();

        flush();
        expect(state.isDisabled).toBe(false);

        dispose();
      });
    });
  });

  describe("allowsMultipleExpanded accessor", () => {
    it("should expose allowsMultipleExpanded", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState({
          allowsMultipleExpanded: true,
        });

        flush();
        expect(state.allowsMultipleExpanded).toBe(true);

        dispose();
      });
    });

    it("should default allowsMultipleExpanded to false", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState();

        flush();
        expect(state.allowsMultipleExpanded).toBe(false);

        dispose();
      });
    });
  });

  describe("controlled mode", () => {
    it("should not update internal state in controlled mode", () => {
      createRoot((dispose) => {
        const onExpandedChange = vi.fn();
        const state = createDisclosureGroupState({
          expandedKeys: new Set(["key1"]),
          onExpandedChange,
        });

        state.toggleKey("key1");

        // Value should NOT change in controlled mode
        flush();
        expect(state.isExpanded("key1")).toBe(true);
        // But onExpandedChange should be called
        flush();
        expect(onExpandedChange).toHaveBeenCalled();

        dispose();
      });
    });

    it("should be possible to control the value", () => {
      createRoot((dispose) => {
        const [expandedKeys, setExpandedKeys] = createSignal<Set<string>>(new Set());
        const state = createDisclosureGroupState({
          get expandedKeys() {
            return expandedKeys();
          },
        });

        flush();
        expect(state.expandedKeys().size).toBe(0);

        setExpandedKeys(new Set(["key1"]));
        flush();
        expect(state.isExpanded("key1")).toBe(true);

        setExpandedKeys(new Set(["key2", "key3"]));
        flush();
        expect(state.isExpanded("key1")).toBe(false);
        flush();
        expect(state.isExpanded("key2")).toBe(true);
        flush();
        expect(state.isExpanded("key3")).toBe(true);

        dispose();
      });
    });
  });

  describe("numeric keys", () => {
    it("should support numeric keys", () => {
      createRoot((dispose) => {
        const state = createDisclosureGroupState({
          allowsMultipleExpanded: true,
        });

        state.toggleKey(1);
        state.toggleKey(2);

        flush();
        expect(state.isExpanded(1)).toBe(true);
        flush();
        expect(state.isExpanded(2)).toBe(true);
        flush();
        expect(state.isExpanded(3)).toBe(false);

        dispose();
      });
    });
  });
});
