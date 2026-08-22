/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/MenuHamburger.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/MenuHamburger.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function MenuHamburgerIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.25 14H3.75c-.414 0-.75.336-.75.75s.336.75.75.75h12.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75M3.75 5.5h12.5c.414 0 .75-.336.75-.75S16.664 4 16.25 4H3.75c-.414 0-.75.336-.75.75s.336.75.75.75M16.25 9H3.75c-.414 0-.75.336-.75.75s.336.75.75.75h12.5c.414 0 .75-.336.75-.75S16.664 9 16.25 9"
      />
    </svg>
  );
}

export type MenuHamburgerIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const MenuHamburgerIcon = createIcon(MenuHamburgerIconSvg);
export default MenuHamburgerIcon;
