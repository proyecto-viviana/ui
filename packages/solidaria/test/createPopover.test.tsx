/**
 * createPopover must re-read shouldCloseOnInteractOutside after mount.
 * A setup-time snapshot of the callback would ignore a later function.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test"; import { cleanup, fireEvent, render, screen } from "@solidjs/testing-library"; import { createSignal, flush } from "solid-js";
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
    // Solid 2 treats a function initial value as a writable memo, not a stored
    // callback. Box the filter so the signal holds an object.
    const [shouldClose, setShouldClose] = createSignal<{ fn: (element: Element) => boolean }>({
      fn: keepOpen,
    });

    render(() => {
      const [trigger, setTrigger] = createSignal<HTMLButtonElement | null>(null, {
        ownedWrite: true,
      });
      const [popover, setPopover] = createSignal<HTMLDivElement | null>(null, {
        ownedWrite: true,
      });
      const { popoverProps } = createPopover(
        {
          triggerRef: trigger,
          popoverRef: popover,
          get shouldCloseOnInteractOutside() {
            return shouldClose().fn;
          },
        },
        state,
      );

      return (
        <div>
          <div data-testid="outside">outside</div>
          <button ref={setTrigger} type="button">
            trigger
          </button>
          <div ref={setPopover} data-testid="popover" {...popoverProps}>
            content
          </div>
        </div>
      );
    });

    expect(state.isOpen()).toBe(true);

    const outside = screen.getByTestId("outside");
    clickOutside(outside);
    expect(state.isOpen()).toBe(true);

    setShouldClose({ fn: allowClose });
    flush();

    clickOutside(outside);
    expect(state.isOpen()).toBe(false);
  });
});
