/**
 * Table typeahead follows @react-aria/table TableKeyboardDelegate.getKeyForSearch:
 * an explicit row text matches as a whole, otherwise each row-header cell matches
 * on its own. The selection checkbox label is not part of the search, and the
 * focused row is tried before the rows after it.
 */

import { describe, it, expect, vi, afterEach } from "vite-plus/test";
import { createRoot } from "solid-js";
import { createTableCollection, createTableState } from "@proyecto-viviana/solid-stately";
import { createTable } from "../src/table";

interface NamedRow {
  name: string;
  type?: string;
  quarter?: string;
}

function press(
  onKeyDown: (event: KeyboardEvent) => void,
  key: string,
  init: KeyboardEventInit = {},
) {
  const event = new KeyboardEvent("keydown", { key, cancelable: true, ...init });
  onKeyDown(event);
  return event;
}

describe("createTable typeahead", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("matches a row header when every row text starts with the selection label", () => {
    vi.useFakeTimers();
    createRoot((dispose) => {
      const collection = createTableCollection<NamedRow>({
        showSelectionCheckboxes: true,
        columns: [
          { key: "name", name: "Name", isRowHeader: true },
          { key: "type", name: "Type" },
        ],
        rows: [
          { key: "games", value: { name: "Games", type: "File folder" } },
          { key: "program", value: { name: "Program Files", type: "File folder" } },
          { key: "boot", value: { name: "bootmgr", type: "System file" } },
          { key: "log", value: { name: "log.txt", type: "Text Document" } },
        ],
      });
      expect(collection.getTextValue("boot").startsWith("Selection")).toBe(true);

      const state = createTableState<NamedRow>(() => ({ collection }));
      const table = createTable<NamedRow>(
        () => ({ "aria-label": "Files" }),
        () => state,
        () => null,
      );
      const onKeyDown = table.gridProps.onKeyDown as (event: KeyboardEvent) => void;

      state.setFocusedKey("games");
      const missed = press(onKeyDown, "s");
      expect(missed.defaultPrevented).toBe(false);
      expect(state.focusedKey).toBe("games");

      press(onKeyDown, "b");
      press(onKeyDown, "o");
      press(onKeyDown, "o");
      expect(state.focusedKey).toBe("boot");

      vi.advanceTimersByTime(1000);
      state.setFocusedKey("games");
      press(onKeyDown, "B");
      press(onKeyDown, "o");
      press(onKeyDown, "o");
      expect(state.focusedKey).toBe("boot");

      vi.advanceTimersByTime(1000);
      const nameCell = collection.getCell("games", "name");
      expect(nameCell).not.toBeNull();
      state.setFocusedKey(nameCell!.key);
      press(onKeyDown, "b");
      expect(state.focusedKey).toBe(collection.getCell("boot", "name")?.key);

      dispose();
    });
  });

  it("matches a second row header that the joined row text does not start with", () => {
    createRoot((dispose) => {
      const collection = createTableCollection<NamedRow>({
        columns: [
          { key: "quarter", name: "Quarter", isRowHeader: true },
          { key: "name", name: "Name", isRowHeader: true },
        ],
        rows: [
          { key: "q1", value: { quarter: "Q1", name: "Brief" } },
          { key: "q2", value: { quarter: "Q2", name: "Budget" } },
        ],
      });
      const state = createTableState<NamedRow>(() => ({ collection }));
      const table = createTable<NamedRow>(
        () => ({ "aria-label": "Plans" }),
        () => state,
        () => null,
      );
      const onKeyDown = table.gridProps.onKeyDown as (event: KeyboardEvent) => void;

      state.setFocusedKey("q1");
      // "b" matches the focused row's second header ("Brief"). Skipping that
      // row would land on "Budget". "bu" matches "Budget", not the joined "Q1 Brief".
      press(onKeyDown, "b");
      expect(state.focusedKey).toBe("q1");
      press(onKeyDown, "u");
      expect(state.focusedKey).toBe("q2");

      dispose();
    });
  });

  it("matches an explicit row text, and still searches row headers when that text misses", () => {
    vi.useFakeTimers();
    createRoot((dispose) => {
      const collection = createTableCollection<NamedRow>({
        columns: [
          { key: "name", name: "Name", isRowHeader: true },
          { key: "type", name: "Type" },
        ],
        rows: [
          {
            key: "boot",
            value: { name: "3. bootmgr", type: "System file" },
            textValue: "bootmgr",
          },
          {
            key: "other",
            value: { name: "bootmgr", type: "System file" },
            textValue: "zzz",
          },
        ],
      });
      expect(collection.getTextValue("boot")).toBe("bootmgr");

      const state = createTableState<NamedRow>(() => ({ collection }));
      const table = createTable<NamedRow>(
        () => ({ "aria-label": "Files" }),
        () => state,
        () => null,
      );
      const onKeyDown = table.gridProps.onKeyDown as (event: KeyboardEvent) => void;

      state.setFocusedKey("boot");
      press(onKeyDown, "b");
      press(onKeyDown, "o");
      press(onKeyDown, "o");
      expect(state.focusedKey).toBe("boot");

      vi.advanceTimersByTime(1000);
      state.setFocusedKey("other");
      press(onKeyDown, "b");
      expect(state.focusedKey).toBe("other");

      dispose();
    });
  });

  it("starts at the focused row and lets a plain a reach a row header", () => {
    vi.useFakeTimers();
    createRoot((dispose) => {
      const collection = createTableCollection<NamedRow>({
        columns: [{ key: "name", name: "Name", isRowHeader: true }],
        rows: [
          { key: "budget", value: { name: "budget" } },
          { key: "brief", value: { name: "brief" } },
          { key: "alpha", value: { name: "alpha" } },
        ],
      });
      const state = createTableState<NamedRow>(() => ({
        collection,
        selectionMode: "multiple",
      }));
      const table = createTable<NamedRow>(
        () => ({ "aria-label": "Plans" }),
        () => state,
        () => null,
      );
      const onKeyDown = table.gridProps.onKeyDown as (event: KeyboardEvent) => void;

      state.setFocusedKey("budget");
      press(onKeyDown, "b");
      expect(state.focusedKey).toBe("budget");

      vi.advanceTimersByTime(1000);
      state.setFocusedKey("budget");
      press(onKeyDown, "a");
      expect(state.focusedKey).toBe("alpha");

      vi.advanceTimersByTime(1000);
      state.setFocusedKey("budget");
      press(onKeyDown, "a", { ctrlKey: true });
      // Mod+A selects every row and must not move focus. selectedKeys is the
      // live write; isSelectAll is a memo and stays stale until a flush, and
      // flushing this root runs createHasTabbableChild's owned write.
      expect(state.focusedKey).toBe("budget");
      expect(state.selectedKeys).toBe("all");

      dispose();
    });
  });

  it("skips a disabled row header", () => {
    createRoot((dispose) => {
      const collection = createTableCollection<NamedRow>({
        columns: [{ key: "name", name: "Name", isRowHeader: true }],
        rows: [
          { key: "games", value: { name: "Games" } },
          { key: "boot", value: { name: "bootmgr" } },
        ],
      });
      const state = createTableState<NamedRow>(() => ({
        collection,
        disabledKeys: ["boot"],
      }));
      const table = createTable<NamedRow>(
        () => ({ "aria-label": "Files" }),
        () => state,
        () => null,
      );
      const onKeyDown = table.gridProps.onKeyDown as (event: KeyboardEvent) => void;

      state.setFocusedKey("games");
      press(onKeyDown, "b");
      expect(state.focusedKey).toBe("games");

      dispose();
    });
  });
});
