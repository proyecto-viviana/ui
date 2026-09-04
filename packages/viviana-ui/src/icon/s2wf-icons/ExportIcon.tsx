/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Export.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Export.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ExportIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m19.636 9.47-3-3c-.293-.293-.768-.293-1.06 0s-.294.767 0 1.06l1.719 1.72h-9.15c-.415 0-.75.336-.75.75s.335.75.75.75h9.15l-1.72 1.72c-.293.293-.293.767 0 1.06.147.147.338.22.53.22s.384-.073.53-.22l3-3c.294-.293.294-.767 0-1.06"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M13.047 12.956c-.414 0-.75.336-.75.75v2.044c0 .413-.337.75-.75.75H3.25c-.413 0-.75-.337-.75-.75V4.25c0-.413.337-.75.75-.75h8.5c.413 0 .75.337.75.75v1.968c0 .414.336.75.75.75s.75-.336.75-.75V4.25C14 3.01 12.99 2 11.75 2h-8.5C2.01 2 1 3.01 1 4.25v11.5C1 16.99 2.01 18 3.25 18h8.297c1.24 0 2.25-1.01 2.25-2.25v-2.044c0-.414-.336-.75-.75-.75"
      />
    </svg>
  );
}

export type ExportIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ExportIcon = createIcon(ExportIconSvg);
export default ExportIcon;
