import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  focusWithoutScrolling,
  supportsPreventScroll,
  resetSupportsPreventScroll,
} from "../src/utils/focusWithoutScrolling";

describe("focusWithoutScrolling (#558)", () => {
  beforeEach(() => {
    resetSupportsPreventScroll();
  });

  afterEach(() => {
    resetSupportsPreventScroll();
    vi.restoreAllMocks();
    document.body.innerHTML = "";
  });

  it("safely handles null or undefined element", () => {
    expect(() => focusWithoutScrolling(null)).not.toThrow();
  });

  it("uses preventScroll: true when supported by browser", () => {
    const el = document.createElement("button");
    document.body.appendChild(el);

    let passedOptions: FocusOptions | undefined;
    vi.spyOn(el, "focus").mockImplementation(function (this: HTMLElement, options?: FocusOptions) {
      passedOptions = options;
    });

    // In an environment where preventScroll is supported (or simulated)
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(
      (tagName: string, options?: ElementCreationOptions) => {
        const element = originalCreateElement(tagName, options);
        if (tagName.toLowerCase() === "div") {
          vi.spyOn(element, "focus").mockImplementation((opts?: FocusOptions) => {
            // Trigger the preventScroll getter
            if (opts && "preventScroll" in opts) {
              void opts.preventScroll;
            }
          });
        }
        return element;
      },
    );

    resetSupportsPreventScroll();
    expect(supportsPreventScroll()).toBe(true);

    focusWithoutScrolling(el);
    expect(passedOptions).toEqual({ preventScroll: true });
  });

  it("restores scroll position when browser ignores preventScroll without throwing", () => {
    // Simulate older browser that ignores preventScroll and doesn't read the getter
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(
      (tagName: string, options?: ElementCreationOptions) => {
        const element = originalCreateElement(tagName, options);
        if (tagName.toLowerCase() === "div") {
          vi.spyOn(element, "focus").mockImplementation(() => {
            // Do not read preventScroll getter
          });
        }
        return element;
      },
    );

    resetSupportsPreventScroll();
    expect(supportsPreventScroll()).toBe(false);

    // Build ancestor tree: container (overflowing) -> intermediate -> button
    const container = document.createElement("div");
    Object.defineProperty(container, "offsetHeight", { value: 100, configurable: true });
    Object.defineProperty(container, "scrollHeight", { value: 500, configurable: true });
    container.scrollTop = 50;

    const intermediate = document.createElement("div");
    const button = document.createElement("button");

    container.appendChild(intermediate);
    intermediate.appendChild(button);
    document.body.appendChild(container);

    // When button.focus() is called, browser scrolls container to 300
    vi.spyOn(button, "focus").mockImplementation(() => {
      container.scrollTop = 300;
    });

    focusWithoutScrolling(button);

    // focusWithoutScrolling must have restored the initial scroll position
    expect(container.scrollTop).toBe(50);
  });

  it("pins ancestor set to actual overflow rather than computed style overflow", () => {
    // Simulate browser without preventScroll support
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, "createElement").mockImplementation(
      (tagName: string, options?: ElementCreationOptions) => {
        const element = originalCreateElement(tagName, options);
        if (tagName.toLowerCase() === "div") {
          vi.spyOn(element, "focus").mockImplementation(() => {});
        }
        return element;
      },
    );

    resetSupportsPreventScroll();
    expect(supportsPreventScroll()).toBe(false);

    // Element A: styled overflow: auto, but NOT overflowing (offsetHeight == scrollHeight)
    const nonOverflowingContainer = document.createElement("div");
    nonOverflowingContainer.style.overflow = "auto";
    Object.defineProperty(nonOverflowingContainer, "offsetHeight", {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(nonOverflowingContainer, "scrollHeight", {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(nonOverflowingContainer, "offsetWidth", {
      value: 200,
      configurable: true,
    });
    Object.defineProperty(nonOverflowingContainer, "scrollWidth", {
      value: 200,
      configurable: true,
    });
    nonOverflowingContainer.scrollTop = 0;

    // Element B: overflowing container (offsetHeight < scrollHeight)
    const overflowingContainer = document.createElement("div");
    Object.defineProperty(overflowingContainer, "offsetHeight", { value: 100, configurable: true });
    Object.defineProperty(overflowingContainer, "scrollHeight", { value: 400, configurable: true });
    overflowingContainer.scrollTop = 80;

    const button = document.createElement("button");

    overflowingContainer.appendChild(nonOverflowingContainer);
    nonOverflowingContainer.appendChild(button);
    document.body.appendChild(overflowingContainer);

    vi.spyOn(button, "focus").mockImplementation(() => {
      nonOverflowingContainer.scrollTop = 50;
      overflowingContainer.scrollTop = 250;
    });

    focusWithoutScrolling(button);

    // Overflowing container's scroll must be restored
    expect(overflowingContainer.scrollTop).toBe(80);
    // Non-overflowing container was not in the scrollable ancestor list, so it wasn't tracked
    expect(nonOverflowingContainer.scrollTop).toBe(50);
  });
});
