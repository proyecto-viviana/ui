/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Discover.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Discover.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function DiscoverIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m14.292 13.501-2.121-5.304-.004-.006c-.024-.058-.063-.109-.104-.157-.011-.014-.018-.033-.03-.045-.02-.02-.048-.031-.07-.048-.044-.033-.085-.067-.134-.087l-.006-.004-5.302-2.121c-.233-.094-.498-.04-.675.137s-.23.443-.138.675l2.121 5.304q.001.002.004.004c.041.101.115.184.204.252.023.017.043.03.068.044.025.015.044.036.072.047l5.302 2.121q.115.045.233.045c.162 0 .322-.063.442-.182.177-.177.23-.443.138-.675m-5.402-2.37 2.22-2.22 1.48 3.7z"
      />
    </svg>
  );
}

export type DiscoverIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const DiscoverIcon = createIcon(DiscoverIconSvg);
export default DiscoverIcon;
