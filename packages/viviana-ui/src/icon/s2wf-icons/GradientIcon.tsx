/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Gradient.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Gradient.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function GradientIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <defs>
        <linearGradient
          id="fb870f__a"
          x1="0.667"
          x2="16.933"
          y1="10"
          y2="10"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            offset="0"
            stop-color="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
          />
          <stop
            offset="0.024"
            stop-color="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
            stop-opacity="0.968"
          />
          <stop
            offset="0.627"
            stop-color="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
            stop-opacity="0.261"
          />
          <stop
            offset="1"
            stop-color="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
            stop-opacity="0"
          />
        </linearGradient>
      </defs>
      <path fill="url(#fb870f__a)" d="M3 3h14v14H3z" />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M15.75 18H4.25C3.01 18 2 16.99 2 15.75V4.25C2 3.01 3.01 2 4.25 2h11.5C16.99 2 18 3.01 18 4.25v11.5c0 1.24-1.01 2.25-2.25 2.25M4.25 3.5c-.413 0-.75.337-.75.75v11.5c0 .413.337.75.75.75h11.5c.413 0 .75-.337.75-.75V4.25c0-.413-.337-.75-.75-.75z"
      />
    </svg>
  );
}

export type GradientIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const GradientIcon = createIcon(GradientIconSvg);
export default GradientIcon;
