/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/AlignCenter.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/AlignCenter.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function AlignCenterIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M13.75 11h-3V9h1C12.99 9 14 7.99 14 6.75v-1.5C14 4.01 12.99 3 11.75 3h-1V1.75c0-.414-.336-.75-.75-.75s-.75.336-.75.75V3h-1C7.01 3 6 4.01 6 5.25v1.5C6 7.99 7.01 9 8.25 9h1v2h-3C5.01 11 4 12.01 4 13.25v1.5C4 15.99 5.01 17 6.25 17h3v1.25c0 .414.336.75.75.75s.75-.336.75-.75V17h3c1.24 0 2.25-1.01 2.25-2.25v-1.5c0-1.24-1.01-2.25-2.25-2.25M7.5 6.75v-1.5c0-.413.336-.75.75-.75h3.5c.414 0 .75.337.75.75v1.5c0 .413-.336.75-.75.75h-3.5c-.414 0-.75-.337-.75-.75m7 8c0 .413-.336.75-.75.75h-7.5c-.414 0-.75-.337-.75-.75v-1.5c0-.413.336-.75.75-.75h7.5c.414 0 .75.337.75.75z"
      />
    </svg>
  );
}

export type AlignCenterIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const AlignCenterIcon = createIcon(AlignCenterIconSvg);
export default AlignCenterIcon;
