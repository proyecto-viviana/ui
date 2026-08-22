/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/CornerRadius.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/CornerRadius.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CornerRadiusIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M3.75 18c-.414 0-.75-.336-.75-.75v-5.5C3 6.925 6.925 3 11.75 3h5.5c.414 0 .75.336.75.75s-.336.75-.75.75h-5.5c-3.998 0-7.25 3.252-7.25 7.25v5.5c0 .414-.336.75-.75.75"
      />
    </svg>
  );
}

export type CornerRadiusIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CornerRadiusIcon = createIcon(CornerRadiusIconSvg);
export default CornerRadiusIcon;
