/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@adobe/react-spectrum/src/autocomplete/SearchAutocomplete.tsx

// Port of @react-spectrum source: https://github.com/adobe/react-spectrum/blob/5ecb3333001313e83898cd07644227897e3bae1f/packages/@adobe/react-spectrum/src/autocomplete/SearchAutocomplete.tsx.

import { type JSX, splitProps } from "solid-js";
import { ComboBox, ComboBoxOption, type FilterFn, type Key } from "../combobox";
import { style } from "../style" with { type: "macro" };

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

// The wrapper establishes a positioning context for the ComboBox popover and sets
// the base text size. Routed through the `style()` macro instead of invented
// `relative` / `text-*` utilities; the stable `vui-search-autocomplete` marker class
// (which tests and consumers target) is kept as a plain hook alongside it.
const autocompleteWrapper = style<{ size: SearchAutocompleteSize }>({
  position: "relative",
  fontSize: { size: { sm: "ui-sm", md: "ui", lg: "ui-lg" } },
});

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
      class={["vui-search-autocomplete", autocompleteWrapper({ size: size() }), local.class]
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
