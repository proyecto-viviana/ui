/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { createListState } from "../../solid-stately/src";
import { createActionGroup, createActionGroupItem } from "../src/actiongroup";

function ActionGroupExample(props: {
  selectionMode?: "none" | "single" | "multiple";
  disabledKeys?: Iterable<string>;
  defaultSelectedKeys?: Iterable<string>;
  onAction?: (key: string | number) => void;
}) {
  const state = createListState({
    selectionMode: props.selectionMode ?? "none",
    disabledKeys: props.disabledKeys,
    defaultSelectedKeys: props.defaultSelectedKeys,
    items: [
      { id: "a", label: "A" },
      { id: "b", label: "B" },
    ],
    getKey: (item) => item.id,
    getTextValue: (item) => item.label,
  });

  const { actionGroupProps } = createActionGroup(
    { "aria-label": "Actions", onAction: props.onAction },
    state,
  );
  const itemA = createActionGroupItem({ key: "a" }, state);
  const itemB = createActionGroupItem({ key: "b" }, state);

  return (
    <div {...actionGroupProps} data-testid="action-group">
      <button {...itemA.buttonProps}>A</button>
      <button {...itemB.buttonProps}>B</button>
      <output data-testid="selected-keys">
        {JSON.stringify(state.selectedKeys() === "all" ? "all" : [...state.selectedKeys()])}
      </output>
    </div>
  );
}

describe("createActionGroup", () => {
  it("renders toolbar role for none selection mode", () => {
    render(() => <ActionGroupExample selectionMode="none" />);
    expect(screen.getByRole("toolbar")).toBeInTheDocument();
  });

  it("renders radiogroup/radio semantics for single selection mode", () => {
    render(() => <ActionGroupExample selectionMode="single" />);
    expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    const a = screen.getByRole("radio", { name: "A" });
    const b = screen.getByRole("radio", { name: "B" });
    expect(a).toHaveAttribute("aria-checked", "false");
    expect(b).toHaveAttribute("aria-checked", "false");
  });

  it("selects item on press", () => {
    render(() => <ActionGroupExample selectionMode="single" />);
    const a = screen.getByRole("radio", { name: "A" });
    fireEvent.click(a);
    expect(screen.getByTestId("selected-keys").textContent).toContain('"a"');
  });

  it("calls onAction when item is pressed in none selection mode", () => {
    const onAction = vi.fn();
    render(() => <ActionGroupExample selectionMode="none" onAction={onAction} />);

    fireEvent.click(screen.getByRole("button", { name: "A" }));
    expect(onAction).toHaveBeenCalledWith("a");
  });

  it("moves focus with arrow keys in horizontal orientation", () => {
    render(() => <ActionGroupExample selectionMode="none" />);
    const a = screen.getByRole("button", { name: "A" });
    const b = screen.getByRole("button", { name: "B" });
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowRight" });
    expect(document.activeElement).toBe(b);
  });

  it("navigates with orientation-agnostic arrows (ArrowDown moves next too)", () => {
    // v3 `useActionGroup.onKeyDown` is orientation-agnostic: ArrowRight OR
    // ArrowDown move NEXT, ArrowLeft OR ArrowUp move PREVIOUS, regardless of the
    // group orientation (orientation only drives `aria-orientation`). The port
    // had gated each arrow to a single axis — reverted.
    render(() => <ActionGroupExample selectionMode="none" />);
    const a = screen.getByRole("button", { name: "A" });
    const b = screen.getByRole("button", { name: "B" });
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowDown" });
    expect(document.activeElement).toBe(b);
    fireEvent.keyDown(b, { key: "ArrowUp" });
    expect(document.activeElement).toBe(a);
  });

  it("moves focus without changing selection under arrow navigation (single mode)", () => {
    // v3 `useActionGroup` has NO selection-follows-focus: arrows move the roving
    // focus only; selection changes solely on press. (The port had invented a
    // single-mode `replaceSelection` on focus move — reverted.)
    render(() => <ActionGroupExample selectionMode="single" />);

    const a = screen.getByRole("radio", { name: "A" });
    const b = screen.getByRole("radio", { name: "B" });
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowRight" });

    expect(document.activeElement).toBe(b);
    expect(screen.getByTestId("selected-keys").textContent).not.toContain('"b"');
  });

  it("does not handle Home/End (they fall through to the browser)", () => {
    // v3 `useActionGroup.onKeyDown` handles ONLY the four arrows; Home/End are
    // not intercepted (no focus move). The port had added Home/End jumps — removed.
    render(() => <ActionGroupExample selectionMode="none" />);

    const a = screen.getByRole("button", { name: "A" });
    const b = screen.getByRole("button", { name: "B" });

    b.focus();
    fireEvent.keyDown(b, { key: "Home" });
    expect(document.activeElement).toBe(b);

    a.focus();
    fireEvent.keyDown(a, { key: "End" });
    expect(document.activeElement).toBe(a);
  });

  it("keeps every enabled item tabbable until focus engages the group", () => {
    // v3 `useActionGroupItem` tabIndex is `isFocused || focusedKey == null ? 0 : -1`
    // — there is NO single default tab stop. Before any item is focused, all
    // items are tabbable; a disabled item is made non-tabbable by its native
    // `disabled` attribute, not by a -1 tabIndex. (The port had invented a
    // `getDefaultTabStopKey` single stop — reverted.)
    render(() => <ActionGroupExample selectionMode="single" disabledKeys={["a"]} />);

    const a = screen.getByRole("radio", { name: "A" });
    const b = screen.getByRole("radio", { name: "B" });

    expect(a).toHaveAttribute("tabindex", "0");
    expect(b).toHaveAttribute("tabindex", "0");
    expect(a).toBeDisabled();
  });

  it("does not bias the tab stop toward the selected key", () => {
    // No selection bias: a default-selected key does not become the single tab
    // stop. All enabled items stay tabbable at rest. (The port had biased the
    // default tab stop to the selected key — reverted.)
    render(() => <ActionGroupExample selectionMode="single" defaultSelectedKeys={["b"]} />);

    const a = screen.getByRole("radio", { name: "A" });
    const b = screen.getByRole("radio", { name: "B" });

    expect(a).toHaveAttribute("tabindex", "0");
    expect(b).toHaveAttribute("tabindex", "0");
  });

  it("wraps focus at boundaries with arrow navigation", () => {
    render(() => <ActionGroupExample selectionMode="none" />);
    const a = screen.getByRole("button", { name: "A" });
    const b = screen.getByRole("button", { name: "B" });
    a.focus();
    fireEvent.keyDown(a, { key: "ArrowLeft" });
    expect(document.activeElement).toBe(b);
  });

  it("uses group role when nested inside a toolbar", async () => {
    render(() => (
      <div role="toolbar">
        <ActionGroupExample selectionMode="none" />
      </div>
    ));

    await waitFor(() => {
      expect(screen.getByTestId("action-group")).toHaveAttribute("role", "group");
    });
  });
});
