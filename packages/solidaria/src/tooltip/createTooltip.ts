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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/tooltip/useTooltip.ts

/**
 * createTooltip hook for Solidaria
 *
 * Provides the accessibility implementation for a Tooltip component.
 *
 * Port of @react-aria/tooltip useTooltip.
 */

import { type JSX } from "solid-js";
import { type TooltipTriggerState } from "@proyecto-viviana/solid-stately";
import { createHover } from "../interactions/createHover";
import { filterDOMProps, mergeProps } from "../utils";

export interface TooltipProps {
  /** Whether the tooltip is disabled. */
  isDisabled?: boolean;
  /** Custom aria-label for the tooltip. */
  "aria-label"?: string;
  /** ID of an element that labels the tooltip. */
  "aria-labelledby"?: string;
  /** ID of an element that describes the tooltip. */
  "aria-describedby"?: string;
}

export interface TooltipAria {
  /** Props to spread on the tooltip element. */
  tooltipProps: JSX.HTMLAttributes<HTMLElement>;
}

/**
 * Provides the accessibility implementation for a Tooltip component.
 *
 * When hovering over the tooltip itself, it stays open. When the mouse leaves
 * the tooltip, it closes.
 *
 * @example
 * ```tsx
 * import { createTooltip } from 'solidaria';
 * import { createTooltipTriggerState } from 'solid-stately';
 *
 * function Tooltip(props) {
 *   const state = props.state;
 *   const { tooltipProps } = createTooltip(props, state);
 *
 *   return (
 *     <div {...tooltipProps} role="tooltip">
 *       {props.children}
 *     </div>
 *   );
 * }
 * ```
 */
export function createTooltip(props: TooltipProps = {}, state?: TooltipTriggerState): TooltipAria {
  const domProps = filterDOMProps(props, { labelable: true });

  const { hoverProps } = createHover({
    onHoverStart: () => state?.open(true),
    onHoverEnd: () => state?.close(),
  });

  return {
    tooltipProps: mergeProps<JSX.HTMLAttributes<HTMLElement>>(domProps, hoverProps, {
      role: "tooltip",
    }),
  };
}
