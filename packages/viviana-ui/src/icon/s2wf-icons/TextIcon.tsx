/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Text.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Text.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function TextIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M14.59 2H5.41C4.17 2 3.16 3.01 3.16 4.25v1.11c0 .414.336.75.75.75s.75-.336.75-.75V4.25c0-.413.337-.75.75-.75h3.84v13H7.68c-.414 0-.75.336-.75.75s.336.75.75.75h4.64c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-1.57v-13h3.84c.413 0 .75.337.75.75v1.11c0 .414.336.75.75.75s.75-.336.75-.75V4.25c0-1.24-1.01-2.25-2.25-2.25"
      />
    </svg>
  );
}

export type TextIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const TextIcon = createIcon(TextIconSvg);
export default TextIcon;
