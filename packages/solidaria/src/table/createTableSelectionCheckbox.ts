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
 * createTableSelectionCheckbox - Provides accessibility for a table row selection checkbox.
 * Based on @react-aria/table/useTableSelectionCheckbox.
 */

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import { createId } from "@proyecto-viviana/solid-stately";
import type { TableState, TableCollection } from "@proyecto-viviana/solid-stately";
import type { AriaTableSelectionCheckboxProps, TableSelectionCheckboxAria } from "./types";
import { getRowLabelledBy } from "./utils";
import { createStringFormatter } from "../i18n";
import { gridIntlStrings } from "../grid/intl";

/**
 * Creates accessibility props for a table row selection checkbox.
 */
export function createTableSelectionCheckbox<T extends object>(
  props: Accessor<AriaTableSelectionCheckboxProps>,
  state: Accessor<TableState<T, TableCollection<T>>>,
): TableSelectionCheckboxAria {
  const stringFormatter = createStringFormatter(gridIntlStrings, "@react-aria/grid");
  const checkboxId = createId();

  const isSelected = createMemo(() => {
    const s = state();
    const p = props();
    return s.isSelected(p.key);
  });

  // Mirrors `useGridSelectionCheckbox`'s `!selectionManager.canSelectItem(key)`:
  // a row's checkbox is disabled when selection is off, the key is in
  // `disabledKeys`, or the row/item itself is disabled. This is broader than the
  // row's own focusability gate (which only disables under `disabledBehavior:
  // "all"`) — a row disabled via its `isDisabled` prop still cannot be selected,
  // so its checkbox is disabled regardless of `disabledBehavior`.
  //
  // `isRowDisabled` carries the render-time per-row `isDisabled` that this
  // data-driven port keeps on the row hook rather than the collection node
  // (surfaced via `TableRowContext`); the collection-node check below still
  // applies for any path that does populate `node.isDisabled`.
  const isDisabled = createMemo(() => {
    const s = state();
    const p = props();
    if (s.selectionMode === "none" || s.disabledKeys.has(p.key) || p.isRowDisabled) {
      return true;
    }
    const item = s.collection.getItem(p.key);
    return !item || !!item.isDisabled || !!item.props?.isDisabled;
  });

  const onChange = () => {
    const s = state();
    const p = props();
    if (!isDisabled()) {
      s.toggleSelection(p.key);
    }
  };

  const checkboxProps = createMemo(() => {
    const s = state();
    const p = props();

    const baseProps: Record<string, unknown> = {
      id: checkboxId,
      type: "checkbox",
      checked: isSelected(),
      disabled: isDisabled(),
      onChange,
      "aria-label": stringFormatter().format("select"),
      // Mirrors `useTableSelectionCheckbox`: the checkbox is labelled by its own
      // "Select" text plus the row's row-header cell(s), so screen readers read
      // "Select Foo.pdf" rather than a bare "Select".
      "aria-labelledby": `${checkboxId} ${getRowLabelledBy(s, p.key)}`,
    };

    return baseProps as JSX.InputHTMLAttributes<HTMLInputElement>;
  });

  return {
    get checkboxProps() {
      return checkboxProps();
    },
  };
}
