import { describe, it, expect } from "vitest";
import { DIRECTORY_DRAG_TYPE } from "@proyecto-viviana/solid-stately";
import { DragTypesImpl } from "../src/dnd/utils";

// DragTypesImpl reads only `items` (iterable of {type, kind}) and `types`
// (string list, for Safari's "Files" probe) off the DataTransfer, so a plain
// object is enough to exercise the matching logic.
type FakeItem = { type: string; kind?: string };
function makeTransfer(items: FakeItem[], types: string[] = []): DataTransfer {
  return {
    items: items.map((i) => ({ type: i.type, kind: i.kind ?? "string" })),
    types,
  } as unknown as DataTransfer;
}

describe("DragTypesImpl.has", () => {
  it("matches an exact MIME type", () => {
    const t = new DragTypesImpl(makeTransfer([{ type: "image/png", kind: "file" }]));
    expect(t.has("image/png")).toBe(true);
    expect(t.has("image/jpeg")).toBe(false);
    expect(t.has("text/html")).toBe(false);
  });

  it("matches a 'type/*' wildcard against the type prefix", () => {
    const t = new DragTypesImpl(makeTransfer([{ type: "image/png", kind: "file" }]));
    // Exact-only matching (the previous behaviour) never matched "image/*".
    expect(t.has("image/*")).toBe(true);
    expect(t.has("video/*")).toBe(false);
  });

  it("matches the '*/*' wildcard against any present type", () => {
    const t = new DragTypesImpl(makeTransfer([{ type: "text/plain" }]));
    expect(t.has("*/*")).toBe(true);
  });

  it("accepts an array and matches when any entry matches", () => {
    const t = new DragTypesImpl(makeTransfer([{ type: "image/png", kind: "file" }]));
    expect(t.has(["application/json", "image/*"])).toBe(true);
    expect(t.has(["application/json", "text/plain"])).toBe(false);
  });

  it("matches DIRECTORY_DRAG_TYPE only for the directory symbol when a generic type is present", () => {
    // A file with an unknown/empty type maps to the generic type, which stands
    // in for a possible directory until drop.
    const dir = new DragTypesImpl(makeTransfer([{ type: "", kind: "file" }]));
    expect(dir.has(DIRECTORY_DRAG_TYPE)).toBe(true);
    // A non-directory symbol must NOT match, even though the generic type is present.
    expect(dir.has(Symbol("other"))).toBe(false);

    // A named file type is not a directory.
    const named = new DragTypesImpl(makeTransfer([{ type: "image/png", kind: "file" }]));
    expect(named.has(DIRECTORY_DRAG_TYPE)).toBe(false);
  });

  it("treats Safari's unknown 'Files' transfer as matching anything", () => {
    const t = new DragTypesImpl(makeTransfer([], ["Files"]));
    expect(t.has("image/png")).toBe(true);
    expect(t.has("*/*")).toBe(true);
    expect(t.has(["text/plain"])).toBe(true);
  });
});
