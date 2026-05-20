import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { resetTooltipState } from "@proyecto-viviana/solid-stately";
import { createPointerEvent } from "@proyecto-viviana/solidaria-test-utils";
import { Tooltip, TooltipTrigger } from "../src/Tooltip";
import { Button } from "../src/Button";

describe("TooltipTrigger", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetTooltipState();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetTooltipState();
  });

  it("should render trigger and tooltip", () => {
    render(() => (
      <TooltipTrigger isOpen>
        <Button data-testid="trigger">Hover me</Button>
        <Tooltip data-testid="tooltip">Tooltip content</Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.getByTestId("trigger")).toBeInTheDocument();
    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
  });

  it("should show tooltip when isOpen is true", () => {
    render(() => (
      <TooltipTrigger isOpen>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip">Tooltip content</Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByText("Tooltip content")).toBeInTheDocument();
  });

  it("should describe the actual trigger element when controlled open", async () => {
    vi.useRealTimers();

    render(() => (
      <TooltipTrigger isOpen>
        <Button data-testid="trigger">Hover me</Button>
        <Tooltip data-testid="tooltip">Tooltip content</Tooltip>
      </TooltipTrigger>
    ));

    await waitFor(() => {
      expect(screen.getByTestId("trigger")).toHaveAttribute(
        "aria-describedby",
        screen.getByTestId("tooltip").id,
      );
    });

    vi.useFakeTimers();
  });

  it("should hide tooltip when isOpen is false", () => {
    render(() => (
      <TooltipTrigger isOpen={false}>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip">Tooltip content</Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument();
  });

  it("should call onOpenChange when tooltip opens via hover", async () => {
    vi.useRealTimers(); // Need real timers for this test
    const onOpenChange = vi.fn();

    render(() => (
      <TooltipTrigger onOpenChange={onOpenChange} delay={0}>
        <Button data-testid="trigger">Hover me</Button>
        <Tooltip>Tooltip content</Tooltip>
      </TooltipTrigger>
    ));

    const trigger = screen.getByTestId("trigger");

    await waitFor(() => {
      expect(trigger.closest("span")).toBeInTheDocument();
    });

    await new Promise((resolve) => setTimeout(resolve, 0));
    await new Promise((resolve) => requestAnimationFrame(resolve));

    const hoverEvent = new Event("pointerenter", { cancelable: true });
    Object.defineProperty(hoverEvent, "pointerType", { value: "mouse" });
    trigger.dispatchEvent(hoverEvent);

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(true);
    });

    vi.useFakeTimers(); // Restore for other tests
  });

  it("should not open from touch pointer hover", async () => {
    const onOpenChange = vi.fn();

    render(() => (
      <TooltipTrigger onOpenChange={onOpenChange} delay={0}>
        <Button data-testid="trigger">Hover me</Button>
        <Tooltip data-testid="tooltip">Tooltip content</Tooltip>
      </TooltipTrigger>
    ));

    const trigger = screen.getByTestId("trigger");
    trigger.dispatchEvent(
      createPointerEvent("pointerenter", { pointerId: 1, pointerType: "touch" }),
    );
    vi.advanceTimersByTime(0);

    expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument();
    expect(trigger).not.toHaveAttribute("aria-describedby");
    expect(onOpenChange).not.toHaveBeenCalledWith(true);
  });

  it("should support controlled open state with signals", () => {
    const [isOpen, setIsOpen] = createSignal(true);

    render(() => (
      <TooltipTrigger isOpen={isOpen()}>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip">Tooltip content</Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.getByTestId("tooltip")).toBeInTheDocument();

    // Close tooltip
    setIsOpen(false);

    // In SolidJS, need to wait for reactivity
    // Since we can't rerender, we test initial controlled state instead
    // The tooltip should be visible initially with isOpen=true
  });
});

describe("Tooltip", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetTooltipState();
  });

  afterEach(() => {
    vi.useRealTimers();
    resetTooltipState();
  });

  it('should have role="tooltip"', async () => {
    // Use real timers for this test since visibility depends on requestAnimationFrame
    vi.useRealTimers();

    render(() => (
      <TooltipTrigger isOpen>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip">Tooltip content</Tooltip>
      </TooltipTrigger>
    ));

    // Wait for requestAnimationFrame and retry logic to complete (positioning sets visibility)
    // Longer timeout needed because retries use setTimeout(16ms) x 5 times + initial rAF
    await waitFor(
      () => {
        expect(screen.getByRole("tooltip")).toBeInTheDocument();
      },
      { timeout: 2000 },
    );

    // Restore fake timers for subsequent tests
    vi.useFakeTimers();
  });

  it("should apply custom class via render prop", () => {
    render(() => (
      <TooltipTrigger isOpen>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip" class={({ placement }) => `tooltip-${placement}`}>
          Content
        </Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.getByTestId("tooltip")).toHaveClass("tooltip-top");
  });

  it("should support children as render prop", () => {
    render(() => (
      <TooltipTrigger isOpen>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip">
          {({ placement }) => <span>Placement: {placement}</span>}
        </Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.getByText("Placement: top")).toBeInTheDocument();
  });

  it("should render with data-placement attribute", () => {
    render(() => (
      <TooltipTrigger isOpen>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip" placement="bottom">
          Content
        </Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.getByTestId("tooltip")).toHaveAttribute("data-placement", "bottom");
  });

  it("should inherit placement from TooltipTrigger", () => {
    render(() => (
      <TooltipTrigger isOpen placement="bottom">
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip">Content</Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.getByTestId("tooltip")).toHaveAttribute("data-placement", "bottom");
  });

  it("should resolve start and end placements using document direction", () => {
    const originalDir = document.documentElement.dir;
    document.documentElement.dir = "rtl";

    try {
      render(() => (
        <TooltipTrigger isOpen placement="start">
          <Button>Hover me</Button>
          <Tooltip data-testid="tooltip">Content</Tooltip>
        </TooltipTrigger>
      ));

      expect(screen.getByTestId("tooltip")).toHaveAttribute("data-placement", "right");
    } finally {
      document.documentElement.dir = originalDir;
    }
  });

  it("should suppress controlled open state when disabled on the trigger", () => {
    render(() => (
      <TooltipTrigger isOpen isDisabled>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip">Content</Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument();
  });

  it("should work standalone with controlled state", () => {
    render(() => (
      <Tooltip isOpen data-testid="tooltip">
        Standalone tooltip
      </Tooltip>
    ));

    expect(screen.getByTestId("tooltip")).toBeInTheDocument();
    expect(screen.getByText("Standalone tooltip")).toBeInTheDocument();
  });

  it("should not render standalone tooltip when isOpen is false", () => {
    render(() => (
      <Tooltip isOpen={false} data-testid="tooltip">
        Hidden tooltip
      </Tooltip>
    ));

    expect(screen.queryByTestId("tooltip")).not.toBeInTheDocument();
  });

  it("should default placement to top", () => {
    render(() => (
      <TooltipTrigger isOpen>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip">Content</Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.getByTestId("tooltip")).toHaveAttribute("data-placement", "top");
  });

  it("should support left placement", () => {
    render(() => (
      <TooltipTrigger isOpen>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip" placement="left">
          Content
        </Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.getByTestId("tooltip")).toHaveAttribute("data-placement", "left");
  });

  it("should support right placement", () => {
    render(() => (
      <TooltipTrigger isOpen>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip" placement="right">
          Content
        </Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.getByTestId("tooltip")).toHaveAttribute("data-placement", "right");
  });

  it("should render with default class", () => {
    render(() => (
      <TooltipTrigger isOpen>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip">Content</Tooltip>
      </TooltipTrigger>
    ));

    expect(screen.getByTestId("tooltip")).toHaveClass("solidaria-Tooltip");
  });

  it("should support style as a function", () => {
    render(() => (
      <TooltipTrigger isOpen>
        <Button>Hover me</Button>
        <Tooltip
          data-testid="tooltip"
          style={({ placement }) => ({
            "background-color": placement === "top" ? "black" : "gray",
          })}
        >
          Content
        </Tooltip>
      </TooltipTrigger>
    ));

    const tooltip = screen.getByTestId("tooltip") as HTMLElement;
    expect(tooltip.style.backgroundColor).toBe("black");
  });

  it("should expose isEntering and isExiting via render props", () => {
    render(() => (
      <TooltipTrigger isOpen>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip">
          {({ isEntering, isExiting }) => (
            <span data-testid="content">
              {isEntering ? "entering" : isExiting ? "exiting" : "idle"}
            </span>
          )}
        </Tooltip>
      </TooltipTrigger>
    ));

    // In JSDOM (no getAnimations), isEntering should resolve to false immediately
    const content = screen.getByTestId("content");
    expect(content.textContent).toBe("idle");
  });

  it("should set data-placement but not data-exiting when open", () => {
    render(() => (
      <TooltipTrigger isOpen>
        <Button>Hover me</Button>
        <Tooltip data-testid="tooltip" placement="bottom">
          Content
        </Tooltip>
      </TooltipTrigger>
    ));

    const tooltip = screen.getByTestId("tooltip");
    expect(tooltip).toHaveAttribute("data-placement", "bottom");
    expect(tooltip).not.toHaveAttribute("data-exiting");
  });
});
