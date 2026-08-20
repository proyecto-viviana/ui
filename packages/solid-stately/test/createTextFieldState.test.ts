/**
 * Tests for createTextFieldState
 *
 * Ported from @react-stately/utils useControlledState pattern.
 * Note: @react-stately does NOT have a useTextFieldState - text field state
 * is handled at the aria layer, not stately. Our createTextFieldState is a
 * simple controlled/uncontrolled value wrapper.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import { createTextFieldState } from "../src/textfield/createTextFieldState";

describe("createTextFieldState", () => {
  describe("basic state management", () => {
    it("should return empty value by default", () => {
      createRoot((dispose) => {
        const state = createTextFieldState();

        expect(state.value()).toBe("");

        dispose();
      });
    });

    it("should use defaultValue for initial uncontrolled value", () => {
      createRoot((dispose) => {
        const state = createTextFieldState({
          defaultValue: "initial text",
        });

        expect(state.value()).toBe("initial text");

        dispose();
      });
    });

    it("should use value for controlled mode", () => {
      createRoot((dispose) => {
        const state = createTextFieldState({
          value: "controlled text",
        });

        expect(state.value()).toBe("controlled text");

        dispose();
      });
    });

    it("should handle empty string as controlled value", () => {
      createRoot((dispose) => {
        const state = createTextFieldState({
          value: "",
        });

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
        expect(state.value()).toBe("hello");

        state.setValue("world");
        expect(state.value()).toBe("world");

        state.setValue("");
        expect(state.value()).toBe("");

        dispose();
      });
    });

    it("should handle multiline text", () => {
      createRoot((dispose) => {
        const state = createTextFieldState();

        state.setValue("line1\nline2\nline3");
        expect(state.value()).toBe("line1\nline2\nline3");

        dispose();
      });
    });

    it("should handle special characters", () => {
      createRoot((dispose) => {
        const state = createTextFieldState();

        state.setValue("test@example.com");
        expect(state.value()).toBe("test@example.com");

        state.setValue("123!@#$%^&*()");
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
        expect(onChange).toHaveBeenCalledWith("changed");
        expect(onChange).toHaveBeenCalledTimes(1);
        expect(state.value()).toBe("changed");

        state.setValue("another change");
        expect(onChange).toHaveBeenCalledWith("another change");
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

        expect(state.value()).toBe("controlled");

        state.setValue("changed");
        // Value should NOT change in controlled mode
        expect(state.value()).toBe("controlled");
        // But onChange should still be called
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

        expect(state.value()).toBe("foo");

        setValue("bar");
        expect(state.value()).toBe("bar");

        setValue("");
        expect(state.value()).toBe("");

        dispose();
      });
    });

    it("should be possible to have the value uncontrolled", () => {
      createRoot((dispose) => {
        const state = createTextFieldState({ defaultValue: "foo" });

        expect(state.value()).toBe("foo");

        state.setValue("bar");
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

        expect(state.value()).toBe("initial");

        setValue("changed");
        expect(state.value()).toBe("changed");

        setValue("");
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

        expect(state.value()).toBe("initial");

        // Note: In uncontrolled mode, changing props doesn't change internal state
        // This is consistent with React behavior
        setProps({ value: "controlled" });
        expect(state.value()).toBe("controlled");

        dispose();
      });
    });
  });
});
