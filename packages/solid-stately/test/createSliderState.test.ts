/**
 * Tests for createSliderState
 *
 * Ported from @react-stately/slider useSliderState.
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { createSignal } from "./owned-signal";
import { flush, createRoot } from "solid-js";
import { createSliderState, type SliderStateProps } from "../src/slider/createSliderState";

describe("createSliderState", () => {
  describe("basic state management", () => {
    it("should return default min value when no value provided", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        flush();
        expect(state.value()).toBe(0);

        dispose();
      });
    });

    it("should use defaultValue for initial uncontrolled value", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 50,
        });

        flush();
        expect(state.value()).toBe(50);

        dispose();
      });
    });

    it("should use value for controlled mode", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          value: 75,
        });

        flush();
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

        flush();
        expect(state.minValue).toBe(10);
        flush();
        expect(state.maxValue).toBe(90);

        dispose();
      });
    });

    it("should use default min (0) and max (100)", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        flush();
        expect(state.minValue).toBe(0);
        flush();
        expect(state.maxValue).toBe(100);

        dispose();
      });
    });

    it("should use default step (1)", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        flush();
        expect(state.step).toBe(1);

        dispose();
      });
    });

    it("should use custom step", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          step: 5,
        });

        flush();
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
        flush();
        expect(state.value()).toBe(42);

        dispose();
      });
    });

    it("should call onChange when value changes", () => {
      createRoot((dispose) => {
        const onChange = vi.fn();
        const state = createSliderState({ onChange });

        state.setValue(42);
        flush();
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
        flush();
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
        flush();
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
        flush();
        expect(state.value()).toBe(20);

        state.setValue(27);
        flush();
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
        flush();
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

        flush();
        expect(state.getValuePercent()).toBe(0.5);

        dispose();
      });
    });

    it("should return 0 percent for min value", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 0,
        });

        flush();
        expect(state.getValuePercent()).toBe(0);

        dispose();
      });
    });

    it("should return 1 percent for max value", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          defaultValue: 100,
        });

        flush();
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

        flush();
        expect(state.getValuePercent()).toBe(0.5);

        dispose();
      });
    });

    it("should set value by percent", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        state.setValuePercent(0.5);
        flush();
        expect(state.value()).toBe(50);

        dispose();
      });
    });

    it("should clamp percent to 0-1 range", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        state.setValuePercent(-0.5);
        flush();
        expect(state.value()).toBe(0);

        state.setValuePercent(1.5);
        flush();
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
        flush();
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
        flush();
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
        flush();
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
        flush();
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
        flush();
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
        flush();
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
        flush();
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
        flush();
        expect(state.value()).toBe(50);

        dispose();
      });
    });
  });

  describe("dragging state", () => {
    it("should track dragging state", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        flush();
        expect(state.isDragging()).toBe(false);

        state.setDragging(true);
        flush();
        expect(state.isDragging()).toBe(true);

        state.setDragging(false);
        flush();
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
        flush();
        expect(onChangeEnd).not.toHaveBeenCalled();

        state.setDragging(false);
        flush();
        expect(onChangeEnd).toHaveBeenCalledWith(50);

        dispose();
      });
    });
  });

  describe("focus state", () => {
    it("should track focus state", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        flush();
        expect(state.isFocused()).toBe(false);

        state.setFocused(true);
        flush();
        expect(state.isFocused()).toBe(true);

        state.setFocused(false);
        flush();
        expect(state.isFocused()).toBe(false);

        dispose();
      });
    });
  });

  describe("orientation", () => {
    it("should default to horizontal orientation", () => {
      createRoot((dispose) => {
        const state = createSliderState({});

        flush();
        expect(state.orientation).toBe("horizontal");

        dispose();
      });
    });

    it("should use vertical orientation", () => {
      createRoot((dispose) => {
        const state = createSliderState({
          orientation: "vertical",
        });

        flush();
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

        flush();
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

        flush();
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

        flush();
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
        flush();
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
        flush();
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
        flush();
        expect(state.value()).toBe(50);
        // But onChange should be called
        flush();
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

        flush();
        expect(state.value()).toBe(50);

        setValue(75);
        flush();
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
        flush();
        expect(state.value()).toBe(0.1);

        state.increment();
        flush();
        expect(state.value()).toBe(0.2);

        state.increment();
        // Should be 0.3, not 0.30000000000000004
        flush();
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
        flush();
        expect(state.value()).toBe(0.2);

        state.setValue(0.27);
        flush();
        expect(state.value()).toBe(0.3);

        dispose();
      });
    });
  });

  describe("indexed scalar and range compatibility", () => {
    it("keeps omitted-value callbacks numeric, duplicates and multiplier distances", () => {
      createRoot((dispose) => {
        try {
          const calls: number[] = [];
          const state = createSliderState({
            minValue: 10,
            step: 5,
            onChange: (value) => calls.push(value),
          });
          state.setValue(10);
          state.setValue(10);
          state.increment(2);
          state.decrement(2);
          state.increment(0);
          flush();
          expect(state.value()).toBe(10);
          expect(calls).toEqual([10, 10, 20, 10, 10]);
          expect(state.values()).toEqual([10]);
          expect(state.defaultValues()).toEqual([10]);
          // Existing type name defaults to scalar; Parameters selects the final scalar overload.
          const scalarProps: SliderStateProps = { defaultValue: 15 };
          const parameterProps: Parameters<typeof createSliderState>[0] = {
            onChange: (value: number) => calls.push(value),
          };
          expect(createSliderState(scalarProps).value()).toBe(15);
          const inferredScalar = createSliderState(parameterProps);
          inferredScalar.setValue(25);
          expect(calls[calls.length - 1]).toBe(25);
        } finally {
          dispose();
        }
      });
    });

    it("completes scalar controlled dragging with the last proposed value without an echo", () => {
      createRoot((dispose) => {
        try {
          const onChange = vi.fn<(value: number) => void>();
          const onChangeEnd = vi.fn<(value: number) => void>();
          const state = createSliderState({ value: 20, onChange, onChangeEnd });
          state.setDragging(true);
          state.setValue(45);
          state.setValue(70);
          flush();
          expect(state.value()).toBe(20);
          state.setDragging(false);
          state.setDragging(false);
          expect(onChange.mock.calls).toEqual([[45], [70]]);
          expect(onChangeEnd.mock.calls).toEqual([[70]]);
          state.setDragging(true);
          state.setDragging(false);
          expect(onChangeEnd.mock.calls).toEqual([[70], [20]]);
        } finally {
          dispose();
        }
      });
    });

    it("normalizes reversed pair defaults and snaps against the whole domain before neighbor clamp", () => {
      createRoot((dispose) => {
        try {
          const onChange = vi.fn<(value: number[]) => void>();
          const state = createSliderState({
            defaultValue: [83, 23],
            minValue: 10,
            maxValue: 95,
            step: 10,
            onChange,
          });
          flush();
          // OLD scalar treats the array as a numeric value: this assertion is behavioral RED.
          expect(state.value()).toBe(20);
          expect(state.values()).toEqual([20, 80]);
          expect(state.defaultValues()).toEqual([20, 80]);
          expect(state.getThumbMinValue(1)).toBe(20);
          expect(state.getThumbMaxValue(0)).toBe(80);
          state.setThumbValue(1, 66);
          flush();
          expect(state.values()).toEqual([20, 70]);
          state.setThumbValue(0, 100);
          flush();
          expect(state.values()).toEqual([70, 70]);
          state.setThumbValue(0, 100);
          expect(onChange.mock.calls).toEqual([[[20, 70]], [[70, 70]]]);
          state.setThumbPercent(1, 1);
          flush();
          expect(state.values()).toEqual([70, 95]);
          expect(state.getThumbPercent(1)).toBe(1);
        } finally {
          dispose();
        }
      });
    });

    it("emits array callbacks from the numeric facade without mutating controlled props", () => {
      createRoot((dispose) => {
        try {
          const input = [20, 80];
          const calls: number[][] = [];
          const state = createSliderState({ value: input, onChange: (value) => calls.push(value) });
          state.setValue(40);
          expect(calls).toEqual([[40, 80]]);
          expect(input).toEqual([20, 80]);
          flush();
          expect(state.values()).toEqual([20, 80]);
          // Caller mutation of a callback payload must not mutate internal/pending state.
          calls[0][1] = 99;
          expect(state.values()).toEqual([20, 80]);
        } finally {
          dispose();
        }
      });
    });

    it("retains both pending controlled thumb updates and completes only the final drag", () => {
      createRoot((dispose) => {
        try {
          const onChange = vi.fn<(value: number[]) => void>();
          const onChangeEnd = vi.fn<(value: number[]) => void>();
          const state = createSliderState({ value: [20, 80], onChange, onChangeEnd });
          flush();
          expect(state.value()).toBe(20);
          state.setThumbDragging(0, true);
          state.setThumbValue(0, 45);
          state.setThumbDragging(1, true);
          state.setThumbValue(1, 65);
          state.setThumbValue(0, 55);
          flush();
          expect(state.values()).toEqual([20, 80]);
          expect(state.isDragging()).toBe(true);
          state.setThumbDragging(0, false);
          expect(onChangeEnd).not.toHaveBeenCalled();
          state.setThumbDragging(1, false);
          state.setThumbDragging(1, false);
          expect(onChange.mock.calls).toEqual([[[45, 80]], [[45, 65]], [[55, 65]]]);
          expect(onChangeEnd.mock.calls).toEqual([[[55, 65]]]);
          expect(state.isDragging()).toBe(false);
        } finally {
          dispose();
        }
      });
    });

    it("reads delayed controlled echoes without overwriting the latest completion proposal", () => {
      createRoot((dispose) => {
        try {
          const [value, setValue] = createSignal([20, 80]);
          const onChangeEnd = vi.fn<(value: number[]) => void>();
          const state = createSliderState({
            get value() {
              return value();
            },
            onChangeEnd,
          });
          state.setThumbDragging(0, true);
          state.setThumbValue(0, 40);
          setValue([40, 80]);
          flush();
          state.setThumbValue(0, 60);
          flush();
          expect(state.values()).toEqual([40, 80]);
          state.setThumbDragging(0, false);
          expect(onChangeEnd.mock.calls).toEqual([[[60, 80]]]);
          state.setThumbDragging(0, true);
          state.setThumbDragging(0, false);
          expect(onChangeEnd.mock.calls).toEqual([[[60, 80]], [[40, 80]]]);
          state.setThumbDragging(0, true);
          setValue([50, 80]);
          flush();
          state.setThumbDragging(0, false);
          expect(onChangeEnd.mock.calls).toEqual([[[60, 80]], [[40, 80]], [[50, 80]]]);
        } finally {
          dispose();
        }
      });
    });

    it("keeps array defaults and domain resets reactive while scalar defaults remain mount-only", () => {
      createRoot((dispose) => {
        try {
          const [defaults, setDefaults] = createSignal([20, 80]);
          const [maximum, setMaximum] = createSignal(100);
          const onChange = vi.fn<(value: number[]) => void>();
          const state = createSliderState({
            get defaultValue() {
              return defaults();
            },
            get maxValue() {
              return maximum();
            },
            onChange,
          });
          const [scalarDefault, setScalarDefault] = createSignal(20);
          const scalar = createSliderState({
            get defaultValue() {
              return scalarDefault();
            },
          });
          flush();
          state.setThumbValue(0, 40);
          scalar.setValue(40);
          flush();
          expect(state.values()).toEqual([40, 80]);
          setDefaults([30, 90]);
          setScalarDefault(30);
          flush();
          expect(state.values()).toEqual([30, 90]);
          expect(state.defaultValues()).toEqual([30, 90]);
          expect(scalar.value()).toBe(40);
          expect(scalar.defaultValues()).toEqual([20]);
          scalar.setThumbValue(0, scalar.defaultValues()[0]);
          flush();
          expect(scalar.value()).toBe(20);
          expect(scalar.defaultValues()).toEqual([20]);
          setMaximum(60);
          flush();
          expect(state.values()).toEqual([30, 60]);
          expect(state.defaultValues()).toEqual([30, 60]);
          expect(onChange.mock.calls).toEqual([[[40, 80]]]);
        } finally {
          dispose();
        }
      });
    });

    it("uses current explicit range defaults for reset and domain endpoints when omitted", () => {
      createRoot((dispose) => {
        try {
          const [controlled, setControlled] = createSignal<number[] | undefined>([20, 80]);
          const state = createSliderState({
            get value() {
              return controlled();
            },
            defaultValue: [10, 90],
            minValue: 10,
            maxValue: 90,
          });
          flush();
          expect(state.defaultValues()).toEqual([10, 90]);
          setControlled(undefined);
          flush();
          state.setThumbValue(0, 40);
          state.setThumbValue(1, 70);
          flush();
          state.setThumbValue(0, state.defaultValues()[0]);
          state.setThumbValue(1, state.defaultValues()[1]);
          flush();
          expect(state.values()).toEqual([10, 90]);
          const withoutDefault = createSliderState({ value: [20, 80], minValue: 10, maxValue: 90 });
          expect(withoutDefault.defaultValues()).toEqual([10, 90]);
        } finally {
          dispose();
        }
      });
    });

    it("separates absolute indexed increments from scalar multipliers and formats each thumb", () => {
      createRoot((dispose) => {
        try {
          const state = createSliderState({ defaultValue: [20, 80], step: 5, locale: "en-US" });
          flush();
          expect(state.value()).toBe(20);
          state.incrementThumb(0, 2);
          state.decrementThumb(1, 10);
          flush();
          expect(state.values()).toEqual([25, 70]);
          state.increment(2);
          flush();
          expect(state.values()).toEqual([35, 70]);
          expect(state.getThumbValueLabel(0)).toBe("35");
          expect(state.getFormattedValue()).toBe(
            new Intl.NumberFormat("en-US").formatRange(35, 70),
          );
          expect(state.getFormattedValue(50)).toBe("50");
          expect(state.getFormattedValue([10, 90])).toBe(
            new Intl.NumberFormat("en-US").formatRange(10, 90),
          );
          const formatted: () => string = state.getFormattedValue;
          expect(formatted()).toBe(new Intl.NumberFormat("en-US").formatRange(35, 70));
        } finally {
          dispose();
        }
      });
    });

    it("clears disabled drag ownership and preserves another thumb's focus through the scalar facade", () => {
      createRoot((dispose) => {
        try {
          const [disabled, setDisabled] = createSignal(false);
          const onChangeEnd = vi.fn<(value: number[]) => void>();
          const state = createSliderState({
            defaultValue: [20, 80],
            get isDisabled() {
              return disabled();
            },
            onChangeEnd,
          });
          state.setFocusedThumb(1);
          state.setFocused(false);
          expect(state.focusedThumb()).toBe(1);
          expect(state.isFocused()).toBe(true);
          state.setThumbDragging(1, true);
          state.setThumbValue(1, 70);
          setDisabled(true);
          flush();
          state.setThumbValue(1, 60);
          state.setThumbDragging(1, false);
          state.setThumbDragging(1, false);
          expect(state.isDragging()).toBe(false);
          expect(state.values()).toEqual([20, 70]);
          expect(onChangeEnd.mock.calls).toEqual([[[20, 70]]]);
          state.setFocusedThumb(undefined);
          expect(state.isFocused()).toBe(false);
        } finally {
          dispose();
        }
      });
    });
  });

  describe("controlled consecutive indexed proposals", () => {
    it("keeps no-echo pair reset proposals coherent without a drag completion", () => {
      createRoot((dispose) => {
        try {
          const onChange = vi.fn<(value: number[]) => void>();
          const onChangeEnd = vi.fn<(value: number[]) => void>();
          const state = createSliderState({
            value: [0, 20],
            defaultValue: [25, 75],
            onChange,
            onChangeEnd,
          });
          flush();
          const defaults = state.defaultValues();
          state.setThumbValue(1, defaults[1]);
          state.setThumbValue(0, defaults[0]);
          expect(onChange.mock.calls).toEqual([[[0, 75]], [[25, 75]]]);
          expect(state.values()).toEqual([0, 20]);
          expect(state.isDragging()).toBe(false);
          expect(onChangeEnd).not.toHaveBeenCalled();
        } finally {
          dispose();
        }
      });
    });

    it("rebases non-drag proposals on changed controlled corrections and echoes", () => {
      createRoot((dispose) => {
        try {
          const [controlled, setControlled] = createSignal([0, 20]);
          const onChange = vi.fn<(value: number[]) => void>();
          const state = createSliderState({
            get value() {
              return controlled();
            },
            onChange,
          });
          flush();
          state.setThumbValue(1, 75);
          setControlled([5, 15]);
          flush();
          state.setThumbValue(0, 10);
          setControlled([10, 15]);
          flush();
          state.setThumbValue(1, 80);
          state.setThumbValue(0, 30);
          expect(onChange.mock.calls).toEqual([[[0, 75]], [[10, 15]], [[10, 80]], [[30, 80]]]);
          expect(state.values()).toEqual([10, 15]);
        } finally {
          dispose();
        }
      });
    });

    it("accepts ordered three-thumb reset proposals in decreasing then increasing order", () => {
      createRoot((dispose) => {
        try {
          const onChange = vi.fn<(value: number[]) => void>();
          const onChangeEnd = vi.fn<(value: number[]) => void>();
          const state = createSliderState({
            value: [0, 10, 100],
            defaultValue: [20, 30, 90],
            onChange,
            onChangeEnd,
          });
          flush();
          const defaults = state.defaultValues();
          // Aria resets decreasing targets first (ascending), then increasing targets (descending).
          state.setThumbValue(2, defaults[2]);
          state.setThumbValue(1, defaults[1]);
          state.setThumbValue(0, defaults[0]);
          expect(onChange.mock.calls).toEqual([[[0, 10, 90]], [[0, 30, 90]], [[20, 30, 90]]]);
          expect(state.values()).toEqual([0, 10, 100]);
          expect(state.isDragging()).toBe(false);
          expect(onChangeEnd).not.toHaveBeenCalled();
        } finally {
          dispose();
        }
      });
    });

    it("starts a fresh drag from rendered values after an unechoed non-drag proposal", () => {
      createRoot((dispose) => {
        try {
          const onChange = vi.fn<(value: number[]) => void>();
          const onChangeEnd = vi.fn<(value: number[]) => void>();
          const state = createSliderState({ value: [0, 20], onChange, onChangeEnd });
          flush();
          state.setThumbValue(1, 75);
          expect(onChangeEnd).not.toHaveBeenCalled();
          state.setThumbDragging(0, true);
          state.setThumbValue(0, 25);
          state.setThumbDragging(0, false);
          expect(onChange.mock.calls).toEqual([[[0, 75]], [[20, 20]]]);
          expect(onChangeEnd.mock.calls).toEqual([[[20, 20]]]);
        } finally {
          dispose();
        }
      });
    });
  });
});
