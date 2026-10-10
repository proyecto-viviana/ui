/**
 * @vitest-environment jsdom
 */
import { createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { Form, RangeSlider, RangeSliderContext } from "../src";

describe("RangeSlider (solid-spectrum)", () => {
  it("renders S2 range slider semantics with min/max defaults", () => {
    render(() => <RangeSlider label="Range" />);

    const group = screen.getByRole("group", { name: "Range" });
    expect(group).toBeInTheDocument();
    expect(group).not.toHaveAttribute("data-disabled");
    const sliders = screen.getAllByRole("slider");
    expect(sliders).toHaveLength(2);
    expect(sliders[0]).toHaveAttribute("aria-label", "Minimum");
    expect(sliders[1]).toHaveAttribute("aria-label", "Maximum");
    expect(sliders[0]).toHaveAttribute("aria-valuenow", "0");
    expect(sliders[1]).toHaveAttribute("aria-valuenow", "100");
    // react-stately's getFormattedValue routes a [start, end] pair through
    // Intl.NumberFormat.formatRange, whose en-US plain-number output is an
    // en-dash with NO surrounding spaces ("0–100") — matching RAC's SliderOutput
    // default child (currency ranges DO get spaces, as the controlled test below).
    expect(screen.getByText("0–100")).toBeInTheDocument();
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
    expect(startInput).toHaveAttribute("type", "range");
    expect(startInput).toHaveAttribute("form", "filters");
    expect(startInput).toHaveValue("25");
    expect(endInput).toHaveAttribute("type", "range");
    expect(endInput).toHaveAttribute("form", "filters");
    expect(endInput).toHaveValue("75");
  });

  it("stamps data-disabled on the group when isDisabled is set", () => {
    render(() => <RangeSlider label="Range" isDisabled value={{ start: 25, end: 75 }} />);

    expect(screen.getByRole("group", { name: "Range" })).toHaveAttribute("data-disabled", "true");
    expect(screen.getAllByRole("slider")[0]).toHaveAttribute("aria-disabled", "true");
    expect(screen.getAllByRole("slider")[1]).toHaveAttribute("aria-disabled", "true");
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

    expect(screen.getByRole("group", { name: "Range" })).toHaveAttribute("data-disabled", "true");
    const sliders = screen.getAllByRole("slider");
    expect(sliders[0]).toHaveAttribute("aria-disabled", "true");
    expect(sliders[1]).toHaveAttribute("aria-disabled", "true");
    expect(container.querySelector<HTMLInputElement>('input[name="minimum"]')).toBeDisabled();
    expect(container.querySelector<HTMLInputElement>('input[name="maximum"]')).toBeDisabled();
  });

  it("merges RangeSliderContext props, styles, unsafe style, and ref", () => {
    const ref = vi.fn();

    render(() => (
      <RangeSliderContext
        value={{
          "aria-label": "Context range",
          defaultValue: { start: 10, end: 30 },
          UNSAFE_className: "context-rangeslider",
          UNSAFE_style: { margin: "1px" },
          ref,
        }}
      >
        <RangeSlider />
      </RangeSliderContext>
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
  it("uses two indexed native sliders as the only successful range controls", () => {
    const { container } = render(() => (
      <>
        <form id="native-range-form" />
        <RangeSlider
          label="Range"
          defaultValue={{ start: 25, end: 75 }}
          startName="minimum"
          endName="maximum"
          form="native-range-form"
        />
      </>
    ));
    const sliders = screen.getAllByRole("slider");
    const inputs = [...container.querySelectorAll<HTMLInputElement>('input[type="range"]')];
    expect(inputs).toHaveLength(2);
    expect(sliders).toEqual(inputs);
    expect(container.querySelectorAll('input[type="hidden"]')).toHaveLength(0);
    expect(container.querySelectorAll('[role="slider"]')).toHaveLength(0);
    expect(container.querySelectorAll('[tabindex="0"]')).toHaveLength(2);
    expect(inputs[0]).toHaveAccessibleName("Minimum Range");
    expect(inputs[1]).toHaveAccessibleName("Maximum Range");
    expect(inputs[0].min).toBe("0");
    expect(inputs[0].max).toBe("75");
    expect(inputs[1].min).toBe("25");
    expect(inputs[1].max).toBe("100");
    expect(inputs[0].id).not.toBe("");
    expect(inputs[1].id).not.toBe(inputs[0].id);
    const group = screen.getByRole("group", { name: "Range" });
    expect(inputs.map((input) => input.id)).not.toContain(group.id);
    expect(container.querySelector("output")!.getAttribute("for")!.split(/\s+/)).toEqual(
      inputs.map((input) => input.id),
    );
    const values = new FormData(container.querySelector("form")!);
    expect(values.getAll("minimum")).toEqual(["25"]);
    expect(values.getAll("maximum")).toEqual(["75"]);
    inputs[1].focus();
    expect(document.activeElement).toBe(inputs[1]);
  });

  it("preserves each native thumb while controlled values and disabled state change", () => {
    const [value, setValue] = createSignal({ start: 20, end: 80 });
    const [disabled, setDisabled] = createSignal(false);
    const { container } = render(() => (
      <form>
        <RangeSlider
          label="Range"
          value={value()}
          isDisabled={disabled()}
          startName="minimum"
          endName="maximum"
        />
      </form>
    ));
    const inputs = [...container.querySelectorAll<HTMLInputElement>('input[type="range"]')];
    expect(inputs).toHaveLength(2);
    const ids = inputs.map((input) => input.id);
    inputs[0].focus();
    setValue({ start: 35, end: 65 });
    flush();
    expect(screen.getAllByRole("slider")).toEqual(inputs);
    expect(inputs.map((input) => input.id)).toEqual(ids);
    expect(inputs.map((input) => input.value)).toEqual(["35", "65"]);
    expect(inputs[0].max).toBe("65");
    expect(inputs[1].min).toBe("35");
    expect(document.activeElement).toBe(inputs[0]);
    setDisabled(true);
    flush();
    expect(inputs[0]).toBeDisabled();
    expect(inputs[1]).toBeDisabled();
    expect([...new FormData(container.querySelector("form")!).entries()]).toEqual([]);
    setDisabled(false);
    flush();
    expect(screen.getAllByRole("slider")).toEqual(inputs);
    expect(new FormData(container.querySelector("form")!).get("minimum")).toBe("35");
    expect(new FormData(container.querySelector("form")!).get("maximum")).toBe("65");
  });

  it("resets an external form to the whole default pair even above both current thumbs", async () => {
    const { container } = render(() => (
      <>
        <form id="reset-range-form" />
        <RangeSlider
          label="Range"
          defaultValue={{ start: 25, end: 75 }}
          step={5}
          startName="minimum"
          endName="maximum"
          form="reset-range-form"
        />
      </>
    ));
    const inputs = [...container.querySelectorAll<HTMLInputElement>('input[type="range"]')];
    expect(inputs).toHaveLength(2);
    fireEvent.keyDown(inputs[0], { key: "Home" });
    fireEvent.keyDown(inputs[1], { key: "Home" });
    for (let i = 0; i < 4; i++) fireEvent.keyDown(inputs[1], { key: "ArrowRight" });
    flush();
    expect(inputs.map((input) => input.value)).toEqual(["0", "20"]);
    container.querySelector("form")!.reset();
    // Reset setters run after dispatch so later listeners can prevent the reset.
    await Promise.resolve();
    flush();
    expect(inputs.map((input) => input.value)).toEqual(["25", "75"]);
    expect(screen.getAllByRole("slider")).toEqual(inputs);
    const values = new FormData(container.querySelector("form")!);
    expect(values.get("minimum")).toBe("25");
    expect(values.get("maximum")).toBe("75");
  });
});
