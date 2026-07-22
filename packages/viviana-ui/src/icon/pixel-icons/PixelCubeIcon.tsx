/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelCubeIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      {...rest}
      class={className}
    >
      <path d="M5 5h14v2H5zM5 17h14v2H5zM5 7h2v10H5zM17 7h2v10h-2zM9 9h6v6H9z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelCubeIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelCubeIcon = createIcon(PixelCubeIconSvg);
export default PixelCubeIcon;
