/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Asset.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Asset.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function AssetIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M11.664 4.921c0 .696-.578 1.26-1.292 1.26S9.08 5.617 9.08 4.921s.578-1.26 1.292-1.26 1.292.564 1.292 1.26M16.75 19h-6.5C9.01 19 8 17.99 8 16.75v-6.5C8 9.01 9.01 8 10.25 8h6.5C17.99 8 19 9.01 19 10.25v6.5c0 1.24-1.01 2.25-2.25 2.25m-6.5-9.5c-.413 0-.75.337-.75.75v6.5c0 .413.337.75.75.75h6.5c.413 0 .75-.337.75-.75v-6.5c0-.413-.337-.75-.75-.75z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M12 15.132v-2.907c0-.429.414-.69.733-.463l2.35 1.453c.301.214.301.712 0 .926l-2.35 1.453c-.319.228-.733-.034-.733-.462M13.022 1H2.978C1.887 1 1 1.901 1 3.01v7.98C1 12.1 1.887 13 2.978 13H5.75c.414 0 .75-.336.75-.75s-.336-.75-.75-.75H2.978c-.264 0-.478-.229-.478-.51v-.773l2.595-2.53c.165-.162.445-.164.604-.008l.478.477c.293.293.767.293 1.06 0s.293-.767 0-1.06l-.484-.485c-.742-.725-1.956-.726-2.704 0L2.5 8.122V3.01c0-.281.214-.51.478-.51h10.044c.264 0 .478.229.478.51V5.7c0 .414.336.75.75.75s.75-.336.75-.75V3.01C15 1.9 14.113 1 13.022 1"
      />
    </svg>
  );
}

export type AssetIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const AssetIcon = createIcon(AssetIconSvg);
export default AssetIcon;
