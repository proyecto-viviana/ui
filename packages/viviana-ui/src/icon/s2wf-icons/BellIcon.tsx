/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Bell.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Bell.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function BellIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M17.786 12.676q-.253-.462-.511-.903c-.827-1.434-1.541-2.672-1.541-4.62 0-3.119-2.538-5.657-5.657-5.657S4.419 4.034 4.419 7.153c0 1.767-.758 3.05-1.562 4.406-.22.372-.441.746-.649 1.13-.376.697-.357 1.521.05 2.205.413.69 1.137 1.102 1.94 1.102H7.25c0 1.517 1.233 2.75 2.75 2.75s2.75-1.233 2.75-2.75h3.055c.803 0 1.528-.413 1.939-1.105.407-.688.423-1.516.042-2.215M10 17.246c-.69 0-1.25-.56-1.25-1.25h2.5c0 .69-.561 1.25-1.25 1.25m6.454-3.121c-.067.111-.263.371-.65.371H4.198c-.268 0-.511-.139-.65-.371-.065-.108-.195-.396-.019-.723.199-.368.41-.724.62-1.079.871-1.47 1.771-2.992 1.771-5.17 0-2.254 1.904-4.157 4.158-4.157s4.157 1.903 4.157 4.157c0 2.349.885 3.884 1.742 5.37.164.285.33.573.493.872.18.33.05.62-.015.73"
      />
    </svg>
  );
}

export type BellIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const BellIcon = createIcon(BellIconSvg);
export default BellIcon;
