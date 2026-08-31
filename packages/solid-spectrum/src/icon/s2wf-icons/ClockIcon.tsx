/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Clock.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Clock.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ClockIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      {...rest}
      class={className}
    >
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M10 18.75c-4.825 0-8.75-3.925-8.75-8.75S5.175 1.25 10 1.25s8.75 3.925 8.75 8.75-3.925 8.75-8.75 8.75m0-16c-3.998 0-7.25 3.252-7.25 7.25s3.252 7.25 7.25 7.25 7.25-3.252 7.25-7.25S13.998 2.75 10 2.75"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M13.249 12.645c-.129 0-.26-.034-.379-.104l-3.22-1.895c-.23-.134-.37-.38-.37-.646V5c0-.414.335-.75.75-.75s.75.336.75.75v4.571l2.85 1.677c.357.21.476.67.266 1.026-.14.239-.39.37-.647.37"
      />
    </svg>
  );
}

export type ClockIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ClockIcon = createIcon(ClockIconSvg);
export default ClockIcon;
