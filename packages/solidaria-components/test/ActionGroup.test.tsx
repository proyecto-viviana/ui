/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vite-plus/test";
import { render, screen, fireEvent, waitFor } from "@solidjs/testing-library";
import { ActionGroup } from "../src/ActionGroup";

const items = [
  { id: "bold", label: "Bold" },
  { id: "italic", label: "Italic" },
  { id: "underline", label: "Underline" },
];

describe("ActionGroup (headless)", () => {
  describe("roles", () => {
    it("renders toolbar role for none selection mode", () => {
      render(() => (
        <ActionGroup items={items} aria-label="Formatting">
          {(item) => item.label}
        </ActionGroup>
      ));
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });

    it("renders radiogroup role for single selection mode", () => {
      render(() => (
        <ActionGroup items={items} selectionMode="single" aria-label="Formatting">
          {(item) => item.label}
        </ActionGroup>
      ));
      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });

    it("renders radio roles for items in single selection", () => {
      render(() => (
        <ActionGroup items={items} selectionMode="single" aria-label="Formatting">
          {(item) => item.label}
        </ActionGroup>
      ));
      expect(screen.getAllByRole("radio")).toHaveLength(3);
    });

    it("renders toolbar role for multiple selection mode", () => {
      render(() => (
        <ActionGroup items={items} selectionMode="multiple" aria-label="Formatting">
          {(item) => item.label}
        </ActionGroup>
      ));
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });

    it("uses group role when nested inside a toolbar", async () => {
      render(() => (
        <div role="toolbar">
          <ActionGroup items={items} aria-label="Formatting">
            {(item) => item.label}
          </ActionGroup>
        </div>
      ));

      await waitFor(() => {
        const groups = screen.queryAllByRole("group");
        expect(groups.length).toBeGreaterThan(0);
      });
    });
  });

  describe("selection", () => {
    it("calls onAction in none selection mode", () => {
      const onAction = vi.fn();
      render(() => (
        <ActionGroup items={items} aria-label="Formatting" onAction={onAction}>
          {(item) => item.label}
        </ActionGroup>
      ));

      fireEvent.click(screen.getByRole("button", { name: "Bold" }));
      expect(onAction).toHaveBeenCalledWith("bold");
    });

    it("selects item on click in single selection mode", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <ActionGroup
          items={items}
          selectionMode="single"
          aria-label="Formatting"
          onSelectionChange={onSelectionChange}
        >
          {(item) => item.label}
        </ActionGroup>
      ));

      fireEvent.click(screen.getByRole("radio", { name: "Bold" }));
      expect(onSelectionChange).toHaveBeenCalled();
    });

    it("supports default selected keys", () => {
      render(() => (
        <ActionGroup
          items={items}
          selectionMode="single"
          defaultSelectedKeys={["bold"]}
          aria-label="Formatting"
        >
          {(item) => item.label}
        </ActionGroup>
      ));

      expect(screen.getByRole("radio", { name: "Bold" })).toHaveAttribute("aria-checked", "true");
    });

    it("supports controlled selected keys", () => {
      render(() => (
        <ActionGroup
          items={items}
          selectionMode="single"
          selectedKeys={["italic"]}
          aria-label="Formatting"
        >
          {(item) => item.label}
        </ActionGroup>
      ));

      expect(screen.getByRole("radio", { name: "Italic" })).toHaveAttribute("aria-checked", "true");
    });

    it("keeps every item tabbable at rest (no selection-biased tab stop)", () => {
      // v3 `useActionGroupItem` tabIndex is `isFocused || focusedKey == null ? 0 : -1`
      // — every enabled item is tabbable until focus engages, and a default
      // selection does NOT collapse the group to a single tab stop.
      render(() => (
        <ActionGroup
          items={items}
          selectionMode="single"
          defaultSelectedKeys={["italic"]}
          aria-label="Formatting"
        >
          {(item) => item.label}
        </ActionGroup>
      ));

      expect(screen.getByRole("radio", { name: "Bold" })).toHaveAttribute("tabindex", "0");
      expect(screen.getByRole("radio", { name: "Italic" })).toHaveAttribute("tabindex", "0");
    });
  });

  describe("keyboard navigation", () => {
    it("moves focus with ArrowRight", () => {
      render(() => (
        <ActionGroup items={items} aria-label="Formatting">
          {(item) => item.label}
        </ActionGroup>
      ));

      const bold = screen.getByRole("button", { name: "Bold" });
      const italic = screen.getByRole("button", { name: "Italic" });
      bold.focus();
      fireEvent.keyDown(bold, { key: "ArrowRight" });
      expect(document.activeElement).toBe(italic);
    });

    it("wraps focus at boundaries", () => {
      render(() => (
        <ActionGroup items={items} aria-label="Formatting">
          {(item) => item.label}
        </ActionGroup>
      ));

      const bold = screen.getByRole("button", { name: "Bold" });
      const underline = screen.getByRole("button", { name: "Underline" });
      bold.focus();
      fireEvent.keyDown(bold, { key: "ArrowLeft" });
      expect(document.activeElement).toBe(underline);
    });

    it("navigates with orientation-agnostic arrows (ArrowDown/ArrowUp move too)", () => {
      // v3 `useActionGroup.onKeyDown` moves NEXT on ArrowRight OR ArrowDown and
      // PREVIOUS on ArrowLeft OR ArrowUp, independent of orientation.
      render(() => (
        <ActionGroup items={items} aria-label="Formatting">
          {(item) => item.label}
        </ActionGroup>
      ));

      const bold = screen.getByRole("button", { name: "Bold" });
      const italic = screen.getByRole("button", { name: "Italic" });
      bold.focus();
      fireEvent.keyDown(bold, { key: "ArrowDown" });
      expect(document.activeElement).toBe(italic);
      fireEvent.keyDown(italic, { key: "ArrowUp" });
      expect(document.activeElement).toBe(bold);
    });

    it("does not handle Home/End (they fall through to the browser)", () => {
      // v3 `useActionGroup.onKeyDown` handles ONLY the four arrows; Home/End are
      // not intercepted.
      render(() => (
        <ActionGroup items={items} aria-label="Formatting">
          {(item) => item.label}
        </ActionGroup>
      ));

      const bold = screen.getByRole("button", { name: "Bold" });
      const underline = screen.getByRole("button", { name: "Underline" });

      bold.focus();
      fireEvent.keyDown(bold, { key: "End" });
      expect(document.activeElement).toBe(bold);

      underline.focus();
      fireEvent.keyDown(underline, { key: "Home" });
      expect(document.activeElement).toBe(underline);
    });

    it("moves focus without changing selection while arrow navigating (single mode)", () => {
      // No selection-follows-focus: arrows move the roving focus only; selection
      // changes solely on press.
      render(() => (
        <ActionGroup items={items} selectionMode="single" aria-label="Formatting">
          {(item) => item.label}
        </ActionGroup>
      ));

      const bold = screen.getByRole("radio", { name: "Bold" });
      const italic = screen.getByRole("radio", { name: "Italic" });

      bold.focus();
      fireEvent.keyDown(bold, { key: "ArrowRight" });
      expect(document.activeElement).toBe(italic);
      expect(italic).not.toHaveAttribute("data-selected");
    });
  });

  describe("disabled state", () => {
    it("marks group as aria-disabled when all items disabled", () => {
      const disabledItems = items.map((i) => ({ ...i, isDisabled: true }));
      render(() => (
        <ActionGroup items={disabledItems} aria-label="Formatting">
          {(item) => item.label}
        </ActionGroup>
      ));

      const group = screen.getByRole("toolbar");
      expect(group).toHaveAttribute("aria-disabled", "true");
    });

    it("disables specific items via disabledKeys", () => {
      render(() => (
        <ActionGroup
          items={items}
          selectionMode="single"
          disabledKeys={["italic"]}
          aria-label="Formatting"
        >
          {(item) => item.label}
        </ActionGroup>
      ));

      const italic = screen.getByRole("radio", { name: "Italic" });
      expect(italic).toBeDisabled();
    });
  });

  describe("render props", () => {
    it("passes render props to item children", () => {
      render(() => (
        <ActionGroup
          items={items}
          selectionMode="single"
          defaultSelectedKeys={["bold"]}
          aria-label="Formatting"
        >
          {(item, rp) => (
            <span data-testid={`item-${item.id}`}>
              {item.label} {rp.isSelected ? "(on)" : "(off)"}
            </span>
          )}
        </ActionGroup>
      ));

      expect(screen.getByTestId("item-bold")).toHaveTextContent("Bold (on)");
      expect(screen.getByTestId("item-italic")).toHaveTextContent("Italic (off)");
    });
  });

  describe("data attributes", () => {
    it("sets data-orientation", () => {
      const { container } = render(() => (
        <ActionGroup items={items} orientation="vertical" aria-label="Formatting">
          {(item) => item.label}
        </ActionGroup>
      ));

      expect(container.querySelector('[data-orientation="vertical"]')).toBeInTheDocument();
    });

    it("sets data-selected on selected items", () => {
      const { container } = render(() => (
        <ActionGroup
          items={items}
          selectionMode="single"
          defaultSelectedKeys={["bold"]}
          aria-label="Formatting"
        >
          {(item) => item.label}
        </ActionGroup>
      ));

      const selected = container.querySelectorAll("[data-selected]");
      expect(selected).toHaveLength(1);
    });
  });
});
