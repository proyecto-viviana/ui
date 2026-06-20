/**
 * Selection utilities for managing typeahead and keyboard navigation
 * in collection components.
 */

export { createTypeSelect, type TypeSelectOptions, type TypeSelectAria } from "./createTypeSelect";
export {
  createScrollIntoViewOnFocus,
  type ScrollIntoViewOnFocusOptions,
} from "./createScrollIntoViewOnFocus";
export { selectItem } from "./selectItem";
export {
  createSelectableItem,
  ITEM_ACTION_EVENT,
  type CreateSelectableItemOptions,
  type SelectableItemAria,
  type LinkBehavior,
} from "./createSelectableItem";
export { isNonContiguousSelectionModifier } from "./utils";
