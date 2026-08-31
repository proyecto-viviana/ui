/**
 * Tests for createSearchFieldState
 *
 * Ported from @react-stately/searchfield useSearchFieldState.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import { createSearchFieldState } from "../src/searchfield/createSearchFieldState";

describe("createSearchFieldState", () => {
  describe("basic state management", () => {
    it("should return empty string by default", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({});

        expect(state.value()).toBe("");

        dispose();
      });
    });

    it("should use defaultValue for initial value", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({
          defaultValue: "search query",
        });

        expect(state.value()).toBe("search query");

        dispose();
      });
    });

    it("should use value for controlled mode", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({
          value: "controlled value",
        });

        expect(state.value()).toBe("controlled value");

        dispose();
      });
    });
  });

  describe("setValue", () => {
    it("should set value in uncontrolled mode", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({});

        state.setValue("new value");

        expect(state.value()).toBe("new value");

        dispose();
      });
    });

    it("should call onChange when value changes", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createSearchFieldState({ onChange });

        state.setValue("new value");

        expect(onChange).toHaveBeenCalledWith("new value");
        expect(onChange).toHaveBeenCalledTimes(1);

        dispose();
      });
    });

    it("should call onChange in controlled mode", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createSearchFieldState({
          value: "initial",
          onChange,
        });

        state.setValue("new value");

        expect(onChange).toHaveBeenCalledWith("new value");

        dispose();
      });
    });

    it("should not update internal state in controlled mode", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createSearchFieldState({
          value: "controlled",
          onChange,
        });

        state.setValue("new value");

        // Value should NOT change in controlled mode
        expect(state.value()).toBe("controlled");
        // But onChange should be called
        expect(onChange).toHaveBeenCalledWith("new value");

        dispose();
      });
    });
  });

  describe("controlled vs uncontrolled modes", () => {
    it("should be possible to control the value", () => {
      createRoot((dispose) => {
        const [value, setValue] = createSignal("initial");
        const state = createSearchFieldState({
          get value() {
            return value();
          },
        });

        expect(state.value()).toBe("initial");

        setValue("updated");
        expect(state.value()).toBe("updated");

        setValue("");
        expect(state.value()).toBe("");

        dispose();
      });
    });

    it("should update in uncontrolled mode", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({
          defaultValue: "initial",
        });

        expect(state.value()).toBe("initial");

        state.setValue("updated");
        expect(state.value()).toBe("updated");

        state.setValue("");
        expect(state.value()).toBe("");

        dispose();
      });
    });
  });

  describe("clearing value", () => {
    it("should clear value to empty string", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createSearchFieldState({
          defaultValue: "search query",
          onChange,
        });

        expect(state.value()).toBe("search query");

        state.setValue("");

        expect(state.value()).toBe("");
        expect(onChange).toHaveBeenCalledWith("");

        dispose();
      });
    });
  });

  describe("multiple updates", () => {
    it("should handle multiple value updates", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createSearchFieldState({ onChange });

        state.setValue("first");
        expect(state.value()).toBe("first");
        expect(onChange).toHaveBeenCalledWith("first");

        state.setValue("second");
        expect(state.value()).toBe("second");
        expect(onChange).toHaveBeenCalledWith("second");

        state.setValue("third");
        expect(state.value()).toBe("third");
        expect(onChange).toHaveBeenCalledWith("third");

        expect(onChange).toHaveBeenCalledTimes(3);

        dispose();
      });
    });
  });

  describe("special characters", () => {
    it("should handle special characters in value", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({});

        state.setValue("hello & world");
        expect(state.value()).toBe("hello & world");

        state.setValue('<script>alert("xss")</script>');
        expect(state.value()).toBe('<script>alert("xss")</script>');

        state.setValue("emoji: ");
        expect(state.value()).toBe("emoji: ");

        dispose();
      });
    });

    it("should handle whitespace", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({});

        state.setValue("   leading whitespace");
        expect(state.value()).toBe("   leading whitespace");

        state.setValue("trailing whitespace   ");
        expect(state.value()).toBe("trailing whitespace   ");

        state.setValue("   ");
        expect(state.value()).toBe("   ");

        dispose();
      });
    });
  });

  describe("unicode support", () => {
    it("should handle unicode characters", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({});

        // Japanese
        state.setValue("こんにちは");
        expect(state.value()).toBe("こんにちは");

        // Chinese
        state.setValue("你好世界");
        expect(state.value()).toBe("你好世界");

        // Arabic
        state.setValue("مرحبا بالعالم");
        expect(state.value()).toBe("مرحبا بالعالم");

        // Hebrew
        state.setValue("שלום עולם");
        expect(state.value()).toBe("שלום עולם");

        dispose();
      });
    });
  });

  describe("empty default value", () => {
    it("should handle empty string as default value", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({
          defaultValue: "",
        });

        expect(state.value()).toBe("");

        dispose();
      });
    });
  });

  describe("reactive props", () => {
    it("should react to prop object changes", () => {
      createRoot((dispose) => {
        const [props, setProps] = createSignal<{ value?: string; defaultValue?: string }>({});
        const state = createSearchFieldState(props);

        expect(state.value()).toBe("");

        setProps({ value: "controlled" });
        expect(state.value()).toBe("controlled");

        setProps({ value: "updated" });
        expect(state.value()).toBe("updated");

        dispose();
      });
    });
  });
});
