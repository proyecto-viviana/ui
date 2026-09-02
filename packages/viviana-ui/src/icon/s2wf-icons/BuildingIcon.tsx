/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Building.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Building.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function BuildingIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <circle
        cx="12"
        cy="5"
        r="1"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <circle
        cx="8"
        cy="8"
        r="1"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <circle
        cx="8"
        cy="5"
        r="1"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <circle
        cx="12"
        cy="8"
        r="1"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M14.75 1h-9.5C4.01 1 3 2.01 3 3.25v12.5C3 16.99 4.01 18 5.25 18h9.5c1.24 0 2.25-1.01 2.25-2.25V3.25C17 2.01 15.99 1 14.75 1m-3.251 15.5H9v-3.25c0-.413.337-.75.75-.75h.999c.413 0 .75.337.75.75zm4.001-.75c0 .413-.337.75-.75.75h-1.751v-3.25c0-1.24-1.01-2.25-2.25-2.25H9.75c-1.24 0-2.25 1.01-2.25 2.25v3.25H5.25c-.413 0-.75-.337-.75-.75V3.25c0-.413.337-.75.75-.75h9.5c.413 0 .75.337.75.75z"
      />
    </svg>
  );
}

export type BuildingIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const BuildingIcon = createIcon(BuildingIconSvg);
export default BuildingIcon;
