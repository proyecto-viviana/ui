/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/WebNavBar.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/WebNavBar.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function WebNavBarIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <circle
        cx="4.125"
        cy="6"
        r="0.75"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M16.75 3H3.25C2.01 3 1 4.01 1 5.25v9.5C1 15.99 2.01 17 3.25 17h13.5c1.24 0 2.25-1.01 2.25-2.25v-9.5C19 4.01 17.99 3 16.75 3M2.5 5.25c0-.414.337-.75.75-.75h13.5c.413 0 .75.336.75.75V7.5h-15zm0 9.5V9H6v6.5H3.25c-.413 0-.75-.336-.75-.75m14.25.75H7.5V9h10v5.75c0 .414-.337.75-.75.75"
      />
    </svg>
  );
}

export type WebNavBarIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const WebNavBarIcon = createIcon(WebNavBarIconSvg);
export default WebNavBarIcon;
