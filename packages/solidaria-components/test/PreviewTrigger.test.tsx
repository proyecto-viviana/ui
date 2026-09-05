/**
 * PreviewTrigger context contract (#117 F-UP-011).
 *
 * RAC PreviewTrigger provides OverlayTriggerStateContext (with setOpen / point)
 * and PopoverContext trigger wiring. Solid's PopoverContext is placement/arrow;
 * PopoverTriggerContext is the trigger-wiring counterpart. This suite fails if
 * PreviewTrigger goes back to a thin overlay object with no OverlayTriggerStateContext.
 */
import { describe, it, expect, afterEach, beforeEach, vi } from "vite-plus/test";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import { resetTooltipState } from "@proyecto-viviana/solid-stately";
import { setupUser } from "@proyecto-viviana/solidaria-test-utils";
import { PreviewTrigger } from "../src/PreviewTrigger";
import { Popover } from "../src/Popover";
import { Link } from "../src/Link";
import { Button } from "../src/Button";
import {
  useOverlayTriggerState,
  usePopoverTrigger,
  type OverlayTriggerState,
  type PopoverTriggerContextValue,
} from "../src/contexts";

const user = setupUser();

function TestPreviewTrigger(props: { delay?: number; closeDelay?: number; isDisabled?: boolean }) {
  return (
    <>
      <PreviewTrigger delay={0} closeDelay={0} {...props}>
        <Link href="https://example.com">Example</Link>
        <Popover data-testid="preview">
          <p>Preview content</p>
          <Button>Action</Button>
        </Popover>
      </PreviewTrigger>
      <button data-testid="after">After</button>
    </>
  );
}

function mockRect(el: Element, rect: { left: number; right: number; top: number; bottom: number }) {
  (el as HTMLElement).getBoundingClientRect = () =>
    ({
      left: rect.left,
      right: rect.right,
      top: rect.top,
      bottom: rect.bottom,
      width: rect.right - rect.left,
      height: rect.bottom - rect.top,
      x: rect.left,
      y: rect.top,
      toJSON() {},
    }) as DOMRect;
}

afterEach(() => {
  cleanup();
  resetTooltipState();
});

function ContextProbe(props: {
  onOverlay: (state: OverlayTriggerState | null) => void;
  onTrigger: (state: PopoverTriggerContextValue | null) => void;
}) {
  props.onOverlay(useOverlayTriggerState());
  props.onTrigger(usePopoverTrigger());
  return null;
}

describe("PreviewTrigger", () => {
  it("provides OverlayTriggerStateContext with setOpen and point", () => {
    let overlay: OverlayTriggerState | null = null;
    let trigger: PopoverTriggerContextValue | null = null;

    render(() => (
      <PreviewTrigger delay={0} closeDelay={0}>
        <Link href="https://example.com">Example</Link>
        <ContextProbe
          onOverlay={(state) => {
            overlay = state;
          }}
          onTrigger={(state) => {
            trigger = state;
          }}
        />
      </PreviewTrigger>
    ));

    expect(overlay).not.toBeNull();
    expect(typeof overlay?.setOpen).toBe("function");
    expect("point" in (overlay as object)).toBe(true);
    expect(typeof overlay?.setPoint).toBe("function");
    expect(trigger?.trigger).toBe("PreviewTrigger");
    expect(typeof trigger?.state.setOpen).toBe("function");
    expect(typeof trigger?.state.point).toBe("function");
    expect(typeof trigger?.shouldSkipAnimation).toBe("function");
  });

  it("exposes aria-haspopup on the trigger and is non-modal", () => {
    render(() => (
      <PreviewTrigger delay={0} closeDelay={0}>
        <Link href="https://example.com">Example</Link>
        <Popover data-testid="preview">
          <p>Preview content</p>
        </Popover>
      </PreviewTrigger>
    ));

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("aria-haspopup", "dialog");
    expect(link).toHaveAttribute("aria-expanded", "false");
    expect(link).not.toHaveAttribute("aria-controls");
    expect(document.querySelector("[data-testid=underlay]")).toBeNull();
  });
});

