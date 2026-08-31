/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Temperature.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Temperature.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function TemperatureIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M13.5 9.261V4.196C13.5 2.158 11.93.5 10 .5S6.5 2.158 6.5 4.196v5.065c-1.22 1.01-2 2.535-2 4.239 0 3.032 2.468 5.5 5.5 5.5s5.5-2.468 5.5-5.5c0-1.704-.78-3.23-2-4.239M10 17.5c-2.206 0-4-1.794-4-4 0-1.031.403-1.963 1.045-2.673q.417-.458.955-.77v-5.86C8 2.984 8.897 2 10 2s2 .985 2 2.196v5.86q.538.313.955.771C13.597 11.537 14 12.47 14 13.5c0 2.206-1.794 4-4 4"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M10.75 11.388V6.75c0-.414-.336-.75-.75-.75s-.75.336-.75.75v4.638c-.872.31-1.5 1.134-1.5 2.112 0 1.243 1.007 2.25 2.25 2.25s2.25-1.007 2.25-2.25c0-.978-.628-1.802-1.5-2.112"
      />
    </svg>
  );
}

export type TemperatureIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const TemperatureIcon = createIcon(TemperatureIconSvg);
export default TemperatureIcon;
