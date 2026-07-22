/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelNavPathwaysIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M4 4h4v4H4zM6 8h2v4H6zM8 10h6v2H8zM12 12h2v4h-2zM10 16h6v4h-6z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelNavPathwaysIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelNavPathwaysIcon = createIcon(PixelNavPathwaysIconSvg);
export default PixelNavPathwaysIcon;
