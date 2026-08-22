/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/RotateOrientation.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/RotateOrientation.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function RotateOrientationIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10.75 18h-7.5C2.01 18 1 16.99 1 15.75v-7.5C1 7.01 2.01 6 3.25 6h7.5C11.99 6 13 7.01 13 8.25v7.5c0 1.24-1.01 2.25-2.25 2.25M3.25 7.5c-.414 0-.75.336-.75.75v7.5c0 .414.336.75.75.75h7.5c.414 0 .75-.336.75-.75v-7.5c0-.414-.336-.75-.75-.75zm15.28.091c-.293-.293-.767-.293-1.06 0l-.47.47V6.75C17 4.13 14.87 2 12.25 2h-2c-.414 0-.75.336-.75.75s.336.75.75.75h2c1.792 0 3.25 1.458 3.25 3.25v1.311l-.47-.47c-.293-.293-.767-.293-1.06 0s-.293.768 0 1.06l1.75 1.75c.146.147.338.22.53.22s.384-.073.53-.22l1.75-1.75c.293-.292.293-.767 0-1.06"
      />
    </svg>
  );
}

export type RotateOrientationIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const RotateOrientationIcon = createIcon(RotateOrientationIconSvg);
export default RotateOrientationIcon;
