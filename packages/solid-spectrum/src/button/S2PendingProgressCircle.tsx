import { type JSX } from "solid-js";
import { ProgressBar } from "@proyecto-viviana/solidaria-components";
import type { StaticColor } from "./types";
import type { ActionButtonSize } from "./group-context";
import { s2ProgressCircleIndeterminateAnimation } from "./s2-progress-circle-animation";
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
