/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelChartIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M4 12h3v6H4zM10 9h3v9h-3zM16 5h3v13h-3zM3 18h18v2H3z"
        fill="var(--iconPrimary, currentColor)"
      />
    </svg>
  );
}

export type PixelChartIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelChartIcon = createIcon(PixelChartIconSvg);
export default PixelChartIcon;
