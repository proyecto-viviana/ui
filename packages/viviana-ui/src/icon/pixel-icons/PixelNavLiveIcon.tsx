/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelNavLiveIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M10 10h4v4h-4zM5 5h2v2H5zM17 5h2v2h-2zM3 7h2v10H3zM19 7h2v10h-2zM5 17h2v2H5zM17 17h2v2h-2z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelNavLiveIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelNavLiveIcon = createIcon(PixelNavLiveIconSvg);
export default PixelNavLiveIcon;
