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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/table/useTableHeaderRow.ts

/**
 * createTableHeaderRow - Provides accessibility for a table header row.
 * Based on @react-aria/table/useTableHeaderRow.
 */

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type { TableState, TableCollection } from "@proyecto-viviana/solid-stately";
import type { AriaTableHeaderRowProps, TableHeaderRowAria } from "./types";

/**
 * Creates accessibility props for a table header row.
 */
export function createTableHeaderRow<T extends object>(
  props: Accessor<AriaTableHeaderRowProps>,
  _state: Accessor<TableState<T, TableCollection<T>>>,
  _ref: Accessor<HTMLTableRowElement | null>,
): TableHeaderRowAria {
  const rowProps = createMemo(() => {
    const p = props();
    const node = p.node;

    const baseProps: Record<string, unknown> = {
      role: "row",
    };

    // Add aria-rowindex for virtualized tables
    if (p.isVirtualized && node.rowIndex != null) {
      baseProps["aria-rowindex"] = node.rowIndex + 1; // 1-based
    }

    return baseProps as JSX.HTMLAttributes<HTMLTableRowElement>;
  });

  return {
    get rowProps() {
      return rowProps();
    },
  };
}