describe("PreviewTrigger hover, delay, Tab, and Escape", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    resetTooltipState();
  });

  afterEach(() => {
    const active = document.activeElement ?? document.body;
    fireEvent.keyDown(active, { key: "Escape" });
    fireEvent.keyUp(active, { key: "Escape" });
    // Positioning / enter-animation rAF loops; do not runAllTimers.
    vi.advanceTimersByTime(1000);
    cleanup();
    vi.useRealTimers();
    resetTooltipState();
  });

  it("opens on hover, stays open across the safe area, and closes when the pointer leaves", async () => {
    render(() => <TestPreviewTrigger />);
    const link = screen.getByRole("link");

    fireEvent.pointerMove(document.body, { pointerType: "mouse" });
    await user.hover(link);
    vi.runAllTimers();

    const preview = screen.getByTestId("preview");
    expect(preview).toBeInTheDocument();
    expect(link.getAttribute("aria-describedby")).toContain(preview.id);

    mockRect(link, { left: 0, right: 100, top: 0, bottom: 20 });
    mockRect(preview, { left: 0, right: 100, top: 40, bottom: 140 });

    fireEvent.pointerMove(document.body, { clientX: 50, clientY: 30, pointerType: "mouse" });
    vi.runAllTimers();
    expect(screen.queryByTestId("preview")).toBeInTheDocument();

    fireEvent.pointerMove(document.body, { clientX: 50, clientY: 100, pointerType: "mouse" });
    vi.runAllTimers();
    expect(screen.queryByTestId("preview")).toBeInTheDocument();

    fireEvent.pointerMove(document.body, { clientX: 500, clientY: 500, pointerType: "mouse" });
    vi.runAllTimers();
    expect(screen.queryByTestId("preview")).not.toBeInTheDocument();
  });

  it("delays opening on keyboard focus until the warmup elapses", async () => {
    render(() => <TestPreviewTrigger delay={300} />);
    const link = screen.getByRole("link");

    await user.tab();
    expect(document.activeElement).toBe(link);
    expect(screen.queryByTestId("preview")).not.toBeInTheDocument();

    vi.advanceTimersByTime(300);
    expect(screen.getByTestId("preview")).toBeInTheDocument();
  });

  it("does not open when tabbing through before the delay elapses", async () => {
    render(() => <TestPreviewTrigger delay={300} />);
    const link = screen.getByRole("link");

    await user.tab();
    expect(document.activeElement).toBe(link);

    vi.advanceTimersByTime(150);
    await user.tab();
    expect(document.activeElement).toBe(screen.getByTestId("after"));

    vi.runAllTimers();
    expect(screen.queryByTestId("preview")).not.toBeInTheDocument();
  });

  it("moves focus into the preview when tabbing from the link", async () => {
    render(() => <TestPreviewTrigger />);
    const link = screen.getByRole("link");

    await user.tab();
    expect(document.activeElement).toBe(link);
    vi.advanceTimersByTime(0);
    expect(screen.getByTestId("preview")).toBeInTheDocument();

    // user.tab() walks document tab order itself (Link → After) and ignores
    // preventDefault on the trigger. user.keyboard sends Tab to the focused
    // link so createPreviewTrigger can move into the preview.
    await user.keyboard("{Tab}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Action" }));
  });

  it("closes on Escape and restores focus to the link", async () => {
    render(() => <TestPreviewTrigger />);
    const link = screen.getByRole("link");

    await user.tab();
    await user.keyboard("{Tab}");
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Action" }));

    const action = screen.getByRole("button", { name: "Action" });
    fireEvent.keyDown(action, { key: "Escape" });
    vi.advanceTimersByTime(1000);

    expect(screen.queryByTestId("preview")).not.toBeInTheDocument();
    expect(document.activeElement).toBe(link);
  });

  it("exposes aria-expanded and aria-controls on the trigger once open", async () => {
    render(() => <TestPreviewTrigger />);
    const link = screen.getByRole("link");

    expect(link).toHaveAttribute("aria-haspopup", "dialog");
    expect(link).toHaveAttribute("aria-expanded", "false");
    expect(link).not.toHaveAttribute("aria-controls");

    await user.tab();
    const preview = screen.getByTestId("preview");
    expect(link).toHaveAttribute("aria-expanded", "true");
    expect(link).toHaveAttribute("aria-controls", preview.id);
  });
});
