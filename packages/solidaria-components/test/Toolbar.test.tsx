/**
 * @vitest-environment jsdom
 */
import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { Toolbar, ToolbarContext } from "../src/Toolbar";
import { Button } from "../src/Button";
import { Separator } from "../src/Separator";
import { I18nProvider } from "@proyecto-viviana/solidaria";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";

describe("Toolbar", () => {
  it('renders with role="toolbar"', () => {
    render(() => (
      <Toolbar aria-label="Tools">
        {() => (
          <>
            <Button>Cut</Button>
            <Button>Copy</Button>
            <Button>Paste</Button>
          </>
        )}
      </Toolbar>
    ));

    const toolbar = screen.getByRole("toolbar");
    expect(screen.getAllByRole("button")).toHaveLength(3);
    expect(toolbar).toHaveClass("solidaria-Toolbar");
  });

  it("renders a custom classname and data-attributes", () => {
    render(() => (
      <Toolbar class="test" data-testid="foo" aria-label="Tools">
        {() => (
          <>
            <Button>Cut</Button>
            <Button>Copy</Button>
            <Button>Paste</Button>
          </>
        )}
      </Toolbar>
    ));

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveClass("test");
    expect(toolbar).toHaveAttribute("data-testid", "foo");
  });

  it("supports slots via ToolbarContext", () => {
    render(() => (
      <ToolbarContext.Provider value={{ slots: { test: { "aria-label": "test label" } } }}>
        <Toolbar slot="test">
          {() => (
            <>
              <Button>Cut</Button>
              <Button>Copy</Button>
              <Button>Paste</Button>
            </>
          )}
        </Toolbar>
      </ToolbarContext.Provider>
    ));

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute("slot", "test");
    expect(toolbar).toHaveAttribute("aria-label", "test label");
  });

  it("supports render props", () => {
    render(() => (
      <Toolbar aria-label="Tools">
        {({ orientation }) => (
          <div data-testid="foo" data-test={orientation}>
            <Button>Cut</Button>
            <Button>Copy</Button>
            <Button>Paste</Button>
          </div>
        )}
      </Toolbar>
    ));

    const wrapper = screen.getByTestId("foo");
    expect(wrapper).toHaveAttribute("data-test", "horizontal");
  });

  it("renders dividers", () => {
    const { rerender } = render(() => (
      <Toolbar aria-label="Tools">
        {() => (
          <>
            <Button>Cut</Button>
            <Separator orientation="vertical" />
            <Button>Copy</Button>
            <Separator orientation="vertical" />
            <Button>Paste</Button>
          </>
        )}
      </Toolbar>
    ));

    expect(screen.getAllByRole("separator")).toHaveLength(2);
  });

  it("sets aria-label", () => {
    render(() => (
      <>
        <span id="toolbar-label">Toolbar aria-labelledby</span>
        <Toolbar aria-label="Toolbar aria-label">{() => <Button>Cut</Button>}</Toolbar>
        <Toolbar aria-label="Toolbar aria-label 2" aria-labelledby="toolbar-id">
          {() => <Button>Paste</Button>}
        </Toolbar>
      </>
    ));

    expect(screen.getByLabelText("Toolbar aria-label")).not.toHaveAttribute("aria-labelledby");
    expect(screen.getByLabelText("Toolbar aria-label 2")).not.toHaveAttribute("aria-labelledby");
  });

  it("supports keyboard navigation horizontal", async () => {
    const user = setupUser();

    render(() => (
      <>
        <button>Before</button>
        <Toolbar aria-label="Tools">
          {() => (
            <>
              <Toolbar aria-label="Align text">
                {() => (
                  <>
                    <Button>Align left</Button>
                    <Button>Align center</Button>
                    <Button>Align right</Button>
                  </>
                )}
              </Toolbar>
              <Separator orientation="vertical" />
              <Toolbar aria-label="Zoom">
                {() => (
                  <>
                    <Button>Zoom in</Button>
                    <Button>Zoom out</Button>
                  </>
                )}
              </Toolbar>
            </>
          )}
        </Toolbar>
        <button>After</button>
      </>
    ));

    const alignLeft = screen.getByRole("button", { name: "Align left" });
    const alignCenter = screen.getByRole("button", { name: "Align center" });
    const alignRight = screen.getByRole("button", { name: "Align right" });
    const zoomIn = screen.getByRole("button", { name: "Zoom in" });
    const zoomOut = screen.getByRole("button", { name: "Zoom out" });

    // Focus first button
    alignLeft.focus();
    expect(document.activeElement).toBe(alignLeft);

    // Right arrow navigates forward
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(alignCenter);

    // Down arrow does nothing in horizontal orientation
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(alignCenter);

    // Continue navigating
    await user.keyboard("{ArrowRight}");
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(zoomIn);

    // Left arrow navigates backward
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(alignRight);

    // Arrow keys don't wrap
    zoomOut.focus();
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(zoomOut);

    alignLeft.focus();
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(alignLeft);
  });

  it("does not handle Home/End (upstream useToolbar parity)", async () => {
    const user = setupUser();

    render(() => (
      <Toolbar aria-label="Tools">
        {() => (
          <>
            <Button>Cut</Button>
            <Button>Copy</Button>
            <Button>Paste</Button>
          </>
        )}
      </Toolbar>
    ));

    const copy = screen.getByRole("button", { name: "Copy" });

    copy.focus();
    expect(document.activeElement).toBe(copy);

    // Upstream useToolbar only binds Arrow keys and Tab; Home/End fall through
    // to the browser default, so toolbar focus does not move.
    await user.keyboard("{End}");
    expect(document.activeElement).toBe(copy);

    await user.keyboard("{Home}");
    expect(document.activeElement).toBe(copy);
  });

  it("supports keyboard navigation vertical", async () => {
    const user = setupUser();

    render(() => (
      <>
        <button>Before</button>
        <Toolbar orientation="vertical" aria-label="Tools">
          {() => (
            <>
              <Toolbar aria-label="Align text">
                {() => (
                  <>
                    <Button>Align left</Button>
                    <Button>Align center</Button>
                    <Button>Align right</Button>
                  </>
                )}
              </Toolbar>
              <Separator />
              <Toolbar aria-label="Zoom">
                {() => (
                  <>
                    <Button>Zoom in</Button>
                    <Button>Zoom out</Button>
                  </>
                )}
              </Toolbar>
            </>
          )}
        </Toolbar>
        <button>After</button>
      </>
    ));

    const alignLeft = screen.getByRole("button", { name: "Align left" });
    const alignCenter = screen.getByRole("button", { name: "Align center" });

    // Focus first button
    alignLeft.focus();
    expect(document.activeElement).toBe(alignLeft);

    // Down arrow navigates in vertical orientation
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(alignCenter);

    // Right arrow does nothing in vertical orientation
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(alignCenter);

    // Up arrow navigates backward
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(alignLeft);

    // Left arrow does nothing
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(alignLeft);
  });

  it("supports RTL", async () => {
    const user = setupUser();

    render(() => (
      <I18nProvider locale="he-IL">
        <button>Before</button>
        <Toolbar aria-label="Tools">
          {() => (
            <>
              <Toolbar aria-label="Align text">
                {() => (
                  <>
                    <Button>Align left</Button>
                    <Button>Align center</Button>
                    <Button>Align right</Button>
                  </>
                )}
              </Toolbar>
              <Separator orientation="vertical" />
              <Toolbar aria-label="Zoom">
                {() => (
                  <>
                    <Button>Zoom in</Button>
                    <Button>Zoom out</Button>
                  </>
                )}
              </Toolbar>
            </>
          )}
        </Toolbar>
        <button>After</button>
      </I18nProvider>
    ));

    const alignLeft = screen.getByRole("button", { name: "Align left" });
    const alignCenter = screen.getByRole("button", { name: "Align center" });

    alignLeft.focus();
    expect(document.activeElement).toBe(alignLeft);

    // Left arrow navigates forward in RTL
    await user.keyboard("{ArrowLeft}");
    expect(document.activeElement).toBe(alignCenter);

    // Up arrow does nothing in horizontal
    await user.keyboard("{ArrowUp}");
    expect(document.activeElement).toBe(alignCenter);

    // Right arrow navigates backward in RTL
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(alignLeft);

    // Down arrow does nothing
    await user.keyboard("{ArrowDown}");
    expect(document.activeElement).toBe(alignLeft);
  });

  it("supports data-orientation attribute", () => {
    render(() => (
      <Toolbar orientation="vertical" aria-label="Tools">
        {() => <Button>Cut</Button>}
      </Toolbar>
    ));

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute("data-orientation", "vertical");
  });

  it("reacts to orientation prop changes", () => {
    const [orientation, setOrientation] = createSignal<"horizontal" | "vertical">("horizontal");

    render(() => (
      <>
        <button onClick={() => setOrientation("vertical")}>Set vertical</button>
        <Toolbar orientation={orientation()} aria-label="Tools">
          {() => <Button>Cut</Button>}
        </Toolbar>
      </>
    ));

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveAttribute("aria-orientation", "horizontal");
    expect(toolbar).toHaveAttribute("data-orientation", "horizontal");

    fireEvent.click(screen.getByRole("button", { name: "Set vertical" }));
    expect(toolbar).toHaveAttribute("aria-orientation", "vertical");
    expect(toolbar).toHaveAttribute("data-orientation", "vertical");
  });

  it("supports function class", () => {
    render(() => (
      <Toolbar aria-label="Tools" class={({ orientation }) => `toolbar-${orientation}`}>
        {() => <Button>Cut</Button>}
      </Toolbar>
    ));

    const toolbar = screen.getByRole("toolbar");
    expect(toolbar).toHaveClass("toolbar-horizontal");
  });

  it("supports style as an object", () => {
    render(() => (
      <Toolbar aria-label="Tools" style={{ gap: "8px" }}>
        {() => <Button>Cut</Button>}
      </Toolbar>
    ));

    const toolbar = screen.getByRole("toolbar") as HTMLElement;
    expect(toolbar.style.gap).toBe("8px");
  });

  it("supports style as a function", () => {
    render(() => (
      <Toolbar
        orientation="vertical"
        aria-label="Tools"
        style={({ orientation }) => ({
          "flex-direction": orientation === "vertical" ? "column" : "row",
        })}
      >
        {() => <Button>Cut</Button>}
      </Toolbar>
    ));

    const toolbar = screen.getByRole("toolbar") as HTMLElement;
    expect(toolbar.style.flexDirection).toBe("column");
  });
});
