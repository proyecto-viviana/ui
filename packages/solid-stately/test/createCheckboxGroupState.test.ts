/**
 * Tests for createCheckboxGroupState
 *
 * Ported from @react-stately/checkbox's useCheckboxGroupState.
 * Tests follow the same patterns as @react-stately tests.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import {
  createCheckboxGroupState,
  type CheckboxGroupProps,
} from "../src/checkbox/createCheckboxGroupState";

describe("createCheckboxGroupState", () => {
  describe("basic interface", () => {
    it("should return basic interface when no props are provided", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState();

        expect(state.value()).toEqual([]);
        expect(state.isDisabled).toBe(false);
        expect(state.isReadOnly).toBe(false);
        expect(typeof state.setValue).toBe("function");
        expect(typeof state.addValue).toBe("function");
        expect(typeof state.removeValue).toBe("function");
        expect(typeof state.toggleValue).toBe("function");
        expect(typeof state.isSelected).toBe("function");

        dispose();
      });
    });

    it("should return the same isDisabled that has been provided", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ isDisabled: true });

        expect(state.isDisabled).toBe(true);

        dispose();
      });
    });

    it("should return the same isReadOnly that has been provided", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ isReadOnly: true });

        expect(state.isReadOnly).toBe(true);

        dispose();
      });
    });
  });

  describe("initial value", () => {
    it("should be possible to provide the initial value (controlled)", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ value: ["foo", "bar"] });

        expect(state.value()).toEqual(["foo", "bar"]);

        dispose();
      });
    });

    it("should be possible to provide a default value (uncontrolled)", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ defaultValue: ["foo", "bar"] });

        expect(state.value()).toEqual(["foo", "bar"]);

        dispose();
      });
    });
  });

  describe("isSelected", () => {
    it("should support isSelected to determine if a value is selected", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ value: ["foo", "bar"] });

        expect(state.isSelected("foo")).toBe(true);
        expect(state.isSelected("baz")).toBe(false);

        dispose();
      });
    });
  });

  describe("controlled mode", () => {
    it("should be possible to control the value", () => {
      createRoot((dispose) => {
        const [value, setValue] = createSignal(["foo"]);
        const state = createCheckboxGroupState({
          get value() {
            return value();
          },
        });

        expect(state.value()).toEqual(["foo"]);

        setValue(["foo", "bar"]);
        expect(state.value()).toEqual(["foo", "bar"]);

        dispose();
      });
    });
  });

  describe("uncontrolled mode", () => {
    it("should be possible to have the value uncontrolled", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ defaultValue: ["foo"] });

        expect(state.value()).toEqual(["foo"]);

        state.setValue(["foo", "bar"]);
        expect(state.value()).toEqual(["foo", "bar"]);

        dispose();
      });
    });

    it("should call the provided onChange callback whenever value changes", () => {
      createRoot((dispose) => {
        const onChangeSpy = vi.fn();
        const state = createCheckboxGroupState({ defaultValue: ["foo"], onChange: onChangeSpy });

        state.setValue(["foo", "bar"]);
        expect(onChangeSpy).toHaveBeenCalledWith(["foo", "bar"]);

        dispose();
      });
    });
  });

  describe("addValue", () => {
    it("should be possible to add a value using addValue", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ defaultValue: ["foo"] });

        state.addValue("baz");
        expect(state.value()).toEqual(["foo", "baz"]);

        dispose();
      });
    });

    it("should not add the same value multiple times when using addValue", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ defaultValue: ["foo"] });

        state.addValue("baz");
        state.addValue("baz");
        state.addValue("baz");
        state.addValue("baz");
        expect(state.value()).toEqual(["foo", "baz"]);

        dispose();
      });
    });
  });

  describe("removeValue", () => {
    it("should be possible to remove a value using removeValue", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ defaultValue: ["foo", "qwe"] });

        state.removeValue("foo");
        expect(state.value()).toEqual(["qwe"]);

        dispose();
      });
    });
  });

  describe("toggleValue", () => {
    it("should be possible to add & remove value based on it being or not in the stored value using toggleValue", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ defaultValue: ["foo", "qwe"] });

        state.toggleValue("foo");
        expect(state.value()).toEqual(["qwe"]);

        state.toggleValue("foo");
        expect(state.value()).toEqual(["qwe", "foo"]);

        dispose();
      });
    });

    it("should go back to the initial value after toggleValue being called twice with the same value synchronously", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ defaultValue: ["foo", "qwe"] });

        state.toggleValue("qwe");
        state.toggleValue("qwe");
        // Note: In SolidJS, synchronous state updates batch differently than React
        // After first toggle: ['foo'], after second toggle: ['foo', 'qwe']
        expect(state.value()).toEqual(["foo", "qwe"]);

        dispose();
      });
    });
  });

  describe("readonly group", () => {
    it("should not update state for readonly group", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ isReadOnly: true, defaultValue: ["test"] });

        expect(state.value()).toEqual(["test"]);

        state.addValue("foo");
        expect(state.value()).toEqual(["test"]);

        state.removeValue("test");
        expect(state.value()).toEqual(["test"]);

        state.toggleValue("foo");
        expect(state.value()).toEqual(["test"]);

        state.setValue(["foo"]);
        expect(state.value()).toEqual(["test"]);

        dispose();
      });
    });
  });

  describe("disabled group", () => {
    it("should not update state for disabled group", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ isDisabled: true, defaultValue: ["test"] });

        expect(state.value()).toEqual(["test"]);

        state.addValue("foo");
        expect(state.value()).toEqual(["test"]);

        state.removeValue("test");
        expect(state.value()).toEqual(["test"]);

        state.toggleValue("foo");
        expect(state.value()).toEqual(["test"]);

        state.setValue(["foo"]);
        expect(state.value()).toEqual(["test"]);

        dispose();
      });
    });
  });

  describe("validation state", () => {
    it("should manage invalid state when isInvalid is true", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ isInvalid: true });

        expect(state.isInvalid).toBe(true);

        dispose();
      });
    });

    it("should manage valid state when isInvalid is false", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ isInvalid: false });

        expect(state.isInvalid).toBe(false);

        dispose();
      });
    });

    it("should default to valid when isInvalid is not provided", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({});

        expect(state.isInvalid).toBe(false);
        expect(state.displayValidation().isInvalid).toBe(false);
        expect(state.displayValidation().validationDetails.valid).toBe(true);
        expect(state.displayValidation().validationErrors).toEqual([]);

        dispose();
      });
    });

    it("should expose invalid displayValidation details when invalid", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ isInvalid: true });

        expect(state.displayValidation().isInvalid).toBe(true);
        expect(state.displayValidation().validationDetails.customError).toBe(true);
        expect(state.displayValidation().validationDetails.valid).toBe(false);
        expect(state.displayValidation().validationErrors).toEqual([]);

        dispose();
      });
    });
  });

  describe("required state", () => {
    it("should be required when no values are selected", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({ isRequired: true });

        expect(state.isRequired()).toBe(true);

        state.setValue(["x"]);
        expect(state.isRequired()).toBe(false);

        state.setValue([]);
        expect(state.isRequired()).toBe(true);

        dispose();
      });
    });

    it("should respect isRequired with defaultValue", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({
          isRequired: true,
          defaultValue: ["a"],
        });

        expect(state.isRequired()).toBe(false);

        state.setValue([]);
        expect(state.isRequired()).toBe(true);

        dispose();
      });
    });
  });

  describe("defaultValue initialization", () => {
    it("should use empty array when no default provided", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({});

        expect(state.defaultValue).toEqual([]);

        dispose();
      });
    });

    it("should preserve defaultValue after state changes", () => {
      createRoot((dispose) => {
        const state = createCheckboxGroupState({
          defaultValue: ["x", "y"],
        });

        expect(state.defaultValue).toEqual(["x", "y"]);

        state.setValue(["a", "b", "c"]);
        expect(state.defaultValue).toEqual(["x", "y"]);

        dispose();
      });
    });
  });

  describe("reactivity with signal props", () => {
    it("should react to prop changes", () => {
      createRoot((dispose) => {
        const [props, setProps] = createSignal<CheckboxGroupProps>({});
        const state = createCheckboxGroupState(props);

        expect(state.value()).toEqual([]);

        setProps({ value: ["a", "b"] });
        expect(state.value()).toEqual(["a", "b"]);

        setProps({ isDisabled: true });
        expect(state.isDisabled).toBe(true);

        dispose();
      });
    });

    it("should handle dynamic value changes via getter", () => {
      createRoot((dispose) => {
        const [value, setValue] = createSignal<string[]>(["a"]);
        const state = createCheckboxGroupState({
          get value() {
            return value();
          },
        });

        expect(state.value()).toEqual(["a"]);

        setValue(["a", "b", "c"]);
        expect(state.value()).toEqual(["a", "b", "c"]);

        setValue([]);
        expect(state.value()).toEqual([]);

        dispose();
      });
    });
  });

  describe("form validation lifecycle", () => {
    it("supports native validation commit/reset flow", async () => {
      let dispose!: () => void;
      let state!: ReturnType<typeof createCheckboxGroupState>;

      createRoot((rootDispose) => {
        dispose = rootDispose;
        state = createCheckboxGroupState({
          validationBehavior: "native",
          validate: (value) => (value.length === 0 ? "Select at least one option" : null),
        });

        expect(state.displayValidation().isInvalid).toBe(false);
      });

      state.commitValidation();
      await Promise.resolve();
      expect(state.displayValidation().isInvalid).toBe(true);
      expect(state.displayValidation().validationErrors).toEqual(["Select at least one option"]);

      state.setValue(["dogs"]);
      state.commitValidation();
      await Promise.resolve();
      expect(state.displayValidation().isInvalid).toBe(false);

      state.resetValidation();
      expect(state.displayValidation().isInvalid).toBe(false);

      dispose();
    });
  });
});
