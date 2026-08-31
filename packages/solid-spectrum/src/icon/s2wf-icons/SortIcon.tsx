/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Sort.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Sort.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function SortIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M9.25 15.5h-6.5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h6.5c.414 0 .75.336.75.75s-.336.75-.75.75M13.25 10.5H2.75c-.414 0-.75-.336-.75-.75S2.336 9 2.75 9h10.5c.414 0 .75.336.75.75s-.336.75-.75.75M17.25 5.5H2.75c-.414 0-.75-.336-.75-.75S2.336 4 2.75 4h14.5c.414 0 .75.336.75.75s-.336.75-.75.75"
      />
    </svg>
  );
}

export type SortIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const SortIcon = createIcon(SortIconSvg);
export default SortIcon;
