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
