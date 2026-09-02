/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/GradientRadial.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/GradientRadial.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function GradientRadialIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        <radialGradient
          id="42ff97__a"
          cx="10"
          cy="10"
          r="8.241"
          fx="10"
          fy="10"
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
        </radialGradient>
      </defs>
      <circle cx="10" cy="10" r="7.25" fill="url(#42ff97__a)" />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M10 18.75c-4.825 0-8.75-3.925-8.75-8.75S5.175 1.25 10 1.25s8.75 3.925 8.75 8.75-3.925 8.75-8.75 8.75m0-16c-3.998 0-7.25 3.252-7.25 7.25s3.252 7.25 7.25 7.25 7.25-3.252 7.25-7.25S13.998 2.75 10 2.75"
      />
    </svg>
  );
}

export type GradientRadialIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const GradientRadialIcon = createIcon(GradientRadialIconSvg);
export default GradientRadialIcon;
