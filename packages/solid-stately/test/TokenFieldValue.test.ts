/**
 * TokenFieldValue selected-range contract from RAC 1.21.
 */
import { describe, expect, it } from "vite-plus/test";
import { TokenFieldValue, type SelectedRange } from "../src";

describe("TokenFieldValue", () => {
  it("keeps identity when withSelectedRange receives an equal range", () => {
    const value = new TokenFieldValue([{ type: "text", text: "ab" }]);
    const same = value.withSelectedRange(
      new TokenFieldValue.SelectedRange({ index: 0, offset: 0 }),
    );
    expect(same).toBe(value);
  });

  it("tracks the full selected range and exposes caretPosition as current", () => {
    const value = new TokenFieldValue([{ type: "text", text: "ab" }]);
    const range: SelectedRange = new TokenFieldValue.SelectedRange(
      { index: 0, offset: 2 },
      { index: 0, offset: 0 },
    );
    const next = value.withSelectedRange(range);
    expect(next).not.toBe(value);
    expect(next.selectedRange.isCollapsed).toBe(false);
    expect(next.selectedRange.start).toEqual({ index: 0, offset: 0 });
    expect(next.selectedRange.end).toEqual({ index: 0, offset: 2 });
    expect(next.caretPosition).toEqual({ index: 0, offset: 0 });
    expect(next.withCaretPosition({ index: 0, offset: 1 }).caretPosition).toEqual({
      index: 0,
      offset: 1,
    });
    expect(next.withCaretPosition({ index: 0, offset: 1 }).selectedRange.isCollapsed).toBe(true);
  });

  it("stores the replaced range on the previous node for undo", () => {
    const value = new TokenFieldValue([{ type: "text", text: "hello" }]);
    const next = value.replaceRange({ index: 0, offset: 1 }, { index: 0, offset: 4 }, "X", false);
    expect(value.selectedRange.start).toEqual({ index: 0, offset: 1 });
    expect(value.selectedRange.end).toEqual({ index: 0, offset: 4 });
    expect(value.selectedRange.isCollapsed).toBe(false);
    expect(next.undo()).toBe(value);
    expect(next.toString()).toBe("hXo");
    expect(next.caretPosition).toEqual({ index: 0, offset: 2 });
  });

  it("returns a new identity from delete only when the range differs", () => {
    const empty = new TokenFieldValue([]);
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    const same = empty.delete(
      { index: 0, offset: 0 },
      segmenter,
      TokenFieldValue.Direction.Backward,
    );
    expect(same).toBe(empty);

    const next = empty.delete(
      { index: 0, offset: 2 },
      segmenter,
      TokenFieldValue.Direction.Backward,
    );
    expect(next).not.toBe(empty);
    expect(next.caretPosition).toEqual({ index: 0, offset: 2 });
    expect(next.segments).toEqual([]);
  });
});
