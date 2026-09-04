/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/DeviceDesktop.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/DeviceDesktop.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function DeviceDesktopIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M14 18.5H6c-.414 0-.75-.336-.75-.75S5.586 17 6 17h8c.414 0 .75.336.75.75s-.336.75-.75.75M16.75 16H3.25C2.01 16 1 14.99 1 13.75v-8.5C1 4.01 2.01 3 3.25 3h13.5C17.99 3 19 4.01 19 5.25v8.5c0 1.24-1.01 2.25-2.25 2.25M3.25 4.5c-.413 0-.75.337-.75.75v8.5c0 .413.337.75.75.75h13.5c.413 0 .75-.337.75-.75v-8.5c0-.413-.337-.75-.75-.75z"
      />
    </svg>
  );
}

export type DeviceDesktopIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const DeviceDesktopIcon = createIcon(DeviceDesktopIconSvg);
export default DeviceDesktopIcon;
