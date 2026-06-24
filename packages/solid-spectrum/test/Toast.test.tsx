/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@solidjs/testing-library";
import {
  ToastContainer,
  ToastProvider,
  ToastRegion,
  Toast,
  ToastQueue,
  addToast,
  toastSuccess,
  toastError,
  toastWarning,
  toastInfo,
  globalToastQueue,
} from "../src/toast";
import { Provider } from "../src/provider";
import type { QueuedToast, ToastContent } from "../src/toast";

/** Drain all toasts from the global queue. */
function clearGlobalToasts() {
  globalToastQueue.clear();
}

describe("Toast (solid-spectrum)", () => {
  beforeEach(() => {
    clearGlobalToasts();
  });

  afterEach(() => {
    clearGlobalToasts();
    cleanup();
  });

  describe("ToastProvider + ToastRegion", () => {
    it("renders region when toasts are present", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      // Add a toast to trigger region rendering
      addToast({ title: "Hello", type: "info" });

      const region = screen.getByRole("region");
      expect(region).toBeInTheDocument();
    });

    it("hides the stack-expand affordance without a ToastContainer", () => {
      // A bare ToastRegion has no expand/collapse context, so it must not render
      // the collapsed-stack "Show all" affordance it cannot honor — mirroring the
      // upstream split where ToastContainer, not the low-level region, owns
      // stack expansion.
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({ title: "First toast", type: "info" });
      addToast({ title: "Second toast", type: "info" });

      expect(screen.getByRole("region")).toBeInTheDocument();
      expect(screen.queryByRole("button", { name: /Show all/ })).not.toBeInTheDocument();
    });

    it("ToastContainer self-wires the global queue with S2 default placement", () => {
      render(() => <ToastContainer portal={false} />);

      ToastQueue.neutral("Queued from S2 API");

      const region = screen.getByRole("region", { name: "Notifications" });
      expect(region).toHaveAttribute("data-placement", "bottom");
      expect(screen.getByText("Queued from S2 API")).toBeInTheDocument();
    });

    it("lets the S2 region class own viewport placement without headless inline geometry", () => {
      render(() => <ToastContainer portal={false} />);

      ToastQueue.neutral("Centered by S2 class");

      const region = screen.getByRole("region", { name: "Notifications" });
      const inlineStyle = region.getAttribute("style") ?? "";

      expect(region.className).toContain("macro-dynamic");
      expect(inlineStyle).not.toContain("left: 50%");
      expect(inlineStyle).not.toContain("transform:");
      expect(inlineStyle).not.toContain("pointer-events: none");
    });

    it("mirrors upstream ToastList perspective and hover origin", () => {
      render(() => <ToastContainer portal={false} />);

      ToastQueue.neutral("Stack perspective");

      const list = document.querySelector<HTMLElement>("[data-solid-spectrum-toast-list]");
      expect(list).toBeInTheDocument();
      expect(list!.style.perspective).toBe("80px");
      expect(list!.style.perspectiveOrigin).toBe("center -55px");
      expect(list!.style.transition).toBe("perspective-origin 400ms");

      fireEvent.pointerOver(list!, { pointerType: "mouse" });
      fireEvent.mouseEnter(list!);
      expect(list!.style.perspectiveOrigin).toBe("center -95px");

      fireEvent.pointerOut(list!, { pointerType: "mouse" });
      fireEvent.mouseLeave(list!);
      expect(list!.style.perspectiveOrigin).toBe("center -55px");
    });

    it("mirrors upstream ToastList top-placement perspective origin", () => {
      render(() => <ToastContainer portal={false} placement="top" />);

      ToastQueue.neutral("Top stack perspective");

      const list = document.querySelector<HTMLElement>("[data-solid-spectrum-toast-list]");
      expect(list).toBeInTheDocument();
      expect(list!.style.perspective).toBe("80px");
      expect(list!.style.perspectiveOrigin).toBe("center calc(100% + 55px)");
    });

    it("renders the S2 collapsed stack and expands with controls", () => {
      render(() => <ToastContainer portal={false} />);

      ToastQueue.neutral("First toast");
      ToastQueue.info("Second toast");
      ToastQueue.negative("Third toast");

      const region = screen.getByRole("region", { name: "Notifications" });
      expect(screen.getByText("Third toast")).toBeInTheDocument();
      expect(screen.queryByText("Second toast")).not.toBeInTheDocument();
      expect(region.querySelectorAll("[data-solid-spectrum-toast-background-item]")).toHaveLength(
        2,
      );

      fireEvent.click(screen.getByRole("button", { name: /Show all/ }));

      expect(screen.getByText("Second toast")).toBeInTheDocument();
      expect(screen.getByText("Third toast")).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Clear all" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Collapse" })).toBeInTheDocument();

      fireEvent.click(screen.getByRole("button", { name: "Collapse" }));

      expect(screen.queryByText("Second toast")).not.toBeInTheDocument();
      expect(region.querySelectorAll("[data-solid-spectrum-toast-background-item]")).toHaveLength(
        2,
      );
    });

    it("clears the expanded stack from the container controls", () => {
      const onClose = vi.fn();

      render(() => <ToastContainer portal={false} />);

      ToastQueue.neutral("First toast", { onClose });
      ToastQueue.info("Second toast", { onClose });

      fireEvent.click(screen.getByRole("button", { name: /Show all/ }));
      fireEvent.click(screen.getByRole("button", { name: "Clear all" }));

      expect(screen.queryByRole("region", { name: "Notifications" })).not.toBeInTheDocument();
      expect(screen.queryByText("First toast")).not.toBeInTheDocument();
      expect(onClose).not.toHaveBeenCalled();
    });

    it("localizes S2 stack controls and dismiss label from Provider locale", () => {
      render(() => (
        <Provider locale="es-ES">
          <ToastContainer portal={false} />
        </Provider>
      ));

      ToastQueue.neutral("Primer aviso");
      ToastQueue.info("Segundo aviso");

      fireEvent.click(screen.getByRole("button", { name: "Mostrar todo" }));

      expect(screen.getByRole("button", { name: "Borrar todo" })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: "Contraer" })).toBeInTheDocument();
      expect(screen.getAllByRole("button", { name: "Descartar" }).length).toBeGreaterThan(0);
    });

    it("collapses the expanded stack on Escape", () => {
      render(() => <ToastContainer portal={false} />);

      ToastQueue.neutral("First toast");
      ToastQueue.info("Second toast");

      fireEvent.click(screen.getByRole("button", { name: /Show all/ }));
      expect(screen.getByText("First toast")).toBeInTheDocument();

      fireEvent.keyDown(document, { key: "Escape" });

      expect(screen.queryByText("First toast")).not.toBeInTheDocument();
      expect(screen.getByRole("button", { name: /Show all/ })).toBeInTheDocument();
    });
  });

  describe("variant contract", () => {
    const variantCases = [
      { type: "info" as const, normalized: "info" },
      { type: "success" as const, normalized: "positive" },
      { type: "warning" as const, normalized: "negative" },
      { type: "error" as const, normalized: "negative" },
      { type: "neutral" as const, normalized: "neutral" },
    ];

    variantCases.forEach(({ type, normalized }) => {
      it(`normalizes ${type} to the S2 ${normalized} variant`, () => {
        render(() => (
          <ToastProvider useGlobalQueue>
            <ToastRegion portal={false} />
          </ToastProvider>
        ));

        addToast({ title: `${type} toast`, type });

        const region = screen.getByRole("region");
        const toastEl = region.querySelector(`[data-type="${type}"]`);
        expect(toastEl).toBeInTheDocument();
        expect(toastEl).toHaveAttribute("data-solid-spectrum-variant", normalized);
        expect(toastEl!.className).toContain("macro-dynamic");
      });
    });
  });

  describe("variant icons", () => {
    it("renders the S2 CheckmarkCircle SVG for positive variants", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({ title: "Done!", type: "success" });

      const region = screen.getByRole("region");
      const toastEl = region.querySelector('[data-type="success"]');
      const svg = toastEl?.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("viewBox", "0 0 20 20");
      expect(svg?.querySelectorAll("path")).toHaveLength(2);
    });

    it("renders the S2 AlertTriangle SVG for negative variants", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({ title: "Caution", type: "warning" });

      const region = screen.getByRole("region");
      const toastEl = region.querySelector('[data-type="warning"]');
      const svg = toastEl?.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("viewBox", "0 0 20 20");
      expect(svg?.querySelectorAll("path")).toHaveLength(2);
    });

    it("renders the S2 InfoCircle SVG for info variant and no icon for neutral", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({ title: "FYI", type: "info" });

      const region = screen.getByRole("region");
      const toastEl = region.querySelector('[data-type="info"]');
      const svg = toastEl?.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("viewBox", "0 0 20 20");

      clearGlobalToasts();
      cleanup();
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({ title: "Plain", type: "neutral" });

      const neutralToast = screen.getByRole("region").querySelector('[data-type="neutral"]');
      expect(
        neutralToast?.querySelector("[data-solid-spectrum-toast-icon]"),
      ).not.toBeInTheDocument();
    });
  });

  describe("content rendering", () => {
    it("renders title when provided", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({ title: "My Title", type: "info" });

      expect(screen.getByText("My Title")).toBeInTheDocument();
    });

    it("renders description when provided", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({ title: "Title", description: "Some details here", type: "info" });

      expect(screen.getByText("Some details here")).toBeInTheDocument();
    });

    it("renders action button when provided", () => {
      const onAction = vi.fn();

      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({
        title: "Deleted",
        type: "info",
        action: { label: "Undo", onAction },
      });

      const actionButton = screen.getByText("Undo");
      expect(actionButton).toBeInTheDocument();
      expect(actionButton.closest("button")).toBeInTheDocument();
    });

    it("closes an actionable toast when shouldCloseOnAction is true", () => {
      const onAction = vi.fn();

      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      ToastQueue.info("File deleted", {
        actionLabel: "Undo",
        onAction,
        shouldCloseOnAction: true,
      });

      fireEvent.click(screen.getByRole("button", { name: "Undo" }));

      expect(onAction).toHaveBeenCalledTimes(1);
      expect(screen.queryByText("File deleted")).not.toBeInTheDocument();
    });

    it("links alertdialog labeling to title and description elements", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({ title: "Accessible title", description: "Accessible description", type: "info" });

      const description = screen.getByText("Accessible description");
      const toast = description.closest('[role="alertdialog"]') as HTMLElement | null;
      const title = screen.getByText("Accessible title");

      expect(toast).toBeTruthy();
      expect(title.id).toBeTruthy();
      expect(description.id).toBeTruthy();
      expect(toast).toHaveAttribute("aria-labelledby", title.id);
      expect(toast).toHaveAttribute("aria-describedby", description.id);
    });
  });

  describe("close button", () => {
    it("renders dismiss button with S2 CloseIcon SVG", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({ title: "Closeable", type: "info" });

      const region = screen.getByRole("region");
      const toastEl = region.querySelector('[data-type="info"]')!;
      const closeBtn = toastEl.querySelector('button[aria-label="Dismiss"]');
      expect(closeBtn).toBeInTheDocument();
      const svg = closeBtn!.querySelector("svg");
      expect(svg).toBeInTheDocument();
      expect(svg).toHaveAttribute("viewBox", "0 0 20 20");
    });
  });

  describe("animation data attributes", () => {
    it("sets data-animation attribute on toast element", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({ title: "Animated", type: "info" });

      const region = screen.getByRole("region");
      const toastEl = region.querySelector('[data-type="info"]');
      expect(toastEl).toBeInTheDocument();
      // data-animation is set by the headless layer
      expect(toastEl).toHaveAttribute("data-animation");
    });

    it("applies generated S2 classes for toast styling", () => {
      render(() => (
        <ToastProvider useGlobalQueue>
          <ToastRegion portal={false} />
        </ToastProvider>
      ));

      addToast({ title: "Animated", type: "success" });

      const region = screen.getByRole("region");
      const toastEl = region.querySelector('[data-type="success"]');
      expect(toastEl!.className).toContain("macro-dynamic");
    });
  });

  describe("S2 ToastQueue API and legacy helpers", () => {
    it("ToastQueue returns a close function and queues S2 content", () => {
      render(() => <ToastContainer portal={false} />);

      const close = ToastQueue.positive("Saved successfully");

      const toast = screen.getByText("Saved successfully").closest('[role="alertdialog"]');
      expect(toast).toHaveAttribute("data-solid-spectrum-variant", "positive");

      close();

      expect(screen.queryByText("Saved successfully")).not.toBeInTheDocument();
    });

    it("ToastQueue enforces S2 timeout rules", () => {
      const spy = vi.spyOn(globalToastQueue, "add");

      ToastQueue.info("Auto close", { timeout: 100 });
      expect(spy).toHaveBeenLastCalledWith(
        expect.objectContaining({ children: "Auto close", variant: "info" }),
        expect.objectContaining({ timeout: 5000 }),
      );

      ToastQueue.info("Needs action", { actionLabel: "Undo", timeout: 100 });
      expect(spy).toHaveBeenLastCalledWith(
        expect.objectContaining({
          children: "Needs action",
          variant: "info",
          actionLabel: "Undo",
        }),
        expect.objectContaining({ timeout: undefined }),
      );

      spy.mockRestore();
    });

    it("ToastQueue passes S2 DOM options through to the toast root", () => {
      render(() => <ToastContainer portal={false} />);

      ToastQueue.info("Identified toast", {
        id: "identified-toast",
        "data-toast-source": "s2-queue",
      });

      const toast = screen.getByText("Identified toast").closest('[role="alertdialog"]');
      expect(toast).toHaveAttribute("id", "identified-toast");
      expect(toast).toHaveAttribute("data-toast-source", "s2-queue");
    });

    it("toastSuccess sets type to success with 5s timeout", () => {
      const spy = vi.spyOn(globalToastQueue, "add");

      toastSuccess("It worked!");

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ title: "It worked!", type: "success", variant: "positive" }),
        expect.objectContaining({ timeout: 5000 }),
      );

      spy.mockRestore();
    });

    it("toastError sets type to error with 8s timeout", () => {
      const spy = vi.spyOn(globalToastQueue, "add");

      toastError("Something broke");

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Something broke",
          type: "error",
          variant: "negative",
        }),
        expect.objectContaining({ timeout: 8000 }),
      );

      spy.mockRestore();
    });

    it("toastWarning sets type to warning with 6s timeout", () => {
      const spy = vi.spyOn(globalToastQueue, "add");

      toastWarning("Be careful");

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Be careful", type: "warning", variant: "negative" }),
        expect.objectContaining({ timeout: 6000 }),
      );

      spy.mockRestore();
    });

    it("toastInfo sets type to info with 5s timeout", () => {
      const spy = vi.spyOn(globalToastQueue, "add");

      toastInfo("Just so you know");

      expect(spy).toHaveBeenCalledWith(
        expect.objectContaining({ title: "Just so you know", type: "info", variant: "info" }),
        expect.objectContaining({ timeout: 5000 }),
      );

      spy.mockRestore();
    });
  });

  describe("S2 view transitions", () => {
    it("injects the global toast-animation stylesheet", () => {
      render(() => <ToastContainer portal={false} />);

      ToastQueue.neutral("Animated toast");

      const styleEl = document.getElementById("solid-spectrum-toast-animations");
      expect(styleEl).toBeInTheDocument();
      expect(styleEl?.textContent).toContain("@keyframes slide-in");
      expect(styleEl?.textContent).toContain("@keyframes slide-out");
      expect(styleEl?.textContent).toContain("view-transition-name");
      expect(styleEl?.textContent).toContain("::view-transition-group");
    });

    it("names the main toast and tags it with placement for the transition group", () => {
      render(() => <ToastContainer portal={false} />);

      ToastQueue.neutral("Solo toast");

      const toast = screen.getByText("Solo toast").closest('[role="alertdialog"]') as HTMLElement;
      expect(toast).toBeTruthy();
      // Numeric queue keys are invalid CSS idents, so the name is prefixed with `toast-`.
      expect(toast.style.getPropertyValue("view-transition-name")).toMatch(/^toast-\d+$/);
      // [toast, placement, align] — drives the slide direction in the injected CSS.
      expect(toast.style.getPropertyValue("view-transition-class")).toBe("toast bottom center");
      expect(toast.classList.contains("toast")).toBe(true);
    });

    it("aligns the main toast transition class to a top-end placement", () => {
      render(() => <ToastContainer placement="top end" portal={false} />);

      ToastQueue.neutral("Corner toast");

      const toast = screen.getByText("Corner toast").closest('[role="alertdialog"]') as HTMLElement;
      expect(toast.style.getPropertyValue("view-transition-class")).toBe("toast top end");
    });

    it("gives collapsed background toasts a shared, position-based transition name", () => {
      render(() => <ToastContainer portal={false} />);

      ToastQueue.neutral("First toast");
      ToastQueue.info("Second toast");
      ToastQueue.negative("Third toast");

      const region = screen.getByRole("region", { name: "Notifications" });
      const backgroundItems = region.querySelectorAll<HTMLElement>(
        "[data-solid-spectrum-toast-background-item]",
      );
      expect(backgroundItems).toHaveLength(2);
      for (const item of backgroundItems) {
        // Without reduced motion the name carries no index suffix, so adding/removing a
        // toast transitions position rather than cross-fading.
        expect(item.style.getPropertyValue("view-transition-name")).toMatch(/^toast-\d+$/);
        expect(item.style.getPropertyValue("view-transition-class")).toBe("toast background-toast");
      }
    });

    it("suffixes background toast names with their index under reduced motion", () => {
      render(() => <ToastContainer PRIVATE_forceReducedMotion portal={false} />);

      ToastQueue.neutral("First toast");
      ToastQueue.info("Second toast");
      ToastQueue.negative("Third toast");

      const region = screen.getByRole("region", { name: "Notifications" });
      const backgroundItems = region.querySelectorAll<HTMLElement>(
        "[data-solid-spectrum-toast-background-item]",
      );
      expect(backgroundItems).toHaveLength(2);
      for (const item of backgroundItems) {
        // The index suffix makes each stack position read as a distinct element, so the
        // list cross-fades instead of sliding when reduced motion is preferred.
        expect(item.style.getPropertyValue("view-transition-name")).toMatch(/^toast-\d+-\d+$/);
      }
    });
  });
});
