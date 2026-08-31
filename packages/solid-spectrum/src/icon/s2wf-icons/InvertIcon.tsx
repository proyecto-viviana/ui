/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Invert.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Invert.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function InvertIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 9.25H6.725l.922-.988c.284-.303.267-.778-.036-1.06-.301-.282-.777-.266-1.06.036l-2.099 2.25c-.27.288-.27.736 0 1.024l2.1 2.25c.147.158.347.238.548.238.183 0 .367-.066.511-.201.303-.283.32-.758.036-1.06l-.922-.989H10z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M15.75 2H4.25C3.01 2 2 3.01 2 4.25v11.5C2 16.99 3.01 18 4.25 18h11.5c1.24 0 2.25-1.01 2.25-2.25V4.25C18 3.01 16.99 2 15.75 2M3.5 15.75V4.25c0-.413.337-.75.75-.75H10v5.75h3.275l-.922-.988c-.284-.303-.267-.778.036-1.06.301-.282.776-.266 1.06.036l2.099 2.25c.27.288.27.736 0 1.024l-2.1 2.25c-.147.158-.347.238-.548.238-.183 0-.367-.066-.511-.201-.303-.283-.32-.758-.036-1.06l.922-.989H10v5.75H4.25c-.413 0-.75-.337-.75-.75"
      />
    </svg>
  );
}

export type InvertIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const InvertIcon = createIcon(InvertIconSvg);
export default InvertIcon;
