/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/UserLock.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/UserLock.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function UserLockIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 11.25c-2.62 0-4.75-2.243-4.75-5s2.13-5 4.75-5 4.75 2.243 4.75 5-2.13 5-4.75 5m0-8.5c-1.792 0-3.25 1.57-3.25 3.5s1.458 3.5 3.25 3.5 3.25-1.57 3.25-3.5-1.458-3.5-3.25-3.5M2.751 18.75q-.037 0-.073-.004c-.412-.039-.714-.405-.674-.818C2.31 14.744 5.822 12.25 10 12.25c.677 0 1.347.063 1.991.188.407.08.673.473.594.88-.078.407-.48.678-.879.593-.55-.107-1.125-.161-1.706-.161-3.414 0-6.27 1.898-6.504 4.322-.037.388-.363.678-.745.678M18.01 14.002v-.992C18.01 11.9 17.108 11 16 11s-2.01.901-2.01 2.01v.992c-.547.006-.99.45-.99.998v3c0 .552.448 1 1 1h4c.552 0 1-.448 1-1v-3c0-.549-.443-.992-.99-.998M16 12.25c.419 0 .76.34.76.76V14h-1.52v-.99c0-.42.341-.76.76-.76"
      />
    </svg>
  );
}

export type UserLockIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const UserLockIcon = createIcon(UserLockIconSvg);
export default UserLockIcon;
