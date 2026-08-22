/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/RadioButton.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/RadioButton.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function RadioButtonIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <circle
        cx="10"
        cy="10"
        r="4"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
    </svg>
  );
}

export type RadioButtonIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const RadioButtonIcon = createIcon(RadioButtonIconSvg);
export default RadioButtonIcon;
