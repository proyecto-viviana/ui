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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/table/useTableSelectionCheckbox.ts

/**
 * createTableSelectAllCheckbox - Provides accessibility for a table select-all checkbox.
 * Ported from packages/react-aria/src/table/useTableSelectionCheckbox.ts.
 */

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type { TableState, TableCollection } from "@proyecto-viviana/solid-stately";
import type { TableSelectAllCheckboxAria } from "./types";
import { createStringFormatter } from "../i18n";
import { tableIntlStrings } from "./intl";

/**
 * Creates accessibility props for a table select-all checkbox.
 */
export function createTableSelectAllCheckbox<T extends object>(
  state: Accessor<TableState<T, TableCollection<T>>>,
): TableSelectAllCheckboxAria {
  const stringFormatter = createStringFormatter(tableIntlStrings, "@react-aria/table");
  const isSelectAll = createMemo(() => {
    return state().isSelectAll;
  });

  const isCollectionEmpty = createMemo(() => {
    const s = state();
    return s.collection.size === 0;
  });

  const isEmpty = createMemo(() => {
    return state().isEmpty;
  });

  // RAC: `isIndeterminate: !isEmpty && !isSelectAll` (not selectedKeys.size vs collection.size).
  const isIndeterminate = createMemo(() => !isEmpty() && !isSelectAll());

  const isDisabled = createMemo(() => {
    const s = state();
    return s.selectionMode !== "multiple" || isCollectionEmpty();
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
      "aria-label": stringFormatter().format(s.selectionMode === "single" ? "select" : "selectAll"),
    };

    if (isIndeterminate()) {
      baseProps["data-indeterminate"] = "true";
    }

    return baseProps as JSX.InputHTMLAttributes<HTMLInputElement>;
  });

  return {
    get checkboxProps() {
      return checkboxProps();
    },
    get isIndeterminate() {
      return isIndeterminate();
    },
  };
}
