/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/DeviceMobile.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/DeviceMobile.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function DeviceMobileIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        cy="8"
        r="0.625"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M8 14H4.25C3.01 14 2 12.99 2 11.75v-7.5C2 3.01 3.01 2 4.25 2h11.5C16.99 2 18 3.01 18 4.25c0 .414-.336.75-.75.75s-.75-.336-.75-.75c0-.413-.337-.75-.75-.75H4.25c-.413 0-.75.337-.75.75v7.5c0 .413.337.75.75.75H8c.414 0 .75.336.75.75S8.414 14 8 14"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M16.25 18h-4.5c-.965 0-1.75-.785-1.75-1.75v-8.5c0-.965.785-1.75 1.75-1.75h4.5c.965 0 1.75.785 1.75 1.75v8.5c0 .965-.785 1.75-1.75 1.75m-4.5-10.5c-.138 0-.25.112-.25.25v8.5c0 .138.112.25.25.25h4.5c.138 0 .25-.112.25-.25v-8.5c0-.138-.112-.25-.25-.25z"
      />
      <circle
        cx="14"
        cy="15"
        r="0.625"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
    </svg>
  );
}

export type DeviceMobileIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const DeviceMobileIcon = createIcon(DeviceMobileIconSvg);
export default DeviceMobileIcon;
