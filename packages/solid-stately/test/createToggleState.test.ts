/**
 * Tests for createToggleState
 *
 * Ported from @react-stately/toggle's useToggleState.
 * Tests follow the same patterns as @react-stately tests.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import { createToggleState } from "../src/toggle/createToggleState";

describe("createToggleState", () => {
  describe("basic state management", () => {
    it("should return false by default", () => {
      createRoot((dispose) => {
        const state = createToggleState();

        expect(state.isSelected()).toBe(false);
        expect(state.defaultSelected).toBe(false);

        dispose();
      });
    });

    it("should use defaultSelected for initial uncontrolled value", () => {
      createRoot((dispose) => {
        const state = createToggleState({
          defaultSelected: true,
        });

        expect(state.isSelected()).toBe(true);
        expect(state.defaultSelected).toBe(true);

        dispose();
      });
    });

    it("should use isSelected for controlled mode", () => {
      createRoot((dispose) => {
        const state = createToggleState({
          isSelected: true,
        });

        expect(state.isSelected()).toBe(true);
        // defaultSelected reflects the initial value in controlled mode
        expect(state.defaultSelected).toBe(true);

        dispose();
      });
    });

    it("should handle controlled false state", () => {
      createRoot((dispose) => {
        const state = createToggleState({
          isSelected: false,
        });

        expect(state.isSelected()).toBe(false);
        expect(state.defaultSelected).toBe(false);

        dispose();
      });
    });
  });

  describe("selection methods", () => {
    it("should set selected state", () => {
      createRoot((dispose) => {
        const state = createToggleState();

        state.setSelected(true);
        expect(state.isSelected()).toBe(true);

        state.setSelected(false);
        expect(state.isSelected()).toBe(false);

        dispose();
      });
    });

    it("should toggle state", () => {
      createRoot((dispose) => {
        const state = createToggleState();

        state.toggle();
        expect(state.isSelected()).toBe(true);

        state.toggle();
        expect(state.isSelected()).toBe(false);

        state.setSelected(true);
        state.toggle();
        expect(state.isSelected()).toBe(false);

        state.toggle();
        expect(state.isSelected()).toBe(true);

        dispose();
      });
    });
  });

  describe("readonly behavior", () => {
    it("should ignore changes when readonly", () => {
      createRoot((dispose) => {
        const state = createToggleState({
          defaultSelected: false,
          isReadOnly: true,
        });

        expect(state.isSelected()).toBe(false);

        state.setSelected(true);
        expect(state.isSelected()).toBe(false);

        state.toggle();
        expect(state.isSelected()).toBe(false);

        dispose();
      });
    });
  });

  describe("controlled vs uncontrolled modes", () => {
    it("should call onChange in uncontrolled mode", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createToggleState({
          defaultSelected: false,
          onChange,
        });

        state.setSelected(true);
        expect(onChange).toHaveBeenCalledWith(true);
        expect(onChange).toHaveBeenCalledTimes(1);

        state.setSelected(false);
        expect(onChange).toHaveBeenCalledWith(false);
        expect(onChange).toHaveBeenCalledTimes(2);

        state.toggle();
        expect(onChange).toHaveBeenCalledWith(true);
        expect(onChange).toHaveBeenCalledTimes(3);

        dispose();
      });
    });

    it("should not change internal state in controlled mode", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createToggleState({
          isSelected: false,
          onChange,
        });

        expect(state.isSelected()).toBe(false);

        state.setSelected(true);
        // Value should NOT change in controlled mode
        expect(state.isSelected()).toBe(false);
        // But onChange should still be called
        expect(onChange).toHaveBeenCalledWith(true);

        state.toggle();
        expect(state.isSelected()).toBe(false);

        dispose();
      });
    });

    it("should be possible to control the value", () => {
      createRoot((dispose) => {
        const [isSelected, setIsSelected] = createSignal(false);
        const state = createToggleState({
          get isSelected() {
            return isSelected();
          },
        });

        expect(state.isSelected()).toBe(false);

        setIsSelected(true);
        expect(state.isSelected()).toBe(true);

        setIsSelected(false);
        expect(state.isSelected()).toBe(false);

        dispose();
      });
    });

    it("should be possible to have the value uncontrolled", () => {
      createRoot((dispose) => {
        const state = createToggleState({ defaultSelected: true });

        expect(state.isSelected()).toBe(true);

        state.setSelected(false);
        expect(state.isSelected()).toBe(false);

        dispose();
      });
    });
  });

  describe("defaultSelected preservation", () => {
    it("should preserve defaultSelected after state changes", () => {
      createRoot((dispose) => {
        const state = createToggleState({ defaultSelected: true });

        expect(state.defaultSelected).toBe(true);

        state.setSelected(false);
        expect(state.defaultSelected).toBe(true);

        dispose();
      });
    });

    it("should use false when no defaultSelected provided", () => {
      createRoot((dispose) => {
        const state = createToggleState({});

        expect(state.defaultSelected).toBe(false);

        dispose();
      });
    });
  });

  describe("reactivity with signal props", () => {
    it("should handle dynamic isSelected changes via getter", () => {
      createRoot((dispose) => {
        const [isSelected, setIsSelected] = createSignal(false);
        const state = createToggleState({
          get isSelected() {
            return isSelected();
          },
        });

        expect(state.isSelected()).toBe(false);

        setIsSelected(true);
        expect(state.isSelected()).toBe(true);

        setIsSelected(false);
        expect(state.isSelected()).toBe(false);

        dispose();
      });
    });

    it("should react to prop object changes", () => {
      createRoot((dispose) => {
        const [props, setProps] = createSignal<{ isSelected?: boolean; defaultSelected?: boolean }>(
          {},
        );
        const state = createToggleState(props);

        expect(state.isSelected()).toBe(false);

        setProps({ isSelected: true });
        expect(state.isSelected()).toBe(true);

        setProps({ isSelected: false });
        expect(state.isSelected()).toBe(false);

        dispose();
      });
    });
  });
});
