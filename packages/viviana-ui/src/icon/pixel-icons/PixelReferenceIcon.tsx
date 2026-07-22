/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelReferenceIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M4 5h7v14H4zM13 5h7v14h-7z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelReferenceIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelReferenceIcon = createIcon(PixelReferenceIconSvg);
export default PixelReferenceIcon;
