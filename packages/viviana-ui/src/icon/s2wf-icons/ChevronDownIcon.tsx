/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/ChevronDown.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/ChevronDown.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ChevronDownIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M3.755 7.243c.287-.299.762-.308 1.06-.02l5.183 4.986 5.197-4.999c.298-.288.773-.278 1.06.02.287.297.278.773-.02 1.06l-5.717 5.5c-.29.28-.75.28-1.04 0L3.776 8.303c-.153-.147-.23-.344-.23-.54 0-.188.07-.375.21-.52"
      />
    </svg>
  );
}

export type ChevronDownIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ChevronDownIcon = createIcon(ChevronDownIconSvg);
export default ChevronDownIcon;
