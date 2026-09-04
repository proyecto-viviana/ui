/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/gridlist/useGridListSelectionCheckbox.ts

/**
 * createGridListSelectionCheckbox - Provides accessibility for a grid list item selection checkbox.
 * Ported from packages/react-aria/src/gridlist/useGridListSelectionCheckbox.ts.
 */

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import { createId } from "@proyecto-viviana/solid-stately";
import type { GridState, GridCollection } from "@proyecto-viviana/solid-stately";
import type { AriaGridListSelectionCheckboxProps, GridListSelectionCheckboxAria } from "./types";
import { getGridListData } from "./createGridList";
import { createStringFormatter } from "../i18n";
import { gridIntlStrings } from "../grid/intl";

/**
 * Creates accessibility props for a grid list item selection checkbox.
 */
export function createGridListSelectionCheckbox<
  T extends object,
  C extends GridCollection<T> = GridCollection<T>,
>(
  props: Accessor<AriaGridListSelectionCheckboxProps>,
  state: Accessor<GridState<T, C>>,
): GridListSelectionCheckboxAria {
  const stringFormatter = createStringFormatter(gridIntlStrings, "@react-aria/grid");
  const checkboxId = createId();

  const isSelected = createMemo(() => {
    const s = state();
    const p = props();
    return s.isSelected(p.key);
  });

  const isDisabled = createMemo(() => {
    const s = state();
    const p = props();
    return s.isDisabled(p.key);
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
    const gridListData = getGridListData(s);
    const rowId = `${gridListData?.gridListId ?? "gridlist"}-row-${String(p.key)}`;

    const baseProps: Record<string, unknown> = {
      id: checkboxId,
      type: "checkbox",
      checked: isSelected(),
      disabled: isDisabled(),
      onChange,
      "aria-label": stringFormatter().format("select"),
      // Mirrors useGridListSelectionCheckbox: "Select" plus the row so the
      // checkbox name is "Select {item}" rather than a bare "Select".
      "aria-labelledby": `${checkboxId} ${rowId}`,
    };

    return baseProps as JSX.InputHTMLAttributes<HTMLInputElement>;
  });

  return {
    get checkboxProps() {
      return checkboxProps();
    },
  };
}
