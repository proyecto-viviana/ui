/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelPlusIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M11 5h2v14h-2zM5 11h14v2H5z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelPlusIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelPlusIcon = createIcon(PixelPlusIconSvg);
export default PixelPlusIcon;
