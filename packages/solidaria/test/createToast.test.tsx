import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { render, screen, fireEvent, cleanup } from "@solidjs/testing-library";
import { createRoot, createSignal, For } from "solid-js";
import { I18nProvider } from "../src/i18n";
import { createToast, createToastRegion } from "../src/toast";

function ToastSemanticsProbe() {
  const aria = createToast({
    toast: { key: "toast-1", animation: "entering" } as any,
    state: { close: () => {} } as any,
  });

  return (
    <div {...aria.toastProps}>
      <div {...aria.contentProps}>
        <span {...aria.titleProps}>Title</span>
        <span {...aria.descriptionProps}>Description</span>
      </div>
      <button {...aria.closeButtonProps}>×</button>
    </div>
  );
}

function ToastCloseProbe() {
  const aria = createToast({
    toast: { key: "toast-es", animation: "entering" } as any,
    state: { close: () => {} } as any,
  });

  return <button {...aria.closeButtonProps}>×</button>;
}

describe("createToast", () => {
  afterEach(() => {
    cleanup();
  });

  it("returns alertdialog semantics and labeled content props", () => {
    render(() => <ToastSemanticsProbe />);

    const toast = screen.getByRole("alertdialog");
    const content = screen.getByRole("alert");
    expect(toast).toHaveAttribute("aria-modal", "false");
    expect(content).toHaveAttribute("aria-atomic", "true");
    expect(content).not.toHaveAttribute("aria-live");
    expect(content).not.toHaveAttribute("aria-hidden");
    expect(screen.getByText("Title").id).toBeTruthy();
    expect(screen.getByText("Description").id).toBeTruthy();
    expect(toast).toHaveAttribute("aria-labelledby", screen.getByText("Title").id);
    expect(toast).toHaveAttribute("aria-describedby", screen.getByText("Description").id);
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Close");
  });

  it("names the close button from the toast catalog", () => {
    render(() => (
      <I18nProvider locale="es-ES">
        <ToastCloseProbe />
      </I18nProvider>
    ));

    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "Cerrar");
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

  it("keeps an explicit label, and the title names the toast when that label is absent", () => {
    createRoot((dispose) => {
      const toast = {
        key: "toast-label",
        animation: "entering",
      } as any;

      const explicit = createToast({
        toast,
        state: { close: vi.fn() } as any,
        "aria-label": "Status",
        "aria-labelledby": "external-title",
        "aria-describedby": "external-desc",
        "aria-details": "external-details",
      });

      expect(explicit.toastProps["aria-label"]).toBe("Status");
      expect(explicit.toastProps["aria-labelledby"]).toBe("external-title");
      expect(explicit.toastProps["aria-describedby"]).toBe("external-desc");
      expect(explicit.toastProps["aria-details"]).toBe("external-details");

      const fallback = createToast({
        toast,
        state: { close: vi.fn() } as any,
        "aria-labelledby": "",
        "aria-describedby": "",
      });
      expect(fallback.toastProps["aria-labelledby"]).toBeTruthy();
      expect(fallback.toastProps["aria-labelledby"]).not.toBe("");
      expect(fallback.toastProps["aria-describedby"]).toBeTruthy();
      expect(fallback.toastProps["aria-describedby"]).not.toBe("");
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

  it("toastProps includes tabIndex 0 so the toast container is keyboard-focusable", () => {
    createRoot((dispose) => {
      const toast = {
        key: "toast-4",
        animation: "entering",
      } as any;

      const aria = createToast({
        toast,
        state: { close: vi.fn() } as any,
      });

      expect(aria.toastProps.tabIndex).toBe(0);
      dispose();
    });
  });

  it("rendered alertdialog element carries tabindex=0 and can receive DOM focus", () => {
    render(() =>
      (() => {
        const toast = { key: "toast-5", animation: "entering" } as any;
        const state = { close: vi.fn() } as any;
        const aria = createToast({ toast, state });
        return (
          <div {...aria.toastProps} data-testid="toast-container">
            <div {...aria.contentProps}>Toast message</div>
          </div>
        );
      })(),
    );

    const container = screen.getByTestId("toast-container");
    expect(container).toHaveAttribute("tabindex", "0");

    container.focus();
    expect(document.activeElement).toBe(container);
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
    fireEvent.keyDown(document, { key: "F6" });

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

  it("leaves focus where the user moved it after they leave the region", async () => {
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
            <button data-testid="after">After</button>
          </>
        );
      })(),
    );

    const before = screen.getByTestId("before");
    const after = screen.getByTestId("after");
    const region = screen.getByTestId("region");
    const firstToast = screen.getByTestId("toast-1");

    before.focus();
    firstToast.focus();
    fireEvent.focusIn(firstToast, { relatedTarget: before });

    after.focus();
    fireEvent.focusOut(region, { relatedTarget: after });

    removeAll();
    await Promise.resolve();

    expect(document.activeElement).toBe(after);
  });

  it("keeps aria-label live when aria-label changes after mount (#435)", async () => {
    const pauseAll = vi.fn();
    const resumeAll = vi.fn();
    const [label, setLabel] = createSignal<string | undefined>("Notifications");

    render(() =>
      (() => {
        const [regionElement, setRegionElement] = createSignal<HTMLElement>();
        const [toasts] = createSignal([{ key: "toast-1" }]);
        const aria = createToastRegion({
          state: { pauseAll, resumeAll, visibleToasts: toasts } as any,
          ref: regionElement,
          get "aria-label"() {
            return label();
          },
        });

        return <div {...aria.regionProps} ref={setRegionElement} data-testid="region" />;
      })(),
    );

    const region = screen.getByTestId("region");
    expect(region).toHaveAttribute("aria-label", "Notifications");

    setLabel("Alerts");
    await Promise.resolve();

    expect(region).toHaveAttribute("aria-label", "Alerts");
  });
});
