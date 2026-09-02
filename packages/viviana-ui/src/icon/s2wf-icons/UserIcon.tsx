/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/User.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/User.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function UserIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 11.25c-2.62 0-4.75-2.243-4.75-5s2.13-5 4.75-5 4.75 2.243 4.75 5-2.13 5-4.75 5m0-8.5c-1.792 0-3.25 1.57-3.25 3.5s1.458 3.5 3.25 3.5 3.25-1.57 3.25-3.5-1.458-3.5-3.25-3.5M17.249 18.75c-.378 0-.703-.285-.745-.669-.262-2.429-3.12-4.331-6.504-4.331-3.414 0-6.27 1.898-6.503 4.322-.04.412-.41.728-.819.674-.412-.039-.714-.405-.675-.818.307-3.184 3.82-5.678 7.997-5.678 4.209 0 7.646 2.438 7.996 5.669.044.412-.253.782-.665.827q-.042.004-.082.004"
      />
    </svg>
  );
}

export type UserIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const UserIcon = createIcon(UserIconSvg);
export default UserIcon;
