/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/StepForward.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/StepForward.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function StepForwardIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10.251 15.955c-.383 0-.766-.1-1.116-.3C8.425 15.25 8 14.52 8 13.701V6.3c0-.819.424-1.548 1.135-1.954.712-.404 1.556-.398 2.26.017l6.255 3.701c.692.41 1.104 1.133 1.104 1.937s-.412 1.527-1.104 1.937l-6.254 3.7c-.358.212-.751.318-1.145.318m.004-10.41c-.172 0-.308.063-.377.102-.113.066-.378.26-.378.652V13.7c0 .393.265.586.378.652.114.064.414.191.754-.006l6.254-3.701c.333-.197.368-.517.368-.646s-.035-.45-.368-.646l-6.254-3.7c-.135-.08-.264-.108-.377-.108M3.75 16h-.5C2.01 16 1 14.99 1 13.75v-7.5C1 5.01 2.01 4 3.25 4h.5C4.99 4 6 5.01 6 6.25v7.5C6 14.99 4.99 16 3.75 16m-.5-10.5c-.414 0-.75.337-.75.75v7.5c0 .413.336.75.75.75h.5c.414 0 .75-.337.75-.75v-7.5c0-.413-.336-.75-.75-.75z"
      />
    </svg>
  );
}

export type StepForwardIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const StepForwardIcon = createIcon(StepForwardIconSvg);
export default StepForwardIcon;
