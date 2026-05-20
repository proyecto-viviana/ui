/**
 * State management for ComboBox components.
 * Based on @react-stately/combobox useComboBoxState.
 *
 * ComboBox combines a text input with a dropdown list, allowing users to
 * either type to filter options or select from a list.
 */
import { type Accessor } from "solid-js";
import { type MaybeAccessor } from "../utils";
import type { Key, CollectionNode, Collection, FocusStrategy } from "../collections/types";
export type MenuTriggerAction = "focus" | "input" | "manual";
export type { FocusStrategy } from "../collections/types";
export type FilterFn = (textValue: string, inputValue: string) => boolean;
export interface ComboBoxStateProps<T = unknown> {
  /** The items to display in the combobox dropdown. */
  items?: T[];
  /** Default items when uncontrolled. */
  defaultItems?: T[];
  /** Function to get the key for an item. */
  getKey?: (item: T) => Key;
  /** Function to get the text value for an item. */
  getTextValue?: (item: T) => string;
  /** Function to check if an item is disabled. */
  getDisabled?: (item: T) => boolean;
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** The currently selected key (controlled). */
  selectedKey?: Key | null;
  /** The default selected key (uncontrolled). */
  defaultSelectedKey?: Key | null;
  /** Handler called when the selection changes. */
  onSelectionChange?: (key: Key | null) => void;
  /** The current input value (controlled). */
  inputValue?: string;
  /** The default input value (uncontrolled). */
  defaultInputValue?: string;
  /** Handler called when the input value changes. */
  onInputChange?: (value: string) => void;
  /** Whether the combobox is open (controlled). */
  isOpen?: boolean;
  /** Whether the combobox is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler called when the open state changes. */
  onOpenChange?: (isOpen: boolean, trigger?: MenuTriggerAction) => void;
  /** Whether the combobox is disabled. */
  isDisabled?: boolean;
  /** Whether the combobox is read-only. */
  isReadOnly?: boolean;
  /** Whether the combobox is required. */
  isRequired?: boolean;
  /** The filter function to use when filtering items. */
  defaultFilter?: FilterFn;
  /** Whether to allow the menu to open when there are no items. */
  allowsEmptyCollection?: boolean;
  /** Whether to allow custom values that don't match any option. */
  allowsCustomValue?: boolean;
  /** What triggers the menu to open. */
  menuTrigger?: MenuTriggerAction;
  /** Whether to close the menu on blur. */
  shouldCloseOnBlur?: boolean;
}
export interface ComboBoxState<T = unknown> {
  /** The collection of items (may be filtered). */
  readonly collection: Accessor<Collection<T>>;
  /** Whether the combobox dropdown is open. */
  readonly isOpen: Accessor<boolean>;
  /** Open the combobox dropdown. */
  open(focusStrategy?: FocusStrategy | null, trigger?: MenuTriggerAction): void;
  /** Close the combobox dropdown. */
  close(): void;
  /** Toggle the combobox dropdown. */
  toggle(focusStrategy?: FocusStrategy | null, trigger?: MenuTriggerAction): void;
  /** The currently selected key. */
  readonly selectedKey: Accessor<Key | null>;
  /** The default selected key. */
  readonly defaultSelectedKey: Key | null;
  /** The currently selected item. */
  readonly selectedItem: Accessor<CollectionNode<T> | null>;
  /** Set the selected key. */
  setSelectedKey(key: Key | null): void;
  /** The current input value. */
  readonly inputValue: Accessor<string>;
  /** The default input value. */
  readonly defaultInputValue: string;
  /** Set the input value. */
  setInputValue(value: string): void;
  /** The currently focused key in the list. */
  readonly focusedKey: Accessor<Key | null>;
  /** Set the focused key. */
  setFocusedKey(key: Key | null): void;
  /** Whether the combobox input has focus. */
  readonly isFocused: Accessor<boolean>;
  /** Set whether the combobox has focus. */
  setFocused(isFocused: boolean): void;
  /** The focus strategy to use when opening. */
  readonly focusStrategy: Accessor<FocusStrategy | null>;
  /** Commit the current selection (select focused item or custom value). */
  commit(): void;
  /** Revert input to the selected item's text and close menu. */
  revert(): void;
  /** Whether a specific key is disabled. */
  isKeyDisabled(key: Key): boolean;
  /** Select a key and close the menu (for ListState compatibility). */
  select(key: Key): void;
  /** The selection mode (always 'single' for combobox). */
  readonly selectionMode: Accessor<"single">;
  /** Check if a key is selected. */
  isSelected(key: Key): boolean;
  /** Whether the combobox is disabled. */
  readonly isDisabled: boolean;
  /** Whether the combobox is read-only. */
  readonly isReadOnly: boolean;
  /** Whether the combobox is required. */
  readonly isRequired: boolean;
}
/**
 * Default filter function that does case-insensitive "contains" matching.
 */
export declare const defaultContainsFilter: FilterFn;
/**
 * Creates state for a combobox component.
 * Combines list state with input value management and filtering.
 */
export declare function createComboBoxState<T = unknown>(
  props: MaybeAccessor<ComboBoxStateProps<T>>,
): ComboBoxState<T>;
//# sourceMappingURL=createComboBoxState.d.ts.map
