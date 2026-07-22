/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelSettingsIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M9 9h6v6H9zM10 4h4v5h-4zM10 15h4v5h-4zM4 10h5v4H4zM15 10h5v4h-4zM6 6h3v3H6zM15 6h3v3h-3zM6 15h3v3H6zM15 15h3v3h-3z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelSettingsIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelSettingsIcon = createIcon(PixelSettingsIconSvg);
export default PixelSettingsIcon;
