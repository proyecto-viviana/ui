/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Line.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Line.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function LineIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M2.875 17.875c-.191 0-.383-.073-.53-.22-.293-.293-.293-.767 0-1.06L16.366 2.573c.293-.293.768-.293 1.06 0s.294.768 0 1.06L3.407 17.656c-.147.147-.339.22-.53.22"
      />
    </svg>
  );
}

export type LineIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const LineIcon = createIcon(LineIconSvg);
export default LineIcon;
