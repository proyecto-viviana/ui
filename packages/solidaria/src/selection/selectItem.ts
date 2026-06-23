/**
 * The aria-layer selection decision, mirroring `@react-aria/selection`'s
 * `useSelectableItem` `onSelect`. This is where the platform-aware modifier
 * resolution lives — react-stately's `SelectionManager.select` only knows
 * `pointerType` + `selectionBehavior`; the ctrl/meta/shift decision belongs one
 * layer up, here, where `isMac` is reachable.
 *
 * The link branch (`linkBehavior` 'selection'/'override'/'none') is deferred to
 * `createSelectableItem` (Phase 1 of the press-path epic); callers here pass
 * non-link items.
 */

import type { Accessor } from "solid-js";
import type {
  Collection,
  Key,
  SelectionBehavior,
  SelectionMode,
  SelectionPressEvent,
} from "@proyecto-viviana/solid-stately";

import { isCtrlKeyPressed } from "../utils/keyboard";
import { isNonContiguousSelectionModifier } from "./utils";

export interface SelectItemState {
  readonly selectionMode: Accessor<SelectionMode>;
  readonly selectionBehavior: Accessor<SelectionBehavior>;
  readonly disallowEmptySelection: Accessor<boolean>;
  isSelected(key: Key): boolean;
  toggleSelection(key: Key): void;
  replaceSelection(key: Key): void;
  extendSelection(toKey: Key, collection: Collection): void;
}

/**
 * Resolve a press/keyboard interaction into a selection mutation on `manager`,
 * faithful to `useSelectableItem.onSelect`. `collection` is required for the
 * shift-extend (contiguous range) path.
 */
export function selectItem(
  manager: SelectItemState,
  key: Key,
  e: SelectionPressEvent,
  collection: Collection,
): void {
  // A keyboard non-contiguous modifier (Alt on Apple devices, Ctrl elsewhere)
  // always toggles, independent of mode/behavior.
  if (e.pointerType === "keyboard" && isNonContiguousSelectionModifier(e)) {
    manager.toggleSelection(key);
    return;
  }

  if (manager.selectionMode() === "none") {
    return;
  }

  if (manager.selectionMode() === "single") {
    // Single mode ignores selectionBehavior. Re-selecting the current item
    // deselects it when empty selection is allowed; otherwise it stays
    // selected (replace).
    if (manager.isSelected(key) && !manager.disallowEmptySelection()) {
      manager.toggleSelection(key);
    } else {
      manager.replaceSelection(key);
    }
  } else if (e.shiftKey) {
    manager.extendSelection(key, collection);
  } else if (
    manager.selectionBehavior() === "toggle" ||
    isCtrlKeyPressed(e) ||
    e.pointerType === "touch" ||
    e.pointerType === "virtual"
  ) {
    // touch / virtual (VoiceOver) have no modifier keys, so multi-select is
    // only reachable by toggling.
    manager.toggleSelection(key);
  } else {
    manager.replaceSelection(key);
  }
}
