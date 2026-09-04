/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/StrokeWidth.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/StrokeWidth.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function StrokeWidthIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      {...rest}
      class={className}
    >
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M18.75 14.75c0-.966-.784-1.75-1.75-1.75H3c-.966 0-1.75.784-1.75 1.75S2.034 16.5 3 16.5h14c.966 0 1.75-.784 1.75-1.75M18 5.5H2c-.414 0-.75-.336-.75-.75S1.586 4 2 4h16c.414 0 .75.336.75.75s-.336.75-.75.75M18.75 9.25c0-.69-.56-1.25-1.25-1.25h-15c-.69 0-1.25.56-1.25 1.25s.56 1.25 1.25 1.25h15c.69 0 1.25-.56 1.25-1.25"
      />
    </svg>
  );
}

export type StrokeWidthIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const StrokeWidthIcon = createIcon(StrokeWidthIconSvg);
export default StrokeWidthIcon;
