/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelCommunityIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M5 5h4v4H5zM15 5h4v4h-4zM3 11h8v6H3zM13 11h8v6h-8z"
        fill="var(--iconPrimary, currentColor)"
      />
    </svg>
  );
}

export type PixelCommunityIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelCommunityIcon = createIcon(PixelCommunityIconSvg);
export default PixelCommunityIcon;
