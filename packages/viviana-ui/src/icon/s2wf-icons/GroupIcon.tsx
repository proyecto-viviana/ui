/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Group.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Group.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function GroupIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M8.5 15h-2c-.827 0-1.5-.673-1.5-1.5S5.673 12 6.5 12h2c.827 0 1.5.673 1.5 1.5S9.327 15 8.5 15"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M15.75 18H4.25C3.01 18 2 16.99 2 15.75V4.25C2 3.01 3.01 2 4.25 2h11.5C16.99 2 18 3.01 18 4.25v11.5c0 1.24-1.01 2.25-2.25 2.25M4.25 3.5c-.414 0-.75.337-.75.75v11.5c0 .413.336.75.75.75h11.5c.414 0 .75-.337.75-.75V4.25c0-.413-.336-.75-.75-.75z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M13.25 10h-2.833c-.965 0-1.75-.785-1.75-1.75v-1.5c0-.965.785-1.75 1.75-1.75h2.833c.965 0 1.75.785 1.75 1.75v1.5c0 .965-.785 1.75-1.75 1.75m-2.833-3.5c-.138 0-.25.112-.25.25v1.5c0 .138.112.25.25.25h2.833c.138 0 .25-.112.25-.25v-1.5c0-.138-.112-.25-.25-.25z"
      />
    </svg>
  );
}

export type GroupIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const GroupIcon = createIcon(GroupIconSvg);
export default GroupIcon;
