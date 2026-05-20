import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import { SegmentedControl, SegmentedControlContext, SegmentedControlItem } from "../src";
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

  it("supports defaultSelectedKey without becoming controlled", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    render(() => (
      <SegmentedControl
        aria-label="View mode"
        defaultSelectedKey="grid"
        onSelectionChange={onSelectionChange}
      >
        <SegmentedControlItem id="list">List</SegmentedControlItem>
        <SegmentedControlItem id="grid">Grid</SegmentedControlItem>
      </SegmentedControl>
    ));

    const list = screen.getByRole("radio", { name: "List" });
    const grid = screen.getByRole("radio", { name: "Grid" });
    expect(list).toHaveAttribute("aria-checked", "false");
    expect(grid).toHaveAttribute("aria-checked", "true");

    await user.click(list);

    expect(list).toHaveAttribute("aria-checked", "true");
    expect(grid).toHaveAttribute("aria-checked", "false");
    expect(onSelectionChange).toHaveBeenCalledWith("list");
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

  it("merges SegmentedControlContext props", () => {
    render(() => (
      <SegmentedControlContext.Provider
        value={{
          "aria-label": "Context view mode",
          selectedKey: "grid",
          isJustified: true,
          UNSAFE_className: "context-segmented-control",
          UNSAFE_style: { margin: "1px" },
        }}
      >
        <SegmentedControl>
          <SegmentedControlItem id="list">List</SegmentedControlItem>
          <SegmentedControlItem id="grid">Grid</SegmentedControlItem>
        </SegmentedControl>
      </SegmentedControlContext.Provider>
    ));

    const group = screen.getByRole("radiogroup", { name: "Context view mode" });
    expect(group).toHaveAttribute("data-justified", "true");
    expect(group).toHaveClass("context-segmented-control");
    expect(group).toHaveStyle({ margin: "1px" });
    expect(screen.getByRole("radio", { name: "Grid" })).toHaveAttribute("aria-checked", "true");
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

  it("supports disabled items without clearing the selected key", async () => {
    const user = setupUser();
    const onSelectionChange = vi.fn();

    render(() => (
      <SegmentedControl
        aria-label="View mode"
        selectedKey="list"
        onSelectionChange={onSelectionChange}
      >
        <SegmentedControlItem id="list">List</SegmentedControlItem>
        <SegmentedControlItem id="grid" isDisabled>
          Grid
        </SegmentedControlItem>
      </SegmentedControl>
    ));

    const list = screen.getByRole("radio", { name: "List" });
    const grid = screen.getByRole("radio", { name: "Grid" });
    expect(grid).toBeDisabled();

    await user.click(grid);

    expect(list).toHaveAttribute("aria-checked", "true");
    expect(grid).toHaveAttribute("aria-checked", "false");
    expect(onSelectionChange).not.toHaveBeenCalled();
  });

  it("supports icon-only items with aria labels", () => {
    render(() => (
      <SegmentedControl aria-label="View mode" defaultSelectedKey="grid">
        <SegmentedControlItem id="list" aria-label="List">
          <svg aria-hidden="true" />
        </SegmentedControlItem>
        <SegmentedControlItem id="grid" aria-label="Grid">
          <svg aria-hidden="true" />
        </SegmentedControlItem>
      </SegmentedControl>
    ));

    const list = screen.getByRole("radio", { name: "List" });
    const grid = screen.getByRole("radio", { name: "Grid" });
    expect(list).toHaveAttribute("aria-checked", "false");
    expect(grid).toHaveAttribute("aria-checked", "true");
    expect(grid.querySelector("svg")).toBeInTheDocument();
  });
});
