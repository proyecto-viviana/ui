/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/ZoomFitToHeight.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/ZoomFitToHeight.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ZoomFitToHeightIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <rect
        width="8.5"
        height="10.5"
        x="5.75"
        y="4.75"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        opacity="0.35"
        rx="1.5"
        ry="1.5"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M16.75 4H3.25C2.01 4 1 5.01 1 6.25v7.5C1 14.99 2.01 16 3.25 16h13.5c1.24 0 2.25-1.01 2.25-2.25v-7.5C19 5.01 17.99 4 16.75 4M2.5 13.75v-7.5c0-.413.337-.75.75-.75h1.888c-.084.236-.138.486-.138.75v7.5c0 .264.054.514.138.75H3.25c-.413 0-.75-.337-.75-.75m4.75.75c-.413 0-.75-.337-.75-.75v-7.5c0-.413.337-.75.75-.75h5.5c.413 0 .75.337.75.75v7.5c0 .413-.337.75-.75.75zm10.25-.75c0 .413-.337.75-.75.75h-1.888c.084-.236.138-.486.138-.75v-7.5c0-.264-.054-.514-.138-.75h1.888c.413 0 .75.337.75.75z"
      />
    </svg>
  );
}

export type ZoomFitToHeightIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ZoomFitToHeightIcon = createIcon(ZoomFitToHeightIconSvg);
export default ZoomFitToHeightIcon;
