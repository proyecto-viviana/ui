/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/ZoomFitToScreen.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/ZoomFitToScreen.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ZoomFitToScreenIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        width="16.5"
        height="10.5"
        x="1.75"
        y="4.75"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        opacity="0.35"
        rx="1.5"
        ry="1.5"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M16.75 16H3.25C2.01 16 1 14.99 1 13.75v-7.5C1 5.01 2.01 4 3.25 4h13.5C17.99 4 19 5.01 19 6.25v7.5c0 1.24-1.01 2.25-2.25 2.25M3.25 5.5c-.413 0-.75.337-.75.75v7.5c0 .413.337.75.75.75h13.5c.413 0 .75-.337.75-.75v-7.5c0-.413-.337-.75-.75-.75z"
      />
    </svg>
  );
}

export type ZoomFitToScreenIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ZoomFitToScreenIcon = createIcon(ZoomFitToScreenIconSvg);
export default ZoomFitToScreenIcon;
