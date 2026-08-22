/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/ArrowCurved.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/ArrowCurved.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ArrowCurvedIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m18.031 10.701-3.497-3.503c-.293-.293-.768-.292-1.061 0s-.293.767-.001 1.06l2.216 2.22H8.493c-1.203 0-2.333-.467-3.182-1.317-.851-.85-1.319-1.98-1.319-3.182 0-.415-.336-.75-.75-.75s-.75.335-.75.75c0 1.602.624 3.109 1.758 4.243 1.133 1.132 2.64 1.757 4.243 1.757h7.2l-2.22 2.22c-.293.292-.293.767 0 1.06.146.146.338.22.53.22s.384-.074.53-.22l3.497-3.497c.293-.293.293-.768.001-1.06"
      />
    </svg>
  );
}

export type ArrowCurvedIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ArrowCurvedIcon = createIcon(ArrowCurvedIconSvg);
export default ArrowCurvedIcon;
