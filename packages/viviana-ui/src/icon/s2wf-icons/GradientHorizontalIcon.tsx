/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/GradientHorizontal.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/GradientHorizontal.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function GradientHorizontalIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
          id="04e823__a"
          x1="-239.333"
          x2="-223.067"
          y1="250"
          y2="250"
          gradientTransform="translate(240 -240)"
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
      <path fill="url(#04e823__a)" d="M3 3h14v14H3z" transform="rotate(-90 10 10)" />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M18 4.25v11.5c0 1.24-1.01 2.25-2.25 2.25H4.25C3.01 18 2 16.99 2 15.75V4.25C2 3.01 3.01 2 4.25 2h11.5C16.99 2 18 3.01 18 4.25M3.5 15.75c0 .413.337.75.75.75h11.5c.413 0 .75-.337.75-.75V4.25c0-.413-.337-.75-.75-.75H4.25c-.413 0-.75.337-.75.75z"
      />
    </svg>
  );
}

export type GradientHorizontalIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const GradientHorizontalIcon = createIcon(GradientHorizontalIconSvg);
export default GradientHorizontalIcon;
