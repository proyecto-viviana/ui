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
export { isNonContiguousSelectionModifier } from "./utils";
