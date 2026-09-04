/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/FolderOpen.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/FolderOpen.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function FolderOpenIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M19.211 8.896C18.782 8.327 18.127 8 17.414 8H6.66c-.997 0-1.887.67-2.162 1.629l-1.65 5.737c-.204-.135-.347-.354-.347-.616V4.25c0-.413.336-.75.75-.75h3.565c.218 0 .425.095.567.257l1.701 1.969c.428.492 1.047.774 1.7.774h6.189c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-6.19c-.218 0-.424-.095-.566-.257l-1.7-1.969C8.086 2.282 7.467 2 6.814 2H3.25C2.01 2 1 3.01 1 4.25v10.5C1 15.99 2.01 17 3.25 17c.023 0 .043-.011.066-.013.02.001.037.013.057.013h12.748c.998 0 1.887-.67 2.162-1.629l1.294-4.5c.197-.684.064-1.404-.366-1.975m-1.076 1.561-1.294 4.5c-.092.32-.388.543-.72.543H4.369l1.569-5.457c.092-.32.389-.543.721-.543h10.755c.238 0 .456.11.6.299.142.19.187.43.121.658"
      />
    </svg>
  );
}

export type FolderOpenIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const FolderOpenIcon = createIcon(FolderOpenIconSvg);
export default FolderOpenIcon;
