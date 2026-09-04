/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/CheckmarkCircle.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/CheckmarkCircle.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CheckmarkCircleIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 18.75c-4.825 0-8.75-3.925-8.75-8.75S5.175 1.25 10 1.25s8.75 3.925 8.75 8.75-3.925 8.75-8.75 8.75m0-16c-3.998 0-7.25 3.252-7.25 7.25s3.252 7.25 7.25 7.25 7.25-3.252 7.25-7.25S13.998 2.75 10 2.75"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M9.223 13.5c-.212 0-.415-.09-.558-.248l-2.51-2.792c-.278-.309-.253-.782.055-1.06s.781-.252 1.06.056l1.893 2.107 3.487-4.756c.244-.334.711-.41 1.048-.161.334.244.406.713.161 1.047l-4.032 5.5c-.133.183-.342.295-.567.306z"
      />
    </svg>
  );
}

export type CheckmarkCircleIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CheckmarkCircleIcon = createIcon(CheckmarkCircleIconSvg);
export default CheckmarkCircleIcon;
