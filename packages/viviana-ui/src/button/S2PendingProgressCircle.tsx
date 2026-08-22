/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/ProgressCircle.tsx

// Port of packages/@react-spectrum/s2/src/ProgressCircle.tsx.

import { type JSX } from "solid-js";
import { ProgressBar } from "@proyecto-viviana/solidaria-components";
import type { StaticColor } from "./types";
import type { ActionButtonSize } from "./group-context";
import { s2ProgressCircleIndeterminateAnimation } from "../progress/progress-circle-animation";
import {
  s2PendingProgressCircle,
  s2PendingProgressCircleFill,
  s2PendingProgressCircleHcmStroke,
  s2PendingProgressCircleTrack,
} from "./s2-progress-circle-styles";

export interface S2PendingProgressCircleProps {
  size: ActionButtonSize;
  staticColor?: StaticColor;
  "aria-label": string;
}

/**
 * Button pending indicators are upstream S2 ProgressCircles with size="S" stroke
 * metrics and button-size-specific wrapper dimensions.
 */
export function S2PendingProgressCircle(props: S2PendingProgressCircleProps): JSX.Element {
  const isStaticColor = () => !!props.staticColor;

  return (
    <ProgressBar
      isIndeterminate
      aria-label={props["aria-label"]}
      data-rac=""
      class={s2PendingProgressCircle({
        size: props.size,
        staticColor: props.staticColor,
      })}
    >
      {({ percentage, isIndeterminate }) => (
        <svg fill="none" width="100%" height="100%">
          <circle
            cx="50%"
            cy="50%"
            r="calc(50% - 0.0625rem)"
            class={s2PendingProgressCircleHcmStroke({ size: "S" })}
          />
          <circle
            cx="50%"
            cy="50%"
            r="calc(50% - 0.0625rem)"
            class={s2PendingProgressCircleTrack({ isStaticColor: isStaticColor(), size: "S" })}
          />
          <circle
            cx="50%"
            cy="50%"
            r="calc(50% - 0.0625rem)"
            class={s2PendingProgressCircleFill({ isStaticColor: isStaticColor(), size: "S" })}
            style={{
              animation: isIndeterminate ? s2ProgressCircleIndeterminateAnimation : undefined,
            }}
            pathLength="100"
            stroke-dasharray="100 200"
            stroke-dashoffset={
              isIndeterminate || percentage == null ? undefined : String(100 - percentage)
            }
            stroke-linecap="round"
          />
        </svg>
      )}
    </ProgressBar>
  );
}
