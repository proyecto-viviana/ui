/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/ShareAndroid.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/ShareAndroid.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ShareAndroidIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M15 13.25c-.768 0-1.462.318-1.961.827l-6.357-3.485c.042-.191.068-.388.068-.592s-.026-.4-.068-.592l6.357-3.485c.5.509 1.193.827 1.961.827 1.517 0 2.75-1.233 2.75-2.75S16.517 1.25 15 1.25 12.25 2.483 12.25 4c0 .207.027.407.07.601L5.97 8.088C5.47 7.573 4.773 7.25 4 7.25c-1.517 0-2.75 1.233-2.75 2.75S2.483 12.75 4 12.75c.773 0 1.47-.323 1.97-.838l6.35 3.487c-.043.194-.07.394-.07.601 0 1.517 1.233 2.75 2.75 2.75s2.75-1.233 2.75-2.75-1.233-2.75-2.75-2.75m0-10.5c.69 0 1.25.56 1.25 1.25S15.69 5.25 15 5.25 13.75 4.69 13.75 4s.56-1.25 1.25-1.25M2.75 10c0-.69.56-1.25 1.25-1.25s1.25.56 1.25 1.25-.56 1.25-1.25 1.25-1.25-.56-1.25-1.25M15 17.25c-.69 0-1.25-.56-1.25-1.25s.56-1.25 1.25-1.25 1.25.56 1.25 1.25-.56 1.25-1.25 1.25"
      />
    </svg>
  );
}

export type ShareAndroidIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ShareAndroidIcon = createIcon(ShareAndroidIconSvg);
export default ShareAndroidIcon;
