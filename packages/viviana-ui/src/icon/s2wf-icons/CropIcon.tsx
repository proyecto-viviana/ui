/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Crop.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Crop.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CropIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M15.25 13.191c-.414 0-.75-.336-.75-.75V6.25c0-.413-.337-.75-.75-.75H7.513c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h6.237C14.99 4 16 5.01 16 6.25v6.191c0 .414-.336.75-.75.75"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M18.602 14.5H6.25c-.413 0-.75-.337-.75-.75V1.398c0-.414-.336-.75-.75-.75S4 .984 4 1.398V4H1.398c-.414 0-.75.336-.75.75s.336.75.75.75H4v8.25C4 14.99 5.01 16 6.25 16h8.25v2.623c0 .414.336.75.75.75s.75-.336.75-.75V16h2.602c.414 0 .75-.336.75-.75s-.336-.75-.75-.75"
      />
    </svg>
  );
}

export type CropIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CropIcon = createIcon(CropIconSvg);
export default CropIcon;
