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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/gridlist/useGridListSection.ts

/**
 * createGridListSection - Provides accessibility for a grid list section.
 * Based on @react-aria/gridlist/useGridListSection.
 */

import { createMemo } from "solid-js";
import { createId, createSlotId } from "../ssr";
import { createLabels } from "../label/createLabels";
import type { AriaGridListSectionProps, GridListSectionAria } from "./types";

/**
 * Creates accessibility props for a grid list section.
 *
 * Mirrors upstream `useGridListSection`: a section is a `role="rowgroup"`
 * wrapper whose optional header renders as `role="row"` › `role="rowheader"`.
 * The `aria-labelledby` of the wrapper points at the header's id via a slot id
 * that resolves to `undefined` when no header is rendered.
 */
export function createGridListSection(props: AriaGridListSectionProps): GridListSectionAria {
  const headingId = createSlotId();
  // Stable id for the rowgroup so `createLabels` does not regenerate one each
  // time the slot id resolves (it short-circuits on a provided id).
  const rowGroupId = createId();

  const labelProps = createMemo(() =>
    createLabels({
      id: rowGroupId,
      "aria-label": props["aria-label"],
      "aria-labelledby": headingId(),
    }),
  );

  return {
    rowProps: { role: "row" },
    rowHeaderProps: {
      get id() {
        return headingId();
      },
      role: "rowheader",
    },
    rowGroupProps: {
      role: "rowgroup",
      get id() {
        return labelProps().id;
      },
      get "aria-label"() {
        return labelProps()["aria-label"];
      },
      get "aria-labelledby"() {
        return labelProps()["aria-labelledby"];
      },
    },
  };
}
