/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Microphone.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Microphone.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function MicrophoneIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 12.75c-2.206 0-4-1.794-4-4V5c0-2.206 1.794-4 4-4s4 1.794 4 4v3.75c0 2.206-1.794 4-4 4M10 2.5C8.622 2.5 7.5 3.621 7.5 5v3.75c0 1.379 1.122 2.5 2.5 2.5s2.5-1.121 2.5-2.5V5c0-1.379-1.122-2.5-2.5-2.5"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M16.25 7.316c-.414 0-.75.336-.75.75v.684c0 3.032-2.467 5.5-5.5 5.5s-5.5-2.468-5.5-5.5v-.684c0-.414-.336-.75-.75-.75s-.75.336-.75.75v.684c0 3.606 2.742 6.583 6.25 6.959V17.5H6c-.414 0-.75.336-.75.75s.336.75.75.75h8c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-3.25v-1.791C14.258 15.333 17 12.356 17 8.75v-.684c0-.414-.336-.75-.75-.75"
      />
    </svg>
  );
}

export type MicrophoneIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const MicrophoneIcon = createIcon(MicrophoneIconSvg);
export default MicrophoneIcon;
