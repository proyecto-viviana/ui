/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Percentage.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Percentage.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PercentageIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M2.5 18.25c-.192 0-.384-.073-.53-.22-.293-.293-.293-.767 0-1.06l15-15c.293-.293.767-.293 1.06 0s.293.767 0 1.06l-15 15c-.146.147-.338.22-.53.22M5.25 8.5C3.458 8.5 2 7.042 2 5.25S3.458 2 5.25 2 8.5 3.458 8.5 5.25 7.042 8.5 5.25 8.5m0-5c-.965 0-1.75.785-1.75 1.75S4.285 7 5.25 7 7 6.215 7 5.25 6.215 3.5 5.25 3.5M14.75 18c-1.792 0-3.25-1.458-3.25-3.25s1.458-3.25 3.25-3.25S18 12.958 18 14.75 16.542 18 14.75 18m0-5c-.965 0-1.75.785-1.75 1.75s.785 1.75 1.75 1.75 1.75-.785 1.75-1.75S15.715 13 14.75 13"
      />
    </svg>
  );
}

export type PercentageIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PercentageIcon = createIcon(PercentageIconSvg);
export default PercentageIcon;
