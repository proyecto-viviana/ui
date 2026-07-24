/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelChevronRightIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M9 6h2v2H9zM11 8h2v2h-2zM13 10h2v2h-2zM11 12h2v2h-2zM9 14h2v2H9z"
        fill="var(--iconPrimary, currentColor)"
      />
    </svg>
  );
}

export type PixelChevronRightIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelChevronRightIcon = createIcon(PixelChevronRightIconSvg);
export default PixelChevronRightIcon;
