/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { ActionGroup } from "../src/actiongroup";

const items = [
  { id: "cut", label: "Cut" },
  { id: "copy", label: "Copy" },
  { id: "paste", label: "Paste" },
];

describe("ActionGroup (solid-spectrum)", () => {
  describe("basic rendering", () => {
    it("renders all items", () => {
      render(() => (
        <ActionGroup items={items} aria-label="Edit">
          {(item) => item.label}
        </ActionGroup>
      ));
      expect(screen.getByText("Cut")).toBeInTheDocument();
      expect(screen.getByText("Copy")).toBeInTheDocument();
      expect(screen.getByText("Paste")).toBeInTheDocument();
    });

    it("styles the container via the S2 style macro", () => {
      // The styled layer applies the S2 `style` macro (Tailwind-removal Phase 0),
      // so the container carries a generated atomic class string rather than the
      // former invented `vui-action-group` Tailwind class.
      render(() => (
        <ActionGroup items={items} aria-label="Edit">
          {(item) => item.label}
        </ActionGroup>
      ));
      const group = screen.getByRole("toolbar");
      expect(group.getAttribute("class")).toBeTruthy();
    });

    it("applies custom class", () => {
      const { container } = render(() => (
        <ActionGroup items={items} aria-label="Edit" class="my-custom">
          {(item) => item.label}
        </ActionGroup>
      ));
      expect(container.querySelector(".my-custom")).toBeInTheDocument();
    });
  });

  describe("roles", () => {
    it("renders toolbar role for none selection", () => {
      render(() => (
        <ActionGroup items={items} aria-label="Edit">
          {(item) => item.label}
        </ActionGroup>
      ));
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });

    it("renders radiogroup for single selection", () => {
      render(() => (
        <ActionGroup items={items} selectionMode="single" aria-label="Edit">
          {(item) => item.label}
        </ActionGroup>
      ));
      expect(screen.getByRole("radiogroup")).toBeInTheDocument();
    });
  });

  describe("selection styling", () => {
    it("applies selected styles to selected item", () => {
      const { container } = render(() => (
        <ActionGroup
          items={items}
          selectionMode="single"
          defaultSelectedKeys={["copy"]}
          aria-label="Edit"
        />
      ));

      const selected = container.querySelector("[data-selected]");
      expect(selected).toBeInTheDocument();
    });

    it("calls onSelectionChange on click", () => {
      const onSelectionChange = vi.fn();
      render(() => (
        <ActionGroup
          items={items}
          selectionMode="single"
          aria-label="Edit"
          onSelectionChange={onSelectionChange}
        />
      ));

      fireEvent.click(screen.getByRole("radio", { name: "Cut" }));
      expect(onSelectionChange).toHaveBeenCalled();
    });

    it("calls onAction in none selection mode", () => {
      const onAction = vi.fn();
      render(() => <ActionGroup items={items} aria-label="Edit" onAction={onAction} />);

      fireEvent.click(screen.getByRole("button", { name: "Cut" }));
      expect(onAction).toHaveBeenCalledWith("cut");
    });
  });

  describe("orientation", () => {
    it("defaults to horizontal orientation", () => {
      const { container } = render(() => (
        <ActionGroup items={items} aria-label="Edit">
          {(item) => item.label}
        </ActionGroup>
      ));
      expect(container.querySelector('[data-orientation="horizontal"]')).toBeInTheDocument();
    });

    it("supports vertical orientation", () => {
      const { container } = render(() => (
        <ActionGroup items={items} orientation="vertical" aria-label="Edit">
          {(item) => item.label}
        </ActionGroup>
      ));
      expect(container.querySelector('[data-orientation="vertical"]')).toBeInTheDocument();
    });
  });

  describe("disabled state", () => {
    it("disables specific items", () => {
      render(() => (
        <ActionGroup
          items={items}
          selectionMode="single"
          disabledKeys={["paste"]}
          aria-label="Edit"
        />
      ));

      const paste = screen.getByRole("radio", { name: "Paste" });
      expect(paste).toBeDisabled();
    });

    it("disables entire group", () => {
      render(() => (
        <ActionGroup items={items} isDisabled aria-label="Edit">
          {(item) => item.label}
        </ActionGroup>
      ));

      const group = screen.getByRole("toolbar");
      expect(group).toHaveAttribute("data-disabled", "true");
    });
  });

  describe("keyboard navigation", () => {
    it("navigates with arrow keys", () => {
      render(() => (
        <ActionGroup items={items} aria-label="Edit">
          {(item) => item.label}
        </ActionGroup>
      ));

      const cut = screen.getByRole("button", { name: "Cut" });
      const copy = screen.getByRole("button", { name: "Copy" });
      cut.focus();
      fireEvent.keyDown(cut, { key: "ArrowRight" });
      expect(document.activeElement).toBe(copy);
    });
  });

  describe("custom renderItem", () => {
    it("supports children render function", () => {
      render(() => (
        <ActionGroup items={items} aria-label="Edit">
          {(item) => <span data-testid={`child-${item.id}`}>{item.label} child</span>}
        </ActionGroup>
      ));

      expect(screen.getByTestId("child-cut")).toHaveTextContent("Cut child");
      expect(screen.queryByText("Cut!")).not.toBeInTheDocument();
    });

    it("renders custom item content via renderItem prop", () => {
      render(() => (
        <ActionGroup
          items={items}
          aria-label="Edit"
          renderItem={(item) => <span data-testid={`custom-${item.id}`}>{item.label}!</span>}
        />
      ));

      expect(screen.getByTestId("custom-cut")).toHaveTextContent("Cut!");
    });

    it("defaults to item.label when no renderItem or children", () => {
      render(() => <ActionGroup items={items} aria-label="Edit" />);

      expect(screen.getByText("Cut")).toBeInTheDocument();
    });
  });
});
