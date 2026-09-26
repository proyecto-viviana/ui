/**
 * Component-level tests for overlay and tooltip close-on-scroll across Shadow DOM boundaries.
 * Verifies close, cleanup, and non-scroll behavior for Popover and Tooltip inside nested shadow roots.
 */

import { describe, it, expect, vi, beforeAll, afterEach } from "vite-plus/test";
import { render, fireEvent, waitFor, cleanup } from "@solidjs/testing-library";
import { enableShadowDOM } from "@proyecto-viviana/solid-stately/private/flags/flags";
import { DialogTrigger, Dialog } from "../src/Dialog";
import { Popover } from "../src/Popover";
import { Button } from "../src/Button";
import { Tooltip, TooltipTrigger } from "../src/Tooltip";

describe("Overlay close on scroll in nested Shadow DOM", () => {
  const hostsToClean: HTMLElement[] = [];

  beforeAll(() => {
    enableShadowDOM();
  });

  afterEach(() => {
    cleanup();
    while (hostsToClean.length > 0) {
      const host = hostsToClean.pop();
      host?.remove();
    }
  });

  function createNestedShadowMount() {
    const host1 = document.createElement("div");
    host1.setAttribute("data-testid", "nested-host-1");
    document.body.appendChild(host1);
    hostsToClean.push(host1);

    const shadowRoot1 = host1.attachShadow({ mode: "open" });
    const intermediateContainer = document.createElement("div");
    intermediateContainer.setAttribute("data-testid", "intermediate-container");
    intermediateContainer.style.cssText = "height: 300px; overflow-y: auto;";
    shadowRoot1.appendChild(intermediateContainer);

    const host2 = document.createElement("div");
    host2.setAttribute("data-testid", "nested-host-2");
    intermediateContainer.appendChild(host2);

    const shadowRoot2 = host2.attachShadow({ mode: "open" });
    const scrollContainer2 = document.createElement("div");
    scrollContainer2.setAttribute("data-testid", "scroll-container-2");
    scrollContainer2.style.cssText = "height: 150px; overflow-y: auto;";
    shadowRoot2.appendChild(scrollContainer2);

    const mountPoint = document.createElement("div");
    mountPoint.setAttribute("data-testid", "mount-point");
    scrollContainer2.appendChild(mountPoint);

    const siblingContainer = document.createElement("div");
    siblingContainer.setAttribute("data-testid", "sibling-container");
    siblingContainer.style.cssText = "height: 100px; overflow-y: auto;";
    shadowRoot2.appendChild(siblingContainer);

    return {
      host1,
      shadowRoot1,
      intermediateContainer,
      host2,
      shadowRoot2,
      scrollContainer2,
      mountPoint,
      siblingContainer,
    };
  }

  it("closes Popover when its scrollable ancestor inside a nested shadow root scrolls", async () => {
    const { mountPoint, scrollContainer2 } = createNestedShadowMount();
    const onOpenChange = vi.fn();

    render(
      () => (
        <DialogTrigger onOpenChange={onOpenChange}>
          <Button data-testid="popover-btn">Open Popover</Button>
          <Popover data-testid="popover-content">
            <Dialog>
              <p>Popover Inside Shadow DOM</p>
            </Dialog>
          </Popover>
        </DialogTrigger>
      ),
      { container: mountPoint },
    );

    const triggerBtn = mountPoint.querySelector('[data-testid="popover-btn"]') as HTMLButtonElement;
    expect(triggerBtn).toBeTruthy();

    fireEvent.click(triggerBtn);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="popover-content"]')).toBeTruthy();
    });

    expect(onOpenChange).toHaveBeenCalledWith(true);

    // Scroll the ancestor scrollable container in the nested shadow root
    scrollContainer2.dispatchEvent(new Event("scroll"));

    await waitFor(() => {
      expect(document.querySelector('[data-testid="popover-content"]')).toBeNull();
    });

    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("does not close Popover when a non-ancestor container scrolls", async () => {
    const { mountPoint, siblingContainer } = createNestedShadowMount();
    const onOpenChange = vi.fn();

    render(
      () => (
        <DialogTrigger onOpenChange={onOpenChange}>
          <Button data-testid="popover-btn">Open Popover</Button>
          <Popover data-testid="popover-content">
            <Dialog>
              <p>Popover Inside Shadow DOM</p>
            </Dialog>
          </Popover>
        </DialogTrigger>
      ),
      { container: mountPoint },
    );

    const triggerBtn = mountPoint.querySelector('[data-testid="popover-btn"]') as HTMLButtonElement;
    fireEvent.click(triggerBtn);

    await waitFor(() => {
      expect(document.querySelector('[data-testid="popover-content"]')).toBeTruthy();
    });

    // Scroll sibling container (not containing trigger)
    siblingContainer.dispatchEvent(new Event("scroll"));

    // Popover must remain open
    expect(document.querySelector('[data-testid="popover-content"]')).toBeTruthy();
  });

  it("closes Tooltip when its ancestor container inside a nested shadow root scrolls", async () => {
    const { mountPoint, scrollContainer2 } = createNestedShadowMount();

    render(
      () => (
        <TooltipTrigger defaultOpen>
          <Button data-testid="tooltip-btn">Hover me</Button>
          <Tooltip data-testid="tooltip-content">Tooltip Info</Tooltip>
        </TooltipTrigger>
      ),
      { container: mountPoint },
    );

    const triggerBtn = mountPoint.querySelector('[data-testid="tooltip-btn"]') as HTMLButtonElement;
    expect(triggerBtn).toBeTruthy();

    await waitFor(() => {
      expect(document.querySelector('[data-testid="tooltip-content"]')).toBeTruthy();
      expect(triggerBtn).toHaveAttribute("aria-describedby");
    });

    // Scroll the ancestor in the nested shadow root
    scrollContainer2.dispatchEvent(new Event("scroll"));

    await waitFor(() => {
      expect(document.querySelector('[data-testid="tooltip-content"]')).toBeNull();
    });
  });
});
