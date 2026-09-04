/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/ArrowHeadTool.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/ArrowHeadTool.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ArrowHeadToolIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M17.25 2H13c-.414 0-.75.336-.75.75s.336.75.75.75h2.44L2.344 16.594c-.293.293-.293.768 0 1.06.147.147.339.22.53.22s.384-.073.53-.22L16.5 4.562V7c0 .414.336.75.75.75S18 7.414 18 7V2.75c0-.414-.336-.75-.75-.75"
      />
    </svg>
  );
}

export type ArrowHeadToolIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ArrowHeadToolIcon = createIcon(ArrowHeadToolIconSvg);
export default ArrowHeadToolIcon;
