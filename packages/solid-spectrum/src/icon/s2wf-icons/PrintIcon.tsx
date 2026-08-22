/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Print.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Print.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PrintIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.75 5H16v-.75C16 3.01 14.99 2 13.75 2h-7.5C5.01 2 4 3.01 4 4.25V5h-.75C2.01 5 1 6.01 1 7.25v5.5C1 13.99 2.01 15 3.25 15H4v.75C4 16.99 5.01 18 6.25 18h7.5c1.24 0 2.25-1.01 2.25-2.25V15h.75c1.24 0 2.25-1.01 2.25-2.25v-5.5C19 6.01 17.99 5 16.75 5M5.5 4.25c0-.413.337-.75.75-.75h7.5c.413 0 .75.337.75.75V5h-9zm9 11.5c0 .413-.337.75-.75.75h-7.5c-.413 0-.75-.337-.75-.75v-3.5c0-.413.337-.75.75-.75h7.5c.413 0 .75.337.75.75zm3-3c0 .413-.337.75-.75.75H16v-1.25c0-1.24-1.01-2.25-2.25-2.25h-7.5C5.01 10 4 11.01 4 12.25v1.25h-.75c-.413 0-.75-.337-.75-.75v-5.5c0-.413.337-.75.75-.75h13.5c.413 0 .75.337.75.75z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M12.5 15h-5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h5c.414 0 .75.336.75.75s-.336.75-.75.75"
      />
    </svg>
  );
}

export type PrintIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PrintIcon = createIcon(PrintIconSvg);
export default PrintIcon;
