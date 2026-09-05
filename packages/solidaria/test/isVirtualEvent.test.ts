/**
 * isVirtualPointerEvent platform matrix — RAC
 * packages/react-aria/src/utils/isVirtualEvent.ts
 */

import { afterEach, describe, expect, it, vi } from "vite-plus/test";
import { isVirtualPointerEvent } from "../src/utils/events";

function pointer(init: PointerEventInit): PointerEvent {
  return new PointerEvent("pointerdown", {
    bubbles: true,
    cancelable: true,
    composed: true,
    pointerId: 1,
    pointerType: "mouse",
    isPrimary: true,
    ...init,
  });
}

describe("isVirtualPointerEvent", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("treats zero-size pointers as virtual off Android", () => {
    expect(isVirtualPointerEvent(pointer({ width: 0, height: 0 }))).toBe(true);
  });

  it("does not treat zero-size pointers as virtual on Android", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Android");
    expect(isVirtualPointerEvent(pointer({ width: 0, height: 0 }))).toBe(false);
  });

  it("does not treat 1-by-1 mouse pointers as virtual off Android", () => {
    expect(
      isVirtualPointerEvent(
        pointer({ width: 1, height: 1, pressure: 0, detail: 0, pointerType: "mouse" }),
      ),
    ).toBe(false);
  });

  it("treats 1-by-1 mouse pointers as virtual on Android", () => {
    vi.spyOn(navigator, "userAgent", "get").mockReturnValue("Android");
    expect(
      isVirtualPointerEvent(
        pointer({ width: 1, height: 1, pressure: 0, detail: 0, pointerType: "mouse" }),
      ),
    ).toBe(true);
  });
});
