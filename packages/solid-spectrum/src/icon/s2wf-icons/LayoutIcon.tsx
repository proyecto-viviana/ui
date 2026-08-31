/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Layout.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Layout.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function LayoutIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M15.75 2H4.25C3.01 2 2 3.01 2 4.25v11.5C2 16.99 3.01 18 4.25 18h11.5c1.24 0 2.25-1.01 2.25-2.25V4.25C18 3.01 16.99 2 15.75 2M3.5 4.25c0-.413.337-.75.75-.75h11.5c.413 0 .75.337.75.75V8h-13zm0 11.5V9.5H8v7H4.25c-.413 0-.75-.337-.75-.75m12.25.75H9.5v-7h7v6.25c0 .413-.337.75-.75.75"
      />
    </svg>
  );
}

export type LayoutIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const LayoutIcon = createIcon(LayoutIconSvg);
export default LayoutIcon;
