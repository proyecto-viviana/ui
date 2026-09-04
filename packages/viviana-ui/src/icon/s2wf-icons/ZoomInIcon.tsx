/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/ZoomIn.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/ZoomIn.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ZoomInIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10.8 7.25H8.75V5.2c0-.414-.336-.75-.75-.75s-.75.336-.75.75v2.05H5.2c-.414 0-.75.336-.75.75s.336.75.75.75h2.05v2.05c0 .414.336.75.75.75s.75-.336.75-.75V8.75h2.05c.414 0 .75-.336.75-.75s-.336-.75-.75-.75"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="m18.78 17.72-5.333-5.333C14.417 11.184 15 9.66 15 8c0-3.86-3.14-7-7-7S1 4.14 1 8s3.14 7 7 7c1.66 0 3.185-.583 4.387-1.553l5.333 5.333c.146.147.338.22.53.22s.384-.073.53-.22c.293-.293.293-.767 0-1.06M8 13.5c-3.033 0-5.5-2.468-5.5-5.5S4.967 2.5 8 2.5s5.5 2.468 5.5 5.5-2.467 5.5-5.5 5.5"
      />
    </svg>
  );
}

export type ZoomInIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ZoomInIcon = createIcon(ZoomInIconSvg);
export default ZoomInIcon;
