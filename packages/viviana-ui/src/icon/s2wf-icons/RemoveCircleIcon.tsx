/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/RemoveCircle.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/RemoveCircle.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function RemoveCircleIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 18.78c-4.825 0-8.75-3.926-8.75-8.75S5.175 1.28 10 1.28s8.75 3.924 8.75 8.75-3.925 8.75-8.75 8.75m0-16c-3.998 0-7.25 3.251-7.25 7.25s3.252 7.25 7.25 7.25 7.25-3.253 7.25-7.25S13.998 2.78 10 2.78"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M13.25 10.75h-6.5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h6.5c.414 0 .75.336.75.75s-.336.75-.75.75"
      />
    </svg>
  );
}

export type RemoveCircleIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const RemoveCircleIcon = createIcon(RemoveCircleIconSvg);
export default RemoveCircleIcon;
