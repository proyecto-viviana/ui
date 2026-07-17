/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Separator } from "../src/separator";

describe("Separator (solid-spectrum)", () => {
  it('should render with role="separator"', () => {
    render(() => <Separator />);
    const separator = screen.getByRole("separator");
    expect(separator).toBeInTheDocument();
  });

  it("should render as hr by default", () => {
    render(() => <Separator />);
    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("HR");
  });

  it("should render as div for vertical orientation", () => {
    render(() => <Separator orientation="vertical" />);
    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("DIV");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
  });

  it("should support size prop", () => {
    // Styling is emitted through the style() macro, so assert that distinct
    // sizes produce distinct generated classes rather than a literal utility.
    const { getByRole: getSm } = render(() => <Separator size="sm" />);
    const { getByRole: getLg } = render(() => <Separator size="lg" />);
    const sm = getSm("separator");
    const lg = getLg("separator");
    expect(sm.className).not.toBe("");
    expect(sm.className).not.toBe(lg.className);
  });

  it("should support vertical size prop", () => {
    const { getByRole: getSm } = render(() => <Separator orientation="vertical" size="sm" />);
    const { getByRole: getLg } = render(() => <Separator orientation="vertical" size="lg" />);
    expect(getSm("separator").className).not.toBe(getLg("separator").className);
  });

  it("should support variant prop", () => {
    const { getByRole: getDefault } = render(() => <Separator variant="default" />);
    const { getByRole: getStrong } = render(() => <Separator variant="strong" />);
    const strong = getStrong("separator");
    expect(strong.className).not.toBe("");
    expect(getDefault("separator").className).not.toBe(strong.className);
  });

  it("should support custom class", () => {
    render(() => <Separator class="my-custom-class" />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveClass("my-custom-class");
  });

  it("should support aria-label", () => {
    render(() => <Separator aria-label="Section divider" />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("aria-label", "Section divider");
  });

  it("should apply generated styling for each orientation", () => {
    // The macro folds width/height/border-reset into generated classes; assert
    // the separator is styled and that the two orientations differ.
    const { getByRole: getH } = render(() => <Separator />);
    const { getByRole: getV } = render(() => <Separator orientation="vertical" />);
    const horizontal = getH("separator");
    const vertical = getV("separator");
    expect(horizontal.className).not.toBe("");
    expect(vertical.className).not.toBe("");
    expect(horizontal.className).not.toBe(vertical.className);
  });
});
