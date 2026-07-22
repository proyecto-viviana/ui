/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelMapIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M4 6h5v13H4zM10 5h4v13h-4zM15 6h5v13h-5z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelMapIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelMapIcon = createIcon(PixelMapIconSvg);
export default PixelMapIcon;
