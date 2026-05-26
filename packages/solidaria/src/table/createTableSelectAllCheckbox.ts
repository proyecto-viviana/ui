/**
 * createTableSelectAllCheckbox - Provides accessibility for a table select-all checkbox.
 * Based on @react-aria/table/useTableSelectAllCheckbox.
 */

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type { TableState, TableCollection } from "@proyecto-viviana/solid-stately";
import type { TableSelectAllCheckboxAria } from "./types";

/**
 * Creates accessibility props for a table select-all checkbox.
 */
export function createTableSelectAllCheckbox<T extends object>(
  state: Accessor<TableState<T, TableCollection<T>>>,
): TableSelectAllCheckboxAria {
  const isSelectAll = createMemo(() => {
    const s = state();
    return s.selectedKeys === "all";
  });

  const isEmpty = createMemo(() => {
    const s = state();
    return s.collection.size === 0;
  });

  const isIndeterminate = createMemo(() => {
    const s = state();
    const selectedKeys = s.selectedKeys;
    if (selectedKeys === "all") return false;
    if (selectedKeys.size === 0) return false;
    return selectedKeys.size < s.collection.size;
  });

  const isDisabled = createMemo(() => {
    const s = state();
    return s.selectionMode !== "multiple" || isEmpty();
  });

  const onChange = () => {
    const s = state();
    if (!isDisabled()) {
      s.toggleSelectAll();
    }
  };

  const checkboxProps = createMemo(() => {
    const s = state();

    const baseProps: Record<string, unknown> = {
      type: "checkbox",
      checked: isSelectAll(),
      disabled: isDisabled(),
      onChange,
      "aria-label": s.selectionMode === "single" ? "Select" : "Select All",
    };

    // Handle indeterminate state
    // Note: indeterminate is not a standard HTML attribute, it must be set via JavaScript
    // The component using this should handle this separately
    if (isIndeterminate()) {
      baseProps["data-indeterminate"] = "true";
      baseProps["aria-checked"] = "mixed";
    }

    return baseProps as JSX.InputHTMLAttributes<HTMLInputElement>;
  });

  return {
    get checkboxProps() {
      return checkboxProps();
    },
  };
}
