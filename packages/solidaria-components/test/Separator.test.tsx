/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Separator } from "../src/Separator";
import {
  assertNoA11yViolations,
  assertAriaIdIntegrity,
} from "@proyecto-viviana/solidaria-test-utils";

describe("Separator", () => {
  it("should render with default class", () => {
    render(() => <Separator />);
    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("HR");
    expect(separator).toHaveAttribute("role", "separator");
    expect(separator).toHaveClass("solidaria-Separator");
  });

  it("should render with custom class", () => {
    render(() => <Separator class="test" />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveClass("test");
  });

  it("should support function class", () => {
    render(() => <Separator class={(props) => `separator-${props.orientation}`} />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveClass("separator-horizontal");
  });

  it("should support DOM props", () => {
    render(() => <Separator id="my-separator" />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("id", "my-separator");
  });

  it("should support slot", () => {
    render(() => <Separator slot="test" />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("slot", "test");
  });

  it("should support aria-label", () => {
    render(() => <Separator aria-label="Divider" />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("aria-label", "Divider");
  });

  it("should render as div for vertical orientation", () => {
    render(() => <Separator orientation="vertical" />);
    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("DIV");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
  });

  it("should use custom elementType", () => {
    render(() => <Separator elementType="span" />);
    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("SPAN");
  });

  it("should preserve React Aria's explicit hr hook branch", () => {
    render(() => <Separator elementType="hr" />);
    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("HR");
    expect(separator).not.toHaveAttribute("role");
  });

  it("should default to horizontal orientation", () => {
    render(() => <Separator />);
    const separator = screen.getByRole("separator");
    // Horizontal is default, so aria-orientation may not be explicitly set
    expect(separator).toBeTruthy();
    expect(separator.tagName).toBe("HR");
  });

  it("should support style as an object", () => {
    render(() => <Separator style={{ "border-color": "red" }} />);
    const separator = screen.getByRole("separator") as HTMLElement;
    expect(separator.style.borderColor).toBe("red");
  });

  it("should support style as a function", () => {
    render(() => (
      <Separator
        orientation="vertical"
        style={(props) => ({
          height: props.orientation === "vertical" ? "100%" : "1px",
        })}
      />
    ));
    const separator = screen.getByRole("separator") as HTMLElement;
    expect(separator.style.height).toBe("100%");
  });

  it("should support aria-labelledby", () => {
    render(() => (
      <>
        <span id="sep-label">Section break</span>
        <Separator aria-labelledby="sep-label" />
      </>
    ));
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("aria-labelledby", "sep-label");
  });

  it("should support aria description props", () => {
    render(() => (
      <>
        <span id="sep-description">Description</span>
        <div id="sep-details">Details</div>
        <Separator
          aria-label="Divider"
          aria-describedby="sep-description"
          aria-details="sep-details"
        />
      </>
    ));
    const separator = screen.getByRole("separator", { name: "Divider" });
    expect(separator).toHaveAttribute("aria-describedby", "sep-description");
    expect(separator).toHaveAttribute("aria-details", "sep-details");
  });

  it("should expose the underlying separator ref", () => {
    const ref = vi.fn();
    render(() => <Separator ref={ref} />);
    const separator = screen.getByRole("separator");
    expect(ref).toHaveBeenCalledWith(separator);
  });

  it("should keep custom elementType for vertical orientation", () => {
    render(() => <Separator orientation="vertical" elementType="span" />);
    const separator = screen.getByRole("separator");
    expect(separator.tagName).toBe("SPAN");
  });

  describe("a11y validation", () => {
    it("axe: horizontal", async () => {
      const { container } = render(() => <Separator />);
      await assertNoA11yViolations(container);
    });

    it("axe: vertical", async () => {
      const { container } = render(() => <Separator orientation="vertical" />);
      await assertNoA11yViolations(container);
    });

    it("ARIA ID: no dangling refs with aria-labelledby", () => {
      render(() => (
        <>
          <span id="sep-label">Section</span>
          <Separator aria-labelledby="sep-label" />
        </>
      ));
      assertAriaIdIntegrity(document.body);
    });

    it("ARIA ID: no dangling refs with aria-describedby and aria-details", () => {
      render(() => (
        <>
          <span id="sep-description">Description</span>
          <div id="sep-details">Details</div>
          <Separator
            aria-label="Section"
            aria-describedby="sep-description"
            aria-details="sep-details"
          />
        </>
      ));
      assertAriaIdIntegrity(document.body);
    });
  });
});
