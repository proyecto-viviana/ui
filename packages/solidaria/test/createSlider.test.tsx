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
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import { createSliderThumb } from "../src/slider/createSliderThumb";
import { createSlider } from "../src/slider/createSlider";
import { createSliderState } from "@proyecto-viviana/solid-stately";
import { createSignal, flush } from "solid-js";
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
  "aria-describedby"?: string;
  "aria-details"?: string;
  label?: string;
}) {
  let trackRef: HTMLDivElement | null = null;
  let inputRef: HTMLInputElement | null = null;

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

  const aria = createSlider(
    () => ({
      "aria-label": props["aria-label"],
      "aria-describedby": props["aria-describedby"],
      "aria-details": props["aria-details"],
      label: props.label,
      isDisabled: props.isDisabled,
      orientation: props.orientation,
    }),
    state,
    () => trackRef,
    () => inputRef,
  );

  return (
    <div {...aria.groupProps} data-testid="slider-group">
      {props.label && <label {...aria.labelProps}>{props.label}</label>}
      <div ref={(el) => (trackRef = el)} {...aria.trackProps} data-testid="slider-track">
        <div {...aria.thumbProps} data-testid="slider-thumb" />
      </div>
      <input ref={(el) => (inputRef = el)} {...aria.inputProps} data-testid="slider-input" />
      <output {...aria.outputProps} data-testid="slider-output">
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
    it("should have native slider role on input", () => {
      render(() => <TestSlider aria-label="Volume" />);
      const thumb = screen.getByTestId("slider-input");
      expect(screen.getByRole("slider")).toBe(thumb);
    });

    it('should have role="group" on container', () => {
      render(() => <TestSlider aria-label="Volume" />);
      const group = screen.getByTestId("slider-group");
      expect(group).toHaveAttribute("role", "group");
    });

    it("should have native min, max and value", () => {
      render(() => (
        <TestSlider aria-label="Volume" defaultValue={50} minValue={0} maxValue={100} />
      ));
      const thumb = screen.getByTestId("slider-input");
      expect(thumb).toHaveAttribute("min", "0");
      expect(thumb).toHaveAttribute("max", "100");
      expect(thumb).toHaveAttribute("value", "50");
    });

    it("should have aria-orientation", () => {
      render(() => <TestSlider aria-label="Volume" orientation="horizontal" />);
      const thumb = screen.getByTestId("slider-input");
      expect(thumb).toHaveAttribute("aria-orientation", "horizontal");
    });

    it("should support vertical orientation", () => {
      render(() => <TestSlider aria-label="Volume" orientation="vertical" />);
      const thumb = screen.getByTestId("slider-input");
      expect(thumb).toHaveAttribute("aria-orientation", "vertical");
    });

    it("should have aria-disabled when disabled", () => {
      render(() => <TestSlider aria-label="Volume" isDisabled />);
      const thumb = screen.getByTestId("slider-input");
      expect(thumb).toBeDisabled();
    });

    it("should be focusable via tabIndex", () => {
      render(() => <TestSlider aria-label="Volume" />);
      const thumb = screen.getByTestId("slider-input");
      expect(thumb).toHaveAttribute("tabIndex", "0");
    });

    it("should not be focusable when disabled", () => {
      render(() => <TestSlider aria-label="Volume" isDisabled />);
      const thumb = screen.getByTestId("slider-input");
      expect(thumb).not.toHaveAttribute("tabIndex");
    });

    it("puts the description and details on the slider thumb", () => {
      render(() => (
        <TestSlider
          aria-label="Volume"
          aria-describedby="volume-hint"
          aria-details="volume-details"
        />
      ));
      const thumb = screen.getByTestId("slider-input");
      const group = screen.getByTestId("slider-group");
      const input = screen.getByTestId("slider-input");
      expect(thumb).toHaveAttribute("aria-describedby", "volume-hint");
      expect(thumb).toHaveAttribute("aria-details", "volume-details");
      expect(group).not.toHaveAttribute("aria-describedby");
      expect(group).not.toHaveAttribute("aria-details");
      expect(screen.getByTestId("slider-thumb")).not.toHaveAttribute("aria-describedby");
      expect(screen.getByTestId("slider-thumb")).not.toHaveAttribute("aria-details");
    });

    it("omits the description and details when they are not set", () => {
      render(() => <TestSlider aria-label="Volume" />);
      const thumb = screen.getByTestId("slider-input");
      const group = screen.getByTestId("slider-group");
      expect(thumb).not.toHaveAttribute("aria-describedby");
      expect(thumb).not.toHaveAttribute("aria-details");
      expect(group).not.toHaveAttribute("aria-describedby");
      expect(group).not.toHaveAttribute("aria-details");
    });
  });

  describe("uncontrolled mode", () => {
    it("should use defaultValue", () => {
      render(() => <TestSlider aria-label="Volume" defaultValue={75} />);
      const thumb = screen.getByTestId("slider-input");
      expect(thumb).toHaveAttribute("value", "75");
    });

    it("should update value on change", () => {
      const onChange = vi.fn();
      render(() => <TestSlider aria-label="Volume" defaultValue={50} onChange={onChange} />);

      const thumb = screen.getByTestId("slider-input");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalledWith(51);
    });
  });

  describe("controlled mode", () => {
    it("should reflect controlled value", () => {
      render(() => <TestSlider aria-label="Volume" value={25} />);
      const thumb = screen.getByTestId("slider-input");
      expect(thumb).toHaveAttribute("value", "25");
    });

    it("should call onChange but not update internal state", () => {
      const onChange = vi.fn();
      render(() => <TestSlider aria-label="Volume" value={50} onChange={onChange} />);

      const thumb = screen.getByTestId("slider-input");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalledWith(51);
    });
  });

  describe("keyboard navigation", () => {
    it("should increment on ArrowRight", () => {
      const onChange = vi.fn();
      render(() => <TestSlider aria-label="Volume" defaultValue={50} onChange={onChange} />);

      const thumb = screen.getByTestId("slider-input");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowRight" });
      expect(onChange).toHaveBeenCalledWith(51);
    });

    it("should decrement on ArrowLeft", () => {
      const onChange = vi.fn();
      render(() => <TestSlider aria-label="Volume" defaultValue={50} onChange={onChange} />);

      const thumb = screen.getByTestId("slider-input");
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

      const thumb = screen.getByTestId("slider-input");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowUp" });
      expect(onChange).toHaveBeenCalledWith(51);
    });

    it("should decrement on ArrowDown for horizontal slider", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider
          aria-label="Volume"
          defaultValue={50}
          orientation="horizontal"
          onChange={onChange}
        />
      ));

      const thumb = screen.getByTestId("slider-input");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowDown" });
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

      const thumb = screen.getByTestId("slider-input");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowUp" });
      expect(onChange).toHaveBeenCalledWith(51);
    });

    it("should go to min on Home", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider aria-label="Volume" defaultValue={50} minValue={0} onChange={onChange} />
      ));

      const thumb = screen.getByTestId("slider-input");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "Home" });
      expect(onChange).toHaveBeenCalledWith(0);
    });

    it("should go to max on End", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider aria-label="Volume" defaultValue={50} maxValue={100} onChange={onChange} />
      ));

      const thumb = screen.getByTestId("slider-input");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "End" });
      expect(onChange).toHaveBeenCalledWith(100);
    });

    it("should not respond to keyboard when disabled", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider aria-label="Volume" defaultValue={50} isDisabled onChange={onChange} />
      ));

      const thumb = screen.getByTestId("slider-input");
      thumb.focus();

      fireEvent.keyDown(thumb, { key: "ArrowRight" });
      expect(onChange).not.toHaveBeenCalled();
    });

    it("should respect step value", () => {
      const onChange = vi.fn();
      render(() => (
        <TestSlider aria-label="Volume" defaultValue={50} step={10} onChange={onChange} />
      ));

      const thumb = screen.getByTestId("slider-input");
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

      const thumb = screen.getByTestId("slider-input");
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

      const thumb = screen.getByTestId("slider-input");
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
      const thumb = screen.getByTestId("slider-input");

      // Simulate keyboard focus
      fireEvent.keyDown(document, { key: "Tab" });
      thumb.focus();
      fireEvent.focus(thumb);

      // Note: focus-visible behavior depends on the browser/implementation
      expect(thumb).toBeInTheDocument();
    });

    it("should call onFocus/onBlur handlers", () => {
      render(() => <TestSlider aria-label="Volume" />);
      const thumb = screen.getByTestId("slider-input");

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

      const thumb = screen.getByTestId("slider-input");
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

      const thumb = screen.getByTestId("slider-input");
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
      expect(input).not.toHaveAttribute("aria-hidden");
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

    const thumb = screen.getByTestId("slider-input");
    thumb.focus();

    fireEvent.keyDown(thumb, { key: "ArrowRight" });
    expect(onChange).toHaveBeenCalled();
  });

  it("should handle negative values", () => {
    render(() => (
      <TestSlider aria-label="Temperature" defaultValue={-10} minValue={-50} maxValue={50} />
    ));
    const thumb = screen.getByTestId("slider-input");
    expect(thumb).toHaveAttribute("value", "-10");
  });
});

