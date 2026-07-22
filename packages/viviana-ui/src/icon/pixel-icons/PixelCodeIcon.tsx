/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelCodeIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M7 9h2v2H7zM5 11h2v2H5zM7 13h2v2H7zM15 9h2v2h-2zM17 11h2v2h-2zM15 13h2v2h-2z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelCodeIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelCodeIcon = createIcon(PixelCodeIconSvg);
export default PixelCodeIcon;
