/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Slider } from "../src/slider";

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
});
