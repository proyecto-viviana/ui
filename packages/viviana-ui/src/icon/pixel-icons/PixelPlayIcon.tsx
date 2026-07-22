/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelPlayIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M7 4h2v16H7zM9 6h2v12H9zM11 8h2v8h-2zM13 10h2v4h-2zM15 11h2v2h-2z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelPlayIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelPlayIcon = createIcon(PixelPlayIconSvg);
export default PixelPlayIcon;
