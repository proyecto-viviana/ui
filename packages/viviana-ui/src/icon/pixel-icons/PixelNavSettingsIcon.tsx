/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelNavSettingsIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M10 2h4v3h-4zM10 19h4v3h-4zM2 10h3v4H2zM19 10h3v4h-3zM4 4h3v3H4zM17 4h3v3h-3zM4 17h3v3H4zM17 17h3v3h-3zM9 9h6v6H9z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelNavSettingsIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelNavSettingsIcon = createIcon(PixelNavSettingsIconSvg);
export default PixelNavSettingsIcon;
