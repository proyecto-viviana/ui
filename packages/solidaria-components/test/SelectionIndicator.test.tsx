/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vite-plus/test";
import { render, screen } from "@solidjs/testing-library";
import { SelectionIndicator } from "../src/SelectionIndicator";
import { SharedElementTransition } from "../src/SharedElementTransition";

describe("SelectionIndicator", () => {
  it("renders fallback span outside SharedElementTransition", () => {
    render(() => <SelectionIndicator isSelected>Selected</SelectionIndicator>);

    const indicator = screen.getByText("Selected").closest("span");
    expect(indicator).toBeInTheDocument();
    expect(indicator?.tagName).toBe("SPAN");
    expect(indicator).toHaveAttribute("data-selected");
  });

  it("does not render outside SharedElementTransition when not selected", () => {
    render(() => <SelectionIndicator isSelected={false}>Selected</SelectionIndicator>);
    expect(screen.queryByText("Selected")).toBeNull();
  });

  it("renders as SharedElement inside SharedElementTransition", () => {
    render(() => (
      <SharedElementTransition>
        <SelectionIndicator isSelected>Selected</SelectionIndicator>
      </SharedElementTransition>
    ));

    const indicator = screen.getByText("Selected").closest("div");
    expect(indicator).toBeInTheDocument();
    expect(indicator?.tagName).toBe("DIV");
    expect(indicator).toHaveAttribute("data-selected");
  });

  it("does not render inside SharedElementTransition when not selected", () => {
    render(() => (
      <SharedElementTransition>
        <SelectionIndicator isSelected={false}>Selected</SelectionIndicator>
      </SharedElementTransition>
    ));

    expect(screen.queryByText("Selected")).toBeNull();
  });

  it("supports shouldForceMount inside SharedElementTransition", () => {
    render(() => (
      <SharedElementTransition>
        <SelectionIndicator isSelected={false} shouldForceMount>
          Dot
        </SelectionIndicator>
      </SharedElementTransition>
    ));

    expect(screen.getByText("Dot")).toBeInTheDocument();
  });
});
