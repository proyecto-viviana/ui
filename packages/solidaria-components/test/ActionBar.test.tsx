/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { destroyAnnouncer } from "@proyecto-viviana/solidaria";
import {
  assertAriaIdIntegrity,
  assertNoA11yViolations,
} from "@proyecto-viviana/solidaria-test-utils";
import {
  ActionBar,
  ActionBarContainer,
  ActionBarSelectionCount,
  ActionBarClearButton,
} from "../src/ActionBar";

afterEach(() => {
  destroyAnnouncer();
});

describe("ActionBar (headless)", () => {
  describe("visibility", () => {
    it("hides when selectedItemCount is 0", () => {
      render(() => (
        <ActionBar selectedItemCount={0} onClearSelection={() => {}}>
          <span>actions</span>
        </ActionBar>
      ));
      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });

    it("hides when selectedItemCount is omitted", () => {
      render(() => (
        <ActionBar>
          <span>actions</span>
        </ActionBar>
      ));
      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });

    it("shows when selectedItemCount > 0", () => {
      render(() => (
        <ActionBar selectedItemCount={3} onClearSelection={() => {}}>
          <span>actions</span>
        </ActionBar>
      ));
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });

    it('shows when selectedItemCount is "all"', () => {
      render(() => (
        <ActionBar selectedItemCount="all" onClearSelection={() => {}}>
          <span>actions</span>
        </ActionBar>
      ));
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });

    it("hides when count changes from positive to 0", () => {
      const [count, setCount] = createSignal(3);
      render(() => (
        <ActionBar selectedItemCount={count()} onClearSelection={() => setCount(0)}>
          <span>actions</span>
        </ActionBar>
      ));

      expect(screen.getByRole("toolbar")).toBeInTheDocument();
      setCount(0);
      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });
  });

  describe("roles and attributes", () => {
    it("renders with toolbar role", () => {
      render(() => (
        <ActionBar selectedItemCount={1} onClearSelection={() => {}}>
          <span>actions</span>
        </ActionBar>
      ));
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });

    it('has default aria-label "Actions"', () => {
      render(() => (
        <ActionBar selectedItemCount={1} onClearSelection={() => {}}>
          <span>actions</span>
        </ActionBar>
      ));
      expect(screen.getByRole("toolbar")).toHaveAttribute("aria-label", "Actions");
    });

    it("supports custom aria-label", () => {
      render(() => (
        <ActionBar selectedItemCount={1} onClearSelection={() => {}} aria-label="Bulk actions">
          <span>actions</span>
        </ActionBar>
      ));
      expect(screen.getByRole("toolbar")).toHaveAttribute("aria-label", "Bulk actions");
    });

    it("supports aria-labelledby without forcing aria-label fallback", () => {
      render(() => (
        <>
          <span id="bulk-actions-label">Bulk actions</span>
          <ActionBar
            selectedItemCount={1}
            onClearSelection={() => {}}
            aria-labelledby="bulk-actions-label"
          >
            <span>actions</span>
          </ActionBar>
        </>
      ));

      const toolbar = screen.getByRole("toolbar");
      expect(toolbar).toHaveAttribute("aria-labelledby", "bulk-actions-label");
      expect(toolbar).not.toHaveAttribute("aria-label");
    });

    it("forwards refs and DOM data attributes", () => {
      let actionBarElement: HTMLDivElement | undefined;
      render(() => (
        <ActionBar
          selectedItemCount={1}
          onClearSelection={() => {}}
          ref={(element) => {
            actionBarElement = element;
          }}
          data-testid="bulk-action-bar"
          data-state="selected"
        >
          <span>actions</span>
        </ActionBar>
      ));

      const toolbar = screen.getByTestId("bulk-action-bar");
      expect(actionBarElement).toBe(toolbar);
      expect(toolbar).toHaveAttribute("data-state", "selected");
    });
  });

  describe("render props", () => {
    it("updates class and style render props when selectedItemCount changes", () => {
      const [count, setCount] = createSignal<number | "all">(2);

      render(() => (
        <ActionBar
          selectedItemCount={count()}
          onClearSelection={() => {}}
          class={({ isOpen, selectedItemCount }) =>
            `bulk-${isOpen ? "open" : "closed"} selected-${selectedItemCount}`
          }
          style={({ selectedItemCount }) => ({
            opacity: selectedItemCount === "all" ? 0.75 : 1,
          })}
        >
          <span>actions</span>
        </ActionBar>
      ));

      const toolbar = screen.getByRole("toolbar");
      expect(toolbar).toHaveClass("bulk-open");
      expect(toolbar).toHaveClass("selected-2");
      expect(toolbar).toHaveStyle({ opacity: "1" });

      setCount("all");
      expect(toolbar).toHaveClass("bulk-open");
      expect(toolbar).toHaveClass("selected-all");
      expect(toolbar).toHaveStyle({ opacity: "0.75" });
    });
  });

  describe("keyboard", () => {
    it("calls onClearSelection on Escape", () => {
      const onClear = vi.fn();
      render(() => (
        <ActionBar selectedItemCount={5} onClearSelection={onClear}>
          <button>Delete</button>
        </ActionBar>
      ));

      const toolbar = screen.getByRole("toolbar");
      fireEvent.keyDown(toolbar, { key: "Escape" });
      expect(onClear).toHaveBeenCalledOnce();
    });

    it("does not call onClearSelection on other keys", () => {
      const onClear = vi.fn();
      render(() => (
        <ActionBar selectedItemCount={5} onClearSelection={onClear}>
          <button>Delete</button>
        </ActionBar>
      ));

      const toolbar = screen.getByRole("toolbar");
      fireEvent.keyDown(toolbar, { key: "Enter" });
      expect(onClear).not.toHaveBeenCalled();
    });

    it("supports toolbar arrow and Home/End navigation between actions", () => {
      render(() => (
        <ActionBar selectedItemCount={5} onClearSelection={() => {}}>
          <button>Edit</button>
          <button>Duplicate</button>
          <button>Delete</button>
        </ActionBar>
      ));

      const edit = screen.getByRole("button", { name: "Edit" });
      const duplicate = screen.getByRole("button", { name: "Duplicate" });
      const del = screen.getByRole("button", { name: "Delete" });

      edit.focus();
      fireEvent.keyDown(edit, { key: "ArrowRight" });
      expect(document.activeElement).toBe(duplicate);

      fireEvent.keyDown(duplicate, { key: "End" });
      expect(document.activeElement).toBe(del);

      fireEvent.keyDown(del, { key: "Home" });
      expect(document.activeElement).toBe(edit);
    });

    it("calls user onKeyDown handler and respects defaultPrevented", () => {
      const onClear = vi.fn();
      const onKeyDown = vi.fn((e: KeyboardEvent) => e.preventDefault());

      render(() => (
        <ActionBar selectedItemCount={5} onClearSelection={onClear} onKeyDown={onKeyDown}>
          <button>Delete</button>
        </ActionBar>
      ));

      const toolbar = screen.getByRole("toolbar");
      fireEvent.keyDown(toolbar, { key: "Escape" });
      expect(onKeyDown).toHaveBeenCalledOnce();
      expect(onClear).not.toHaveBeenCalled();
    });

    it("does not require an onClearSelection handler", () => {
      render(() => (
        <ActionBar selectedItemCount={5}>
          <ActionBarClearButton />
        </ActionBar>
      ));

      const toolbar = screen.getByRole("toolbar");
      expect(() => fireEvent.keyDown(toolbar, { key: "Escape" })).not.toThrow();
      expect(() =>
        fireEvent.click(screen.getByRole("button", { name: "Clear selection" })),
      ).not.toThrow();
    });
  });

  describe("announcements", () => {
    it("announces a custom actions-available message when opened", () => {
      const [count, setCount] = createSignal(0);

      render(() => (
        <ActionBar
          selectedItemCount={count()}
          onClearSelection={() => {}}
          actionsAvailableMessage="Acciones disponibles."
        >
          <button>Edit</button>
        </ActionBar>
      ));

      setCount(1);

      expect(screen.getByText("Acciones disponibles.")).toBeInTheDocument();
    });
  });

  describe("SelectionCount", () => {
    it("shows count text", () => {
      render(() => (
        <ActionBar selectedItemCount={3} onClearSelection={() => {}}>
          <ActionBarSelectionCount />
        </ActionBar>
      ));
      expect(screen.getByText("3 selected")).toBeInTheDocument();
    });

    it('shows "All selected" for "all"', () => {
      render(() => (
        <ActionBar selectedItemCount="all" onClearSelection={() => {}}>
          <ActionBarSelectionCount />
        </ActionBar>
      ));
      expect(screen.getByText("All selected")).toBeInTheDocument();
    });

    it('shows "1 selected" for single item', () => {
      render(() => (
        <ActionBar selectedItemCount={1} onClearSelection={() => {}}>
          <ActionBarSelectionCount />
        </ActionBar>
      ));
      expect(screen.getByText("1 selected")).toBeInTheDocument();
    });
  });

  describe("ClearButton", () => {
    it("renders with default aria-label", () => {
      render(() => (
        <ActionBar selectedItemCount={2} onClearSelection={() => {}}>
          <ActionBarClearButton />
        </ActionBar>
      ));
      expect(screen.getByRole("button", { name: "Clear selection" })).toBeInTheDocument();
    });

    it("calls onClearSelection on click", () => {
      const onClear = vi.fn();
      render(() => (
        <ActionBar selectedItemCount={2} onClearSelection={onClear}>
          <ActionBarClearButton />
        </ActionBar>
      ));
      fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
      expect(onClear).toHaveBeenCalledOnce();
    });

    it("supports custom aria-label", () => {
      render(() => (
        <ActionBar selectedItemCount={2} onClearSelection={() => {}}>
          <ActionBarClearButton aria-label="Deselect all" />
        </ActionBar>
      ));
      expect(screen.getByRole("button", { name: "Deselect all" })).toBeInTheDocument();
    });

    it("renders custom children", () => {
      render(() => (
        <ActionBar selectedItemCount={2} onClearSelection={() => {}}>
          <ActionBarClearButton>Clear</ActionBarClearButton>
        </ActionBar>
      ));
      expect(screen.getByText("Clear")).toBeInTheDocument();
    });
  });

  describe("ActionBarContainer", () => {
    it("renders children with relative positioning", () => {
      const { container } = render(() => (
        <ActionBarContainer>
          <div data-testid="collection">Table here</div>
          <ActionBar selectedItemCount={1} onClearSelection={() => {}}>
            <span>actions</span>
          </ActionBar>
        </ActionBarContainer>
      ));

      expect(screen.getByTestId("collection")).toBeInTheDocument();
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
      expect(container.firstElementChild).toHaveStyle({ position: "relative" });
    });
  });

  describe("a11y validation", () => {
    it("axe: selected toolbar with count, clear button, and actions", async () => {
      const { container } = render(() => (
        <ActionBar selectedItemCount={2} onClearSelection={() => {}}>
          <ActionBarSelectionCount />
          <ActionBarClearButton />
          <button>Delete</button>
        </ActionBar>
      ));

      await assertNoA11yViolations(container);
    });

    it("ARIA ID: labelled toolbar has no dangling refs", () => {
      render(() => (
        <>
          <span id="bulk-actions-label">Bulk actions</span>
          <ActionBar
            selectedItemCount={2}
            onClearSelection={() => {}}
            aria-labelledby="bulk-actions-label"
          >
            <ActionBarSelectionCount />
            <button>Delete</button>
          </ActionBar>
        </>
      ));

      assertAriaIdIntegrity(document.body);
    });
  });
});
