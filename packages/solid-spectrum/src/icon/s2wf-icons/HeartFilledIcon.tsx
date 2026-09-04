/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/HeartFilled.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/HeartFilled.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function HeartFilledIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 18c-.489 0-.978-.16-1.386-.48-1.586-1.245-5.202-4.512-6.374-6.43-.933-1.525-1.253-3.412-.857-5.048.34-1.404 1.162-2.537 2.378-3.278 1.374-.84 3.023-.997 4.302-.413.66.301 1.363.827 1.929 1.42.578-.63 1.273-1.14 1.967-1.43 1.312-.551 2.953-.387 4.28.423 1.216.74 2.038 1.874 2.378 3.278.396 1.636.076 3.523-.857 5.049-1.17 1.913-4.787 5.182-6.374 6.429-.408.32-.897.48-1.386.48"
      />
    </svg>
  );
}

export type HeartFilledIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const HeartFilledIcon = createIcon(HeartFilledIconSvg);
export default HeartFilledIcon;
