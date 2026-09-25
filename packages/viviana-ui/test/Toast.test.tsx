/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, afterEach } from "vite-plus/test";
import { createSignal } from "solid-js";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import {
  ToastProvider,
  ToastRegion,
  ToastContainer,
  ToastQueue,
  addToast,
  globalToastQueue,
} from "../src/toast";

afterEach(() => {
  globalToastQueue.clear();
  cleanup();
});

describe("Toast (viviana-ui) view transitions", () => {
  it("runs the queue update inside the transition callback (#578)", () => {
    // The twin of solid-spectrum's regression: jsdom has no View Transitions
    // API, so the browser path is uncovered unless a faithful stub installs
    // one. Returning the mutation instead of calling it left the region
    // unrendered in every real browser.
    const calls: Array<() => unknown> = [];
    Object.defineProperty(document, "startViewTransition", {
      configurable: true,
      writable: true,
      value: (callback: () => unknown) => {
        calls.push(callback);
        callback();
        return {
          ready: Promise.resolve(),
          finished: Promise.resolve(),
          updateCallbackDone: Promise.resolve(),
          skipTransition: () => {},
        };
      },
    });

    try {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({ title: "Through a transition", type: "info" });

      expect(calls.length).toBeGreaterThan(0);
      expect(screen.getByRole("region", { name: "Notifications" })).toBeInTheDocument();
    } finally {
      delete (document as { startViewTransition?: unknown }).startViewTransition;
    }
  });

  it("keeps ToastContainer aria-label live after toasts are displayed (#435)", async () => {
    const [label, setLabel] = createSignal<string | undefined>("Notifications");

    render(() => <ToastContainer portal={false} aria-label={label()} />);

    addToast({ title: "Live label toast", type: "info" });

    const region = screen.getByRole("region", { name: "Notifications" });
    expect(region).toBeInTheDocument();
    expect(region).toHaveAttribute("aria-label", "Notifications");

    setLabel("Alerts");
    await Promise.resolve();

    expect(screen.getByRole("region", { name: "Alerts" })).toBe(region);
    expect(region).toHaveAttribute("aria-label", "Alerts");
  });

  it("renders the toast list as an ol of display-contents li elements (#433)", () => {
    render(() => <ToastContainer portal={false} />);

    ToastQueue.neutral("First toast");
    ToastQueue.info("Second toast");

    const ol = document.querySelector<HTMLOListElement>("ol[data-solid-spectrum-toast-list]");
    expect(ol).toBeInTheDocument();
    expect(ol?.tagName.toLowerCase()).toBe("ol");

    const listItems = ol?.querySelectorAll<HTMLLIElement>(":scope > li");
    expect(listItems?.length).toBe(2);
    listItems?.forEach((li) => {
      expect(li.style.display).toBe("contents");
    });

    // Collapsed: main toast has alertdialog, background toast is presentation
    expect(listItems?.[0].querySelector('[role="alertdialog"]')).toBeInTheDocument();

    // Expanded: both items contain alertdialogs
    fireEvent.click(screen.getByRole("button", { name: /Show all/ }));
    listItems?.forEach((li) => {
      expect(li.querySelector('[role="alertdialog"]')).toBeInTheDocument();
    });
  });
});
