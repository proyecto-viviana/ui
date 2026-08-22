/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Heart.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Heart.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function HeartIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 18c-.489 0-.978-.16-1.386-.48-1.586-1.245-5.202-4.512-6.374-6.43-.933-1.525-1.253-3.412-.857-5.048.34-1.404 1.162-2.537 2.378-3.278 1.374-.84 3.023-.997 4.302-.413.66.301 1.363.827 1.929 1.42.578-.63 1.273-1.14 1.967-1.43 1.312-.551 2.953-.387 4.28.423 1.216.74 2.038 1.874 2.378 3.278.396 1.636.076 3.523-.857 5.049-1.17 1.913-4.787 5.182-6.374 6.429-.408.32-.897.48-1.386.48M6.387 3.499c-.606 0-1.255.186-1.845.546-.87.53-1.457 1.342-1.701 2.35-.305 1.257-.051 2.72.678 3.913.953 1.558 4.15 4.563 6.021 6.032.271.213.649.213.92 0 1.873-1.47 5.07-4.477 6.02-6.032.73-1.193.984-2.656.68-3.913-.245-1.008-.833-1.82-1.701-2.35-.926-.565-2.045-.687-2.92-.32-.683.286-1.434.937-1.914 1.66-.279.418-.971.418-1.25 0-.435-.654-1.249-1.356-1.935-1.67-.318-.145-.677-.216-1.053-.216"
      />
    </svg>
  );
}

export type HeartIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const HeartIcon = createIcon(HeartIconSvg);
export default HeartIcon;
