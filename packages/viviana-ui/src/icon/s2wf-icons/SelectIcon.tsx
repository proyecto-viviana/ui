/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Select.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Select.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function SelectIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M6.281 18.547c-.292 0-.589-.058-.876-.177-.856-.355-1.387-1.151-1.387-2.078l-.004-12.47c0-.928.532-1.725 1.39-2.08.854-.354 1.796-.168 2.452.489l8.892 8.914c.655.655.84 1.594.486 2.45-.356.855-1.152 1.387-2.079 1.387h-4.078c-.197 0-.39.08-.53.22l-2.691 2.683c-.436.434-.997.662-1.575.662M6.277 3.068c-.137 0-.25.039-.3.06-.109.045-.463.228-.463.693l.004 12.471c0 .465.354.648.462.692.108.045.487.167.817-.162l2.691-2.682c.426-.424.99-.658 1.589-.658h4.078c.465 0 .648-.354.693-.462s.166-.488-.161-.816L6.795 3.29c-.174-.174-.362-.222-.518-.222"
      />
    </svg>
  );
}

export type SelectIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const SelectIcon = createIcon(SelectIconSvg);
export default SelectIcon;
