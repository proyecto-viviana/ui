/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/App.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/App.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function AppIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M13.25 18h-6.5C4.13 18 2 15.87 2 13.25v-6.5C2 4.13 4.13 2 6.75 2h6.5C15.87 2 18 4.13 18 6.75v6.5c0 2.62-2.13 4.75-4.75 4.75M6.75 3.5C4.958 3.5 3.5 4.958 3.5 6.75v6.5c0 1.792 1.458 3.25 3.25 3.25h6.5c1.792 0 3.25-1.458 3.25-3.25v-6.5c0-1.792-1.458-3.25-3.25-3.25z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="m13.44 12.725-2.75-6.5c-.234-.555-1.146-.555-1.38 0l-2.75 6.5c-.163.38.016.82.398.982.379.166.821-.017.982-.398l.766-1.809h2.588l.766 1.809c.12.286.398.458.69.458q.148 0 .292-.06c.382-.161.56-.602.398-.982M9.34 10 10 8.441 10.66 10z"
      />
    </svg>
  );
}

export type AppIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const AppIcon = createIcon(AppIconSvg);
export default AppIcon;
