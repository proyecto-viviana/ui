/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Table.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Table.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function TableIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M15.75 2H4.25C3.01 2 2 3.01 2 4.25v11.5C2 16.99 3.01 18 4.25 18h11.5c1.24 0 2.25-1.01 2.25-2.25V4.25C18 3.01 16.99 2 15.75 2M3.5 9h3v3h-3zM8 9h8.5v3H8zM3.5 4.25c0-.413.336-.75.75-.75h11.5c.414 0 .75.337.75.75V7.5h-13zm0 11.5V13.5h3v3H4.25c-.414 0-.75-.337-.75-.75m13 0c0 .413-.336.75-.75.75H8v-3h8.5z"
      />
    </svg>
  );
}

export type TableIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const TableIcon = createIcon(TableIconSvg);
export default TableIcon;
