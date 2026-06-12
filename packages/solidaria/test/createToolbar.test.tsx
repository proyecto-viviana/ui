/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { createToolbar } from "../src/toolbar";
import { I18nProvider } from "../src/i18n";

// Test component that uses createToolbar
function TestToolbar(props: {
  orientation?: "horizontal" | "vertical";
  "aria-label"?: string;
  "aria-labelledby"?: string;
  children?: any;
}) {
  const { toolbarProps, orientation } = createToolbar({
    get orientation() {
      return props.orientation;
    },
    get "aria-label"() {
      return props["aria-label"];
    },
    get "aria-labelledby"() {
      return props["aria-labelledby"];
    },
  });

  return (
    <div {...toolbarProps} data-testid="toolbar" data-orientation={orientation()}>
      {props.children}
    </div>
  );
}

describe("createToolbar", () => {
  it('should render with role="toolbar"', () => {
    render(() => <TestToolbar aria-label="Tools" />);
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toBeInTheDocument();
  });

  it("should have default horizontal orientation", () => {
    render(() => <TestToolbar aria-label="Tools" />);
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
  });

  it("should support vertical orientation", () => {
    render(() => <TestToolbar orientation="vertical" aria-label="Tools" />);
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute("aria-orientation", "vertical");
  });

  it("should support aria-label", () => {
    render(() => <TestToolbar aria-label="Text formatting" />);
    const toolbar = screen.getByLabelText("Text formatting");
    expect(toolbar).toBeInTheDocument();
  });

  it("should support aria-labelledby", () => {
    render(() => (
      <>
        <span id="toolbar-label">Tools</span>
        <TestToolbar aria-labelledby="toolbar-label" />
      </>
    ));
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute("aria-labelledby", "toolbar-label");
  });

  it("should prefer aria-label over aria-labelledby when both provided", () => {
    render(() => (
      <>
        <span id="toolbar-label">From labelledby</span>
        <TestToolbar aria-label="From label" aria-labelledby="toolbar-label" />
      </>
    ));
    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute("aria-label", "From label");
    expect(toolbar).not.toHaveAttribute("aria-labelledby");
  });

  describe("keyboard navigation", () => {
    it("should navigate forward with ArrowRight in horizontal orientation", () => {
      render(() => (
        <TestToolbar aria-label="Tools">
          <button>Cut</button>
          <button>Copy</button>
          <button>Paste</button>
        </TestToolbar>
      ));

      const buttons = screen.getAllByRole("button");
      buttons[0].focus();
      expect(document.activeElement).toBe(buttons[0]);

      fireEvent.keyDown(buttons[0], { key: "ArrowRight" });
      expect(document.activeElement).toBe(buttons[1]);

      fireEvent.keyDown(buttons[1], { key: "ArrowRight" });
      expect(document.activeElement).toBe(buttons[2]);
    });

    it("should navigate backward with ArrowLeft in horizontal orientation", () => {
      render(() => (
        <TestToolbar aria-label="Tools">
          <button>Cut</button>
          <button>Copy</button>
          <button>Paste</button>
        </TestToolbar>
      ));

      const buttons = screen.getAllByRole("button");
      buttons[2].focus();

      fireEvent.keyDown(buttons[2], { key: "ArrowLeft" });
      expect(document.activeElement).toBe(buttons[1]);

      fireEvent.keyDown(buttons[1], { key: "ArrowLeft" });
      expect(document.activeElement).toBe(buttons[0]);
    });

    it("should navigate with ArrowDown/Up in vertical orientation", () => {
      render(() => (
        <TestToolbar orientation="vertical" aria-label="Tools">
          <button>Cut</button>
          <button>Copy</button>
          <button>Paste</button>
        </TestToolbar>
      ));

      const buttons = screen.getAllByRole("button");
      buttons[0].focus();

      fireEvent.keyDown(buttons[0], { key: "ArrowDown" });
      expect(document.activeElement).toBe(buttons[1]);

      fireEvent.keyDown(buttons[1], { key: "ArrowUp" });
      expect(document.activeElement).toBe(buttons[0]);
    });

    it("should navigate to first and last with Home/End", () => {
      render(() => (
        <TestToolbar aria-label="Tools">
          <button>Cut</button>
          <button>Copy</button>
          <button>Paste</button>
        </TestToolbar>
      ));

      const buttons = screen.getAllByRole("button");
      buttons[1].focus();
      expect(document.activeElement).toBe(buttons[1]);

      fireEvent.keyDown(buttons[1], { key: "End" });
      expect(document.activeElement).toBe(buttons[2]);

      fireEvent.keyDown(buttons[2], { key: "Home" });
      expect(document.activeElement).toBe(buttons[0]);
    });

    it("should not wrap at boundaries", () => {
      render(() => (
        <TestToolbar aria-label="Tools">
          <button>First</button>
          <button>Last</button>
        </TestToolbar>
      ));

      const buttons = screen.getAllByRole("button");

      // At start, ArrowLeft should not move
      buttons[0].focus();
      fireEvent.keyDown(buttons[0], { key: "ArrowLeft" });
      expect(document.activeElement).toBe(buttons[0]);

      // At end, ArrowRight should not move
      buttons[1].focus();
      fireEvent.keyDown(buttons[1], { key: "ArrowRight" });
      expect(document.activeElement).toBe(buttons[1]);
    });

    it("should ignore perpendicular arrows in horizontal orientation", () => {
      render(() => (
        <TestToolbar aria-label="Tools">
          <button>Cut</button>
          <button>Copy</button>
        </TestToolbar>
      ));

      const buttons = screen.getAllByRole("button");
      buttons[0].focus();

      fireEvent.keyDown(buttons[0], { key: "ArrowDown" });
      expect(document.activeElement).toBe(buttons[0]);

      fireEvent.keyDown(buttons[0], { key: "ArrowUp" });
      expect(document.activeElement).toBe(buttons[0]);
    });

    it("should ignore perpendicular arrows in vertical orientation", () => {
      render(() => (
        <TestToolbar orientation="vertical" aria-label="Tools">
          <button>Cut</button>
          <button>Copy</button>
        </TestToolbar>
      ));

      const buttons = screen.getAllByRole("button");
      buttons[0].focus();

      fireEvent.keyDown(buttons[0], { key: "ArrowRight" });
      expect(document.activeElement).toBe(buttons[0]);

      fireEvent.keyDown(buttons[0], { key: "ArrowLeft" });
      expect(document.activeElement).toBe(buttons[0]);
    });

    it("should not hijack arrow/home/end keys from text inputs", () => {
      render(() => (
        <TestToolbar aria-label="Tools">
          <input aria-label="Search" />
          <button>Apply</button>
        </TestToolbar>
      ));

      const search = screen.getByRole("textbox", { name: "Search" });
      const apply = screen.getByRole("button", { name: "Apply" });

      search.focus();
      expect(document.activeElement).toBe(search);

      fireEvent.keyDown(search, { key: "ArrowRight" });
      expect(document.activeElement).toBe(search);

      fireEvent.keyDown(search, { key: "End" });
      expect(document.activeElement).toBe(search);

      fireEvent.keyDown(search, { key: "Home" });
      expect(document.activeElement).toBe(search);

      apply.focus();
      fireEvent.keyDown(apply, { key: "ArrowLeft" });
      expect(document.activeElement).toBe(search);
    });
  });

  describe("RTL support", () => {
    it("should reverse arrow keys in RTL", () => {
      render(() => (
        <I18nProvider locale="he-IL">
          <TestToolbar aria-label="Tools">
            <button>Cut</button>
            <button>Copy</button>
            <button>Paste</button>
          </TestToolbar>
        </I18nProvider>
      ));

      const buttons = screen.getAllByRole("button");
      buttons[0].focus();

      // In RTL, ArrowLeft should go forward (visually right-to-left)
      fireEvent.keyDown(buttons[0], { key: "ArrowLeft" });
      expect(document.activeElement).toBe(buttons[1]);

      // ArrowRight should go backward
      fireEvent.keyDown(buttons[1], { key: "ArrowRight" });
      expect(document.activeElement).toBe(buttons[0]);
    });
  });

  describe("nested toolbars", () => {
    function NestedToolbar() {
      const outer = createToolbar({ "aria-label": "Outer" });
      const inner = createToolbar({ "aria-label": "Inner" });

      return (
        <div {...outer.toolbarProps} data-testid="outer">
          <div {...inner.toolbarProps} data-testid="inner">
            <button>Nested</button>
          </div>
        </div>
      );
    }

    it('should render nested toolbar as role="group"', () => {
      render(() => <NestedToolbar />);

      const outer = screen.getByTestId("outer");
      const inner = screen.getByTestId("inner");

      expect(outer).toHaveAttribute("role", "toolbar");
      expect(inner).toHaveAttribute("role", "group");
      expect(inner).not.toHaveAttribute("aria-orientation");
    });
  });
});
