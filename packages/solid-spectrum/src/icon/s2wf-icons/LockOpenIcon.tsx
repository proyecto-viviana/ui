/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/LockOpen.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/LockOpen.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function LockOpenIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M11.25 12.5c0-.69-.56-1.25-1.25-1.25s-1.25.56-1.25 1.25c0 .403.204.745.5.974v.776c0 .414.336.75.75.75s.75-.336.75-.75v-.776c.296-.23.5-.571.5-.974"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M14.75 8H6.5V5.25c0-1.93 1.57-3.5 3.5-3.5.865 0 1.696.318 2.339.896.307.277.783.252 1.058-.057.278-.308.252-.782-.056-1.059C12.423.705 11.236.25 10 .25c-2.757 0-5 2.243-5 5v2.775c-1.122.127-2 1.07-2 2.225v6.5C3 17.99 4.01 19 5.25 19h9.5c1.24 0 2.25-1.01 2.25-2.25v-6.5C17 9.01 15.99 8 14.75 8m.75 8.75c0 .413-.337.75-.75.75h-9.5c-.413 0-.75-.337-.75-.75v-6.5c0-.413.337-.75.75-.75h9.5c.413 0 .75.337.75.75z"
      />
    </svg>
  );
}

export type LockOpenIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const LockOpenIcon = createIcon(LockOpenIconSvg);
export default LockOpenIcon;
