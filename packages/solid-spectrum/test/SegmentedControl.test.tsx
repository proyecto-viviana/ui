import { createSignal, flush } from "solid-js";
import { describe, expect, it, vi } from "vite-plus/test";
import { fireEvent, render, screen } from "@solidjs/testing-library";
import {
  SegmentedControl,
  SegmentedControlContext,
  SegmentedControlItem,
  createIcon,
} from "../src";
import { setupUser } from "@proyecto-viviana/solid-spectrum-test-utils";

const TestIcon = createIcon((props) => (
  <svg viewBox="0 0 20 20" {...props}>
    <path d="M4 4h12v12H4z" />
  </svg>
));

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
      <SegmentedControlContext
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
      </SegmentedControlContext>
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
          <TestIcon />
        </SegmentedControlItem>
        <SegmentedControlItem id="grid" aria-label="Grid">
          <TestIcon />
        </SegmentedControlItem>
      </SegmentedControl>
    ));

    const list = screen.getByRole("radio", { name: "List" });
    const grid = screen.getByRole("radio", { name: "Grid" });
    expect(list).toHaveAttribute("aria-checked", "false");
    expect(grid).toHaveAttribute("aria-checked", "true");
    const icon = grid.querySelector("svg");
    expect(icon).toHaveAttribute("data-slot", "icon");
    expect(icon?.parentElement).toHaveAttribute("slot", "icon");
    expect(icon?.parentElement?.tagName).toBe("DIV");
    expect(grid.querySelector('[data-rsp-slot="text"]')).not.toBeInTheDocument();
  });

  it("renders the selection indicator when disabled with gray-25 indicator styling", () => {
    render(() => (
      <SegmentedControl aria-label="View mode" isDisabled defaultSelectedKey="list">
        <SegmentedControlItem id="list">List</SegmentedControlItem>
        <SegmentedControlItem id="grid">Grid</SegmentedControlItem>
      </SegmentedControl>
    ));

    const list = screen.getByRole("radio", { name: "List" });
    expect(list).toBeDisabled();
    expect(list).toHaveAttribute("aria-checked", "true");

    const indicator = list.querySelector("[aria-hidden='true'][data-selected='true']");
    expect(indicator).toBeInTheDocument();
    expect(indicator).toHaveAttribute("data-selected", "true");
    expect(indicator?.className).toBeTruthy();
  });

  it("applies pressScale to the inner content div and keeps host radio unscaled during pointer-down", () => {
    render(() => (
      <SegmentedControl aria-label="View mode" defaultSelectedKey="list">
        <SegmentedControlItem id="list">List</SegmentedControlItem>
        <SegmentedControlItem id="grid">Grid</SegmentedControlItem>
      </SegmentedControl>
    ));

    const grid = screen.getByRole("radio", { name: "Grid" });
    const innerContent = grid.querySelector("div");
    expect(innerContent).toBeInTheDocument();

    vi.spyOn(innerContent!, "getBoundingClientRect").mockReturnValue({
      x: 0,
      y: 0,
      width: 24,
      height: 18,
      top: 0,
      right: 24,
      bottom: 18,
      left: 0,
      toJSON: () => {},
    });

    expect(grid.style.transform).toBe("");
    expect(innerContent?.style.transform).toBe("");

    grid.focus();
    expect(document.activeElement).toBe(grid);

    fireEvent.pointerDown(grid, { pointerType: "mouse", button: 0, pointerId: 1 });

    expect(document.activeElement).toBe(grid);
    expect(grid.style.transform).toBe("");
    expect(innerContent?.style.transform).toContain("perspective(24px) translate3d(0, 0, -2px)");

    fireEvent.pointerUp(grid, { pointerType: "mouse", button: 0, pointerId: 1 });
    fireEvent.click(grid);
    expect(innerContent?.style.transform).toBe("");
    expect(grid.style.transform).toBe("");
  });

  it("updates mixed text children reactively without recreating the item", () => {
    let setCount!: (value: number) => void;
    render(() => {
      const [count, updateCount] = createSignal(0);
      setCount = updateCount;
      return (
        <SegmentedControl aria-label="View mode">
          <SegmentedControlItem id="item">count: {count()}</SegmentedControlItem>
        </SegmentedControl>
      );
    });

    const item = screen.getByRole("radio");
    expect(item).toHaveTextContent("count: 0");
    setCount(1);
    flush();
    expect(screen.getByRole("radio")).toBe(item);
    expect(item).toHaveTextContent("count: 1");
  });
});
