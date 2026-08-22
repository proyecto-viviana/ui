/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/DeviceTablet.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/DeviceTablet.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function DeviceTabletIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <circle
        cx="5"
        cy="9.998"
        r="1"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M3.25 2.998h13.5c1.24 0 2.25 1.01 2.25 2.25v9.5c0 1.24-1.01 2.25-2.25 2.25H3.25c-1.24 0-2.25-1.01-2.25-2.25v-9.5c0-1.24 1.01-2.25 2.25-2.25m13.5 12.5c.413 0 .75-.337.75-.75v-9.5c0-.413-.337-.75-.75-.75H3.25c-.413 0-.75.337-.75.75v9.5c0 .413.337.75.75.75z"
      />
    </svg>
  );
}

export type DeviceTabletIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const DeviceTabletIcon = createIcon(DeviceTabletIconSvg);
export default DeviceTabletIcon;
