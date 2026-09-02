/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/RectangleHoriz.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/RectangleHoriz.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function RectangleHorizIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.75 17H3.25C2.01 17 1 15.99 1 14.75v-9.5C1 4.01 2.01 3 3.25 3h13.5C17.99 3 19 4.01 19 5.25v9.5c0 1.24-1.01 2.25-2.25 2.25M3.25 4.5c-.414 0-.75.336-.75.75v9.5c0 .414.336.75.75.75h13.5c.414 0 .75-.336.75-.75v-9.5c0-.414-.336-.75-.75-.75z"
      />
    </svg>
  );
}

export type RectangleHorizIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const RectangleHorizIcon = createIcon(RectangleHorizIconSvg);
export default RectangleHorizIcon;
