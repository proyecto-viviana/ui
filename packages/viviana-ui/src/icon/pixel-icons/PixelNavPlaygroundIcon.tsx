/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelNavPlaygroundIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M13 2h4v3h-4zM11 5h4v3h-4zM9 8h6v3H9zM12 11h4v3h-4zM10 14h4v3h-4zM8 17h4v5H8z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelNavPlaygroundIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelNavPlaygroundIcon = createIcon(PixelNavPlaygroundIconSvg);
export default PixelNavPlaygroundIcon;
