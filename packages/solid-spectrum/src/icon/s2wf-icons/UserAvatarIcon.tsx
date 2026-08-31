/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/UserAvatar.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/UserAvatar.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function UserAvatarIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 1.25c-4.825 0-8.75 3.925-8.75 8.75s3.925 8.75 8.75 8.75 8.75-3.925 8.75-8.75S14.825 1.25 10 1.25m0 1.5c3.998 0 7.25 3.252 7.25 7.25 0 1.632-.548 3.134-1.462 4.347-1.481-1.244-3.587-1.972-5.788-1.972-2.267 0-4.418.74-5.797 1.96C3.295 13.124 2.75 11.626 2.75 10c0-3.998 3.252-7.25 7.25-7.25M5.22 15.437c1.102-.959 2.909-1.562 4.78-1.562 1.797 0 3.562.592 4.768 1.572-1.276 1.119-2.942 1.803-4.768 1.803-1.832 0-3.502-.688-4.78-1.813m4.838-4.037c-.021 0-.057-.01-.063 0-.637 0-1.258-.181-1.796-.524-.53-.338-.961-.81-1.25-1.366-.306-.583-.463-1.24-.453-1.9-.024-1.273.61-2.472 1.697-3.183 1.099-.698 2.508-.698 3.6-.005.527.342.959.81 1.254 1.358.307.566.465 1.206.457 1.85.01.641-.146 1.302-.452 1.889-.29.556-.723 1.03-1.25 1.371-.526.335-1.126.51-1.744.51m-.048-1.5h.01c.348.015.681-.087.972-.273.305-.197.56-.476.73-.802.191-.366.289-.779.282-1.191.005-.41-.09-.798-.277-1.14-.176-.329-.434-.608-.744-.81-.596-.377-1.374-.378-1.977.004-.644.421-1.025 1.14-1.01 1.92-.006.435.09.844.281 1.207.17.325.422.6.729.797.295.188.638.287.99.287z"
      />
    </svg>
  );
}

export type UserAvatarIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const UserAvatarIcon = createIcon(UserAvatarIconSvg);
export default UserAvatarIcon;
