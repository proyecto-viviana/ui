/**
 * Tests for createSearchFieldState
 *
 * Ported from @react-stately/searchfield useSearchFieldState.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createSignal } from "./owned-signal";

import { flush, createRoot } from "solid-js";
import { createSearchFieldState } from "../src/searchfield/createSearchFieldState";

describe("createSearchFieldState", () => {
  describe("basic state management", () => {
    it("should return empty string by default", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({});

        flush();
        expect(state.value()).toBe("");

        dispose();
      });
    });

    it("should use defaultValue for initial value", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({
          defaultValue: "search query",
        });

        flush();
        expect(state.value()).toBe("search query");

        dispose();
      });
    });

    it("should use value for controlled mode", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({
          value: "controlled value",
        });

        flush();
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

        flush();
        expect(state.value()).toBe("new value");

        dispose();
      });
    });

    it("should call onChange when value changes", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createSearchFieldState({ onChange });

        state.setValue("new value");

        flush();
        expect(onChange).toHaveBeenCalledWith("new value");
        flush();
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

        flush();
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
        flush();
        expect(state.value()).toBe("controlled");
        // But onChange should be called
        flush();
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

        flush();
        expect(state.value()).toBe("initial");

        setValue("updated");
        flush();
        expect(state.value()).toBe("updated");

        setValue("");
        flush();
        expect(state.value()).toBe("");

        dispose();
      });
    });

    it("should update in uncontrolled mode", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({
          defaultValue: "initial",
        });

        flush();
        expect(state.value()).toBe("initial");

        state.setValue("updated");
        flush();
        expect(state.value()).toBe("updated");

        state.setValue("");
        flush();
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

        flush();
        expect(state.value()).toBe("search query");

        state.setValue("");

        flush();
        expect(state.value()).toBe("");
        flush();
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
        flush();
        expect(state.value()).toBe("first");
        flush();
        expect(onChange).toHaveBeenCalledWith("first");

        state.setValue("second");
        flush();
        expect(state.value()).toBe("second");
        flush();
        expect(onChange).toHaveBeenCalledWith("second");

        state.setValue("third");
        flush();
        expect(state.value()).toBe("third");
        flush();
        expect(onChange).toHaveBeenCalledWith("third");

        flush();
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
        flush();
        expect(state.value()).toBe("hello & world");

        state.setValue('<script>alert("xss")</script>');
        flush();
        expect(state.value()).toBe('<script>alert("xss")</script>');

        state.setValue("emoji: ");
        flush();
        expect(state.value()).toBe("emoji: ");

        dispose();
      });
    });

    it("should handle whitespace", () => {
      createRoot((dispose) => {
        const state = createSearchFieldState({});

        state.setValue("   leading whitespace");
        flush();
        expect(state.value()).toBe("   leading whitespace");

        state.setValue("trailing whitespace   ");
        flush();
        expect(state.value()).toBe("trailing whitespace   ");

        state.setValue("   ");
        flush();
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
        flush();
        expect(state.value()).toBe("こんにちは");

        // Chinese
        state.setValue("你好世界");
        flush();
        expect(state.value()).toBe("你好世界");

        // Arabic
        state.setValue("مرحبا بالعالم");
        flush();
        expect(state.value()).toBe("مرحبا بالعالم");

        // Hebrew
        state.setValue("שלום עולם");
        flush();
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

        flush();
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

        flush();
        expect(state.value()).toBe("");

        setProps({ value: "controlled" });
        flush();
        expect(state.value()).toBe("controlled");

        setProps({ value: "updated" });
        flush();
        expect(state.value()).toBe("updated");

        dispose();
      });
    });
  });
});
