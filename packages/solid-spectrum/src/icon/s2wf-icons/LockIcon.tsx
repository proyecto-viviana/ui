/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Lock.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Lock.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function LockIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M11.25 11.5c0-.69-.56-1.25-1.25-1.25s-1.25.56-1.25 1.25c0 .403.204.745.5.974v.776c0 .414.336.75.75.75s.75-.336.75-.75v-.776c.296-.23.5-.571.5-.974"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M15 7.025V6.5c0-2.757-2.243-5-5-5s-5 2.243-5 5v.525c-1.122.127-2 1.07-2 2.225v6.5C3 16.99 4.01 18 5.25 18h9.5c1.24 0 2.25-1.01 2.25-2.25v-6.5c0-1.155-.878-2.098-2-2.225M10 3c1.93 0 3.5 1.57 3.5 3.5V7h-7v-.5C6.5 4.57 8.07 3 10 3m5.5 12.75c0 .413-.337.75-.75.75h-9.5c-.413 0-.75-.337-.75-.75v-6.5c0-.413.337-.75.75-.75h9.5c.413 0 .75.337.75.75z"
      />
    </svg>
  );
}

export type LockIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const LockIcon = createIcon(LockIconSvg);
export default LockIcon;
