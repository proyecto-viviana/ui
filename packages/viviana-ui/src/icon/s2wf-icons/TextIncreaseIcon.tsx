/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/TextIncrease.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/TextIncrease.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function TextIncreaseIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M12.59 1.998H3.41c-1.24 0-2.25 1.01-2.25 2.25v1.11c0 .414.336.75.75.75s.75-.336.75-.75v-1.11c0-.413.337-.75.75-.75h3.84v13h-1.5c-.414 0-.75.336-.75.75s.336.75.75.75H10c.414 0 .75-.336.75-.75s-.336-.75-.75-.75H8.75v-13h3.84c.413 0 .75.337.75.75v1.11c0 .414.336.75.75.75s.75-.336.75-.75v-1.11c0-1.24-1.01-2.25-2.25-2.25M18.75 18.5c-.192 0-.384-.073-.53-.22l-2.47-2.47-2.47 2.47c-.293.293-.767.293-1.06 0s-.293-.767 0-1.06l3-3c.293-.293.767-.293 1.06 0l3 3c.293.293.293.767 0 1.06-.146.147-.338.22-.53.22"
      />
    </svg>
  );
}

export type TextIncreaseIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const TextIncreaseIcon = createIcon(TextIncreaseIconSvg);
export default TextIncreaseIcon;
