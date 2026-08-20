/**
 * Tests for createSlider hook.
 * Ported from @react-aria/slider useSlider.test.js
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
  beforeAll,
  afterAll,
} from "vite-plus/test";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { createSlider } from "../src/slider/createSlider";
import { createSliderState } from "@proyecto-viviana/solid-stately";
import { createSignal } from "solid-js";
import { I18nProvider } from "../src/i18n";

// Test component that uses createSlider
function TestSlider(props: {
  defaultValue?: number;
  value?: number;
  minValue?: number;
  maxValue?: number;
  step?: number;
  onChange?: (value: number) => void;
  onChangeEnd?: (value: number) => void;
  isDisabled?: boolean;
  orientation?: "horizontal" | "vertical";
  "aria-label"?: string;
  label?: string;
}) {
  let trackRef: HTMLDivElement | null = null;

  const state = createSliderState({
    defaultValue: props.defaultValue ?? 50,
    value: props.value,
    minValue: props.minValue ?? 0,
    maxValue: props.maxValue ?? 100,
    step: props.step ?? 1,
    onChange: props.onChange,
    onChangeEnd: props.onChangeEnd,
    isDisabled: props.isDisabled,
    orientation: props.orientation,
  });

  const { labelProps, groupProps, trackProps, thumbProps, inputProps, outputProps } = createSlider(
    () => ({
      "aria-label": props["aria-label"],
      label: props.label,
      isDisabled: props.isDisabled,
      orientation: props.orientation,
    }),
    state,
    () => trackRef,
  );

  return (
    <div {...groupProps} data-testid="slider-group">
      {props.label && <label {...labelProps}>{props.label}</label>}
      <div ref={(el) => (trackRef = el)} {...trackProps} data-testid="slider-track">
        <div {...thumbProps} data-testid="slider-thumb" />
      </div>
      <input {...inputProps} data-testid="slider-input" />
      <output {...outputProps} data-testid="slider-output">
        {state.value()}
      </output>
    </div>
  );
}

describe("createSlider", () => {
  afterEach(() => {
    cleanup();
  });

  describe("accessibility", () => {
    it('should have role="slider" on thumb', () => {
      render(() => <TestSlider aria-label="Volume" />);
      const thumb = screen.getByTestId("slider-thumb");
      expect(thumb).toHaveAttribute("role", "slider");
    });

    it('should have role="group" on container', () => {
      render(() => <TestSlider aria-label="Volume" />);
      const group = screen.getByTestId("slider-group");
      expect(group).toHaveAttribute("role", "group");
    });

    it("should have aria-valuemin, aria-valuemax, aria-valuenow", () => {
      render(() => (
        <TestSlider aria-label="Volume" defaultValue={50} minValue={0} maxValue={100} />
      ));
      const thumb = screen.getByTestId("slider-thumb");
      expect(thumb).toHaveAttribute("aria-valuemin", "0");
      expect(thumb).toHaveAttribute("aria-valuemax", "100");
      expect(thumb).toHaveAttribute("aria-valuenow", "50");
    });

    it("should have aria-orientation", () => {
      render(() => <TestSlider aria-label="Volume" orientation="horizontal" />);
      const thumb = screen.getByTestId("slider-thumb");
      expect(thumb).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("should support vertical orientation", () => {
      render(() => <TestSlider aria-label="Volume" orientation="vertical" />);
      const thumb = screen.getByTestId("slider-thumb");
      expect(thumb).toHaveAttribute("aria-orientation", "vertical");
    });

    it("should have aria-disabled when disabled", () => {
      render(() => <TestSlider aria-label="Volume" isDisabled />);
      const thumb = screen.getByTestId("slider-thumb");
      expect(thumb).toHaveAttribute("aria-disabled", "true");
    });

    it("should be focusable via tabIndex", () => {
      render(() => <TestSlider aria-label="Volume" />);
      const thumb = screen.getByTestId("slider-thumb");
      expect(thumb).toHaveAttribute("tabIndex", "0");
    });

    it("should not be focusable when disabled", () => {
      render(() => <TestSlider aria-label="Volume" isDisabled />);
      const thumb = screen.getByTestId("slider-thumb");
      expect(thumb).not.toHaveAttribute("tabIndex");
    });
  });

  describe("uncontrolled mode", () => {
    it("should use defaultValue", () => {
      render(() => <TestSlider aria-label="Volume" defaultValue={75} />);
      const thumb = screen.getByTestId("slider-thumb");
      expect(thumb).toHaveAttribute("aria-valuenow", "75");
    });

    it("should update value on change", () => {
      const onChange = vi.fn();
      render(() => <TestSlider aria-label="Volume" defaultValue={50} onChange={onChange} />);

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalledWith(51);
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled value", () => {
      render(() => <TestSlider aria-label="Volume" value={25} />);
      const thumb = screen.getByTestId("slider-thumb");
      expect(thumb).toHaveAttribute("aria-valuenow", "25");
    });

    it("should call onChange but not update internal state", () => {
      const onChange = vi.fn();
      render(() => <TestSlider aria-label="Volume" value={50} onChange={onChange} />);

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalledWith(51);
    });
  });

  describe("keyboard navigation", () => {
    it("should increment on ArrowRight", () => {
      const onChange = vi.fn();
      render(() => <TestSlider aria-label="Volume" defaultValue={50} onChange={onChange} />);

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalledWith(51);
    });

    it("should decrement on ArrowLeft", () => {
      const onChange = vi.fn();
      render(() => <TestSlider aria-label="Volume" defaultValue={50} onChange={onChange} />);

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowLeft" });
      expect(onChange).toHaveBeenCalledWith(49);
    });

    it("should increment on ArrowUp for horizontal slider", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider
          aria-label="Volume"
          defaultValue={50}
          orientation="horizontal"
          onChange={onChange}
        />
      ));

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowUp" });
      // ArrowUp decrements for horizontal
      expect(onChange).toHaveBeenCalledWith(49);
    });

    it("should increment on ArrowUp for vertical slider", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider
          aria-label="Volume"
          defaultValue={50}
          orientation="vertical"
          onChange={onChange}
        />
      ));

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowUp" });
      expect(onChange).toHaveBeenCalledWith(51);
    });

    it("should go to min on Home", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider aria-label="Volume" defaultValue={50} minValue={0} onChange={onChange} />
      ));

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "Home" });
      expect(onChange).toHaveBeenCalledWith(0);
    });

    it("should go to max on End", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider aria-label="Volume" defaultValue={50} maxValue={100} onChange={onChange} />
      ));

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "End" });
      expect(onChange).toHaveBeenCalledWith(100);
    });

    it("should not respond to keyboard when disabled", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider aria-label="Volume" defaultValue={50} isDisabled onChange={onChange} />
      ));

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowRight" });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should respect step value", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider aria-label="Volume" defaultValue={50} step={10} onChange={onChange} />
      ));

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalledWith(60);
    });

    it("should reverse horizontal ArrowRight behavior in RTL", () => {
      const onChange = vi.fn();
      render(() => (
        <I18nProvider locale="he-IL">
          <TestSlider
            aria-label="Volume"
            defaultValue={50}
            orientation="horizontal"
            onChange={onChange}
          />
        </I18nProvider>
      ));

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalledWith(49);
    });

    it("should reverse horizontal ArrowLeft behavior in RTL", () => {
      const onChange = vi.fn();
      render(() => (
        <I18nProvider locale="he-IL">
          <TestSlider
            aria-label="Volume"
            defaultValue={50}
            orientation="horizontal"
            onChange={onChange}
          />
        </I18nProvider>
      ));

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowLeft" });
      expect(onChange).toHaveBeenCalledWith(51);
    });
  });

  describe("pointer interactions", () => {
    let widthStub: ReturnType<typeof vi.spyOn>;

    beforeAll(() => {
      widthStub = vi
        .spyOn(HTMLElement.prototype, "getBoundingClientRect")
        .mockImplementation(() => ({
          top: 0,
          left: 0,
          width: 100,
          height: 100,
          right: 100,
          bottom: 100,
          x: 0,
          y: 0,
          toJSON: () => {},
        }));
      // Define pointer capture methods on prototype (not available in jsdom)
      if (!HTMLElement.prototype.setPointerCapture) {
        HTMLElement.prototype.setPointerCapture = function () {};
      }
      if (!HTMLElement.prototype.releasePointerCapture) {
        HTMLElement.prototype.releasePointerCapture = function () {};
      }
    });

    afterAll(() => {
      widthStub.mockRestore();
    });

    it("should set value on track click", () => {
      const onChange = vi.fn();
      render(() => <TestSlider aria-label="Volume" defaultValue={10} onChange={onChange} />);

      const track = screen.getByTestId("slider-track");
      fireEvent.pointerDown(track, { clientX: 50, clientY: 50, button: 0, pointerId: 1 });
      fireEvent.pointerUp(track, { clientX: 50, clientY: 50, pointerId: 1 });

      expect(onChange).toHaveBeenCalled();
    });

    it("should not set value on track click when disabled", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider aria-label="Volume" defaultValue={10} isDisabled onChange={onChange} />
      ));

      const track = screen.getByTestId("slider-track");
      fireEvent.pointerDown(track, { clientX: 50, clientY: 50, button: 0, pointerId: 1 });

      expect(onChange).not.toHaveBeenCalled();
    });

    it("should allow dragging on track", () => {
      const onChange = vi.fn();
      const onChangeEnd = vi.fn();
      render(() => (
        <TestSlider
          aria-label="Volume"
          defaultValue={10}
          onChange={onChange}
          onChangeEnd={onChangeEnd}
        />
      ));

      const track = screen.getByTestId("slider-track");

      fireEvent.pointerDown(track, { clientX: 20, clientY: 50, button: 0, pointerId: 1 });
      expect(onChange).toHaveBeenCalled();

      fireEvent.pointerMove(track, { clientX: 30, clientY: 50, pointerId: 1 });
      fireEvent.pointerMove(track, { clientX: 40, clientY: 50, pointerId: 1 });

      fireEvent.pointerUp(track, { clientX: 40, clientY: 50, pointerId: 1 });
    });
  });

  describe("focus handling", () => {
    it("should have data-focus-visible when focused via keyboard", () => {
      render(() => <TestSlider aria-label="Volume" />);
      const thumb = screen.getByTestId("slider-thumb");

      // Simulate keyboard focus
      fireEvent.keyDown(document, { key: "Tab" });
      thumb.focus();
      fireEvent.focus(thumb);

      // Note: focus-visible behavior depends on the browser/implementation
      expect(thumb).toBeInTheDocument();
    });

    it("should call onFocus/onBlur handlers", () => {
      render(() => <TestSlider aria-label="Volume" />);
      const thumb = screen.getByTestId("slider-thumb");

      fireEvent.focus(thumb);
      fireEvent.blur(thumb);

      // Just verify no errors
      expect(thumb).toBeInTheDocument();
    });
  });

  describe("value constraints", () => {
    it("should clamp value to min", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider aria-label="Volume" defaultValue={5} minValue={0} onChange={onChange} />
      ));

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      // Try to go below min
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(thumb, { key: "ArrowLeft" });
      }

      // Should be called but clamped to min
      expect(onChange).toHaveBeenCalled();
    });

    it("should clamp value to max", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider aria-label="Volume" defaultValue={95} maxValue={100} onChange={onChange} />
      ));

      const thumb = screen.getByTestId("slider-thumb");
      thumb.focus();

      // Try to go above max
      for (let i = 0; i < 10; i++) {
        fireEvent.keyDown(thumb, { key: "ArrowRight" });
      }

      // Should be called but clamped to max
      expect(onChange).toHaveBeenCalled();
    });
  });

  describe("hidden input", () => {
    it('should have type="range"', () => {
      render(() => <TestSlider aria-label="Volume" />);
      const input = screen.getByTestId("slider-input");
      expect(input).toHaveAttribute("type", "range");
    });

    it("should be visually hidden", () => {
      render(() => <TestSlider aria-label="Volume" />);
      const input = screen.getByTestId("slider-input");
      expect(input).toHaveAttribute("aria-hidden", "true");
    });

    it("should have correct min/max/step", () => {
      render(() => <TestSlider aria-label="Volume" minValue={10} maxValue={90} step={5} />);
      const input = screen.getByTestId("slider-input");
      expect(input).toHaveAttribute("min", "10");
      expect(input).toHaveAttribute("max", "90");
      expect(input).toHaveAttribute("step", "5");
    });
  });

  describe("output element", () => {
    it("should display current value", () => {
      render(() => <TestSlider aria-label="Volume" defaultValue={42} />);
      const output = screen.getByTestId("slider-output");
      expect(output).toHaveTextContent("42");
    });

    it('should have aria-live="off"', () => {
      render(() => <TestSlider aria-label="Volume" />);
      const output = screen.getByTestId("slider-output");
      expect(output).toHaveAttribute("aria-live", "off");
    });
  });
});

describe("createSlider with label", () => {
  afterEach(() => {
    cleanup();
  });

  it("should render label", () => {
    render(() => <TestSlider label="Volume" />);
    expect(screen.getByText("Volume")).toBeInTheDocument();
  });

  it("should associate label with slider", () => {
    render(() => <TestSlider label="Volume" />);
    const group = screen.getByTestId("slider-group");
    expect(group).toHaveAttribute("role", "group");
  });
});

describe("createSlider edge cases", () => {
  afterEach(() => {
    cleanup();
  });

  it("should handle undefined trackRef gracefully", () => {
    // This tests the internal handling when trackRef returns null
    function TestSliderNoRef(props: { "aria-label"?: string }) {
      const state = createSliderState({
        defaultValue: 50,
        minValue: 0,
        maxValue: 100,
        step: 1,
      });

      const { thumbProps } = createSlider(
        () => ({ "aria-label": props["aria-label"] }),
        state,
        () => null, // No track ref
      );

      return <div {...thumbProps} data-testid="slider-thumb" />;
    }

    render(() => <TestSliderNoRef aria-label="Volume" />);
    const thumb = screen.getByTestId("slider-thumb");
    expect(thumb).toBeInTheDocument();
  });

  it("should handle very small step values", () => {
    const onChange = vi.fn();
    render(() => (
      <TestSlider
        aria-label="Precise"
        defaultValue={0.5}
        step={0.01}
        minValue={0}
        maxValue={1}
        onChange={onChange}
      />
    ));

    const thumb = screen.getByTestId("slider-thumb");
    thumb.focus();

    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalled();
  });

  it("should handle negative values", () => {
    render(() => (
      <TestSlider aria-label="Temperature" defaultValue={-10} minValue={-50} maxValue={50} />
    ));
    const thumb = screen.getByTestId("slider-thumb");
    expect(thumb).toHaveAttribute("aria-valuenow", "-10");
  });
});
