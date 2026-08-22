/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/DevicePhone.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/DevicePhone.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function DevicePhoneIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        cx="10"
        cy="15"
        r="1"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M13.75 19h-7.5C5.01 19 4 17.99 4 16.75V3.25C4 2.01 5.01 1 6.25 1h7.5C14.99 1 16 2.01 16 3.25v13.5c0 1.24-1.01 2.25-2.25 2.25M6.25 2.5c-.413 0-.75.337-.75.75v13.5c0 .413.337.75.75.75h7.5c.413 0 .75-.337.75-.75V3.25c0-.413-.337-.75-.75-.75z"
      />
    </svg>
  );
}

export type DevicePhoneIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const DevicePhoneIcon = createIcon(DevicePhoneIconSvg);
export default DevicePhoneIcon;
