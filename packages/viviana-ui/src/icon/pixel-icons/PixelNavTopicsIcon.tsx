/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelNavTopicsIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelNavTopicsIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelNavTopicsIcon = createIcon(PixelNavTopicsIconSvg);
export default PixelNavTopicsIcon;
