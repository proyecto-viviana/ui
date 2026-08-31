/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/DeviceLaptop.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/DeviceLaptop.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function DeviceLaptopIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M19 17.5H1c-.414 0-.75-.336-.75-.75S.586 16 1 16h18c.414 0 .75.336.75.75s-.336.75-.75.75M15.75 15H4.25C3.01 15 2 13.99 2 12.75v-7.5C2 4.01 3.01 3 4.25 3h11.5C16.99 3 18 4.01 18 5.25v7.5c0 1.24-1.01 2.25-2.25 2.25M4.25 4.5c-.413 0-.75.337-.75.75v7.5c0 .413.337.75.75.75h11.5c.413 0 .75-.337.75-.75v-7.5c0-.413-.337-.75-.75-.75z"
      />
    </svg>
  );
}

export type DeviceLaptopIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const DeviceLaptopIcon = createIcon(DeviceLaptopIconSvg);
export default DeviceLaptopIcon;
