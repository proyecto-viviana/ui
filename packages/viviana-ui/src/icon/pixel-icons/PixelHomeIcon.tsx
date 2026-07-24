/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelHomeIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M11 4h2v2h-2zM9 6h2v2H9zM13 6h2v2h-2zM7 8h2v2H7zM15 8h2v2h-2zM5 10h2v2H5zM17 10h2v2h-2zM7 12h2v8H7zM15 12h2v8h-2zM9 18h6v2H9z"
        fill="var(--iconPrimary, currentColor)"
      />
    </svg>
  );
}

export type PixelHomeIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelHomeIcon = createIcon(PixelHomeIconSvg);
export default PixelHomeIcon;
