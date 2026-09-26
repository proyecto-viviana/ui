/**
 * Tests for addGlobalScrollListener and createCloseOnScroll across Shadow DOM boundaries.
 * Verifies close, cleanup, nested overlay, and non-ancestor scroll behavior.
 */

import { describe, it, expect, vi, beforeAll, afterEach } from "vite-plus/test";
import { createRoot, createSignal, flush } from "solid-js";
import { enableShadowDOM } from "@proyecto-viviana/solid-stately/private/flags/flags";
import {
  addGlobalScrollListener,
  getPropagationTargets,
  createCloseOnScroll,
  onCloseMap,
} from "../src";

describe("addGlobalScrollListener and createCloseOnScroll with Shadow DOM", () => {
  const hostsToClean: HTMLElement[] = [];

  beforeAll(() => {
    enableShadowDOM();
  });

  afterEach(() => {
    while (hostsToClean.length > 0) {
      const host = hostsToClean.pop();
      host?.remove();
    }
  });

  /**
   * Helper creating a 2-level nested shadow DOM structure:
   * document.body -> host1 -> shadowRoot1 -> host2 -> shadowRoot2 -> scrollContainer -> trigger
   */
  function createNestedShadowDOM() {
    const host1 = document.createElement("div");
    host1.setAttribute("data-testid", "host-1");
    document.body.appendChild(host1);
    hostsToClean.push(host1);

    const shadowRoot1 = host1.attachShadow({ mode: "open" });
    const ancestorScrollable1 = document.createElement("div");
    ancestorScrollable1.setAttribute("data-testid", "ancestor-scrollable-1");
    shadowRoot1.appendChild(ancestorScrollable1);

    const host2 = document.createElement("div");
    host2.setAttribute("data-testid", "host-2");
    ancestorScrollable1.appendChild(host2);

    const shadowRoot2 = host2.attachShadow({ mode: "open" });
    const scrollContainer2 = document.createElement("div");
    scrollContainer2.setAttribute("data-testid", "scroll-container-2");
    shadowRoot2.appendChild(scrollContainer2);

    const trigger = document.createElement("button");
    trigger.setAttribute("data-testid", "trigger-btn");
    trigger.textContent = "Open Overlay";
    scrollContainer2.appendChild(trigger);

    const siblingScrollable2 = document.createElement("div");
    siblingScrollable2.setAttribute("data-testid", "sibling-scrollable-2");
    shadowRoot2.appendChild(siblingScrollable2);

    return {
      host1,
      shadowRoot1,
      ancestorScrollable1,
      host2,
      shadowRoot2,
      scrollContainer2,
      trigger,
      siblingScrollable2,
    };
  }

  describe("addGlobalScrollListener propagation and cleanup", () => {
    it("collects window and all intermediate shadow roots in getPropagationTargets", () => {
      const { trigger, shadowRoot1, shadowRoot2 } = createNestedShadowDOM();
      const targets = getPropagationTargets(trigger);

      expect(targets).toHaveLength(3);
      expect(targets[0]).toBe(window);
      expect(targets[1]).toBe(shadowRoot2);
      expect(targets[2]).toBe(shadowRoot1);
    });

    it("observes scroll events dispatched on elements inside nested shadow roots", () => {
      const { trigger, scrollContainer2, ancestorScrollable1 } = createNestedShadowDOM();
      const scrollSpy = vi.fn();

      const cleanup = addGlobalScrollListener(trigger, scrollSpy);

      // Scroll inside the innermost shadow root
      scrollContainer2.dispatchEvent(new Event("scroll"));
      expect(scrollSpy).toHaveBeenCalledTimes(1);

      // Scroll inside the intermediate shadow root
      ancestorScrollable1.dispatchEvent(new Event("scroll"));
      expect(scrollSpy).toHaveBeenCalledTimes(2);

      // Scroll on window
      window.dispatchEvent(new Event("scroll"));
      expect(scrollSpy).toHaveBeenCalledTimes(3);

      cleanup();
    });

    it("cleans up listeners on window and all shadow roots when cleanup is called", () => {
      const { trigger, scrollContainer2, ancestorScrollable1 } = createNestedShadowDOM();
      const scrollSpy = vi.fn();

      const cleanup = addGlobalScrollListener(trigger, scrollSpy);
      scrollContainer2.dispatchEvent(new Event("scroll"));
      expect(scrollSpy).toHaveBeenCalledTimes(1);

      cleanup();

      // Dispatching after cleanup should not invoke listener
      scrollContainer2.dispatchEvent(new Event("scroll"));
      ancestorScrollable1.dispatchEvent(new Event("scroll"));
      window.dispatchEvent(new Event("scroll"));

      expect(scrollSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe("createCloseOnScroll with nested shadow roots", () => {
    it("closes overlay when ancestor container inside innermost shadow root scrolls", () => {
      const { trigger, scrollContainer2 } = createNestedShadowDOM();
      const onClose = vi.fn();

      createRoot((dispose) => {
        createCloseOnScroll({
          triggerRef: () => trigger,
          isOpen: () => true,
          onClose,
        });
        flush();

        expect(onClose).not.toHaveBeenCalled();

        scrollContainer2.dispatchEvent(new Event("scroll"));
        expect(onClose).toHaveBeenCalledTimes(1);

        dispose();
      });
    });

    it("closes overlay when ancestor container inside intermediate shadow root scrolls", () => {
      const { trigger, ancestorScrollable1 } = createNestedShadowDOM();
      const onClose = vi.fn();

      createRoot((dispose) => {
        createCloseOnScroll({
          triggerRef: () => trigger,
          isOpen: () => true,
          onClose,
        });
        flush();

        ancestorScrollable1.dispatchEvent(new Event("scroll"));
        expect(onClose).toHaveBeenCalledTimes(1);

        dispose();
      });
    });

    it("falls back to onCloseMap when onClose is not directly provided", () => {
      const { trigger, scrollContainer2 } = createNestedShadowDOM();
      const stateClose = vi.fn();
      onCloseMap.set(trigger, stateClose);

      createRoot((dispose) => {
        createCloseOnScroll({
          triggerRef: () => trigger,
          isOpen: () => true,
        });
        flush();

        scrollContainer2.dispatchEvent(new Event("scroll"));
        expect(stateClose).toHaveBeenCalledTimes(1);

        dispose();
      });
    });

    it("cleans up scroll listeners when overlay closes (isOpen becomes false)", () => {
      const { trigger, scrollContainer2 } = createNestedShadowDOM();
      const onClose = vi.fn();

      const [isOpen, setIsOpen] = createSignal(true, { ownedWrite: true });

      createRoot((dispose) => {
        createCloseOnScroll({
          triggerRef: () => trigger,
          isOpen,
          onClose,
        });
        flush();

        scrollContainer2.dispatchEvent(new Event("scroll"));
        expect(onClose).toHaveBeenCalledTimes(1);

        // Close the overlay
        setIsOpen(false);
        flush();

        // Further scrolls should not trigger onClose
        scrollContainer2.dispatchEvent(new Event("scroll"));
        window.dispatchEvent(new Event("scroll"));
        expect(onClose).toHaveBeenCalledTimes(1);

        dispose();
      });
    });

    it("does not close on non-ancestor scroll inside shadow root or light DOM", () => {
      const { trigger, siblingScrollable2 } = createNestedShadowDOM();
      const lightSibling = document.createElement("div");
      document.body.appendChild(lightSibling);
      hostsToClean.push(lightSibling);

      const onClose = vi.fn();

      createRoot((dispose) => {
        createCloseOnScroll({
          triggerRef: () => trigger,
          isOpen: () => true,
          onClose,
        });
        flush();

        // Scroll sibling in shadow root (not an ancestor of trigger)
        siblingScrollable2.dispatchEvent(new Event("scroll"));
        expect(onClose).not.toHaveBeenCalled();

        // Scroll sibling in light DOM (not an ancestor of trigger)
        lightSibling.dispatchEvent(new Event("scroll"));
        expect(onClose).not.toHaveBeenCalled();

        dispose();
      });
    });

    it("does not close when input or textarea scrolls (cursor movement)", () => {
      const { scrollContainer2 } = createNestedShadowDOM();
      const input = document.createElement("input");
      scrollContainer2.appendChild(input);

      const textarea = document.createElement("textarea");
      scrollContainer2.appendChild(textarea);

      const onClose = vi.fn();

      createRoot((dispose) => {
        createCloseOnScroll({
          triggerRef: () => input,
          isOpen: () => true,
          onClose,
        });
        flush();

        input.dispatchEvent(new Event("scroll"));
        expect(onClose).not.toHaveBeenCalled();

        textarea.dispatchEvent(new Event("scroll"));
        expect(onClose).not.toHaveBeenCalled();

        dispose();
      });
    });

    it("supports nested overlays: scrolling parent overlay closes child overlay but not parent overlay", () => {
      const { trigger: outerTrigger } = createNestedShadowDOM();

      // Outer overlay element (rendered into body or shadow root)
      const outerOverlay = document.createElement("div");
      outerOverlay.setAttribute("data-testid", "outer-overlay");
      document.body.appendChild(outerOverlay);
      hostsToClean.push(outerOverlay);

      // Scrollable list inside outer overlay
      const outerOverlayScrollList = document.createElement("div");
      outerOverlay.appendChild(outerOverlayScrollList);

      // Inner trigger inside outer overlay's scrollable list
      const innerTrigger = document.createElement("button");
      innerTrigger.textContent = "Inner Submenu Trigger";
      outerOverlayScrollList.appendChild(innerTrigger);

      // Inner overlay element
      const innerOverlay = document.createElement("div");
      innerOverlay.setAttribute("data-testid", "inner-overlay");
      document.body.appendChild(innerOverlay);
      hostsToClean.push(innerOverlay);

      const outerClose = vi.fn();
      const innerClose = vi.fn();

      createRoot((dispose) => {
        // Outer overlay close-on-scroll
        createCloseOnScroll({
          triggerRef: () => outerTrigger,
          isOpen: () => true,
          onClose: outerClose,
        });

        // Inner overlay close-on-scroll (its trigger is inside outerOverlayScrollList)
        createCloseOnScroll({
          triggerRef: () => innerTrigger,
          isOpen: () => true,
          onClose: innerClose,
        });
        flush();

        // 1. Scroll inside outer overlay's scroll list:
        // - innerTrigger's ancestor moved -> innerClose MUST be called
        // - outerTrigger is outside outer overlay -> outerClose MUST NOT be called
        outerOverlayScrollList.dispatchEvent(new Event("scroll"));
        expect(innerClose).toHaveBeenCalledTimes(1);
        expect(outerClose).not.toHaveBeenCalled();

        // 2. Scroll inside inner overlay:
        // - not an ancestor of outerTrigger or innerTrigger -> neither closes
        innerOverlay.dispatchEvent(new Event("scroll"));
        expect(innerClose).toHaveBeenCalledTimes(1);
        expect(outerClose).not.toHaveBeenCalled();

        dispose();
      });
    });
  });
});
