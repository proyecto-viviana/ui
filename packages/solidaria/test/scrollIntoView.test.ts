/**
 * @vitest-environment jsdom
 */
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { scrollIntoView } from "../src/utils/scrollIntoView";

// Mirrors react-aria/test/utils/scrollIntoView.test.ts, adapted to Vitest. The
// util takes a deterministic test branch (sets scrollLeft/scrollTop directly)
// when NODE_ENV === "test", which is what these assertions read.

type ComputedStyleOverrides = Record<string, string>;

function mockComputedStyle(
  scrollView: HTMLElement,
  viewStyle: ComputedStyleOverrides,
  itemStyle: ComputedStyleOverrides,
): void {
  vi.spyOn(window, "getComputedStyle").mockImplementation(
    (el) => (el === scrollView ? viewStyle : itemStyle) as CSSStyleDeclaration,
  );
}

const noScrollMargin: ComputedStyleOverrides = {
  scrollMarginTop: "0px",
  scrollMarginBottom: "0px",
  scrollMarginLeft: "0px",
  scrollMarginRight: "0px",
};

// A 500 x 500 root scroll port with a 100px border on every side.
const rootViewStyle: ComputedStyleOverrides = {
  borderTopWidth: "100px",
  borderBottomWidth: "100px",
  borderLeftWidth: "100px",
  borderRightWidth: "100px",
  scrollPaddingTop: "0px",
  scrollPaddingBottom: "0px",
  scrollPaddingLeft: "0px",
  scrollPaddingRight: "0px",
  direction: "ltr",
};

describe("scrollIntoView", () => {
  let target: HTMLElement;
  let scrollView: HTMLElement;

  beforeEach(() => {
    target = document.createElement("div");
    document.body.appendChild(target);

    scrollView = (document.scrollingElement as HTMLElement) || document.documentElement;
    scrollView.scrollTop = 0;
    scrollView.scrollLeft = 0;
    Object.defineProperty(scrollView, "clientHeight", { get: () => 500, configurable: true });
    Object.defineProperty(scrollView, "clientWidth", { get: () => 500, configurable: true });
  });

  afterEach(() => {
    document.body.innerHTML = "";
    vi.restoreAllMocks();
  });

  function mockTargetRect(): void {
    // Target is a 1000 x 1000 box at (100, 2100) — off-screen below the port.
    vi.spyOn(target, "getBoundingClientRect").mockReturnValue({
      top: 2100,
      bottom: 3100,
      left: 100,
      right: 1100,
      width: 1000,
      height: 1000,
      x: 100,
      y: 2100,
      toJSON: () => ({}),
    } as DOMRect);
  }

  it("excludes the root border from the scroll port when aligning to start", () => {
    mockTargetRect();
    mockComputedStyle(scrollView, rootViewStyle, noScrollMargin);

    scrollIntoView(scrollView, target, { block: "start", inline: "start" });
    expect(scrollView.scrollLeft).toBe(100);
    expect(scrollView.scrollTop).toBe(2100);
  });

  it("excludes the root border from the scroll port when aligning to end", () => {
    mockTargetRect();
    mockComputedStyle(scrollView, rootViewStyle, noScrollMargin);

    scrollIntoView(scrollView, target, { block: "end", inline: "end" });
    expect(scrollView.scrollLeft).toBe(600);
    expect(scrollView.scrollTop).toBe(2600);
  });

  it("offsets the scroll area by the element's scroll margin (PR #9146)", () => {
    mockTargetRect();
    mockComputedStyle(scrollView, rootViewStyle, { ...noScrollMargin, scrollMarginTop: "50px" });

    // scrollMarginTop widens the scroll area upward, so the start-aligned scroll
    // stops 50px earlier than the no-margin baseline of 2100.
    scrollIntoView(scrollView, target, { block: "start", inline: "start" });
    expect(scrollView.scrollTop).toBe(2050);
    expect(scrollView.scrollLeft).toBe(100);
  });

  it("does nothing when the scroll view is the element itself", () => {
    scrollView.scrollTop = 42;
    scrollView.scrollLeft = 17;

    scrollIntoView(scrollView, scrollView, { block: "start" });
    expect(scrollView.scrollTop).toBe(42);
    expect(scrollView.scrollLeft).toBe(17);
  });
});
