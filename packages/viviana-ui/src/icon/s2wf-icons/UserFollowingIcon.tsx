/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/UserFollowing.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/UserFollowing.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function UserFollowingIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M15 10.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.015-4.5-4.5-4.5m2.4 3.35L15.09 17c-.11.152-.284.245-.472.254l-.032.001c-.176 0-.345-.074-.464-.207l-1.439-1.599c-.23-.257-.21-.652.047-.883.256-.23.65-.21.883.047l.924 1.028 1.855-2.53c.204-.278.596-.339.873-.134.278.204.339.595.134.873M2.274 18.752q-.078 0-.16-.017c-.405-.089-.661-.488-.573-.893.596-2.73 3.313-5.025 6.608-5.58.407-.065.795.207.865.615.069.41-.207.796-.616.865-2.706.455-4.923 2.273-5.391 4.42-.077.35-.387.59-.733.59M10 10.852c-2.485 0-4.507-2.153-4.507-4.8s2.022-4.8 4.507-4.8 4.507 2.153 4.507 4.8-2.022 4.8-4.507 4.8m0-8.1c-1.658 0-3.007 1.48-3.007 3.3s1.349 3.3 3.007 3.3 3.007-1.48 3.007-3.3-1.349-3.3-3.007-3.3"
      />
    </svg>
  );
}

export type UserFollowingIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const UserFollowingIcon = createIcon(UserFollowingIconSvg);
export default UserFollowingIcon;
