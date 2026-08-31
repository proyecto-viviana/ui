/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/CloseCircle.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/CloseCircle.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CloseCircleIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m11.06 10 2.22-2.22c.293-.293.293-.767 0-1.06s-.767-.293-1.06 0L10 8.94 7.78 6.72c-.293-.293-.767-.293-1.06 0s-.293.767 0 1.06L8.94 10l-2.22 2.22c-.293.293-.293.767 0 1.06.146.147.338.22.53.22s.384-.073.53-.22L10 11.06l2.22 2.22c.146.147.338.22.53.22s.384-.073.53-.22c.293-.293.293-.767 0-1.06z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M10 18.75c-4.825 0-8.75-3.925-8.75-8.75S5.175 1.25 10 1.25s8.75 3.925 8.75 8.75-3.925 8.75-8.75 8.75m0-16c-3.998 0-7.25 3.252-7.25 7.25s3.252 7.25 7.25 7.25 7.25-3.252 7.25-7.25S13.998 2.75 10 2.75"
      />
    </svg>
  );
}

export type CloseCircleIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CloseCircleIcon = createIcon(CloseCircleIconSvg);
export default CloseCircleIcon;
