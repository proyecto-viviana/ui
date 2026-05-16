/**
 * createDisclosureGroup hook for Solidaria
 *
 * Provides accessibility implementation for a group of disclosures (accordion).
 *
 * Port of @react-aria/disclosure.
 */

import { type JSX } from "solid-js";
import { type DisclosureGroupState } from "@proyecto-viviana/solid-stately";
import { type MaybeAccessor } from "../utils/reactivity";

export interface AriaDisclosureGroupProps {
  /** Whether the disclosure group is disabled. */
  isDisabled?: boolean;
}

export interface DisclosureGroupAria {
  /** Props for the disclosure group container. */
  groupProps: JSX.HTMLAttributes<HTMLElement>;
}

/**
 * Provides accessibility implementation for a group of disclosures (accordion).
 *
 * @example
 * ```tsx
 * import { createDisclosureGroup } from 'solidaria';
 * import { createDisclosureGroupState } from 'solid-stately';
 *
 * function Accordion(props) {
 *   const state = createDisclosureGroupState(props);
 *   const { groupProps } = createDisclosureGroup(props, state);
 *
 *   return (
 *     <div {...groupProps}>
 *       {props.children}
 *     </div>
 *   );
 * }
 * ```
 */
export function createDisclosureGroup(
  _props: MaybeAccessor<AriaDisclosureGroupProps>,
  _state: DisclosureGroupState,
): DisclosureGroupAria {
  return {
    get groupProps() {
      return {};
    },
  };
}
