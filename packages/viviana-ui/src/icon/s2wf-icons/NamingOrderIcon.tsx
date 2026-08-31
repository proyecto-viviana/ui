/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/NamingOrder.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/NamingOrder.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function NamingOrderIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m10.546 11.004-3.857-9c-.236-.55-1.142-.55-1.378 0l-3.857 9c-.163.38.013.822.394.985.379.161.82-.012.985-.393L3.945 9h4.11l1.112 2.596c.123.284.4.454.69.454q.15 0 .295-.06c.381-.164.557-.605.394-.986M4.588 7.5 6 4.204 7.412 7.5zM17.25 18h-5.5c-.275 0-.527-.15-.659-.392s-.12-.535.03-.765L15.87 9.5H11.75c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h5.5c.275 0 .527.15.659.392s.12.535-.03.765L13.13 16.5h4.121c.414 0 .75.336.75.75s-.336.75-.75.75"
      />
    </svg>
  );
}

export type NamingOrderIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const NamingOrderIcon = createIcon(NamingOrderIconSvg);
export default NamingOrderIcon;
