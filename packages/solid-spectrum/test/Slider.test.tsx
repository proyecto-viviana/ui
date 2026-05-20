/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Form, Slider, SliderContext } from "../src";

describe("Slider (solid-spectrum)", () => {
  it("renders slider with value semantics", () => {
    render(() => <Slider label="Volume" value={40} minValue={0} maxValue={100} />);
    const slider = screen.getByRole("slider") as HTMLInputElement;
    expect(slider).toHaveAttribute("type", "range");
    expect(slider.value).toBe("40");
    expect(slider.min).toBe("0");
    expect(slider.max).toBe("100");
    expect(slider).toHaveAttribute("aria-valuetext", "40");
  });

  it("supports vertical orientation", () => {
    render(() => <Slider aria-label="Vertical slider" orientation="vertical" value={50} />);
    const slider = screen.getByRole("slider");
    expect(slider).toHaveAttribute("aria-orientation", "vertical");
  });

  it("supports uncontrolled defaultValue", () => {
    render(() => <Slider label="Volume" defaultValue={40} />);
    const slider = screen.getByRole("slider") as HTMLInputElement;

    expect(slider.value).toBe("40");
  });

  it("passes form input props through the hidden range input", () => {
    render(() => <Slider label="Volume" value={40} name="volume" form="audioForm" />);
    const slider = screen.getByRole("slider") as HTMLInputElement;

    expect(slider).toHaveAttribute("name", "volume");
    expect(slider).toHaveAttribute("form", "audioForm");
  });

  it("inherits form disabled state", () => {
    render(() => (
      <Form isDisabled>
        <Slider label="Volume" value={40} />
      </Form>
    ));

    expect(screen.getByRole("slider")).toBeDisabled();
  });

  it("merges SliderContext props, styles, unsafe style, and ref", () => {
    const ref = vi.fn();

    render(() => (
      <SliderContext.Provider
        value={{
          "aria-label": "Context volume",
          defaultValue: 25,
          UNSAFE_className: "context-slider",
          UNSAFE_style: { margin: "1px" },
          ref,
        }}
      >
        <Slider />
      </SliderContext.Provider>
    ));

    const slider = screen.getByRole("slider", { name: "Context volume" }) as HTMLInputElement;
    const root = slider.closest(".context-slider") as HTMLElement;
    expect(slider.value).toBe("25");
    expect(root).toHaveClass("context-slider");
    expect(root).toHaveStyle({ margin: "1px" });
    expect(ref).toHaveBeenCalledWith(root);
  });
});
