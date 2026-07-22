/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelSparkleIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M11 3h2v6h-2zM11 15h2v6h-2zM3 11h6v2H3zM15 11h6v2h-6zM10 10h4v4h-4z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelSparkleIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelSparkleIcon = createIcon(PixelSparkleIconSvg);
export default PixelSparkleIcon;
