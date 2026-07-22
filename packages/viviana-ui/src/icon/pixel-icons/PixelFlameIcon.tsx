/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelFlameIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M11 4h2v2h-2zM10 6h4v2h-4zM9 8h6v2H9zM8 10h8v6H8zM9 16h6v2H9z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelFlameIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelFlameIcon = createIcon(PixelFlameIconSvg);
export default PixelFlameIcon;
