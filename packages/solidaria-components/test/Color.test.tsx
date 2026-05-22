/**
 * Color component tests
 *
 * Tests for ColorSlider, ColorArea, ColorWheel, ColorField, and ColorSwatch.
 */

import { describe, it, expect, afterEach, vi } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@solidjs/testing-library";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { createSignal } from "solid-js";
import {
  ColorSlider,
  ColorSliderLabel,
  ColorSliderOutput,
  ColorSliderTrack,
  ColorSliderThumb,
  ColorArea,
  ColorAreaGradient,
  ColorAreaThumb,
  ColorWheel,
  ColorWheelTrack,
  ColorWheelThumb,
  ColorField,
  ColorFieldInput,
  ColorSwatch,
  ColorPicker,
  ColorSwatchPicker,
  ColorSwatchPickerItem,
} from "../src/Color";
import { parseColor } from "@proyecto-viviana/solid-stately";
import { I18nProvider } from "@proyecto-viviana/solidaria";

// Helper components using render props pattern
function TestColorSlider(props: Parameters<typeof ColorSlider>[0]) {
  return (
    <ColorSlider {...props}>
      {() => (
        <>
          {props.label != null && <ColorSliderLabel>{props.label}</ColorSliderLabel>}
          <ColorSliderOutput />
          <ColorSliderTrack>{() => <ColorSliderThumb />}</ColorSliderTrack>
        </>
      )}
    </ColorSlider>
  );
}

function TestColorArea(props: Parameters<typeof ColorArea>[0]) {
  return (
    <ColorArea {...props}>
      {() => (
        <>
          <ColorAreaGradient />
          <ColorAreaThumb />
        </>
      )}
    </ColorArea>
  );
}

function TestColorWheel(props: Parameters<typeof ColorWheel>[0]) {
  return (
    <ColorWheel {...props}>
      {() => <ColorWheelTrack>{() => <ColorWheelThumb />}</ColorWheelTrack>}
    </ColorWheel>
  );
}

function TestColorField(props: Parameters<typeof ColorField>[0]) {
  return <ColorField {...props}>{() => <ColorFieldInput />}</ColorField>;
}

function TestColorSwatchPicker(props: Parameters<typeof ColorSwatchPicker>[0]) {
  return (
    <ColorSwatchPicker {...props}>
      <ColorSwatchPickerItem color="#ff0000" />
      <ColorSwatchPickerItem color="#00ff00" />
      <ColorSwatchPickerItem color="#0000ff" />
    </ColorSwatchPicker>
  );
}

function TestColorSwatchPickerFourItems(props: Parameters<typeof ColorSwatchPicker>[0]) {
  return (
    <ColorSwatchPicker {...props}>
      <ColorSwatchPickerItem color="#ff0000" />
      <ColorSwatchPickerItem color="#00ff00" />
      <ColorSwatchPickerItem color="#0000ff" />
      <ColorSwatchPickerItem color="#ffff00" />
    </ColorSwatchPicker>
  );
}

function createMockRect(x: number, y: number, size = 16): DOMRect {
  return {
    x,
    y,
    width: size,
    height: size,
    top: y,
    left: x,
    right: x + size,
    bottom: y + size,
    toJSON() {
      return {};
    },
  } as DOMRect;
}

function mockGridOptionRects(options: HTMLElement[], columns: number) {
  const size = 16;
  const gap = 4;
  options.forEach((option, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const x = column * (size + gap);
    const y = row * (size + gap);
    Object.defineProperty(option, "getBoundingClientRect", {
      configurable: true,
      value: () => createMockRect(x, y, size),
    });
  });
}

