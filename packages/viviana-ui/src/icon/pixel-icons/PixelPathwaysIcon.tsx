/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelPathwaysIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M4 15h4v4H4zM8 11h4v4H8zM12 7h4v4h-4zM16 3h4v4h-4z"
        fill="var(--iconPrimary, currentColor)"
      />
    </svg>
  );
}

export type PixelPathwaysIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelPathwaysIcon = createIcon(PixelPathwaysIconSvg);
export default PixelPathwaysIcon;
