/*
 * Auto-generated from the frozen external design repository's Glasselated
 * pixel-art SVG set (see CREDITS.md, "Glasselated design lane").
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PixelNotificationIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <path d="M11 3h2v2h-2zM9 5h6v2H9zM8 7h2v7H8zM14 7h2v7h-2zM6 14h12v2H6zM10 17h4v2h-4z" fill="var(--iconPrimary, currentColor)" />
    </svg>
  );
}

export type PixelNotificationIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PixelNotificationIcon = createIcon(PixelNotificationIconSvg);
export default PixelNotificationIcon;
