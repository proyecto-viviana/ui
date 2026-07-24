/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelNavProjectsIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M3 5h7v2H3zM3 7h18v2H3zM3 9h18v2H3zM3 11h2v8H3zM19 11h2v8h-2zM5 17h14v2H5z"
        fill="var(--iconPrimary, currentColor)"
      />
    </svg>
  );
}

export type PixelNavProjectsIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelNavProjectsIcon = createIcon(PixelNavProjectsIconSvg);
export default PixelNavProjectsIcon;
