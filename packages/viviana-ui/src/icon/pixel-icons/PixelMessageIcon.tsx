/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelMessageIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M4 5h16v2H4zM4 7h2v6H4zM18 7h2v6h-2zM4 13h16v2H4zM7 15h2v2H7z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelMessageIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelMessageIcon = createIcon(PixelMessageIconSvg);
export default PixelMessageIcon;
