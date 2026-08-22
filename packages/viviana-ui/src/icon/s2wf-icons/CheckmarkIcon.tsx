/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Checkmark.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Checkmark.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CheckmarkIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M7.864 15.734c-.222 0-.433-.098-.576-.27l-3.747-4.497c-.266-.319-.222-.792.096-1.057.317-.265.79-.223 1.056.096l3.154 3.786 7.44-9.469c.255-.326.728-.382 1.052-.127.326.256.383.728.127 1.053L8.454 15.447c-.14.179-.352.284-.579.287z"
      />
    </svg>
  );
}

export type CheckmarkIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CheckmarkIcon = createIcon(CheckmarkIconSvg);
export default CheckmarkIcon;
