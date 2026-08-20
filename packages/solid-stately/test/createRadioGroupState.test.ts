/**
 * Tests for createRadioGroupState
 *
 * Ported from @react-stately/radio's useRadioGroupState.
 * Note: @react-stately doesn't have tests for useRadioGroupState,
 * so these tests follow the same patterns as useCheckboxGroupState tests.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import { createRadioGroupState, type RadioGroupProps } from "../src/radio/createRadioGroupState";

describe("createRadioGroupState", () => {
  describe("basic interface", () => {
    it("should return basic interface when no props are provided", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState();

        expect(state.selectedValue()).toBe(null);
        expect(state.isDisabled).toBe(false);
        expect(state.isReadOnly).toBe(false);
        expect(state.isRequired).toBe(false);
        expect(typeof state.setSelectedValue).toBe("function");
        expect(typeof state.setLastFocusedValue).toBe("function");
        expect(state.name).toBeTruthy();

        dispose();
      });
    });

    it("should return the same isDisabled that has been provided", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isDisabled: true });

        expect(state.isDisabled).toBe(true);

        dispose();
      });
    });

    it("should return the same isReadOnly that has been provided", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isReadOnly: true });

        expect(state.isReadOnly).toBe(true);

        dispose();
      });
    });

    it("should return the same isRequired that has been provided", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isRequired: true });

        expect(state.isRequired).toBe(true);

        dispose();
      });
    });
  });

  describe("initial value", () => {
    it("should be possible to provide the initial value (controlled)", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ value: "option1" });

        expect(state.selectedValue()).toBe("option1");

        dispose();
      });
    });

    it("should be possible to provide a default value (uncontrolled)", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ defaultValue: "option1" });

        expect(state.selectedValue()).toBe("option1");
        expect(state.defaultSelectedValue).toBe("option1");

        dispose();
      });
    });

    it("should handle null controlled value", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ value: null });

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
        expect(state.selectedValue()).toBe("option-a");

        state.setSelectedValue("option-b");
        expect(state.selectedValue()).toBe("option-b");

        state.setSelectedValue(null);
        expect(state.selectedValue()).toBe(null);

        dispose();
      });
    });
  });

  describe("lastFocusedValue", () => {
    it("should track last focused value", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState();

        expect(state.lastFocusedValue()).toBe(null);

        state.setLastFocusedValue("focused-option");
        expect(state.lastFocusedValue()).toBe("focused-option");

        state.setLastFocusedValue(null);
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

        expect(state.selectedValue()).toBe("foo");

        setValue("bar");
        expect(state.selectedValue()).toBe("bar");

        setValue(null);
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

        expect(state.selectedValue()).toBe("controlled-value");

        state.setSelectedValue("new-value");
        // Value should NOT change in controlled mode
        expect(state.selectedValue()).toBe("controlled-value");
        // But onChange should still be called
        expect(onChange).toHaveBeenCalledWith("new-value");

        dispose();
      });
    });
  });

  describe("uncontrolled mode", () => {
    it("should be possible to have the value uncontrolled", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ defaultValue: "initial" });

        expect(state.selectedValue()).toBe("initial");

        state.setSelectedValue("changed");
        expect(state.selectedValue()).toBe("changed");

        dispose();
      });
    });

    it("should call the provided onChange callback whenever value changes", () => {
      createRoot((dispose) => {
        const onChangeSpy = vi.fn();
        const state = createRadioGroupState({ defaultValue: "initial", onChange: onChangeSpy });

        state.setSelectedValue("new-value");
        expect(onChangeSpy).toHaveBeenCalledWith("new-value");
        expect(onChangeSpy).toHaveBeenCalledTimes(1);

        state.setSelectedValue("another-value");
        expect(onChangeSpy).toHaveBeenCalledWith("another-value");
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
        expect(onChange).not.toHaveBeenCalled();

        dispose();
      });
    });
  });

  describe("readonly group", () => {
    it("should not update state for readonly group", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isReadOnly: true, defaultValue: "initial" });

        expect(state.selectedValue()).toBe("initial");

        state.setSelectedValue("new-value");
        expect(state.selectedValue()).toBe("initial");

        dispose();
      });
    });
  });

  describe("disabled group", () => {
    it("should not update state for disabled group", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isDisabled: true, defaultValue: "initial" });

        expect(state.selectedValue()).toBe("initial");

        state.setSelectedValue("new-value");
        expect(state.selectedValue()).toBe("initial");

        dispose();
      });
    });
  });

  describe("validation state", () => {
    it("should manage invalid state when isInvalid is true", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isInvalid: true });

        expect(state.isInvalid).toBe(true);

        dispose();
      });
    });

    it("should manage valid state when isInvalid is false", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isInvalid: false });

        expect(state.isInvalid).toBe(false);

        dispose();
      });
    });

    it("should default to valid when isInvalid is not provided", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({});

        expect(state.isInvalid).toBe(false);
        expect(state.displayValidation().isInvalid).toBe(false);
        expect(state.displayValidation().validationDetails.valid).toBe(true);
        expect(state.displayValidation().validationErrors).toEqual([]);

        dispose();
      });
    });

    it("should expose invalid displayValidation details when invalid", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ isInvalid: true });

        expect(state.displayValidation().isInvalid).toBe(true);
        expect(state.displayValidation().validationDetails.customError).toBe(true);
        expect(state.displayValidation().validationDetails.valid).toBe(false);
        expect(state.displayValidation().validationErrors).toEqual([]);

        dispose();
      });
    });
  });

  describe("name generation", () => {
    it("should use provided name", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({ name: "my-radio-group" });

        expect(state.name).toBe("my-radio-group");

        dispose();
      });
    });

    it("should generate unique names when not provided", () => {
      createRoot((dispose) => {
        const state1 = createRadioGroupState();
        const state2 = createRadioGroupState();

        expect(state1.name).toBeTruthy();
        expect(state2.name).toBeTruthy();
        expect(state1.name).not.toBe(state2.name);

        dispose();
      });
    });
  });

  describe("defaultSelectedValue initialization", () => {
    it("should use null when no default provided", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({});

        expect(state.defaultSelectedValue).toBe(null);

        dispose();
      });
    });

    it("should preserve defaultSelectedValue after state changes", () => {
      createRoot((dispose) => {
        const state = createRadioGroupState({
          defaultValue: "initial",
        });

        expect(state.defaultSelectedValue).toBe("initial");

        state.setSelectedValue("changed");
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

        expect(state.selectedValue()).toBe(null);

        setProps({ value: "selected" });
        expect(state.selectedValue()).toBe("selected");

        setProps({ isDisabled: true });
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

        expect(state.selectedValue()).toBe("initial");

        setValue("new-value");
        expect(state.selectedValue()).toBe("new-value");

        setValue(null);
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
        expect(state.displayValidation().isInvalid).toBe(false);
      });

      // Selecting commits validation in radio state.
      state.setSelectedValue("dogs");
      await Promise.resolve();

      expect(state.displayValidation().isInvalid).toBe(true);
      expect(state.displayValidation().validationErrors).toEqual(["Selection is invalid"]);

      dispose();
    });
  });
});
