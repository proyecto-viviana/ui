/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/SortDown.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/SortDown.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function SortDownIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M18.28 13.22c-.293-.293-.767-.293-1.06 0L16 14.44V3.75c0-.414-.336-.75-.75-.75s-.75.336-.75.75v10.69l-1.22-1.22c-.293-.293-.767-.293-1.06 0s-.293.767 0 1.06l2.5 2.5q.105.105.243.162c.138.057.19.058.287.058s.195-.02.287-.058.174-.093.243-.162l2.5-2.5c.293-.293.293-.767 0-1.06M7.25 14.5h-4.5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h4.5c.414 0 .75.336.75.75s-.336.75-.75.75M9.25 10.5h-6.5c-.414 0-.75-.336-.75-.75S2.336 9 2.75 9h6.5c.414 0 .75.336.75.75s-.336.75-.75.75M11.25 6.5h-8.5c-.414 0-.75-.336-.75-.75S2.336 5 2.75 5h8.5c.414 0 .75.336.75.75s-.336.75-.75.75"
      />
    </svg>
  );
}

export type SortDownIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const SortDownIcon = createIcon(SortDownIconSvg);
export default SortDownIcon;
