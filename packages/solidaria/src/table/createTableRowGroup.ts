/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/table/useTableRowGroup.ts

/**
 * createTableRowGroup - Provides accessibility for a table row group.
 * Ported from packages/react-aria/src/table/useTableRowGroup.ts.
 */

import { createMemo, type Accessor } from "solid-js";
import type { JSX } from "solid-js";
import type { AriaTableRowGroupProps, TableRowGroupAria } from "./types";

/**
 * Creates accessibility props for a table row group (thead, tbody, tfoot).
 */
export function createTableRowGroup(props: Accessor<AriaTableRowGroupProps>): TableRowGroupAria {
  const rowGroupProps = createMemo(() => {
    // Access props for reactivity tracking, even though not currently used
    void props();

    const baseProps: Record<string, unknown> = {
      role: "rowgroup",
    };

    return baseProps as JSX.HTMLAttributes<HTMLTableSectionElement>;
  });

  return {
    get rowGroupProps() {
      return rowGroupProps();
    },
  };
}
