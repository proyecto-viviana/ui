/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/SortUp.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/SortUp.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function SortUpIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m18.28 5.72-2.5-2.5q-.105-.105-.243-.162c-.184-.076-.39-.076-.574 0q-.138.058-.243.162l-2.5 2.5c-.293.293-.293.767 0 1.06s.767.293 1.06 0l1.22-1.22v10.69c0 .414.336.75.75.75s.75-.336.75-.75V5.56l1.22 1.22c.146.147.338.22.53.22s.384-.073.53-.22c.293-.293.293-.767 0-1.06M7.25 6.5h-4.5c-.414 0-.75-.336-.75-.75S2.336 5 2.75 5h4.5c.414 0 .75.336.75.75s-.336.75-.75.75M9.25 10.5h-6.5c-.414 0-.75-.336-.75-.75S2.336 9 2.75 9h6.5c.414 0 .75.336.75.75s-.336.75-.75.75M11.25 14.5h-8.5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h8.5c.414 0 .75.336.75.75s-.336.75-.75.75"
      />
    </svg>
  );
}

export type SortUpIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const SortUpIcon = createIcon(SortUpIconSvg);
export default SortUpIcon;
