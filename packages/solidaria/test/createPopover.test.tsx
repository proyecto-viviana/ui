/**
 * createPopover must re-read shouldCloseOnInteractOutside after mount.
 * A setup-time snapshot of the callback would ignore a later function.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { createOverlayTriggerState } from "../../solid-stately/src";
import { createPopover } from "../src/popover/createPopover";

function pointerEvent(type: string, opts: Partial<PointerEventInit> = {}) {
  return new PointerEvent(type, {
    bubbles: true,
    cancelable: true,
    composed: true,
    button: opts.button ?? 0,
    ...opts,
  });
}

function clickOutside(target: Element) {
  fireEvent(target, pointerEvent("pointerdown"));
  fireEvent(target, pointerEvent("pointerup"));
  fireEvent.click(target);
}

describe("createPopover", () => {
  beforeEach(() => {
    class NoopResizeObserver {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
    vi.stubGlobal("ResizeObserver", NoopResizeObserver);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it("uses an updated shouldCloseOnInteractOutside after mount", () => {
    const state = createOverlayTriggerState({ defaultOpen: true });
    const keepOpen = () => false;
    const allowClose = () => true;
    const [shouldClose, setShouldClose] = createSignal<(element: Element) => boolean>(keepOpen);

    render(() => {
      let trigger: HTMLButtonElement | undefined;
      let popover: HTMLDivElement | undefined;
      const { popoverProps } = createPopover(
        {
          triggerRef: () => trigger ?? null,
          popoverRef: () => popover ?? null,
          get shouldCloseOnInteractOutside() {
            return shouldClose();
          },
        },
        state,
      );

      return (
        <div>
          <div data-testid="outside">outside</div>
          <button ref={(el) => (trigger = el)} type="button">
            trigger
          </button>
          <div ref={(el) => (popover = el)} data-testid="popover" {...popoverProps}>
            content
          </div>
        </div>
      );
    });

    expect(state.isOpen()).toBe(true);

    const outside = screen.getByTestId("outside");
    clickOutside(outside);
    expect(state.isOpen()).toBe(true);

    setShouldClose(() => allowClose);

    clickOutside(outside);
    expect(state.isOpen()).toBe(false);
  });
});
