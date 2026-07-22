/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelClockIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M9 4h6v2H9zM9 18h6v2H9zM5 9h2v6H5zM17 9h2v6h-2zM7 6h2v2H7zM15 6h2v2h-2zM7 16h2v2H7zM15 16h2v2h-2zM11 8h2v4h-2zM13 12h2v2h-2z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelClockIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelClockIcon = createIcon(PixelClockIconSvg);
export default PixelClockIcon;
