/**
 * @vitest-environment jsdom
 */
import { createSignal, flush } from "solid-js";
import { describe, expect, it } from "vite-plus/test";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { Form, RangeSlider } from "../src";

describe("RangeSlider (viviana-ui)", () => {
  it("omits data-disabled on an enabled group", () => {
    render(() => <RangeSlider label="Range" />);

    expect(screen.getByRole("group", { name: "Range" })).not.toHaveAttribute("data-disabled");
  });

  it("stamps data-disabled on the group when isDisabled is set", () => {
    render(() => <RangeSlider label="Range" isDisabled value={{ start: 25, end: 75 }} />);

    expect(screen.getByRole("group", { name: "Range" })).toHaveAttribute("data-disabled", "true");
    expect(screen.getAllByRole("slider")[0]).toHaveAttribute("aria-disabled", "true");
    expect(screen.getAllByRole("slider")[1]).toHaveAttribute("aria-disabled", "true");
  });

  it("stamps data-disabled when the parent form is disabled", () => {
    render(() => (
      <Form isDisabled>
        <RangeSlider label="Range" value={{ start: 25, end: 75 }} />
      </Form>
    ));

    expect(screen.getByRole("group", { name: "Range" })).toHaveAttribute("data-disabled", "true");
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
