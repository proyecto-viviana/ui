/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Video.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Video.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function VideoIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M15.75 18H4.25C3.01 18 2 16.99 2 15.75V4.25C2 3.01 3.01 2 4.25 2h11.5C16.99 2 18 3.01 18 4.25v11.5c0 1.24-1.01 2.25-2.25 2.25M4.25 3.5c-.413 0-.75.337-.75.75v11.5c0 .413.337.75.75.75h11.5c.413 0 .75-.337.75-.75V4.25c0-.413-.337-.75-.75-.75z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="m13.073 9.12-4.6-2.473C7.807 6.289 7 6.772 7 7.527v4.945c0 .756.807 1.239 1.473.881l4.6-2.472c.702-.378.702-1.384 0-1.762"
      />
    </svg>
  );
}

export type VideoIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const VideoIcon = createIcon(VideoIconSvg);
export default VideoIcon;
