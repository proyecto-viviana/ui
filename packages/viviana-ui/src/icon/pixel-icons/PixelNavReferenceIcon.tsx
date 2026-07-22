/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelNavReferenceIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M5 3h12v2H5zM5 5h2v16H5zM17 5h2v14h-2zM7 19h10v2H7zM9 8h6v2H9zM9 11h6v2H9z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelNavReferenceIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelNavReferenceIcon = createIcon(PixelNavReferenceIconSvg);
export default PixelNavReferenceIcon;
