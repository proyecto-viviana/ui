/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelLayoutIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M4 5h16v2H4zM4 17h16v2H4zM4 7h2v10H4zM18 7h2v10h-2zM6 7h12v2H6zM9 9h2v8H9z"
        fill="var(--iconPrimary, currentColor)"
      />
    </svg>
  );
}

export type PixelLayoutIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelLayoutIcon = createIcon(PixelLayoutIconSvg);
export default PixelLayoutIcon;
