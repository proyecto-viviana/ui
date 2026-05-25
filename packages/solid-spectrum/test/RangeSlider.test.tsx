/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { Form, RangeSlider, RangeSliderContext } from "../src";

describe("RangeSlider (solid-spectrum)", () => {
  it("renders S2 range slider semantics with min/max defaults", () => {
    render(() => <RangeSlider label="Range" />);

    expect(screen.getByRole("group", { name: "Range" })).toBeInTheDocument();
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveAttribute("aria-label", "Minimum");
    expect(sliders[1]).toHaveAttribute("aria-label", "Maximum");
    expect(sliders[0]).toHaveAttribute("aria-valuenow", "0");
    expect(sliders[1]).toHaveAttribute("aria-valuenow", "100");
    expect(screen.getByText("0 – 100")).toBeInTheDocument();
  });

  it("supports controlled values and localized formatting", () => {
    render(() => (
      <RangeSlider
        label="Price"
        value={{ start: 20, end: 80 }}
        formatOptions={{ style: "currency", currency: "USD", maximumFractionDigits: 0 }}
      />
    ));

    expect(screen.getByText("$20 – $80")).toBeInTheDocument();
    const sliders = screen.getAllByRole("slider");
    expect(sliders[0]).toHaveAttribute("aria-valuetext", "$20");
    expect(sliders[1]).toHaveAttribute("aria-valuetext", "$80");
  });

  it("passes start and end form props through hidden inputs", () => {
    const { container } = render(() => (
      <RangeSlider
        label="Range"
        value={{ start: 25, end: 75 }}
        startName="minimum"
        endName="maximum"
        form="filters"
      />
    ));

    const startInput = container.querySelector<HTMLInputElement>('input[name="minimum"]');
    const endInput = container.querySelector<HTMLInputElement>('input[name="maximum"]');
    expect(startInput).toHaveAttribute("type", "hidden");
    expect(startInput).toHaveAttribute("form", "filters");
    expect(startInput).toHaveValue("25");
    expect(endInput).toHaveAttribute("type", "hidden");
    expect(endInput).toHaveAttribute("form", "filters");
    expect(endInput).toHaveValue("75");
  });

  it("inherits form disabled state", () => {
    const { container } = render(() => (
      <Form isDisabled>
        <RangeSlider
          label="Range"
          value={{ start: 25, end: 75 }}
          startName="minimum"
          endName="maximum"
        />
      </Form>
    ));

    const sliders = screen.getAllByRole("slider");
    expect(sliders[0]).toHaveAttribute("aria-disabled", "true");
    expect(sliders[1]).toHaveAttribute("aria-disabled", "true");
    expect(container.querySelector<HTMLInputElement>('input[name="minimum"]')).toBeDisabled();
    expect(container.querySelector<HTMLInputElement>('input[name="maximum"]')).toBeDisabled();
  });

  it("merges RangeSliderContext props, styles, unsafe style, and ref", () => {
    const ref = vi.fn();

    render(() => (
      <RangeSliderContext.Provider
        value={{
          "aria-label": "Context range",
          defaultValue: { start: 10, end: 30 },
          UNSAFE_className: "context-rangeslider",
          UNSAFE_style: { margin: "1px" },
          ref,
        }}
      >
        <RangeSlider />
      </RangeSliderContext.Provider>
    ));

    const root = screen.getByRole("group", { name: "Context range" });
    expect(root).toHaveClass("context-rangeslider");
    expect(root).toHaveStyle({ margin: "1px" });
    expect(ref).toHaveBeenCalledWith(root);
    const sliders = screen.getAllByRole("slider");
    expect(sliders[0]).toHaveAttribute("aria-valuenow", "10");
    expect(sliders[1]).toHaveAttribute("aria-valuenow", "30");
  });

  it("updates uncontrolled ranges from the keyboard", () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    render(() => (
      <RangeSlider
        label="Range"
        defaultValue={{ start: 20, end: 80 }}
        step={5}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />
    ));

    const [minimum] = screen.getAllByRole("slider");
    fireEvent.keyDown(minimum, { key: "ArrowRight" });

    expect(minimum).toHaveAttribute("aria-valuenow", "25");
    expect(onChange).toHaveBeenLastCalledWith({ start: 25, end: 80 });
    expect(onChangeEnd).toHaveBeenLastCalledWith({ start: 25, end: 80 });
  });

  it("emits the pending pointer range onChangeEnd for controlled values", () => {
    const onChange = vi.fn();
    const onChangeEnd = vi.fn();
    const { container } = render(() => (
      <RangeSlider
        label="Range"
        value={{ start: 20, end: 80 }}
        onChange={onChange}
        onChangeEnd={onChangeEnd}
      />
    ));

    const track = container.querySelectorAll<HTMLElement>('[data-orientation="horizontal"]')[1];
    track.setPointerCapture = vi.fn();
    track.releasePointerCapture = vi.fn();
    vi.spyOn(track, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      left: 0,
      right: 100,
      top: 0,
      bottom: 20,
      width: 100,
      height: 20,
      toJSON: () => ({}),
    } as DOMRect);

    fireEvent.pointerDown(track, { pointerId: 1, clientX: 30 });
    fireEvent.pointerUp(track, { pointerId: 1, clientX: 30 });

    expect(onChange).toHaveBeenLastCalledWith({ start: 30, end: 80 });
    expect(onChangeEnd).toHaveBeenLastCalledWith({ start: 30, end: 80 });
  });
});
