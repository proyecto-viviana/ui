import { describe, it, expect } from "vite-plus/test";
import { DIRECTORY_DRAG_TYPE } from "@proyecto-viviana/solid-stately";
import { getDropItemTypes } from "../src/dnd/createDroppableCollection";

describe("createDroppableCollection accepted drag types", () => {
  it("maps file and text drop items to their drag types", () => {
    const fileTypes = getDropItemTypes({
      kind: "file",
      type: "image/png",
      name: "x.png",
      async getFile() {
        return new File([], "x.png", { type: "image/png" });
      },
      async getText() {
        return "";
      },
    });
    expect(fileTypes.has("image/png")).toBe(true);

    const textTypes = getDropItemTypes({
      kind: "text",
      types: new Set(["text/plain"]),
      async getText() {
        return "";
      },
    });
    expect(textTypes.has("text/plain")).toBe(true);
  });

  it("maps directory drop items to DIRECTORY_DRAG_TYPE symbol", () => {
    const directoryTypes = getDropItemTypes({
      kind: "directory",
      name: "folder",
      async *getEntries() {},
    });

    expect(directoryTypes.has(DIRECTORY_DRAG_TYPE)).toBe(true);
  });
});
