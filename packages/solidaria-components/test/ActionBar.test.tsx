/**
 * @vitest-environment jsdom
 */
import { afterEach, describe, it, expect, vi } from "vite-plus/test";
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

/**
 * The headless ActionBar root is a PLAIN container with NO `role` — faithful to
 * S2 `ActionBar` (ActionBar.tsx:192), whose root carries only an Escape
 * `keyboardProps` handler. The single `toolbar` is the inner `ActionButtonGroup`
 * added at the styled layer, NOT this root; giving the root a `toolbar` role
 * would force that inner group's role to downgrade to `group` (the divergence
 * the ActionBar pair-oracle cert caught). The stable hook for the root is its
 * `data-open` attribute.
 */
const queryActionBar = () => document.querySelector<HTMLDivElement>("[data-open]");
const getActionBar = (): HTMLDivElement => {
  const el = queryActionBar();
  if (!el) throw new Error("ActionBar root not found");
  return el;
};

describe("ActionBar (headless)", () => {
  describe("visibility", () => {
    it("hides when selectedItemCount is 0", () => {
      render(() => (
        <ActionBar selectedItemCount={0} onClearSelection={() => {}}>
          <span>actions</span>
        </ActionBar>
      ));
      expect(queryActionBar()).not.toBeInTheDocument();
    });

    it("hides when selectedItemCount is omitted", () => {
      render(() => (
        <ActionBar>
          <span>actions</span>
        </ActionBar>
      ));
      expect(queryActionBar()).not.toBeInTheDocument();
    });

    it("shows when selectedItemCount > 0", () => {
      render(() => (
        <ActionBar selectedItemCount={3} onClearSelection={() => {}}>
          <span>actions</span>
        </ActionBar>
      ));
      expect(queryActionBar()).toBeInTheDocument();
    });

    it('shows when selectedItemCount is "all"', () => {
      render(() => (
        <ActionBar selectedItemCount="all" onClearSelection={() => {}}>
          <span>actions</span>
        </ActionBar>
      ));
      expect(queryActionBar()).toBeInTheDocument();
    });

    it("hides when count changes from positive to 0", () => {
      const [count, setCount] = createSignal(3);
      render(() => (
        <ActionBar selectedItemCount={count()} onClearSelection={() => setCount(0)}>
          <span>actions</span>
        </ActionBar>
      ));

      expect(queryActionBar()).toBeInTheDocument();
      setCount(0);
      expect(queryActionBar()).not.toBeInTheDocument();
    });
  });

  describe("roles and attributes", () => {
    it("renders a plain container with no toolbar role (S2 parity)", () => {
      render(() => (
        <ActionBar selectedItemCount={1} onClearSelection={() => {}}>
          <span>actions</span>
        </ActionBar>
      ));
      // S2's ActionBar root is roleless — the toolbar lives on the inner
      // ActionButtonGroup (styled layer), never the root.
      expect(queryActionBar()).toBeInTheDocument();
      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });

    it("does not label the root — the label belongs on the inner actions toolbar", () => {
      render(() => (
        <ActionBar selectedItemCount={1} onClearSelection={() => {}} aria-label="Bulk actions">
          <span>actions</span>
        </ActionBar>
      ));
      // The `aria-label` prop is consumed by the styled ActionButtonGroup, never
      // stamped on this roleless container (which S2 leaves unlabelled).
      expect(getActionBar()).not.toHaveAttribute("aria-label");
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

      const root = screen.getByTestId("bulk-action-bar");
      expect(actionBarElement).toBe(root);
      expect(root).toHaveAttribute("data-state", "selected");
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

      const root = getActionBar();
      expect(root).toHaveClass("bulk-open");
      expect(root).toHaveClass("selected-2");
      expect(root).toHaveStyle({ opacity: "1" });

      setCount("all");
      expect(root).toHaveClass("bulk-open");
      expect(root).toHaveClass("selected-all");
      expect(root).toHaveStyle({ opacity: "0.75" });
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

      fireEvent.keyDown(getActionBar(), { key: "Escape" });
      expect(onClear).toHaveBeenCalledOnce();
    });

    it("does not call onClearSelection on other keys", () => {
      const onClear = vi.fn();
      render(() => (
        <ActionBar selectedItemCount={5} onClearSelection={onClear}>
          <button>Delete</button>
        </ActionBar>
      ));

      fireEvent.keyDown(getActionBar(), { key: "Enter" });
      expect(onClear).not.toHaveBeenCalled();
    });

    it("calls user onKeyDown handler and respects defaultPrevented", () => {
      const onClear = vi.fn();
      const onKeyDown = vi.fn((e: KeyboardEvent) => e.preventDefault());

      render(() => (
        <ActionBar selectedItemCount={5} onClearSelection={onClear} onKeyDown={onKeyDown}>
          <button>Delete</button>
        </ActionBar>
      ));

      fireEvent.keyDown(getActionBar(), { key: "Escape" });
      expect(onKeyDown).toHaveBeenCalledOnce();
      expect(onClear).not.toHaveBeenCalled();
    });

    it("does not require an onClearSelection handler", () => {
      render(() => (
        <ActionBar selectedItemCount={5}>
          <ActionBarClearButton />
        </ActionBar>
      ));

      expect(() => fireEvent.keyDown(getActionBar(), { key: "Escape" })).not.toThrow();
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
      expect(queryActionBar()).toBeInTheDocument();
      expect(container.firstElementChild).toHaveStyle({ position: "relative" });
    });
  });

  describe("a11y validation", () => {
    it("axe: selection container with count, clear button, and actions", async () => {
      const { container } = render(() => (
        <ActionBar selectedItemCount={2} onClearSelection={() => {}}>
          <ActionBarSelectionCount />
          <ActionBarClearButton />
          <button>Delete</button>
        </ActionBar>
      ));

      await assertNoA11yViolations(container);
    });

    it("ARIA ID: labelled selection has no dangling refs", () => {
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