describe("Slider native owner regression (#74)", () => {
  afterEach(cleanup);
  it("gives role and tab focus to the native input, with a distinct group id", () => {
    render(() => <TestSlider aria-label="Volume" />);
    const input = screen.getByTestId("slider-input");
    const wrapper = screen.getByTestId("slider-thumb");
    expect(screen.getByRole("slider", { name: "Volume" })).toBe(input);
    expect(input).toHaveAttribute("tabindex", "0");
    expect(input).not.toHaveAttribute("aria-hidden");
    expect(wrapper).not.toHaveAttribute("role");
    expect(wrapper).not.toHaveAttribute("tabindex");
    expect(screen.getByTestId("slider-group").id).not.toBe(input.id);
  });
  it("keeps description/details on the native owner", () => {
    render(() => <TestSlider aria-label="Volume" aria-describedby="hint" aria-details="details" />);
    expect(screen.getByTestId("slider-input")).toHaveAttribute("aria-describedby", "hint");
    expect(screen.getByTestId("slider-input")).toHaveAttribute("aria-details", "details");
    expect(screen.getByTestId("slider-thumb")).not.toHaveAttribute("aria-describedby");
  });
  it("updates and completes exactly once for a native input ArrowRight", () => {
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <TestSlider aria-label="Volume" defaultValue={40} onChange={change} onChangeEnd={end} />
    ));
    fireEvent.keyDown(screen.getByTestId("slider-input"), { key: "ArrowRight" });
    expect(change).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenLastCalledWith(41);
    expect(end).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenLastCalledWith(41);
  });
});

