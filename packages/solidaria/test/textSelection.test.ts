/**
 * @vitest-environment jsdom
 *
 * Press text-selection restore. Pin: react-aria interactions/textSelection.ts.
 */

import { afterEach, beforeEach, describe, expect, it, vi } from "vite-plus/test";
import { disableTextSelection, restoreTextSelection } from "../src/utils/textSelection";

class MockTransitionEvent extends Event {
  propertyName: string;

  constructor(type: string, init?: TransitionEventInit) {
    super(type, init);
    this.propertyName = init?.propertyName ?? "";
  }
}

describe("text selection", () => {
  const nodes = new Set<Element>();
  const originalTransitionEvent = globalThis.TransitionEvent;
  let platformGetter: ReturnType<typeof vi.spyOn> | undefined;
  const previousUserSelect = document.documentElement.style.webkitUserSelect;

  beforeEach(() => {
    Object.defineProperty(globalThis, "TransitionEvent", {
      configurable: true,
      value: MockTransitionEvent,
    });
    document.dispatchEvent(new Event("DOMContentLoaded"));
    platformGetter = vi.spyOn(window.navigator, "platform", "get");
    platformGetter.mockReturnValue("Linux");
  });

  afterEach(() => {
    platformGetter?.mockReturnValue("Linux");
    document.documentElement.style.webkitUserSelect = "none";
    restoreTextSelection();
    if (vi.isFakeTimers()) {
      vi.runOnlyPendingTimers();
    }
    document.documentElement.style.webkitUserSelect = previousUserSelect;
    for (const node of nodes) {
      node.remove();
    }
    nodes.clear();
    Object.defineProperty(globalThis, "TransitionEvent", {
      configurable: true,
      value: originalTransitionEvent,
    });
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  function appendDiv(): HTMLDivElement {
    const element = document.createElement("div");
    nodes.add(element);
    document.body.appendChild(element);
    return element;
  }

  it("puts back the user-select a press replaced", () => {
    const element = appendDiv();
    element.style.userSelect = "text";

    disableTextSelection(element);
    expect(element.style.userSelect).toBe("none");

    restoreTextSelection(element);
    expect(element.style.userSelect).toBe("text");
  });

  it("keeps a user-select written while the press is down", () => {
    const element = appendDiv();

    disableTextSelection(element);
    expect(element.style.userSelect).toBe("none");
    element.style.userSelect = "text";

    restoreTextSelection(element);
    expect(element.style.userSelect).toBe("text");
  });

  it("drops an empty style attribute after restore", () => {
    const element = appendDiv();

    disableTextSelection(element);
    restoreTextSelection(element);

    expect(element.hasAttribute("style")).toBe(false);
  });

  it("disables selection on an svg target", () => {
    const element = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    nodes.add(element);
    document.body.appendChild(element);

    disableTextSelection(element);
    expect(element.style.userSelect).toBe("none");

    restoreTextSelection(element);
    expect(element.style.userSelect).toBe("");
    expect(element.hasAttribute("style")).toBe(false);
  });

  describe("iOS page selection", () => {
    beforeEach(() => {
      vi.useFakeTimers();
      platformGetter?.mockReturnValue("iPhone");
      document.documentElement.style.webkitUserSelect = "text";
    });

    it("keeps a page user-select written before the restore delay ends", () => {
      disableTextSelection();
      expect(document.documentElement.style.webkitUserSelect).toBe("none");

      restoreTextSelection();
      document.documentElement.style.webkitUserSelect = "all";
      vi.advanceTimersByTime(316);

      expect(document.documentElement.style.webkitUserSelect).toBe("all");
    });

    it("waits for an in-flight transition before restoring the page", () => {
      disableTextSelection();
      expect(document.documentElement.style.webkitUserSelect).toBe("none");

      document.body.dispatchEvent(
        new TransitionEvent("transitionrun", { propertyName: "opacity", bubbles: true }),
      );
      restoreTextSelection();
      vi.advanceTimersByTime(316);

      expect(document.documentElement.style.webkitUserSelect).toBe("none");

      document.body.dispatchEvent(
        new TransitionEvent("transitionend", { propertyName: "opacity", bubbles: true }),
      );
      expect(document.documentElement.style.webkitUserSelect).toBe("text");
    });
  });
});
