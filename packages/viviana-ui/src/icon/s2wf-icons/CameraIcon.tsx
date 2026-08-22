/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Camera.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Camera.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CameraIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.75 17H3.25C2.01 17 1 15.99 1 14.75v-7.5C1 6.01 2.01 5 3.25 5h1.823c.286 0 .543-.16.67-.414l.172-.342C6.298 3.477 7.069 3 7.927 3h4.146c.858 0 1.629.477 2.012 1.244l.171.342c.128.255.385.414.671.414h1.823C17.99 5 19 6.01 19 7.25v7.5c0 1.24-1.01 2.25-2.25 2.25M3.25 6.5c-.414 0-.75.337-.75.75v7.5c0 .413.336.75.75.75h13.5c.414 0 .75-.337.75-.75v-7.5c0-.413-.336-.75-.75-.75h-1.823c-.858 0-1.629-.477-2.012-1.244l-.171-.342c-.128-.255-.385-.414-.671-.414H7.927c-.286 0-.543.16-.67.414l-.172.342C6.702 6.023 5.931 6.5 5.073 6.5z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M10 14.5c-2.206 0-4-1.794-4-4s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4M10 8c-1.378 0-2.5 1.121-2.5 2.5S8.622 13 10 13s2.5-1.121 2.5-2.5S11.378 8 10 8"
      />
    </svg>
  );
}

export type CameraIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CameraIcon = createIcon(CameraIconSvg);
export default CameraIcon;