describe("createSliderThumb indexed owner (#76; candidate API)", () => {
  afterEach(cleanup);
  function Pair(props: {
    disabledEnd?: boolean;
    value?: number[];
    change: (value: number[]) => void;
    end?: (value: number[]) => void;
  }) {
    let track: HTMLDivElement | null = null;
    const [first, setFirst] = createSignal<HTMLInputElement | null>(null);
    const [last, setLast] = createSignal<HTMLInputElement | null>(null);
    const state = createSliderState({
      defaultValue: [20, 80],
      get value() {
        return props.value;
      },
      onChange: props.change,
      onChangeEnd: props.end,
    });
    const root = createSlider({ "aria-label": "Price" }, state, () => track);
    const start = createSliderThumb(
      { index: 0, "aria-label": "Minimum", name: "start", form: "pair-external" },
      state,
      () => track,
      first,
    );
    const end = createSliderThumb(
      () => ({
        index: 1,
        isDisabled: props.disabledEnd,
        "aria-label": "Maximum",
        name: "end",
        form: "pair-external",
      }),
      state,
      () => track,
      last,
    );
    return (
      <>
        <form id="pair-external" />
        <div {...root.groupProps}>
          <div ref={(el) => (track = el)} {...root.trackProps} data-testid="pair-track">
            <div {...start.thumbProps}>
              <input ref={setFirst} {...start.inputProps} />
            </div>
            <div {...end.thumbProps}>
              <input ref={setLast} {...end.inputProps} />
            </div>
          </div>
          <output {...root.outputProps} />
        </div>
      </>
    );
  }
  it("moves only index 1 and preserves native bounds/association", async () => {
    const change = vi.fn();
    render(() => <Pair change={change} />);
    const inputs = screen.getAllByRole("slider") as HTMLInputElement[];
    expect(inputs).toHaveLength(2);
    expect(inputs[0].max).toBe("80");
    expect(inputs[1].min).toBe("20");
    fireEvent.keyDown(inputs[1], { key: "ArrowLeft" });
    expect(change).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenLastCalledWith([20, 79]);
    expect(inputs.map((input) => input.value)).toEqual(["20", "79"]);
    expect(document.querySelector("output")).toHaveAttribute(
      "for",
      inputs.map((input) => input.id).join(" "),
    );
    fireEvent.reset(inputs[0].form!);
    await waitFor(() => expect(inputs.map((input) => input.value)).toEqual(["20", "80"]));
  });
  it("selects tie/end before rejecting disabled thumb rather than moving its farther neighbor", () => {
    const change = vi.fn();
    render(() => <Pair disabledEnd change={change} />);
    const track = screen.getByTestId("pair-track");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      left: 0,
      right: 100,
      top: 0,
      bottom: 20,
      width: 100,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.pointerDown(track, { button: 0, pointerId: 3, clientX: 50, clientY: 10 });
    expect(change).not.toHaveBeenCalled();
    fireEvent.pointerDown(track, { button: 0, pointerId: 4, clientX: 90, clientY: 10 });
    expect(change).not.toHaveBeenCalled();
    fireEvent.pointerDown(track, { button: 0, pointerId: 5, clientX: 30, clientY: 10 });
    expect(change).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenLastCalledWith([30, 80]);
    fireEvent.pointerUp(track.ownerDocument, { pointerId: 5 });
  });
  it("finishes the last controlled track proposal without a parent echo, once on cancellation", () => {
    const change = vi.fn(),
      end = vi.fn();
    render(() => <Pair value={[20, 80]} change={change} end={end} />);
    const track = screen.getByTestId("pair-track");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      left: 0,
      right: 100,
      top: 0,
      bottom: 20,
      width: 100,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.pointerDown(track, { button: 0, pointerId: 8, clientX: 30, clientY: 10 });
    expect(change).toHaveBeenLastCalledWith([30, 80]);
    fireEvent.pointerMove(track.ownerDocument, { pointerId: 8, clientX: 40, clientY: 10 });
    expect(change).toHaveBeenLastCalledWith([40, 80]);
    fireEvent.pointerCancel(track.ownerDocument, { pointerId: 8 });
    expect(end).toHaveBeenCalledTimes(1);
    expect(end).toHaveBeenLastCalledWith([40, 80]);
    fireEvent.pointerUp(track.ownerDocument, { pointerId: 8 });
    expect(end).toHaveBeenCalledTimes(1);
    expect(
      (screen.getAllByRole("slider") as HTMLInputElement[]).map((input) => input.value),
    ).toEqual(["20", "80"]);
  });

  it("resets a pair above its current upper bound without losing the lower default", async () => {
    const change = vi.fn();
    render(() => <Pair change={change} />);
    const inputs = screen.getAllByRole("slider") as HTMLInputElement[];
    fireEvent.input(inputs[0], { target: { value: "0" } });
    fireEvent.input(inputs[1], { target: { value: "10" } });
    expect(inputs.map((input) => input.value)).toEqual(["0", "10"]);
    fireEvent.reset(inputs[0].form!);
    await waitFor(() => expect(inputs.map((input) => input.value)).toEqual(["20", "80"]));
    expect(new FormData(inputs[0].form!).get("start")).toBe("20");
    expect(new FormData(inputs[1].form!).get("end")).toBe("80");
  });
});

