import { render, screen } from "@solidjs/testing-library";
import { describe, expect, it } from "vite-plus/test";
import { createIcon } from "../src/icon";
import { SegmentedControl, SegmentedControlItem } from "../src/segmentedcontrol";

const TestIcon = createIcon((props) => (
  <svg viewBox="0 0 20 20" {...props}>
    <path d="M4 4h12v12H4z" />
  </svg>
));

describe("SegmentedControl", () => {
  it("resolves authored icon children inside the segment IconContext", () => {
    render(() => (
      <SegmentedControl aria-label="View mode" defaultSelectedKey="grid">
        <SegmentedControlItem id="list" aria-label="List">
          <TestIcon />
        </SegmentedControlItem>
        <SegmentedControlItem id="grid" aria-label="Grid">
          <TestIcon />
        </SegmentedControlItem>
      </SegmentedControl>
    ));

    const grid = screen.getByRole("radio", { name: "Grid" });
    const icon = grid.querySelector("svg");
    expect(icon).toHaveAttribute("data-slot", "icon");
    expect(icon?.parentElement).toHaveAttribute("slot", "icon");
    expect(icon?.parentElement?.tagName).toBe("DIV");
    expect(grid.querySelector('[data-rsp-slot="text"]')).not.toBeInTheDocument();
  });
});
