/**
 * @vitest-environment jsdom
 */

/**
 * Tests for openLink.
 *
 * Ported from @react-aria/utils openLink.
 */
import { describe, it, expect, afterEach } from "vite-plus/test";
import { openLink } from "../src/utils/dom";

const noModifiers = { metaKey: false, ctrlKey: false, altKey: false, shiftKey: false };

describe("openLink", () => {
  let link: HTMLAnchorElement | undefined;

  afterEach(() => {
    link?.remove();
    link = undefined;
  });

  const renderLink = (href = "https://example.com/target"): HTMLAnchorElement => {
    const el = document.createElement("a");
    el.href = href;
    document.body.append(el);
    link = el;
    return el;
  };

  it("dispatches a click on the link instead of navigating", () => {
    // Upstream `openLink` (`openLink.tsx:106-144`) never navigates itself: it
    // synthesizes the click the browser would have produced, so a router that
    // listens for clicks, `preventDefault`, and the link's own `rel`/`target`
    // handling all still apply.
    const el = renderLink();
    const events: MouseEvent[] = [];
    el.addEventListener("click", (e) => {
      e.preventDefault();
      events.push(e as MouseEvent);
    });

    openLink(el, noModifiers);

    expect(events).toHaveLength(1);
    expect(events[0].detail).toBe(1);
    expect(events[0].bubbles).toBe(true);
    expect(events[0].cancelable).toBe(true);
  });

  it("carries the modifier keys onto the dispatched click", () => {
    const el = renderLink();
    let received: MouseEvent | undefined;
    el.addEventListener("click", (e) => {
      e.preventDefault();
      received = e as MouseEvent;
    });

    openLink(el, { ...noModifiers, metaKey: true, shiftKey: true });

    expect(received?.metaKey).toBe(true);
    expect(received?.shiftKey).toBe(true);
    expect(received?.ctrlKey).toBe(false);
    expect(received?.altKey).toBe(false);
  });

  it("focuses the link and flags isOpening for the duration of the dispatch", () => {
    const el = renderLink();
    let focusedDuringDispatch: Element | null = null;
    let openingDuringDispatch: boolean | undefined;
    el.addEventListener("click", (e) => {
      e.preventDefault();
      focusedDuringDispatch = document.activeElement;
      openingDuringDispatch = (openLink as { isOpening?: boolean }).isOpening;
    });

    openLink(el, noModifiers);

    expect(focusedDuringDispatch).toBe(el);
    expect(openingDuringDispatch).toBe(true);
    expect((openLink as { isOpening?: boolean }).isOpening).toBe(false);
  });

  it("leaves isOpening alone when setOpening is false", () => {
    const el = renderLink();
    let openingDuringDispatch: boolean | undefined;
    el.addEventListener("click", (e) => {
      e.preventDefault();
      openingDuringDispatch = (openLink as { isOpening?: boolean }).isOpening;
    });

    openLink(el, noModifiers, false);

    expect(openingDuringDispatch).toBe(false);
  });
});
