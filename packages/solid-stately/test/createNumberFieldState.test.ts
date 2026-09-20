/**
 * Tests for createNumberFieldState
 *
 * Ported from @react-stately/numberfield useNumberFieldState.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createSignal } from "./owned-signal";
import { flush, createRoot } from "solid-js";
import { createNumberFieldState } from "../src/numberfield/createNumberFieldState";

describe("createNumberFieldState", () => {
  describe("basic state management", () => {
    it("should return NaN by default", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({});

        flush();
        expect(state.numberValue()).toBeNaN();
        flush();
        expect(state.inputValue()).toBe("");

        dispose();
      });
    });

    it("should use defaultValue for initial value", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
        });

        flush();
        expect(state.numberValue()).toBe(50);
        flush();
        expect(state.inputValue()).toBe("50");

        dispose();
      });
    });

    it("should use value for controlled mode", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          value: 75,
        });

        flush();
        expect(state.numberValue()).toBe(75);
        flush();
        expect(state.inputValue()).toBe("75");

        dispose();
      });
    });

    it("should constrain defaultValue when custom step and bounds are provided", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 9.6,
          minValue: 0,
          maxValue: 10,
          step: 2,
        });

        flush();
        expect(state.numberValue()).toBe(10);
        flush();
        expect(state.inputValue()).toBe("10");

        dispose();
      });
    });
  });

  describe("increment and decrement", () => {
    it("should increment by default step (1)", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createNumberFieldState({
          defaultValue: 50,
          onChange,
        });

        state.increment();

        flush();
        expect(state.numberValue()).toBe(51);
        flush();
        expect(onChange).toHaveBeenCalledWith(51);

        dispose();
      });
    });

    it("should decrement by default step (1)", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createNumberFieldState({
          defaultValue: 50,
          onChange,
        });

        state.decrement();

        flush();
        expect(state.numberValue()).toBe(49);
        flush();
        expect(onChange).toHaveBeenCalledWith(49);

        dispose();
      });
    });

    it("should increment by custom step", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
          step: 5,
        });

        state.increment();

        flush();
        expect(state.numberValue()).toBe(55);

        dispose();
      });
    });

    it("should decrement by custom step", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
          step: 5,
        });

        state.decrement();

        flush();
        expect(state.numberValue()).toBe(45);

        dispose();
      });
    });

    it("should not increment past maxValue", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 98,
          maxValue: 100,
        });

        state.increment();
        flush();
        expect(state.numberValue()).toBe(99);

        state.increment();
        flush();
        expect(state.numberValue()).toBe(100);

        state.increment();
        flush();
        expect(state.numberValue()).toBe(100);

        dispose();
      });
    });

    it("should not decrement past minValue", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 2,
          minValue: 0,
        });

        state.decrement();
        flush();
        expect(state.numberValue()).toBe(1);

        state.decrement();
        flush();
        expect(state.numberValue()).toBe(0);

        state.decrement();
        flush();
        expect(state.numberValue()).toBe(0);

        dispose();
      });
    });

    it("should start from minValue when incrementing from NaN", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          minValue: 10,
        });

        state.increment();

        flush();
        expect(state.numberValue()).toBe(10);

        dispose();
      });
    });

    it("should start from maxValue when decrementing from NaN", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          maxValue: 100,
        });

        state.decrement();

        flush();
        expect(state.numberValue()).toBe(100);

        dispose();
      });
    });

    it("should start from 0 when incrementing from NaN with no min", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({});

        state.increment();

        flush();
        expect(state.numberValue()).toBe(0);

        dispose();
      });
    });

    it("should start from 0 when decrementing from NaN with no max", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({});

        state.decrement();

        flush();
        expect(state.numberValue()).toBe(0);

        dispose();
      });
    });

    it("should not increment when disabled", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
          isDisabled: true,
        });

        state.increment();

        flush();
        expect(state.numberValue()).toBe(50);

        dispose();
      });
    });

    it("should not decrement when disabled", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
          isDisabled: true,
        });

        state.decrement();

        flush();
        expect(state.numberValue()).toBe(50);

        dispose();
      });
    });

    it("should not increment when readOnly", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
          isReadOnly: true,
        });

        state.increment();

        flush();
        expect(state.numberValue()).toBe(50);

        dispose();
      });
    });

    it("should not decrement when readOnly", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
          isReadOnly: true,
        });

        state.decrement();

        flush();
        expect(state.numberValue()).toBe(50);

        dispose();
      });
    });
  });

  describe("incrementToMax and decrementToMin", () => {
    it("should increment to max", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createNumberFieldState({
          defaultValue: 50,
          maxValue: 100,
          onChange,
        });

        state.incrementToMax();

        flush();
        expect(state.numberValue()).toBe(100);
        flush();
        expect(onChange).toHaveBeenCalledWith(100);

        dispose();
      });
    });

    it("should decrement to min", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createNumberFieldState({
          defaultValue: 50,
          minValue: 0,
          onChange,
        });

        state.decrementToMin();

        flush();
        expect(state.numberValue()).toBe(0);
        flush();
        expect(onChange).toHaveBeenCalledWith(0);

        dispose();
      });
    });

    it("should not incrementToMax when no maxValue set", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
        });

        state.incrementToMax();

        flush();
        expect(state.numberValue()).toBe(50);

        dispose();
      });
    });

    it("should not decrementToMin when no minValue set", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
        });

        state.decrementToMin();

        flush();
        expect(state.numberValue()).toBe(50);

        dispose();
      });
    });
  });

  describe("canIncrement and canDecrement", () => {
    it("should return true when can increment", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
          maxValue: 100,
        });

        flush();
        expect(state.canIncrement()).toBe(true);

        dispose();
      });
    });

    it("should return false when at max", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 100,
          maxValue: 100,
        });

        flush();
        expect(state.canIncrement()).toBe(false);

        dispose();
      });
    });

    it("should return true when can decrement", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
          minValue: 0,
        });

        flush();
        expect(state.canDecrement()).toBe(true);

        dispose();
      });
    });

    it("should return false when at min", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 0,
          minValue: 0,
        });

        flush();
        expect(state.canDecrement()).toBe(false);

        dispose();
      });
    });

    it("should return false when disabled", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
          isDisabled: true,
        });

        flush();
        expect(state.canIncrement()).toBe(false);
        flush();
        expect(state.canDecrement()).toBe(false);

        dispose();
      });
    });

    it("should return false when readOnly", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
          isReadOnly: true,
        });

        flush();
        expect(state.canIncrement()).toBe(false);
        flush();
        expect(state.canDecrement()).toBe(false);

        dispose();
      });
    });

    it("should return true when value is NaN", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({});

        flush();
        expect(state.canIncrement()).toBe(true);
        flush();
        expect(state.canDecrement()).toBe(true);

        dispose();
      });
    });
  });

  describe("input value handling", () => {
    it("should set input value", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({});

        state.setInputValue("42");
        flush();
        expect(state.inputValue()).toBe("42");

        dispose();
      });
    });

    it("should commit valid input value", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createNumberFieldState({ onChange });

        state.setInputValue("42");
        state.commit();

        flush();
        expect(state.numberValue()).toBe(42);
        flush();
        expect(onChange).toHaveBeenCalledWith(42);

        dispose();
      });
    });

    it("should clamp value on commit", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          minValue: 0,
          maxValue: 100,
        });

        state.setInputValue("150");
        state.commit();

        flush();
        expect(state.numberValue()).toBe(100);

        dispose();
      });
    });

    it("should snap to step on commit", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          step: 5,
        });

        state.setInputValue("42");
        state.commit();

        flush();
        expect(state.numberValue()).toBe(40);

        dispose();
      });
    });

    it("should clear value when input is empty", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
        });

        state.setInputValue("");
        state.commit();

        flush();
        expect(state.numberValue()).toBeNaN();
        flush();
        expect(state.inputValue()).toBe("");

        dispose();
      });
    });

    it("should preserve decimals on commit when no custom step is provided", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({});

        state.setInputValue("42.5");
        state.commit();

        flush();
        expect(state.numberValue()).toBe(42.5);
        flush();
        expect(state.inputValue()).toBe("42.5");

        dispose();
      });
    });

    it("should clear controlled value via onChange but keep rendered value until prop updates", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createNumberFieldState({
          value: 12,
          onChange,
        });

        state.setInputValue("");
        state.commit();

        flush();
        expect(onChange).toHaveBeenCalledWith(NaN);
        flush();
        expect(state.inputValue()).toBe("12");
        flush();
        expect(state.numberValue()).toBe(12);

        dispose();
      });
    });

    it("should revert to current value on invalid input", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 50,
        });

        state.setInputValue("abc");
        state.commit();

        flush();
        expect(state.numberValue()).toBe(50);
        flush();
        expect(state.inputValue()).toBe("50");

        dispose();
      });
    });
  });

  describe("validation", () => {
    it("should validate empty string", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({});

        flush();
        expect(state.validate("")).toBe(true);

        dispose();
      });
    });

    it("should validate minus sign", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({});

        flush();
        expect(state.validate("-")).toBe(true);

        dispose();
      });
    });

    it("should validate partial decimal", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({});

        flush();
        expect(state.validate("1.")).toBe(true);

        dispose();
      });
    });

    it("should validate full number", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({});

        flush();
        expect(state.validate("42")).toBe(true);
        flush();
        expect(state.validate("3.14")).toBe(true);
        flush();
        expect(state.validate("-5")).toBe(true);

        dispose();
      });
    });
  });

  describe("disabled and readOnly states", () => {
    it("should expose isDisabled", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          isDisabled: true,
        });

        flush();
        expect(state.isDisabled()).toBe(true);

        dispose();
      });
    });

    it("should expose isReadOnly", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          isReadOnly: true,
        });

        flush();
        expect(state.isReadOnly()).toBe(true);

        dispose();
      });
    });
  });

  describe("min and max value accessors", () => {
    it("should expose minValue", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          minValue: 10,
        });

        flush();
        expect(state.minValue()).toBe(10);

        dispose();
      });
    });

    it("should expose maxValue", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          maxValue: 100,
        });

        flush();
        expect(state.maxValue()).toBe(100);

        dispose();
      });
    });
  });

  describe("decimal precision", () => {
    it("should handle decimal operations correctly", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 0,
          step: 0.1,
        });

        state.increment();
        flush();
        expect(state.numberValue()).toBe(0.1);

        state.increment();
        flush();
        expect(state.numberValue()).toBe(0.2);

        state.increment();
        // Should be 0.3, not 0.30000000000000004
        flush();
        expect(state.numberValue()).toBeCloseTo(0.3, 10);

        dispose();
      });
    });
  });

  describe("percent format", () => {
    it("should use step of 0.01 for percent format", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 0.5,
          formatOptions: { style: "percent" },
        });

        state.increment();
        flush();
        expect(state.numberValue()).toBe(0.51);

        dispose();
      });
    });
  });

  describe("controlled mode", () => {
    it("should not update internal state in controlled mode", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createNumberFieldState({
          value: 50,
          onChange,
        });

        state.increment();

        // onChange should be called
        flush();
        expect(onChange).toHaveBeenCalledWith(51);

        dispose();
      });
    });

    it("should be possible to control the value", () => {
      createRoot((dispose) => {
        const [value, setValue] = createSignal(50);
        const state = createNumberFieldState({
          get value() {
            return value();
          },
        });

        flush();
        expect(state.numberValue()).toBe(50);

        setValue(75);
        flush();
        expect(state.numberValue()).toBe(75);
        flush();
        expect(state.inputValue()).toBe("75");

        dispose();
      });
    });
  });

  describe("commitBehavior", () => {
    it("snaps defaultValue to max by default", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 15,
          minValue: 0,
          maxValue: 10,
        });

        flush();
        expect(state.numberValue()).toBe(10);

        dispose();
      });
    });

    it("keeps a value over max when commitBehavior is validate", () => {
      createRoot((dispose) => {
        const state = createNumberFieldState({
          defaultValue: 15,
          minValue: 0,
          maxValue: 10,
          commitBehavior: "validate",
        });

        flush();
        expect(state.numberValue()).toBe(15);

        dispose();
      });
    });
  });
});