describe("Color Components", () => {
  afterEach(() => {
    cleanup();
  });

  // ============================================
  // COLOR SLIDER
  // ============================================

  describe("ColorSlider", () => {
    describe("rendering", () => {
      it("should render with default class", () => {
        render(() => (
          <TestColorSlider
            channel="hue"
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            aria-label="Hue"
          />
        ));

        const slider = document.querySelector(".solidaria-ColorSlider");
        expect(slider).toBeTruthy();
      });

      it("should render with custom class", () => {
        render(() => (
          <TestColorSlider
            channel="hue"
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            aria-label="Hue"
            class="custom-slider"
          />
        ));

        const slider = document.querySelector(".custom-slider");
        expect(slider).toBeTruthy();
      });

      it("should render track and thumb elements", () => {
        render(() => (
          <TestColorSlider
            channel="hue"
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            aria-label="Hue"
          />
        ));

        const track = document.querySelector(".solidaria-ColorSlider-track");
        const thumb = document.querySelector(".solidaria-ColorSlider-thumb");
        expect(track).toBeTruthy();
        expect(thumb).toBeTruthy();
      });

      it("should render with label", () => {
        render(() => (
          <TestColorSlider
            channel="hue"
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            label="Hue"
          />
        ));

        expect(screen.getByText("Hue")).toBeTruthy();
      });

      it("should wire visible label and output to the group and range input", () => {
        render(() => (
          <TestColorSlider
            channel="hue"
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            label="Hue"
          />
        ));

        const label = screen.getByText("Hue");
        const group = screen.getByRole("group", { name: "Hue" });
        const input = screen.getByRole("slider", { name: "Hue" });
        const output = document.querySelector("output");

        expect(label.id).toBeTruthy();
        expect(group).toHaveAttribute("aria-labelledby", label.id);
        expect(input).toHaveAttribute("aria-labelledby", label.id);
        expect(output).toHaveAttribute("for", input.id);
        expect(output).toHaveTextContent(/0/);
      });

      it("should provide the default channel name when no visible or explicit label is supplied", () => {
        render(() => (
          <TestColorSlider channel="hue" defaultValue={parseColor("hsl(0, 100%, 50%)")} />
        ));

        expect(screen.getByRole("group", { name: "Hue" })).toBeTruthy();
        expect(screen.getByRole("slider", { name: "Hue" })).toBeTruthy();
      });

      it("should propagate form and description props to the hidden range input", () => {
        render(() => (
          <>
            <p id="hue-hint">Adjust hue.</p>
            <p id="hue-details">Hue details.</p>
            <TestColorSlider
              id="favorite-hue"
              channel="hue"
              defaultValue={parseColor("hsl(0, 100%, 50%)")}
              label="Hue"
              name="hueChannel"
              form="colorForm"
              aria-describedby="hue-hint"
              aria-details="hue-details"
            />
          </>
        ));

        const group = screen.getByRole("group", { name: "Hue" });
        const input = screen.getByRole("slider", { name: "Hue" });

        expect(group).toHaveAttribute("id", "favorite-hue");
        expect(group).not.toHaveAttribute("aria-describedby");
        expect(group).not.toHaveAttribute("aria-details");
        expect(input).toHaveAttribute("name", "hueChannel");
        expect(input).toHaveAttribute("form", "colorForm");
        expect(input).toHaveAttribute("aria-describedby", "hue-hint");
        expect(input).toHaveAttribute("aria-details", "hue-details");
      });
    });

    describe("data attributes", () => {
      it("should match React Aria root data attributes", () => {
        render(() => (
          <TestColorSlider
            channel="saturation"
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            aria-label="Saturation"
          />
        ));

        const slider = document.querySelector(".solidaria-ColorSlider");
        expect(slider?.getAttribute("data-orientation")).toBe("horizontal");
        expect(slider).not.toHaveAttribute("data-channel");
      });

      it("should have data-disabled when disabled", () => {
        render(() => (
          <TestColorSlider
            channel="hue"
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            aria-label="Hue"
            isDisabled
          />
        ));

        const slider = document.querySelector(".solidaria-ColorSlider");
        expect(slider?.getAttribute("data-disabled")).toBe("true");
      });
    });

    describe("different channels", () => {
      it("should work with hue channel", () => {
        render(() => (
          <TestColorSlider
            channel="hue"
            defaultValue={parseColor("hsl(180, 100%, 50%)")}
            aria-label="Hue"
          />
        ));

        const slider = screen.getByRole("slider", { name: "Hue" });
        expect(slider).toHaveAttribute("max", "360");
      });

      it("should work with saturation channel", () => {
        render(() => (
          <TestColorSlider
            channel="saturation"
            defaultValue={parseColor("hsl(0, 50%, 50%)")}
            aria-label="Saturation"
          />
        ));

        const slider = screen.getByRole("slider", { name: "Saturation" });
        expect(slider).toHaveAttribute("max", "100");
      });

      it("should work with lightness channel", () => {
        render(() => (
          <TestColorSlider
            channel="lightness"
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            aria-label="Lightness"
          />
        ));

        const slider = screen.getByRole("slider", { name: "Lightness" });
        expect(slider).toHaveAttribute("max", "100");
      });

      it("should work with alpha channel", () => {
        render(() => (
          <TestColorSlider
            channel="alpha"
            defaultValue={parseColor("hsla(0, 100%, 50%, 0.5)")}
            aria-label="Alpha"
          />
        ));

        const slider = screen.getByRole("slider", { name: "Alpha" });
        expect(slider).toHaveAttribute("max", "1");
      });
    });

    describe("interaction", () => {
      it("should place hidden input inside thumb for focus handling", () => {
        render(() => (
          <TestColorSlider
            channel="hue"
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            aria-label="Hue"
          />
        ));

        const thumb = document.querySelector(".solidaria-ColorSlider-thumb");
        expect(thumb?.querySelector('input[type="range"]')).toBeTruthy();
      });

      it("should call onChangeEnd when dragging ends", () => {
        const onChangeEnd = vi.fn();
        render(() => (
          <TestColorSlider
            channel="hue"
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            aria-label="Hue"
            onChangeEnd={onChangeEnd}
          />
        ));

        const track = screen.getByRole("group", { name: "Hue" });
        Object.defineProperty(track, "getBoundingClientRect", {
          configurable: true,
          value: () => ({ ...createMockRect(0, 0, 360), height: 24, bottom: 24 }),
        });

        fireEvent.mouseDown(track, { clientX: 180, clientY: 12 });
        fireEvent.mouseUp(window, { clientX: 180, clientY: 12 });
        expect(onChangeEnd).toHaveBeenCalledTimes(1);
      });

      it("should expose hue and color names in aria-valuetext", () => {
        render(() => (
          <TestColorSlider
            channel="hue"
            defaultValue={parseColor("hsl(240, 100%, 50%)")}
            aria-label="Hue"
          />
        ));

        expect(screen.getByRole("slider", { name: "Hue" })).toHaveAttribute(
          "aria-valuetext",
          expect.stringMatching(/blue/i),
        );

        cleanup();

        render(() => (
          <TestColorSlider
            channel="saturation"
            defaultValue={parseColor("hsl(240, 50%, 50%)")}
            aria-label="Saturation"
          />
        ));

        expect(screen.getByRole("slider", { name: "Saturation" })).toHaveAttribute(
          "aria-valuetext",
          expect.stringMatching(/blue/i),
        );
      });

      it("should map vertical pointer movement from bottom to top", async () => {
        const onChange = vi.fn();
        render(() => (
          <TestColorSlider
            channel="brightness"
            colorSpace="hsb"
            defaultValue={parseColor("hsb(0, 50%, 50%)")}
            orientation="vertical"
            aria-label="Brightness"
            onChange={onChange}
          />
        ));

        const slider = document.querySelector(".solidaria-ColorSlider") as HTMLElement;
        const track = screen.getByRole("group", { name: "Brightness" });
        const thumb = document.querySelector(".solidaria-ColorSlider-thumb") as HTMLElement;
        const input = screen.getByRole("slider", { name: "Brightness" });

        expect(slider).toHaveAttribute("data-orientation", "vertical");
        expect(track).toHaveAttribute("data-orientation", "vertical");
        expect(input).toHaveAttribute("aria-orientation", "vertical");
        expect((track as HTMLElement).style.background).toContain("to top");
        expect(thumb.style.top).toBe("50%");

        Object.defineProperty(track, "getBoundingClientRect", {
          configurable: true,
          value: () => ({ ...createMockRect(0, 0, 24), height: 100, bottom: 100 }),
        });

        fireEvent.pointerDown(track, { clientX: 12, clientY: 25, pointerId: 1 });
        fireEvent.pointerUp(window, { clientX: 12, clientY: 25, pointerId: 1 });

        await waitFor(() => {
          const changedColor = onChange.mock.lastCall?.[0];
          expect(changedColor.getChannelValue("brightness")).toBe(75);
        });
      });

      it("should flip horizontal gradient, thumb placement, pointer, and keyboard in RTL", async () => {
        const user = setupUser();
        const onChange = vi.fn();
        render(() => (
          <I18nProvider locale="ar-AE">
            <TestColorSlider
              channel="red"
              colorSpace="rgb"
              defaultValue={parseColor("rgb(100, 0, 0)")}
              aria-label="Red"
              onChange={onChange}
            />
          </I18nProvider>
        ));

        const track = screen.getByRole("group", { name: "Red" });
        const thumb = document.querySelector(".solidaria-ColorSlider-thumb") as HTMLElement;

        expect((track as HTMLElement).style.background).toContain("to left");
        expect(thumb.style.left).toBe(`${(1 - 100 / 255) * 100}%`);

        Object.defineProperty(track, "getBoundingClientRect", {
          configurable: true,
          value: () => ({ ...createMockRect(0, 0, 255), height: 24, bottom: 24 }),
        });

        fireEvent.pointerDown(track, { clientX: 0, clientY: 12, pointerId: 1 });
        fireEvent.pointerUp(window, { clientX: 0, clientY: 12, pointerId: 1 });

        await waitFor(() => {
          const changedColor = onChange.mock.lastCall?.[0];
          expect(changedColor.getChannelValue("red")).toBe(255);
        });

        const currentInput = screen.getByRole("slider", { name: "Red" });
        expect(document.activeElement).toBe(currentInput);
        await user.keyboard("{ArrowRight}");

        await waitFor(() => {
          const changedColor = onChange.mock.lastCall?.[0];
          expect(changedColor.getChannelValue("red")).toBe(254);
        });
      });
    });
  });

  // ============================================
  // COLOR AREA
  // ============================================

  describe("ColorArea", () => {
    describe("rendering", () => {
      it("should render with default class", () => {
        render(() => (
          <TestColorArea defaultValue={parseColor("hsl(0, 100%, 50%)")} aria-label="Color picker" />
        ));

        const area = document.querySelector(".solidaria-ColorArea");
        expect(area).toBeTruthy();
      });

      it("should render with custom class", () => {
        render(() => (
          <TestColorArea
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            aria-label="Color picker"
            class="custom-area"
          />
        ));

        const area = document.querySelector(".custom-area");
        expect(area).toBeTruthy();
      });

      it("should render gradient and thumb elements", () => {
        render(() => (
          <TestColorArea defaultValue={parseColor("hsl(0, 100%, 50%)")} aria-label="Color picker" />
        ));

        const gradient = document.querySelector(".solidaria-ColorArea-gradient");
        const thumb = document.querySelector(".solidaria-ColorArea-thumb");
        expect(gradient).toBeTruthy();
        expect(thumb).toBeTruthy();
      });
    });

    describe("data attributes", () => {
      it("should have data-disabled when disabled", () => {
        render(() => (
          <TestColorArea
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            aria-label="Color picker"
            isDisabled
          />
        ));

        const area = document.querySelector(".solidaria-ColorArea");
        expect(area?.getAttribute("data-disabled")).toBe("true");
      });
    });

    describe("channels", () => {
      it("should support xChannel and yChannel props", () => {
        render(() => (
          <TestColorArea
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            aria-label="Color picker"
            xChannel="saturation"
            yChannel="lightness"
          />
        ));

        const area = document.querySelector(".solidaria-ColorArea");
        expect(area).toBeTruthy();
      });

      it("should forward ARIA, slot, and hidden range form props", () => {
        render(() => (
          <>
            <form id="colorForm" />
            <TestColorArea
              defaultValue={parseColor("#9B80FF")}
              colorSpace="rgb"
              aria-label="Color picker"
              aria-describedby="color-help"
              aria-details="color-details"
              id="favorite-color"
              slot="color"
              xChannel="red"
              yChannel="green"
              xName="redChannel"
              yName="greenChannel"
              form="colorForm"
            />
          </>
        ));

        const area = screen.getByRole("group", { name: "Color picker, Color picker" });
        expect(area).toHaveAttribute("id", "favorite-color");
        expect(area).toHaveAttribute("slot", "color");
        expect(area).not.toHaveAttribute("aria-describedby");
        expect(area).not.toHaveAttribute("aria-details");

        const inputs = Array.from(area.querySelectorAll<HTMLInputElement>('input[type="range"]'));
        expect(inputs).toHaveLength(2);
        expect(inputs[0]).toHaveAttribute("name", "redChannel");
        expect(inputs[1]).toHaveAttribute("name", "greenChannel");
        expect(inputs[0]).toHaveAttribute("form", "colorForm");
        expect(inputs[1]).toHaveAttribute("form", "colorForm");
        expect(inputs[0]).toHaveAttribute("aria-label", "Color picker, Color picker");
        expect(inputs[0]).toHaveAttribute("aria-roledescription", "2D slider");
        expect(inputs[0]).toHaveAttribute("aria-orientation", "horizontal");
        expect(inputs[0]).toHaveAttribute("aria-describedby", "color-help");
        expect(inputs[0]).toHaveAttribute("aria-details", "color-details");
        expect(inputs[1]).toHaveAttribute("aria-label", "Color picker, Color picker");
        expect(inputs[1]).toHaveAttribute("aria-orientation", "vertical");
        expect(inputs[1]).toHaveAttribute("aria-describedby", "color-help");
        expect(inputs[1]).toHaveAttribute("aria-details", "color-details");
        expect(inputs[1]).toHaveAttribute("aria-hidden", "true");
      });

      it("should apply the generated area gradient on the root", () => {
        render(() => (
          <TestColorArea
            defaultValue={parseColor("#9B80FF")}
            colorSpace="rgb"
            aria-label="Color picker"
            xChannel="red"
            yChannel="green"
          />
        ));

        const area = screen.getByRole("group", { name: "Color picker, Color picker" });
        expect(area).toHaveStyle({ "touch-action": "none" });
        expect((area as HTMLElement).style.backgroundImage).toContain("linear-gradient(to right");
        expect((area as HTMLElement).style.backgroundColor).toBe("rgb(0, 0, 255)");
        expect((area as HTMLElement).style.backgroundBlendMode).toBe("screen");
      });

      it("should preserve the generated area gradient when disabled", () => {
        render(() => (
          <TestColorArea
            defaultValue={parseColor("#9B80FF")}
            colorSpace="rgb"
            aria-label="Color picker"
            xChannel="red"
            yChannel="green"
            isDisabled
          />
        ));

        const area = screen.getByRole("group", { name: "Color picker, Color picker" });
        expect(area).toHaveAttribute("data-disabled", "true");
        expect(area).not.toHaveAttribute("aria-disabled");
        expect((area as HTMLElement).style.backgroundImage).toContain("linear-gradient(to right");
        expect((area as HTMLElement).style.backgroundColor).toBe("rgb(0, 0, 255)");
        expect((area as HTMLElement).style.backgroundBlendMode).toBe("screen");
      });

      it("should update the focused horizontal input from keyboard events", async () => {
        const onChange = vi.fn();
        const [value, setValue] = createSignal(parseColor("rgb(100, 0, 0)"));
        render(() => (
          <TestColorArea
            value={value()}
            colorSpace="rgb"
            aria-label="Color picker"
            xChannel="red"
            yChannel="green"
            onChange={(color) => {
              onChange(color);
              setValue(color);
            }}
          />
        ));

        const area = screen.getByRole("group", { name: "Color picker, Color picker" });
        const input = area.querySelector<HTMLInputElement>(
          'input[type="range"]',
        ) as HTMLInputElement;

        input.focus();
        fireEvent.keyDown(input, { key: "ArrowRight" });

        await waitFor(() => {
          const changedColor = onChange.mock.lastCall?.[0];
          expect(changedColor.getChannelValue("red")).toBe(101);
          const currentInput = area.querySelector<HTMLInputElement>('input[type="range"]');
          expect(currentInput).toBe(input);
          expect(currentInput?.value).toBe("101");
        });
      });

      it("should update from pointer interaction and call onChangeEnd with the settled value", async () => {
        const onChange = vi.fn();
        const onChangeEnd = vi.fn();
        render(() => (
          <TestColorArea
            defaultValue={parseColor("rgb(0, 0, 0)")}
            colorSpace="rgb"
            aria-label="Color picker"
            xChannel="red"
            yChannel="green"
            onChange={onChange}
            onChangeEnd={onChangeEnd}
          />
        ));

        const area = screen.getByRole("group", { name: "Color picker, Color picker" });
        Object.defineProperty(area, "getBoundingClientRect", {
          configurable: true,
          value: () => createMockRect(0, 0, 100),
        });

        fireEvent.pointerDown(area, { clientX: 50, clientY: 50, pointerId: 1 });
        fireEvent.pointerMove(area, { clientX: 100, clientY: 0, pointerId: 1 });
        fireEvent.pointerUp(area, { clientX: 100, clientY: 0, pointerId: 1 });

        await waitFor(() => {
          expect(onChange).toHaveBeenCalled();
          const changedColor = onChange.mock.lastCall?.[0];
          expect(changedColor.getChannelValue("red")).toBe(255);
          expect(changedColor.getChannelValue("green")).toBe(255);
          expect(onChangeEnd).toHaveBeenCalled();
          const settledColor = onChangeEnd.mock.lastCall?.[0];
          expect(settledColor.getChannelValue("red")).toBe(255);
          expect(settledColor.getChannelValue("green")).toBe(255);
        });
      });

      it("should flip horizontal keyboard and thumb behavior in RTL", async () => {
        const onChange = vi.fn();
        render(() => (
          <I18nProvider locale="ar-AE">
            <TestColorArea
              defaultValue={parseColor("rgb(100, 0, 0)")}
              colorSpace="rgb"
              aria-label="Color picker"
              xChannel="red"
              yChannel="green"
              onChange={onChange}
            />
          </I18nProvider>
        ));

        const area = screen.getByRole("group", { name: "Color picker, Color picker" });
        const thumb = document.querySelector(".solidaria-ColorArea-thumb") as HTMLElement;
        const input = area.querySelector<HTMLInputElement>(
          'input[type="range"]',
        ) as HTMLInputElement;

        expect((area as HTMLElement).style.backgroundImage).toContain("linear-gradient(to left");
        expect(thumb.style.left).toBe(`${(1 - 100 / 255) * 100}%`);

        input.focus();
        fireEvent.keyDown(input, { key: "ArrowRight" });

        await waitFor(() => {
          const changedColor = onChange.mock.lastCall?.[0];
          expect(changedColor.getChannelValue("red")).toBe(99);
        });
      });
    });
  });

  // ============================================
  // COLOR WHEEL
  // ============================================

  describe("ColorWheel", () => {
    describe("rendering", () => {
      it("should render with default class", () => {
        render(() => (
          <TestColorWheel defaultValue={parseColor("hsl(0, 100%, 50%)")} aria-label="Hue wheel" />
        ));

        const wheel = document.querySelector(".solidaria-ColorWheel");
        expect(wheel).toBeTruthy();
      });

      it("should render with custom class", () => {
        render(() => (
          <TestColorWheel
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            aria-label="Hue wheel"
            class="custom-wheel"
          />
        ));

        const wheel = document.querySelector(".custom-wheel");
        expect(wheel).toBeTruthy();
      });

      it("should render track and thumb elements", () => {
        render(() => (
          <TestColorWheel defaultValue={parseColor("hsl(0, 100%, 50%)")} aria-label="Hue wheel" />
        ));

        const track = document.querySelector(".solidaria-ColorWheel-track");
        const thumb = document.querySelector(".solidaria-ColorWheel-thumb");
        expect(track).toBeTruthy();
        expect(thumb).toBeTruthy();
      });
    });

    describe("data attributes", () => {
      it("should have data-disabled when disabled", () => {
        render(() => (
          <TestColorWheel
            defaultValue={parseColor("hsl(0, 100%, 50%)")}
            aria-label="Hue wheel"
            isDisabled
          />
        ));

        const wheel = document.querySelector(".solidaria-ColorWheel");
        expect(wheel?.getAttribute("data-disabled")).toBe("true");
      });
    });
  });

  // ============================================
  // COLOR FIELD
  // ============================================

  describe("ColorField", () => {
    describe("rendering", () => {
      it("should render with default class", () => {
        render(() => <TestColorField defaultValue={parseColor("#ff0000")} aria-label="Color" />);

        const field = document.querySelector(".solidaria-ColorField");
        expect(field).toBeTruthy();
      });

      it("should render with custom class", () => {
        render(() => (
          <TestColorField
            defaultValue={parseColor("#ff0000")}
            aria-label="Color"
            class="custom-field"
          />
        ));

        const field = document.querySelector(".custom-field");
        expect(field).toBeTruthy();
      });

      it("should render input element", () => {
        render(() => <TestColorField defaultValue={parseColor("#ff0000")} aria-label="Color" />);

        const input = document.querySelector(".solidaria-ColorField-input");
        expect(input).toBeTruthy();
      });

      it("should render with label", () => {
        render(() => <TestColorField defaultValue={parseColor("#ff0000")} label="Color Value" />);

        expect(screen.getByText("Color Value")).toBeTruthy();
        const input = screen.getByRole("textbox", { name: "Color Value" });
        const label = screen.getByText("Color Value");
        expect(input).toBeTruthy();
        expect(input).toHaveAttribute("aria-labelledby", label.id);
        expect(input).not.toHaveAttribute("aria-label");
      });
    });

    describe("data attributes", () => {
      it("should have data-disabled when disabled", () => {
        render(() => (
          <TestColorField defaultValue={parseColor("#ff0000")} aria-label="Color" isDisabled />
        ));

        const field = document.querySelector(".solidaria-ColorField");
        expect(field?.getAttribute("data-disabled")).toBe("true");
      });

      it("should have data-readonly when read-only", () => {
        render(() => (
          <TestColorField defaultValue={parseColor("#ff0000")} aria-label="Color" isReadOnly />
        ));

        const field = document.querySelector(".solidaria-ColorField");
        expect(field?.getAttribute("data-readonly")).toBe("true");
      });

      it("should expose channel and required data attributes", () => {
        render(() => (
          <TestColorField
            defaultValue={parseColor("#ff0000")}
            aria-label="Red"
            channel="red"
            isRequired
          />
        ));

        const field = document.querySelector(".solidaria-ColorField");
        expect(field?.getAttribute("data-channel")).toBe("red");
        expect(field?.getAttribute("data-required")).toBe("true");
      });
    });

    describe("channel mode", () => {
      it("should support single channel mode", () => {
        render(() => (
          <TestColorField
            defaultValue={parseColor("hsl(180, 100%, 50%)")}
            aria-label="Hue"
            channel="hue"
          />
        ));

        const field = document.querySelector(".solidaria-ColorField");
        expect(field).toBeTruthy();
        const input = screen.getByRole("textbox", { name: "Hue" });
        expect(input).not.toHaveAttribute("role");
        expect(input).not.toHaveAttribute("aria-valuemin");
        expect(input).not.toHaveAttribute("aria-valuemax");
      });

      it("should submit channel mode with a hidden input", () => {
        render(() => (
          <TestColorField
            defaultValue={parseColor("rgb(128, 64, 32)")}
            aria-label="Red"
            channel="red"
            name="red"
            form="color-form"
          />
        ));

        const hidden = document.querySelector('input[type="hidden"][name="red"]');
        expect(hidden).toHaveAttribute("form", "color-form");
        expect(hidden).toHaveValue("128");
        expect(
          document.querySelector(".solidaria-ColorField")?.querySelector('input[type="hidden"]'),
        ).toBeNull();

        const input = screen.getByRole("textbox", { name: "Red" });
        expect(input).not.toHaveAttribute("name");
        expect(input).not.toHaveAttribute("form");
      });

      it("should update visible and hidden channel values after keyboard increments", () => {
        let changed = "";
        render(() => (
          <TestColorField
            defaultValue={parseColor("rgb(128, 64, 32)")}
            aria-label="Red"
            channel="red"
            name="red"
            onChange={(color) => {
              changed = color == null ? "" : String(color.getChannelValue("red"));
            }}
          />
        ));

        const input = screen.getByRole("textbox", { name: "Red" });
        fireEvent.keyDown(input, { key: "ArrowUp" });

        expect(changed).toBe("129");
        expect(input).toHaveValue("129");
        expect(document.querySelector('input[type="hidden"][name="red"]')).toHaveValue("129");
      });
    });

    describe("interactions", () => {
      it("should filter invalid partial hex input", () => {
        render(() => <TestColorField defaultValue={parseColor("#ff0000")} aria-label="Color" />);

        const input = screen.getByRole("textbox", { name: "Color" }) as HTMLInputElement;
        fireEvent.input(input, { target: { value: "#0a" } });
        expect(input.value).toBe("#0a");

        fireEvent.input(input, { target: { value: "#0az" } });
        expect(input.value).toBe("#0a");
      });

      it("should increment hex values with the keyboard", () => {
        let changed = "";
        render(() => (
          <TestColorField
            defaultValue={parseColor("#000000")}
            aria-label="Color"
            onChange={(color) => {
              changed = color?.toString("hex") ?? "";
            }}
          />
        ));

        const input = screen.getByRole("textbox", { name: "Color" });
        fireEvent.keyDown(input, { key: "ArrowUp" });
        expect(changed).toBe("#000001");
      });

      it("should support native and aria required validation modes", () => {
        const { unmount } = render(() => (
          <TestColorField defaultValue={parseColor("#ff0000")} aria-label="Color" isRequired />
        ));
        expect(screen.getByRole("textbox", { name: "Color" })).toHaveAttribute("required");
        unmount();

        render(() => (
          <TestColorField
            defaultValue={parseColor("#ff0000")}
            aria-label="Color"
            isRequired
            validationBehavior="aria"
          />
        ));
        expect(screen.getByRole("textbox", { name: "Color" })).toHaveAttribute(
          "aria-required",
          "true",
        );
      });
    });
  });

  // ============================================
  // COLOR SWATCH
  // ============================================

  describe("ColorSwatch", () => {
    describe("rendering", () => {
      it("should render with default class", () => {
        render(() => <ColorSwatch color="#ff0000" aria-label="Red" />);

        const swatch = document.querySelector(".solidaria-ColorSwatch");
        expect(swatch).toBeTruthy();
      });

      it("should render with custom class", () => {
        render(() => <ColorSwatch color="#ff0000" aria-label="Red" class="custom-swatch" />);

        const swatch = document.querySelector(".custom-swatch");
        expect(swatch).toBeTruthy();
      });

      it("should render with Color object", () => {
        render(() => <ColorSwatch color={parseColor("#00ff00")} aria-label="Green" />);

        const swatch = document.querySelector(".solidaria-ColorSwatch");
        expect(swatch).toBeTruthy();
      });
    });

    describe("color formats", () => {
      it("should render with hex color", () => {
        render(() => <ColorSwatch color="#0000ff" aria-label="Blue" />);

        const swatch = document.querySelector(".solidaria-ColorSwatch");
        expect(swatch).toBeTruthy();
      });

      it("should render with rgb color", () => {
        render(() => <ColorSwatch color="rgb(255, 128, 0)" aria-label="Orange" />);

        const swatch = document.querySelector(".solidaria-ColorSwatch");
        expect(swatch).toBeTruthy();
      });

      it("should render with hsl color", () => {
        render(() => <ColorSwatch color="hsl(270, 100%, 50%)" aria-label="Purple" />);

        const swatch = document.querySelector(".solidaria-ColorSwatch");
        expect(swatch).toBeTruthy();
      });

      it("should render with hsla color (with alpha)", () => {
        render(() => (
          <ColorSwatch color="hsla(180, 100%, 50%, 0.5)" aria-label="Cyan transparent" />
        ));

        const swatch = document.querySelector(".solidaria-ColorSwatch");
        expect(swatch).toBeTruthy();
      });

      it("should compose color name and aria label", () => {
        render(() => (
          <ColorSwatch color="#ff0000" colorName="Fire truck red" aria-label="Background color" />
        ));

        const swatch = screen.getByRole("img", {
          name: "Fire truck red, Background color",
        }) as HTMLElement;
        expect(swatch.style.backgroundColor).toBe("rgb(255, 0, 0)");
        expect(swatch.style.forcedColorAdjust).toBe("none");
      });

      it("should render a transparent fallback when no color is provided", () => {
        render(() => <ColorSwatch />);

        expect(screen.getByRole("img", { name: "transparent" })).toBeTruthy();
      });

      it("should forward id and ARIA reference props", () => {
        render(() => (
          <ColorSwatch
            color="#ff0000"
            id="swatch-id"
            slot="color"
            aria-labelledby="external-label"
            aria-describedby="desc-id"
            aria-details="details-id"
          />
        ));

        const swatch = document.querySelector(".solidaria-ColorSwatch") as HTMLElement;
        expect(swatch).toHaveAttribute("id", "swatch-id");
        expect(swatch).toHaveAttribute("slot", "color");
        expect(swatch).toHaveAttribute("aria-labelledby", "swatch-id external-label");
        expect(swatch).toHaveAttribute("aria-describedby", "desc-id");
        expect(swatch).toHaveAttribute("aria-details", "details-id");
      });
    });

    describe("render props", () => {
      it("should support render props children", () => {
        render(() => (
          <ColorSwatch color="#ff0000" aria-label="Red">
            {(props) => <span data-testid="color-value">{props.colorValue}</span>}
          </ColorSwatch>
        ));

        const value = screen.getByTestId("color-value");
        expect(value).toBeTruthy();
        // Should contain a CSS color value
        expect(value.textContent).toBeTruthy();
      });
    });
  });

  // ============================================
  // COLOR PICKER
  // ============================================

  describe("ColorPicker", () => {
    it("should provide color context to child swatches", async () => {
      const [value, setValue] = createSignal(parseColor("#ff0000"));
      render(() => (
        <ColorPicker value={value()}>
          {() => <ColorSwatch aria-label="Current color" />}
        </ColorPicker>
      ));

      const swatch = screen.getByRole("img", { name: /Current color/ });
      expect((swatch as HTMLElement).style.backgroundColor).toBe("rgb(255, 0, 0)");

      setValue(parseColor("#00ff00"));

      await waitFor(() => {
        const updatedSwatch = screen.getByRole("img", { name: /Current color/ });
        expect((updatedSwatch as HTMLElement).style.backgroundColor).toBe("rgb(0, 255, 0)");
      });
    });
  });

  // ============================================
  // COLOR SWATCH PICKER
  // ============================================

  describe("ColorSwatchPicker", () => {
    it("should render with listbox semantics", () => {
      render(() => <TestColorSwatchPicker />);

      const listbox = screen.getByRole("listbox", { name: /color swatch picker/i });
      expect(listbox).toBeTruthy();
      expect(screen.getAllByRole("option")).toHaveLength(3);
    });

    it("should expose layout data attribute", () => {
      render(() => <TestColorSwatchPicker layout="stack" aria-label="Palette" />);

      const listbox = screen.getByRole("listbox", { name: "Palette" });
      expect(listbox.getAttribute("data-layout")).toBe("stack");
    });

    it("should forward DOM, slot, and ARIA description props to the listbox", () => {
      render(() => (
        <TestColorSwatchPicker
          id="palette"
          slot="swatches"
          aria-label="Palette"
          aria-describedby="palette-desc"
          aria-details="palette-details"
        />
      ));

      const listbox = screen.getByRole("listbox", { name: "Palette" });
      expect(listbox).toHaveAttribute("id", "palette");
      expect(listbox).toHaveAttribute("slot", "swatches");
      expect(listbox).toHaveAttribute("aria-describedby", "palette-desc");
      expect(listbox).toHaveAttribute("aria-details", "palette-details");
    });

    it("should select the matching defaultValue", () => {
      render(() => <TestColorSwatchPicker defaultValue="#0000ff" aria-label="Palette" />);

      const options = screen.getAllByRole("option");
      expect(options[2]).toHaveAttribute("aria-selected", "true");
    });

    it("should call onChange with selected color on click", () => {
      const onChange = vi.fn();
      render(() => <TestColorSwatchPicker onChange={onChange} aria-label="Palette" />);

      const options = screen.getAllByRole("option");
      fireEvent.click(options[1]!);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0]?.[0]?.toString("hexa")).toBe("#00ff00ff");
    });

    it("should keep controlled selection stable until the value changes", async () => {
      const onChange = vi.fn();
      const [value, setValue] = createSignal(parseColor("#ff0000"));
      render(() => (
        <TestColorSwatchPicker value={value()} onChange={onChange} aria-label="Palette" />
      ));

      const options = screen.getAllByRole("option");
      expect(options[0]).toHaveAttribute("aria-selected", "true");

      fireEvent.click(options[1]!);

      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0]?.[0]?.toString("hexa")).toBe("#00ff00ff");
      expect(options[0]).toHaveAttribute("aria-selected", "true");

      setValue(parseColor("#00ff00"));

      await waitFor(() => {
        expect(options[1]).toHaveAttribute("aria-selected", "true");
      });
    });

    it("should expose disabled items and skip them during grid keyboard navigation", () => {
      const onChange = vi.fn();
      render(() => (
        <ColorSwatchPicker onChange={onChange} aria-label="Palette" layout="grid">
          <ColorSwatchPickerItem color="#ff0000" />
          <ColorSwatchPickerItem color="#00ff00" isDisabled />
          <ColorSwatchPickerItem color="#0000ff" />
        </ColorSwatchPicker>
      ));

      const options = screen.getAllByRole("option");
      expect(options[1]).toHaveAttribute("aria-disabled", "true");

      fireEvent.click(options[1]!);
      expect(onChange).not.toHaveBeenCalled();
      expect(options[0]).toHaveAttribute("aria-selected", "true");

      const listbox = screen.getByRole("listbox", { name: "Palette" });
      listbox.focus();
      fireEvent.keyDown(listbox, { key: "ArrowRight" });

      expect(options[2]).toHaveAttribute("aria-selected", "true");
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange.mock.calls[0]?.[0]?.toString("hexa")).toBe("#0000ffff");
    });

    it("should support ArrowRight/ArrowLeft navigation in grid layout", () => {
      const onChange = vi.fn();
      render(() => (
        <TestColorSwatchPicker onChange={onChange} aria-label="Palette" layout="grid" />
      ));

      const getSelectedIndex = () =>
        screen
          .getAllByRole("option")
          .findIndex((option) => option.getAttribute("aria-selected") === "true");

      const listbox = screen.getByRole("listbox", { name: "Palette" });
      listbox.focus();

      expect(getSelectedIndex()).toBe(0);
      fireEvent.keyDown(listbox, { key: "ArrowRight" });
      expect(getSelectedIndex()).toBe(1);
      expect(onChange.mock.calls[0]?.[0]?.toString("hexa")).toBe("#00ff00ff");

      fireEvent.keyDown(listbox, { key: "ArrowLeft" });
      expect(getSelectedIndex()).toBe(0);
    });

    it("should wrap ArrowLeft navigation in grid layout", () => {
      render(() => <TestColorSwatchPicker aria-label="Palette" layout="grid" />);

      const getSelectedIndex = () =>
        screen
          .getAllByRole("option")
          .findIndex((option) => option.getAttribute("aria-selected") === "true");

      const listbox = screen.getByRole("listbox", { name: "Palette" });
      listbox.focus();

      fireEvent.keyDown(listbox, { key: "ArrowLeft" });
      expect(getSelectedIndex()).toBe(2);
    });

    it("should use geometry-based ArrowDown/ArrowUp navigation in multi-column grid layout", () => {
      render(() => <TestColorSwatchPickerFourItems aria-label="Palette" layout="grid" />);

      const getSelectedIndex = () =>
        screen
          .getAllByRole("option")
          .findIndex((option) => option.getAttribute("aria-selected") === "true");

      const options = screen.getAllByRole("option") as HTMLElement[];
      mockGridOptionRects(options, 2);

      const listbox = screen.getByRole("listbox", { name: "Palette" });
      listbox.focus();

      expect(getSelectedIndex()).toBe(0);
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
      expect(getSelectedIndex()).toBe(2);

      fireEvent.keyDown(listbox, { key: "ArrowUp" });
      expect(getSelectedIndex()).toBe(0);
    });

    it("should wrap ArrowDown from bottom row to first item in multi-column grid layout", () => {
      render(() => <TestColorSwatchPickerFourItems aria-label="Palette" layout="grid" />);

      const getSelectedIndex = () =>
        screen
          .getAllByRole("option")
          .findIndex((option) => option.getAttribute("aria-selected") === "true");

      const options = screen.getAllByRole("option") as HTMLElement[];
      mockGridOptionRects(options, 2);

      fireEvent.click(options[3]!);

      const listbox = screen.getByRole("listbox", { name: "Palette" });
      listbox.focus();

      expect(getSelectedIndex()).toBe(3);
      fireEvent.keyDown(listbox, { key: "ArrowDown" });
      expect(getSelectedIndex()).toBe(0);
    });

    it("should invert horizontal arrows in RTL grid layout", () => {
      const previousDir = document.dir;
      document.dir = "rtl";

      try {
        render(() => <TestColorSwatchPicker aria-label="Palette" layout="grid" />);

        const getSelectedIndex = () =>
          screen
            .getAllByRole("option")
            .findIndex((option) => option.getAttribute("aria-selected") === "true");

        const listbox = screen.getByRole("listbox", { name: "Palette" });
        listbox.focus();

        expect(getSelectedIndex()).toBe(0);
        fireEvent.keyDown(listbox, { key: "ArrowRight" });
        expect(getSelectedIndex()).toBe(2);

        fireEvent.keyDown(listbox, { key: "ArrowLeft" });
        expect(getSelectedIndex()).toBe(0);
      } finally {
        document.dir = previousDir;
      }
    });

    it("should keep ArrowRight/ArrowLeft inert in stack layout", () => {
      const onChange = vi.fn();
      render(() => (
        <TestColorSwatchPicker onChange={onChange} aria-label="Palette" layout="stack" />
      ));

      const getSelectedIndex = () =>
        screen
          .getAllByRole("option")
          .findIndex((option) => option.getAttribute("aria-selected") === "true");

      const listbox = screen.getByRole("listbox", { name: "Palette" });
      listbox.focus();

      expect(getSelectedIndex()).toBe(0);
      fireEvent.keyDown(listbox, { key: "ArrowRight" });
      expect(getSelectedIndex()).toBe(0);
      expect(onChange).not.toHaveBeenCalled();

      fireEvent.keyDown(listbox, { key: "ArrowDown" });
      expect(getSelectedIndex()).toBe(1);
      expect(onChange).toHaveBeenCalledTimes(1);
    });
  });

  // ============================================
  // CONTEXT ERRORS
  // ============================================

  describe("context errors", () => {
    it("should throw when ColorSliderTrack is used outside ColorSlider", () => {
      expect(() => {
        render(() => <ColorSliderTrack />);
      }).toThrow("ColorSliderTrack must be used within a ColorSlider");
    });

    it("should throw when ColorSliderThumb is used outside ColorSlider", () => {
      expect(() => {
        render(() => <ColorSliderThumb />);
      }).toThrow("ColorSliderThumb must be used within a ColorSlider");
    });

    it("should throw when ColorAreaGradient is used outside ColorArea", () => {
      expect(() => {
        render(() => <ColorAreaGradient />);
      }).toThrow("ColorAreaGradient must be used within a ColorArea");
    });

    it("should throw when ColorAreaThumb is used outside ColorArea", () => {
      expect(() => {
        render(() => <ColorAreaThumb />);
      }).toThrow("ColorAreaThumb must be used within a ColorArea");
    });

    it("should throw when ColorWheelTrack is used outside ColorWheel", () => {
      expect(() => {
        render(() => <ColorWheelTrack />);
      }).toThrow("ColorWheelTrack must be used within a ColorWheel");
    });

    it("should throw when ColorWheelThumb is used outside ColorWheel", () => {
      expect(() => {
        render(() => <ColorWheelThumb />);
      }).toThrow("ColorWheelThumb must be used within a ColorWheel");
    });

    it("should throw when ColorFieldInput is used outside ColorField", () => {
      expect(() => {
        render(() => <ColorFieldInput />);
      }).toThrow("ColorFieldInput must be used within a ColorField");
    });

    it("should throw when ColorSwatchPickerItem is used outside ColorSwatchPicker", () => {
      expect(() => {
        render(() => <ColorSwatchPickerItem color="#ff0000" />);
      }).toThrow("ColorSwatchPickerItem must be used within a ColorSwatchPicker");
    });
  });
});
