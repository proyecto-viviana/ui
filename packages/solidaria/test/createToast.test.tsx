import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { createRoot, createSignal, For } from "solid-js";
import { createToast, createToastRegion } from "../src/toast";

describe("createToast", () => {
  afterEach(() => {
    cleanup();
  });

  it("returns alertdialog semantics and labeled content props", () => {
    createRoot((dispose) => {
      const toast = {
        key: "toast-1",
        animation: "entering",
      } as any;

      const state = {
        close: vi.fn(),
      } as any;

      const aria = createToast({ toast, state });

      expect(aria.toastProps.role).toBe("alertdialog");
      expect(aria.toastProps["aria-modal"]).toBe("false");
      expect(aria.contentProps.role).toBe("alert");
      expect(aria.contentProps["aria-live"]).toBe("assertive");
      expect(aria.titleProps.id).toBeTruthy();
      expect(aria.descriptionProps.id).toBeTruthy();
      expect(aria.closeButtonProps["aria-label"]).toBe("Close");
      dispose();
    });
  });

  it("calls state.close with the toast key when close button is pressed", () => {
    createRoot((dispose) => {
      const close = vi.fn();
      const toast = {
        key: "toast-2",
        animation: "entering",
      } as any;

      const aria = createToast({
        toast,
        state: { close } as any,
      });

      const onClick = aria.closeButtonProps.onClick as (() => void) | undefined;
      onClick?.();

      expect(close).toHaveBeenCalledWith("toast-2");
      dispose();
    });
  });

  it("omits aria-describedby when hasDescription is false", () => {
    createRoot((dispose) => {
      const toast = {
        key: "toast-3",
        animation: "entering",
      } as any;

      const aria = createToast({
        toast,
        state: { close: vi.fn() } as any,
        hasDescription: false,
      });

      expect(aria.toastProps["aria-describedby"]).toBeUndefined();
      expect(aria.toastProps["aria-labelledby"]).toBeTruthy();
      dispose();
    });
  });
});

describe("createToastRegion", () => {
  afterEach(() => {
    cleanup();
  });

  it("pauses and resumes timers on hover", () => {
    const pauseAll = vi.fn();
    const resumeAll = vi.fn();

    render(() =>
      (() => {
        const aria = createToastRegion({
          state: { pauseAll, resumeAll } as any,
          "aria-label": "Notifications",
        });
        return (
          <div {...aria.regionProps} data-testid="region">
            Region
          </div>
        );
      })(),
    );

    const region = screen.getByTestId("region");
    fireEvent.pointerEnter(region, { pointerType: "mouse" });
    fireEvent.pointerLeave(region, { pointerType: "mouse" });

    expect(pauseAll).toHaveBeenCalled();
    expect(resumeAll).toHaveBeenCalled();
    expect(region).toHaveAttribute("role", "region");
    expect(region).toHaveAttribute("aria-label", "Notifications");
  });

  it("pauses on focus-in and resumes when focus leaves the region", () => {
    const pauseAll = vi.fn();
    const resumeAll = vi.fn();

    render(() =>
      (() => {
        const aria = createToastRegion({
          state: { pauseAll, resumeAll } as any,
        });
        return (
          <div {...aria.regionProps} data-testid="region">
            <button data-testid="inside">Inside</button>
          </div>
        );
      })(),
    );

    const region = screen.getByTestId("region");

    fireEvent.focusIn(region);
    expect(pauseAll).toHaveBeenCalled();

    fireEvent.focusOut(region, { relatedTarget: null });
    expect(resumeAll).toHaveBeenCalled();
  });

  it("marks the region as a top layer and registers it for F6 landmark navigation", async () => {
    const pauseAll = vi.fn();
    const resumeAll = vi.fn();

    render(() =>
      (() => {
        const [regionElement, setRegionElement] = createSignal<HTMLElement>();
        const [toasts] = createSignal([{ key: "toast-1" }]);
        const aria = createToastRegion({
          state: { pauseAll, resumeAll, visibleToasts: toasts } as any,
          ref: regionElement,
          "aria-label": "Notifications",
        });

        return (
          <>
            <button data-testid="before">Before</button>
            <div {...aria.regionProps} ref={setRegionElement} data-testid="region">
              <div role="alertdialog" tabIndex={-1}>
                Toast
              </div>
            </div>
          </>
        );
      })(),
    );

    await Promise.resolve();

    const before = screen.getByTestId("before");
    const region = screen.getByTestId("region");

    expect(region).toHaveAttribute("data-solidaria-top-layer", "true");

    before.focus();
    fireEvent.keyDown(window, { key: "F6" });

    expect(document.activeElement).toBe(region);
  });

  it("moves focus to the next toast when the focused toast is removed", async () => {
    const pauseAll = vi.fn();
    const resumeAll = vi.fn();
    let removeFirst = () => {};

    render(() =>
      (() => {
        const [regionElement, setRegionElement] = createSignal<HTMLElement>();
        const [toasts, setToasts] = createSignal([{ key: "toast-1" }, { key: "toast-2" }]);
        removeFirst = () => setToasts([{ key: "toast-2" }]);
        const aria = createToastRegion({
          state: { pauseAll, resumeAll, visibleToasts: toasts } as any,
          ref: regionElement,
        });

        return (
          <>
            <button data-testid="before">Before</button>
            <div {...aria.regionProps} ref={setRegionElement} data-testid="region">
              <For each={toasts()}>
                {(toast) => (
                  <div role="alertdialog" tabIndex={-1} data-testid={toast.key}>
                    {toast.key}
                  </div>
                )}
              </For>
            </div>
          </>
        );
      })(),
    );

    const before = screen.getByTestId("before");
    const firstToast = screen.getByTestId("toast-1");

    before.focus();
    firstToast.focus();
    fireEvent.focusIn(firstToast, { relatedTarget: before });

    removeFirst();
    await Promise.resolve();

    expect(document.activeElement).toBe(screen.getByTestId("toast-2"));
  });

  it("restores focus when the last focused toast is removed", async () => {
    const pauseAll = vi.fn();
    const resumeAll = vi.fn();
    let removeAll = () => {};

    render(() =>
      (() => {
        const [regionElement, setRegionElement] = createSignal<HTMLElement>();
        const [toasts, setToasts] = createSignal([{ key: "toast-1" }]);
        removeAll = () => setToasts([]);
        const aria = createToastRegion({
          state: { pauseAll, resumeAll, visibleToasts: toasts } as any,
          ref: regionElement,
        });

        return (
          <>
            <button data-testid="before">Before</button>
            <div {...aria.regionProps} ref={setRegionElement} data-testid="region">
              <For each={toasts()}>
                {(toast) => (
                  <div role="alertdialog" tabIndex={-1} data-testid={toast.key}>
                    {toast.key}
                  </div>
                )}
              </For>
            </div>
          </>
        );
      })(),
    );

    const before = screen.getByTestId("before");
    const firstToast = screen.getByTestId("toast-1");

    before.focus();
    firstToast.focus();
    fireEvent.focusIn(firstToast, { relatedTarget: before });

    removeAll();
    await Promise.resolve();

    expect(document.activeElement).toBe(before);
  });
});
