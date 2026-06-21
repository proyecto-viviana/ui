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
export { isNonContiguousSelectionModifier, getItemElement } from "./utils";
export { FOCUS_EVENT, CLEAR_FOCUS_EVENT } from "./constants";
export {
  ListKeyboardDelegate,
  type ListKeyboardDelegateOptions,
  type Orientation,
  type Direction,
} from "./ListKeyboardDelegate";
export {
  DOMLayoutDelegate,
  type LayoutDelegate,
  type Rect,
  type Size,
} from "./DOMLayoutDelegate";
export {
  createSelectableCollection,
  type CreateSelectableCollectionOptions,
  type SelectableCollectionAria,
} from "./createSelectableCollection";
export {
  createSelectableList,
  type CreateSelectableListOptions,
  type SelectableListAria,
} from "./createSelectableList";