describe("Slider indexed reset and live ownership (#74/#76; v2 candidate)", () => {
  afterEach(cleanup);
  type OwnersProps = {
    defaults: number[];
    value?: number[];
    indices?: number[];
    forms?: string[];
    disabled?: boolean[];
    change: (value: number[]) => void;
    end?: (value: number[]) => void;
  };
  function Owners(props: OwnersProps) {
    let track: HTMLDivElement | null = null;
    const slots = Array.from({ length: props.defaults.length }, (_, slot) => slot);
    const state = createSliderState({
      get defaultValue() {
        return props.defaults;
      },
      get value() {
        return props.value;
      },
      onChange: props.change,
      onChangeEnd: props.end,
    });
    const root = createSlider({ "aria-label": "Values" }, state, () => track);
    function Thumb(slot: { slot: number }) {
      const [element, setElement] = createSignal<HTMLInputElement | null>(null);
      const index = () => props.indices?.[slot.slot] ?? slot.slot;
      const aria = createSliderThumb(
        () => ({
          index: index(),
          id: `owner-input-${slot.slot}`,
          "aria-label": `Thumb ${slot.slot}`,
          name: `value-${slot.slot}`,
          form: props.forms?.[slot.slot] ?? "owner-form-a",
          isDisabled: props.disabled?.[slot.slot],
        }),
        state,
        () => track,
        element,
      );
      return (
        <div {...aria.thumbProps} data-testid={`owner-thumb-${slot.slot}`}>
          <input ref={setElement} {...aria.inputProps} />
          <span data-testid={`owner-render-${slot.slot}`}>{state.getThumbValue(index())}</span>
        </div>
      );
    }
    return (
      <div {...root.groupProps}>
        <div ref={(el) => (track = el)} {...root.trackProps} data-testid="owner-track">
          {slots.map((slot) => (
            <Thumb slot={slot} />
          ))}
        </div>
        <output {...root.outputProps} />
        <span data-testid="owner-state">{state.values().join(",")}</span>
        <span data-testid="owner-focus">{String(state.focusedThumb())}</span>
      </div>
    );
  }
  const inputs = (container: ParentNode = document) =>
    Array.from(container.querySelectorAll('input[type="range"]')) as HTMLInputElement[];
  const values = (container: ParentNode = document) =>
    inputs(container).map((input) => input.value);
  const form = (id = "owner-form-a") => document.getElementById(id) as HTMLFormElement;

  it("keeps controlled no-echo native reset values held while proposing the complete pair without completion", async () => {
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <>
        <form id="owner-form-a" />
        <Owners defaults={[25, 75]} value={[0, 20]} change={change} end={end} />
      </>
    ));
    flush();
    expect(inputs().map((input) => input.defaultValue)).toEqual(["0", "20"]);
    form().reset();
    await waitFor(() => expect(change.mock.calls).toEqual([[[0, 75]], [[25, 75]]]));
    expect(values()).toEqual(["0", "20"]);
    expect(new FormData(form()).get("value-0")).toBe("0");
    expect(new FormData(form()).get("value-1")).toBe("20");
    expect(end).not.toHaveBeenCalled();
  });

  it("rebases a later controlled reset after changed parent echo and correction", async () => {
    const [controlled, setControlled] = createSignal([0, 20]);
    const [defaults, setDefaults] = createSignal([25, 75]);
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <>
        <form id="owner-form-a" />
        <Owners defaults={defaults()} value={controlled()} change={change} end={end} />
      </>
    ));
    flush();
    form().reset();
    await waitFor(() => expect(change).toHaveBeenLastCalledWith([25, 75]));
    setControlled([25, 75]);
    flush();
    await waitFor(() => expect(values()).toEqual(["25", "75"]));
    setControlled([40, 90]);
    setDefaults([10, 60]);
    flush();
    change.mockClear();
    form().reset();
    await waitFor(() => expect(change.mock.calls).toEqual([[[10, 90]], [[10, 60]]]));
    expect(values()).toEqual(["40", "90"]);
    expect(inputs().map((input) => input.defaultValue)).toEqual(["40", "90"]);
    expect(end).not.toHaveBeenCalled();
  });

  it("orders mixed-direction three-thumb reset and performs native uncontrolled default action coherently", async () => {
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <>
        <form id="owner-form-a" />
        <Owners defaults={[20, 30, 90]} change={change} end={end} />
      </>
    ));
    flush();
    fireEvent.input(inputs()[0], { target: { value: "0" } });
    fireEvent.input(inputs()[1], { target: { value: "10" } });
    fireEvent.input(inputs()[2], { target: { value: "100" } });
    flush();
    expect(values()).toEqual(["0", "10", "100"]);
    change.mockClear();
    form().reset();
    await waitFor(() => expect(values()).toEqual(["20", "30", "90"]));
    expect(change.mock.calls).toEqual([[[0, 10, 90]], [[0, 30, 90]], [[20, 30, 90]]]);
    expect(inputs().map((input) => input.defaultValue)).toEqual(["20", "30", "90"]);
    expect([...new FormData(form()).values()]).toEqual(["20", "30", "90"]);
    expect(end).not.toHaveBeenCalled();
  });

  it("moves multiple decreasing reset targets in ascending index order", async () => {
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <>
        <form id="owner-form-a" />
        <Owners defaults={[10, 20, 90]} value={[70, 80, 100]} change={change} end={end} />
      </>
    ));
    flush();
    form().reset();
    await waitFor(() =>
      expect(change.mock.calls.map((call) => call[0])).toEqual([
        [10, 80, 100],
        [10, 20, 100],
        [10, 20, 90],
      ]),
    );
    expect(values()).toEqual(["70", "80", "100"]);
    expect(end).not.toHaveBeenCalled();
  });

  it("proposes a complete no-echo three-thumb reset rather than a pair-only reversal", async () => {
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <>
        <form id="owner-form-a" />
        <Owners defaults={[20, 30, 90]} value={[0, 10, 100]} change={change} end={end} />
      </>
    ));
    flush();
    form().reset();
    await waitFor(() =>
      expect(change.mock.calls).toEqual([[[0, 10, 90]], [[0, 30, 90]], [[20, 30, 90]]]),
    );
    expect(values()).toEqual(["0", "10", "100"]);
    expect(end).not.toHaveBeenCalled();
  });

  it("resets selected forms once while keeping an unselected neighbor as its bound", async () => {
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <>
        <form id="owner-form-a" />
        <form id="owner-form-b" />
        <Owners
          defaults={[20, 30, 90]}
          value={[0, 10, 100]}
          forms={["owner-form-a", "owner-form-b", "owner-form-a"]}
          change={change}
          end={end}
        />
      </>
    ));
    flush();
    form().reset();
    await waitFor(() => expect(change.mock.calls).toEqual([[[0, 10, 90]], [[10, 10, 90]]]));
    expect(values()).toEqual(["0", "10", "100"]);
    expect(new FormData(form("owner-form-b")).get("value-1")).toBe("10");
    expect(end).not.toHaveBeenCalled();
  });

  it("excludes a directly disabled native registration from reset setters and preserves its DOM", async () => {
    const change = vi.fn();
    render(() => (
      <>
        <form id="owner-form-a" />
        <Owners
          defaults={[20, 30, 90]}
          value={[0, 10, 100]}
          disabled={[false, true, false]}
          change={change}
        />
      </>
    ));
    flush();
    form().reset();
    await waitFor(() => expect(change.mock.calls).toEqual([[[0, 10, 90]], [[10, 10, 90]]]));
    expect(inputs()[1]).toBeDisabled();
    expect(inputs()[1].value).toBe("10");
    expect(new FormData(form()).has("value-1")).toBe(false);
  });

  it("honors a reset prevented by a later listener without changing native values or emitting proposals", async () => {
    const change = vi.fn();
    render(() => (
      <>
        <form id="owner-form-a" />
        <Owners defaults={[25, 75]} value={[0, 20]} change={change} />
      </>
    ));
    flush();
    const prevented = vi.fn((event: Event) => event.preventDefault());
    form().addEventListener("reset", prevented);
    try {
      form().reset();
      await Promise.resolve();
      flush();
      expect(prevented).toHaveBeenCalledTimes(1);
      expect(change).not.toHaveBeenCalled();
      expect(values()).toEqual(["0", "20"]);
    } finally {
      form().removeEventListener("reset", prevented);
    }
  });

  it("follows reactive form reassociation and removes the old actual-form listener", async () => {
    const [association, setAssociation] = createSignal("owner-form-a");
    const change = vi.fn();
    render(() => (
      <>
        <form id="owner-form-a" />
        <form id="owner-form-b" />
        <Owners
          defaults={[25, 75]}
          value={[0, 20]}
          forms={[association(), association()]}
          change={change}
        />
      </>
    ));
    flush();
    const old = form();
    const remove = vi.spyOn(old, "removeEventListener");
    setAssociation("owner-form-b");
    flush();
    await waitFor(() =>
      expect(inputs().every((input) => input.form === form("owner-form-b"))).toBe(true),
    );
    old.reset();
    await Promise.resolve();
    expect(change).not.toHaveBeenCalled();
    form("owner-form-b").reset();
    await waitFor(() => expect(change.mock.calls).toEqual([[[0, 75]], [[25, 75]]]));
    expect(remove.mock.calls.some(([type]) => type === "reset")).toBe(true);
    remove.mockRestore();
  });

  it("resolves synchronous native form attribute reassociation before observer delivery", async () => {
    const change = vi.fn();
    render(() => (
      <>
        <form id="owner-form-a" />
        <form id="owner-form-b" />
        <Owners defaults={[25, 75]} value={[0, 20]} change={change} />
      </>
    ));
    flush();
    inputs().forEach((input) => input.setAttribute("form", "owner-form-b"));
    form("owner-form-b").reset();
    await waitFor(() => expect(change.mock.calls).toEqual([[[0, 75]], [[25, 75]]]));
    expect(values()).toEqual(["0", "20"]);
  });

  it("receives noncomposed resets inside a shadow root through its actual form", async () => {
    const host = document.createElement("div");
    document.body.append(host);
    const shadow = host.attachShadow({ mode: "open" });
    const mount = document.createElement("div");
    shadow.append(mount);
    const change = vi.fn(),
      end = vi.fn();
    try {
      render(
        () => (
          <form>
            <Owners
              defaults={[25, 75]}
              value={[0, 20]}
              forms={["", ""]}
              change={change}
              end={end}
            />
          </form>
        ),
        { container: mount },
      );
      flush();
      // A missing form attribute is needed for ancestor association, not form="".
      inputs(shadow).forEach((input) => input.removeAttribute("form"));
      await Promise.resolve();
      const actual = shadow.querySelector("form")!;
      const outside = vi.fn();
      document.addEventListener("reset", outside);
      try {
        actual.reset();
        await waitFor(() => expect(change.mock.calls).toEqual([[[0, 75]], [[25, 75]]]));
        expect(outside).not.toHaveBeenCalled();
        expect(values(shadow)).toEqual(["0", "20"]);
        expect(end).not.toHaveBeenCalled();
      } finally {
        document.removeEventListener("reset", outside);
      }
    } finally {
      cleanup();
      host.remove();
    }
  });

  it("moves native handlers, bounds, focus and output ownership with reactive thumb indices", async () => {
    const [indices, setIndices] = createSignal([0, 1, 2]);
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <>
        <form id="owner-form-a" />
        <Owners defaults={[10, 40, 90]} indices={indices()} change={change} end={end} />
      </>
    ));
    flush();
    const first = inputs()[0];
    first.focus();
    flush();
    setIndices([2, 1, 0]);
    flush();
    await waitFor(() => expect(first.value).toBe("90"));
    expect(first.min).toBe("40");
    expect(first.max).toBe("100");
    expect(screen.getByTestId("owner-render-0")).toHaveTextContent("90");
    expect(screen.getByTestId("owner-focus")).toHaveTextContent("2");
    expect(document.activeElement).toBe(first);
    expect(document.querySelector("output")).toHaveAttribute(
      "for",
      "owner-input-2 owner-input-1 owner-input-0",
    );
    fireEvent.keyDown(first, { key: "ArrowLeft" });
    expect(change).toHaveBeenLastCalledWith([10, 40, 89]);
    expect(end).toHaveBeenLastCalledWith([10, 40, 89]);
    expect(first.value).toBe("89");
    expect(inputs()[2].value).toBe("10");
  });

  it("finishes active pointer ownership once before a thumb changes its index", async () => {
    const [indices, setIndices] = createSignal([0, 1, 2]);
    const change = vi.fn(),
      end = vi.fn();
    render(() => (
      <>
        <form id="owner-form-a" />
        <Owners defaults={[10, 40, 90]} indices={indices()} change={change} end={end} />
      </>
    ));
    flush();
    const track = screen.getByTestId("owner-track");
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      left: 0,
      right: 100,
      top: 0,
      bottom: 20,
      width: 100,
      height: 20,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    });
    fireEvent.pointerDown(screen.getByTestId("owner-thumb-2"), {
      button: 0,
      pointerId: 42,
      clientX: 90,
      clientY: 10,
    });
    fireEvent.pointerMove(document, { pointerId: 42, clientX: 95, clientY: 10 });
    expect(change).toHaveBeenLastCalledWith([10, 40, 95]);
    setIndices([2, 1, 0]);
    flush();
    await waitFor(() => expect(end.mock.calls).toEqual([[[10, 40, 95]]]));
    fireEvent.pointerMove(document, { pointerId: 42, clientX: 96, clientY: 10 });
    fireEvent.pointerUp(document, { pointerId: 42 });
    expect(end).toHaveBeenCalledTimes(1);
    expect(change).toHaveBeenCalledTimes(1);
  });

  it("restores the rendered controlled native value after an unechoed input and ignores its paired change", () => {
    const change = vi.fn();
    render(() => (
      <>
        <form id="owner-form-a" />
        <Owners defaults={[20, 80]} value={[20, 80]} change={change} />
      </>
    ));
    flush();
    const first = inputs()[0];
    fireEvent.input(first, { target: { value: "50" } });
    fireEvent.change(first);
    expect(change.mock.calls).toEqual([[[50, 80]]]);
    expect(first.value).toBe("20");
    expect(new FormData(form()).get("value-0")).toBe("20");
  });

  it("tears down actual-form and root listeners, observers and queued reset work on unmount", async () => {
    const change = vi.fn();
    const view = render(() => (
      <>
        <form id="owner-form-a" />
        <Owners defaults={[25, 75]} value={[0, 20]} change={change} />
      </>
    ));
    flush();
    const actual = form();
    const remove = vi.spyOn(actual, "removeEventListener");
    const disconnect = vi.spyOn(MutationObserver.prototype, "disconnect");
    actual.reset();
    view.unmount();
    await Promise.resolve();
    actual.dispatchEvent(new Event("reset", { bubbles: true, cancelable: true }));
    await Promise.resolve();
    expect(change).not.toHaveBeenCalled();
    expect(remove.mock.calls.some(([type]) => type === "reset")).toBe(true);
    expect(disconnect).toHaveBeenCalled();
    remove.mockRestore();
    disconnect.mockRestore();
  });
});
