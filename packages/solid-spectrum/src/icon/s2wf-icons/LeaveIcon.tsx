/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Leave.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Leave.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function LeaveIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m19.077 9.533-2.25-2.25c-.293-.293-.767-.293-1.06 0s-.293.768 0 1.061l.97.97H10.75c-.414 0-.75.336-.75.75s.336.75.75.75h5.986l-.97.97c-.292.292-.292.767 0 1.06.147.146.338.22.53.22s.385-.074.531-.22l2.25-2.25c.293-.293.293-.768 0-1.06"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M11.75 17h-7.5C3.01 17 2 15.99 2 14.75v-9.5C2 4.01 3.01 3 4.25 3h7.5C12.99 3 14 4.01 14 5.25V7c0 .414-.336.75-.75.75s-.75-.336-.75-.75V5.25c0-.413-.337-.75-.75-.75h-7.5c-.413 0-.75.337-.75.75v9.5c0 .413.337.75.75.75h7.5c.413 0 .75-.337.75-.75V13c0-.414.336-.75.75-.75s.75.336.75.75v1.75c0 1.24-1.01 2.25-2.25 2.25"
      />
    </svg>
  );
}

export type LeaveIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const LeaveIcon = createIcon(LeaveIconSvg);
export default LeaveIcon;
