/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelNavExploreIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M9 3h6v2H9zM7 5h2v2H7zM15 5h2v2h-2zM5 7h2v10H5zM17 7h2v10h-2zM7 17h2v2H7zM15 17h2v2h-2zM9 19h6v2H9zM11 8h2v2h-2zM11 11h2v2h-2zM11 14h2v2h-2z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelNavExploreIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelNavExploreIcon = createIcon(PixelNavExploreIconSvg);
export default PixelNavExploreIcon;
