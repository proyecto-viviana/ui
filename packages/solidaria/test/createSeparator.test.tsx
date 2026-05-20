/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen } from "@solidjs/testing-library";
import { Dynamic } from "solid-js/web";
import { createMemo } from "solid-js";
import { createSeparator } from "../src/separator";

// Test component that uses createSeparator
function TestSeparator(props: {
  orientation?: "horizontal" | "vertical";
  elementType?: string;
  "aria-label"?: string;
  "aria-describedby"?: string;
  "aria-details"?: string;
}) {
  const { separatorProps } = createSeparator({
    get orientation() {
      return props.orientation;
    },
    get elementType() {
      return props.elementType;
    },
    get "aria-label"() {
      return props["aria-label"];
    },
    get "aria-describedby"() {
      return props["aria-describedby"];
    },
    get "aria-details"() {
      return props["aria-details"];
    },
  });

  // Use the element type from props or default to hr
  const element = createMemo(() => props.elementType || "hr");

  return <Dynamic component={element()} {...separatorProps} data-testid="separator" />;
}

describe("createSeparator", () => {
  it('should render with role="separator" for non-hr elements', () => {
    render(() => <TestSeparator elementType="div" />);
    const separator = screen.getByRole("separator");
    expect(separator).toBeInTheDocument();
  });

  it("should not add role for hr elements (implicit)", () => {
    render(() => <TestSeparator elementType="hr" />);
    const separator = screen.getByTestId("separator");
    // hr elements have implicit separator role
    expect(separator.tagName).toBe("HR");
    expect(separator).not.toHaveAttribute("role");
  });

  it("should have default horizontal orientation", () => {
    render(() => <TestSeparator elementType="div" />);
    const separator = screen.getByRole("separator");
    // aria-orientation is not set for horizontal (it's the default)
    expect(separator).not.toHaveAttribute("aria-orientation");
  });

  it('should set aria-orientation="vertical" for vertical separators', () => {
    render(() => <TestSeparator elementType="div" orientation="vertical" />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
  });

  it("should support aria-label", () => {
    render(() => <TestSeparator elementType="div" aria-label="Section divider" />);
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("aria-label", "Section divider");
  });

  it("should support aria descriptions", () => {
    render(() => (
      <TestSeparator
        elementType="div"
        aria-label="Section divider"
        aria-describedby="separator-description"
        aria-details="separator-details"
      />
    ));
    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("aria-describedby", "separator-description");
    expect(separator).toHaveAttribute("aria-details", "separator-details");
  });

  it("should not add aria-orientation for hr elements", () => {
    render(() => <TestSeparator elementType="hr" orientation="horizontal" />);
    const separator = screen.getByTestId("separator");
    expect(separator).not.toHaveAttribute("aria-orientation");
  });
});
