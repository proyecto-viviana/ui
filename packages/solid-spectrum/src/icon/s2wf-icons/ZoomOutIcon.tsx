/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/ZoomOut.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/ZoomOut.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ZoomOutIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10.8 8.75H5.2c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h5.6c.414 0 .75.336.75.75s-.336.75-.75.75"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M8 15c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7M8 2.5C4.967 2.5 2.5 4.968 2.5 8s2.467 5.5 5.5 5.5 5.5-2.468 5.5-5.5S11.033 2.5 8 2.5"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M18.25 19c-.192 0-.384-.073-.53-.22l-5.333-5.333c-.293-.293-.293-.767 0-1.06s.767-.293 1.06 0l5.333 5.333c.293.293.293.767 0 1.06-.146.147-.338.22-.53.22"
      />
    </svg>
  );
}

export type ZoomOutIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ZoomOutIcon = createIcon(ZoomOutIconSvg);
export default ZoomOutIcon;
