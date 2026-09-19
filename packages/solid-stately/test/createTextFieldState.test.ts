/**
 * Tests for createTextFieldState
 *
 * Ported from @react-stately/utils useControlledState pattern.
 * Note: @react-stately does NOT have a useTextFieldState - text field state
 * is handled at the aria layer, not stately. Our createTextFieldState is a
 * simple controlled/uncontrolled value wrapper.
 */
import { describe, it, expect, vi } from "vite-plus/test"; import { createSignal } from "./owned-signal"; import { flush, createRoot } from "solid-js";
import { createTextFieldState } from "../src/textfield/createTextFieldState";

describe("createTextFieldState", () => {
  describe("basic state management", () => {
    it("should return empty value by default", () => {
      createRoot((dispose) => {
        const state = createTextFieldState();

        flush();
        expect(state.value()).toBe("");

        dispose();
      });
    });

    it("should use defaultValue for initial uncontrolled value", () => {
      createRoot((dispose) => {
        const state = createTextFieldState({
          defaultValue: "initial text",
        });

        flush();
        expect(state.value()).toBe("initial text");

        dispose();
      });
    });

    it("should use value for controlled mode", () => {
      createRoot((dispose) => {
        const state = createTextFieldState({
          value: "controlled text",
        });

        flush();
        expect(state.value()).toBe("controlled text");

        dispose();
      });
    });

    it("should handle empty string as controlled value", () => {
      createRoot((dispose) => {
        const state = createTextFieldState({
          value: "",
        });

        flush();
        expect(state.value()).toBe("");

        dispose();
      });
    });
  });

  describe("setValue", () => {
    it("should update value in uncontrolled mode", () => {
      createRoot((dispose) => {
        const state = createTextFieldState();

        state.setValue("hello");
        flush();
        expect(state.value()).toBe("hello");

        state.setValue("world");
        flush();
        expect(state.value()).toBe("world");

        state.setValue("");
        flush();
        expect(state.value()).toBe("");

        dispose();
      });
    });

    it("should handle multiline text", () => {
      createRoot((dispose) => {
        const state = createTextFieldState();

        state.setValue("line1\nline2\nline3");
        flush();
        expect(state.value()).toBe("line1\nline2\nline3");

        dispose();
      });
    });

    it("should handle special characters", () => {
      createRoot((dispose) => {
        const state = createTextFieldState();

        state.setValue("test@example.com");
        flush();
        expect(state.value()).toBe("test@example.com");

        state.setValue("123!@#$%^&*()");
        flush();
        expect(state.value()).toBe("123!@#$%^&*()");

        dispose();
      });
    });
  });

  describe("controlled vs uncontrolled modes", () => {
    it("should call onChange in uncontrolled mode", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createTextFieldState({
          defaultValue: "initial",
          onChange,
        });

        state.setValue("changed");
        flush();
        expect(onChange).toHaveBeenCalledWith("changed");
        flush();
        expect(onChange).toHaveBeenCalledTimes(1);
        flush();
        expect(state.value()).toBe("changed");

        state.setValue("another change");
        flush();
        expect(onChange).toHaveBeenCalledWith("another change");
        flush();
        expect(onChange).toHaveBeenCalledTimes(2);

        dispose();
      });
    });

    it("should not change internal state in controlled mode", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createTextFieldState({
          value: "controlled",
          onChange,
        });

        flush();
        expect(state.value()).toBe("controlled");

        state.setValue("changed");
        // Value should NOT change in controlled mode
        flush();
        expect(state.value()).toBe("controlled");
        // But onChange should still be called
        flush();
        expect(onChange).toHaveBeenCalledWith("changed");

        dispose();
      });
    });

    it("should be possible to control the value", () => {
      createRoot((dispose) => {
        const [value, setValue] = createSignal("foo");
        const state = createTextFieldState({
          get value() {
            return value();
          },
        });

        flush();
        expect(state.value()).toBe("foo");

        setValue("bar");
        flush();
        expect(state.value()).toBe("bar");

        setValue("");
        flush();
        expect(state.value()).toBe("");

        dispose();
      });
    });

    it("should be possible to have the value uncontrolled", () => {
      createRoot((dispose) => {
        const state = createTextFieldState({ defaultValue: "foo" });

        flush();
        expect(state.value()).toBe("foo");

        state.setValue("bar");
        flush();
        expect(state.value()).toBe("bar");

        dispose();
      });
    });
  });

  describe("reactivity with signal props", () => {
    it("should handle dynamic value changes via getter", () => {
      createRoot((dispose) => {
        const [value, setValue] = createSignal<string>("initial");
        const state = createTextFieldState({
          get value() {
            return value();
          },
        });

        flush();
        expect(state.value()).toBe("initial");

        setValue("changed");
        flush();
        expect(state.value()).toBe("changed");

        setValue("");
        flush();
        expect(state.value()).toBe("");

        dispose();
      });
    });

    it("should react to prop object changes", () => {
      createRoot((dispose) => {
        const [props, setProps] = createSignal<{ value?: string; defaultValue?: string }>({
          defaultValue: "initial",
        });
        const state = createTextFieldState(props);

        flush();
        expect(state.value()).toBe("initial");

        // Note: In uncontrolled mode, changing props doesn't change internal state
        // This is consistent with React behavior
        setProps({ value: "controlled" });
        flush();
        expect(state.value()).toBe("controlled");

        dispose();
      });
    });
  });
});
