/**
 * Tests for createRadioGroupState
 *
 * Ported from @react-stately/radio's useRadioGroupState.
 * Note: @react-stately doesn't have tests for useRadioGroupState,
 * so these tests follow the same patterns as useCheckboxGroupState tests.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createSignal } from "./owned-signal";
import { flush, createRoot } from "solid-js";
import { createRadioGroupState, type RadioGroupProps } from "../src/radio/createRadioGroupState";

describe("createRadioGroupState", () => {
  describe("basic interface", () => {
    it("should return basic interface when no props are provided", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState();

        flush();
        expect(state.selectedValue()).toBe(null);
        flush();
        expect(state.isDisabled).toBe(false);
        flush();
        expect(state.isReadOnly).toBe(false);
        flush();
        expect(state.isRequired).toBe(false);
        flush();
        expect(typeof state.setSelectedValue).toBe("function");
        flush();
        expect(typeof state.setLastFocusedValue).toBe("function");
        flush();
        expect(state.name).toBeTruthy();

        dispose();
      });
    });

    it("should return the same isDisabled that has been provided", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isDisabled: true });

        flush();
        expect(state.isDisabled).toBe(true);

        dispose();
      });
    });

    it("should return the same isReadOnly that has been provided", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isReadOnly: true });

        flush();
        expect(state.isReadOnly).toBe(true);

        dispose();
      });
    });

    it("should return the same isRequired that has been provided", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isRequired: true });

        flush();
        expect(state.isRequired).toBe(true);

        dispose();
      });
    });
  });

  describe("initial value", () => {
    it("should be possible to provide the initial value (controlled)", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ value: "option1" });

        flush();
        expect(state.selectedValue()).toBe("option1");

        dispose();
      });
    });

    it("should be possible to provide a default value (uncontrolled)", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ defaultValue: "option1" });

        flush();
        expect(state.selectedValue()).toBe("option1");
        flush();
        expect(state.defaultSelectedValue).toBe("option1");

        dispose();
      });
    });

    it("should handle null controlled value", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ value: null });

        flush();
        expect(state.selectedValue()).toBe(null);

        dispose();
      });
    });
  });

  describe("setSelectedValue", () => {
    it("should set selected value in uncontrolled mode", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState();

        state.setSelectedValue("option-a");
        flush();
        expect(state.selectedValue()).toBe("option-a");

        state.setSelectedValue("option-b");
        flush();
        expect(state.selectedValue()).toBe("option-b");

        state.setSelectedValue(null);
        flush();
        expect(state.selectedValue()).toBe(null);

        dispose();
      });
    });
  });

  describe("lastFocusedValue", () => {
    it("should track last focused value", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState();

        flush();
        expect(state.lastFocusedValue()).toBe(null);

        state.setLastFocusedValue("focused-option");
        flush();
        expect(state.lastFocusedValue()).toBe("focused-option");

        state.setLastFocusedValue(null);
        flush();
        expect(state.lastFocusedValue()).toBe(null);

        dispose();
      });
    });
  });

  describe("controlled mode", () => {
    it("should be possible to control the value", () => {
      createRoot((dispose) => {
        const [value, setValue] = createSignal<string | null>("foo");
        const state = createRadioGroupState({
          get value() {
            return value();
          },
        });

        flush();
        expect(state.selectedValue()).toBe("foo");

        setValue("bar");
        flush();
        expect(state.selectedValue()).toBe("bar");

        setValue(null);
        flush();
        expect(state.selectedValue()).toBe(null);

        dispose();
      });
    });

    it("should not change internal state in controlled mode", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createRadioGroupState({
          value: "controlled-value",
          onChange,
        });

        flush();
        expect(state.selectedValue()).toBe("controlled-value");

        state.setSelectedValue("new-value");
        // Value should NOT change in controlled mode
        flush();
        expect(state.selectedValue()).toBe("controlled-value");
        // But onChange should still be called
        flush();
        expect(onChange).toHaveBeenCalledWith("new-value");

        dispose();
      });
    });
  });

  describe("uncontrolled mode", () => {
    it("should be possible to have the value uncontrolled", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ defaultValue: "initial" });

        flush();
        expect(state.selectedValue()).toBe("initial");

        state.setSelectedValue("changed");
        flush();
        expect(state.selectedValue()).toBe("changed");

        dispose();
      });
    });

    it("should call the provided onChange callback whenever value changes", () => {
      createRoot((dispose) => {
        const onChangeSpy = vi.fn();
        const state = createRadioGroupState({ defaultValue: "initial", onChange: onChangeSpy });

        state.setSelectedValue("new-value");
        flush();
        expect(onChangeSpy).toHaveBeenCalledWith("new-value");
        flush();
        expect(onChangeSpy).toHaveBeenCalledTimes(1);

        state.setSelectedValue("another-value");
        flush();
        expect(onChangeSpy).toHaveBeenCalledWith("another-value");
        flush();
        expect(onChangeSpy).toHaveBeenCalledTimes(2);

        dispose();
      });
    });

    it("should not call onChange when setting to null", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createRadioGroupState({
          defaultValue: "value",
          onChange,
        });

        state.setSelectedValue(null);
        // onChange is NOT called for null values per the implementation
        flush();
        expect(onChange).not.toHaveBeenCalled();

        dispose();
      });
    });
  });

  describe("readonly group", () => {
    it("should not update state for readonly group", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isReadOnly: true, defaultValue: "initial" });

        flush();
        expect(state.selectedValue()).toBe("initial");

        state.setSelectedValue("new-value");
        flush();
        expect(state.selectedValue()).toBe("initial");

        dispose();
      });
    });
  });

  describe("disabled group", () => {
    it("should not update state for disabled group", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isDisabled: true, defaultValue: "initial" });

        flush();
        expect(state.selectedValue()).toBe("initial");

        state.setSelectedValue("new-value");
        flush();
        expect(state.selectedValue()).toBe("initial");

        dispose();
      });
    });
  });

  describe("validation state", () => {
    it("should manage invalid state when isInvalid is true", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isInvalid: true });

        flush();
        expect(state.isInvalid).toBe(true);

        dispose();
      });
    });

    it("should manage valid state when isInvalid is false", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isInvalid: false });

        flush();
        expect(state.isInvalid).toBe(false);

        dispose();
      });
    });

    it("should default to valid when isInvalid is not provided", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({});

        flush();
        expect(state.isInvalid).toBe(false);
        flush();
        expect(state.displayValidation().isInvalid).toBe(false);
        flush();
        expect(state.displayValidation().validationDetails.valid).toBe(true);
        flush();
        expect(state.displayValidation().validationErrors).toEqual([]);

        dispose();
      });
    });

    it("should expose invalid displayValidation details when invalid", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isInvalid: true });

        flush();
        expect(state.displayValidation().isInvalid).toBe(true);
        flush();
        expect(state.displayValidation().validationDetails.customError).toBe(true);
        flush();
        expect(state.displayValidation().validationDetails.valid).toBe(false);
        flush();
        expect(state.displayValidation().validationErrors).toEqual([]);

        dispose();
      });
    });
  });

  describe("name generation", () => {
    it("should use provided name", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ name: "my-radio-group" });

        flush();
        expect(state.name).toBe("my-radio-group");

        dispose();
      });
    });

    it("should generate unique names when not provided", () => {
      createRoot((dispose) => {
        const state1 = createRadioGroupState();
        const state2 = createRadioGroupState();

        flush();
        expect(state1.name).toBeTruthy();
        flush();
        expect(state2.name).toBeTruthy();
        flush();
        expect(state1.name).not.toBe(state2.name);

        dispose();
      });
    });
  });

  describe("defaultSelectedValue initialization", () => {
    it("should use null when no default provided", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({});

        flush();
        expect(state.defaultSelectedValue).toBe(null);

        dispose();
      });
    });

    it("should preserve defaultSelectedValue after state changes", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({
          defaultValue: "initial",
        });

        flush();
        expect(state.defaultSelectedValue).toBe("initial");

        state.setSelectedValue("changed");
        flush();
        expect(state.defaultSelectedValue).toBe("initial");

        dispose();
      });
    });
  });

  describe("reactivity with signal props", () => {
    it("should react to prop changes", () => {
      createRoot((dispose) => {
        const [props, setProps] = createSignal<RadioGroupProps>({});
        const state = createRadioGroupState(props);

        flush();
        expect(state.selectedValue()).toBe(null);

        setProps({ value: "selected" });
        flush();
        expect(state.selectedValue()).toBe("selected");

        setProps({ isDisabled: true });
        flush();
        expect(state.isDisabled).toBe(true);

        dispose();
      });
    });

    it("should handle dynamic value changes via getter", () => {
      createRoot((dispose) => {
        const [value, setValue] = createSignal<string | null>("initial");
        const state = createRadioGroupState({
          get value() {
            return value();
          },
        });

        flush();
        expect(state.selectedValue()).toBe("initial");

        setValue("new-value");
        flush();
        expect(state.selectedValue()).toBe("new-value");

        setValue(null);
        flush();
        expect(state.selectedValue()).toBe(null);

        dispose();
      });
    });
  });

  describe("form validation lifecycle", () => {
    it("commits native validation when selection changes", async () => {
      let dispose!: () => void;
      let state!: ReturnType<typeof createRadioGroupState>;

      createRoot((rootDispose) => {
        dispose = rootDispose;
        state = createRadioGroupState({
          validationBehavior: "native",
          validate: () => "Selection is invalid",
        });

        // Native behavior does not show validation until commit.
        flush();
        expect(state.displayValidation().isInvalid).toBe(false);
      });

      // Selecting commits validation in radio state.
      state.setSelectedValue("dogs");
      await Promise.resolve();

      flush();
      expect(state.displayValidation().isInvalid).toBe(true);
      flush();
      expect(state.displayValidation().validationErrors).toEqual(["Selection is invalid"]);

      dispose();
    });
  });
});
