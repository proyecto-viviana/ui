/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Play.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Play.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PlayIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M4.749 18.004c-.398 0-.795-.108-1.153-.321C2.91 17.273 2.5 16.55 2.5 15.75V4.249c0-.799.41-1.521 1.096-1.932.685-.409 1.515-.43 2.219-.05L16.516 8.02C17.246 8.41 17.7 9.17 17.7 10s-.453 1.589-1.184 1.981L5.815 17.732c-.336.182-.702.272-1.066.272m.003-14.508c-.178 0-.318.068-.387.11-.11.065-.365.26-.365.643v11.502c0 .384.255.578.365.644s.402.198.74.017l10.7-5.75c.357-.193.395-.527.395-.662s-.038-.469-.394-.661L5.105 3.588c-.126-.067-.246-.092-.353-.092"
      />
    </svg>
  );
}

export type PlayIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PlayIcon = createIcon(PlayIconSvg);
export default PlayIcon;
