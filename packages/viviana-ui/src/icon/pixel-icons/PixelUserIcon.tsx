/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelUserIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M9 4h6v2H9zM8 6h2v4H8zM14 6h2v4h-2zM9 10h6v2H9zM8 13h8v2H8zM6 15h2v5H6zM16 15h2v5h-2z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelUserIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelUserIcon = createIcon(PixelUserIconSvg);
export default PixelUserIcon;
