/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { ActionBar, ActionBarContainer, ActionBarContext } from "../src/actionbar";

describe("ActionBar (solid-spectrum)", () => {
  describe("basic rendering", () => {
    it("renders when items are selected", () => {
      render(() => (
        <ActionBar selectedItemCount={3} onClearSelection={() => {}}>
          <button>Delete</button>
        </ActionBar>
      ));
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });

    it("renders with vui-action-bar class", () => {
      const { container } = render(() => (
        <ActionBar selectedItemCount={1} onClearSelection={() => {}}>
          <button>Edit</button>
        </ActionBar>
      ));
      expect(container.querySelector(".vui-action-bar")).toBeInTheDocument();
    });

    it("applies custom class", () => {
      const { container } = render(() => (
        <ActionBar selectedItemCount={1} onClearSelection={() => {}} class="my-bar">
          <button>Edit</button>
        </ActionBar>
      ));
      expect(container.querySelector(".my-bar")).toBeInTheDocument();
    });

    it("hides when selectedItemCount is 0", () => {
      render(() => (
        <ActionBar selectedItemCount={0} onClearSelection={() => {}}>
          <button>Edit</button>
        </ActionBar>
      ));
      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });

    it("hides when selectedItemCount is omitted", () => {
      render(() => (
        <ActionBar>
          <button>Edit</button>
        </ActionBar>
      ));
      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });

    it("applies emphasized, unsafe, style, and ref props", () => {
      let actionBarElement: HTMLDivElement | undefined;
      const { container } = render(() => (
        <ActionBar
          selectedItemCount={1}
          onClearSelection={() => {}}
          isEmphasized
          UNSAFE_className="unsafe-action-bar"
          UNSAFE_style={{ margin: "4px" }}
          styles={"generated-action-bar" as never}
          ref={(element) => {
            actionBarElement = element;
          }}
        >
          <button>Edit</button>
        </ActionBar>
      ));

      const toolbar = screen.getByRole("toolbar");
      expect(actionBarElement).toBe(toolbar);
      expect(container.querySelector(".vui-action-bar--emphasized")).toBeInTheDocument();
      expect(container.querySelector(".unsafe-action-bar")).toBeInTheDocument();
      expect(container.querySelector(".generated-action-bar")).toBeInTheDocument();
      expect(toolbar).toHaveStyle({ margin: "4px" });
    });
  });

  describe("selection count", () => {
    it("shows selection count text", () => {
      render(() => (
        <ActionBar selectedItemCount={5} onClearSelection={() => {}}>
          <button>Delete</button>
        </ActionBar>
      ));
      expect(screen.getByText("5 selected")).toBeInTheDocument();
    });

    it('shows "All selected" for all', () => {
      render(() => (
        <ActionBar selectedItemCount="all" onClearSelection={() => {}}>
          <button>Delete</button>
        </ActionBar>
      ));
      expect(screen.getByText("All selected")).toBeInTheDocument();
    });
  });

  describe("clear button", () => {
    it("renders clear selection button", () => {
      render(() => (
        <ActionBar selectedItemCount={2} onClearSelection={() => {}}>
          <button>Edit</button>
        </ActionBar>
      ));
      expect(screen.getByRole("button", { name: "Clear selection" })).toBeInTheDocument();
    });

    it("calls onClearSelection on clear click", () => {
      const onClear = vi.fn();
      render(() => (
        <ActionBar selectedItemCount={2} onClearSelection={onClear}>
          <button>Edit</button>
        </ActionBar>
      ));
      fireEvent.click(screen.getByRole("button", { name: "Clear selection" }));
      expect(onClear).toHaveBeenCalledOnce();
    });

    it("does not require an onClearSelection handler", () => {
      render(() => (
        <ActionBar selectedItemCount={2}>
          <button>Edit</button>
        </ActionBar>
      ));

      expect(() =>
        fireEvent.click(screen.getByRole("button", { name: "Clear selection" })),
      ).not.toThrow();
    });
  });

  describe("context", () => {
    it("merges ActionBarContext props and refs", () => {
      let actionBarElement: HTMLDivElement | undefined;
      render(() => (
        <ActionBarContext.Provider
          value={{
            selectedItemCount: 2,
            onClearSelection: () => {},
            UNSAFE_className: "context-action-bar",
            UNSAFE_style: { margin: "6px" },
            ref: (element) => {
              actionBarElement = element;
            },
          }}
        >
          <ActionBar>
            <button>Edit</button>
          </ActionBar>
        </ActionBarContext.Provider>
      ));

      const toolbar = screen.getByRole("toolbar");
      expect(actionBarElement).toBe(toolbar);
      expect(toolbar).toHaveClass("context-action-bar");
      expect(toolbar).toHaveStyle({ margin: "6px" });
      expect(screen.getByText("2 selected")).toBeInTheDocument();
    });

    it("lets local props override ActionBarContext selected count", () => {
      render(() => (
        <ActionBarContext.Provider value={{ selectedItemCount: 2, onClearSelection: () => {} }}>
          <ActionBar selectedItemCount={0}>
            <button>Edit</button>
          </ActionBar>
        </ActionBarContext.Provider>
      ));

      expect(screen.queryByRole("toolbar")).not.toBeInTheDocument();
    });
  });

  describe("action children", () => {
    it("renders action buttons", () => {
      render(() => (
        <ActionBar selectedItemCount={1} onClearSelection={() => {}}>
          <button>Edit</button>
          <button>Delete</button>
        </ActionBar>
      ));
      expect(screen.getByText("Edit")).toBeInTheDocument();
      expect(screen.getByText("Delete")).toBeInTheDocument();
    });
  });

  describe("keyboard", () => {
    it("clears selection on Escape", () => {
      const onClear = vi.fn();
      render(() => (
        <ActionBar selectedItemCount={3} onClearSelection={onClear}>
          <button>Delete</button>
        </ActionBar>
      ));
      const toolbar = screen.getByRole("toolbar");
      fireEvent.keyDown(toolbar, { key: "Escape" });
      expect(onClear).toHaveBeenCalledOnce();
    });

    it("supports toolbar arrow and Home/End navigation", () => {
      render(() => (
        <ActionBar selectedItemCount={3} onClearSelection={() => {}}>
          <button>Edit</button>
          <button>Delete</button>
        </ActionBar>
      ));

      const clear = screen.getByRole("button", { name: "Clear selection" });
      const edit = screen.getByRole("button", { name: "Edit" });
      const del = screen.getByRole("button", { name: "Delete" });

      edit.focus();
      fireEvent.keyDown(edit, { key: "ArrowRight" });
      expect(document.activeElement).toBe(del);

      fireEvent.keyDown(del, { key: "Home" });
      expect(document.activeElement).toBe(clear);

      fireEvent.keyDown(clear, { key: "End" });
      expect(document.activeElement).toBe(del);
    });
  });

  describe("ActionBarContainer", () => {
    it("wraps collection and action bar", () => {
      const { container } = render(() => (
        <ActionBarContainer>
          <div data-testid="table">Table content</div>
          <ActionBar selectedItemCount={2} onClearSelection={() => {}}>
            <button>Delete</button>
          </ActionBar>
        </ActionBarContainer>
      ));

      expect(container.querySelector(".vui-action-bar-container")).toBeInTheDocument();
      expect(screen.getByTestId("table")).toBeInTheDocument();
      expect(screen.getByRole("toolbar")).toBeInTheDocument();
    });
  });
});
