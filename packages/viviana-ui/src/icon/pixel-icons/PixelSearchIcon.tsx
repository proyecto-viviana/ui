/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelSearchIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M4 4h10v2H4zM4 12h10v2H4zM4 6h2v6H4zM12 6h2v6h-2zM14 14h2v2h-2zM16 16h2v2h-2zM18 18h2v2h-2z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelSearchIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelSearchIcon = createIcon(PixelSearchIconSvg);
export default PixelSearchIcon;
