/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/ListBulleted.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/ListBulleted.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ListBulletedIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M17.25 16.521h-10c-.414 0-.75-.335-.75-.75s.336-.75.75-.75h10c.414 0 .75.336.75.75s-.336.75-.75.75M17.25 10.521h-10c-.414 0-.75-.335-.75-.75s.336-.75.75-.75h10c.414 0 .75.336.75.75s-.336.75-.75.75M17.25 4.521h-10c-.414 0-.75-.335-.75-.75s.336-.75.75-.75h10c.414 0 .75.336.75.75s-.336.75-.75.75"
      />
      <circle
        cx="3.5"
        cy="3.771"
        r="1.5"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <circle
        cx="3.5"
        cy="9.771"
        r="1.5"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <circle
        cx="3.5"
        cy="15.771"
        r="1.5"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
    </svg>
  );
}

export type ListBulletedIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ListBulletedIcon = createIcon(ListBulletedIconSvg);
export default ListBulletedIcon;
