/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal, flush } from "solid-js";
import { parseColor } from "@proyecto-viviana/solid-stately";
import packageJson from "../package.json";
import { ColorSwatch } from "../src/color";
import * as colorSwatchPickerSubpath from "../src/ColorSwatchPicker";
import {
  ColorSwatchPicker,
  ColorSwatchPickerContext,
  ColorSwatchPickerItem,
} from "../src/color/ColorSwatchPicker";

describe("ColorSwatchPicker (solid-spectrum)", () => {
  afterEach(() => {
    cleanup();
  });

  it("mirrors public S2 ColorSwatchPicker exports", () => {
    expect(colorSwatchPickerSubpath.ColorSwatchPicker).toBeTypeOf("function");
    expect(colorSwatchPickerSubpath.ColorSwatchPickerContext).toBeDefined();
    expect(colorSwatchPickerSubpath.ColorSwatch).toBeTypeOf("function");
    expect(colorSwatchPickerSubpath.parseColor).toBeTypeOf("function");
    expect(colorSwatchPickerSubpath.getColorChannels).toBeTypeOf("function");
  });

  it("declares the package subpath export", () => {
    expect(packageJson.exports["./ColorSwatchPicker"]).toMatchObject({
      types: "./dist/ColorSwatchPicker.d.ts",
      solid: "./dist/ColorSwatchPicker.jsx",
      import: "./dist/ColorSwatchPicker.js",
      default: "./dist/ColorSwatchPicker.js",
    });
  });

  it("composes S2-style ColorSwatch children into selectable options", () => {
    render(() => (
      <ColorSwatchPicker aria-label="Palette" defaultValue="#00ff00">
        <ColorSwatch color="#ff0000" />
        <ColorSwatch color="#00ff00" />
        <ColorSwatch color="#0000ff" />
      </ColorSwatchPicker>
    ));

    const listbox = screen.getByRole("listbox", { name: "Palette" });
    const options = screen.getAllByRole("option");

    expect(listbox).toHaveAttribute("data-layout", "grid");
    expect(options).toHaveLength(3);
    expect(options[1]).toHaveAttribute("aria-selected", "true");
    expect(options[1]!.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(3);
  });

  it("selects colors and calls onChange in uncontrolled mode", () => {
    const onChange = vi.fn();

    render(() => (
      <ColorSwatchPicker aria-label="Palette" defaultValue="#ff0000" onChange={onChange}>
        <ColorSwatch color="#ff0000" />
        <ColorSwatch color="#00ff00" />
        <ColorSwatch color="#0000ff" />
      </ColorSwatchPicker>
    ));

    const options = screen.getAllByRole("option");
    fireEvent.click(options[2]!);

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange.mock.calls[0]?.[0]?.toString("hexa")).toBe("#0000ffff");
    expect(options[2]).toHaveAttribute("aria-selected", "true");
  });

  it("keeps controlled selection stable until the value prop changes", async () => {
    const onChange = vi.fn();
    const [value, setValue] = createSignal(parseColor("#ff0000"));

    render(() => (
      <ColorSwatchPicker aria-label="Palette" value={value()} onChange={onChange}>
        <ColorSwatch color="#ff0000" />
        <ColorSwatch color="#00ff00" />
        <ColorSwatch color="#0000ff" />
      </ColorSwatchPicker>
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

  it("forwards DOM, ARIA, and escape-hatch styling props to the listbox", () => {
    render(() => (
      <ColorSwatchPicker
        id="palette"
        slot="swatches"
        aria-label="Palette"
        aria-describedby="palette-desc"
        aria-details="palette-details"
        UNSAFE_className="unsafe-class"
        class="legacy-class"
        UNSAFE_style={{ margin: "3px" }}
      >
        <ColorSwatch color="#ff0000" />
      </ColorSwatchPicker>
    ));

    const listbox = screen.getByRole("listbox", { name: "Palette" });

    expect(listbox).toHaveAttribute("id", "palette");
    expect(listbox).not.toHaveAttribute("slot");
    expect(listbox).toHaveAttribute("aria-describedby", "palette-desc");
    expect(listbox).toHaveAttribute("aria-details", "palette-details");
    expect(listbox.className).toContain("unsafe-class");
    expect(listbox.className).toContain("legacy-class");
    expect(listbox).toHaveStyle({ margin: "3px" });
  });

  it("applies ColorSwatchPickerContext defaults through S2 slots", () => {
    render(() => (
      <ColorSwatchPickerContext value={{ "aria-label": "Context palette" }}>
        <ColorSwatchPicker>
          <ColorSwatch color="#ff0000" />
        </ColorSwatchPicker>
      </ColorSwatchPickerContext>
    ));

    expect(screen.getByRole("listbox", { name: "Context palette" })).toBeInTheDocument();
  });

  it("keeps the legacy manual item helper working for existing callers", () => {
    render(() => (
      <ColorSwatchPicker aria-label="Palette" defaultValue="#ff0000">
        <ColorSwatchPickerItem color="#ff0000" />
        <ColorSwatchPickerItem color="#00ff00" />
      </ColorSwatchPicker>
    ));

    expect(screen.getAllByRole("option")).toHaveLength(2);
    expect(screen.getAllByRole("img")).toHaveLength(2);
  });

  it("updates aria-label and id reactively after mount", () => {
    const [label, setLabel] = createSignal("Initial label");
    const [id, setId] = createSignal<string | undefined>(undefined);

    render(() => (
      <ColorSwatchPicker aria-label={label()} id={id()}>
        <ColorSwatch color="#ff0000" />
      </ColorSwatchPicker>
    ));

    const listbox = screen.getByRole("listbox", { name: "Initial label" });
    expect(listbox.id).toMatch(/^solidaria-/);

    setId("contract-colorswatchpicker");
    flush();
    expect(listbox).toHaveAttribute("id", "contract-colorswatchpicker");

    setLabel("");
    flush();
    expect(screen.getByRole("listbox", { name: "Color swatches" })).toBeInTheDocument();
  });

  it("moves roving focus with PageDown and PageUp without changing selection", () => {
    render(() => (
      <ColorSwatchPicker aria-label="Palette" defaultValue="#ff0000">
        <ColorSwatch color="#ff0000" />
        <ColorSwatch color="#00ff00" />
        <ColorSwatch color="#0000ff" />
      </ColorSwatchPicker>
    ));

    const listbox = screen.getByRole("listbox", { name: "Palette" });
    const options = screen.getAllByRole("option");

    listbox.focus();
    expect(options[0]).toHaveAttribute("tabindex", "0");
    expect(options[0]).toHaveAttribute("aria-selected", "true");

    fireEvent.keyDown(listbox, { key: "PageDown" });
    expect(options[2]).toHaveAttribute("tabindex", "0");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
    expect(options[2]).toHaveAttribute("aria-selected", "false");

    fireEvent.keyDown(listbox, { key: "PageUp" });
    expect(options[0]).toHaveAttribute("tabindex", "0");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  it("skips disabled swatches on PageDown", () => {
    render(() => (
      <ColorSwatchPicker aria-label="Palette" defaultValue="#ff0000">
        <ColorSwatchPickerItem color="#ff0000" />
        <ColorSwatchPickerItem color="#00ff00" />
        <ColorSwatchPickerItem color="#0000ff" isDisabled />
      </ColorSwatchPicker>
    ));

    const listbox = screen.getByRole("listbox", { name: "Palette" });
    const options = screen.getAllByRole("option");

    listbox.focus();
    expect(options[0]).toHaveAttribute("tabindex", "0");

    fireEvent.keyDown(listbox, { key: "PageDown" });
    expect(options[1]).toHaveAttribute("tabindex", "0");
    expect(options[0]).toHaveAttribute("aria-selected", "true");
  });

  it("updates child swatch styling reactively when size or rounding change after mount", () => {
    const [size, setSize] = createSignal<ColorSwatchPickerSize>("M");
    const [rounding, setRounding] = createSignal<ColorSwatchPickerRounding>("none");

    render(() => (
      <ColorSwatchPicker aria-label="Palette" size={size()} rounding={rounding()}>
        <ColorSwatch color="#ff0000" />
      </ColorSwatchPicker>
    ));

    const swatch = screen.getByRole("img");
    const option = screen.getByRole("option");

    const initialSwatchClass = swatch.className;
    const initialOptionClass = option.className;

    setSize("XS");
    flush();
    const xsSwatchClass = swatch.className;
    expect(xsSwatchClass).not.toBe(initialSwatchClass);

    setSize("L");
    flush();
    expect(swatch.className).not.toBe(initialSwatchClass);
    expect(swatch.className).not.toBe(xsSwatchClass);

    setRounding("full");
    flush();
    expect(option.className).not.toBe(initialOptionClass);
    expect(swatch.className).not.toBe(initialSwatchClass);
  });
});
