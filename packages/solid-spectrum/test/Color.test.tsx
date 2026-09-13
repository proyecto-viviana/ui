/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { ColorSlider, ColorSwatch, ColorWheel } from "../src/color";
import { parseColor } from "@proyecto-viviana/solid-stately";

describe("ColorSwatch (solid-spectrum)", () => {
  it("renders a non-interactive swatch with composed accessible name", () => {
    render(() => <ColorSwatch color="#ff0000" colorName="Fire truck red" aria-label="Preview" />);
    expect(screen.getByRole("img", { name: "Fire truck red, Preview" })).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("applies S2 size, rounding, and escape-hatch props", () => {
    render(() => (
      <ColorSwatch
        color="#00ff00"
        size="L"
        rounding="full"
        class="custom"
        UNSAFE_className="unsafe"
        UNSAFE_style={{ outline: "1px solid red" }}
        aria-label="Green"
      />
    ));

    const swatch = screen.getByRole("img", { name: /Green/ }) as HTMLElement;
    expect(swatch.className).toContain("custom");
    expect(swatch.className).toContain("unsafe");
    expect(swatch.style.outline).toBe("1px solid red");
  });

  it("renders the transparent slash when no color is provided", () => {
    render(() => <ColorSwatch aria-label="Preview" />);

    const swatch = screen.getByRole("img", { name: "transparent, Preview" }) as HTMLElement;
    const style = swatch.getAttribute("style") ?? "";
    expect(style).toContain("linear-gradient");
    expect(style).not.toContain("repeating-conic-gradient");
  });
});

describe("ColorSlider (solid-spectrum)", () => {
  it("keeps the range input mounted and focused across keyboard arrow updates", () => {
    const onChangeEnd = vi.fn();
    render(() => (
      <ColorSlider
        channel="hue"
        defaultValue={parseColor("hsl(50, 100%, 50%)")}
        label="Hue"
        onChangeEnd={onChangeEnd}
      />
    ));

    const input = screen.getByRole("slider", { name: "Hue" }) as HTMLInputElement;
    input.focus();
    expect(document.activeElement).toBe(input);
    (input as unknown as Record<string, unknown>).__fpMarker = true;

    // First ArrowRight
    fireEvent.keyDown(input, { key: "ArrowRight" });
    const inputAfterFirst = screen.getByRole("slider", { name: "Hue" }) as HTMLInputElement;
    expect(inputAfterFirst).toBe(input);
    expect((inputAfterFirst as unknown as Record<string, unknown>).__fpMarker).toBe(true);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("51");
    expect(onChangeEnd).toHaveBeenCalledTimes(1);

    // Second ArrowRight
    fireEvent.keyDown(input, { key: "ArrowRight" });
    const inputAfterSecond = screen.getByRole("slider", { name: "Hue" }) as HTMLInputElement;
    expect(inputAfterSecond).toBe(input);
    expect((inputAfterSecond as unknown as Record<string, unknown>).__fpMarker).toBe(true);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("52");
    expect(onChangeEnd).toHaveBeenCalledTimes(2);
  });
});

describe("ColorWheel (solid-spectrum)", () => {
  it("keeps the range input mounted and focused across keyboard arrow updates", () => {
    const onChangeEnd = vi.fn();
    render(() => (
      <ColorWheel
        defaultValue={parseColor("hsl(0, 100%, 50%)")}
        aria-label="Hue wheel"
        onChangeEnd={onChangeEnd}
      />
    ));

    const input = screen.getByRole("slider", { name: "Hue wheel" }) as HTMLInputElement;
    input.focus();
    expect(document.activeElement).toBe(input);
    (input as unknown as Record<string, unknown>).__fpMarker = true;

    // First ArrowRight
    fireEvent.keyDown(input, { key: "ArrowRight" });
    const inputAfterFirst = screen.getByRole("slider", { name: "Hue wheel" }) as HTMLInputElement;
    expect(inputAfterFirst).toBe(input);
    expect((inputAfterFirst as unknown as Record<string, unknown>).__fpMarker).toBe(true);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("1");
    expect(onChangeEnd).toHaveBeenCalledTimes(1);

    // Second ArrowRight
    fireEvent.keyDown(input, { key: "ArrowRight" });
    const inputAfterSecond = screen.getByRole("slider", { name: "Hue wheel" }) as HTMLInputElement;
    expect(inputAfterSecond).toBe(input);
    expect((inputAfterSecond as unknown as Record<string, unknown>).__fpMarker).toBe(true);
    expect(document.activeElement).toBe(input);
    expect(input.value).toBe("2");
    expect(onChangeEnd).toHaveBeenCalledTimes(2);
  });
});
