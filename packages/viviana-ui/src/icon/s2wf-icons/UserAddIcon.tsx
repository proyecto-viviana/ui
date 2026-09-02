/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/UserAdd.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/UserAdd.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function UserAddIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M15 10.502c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.015-4.5-4.5-4.5m2.5 5.123h-1.875V17.5c0 .345-.28.625-.625.625s-.625-.28-.625-.625v-1.875H12.5c-.345 0-.625-.28-.625-.625s.28-.625.625-.625h1.875V12.5c0-.345.28-.625.625-.625s.625.28.625.625v1.875H17.5c.345 0 .625.28.625.625s-.28.625-.625.625M2.275 18.752q-.079 0-.16-.018c-.405-.088-.662-.487-.573-.892.595-2.73 3.312-5.025 6.607-5.58.423-.076.796.208.865.615.069.41-.206.796-.615.864-2.707.456-4.924 2.274-5.392 4.421-.076.35-.387.59-.732.59M10 10.852c-2.485 0-4.507-2.154-4.507-4.8s2.022-4.8 4.507-4.8 4.507 2.153 4.507 4.8-2.022 4.8-4.507 4.8m0-8.1c-1.658 0-3.007 1.48-3.007 3.3s1.349 3.3 3.007 3.3 3.007-1.48 3.007-3.3-1.349-3.3-3.007-3.3"
      />
    </svg>
  );
}

export type UserAddIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const UserAddIcon = createIcon(UserAddIconSvg);
export default UserAddIcon;
