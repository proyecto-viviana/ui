/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Plugin.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Plugin.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PluginIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.75 4H16v-.751c0-.965-.785-1.75-1.75-1.75h-1.5c-.965 0-1.75.785-1.75 1.75V4H9v-.751c0-.965-.785-1.75-1.75-1.75h-1.5c-.965 0-1.75.785-1.75 1.75V4h-.75C2.01 4 1 5.01 1 6.25v8.5C1 15.99 2.01 17 3.25 17h13.5c1.24 0 2.25-1.01 2.25-2.25v-8.5C19 5.01 17.99 4 16.75 4m-4.25-.751c0-.138.112-.25.25-.25h1.5c.138 0 .25.112.25.25V4h-2zm-7 0c0-.138.112-.25.25-.25h1.5c.138 0 .25.112.25.25V4h-2zm12 11.501c0 .413-.336.75-.75.75H3.25c-.414 0-.75-.337-.75-.75v-8.5c0-.413.336-.75.75-.75h13.5c.414 0 .75.337.75.75z"
      />
    </svg>
  );
}

export type PluginIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PluginIcon = createIcon(PluginIconSvg);
export default PluginIcon;
