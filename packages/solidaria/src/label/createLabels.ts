/**
 * Labels utility for Solidaria
 *
 * Merges aria-label and aria-labelledby into aria-labelledby when both exist.
 *
 * This is a 1:1 port of @react-aria/utils's useLabels hook.
 */

import { createId } from "../ssr";
import type { AriaLabelingProps, DOMProps } from "./createLabel";

/**
 * Merges aria-label and aria-labelledby into aria-labelledby when both exist.
 *
 * @param props - Aria label props.
 * @param defaultLabel - Default value for aria-label when not present.
 */
export function createLabels(
  props: DOMProps & AriaLabelingProps,
  defaultLabel?: string,
): DOMProps & AriaLabelingProps {
  // Read props directly rather than destructuring: in Solid a destructure
  // freezes the value at call time. This is a pure snapshot transform, so it is
  // behaviourally identical, but keeping the reactive read explicit matches the
  // rest of the port and satisfies guard:idiomatic-solid.
  let id = createId(props.id);
  let label = props["aria-label"];
  let labelledBy = props["aria-labelledby"];

  // If there is both an aria-label and aria-labelledby,
  // combine them by pointing to the element itself.
  if (labelledBy && label) {
    const ids = new Set([id, ...labelledBy.trim().split(/\s+/)]);
    labelledBy = [...ids].join(" ");
  } else if (labelledBy) {
    labelledBy = labelledBy.trim().split(/\s+/).join(" ");
  }

  // If no labels are provided, use the default
  if (!label && !labelledBy && defaultLabel) {
    label = defaultLabel;
  }

  return {
    id,
    "aria-label": label,
    "aria-labelledby": labelledBy,
  };
}
