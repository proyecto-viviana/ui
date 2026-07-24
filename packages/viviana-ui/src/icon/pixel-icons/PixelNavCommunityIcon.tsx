/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelNavCommunityIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path
        d="M7 4h4v4H7zM13 4h4v4h-4zM5 10h4v2H5zM15 10h4v2h-4zM5 12h2v4H5zM17 12h2v4h-2zM11 12h2v6h-2zM9 10h6v2H9z"
        fill="var(--iconPrimary, currentColor)"
      />
    </svg>
  );
}

export type PixelNavCommunityIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelNavCommunityIcon = createIcon(PixelNavCommunityIconSvg);
export default PixelNavCommunityIcon;
