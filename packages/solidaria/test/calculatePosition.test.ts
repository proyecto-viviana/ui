/**
 * Tests for the `targetRect` override in calculatePosition (ported from
 * @react-aria/overlays useOverlayPosition's getTargetRect). The override lets a
 * caller position an overlay relative to an arbitrary point — e.g. the mouse
 * cursor for a context menu or a text selection — instead of the trigger's own
 * measured bounding rect.
 *
 * In jsdom every `getBoundingClientRect()` measures as zero, so a default
 * `bottom`-placed overlay sits at the origin. Supplying `targetRect` shifts the
 * computed position to that rect, which makes the override observable without a
 * real layout engine.
 */

import { describe, it, expect } from "vitest";
import { calculatePosition, type PositionOpts } from "../src/popover/calculatePosition";

function baseOpts(overrides: Partial<PositionOpts> = {}): PositionOpts {
  const targetNode = document.createElement("div");
  const overlayNode = document.createElement("div");
  return {
    placement: "bottom",
    targetNode,
    overlayNode,
    scrollNode: overlayNode,
    padding: 0,
    shouldFlip: false,
    boundaryElement: document.body,
    offset: 0,
    crossOffset: 0,
    arrowSize: 0,
    ...overrides,
  };
}

describe("calculatePosition targetRect override", () => {
  it("uses the measured trigger rect by default", () => {
    // jsdom measures all rects as zero, so a bottom-placed overlay sits at the origin.
    const result = calculatePosition(baseOpts());
    expect(result.position.top).toBe(0);
  });

  it("positions relative to the overridden rect when targetRect is provided", () => {
    const result = calculatePosition(
      baseOpts({ targetRect: { top: 300, left: 50, width: 20, height: 40 } }),
    );
    // bottom placement => overlay top = targetRect.top + targetRect.height + offset.
    expect(result.position.top).toBe(340);
  });

  it("honors the offset relative to the overridden rect", () => {
    const result = calculatePosition(
      baseOpts({
        offset: 8,
        targetRect: { top: 300, left: 50, width: 20, height: 40 },
      }),
    );
    expect(result.position.top).toBe(348);
  });

  it("treats a null targetRect the same as no override", () => {
    const result = calculatePosition(baseOpts({ targetRect: null }));
    expect(result.position.top).toBe(0);
  });
});
