/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/ContextualTaskBar.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/ContextualTaskBar.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ContextualTaskBarIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M12.75 12h-5.5C6.01 12 5 10.99 5 9.75v-4.5C5 4.01 6.01 3 7.25 3h5.5C13.99 3 15 4.01 15 5.25v4.5c0 1.24-1.01 2.25-2.25 2.25m-5.5-7.5c-.413 0-.75.337-.75.75v4.5c0 .413.337.75.75.75h5.5c.413 0 .75-.337.75-.75v-4.5c0-.413-.337-.75-.75-.75z"
        opacity="0.35"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M16.75 19H3.25C2.01 19 1 17.99 1 16.75v-.5C1 15.01 2.01 14 3.25 14h13.5c1.24 0 2.25 1.01 2.25 2.25v.5c0 1.24-1.01 2.25-2.25 2.25m-13.5-3.5c-.413 0-.75.337-.75.75v.5c0 .413.337.75.75.75h13.5c.413 0 .75-.337.75-.75v-.5c0-.413-.337-.75-.75-.75z"
      />
    </svg>
  );
}

export type ContextualTaskBarIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ContextualTaskBarIcon = createIcon(ContextualTaskBarIconSvg);
export default ContextualTaskBarIcon;
