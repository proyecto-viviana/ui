/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/StopProcessing.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/StopProcessing.cjs

import type { JSX } from "@solidjs/web";
import { createIcon } from "../spectrum-icon";
import { splitProps } from "@proyecto-viviana/solidaria/utils";

function StopProcessingIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      {...rest}
      class={local.class}
    >
      <rect
        width="12"
        height="12"
        x="4"
        y="4"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        rx="2.25"
        ry="2.25"
      />
    </svg>
  );
}

export type StopProcessingIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const StopProcessingIcon = createIcon(StopProcessingIconSvg);
export default StopProcessingIcon;
