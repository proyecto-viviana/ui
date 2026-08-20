/**
 * Tests for createSliderState
 *
 * Ported from @react-stately/slider useSliderState.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createRoot, createSignal } from "solid-js";
import { createSliderState } from "../src/slider/createSliderState";

describe("createSliderState", () => {
  describe("basic state management", () => {
    it("should return default min value when no value provided", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        expect(state.value()).toBe(0);

        dispose();
      });
    });

    it("should use defaultValue for initial uncontrolled value", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 50,
        });

        expect(state.value()).toBe(50);

        dispose();
      });
    });

    it("should use value for controlled mode", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          value: 75,
        });

        expect(state.value()).toBe(75);

        dispose();
      });
    });

    it("should respect min and max bounds", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          minValue: 10,
          maxValue: 90,
        });

        expect(state.minValue).toBe(10);
        expect(state.maxValue).toBe(90);

        dispose();
      });
    });

    it("should use default min (0) and max (100)", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        expect(state.minValue).toBe(0);
        expect(state.maxValue).toBe(100);

        dispose();
      });
    });

    it("should use default step (1)", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        expect(state.step).toBe(1);

        dispose();
      });
    });

    it("should use custom step", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          step: 5,
        });

        expect(state.step).toBe(5);

        dispose();
      });
    });
  });

  describe("value setting", () => {
    it("should set value in uncontrolled mode", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        state.setValue(42);
        expect(state.value()).toBe(42);

        dispose();
      });
    });

    it("should call onChange when value changes", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createSliderState({ onChange });

        state.setValue(42);
        expect(onChange).toHaveBeenCalledWith(42);

        dispose();
      });
    });

    it("should clamp value to min", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          minValue: 10,
          maxValue: 100,
        });

        state.setValue(-5);
        expect(state.value()).toBe(10);

        dispose();
      });
    });

    it("should clamp value to max", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          minValue: 0,
          maxValue: 50,
        });

        state.setValue(75);
        expect(state.value()).toBe(50);

        dispose();
      });
    });

    it("should snap value to step", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          step: 10,
        });

        state.setValue(23);
        expect(state.value()).toBe(20);

        state.setValue(27);
        expect(state.value()).toBe(30);

        dispose();
      });
    });

    it("should not change value when disabled", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 50,
          isDisabled: true,
        });

        state.setValue(75);
        expect(state.value()).toBe(50);

        dispose();
      });
    });
  });

  describe("percent value", () => {
    it("should return correct percent for value", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 50,
        });

        expect(state.getValuePercent()).toBe(0.5);

        dispose();
      });
    });

    it("should return 0 percent for min value", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 0,
        });

        expect(state.getValuePercent()).toBe(0);

        dispose();
      });
    });

    it("should return 1 percent for max value", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 100,
        });

        expect(state.getValuePercent()).toBe(1);

        dispose();
      });
    });

    it("should calculate percent with custom min/max", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          minValue: 50,
          maxValue: 150,
          defaultValue: 100,
        });

        expect(state.getValuePercent()).toBe(0.5);

        dispose();
      });
    });

    it("should set value by percent", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        state.setValuePercent(0.5);
        expect(state.value()).toBe(50);

        dispose();
      });
    });

    it("should clamp percent to 0-1 range", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        state.setValuePercent(-0.5);
        expect(state.value()).toBe(0);

        state.setValuePercent(1.5);
        expect(state.value()).toBe(100);

        dispose();
      });
    });
  });

  describe("increment and decrement", () => {
    it("should increment by step", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 50,
          step: 5,
        });

        state.increment();
        expect(state.value()).toBe(55);

        dispose();
      });
    });

    it("should decrement by step", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 50,
          step: 5,
        });

        state.decrement();
        expect(state.value()).toBe(45);

        dispose();
      });
    });

    it("should increment by step multiplier", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 50,
          step: 5,
        });

        state.increment(2);
        expect(state.value()).toBe(60);

        dispose();
      });
    });

    it("should decrement by step multiplier", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 50,
          step: 5,
        });

        state.decrement(2);
        expect(state.value()).toBe(40);

        dispose();
      });
    });

    it("should not increment past max", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 98,
          step: 5,
        });

        state.increment();
        expect(state.value()).toBe(100);

        dispose();
      });
    });

    it("should not decrement past min", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 2,
          step: 5,
        });

        state.decrement();
        expect(state.value()).toBe(0);

        dispose();
      });
    });

    it("should not increment when disabled", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 50,
          isDisabled: true,
        });

        state.increment();
        expect(state.value()).toBe(50);

        dispose();
      });
    });

    it("should not decrement when disabled", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 50,
          isDisabled: true,
        });

        state.decrement();
        expect(state.value()).toBe(50);

        dispose();
      });
    });
  });

  describe("dragging state", () => {
    it("should track dragging state", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        expect(state.isDragging()).toBe(false);

        state.setDragging(true);
        expect(state.isDragging()).toBe(true);

        state.setDragging(false);
        expect(state.isDragging()).toBe(false);

        dispose();
      });
    });

    it("should call onChangeEnd when dragging stops", () => {
      createRoot((dispose) => {
        const onChangeEnd = vi.fn();
        const state = createSliderState({
          defaultValue: 50,
          onChangeEnd,
        });

        state.setDragging(true);
        expect(onChangeEnd).not.toHaveBeenCalled();

        state.setDragging(false);
        expect(onChangeEnd).toHaveBeenCalledWith(50);

        dispose();
      });
    });
  });

  describe("focus state", () => {
    it("should track focus state", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        expect(state.isFocused()).toBe(false);

        state.setFocused(true);
        expect(state.isFocused()).toBe(true);

        state.setFocused(false);
        expect(state.isFocused()).toBe(false);

        dispose();
      });
    });
  });

  describe("orientation", () => {
    it("should default to horizontal orientation", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        expect(state.orientation).toBe("horizontal");

        dispose();
      });
    });

    it("should use vertical orientation", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          orientation: "vertical",
        });

        expect(state.orientation).toBe("vertical");

        dispose();
      });
    });
  });

  describe("formatted value", () => {
    it("should format value as string", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 50,
          locale: "en-US",
        });

        expect(state.getFormattedValue()).toBe("50");

        dispose();
      });
    });

    it("should format with custom options", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 0.5,
          minValue: 0,
          maxValue: 1,
          step: 0.01,
          locale: "en-US",
          formatOptions: { style: "percent" },
        });

        expect(state.getFormattedValue()).toBe("50%");

        dispose();
      });
    });

    it("should format with currency", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 100,
          locale: "en-US",
          formatOptions: { style: "currency", currency: "USD" },
        });

        expect(state.getFormattedValue()).toBe("$100.00");

        dispose();
      });
    });
  });

  describe("page step", () => {
    it("should calculate page step as 10% of range", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          step: 1,
        });

        // 10% of 100 = 10, snapped to step of 1
        expect(state.pageStep).toBe(10);

        dispose();
      });
    });

    it("should snap page step to regular step", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          step: 7,
        });

        // 10% of 100 = 10, snapped to step of 7 = 7
        expect(state.pageStep).toBe(7);

        dispose();
      });
    });
  });

  describe("controlled mode", () => {
    it("should not update internal state in controlled mode", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createSliderState({
          value: 50,
          onChange,
        });

        state.setValue(75);

        // Value should NOT change in controlled mode
        expect(state.value()).toBe(50);
        // But onChange should be called
        expect(onChange).toHaveBeenCalledWith(75);

        dispose();
      });
    });

    it("should be possible to control the value", () => {
      createRoot((dispose) => {
        const [value, setValue] = createSignal(50);
        const state = createSliderState({
          get value() {
            return value();
          },
        });

        expect(state.value()).toBe(50);

        setValue(75);
        expect(state.value()).toBe(75);

        dispose();
      });
    });
  });

  describe("decimal step handling", () => {
    it("should handle decimal steps correctly", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          minValue: 0,
          maxValue: 1,
          step: 0.1,
          defaultValue: 0,
        });

        state.increment();
        expect(state.value()).toBe(0.1);

        state.increment();
        expect(state.value()).toBe(0.2);

        state.increment();
        // Should be 0.3, not 0.30000000000000004
        expect(state.value()).toBeCloseTo(0.3, 10);

        dispose();
      });
    });

    it("should snap decimal values to step", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          minValue: 0,
          maxValue: 1,
          step: 0.1,
        });

        state.setValue(0.23);
        expect(state.value()).toBe(0.2);

        state.setValue(0.27);
        expect(state.value()).toBe(0.3);

        dispose();
      });
    });
  });
});
