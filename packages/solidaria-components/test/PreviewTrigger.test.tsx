/**
 * PreviewTrigger context contract (#117 F-UP-011).
 *
 * RAC PreviewTrigger provides OverlayTriggerStateContext (with setOpen / point)
 * and PopoverContext trigger wiring. Solid's PopoverContext is placement/arrow;
 * PopoverTriggerContext is the trigger-wiring counterpart. This suite fails if
 * PreviewTrigger goes back to a thin overlay object with no OverlayTriggerStateContext.
 */
import { describe, it, expect, afterEach } from "vite-plus/test";
import { render, screen, cleanup } from "@solidjs/testing-library";
import { PreviewTrigger } from "../src/PreviewTrigger";
import { Popover } from "../src/Popover";
import { Link } from "../src/Link";
import {
  useOverlayTriggerState,
  usePopoverTrigger,
  type OverlayTriggerState,
  type PopoverTriggerContextValue,
} from "../src/contexts";

afterEach(() => {
  cleanup();
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
