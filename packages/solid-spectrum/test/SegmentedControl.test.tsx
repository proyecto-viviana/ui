import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { SegmentedControl, SegmentedControlItem } from "../src";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

describe("SegmentedControl (solid-spectrum)", () => {
  it("defaults selection to the first item", () => {
    render(() => (
      <SegmentedControl aria-label="View mode">
        <SegmentedControlItem id="list">List</SegmentedControlItem>
        <SegmentedControlItem id="grid">Grid</SegmentedControlItem>
      </SegmentedControl>
    ));

    const group = screen.getByRole("radiogroup", { name: "View mode" });
    expect(group).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "false");
  });

  it("supports controlled selectedKey changes", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    function Demo() {
      const [selectedKey, setSelectedKey] = createSignal("list");
      return (
        <SegmentedControl
          aria-label="View mode"
          selectedKey={selectedKey()}
          onSelectionChange={(key) => {
            setSelectedKey(String(key));
            onSelectionChange(key);
          }}
        >
          <SegmentedControlItem id="list">List</SegmentedControlItem>
          <SegmentedControlItem id="grid">Grid</SegmentedControlItem>
        </SegmentedControl>
      );
    }

    render(() => <Demo />);

    const grid = screen.getByRole("radio", { name: "Grid" });
    await user.click(grid);

    expect(screen.getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "false");
    expect(grid).toHaveAttribute("aria-checked", "true");
    expect(onSelectionChange).toHaveBeenCalledWith("grid");
  });

  it("updates the rendered selection when selectedKey changes externally", async () => {
    function Demo() {
      const [selectedKey, setSelectedKey] = createSignal("list");
      return (
        <>
          <button type="button" onClick={() => setSelectedKey("grid")}>
            Switch
          </button>
          <SegmentedControl aria-label="View mode" selectedKey={selectedKey()}>
            <SegmentedControlItem id="list">List</SegmentedControlItem>
            <SegmentedControlItem id="grid">Grid</SegmentedControlItem>
          </SegmentedControl>
        </>
      );
    }

    render(() => <Demo />);

    expect(screen.getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "false");

    fireEvent.click(screen.getByRole("button", { name: "Switch" }));

    expect(screen.getByRole("radio", { name: "List" })).toHaveAttribute("aria-checked", "false");
    expect(screen.getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "true");
  });

  it("passes disabled and justified state to the rendered control", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();
    render(() => (
      <SegmentedControl
        aria-label="Density"
        isJustified
        isDisabled
        onSelectionChange={onSelectionChange}
      >
        <SegmentedControlItem id="compact">Compact</SegmentedControlItem>
        <SegmentedControlItem id="spacious">Spacious</SegmentedControlItem>
      </SegmentedControl>
    ));

    const group = screen.getByRole("radiogroup", { name: "Density" });
    expect(group).toHaveAttribute("data-justified", "true");
    expect(group).toHaveAttribute("data-disabled", "true");

    const compact = screen.getByRole("radio", { name: "Compact" });
    expect(compact).toBeDisabled();
    expect(compact).toHaveAttribute("data-segmented-control-item");

    onSelectionChange.mockClear();
    await user.click(compact);
    expect(onSelectionChange).not.toHaveBeenCalled();
  });
});
