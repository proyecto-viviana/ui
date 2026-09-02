/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/ShoppingCart.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/ShoppingCart.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ShoppingCartIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M17.18 4.809C16.752 4.295 16.122 4 15.453 4H5.087l-.141-.861C4.768 2.044 3.834 1.25 2.726 1.25H1c-.414 0-.75.336-.75.75s.336.75.75.75h1.724c.37 0 .68.265.74.63l1.59 9.731C5.233 14.206 6.167 15 7.275 15H16c.414 0 .75-.336.75-.75s-.336-.75-.75-.75H7.275c-.37 0-.68-.265-.74-.63L6.23 11h8.768c1.088 0 2.02-.776 2.214-1.848l.455-2.5c.12-.658-.058-1.33-.487-1.843m-.989 1.576-.455 2.499c-.065.357-.375.616-.738.616H5.985l-.653-4h10.12c.306 0 .493.169.577.27s.217.314.162.615m-1.19 12.865c-.691 0-1.25-.56-1.25-1.25s.559-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25m-8 0c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25"
      />
    </svg>
  );
}

export type ShoppingCartIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ShoppingCartIcon = createIcon(ShoppingCartIconSvg);
export default ShoppingCartIcon;
