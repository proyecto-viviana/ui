import { type JSX, splitProps } from "solid-js";
import { ComboBox, ComboBoxOption, type FilterFn, type Key } from "../combobox";

export type SearchAutocompleteSize = "sm" | "md" | "lg";

export interface SearchAutocompleteItem {
  id: string;
  name: string;
  [key: string]: unknown;
}

export interface SearchAutocompleteProps<
  T extends SearchAutocompleteItem = SearchAutocompleteItem,
> {
  /** The items to display in the dropdown. */
  items: T[];
  /** The size of the autocomplete. @default 'md' */
  size?: SearchAutocompleteSize;
  /** Placeholder text for the input. */
  placeholder?: string;
  /** Accessible label for the input. */
  "aria-label"?: string;
  /** Label text shown above the input. */
  label?: string;
  /** Description text shown below the input. */
  description?: string;
  /** The current input value (controlled). */
  inputValue?: string;
  /** The default input value (uncontrolled). */
  defaultInputValue?: string;
  /** Handler called when the input value changes. */
  onInputChange?: (value: string) => void;
  /** Handler called when an item is selected. */
  onSelect?: (item: T) => void;
  /** Additional CSS class name. */
  class?: string;
  /** Whether the input is disabled. */
  isDisabled?: boolean;
  /** Custom filter function. */
  filter?: FilterFn;
  /** Custom render function for items. */
  renderItem?: (item: T) => JSX.Element;
  /** Key to use for the display text. @default 'name' */
  textKey?: keyof T;
}

const sizeStyles = {
  sm: {
    container: "text-sm",
  },
  md: {
    container: "text-base",
  },
  lg: {
    container: "text-lg",
  },
};

/**
 * A styled autocomplete component for searching and selecting from a list.
 */
export function SearchAutocomplete<T extends SearchAutocompleteItem = SearchAutocompleteItem>(
  props: SearchAutocompleteProps<T>,
): JSX.Element {
  const [local, comboBoxProps] = splitProps(props, [
    "items",
    "size",
    "placeholder",
    "aria-label",
    "label",
    "description",
    "onSelect",
    "class",
    "isDisabled",
    "renderItem",
    "textKey",
  ]);

  const size = () => local.size ?? "md";
  const textKey = () => (local.textKey ?? "name") as keyof T;
  const styles = () => sizeStyles[size()];

  const getTextValue = (item: T): string => {
    const text = item[textKey()] ?? item.name;
    return String(text ?? "");
  };

  const handleSelectionChange = (key: Key | null) => {
    if (key == null) return;
    const selected = local.items.find((item) => String(item.id) === String(key));
    if (selected) {
      local.onSelect?.(selected);
    }
  };

  return (
    <div
      class={["vui-search-autocomplete relative", styles().container, local.class]
        .filter(Boolean)
        .join(" ")}
    >
      <ComboBox<T>
        {...comboBoxProps}
        items={local.items}
        size={size()}
        label={local.label}
        description={local.description}
        aria-label={local["aria-label"]}
        placeholder={local.placeholder}
        isDisabled={local.isDisabled}
        defaultFilter={comboBoxProps.filter}
        getKey={(item) => item.id}
        getTextValue={getTextValue}
        onSelectionChange={handleSelectionChange}
      >
        {(item: T) => (
          <ComboBoxOption id={item.id}>
            {local.renderItem ? local.renderItem(item) : getTextValue(item)}
          </ComboBoxOption>
        )}
      </ComboBox>
    </div>
  );
}
