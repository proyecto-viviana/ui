/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Location.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Location.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function LocationIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 9.99c-1.379 0-2.5-1.12-2.5-2.5s1.121-2.5 2.5-2.5 2.5 1.121 2.5 2.5-1.121 2.5-2.5 2.5m0-3.5c-.552 0-1 .448-1 1s.448 1 1 1 1-.448 1-1-.448-1-1-1"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M10.005 18.583H10c-.557-.001-1.071-.248-1.413-.679C6.688 15.514 3.5 10.98 3.5 7.49c0-3.446 2.916-6.25 6.5-6.25s6.5 2.804 6.5 6.25c0 3.55-3.186 8.052-5.084 10.421-.342.427-.856.672-1.411.672M10 2.74c-2.757 0-5 2.131-5 4.75 0 3.148 3.331 7.68 4.763 9.482.08.1.195.111.24.111h.002c.046 0 .161-.01.24-.11C11.675 15.19 15 10.698 15 7.49c0-2.619-2.243-4.75-5-4.75"
      />
    </svg>
  );
}

export type LocationIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const LocationIcon = createIcon(LocationIconSvg);
export default LocationIcon;
