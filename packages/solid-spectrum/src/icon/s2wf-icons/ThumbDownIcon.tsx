/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/ThumbDown.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/ThumbDown.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ThumbDownIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m18.78 9.194-2.03-4.877C16.165 2.911 14.807 2.001 13.29 2H4.25C3.01 2 2 3.01 2 4.251v5.5c0 1.24 1.01 2.25 2.25 2.25h2.066c.99.003 1.286 1.246 1.624 3.144.281 1.573.6 3.355 2.125 3.355 1.85 0 2.063-1.47 2.18-2.275l.205-2.536c.032-.385.36-.688.747-.688h3.045c.922 0 1.777-.458 2.288-1.225s.605-1.731.25-2.582M3.5 9.751v-5.5c0-.414.336-.751.75-.751h1v7.001h-1c-.414 0-.75-.337-.75-.75m13.782 1.193c-.236.354-.615.557-1.04.557h-3.045c-1.162 0-2.147.907-2.242 2.066 0 0-.195 2.414-.197 2.457-.141.976-.26.962-.714.974-.268-.106-.51-1.464-.627-2.117-.308-1.725-.723-4.044-2.667-4.346V3.5h6.54c.909.001 1.724.548 2.076 1.394l2.03 4.877c.164.392.122.82-.114 1.173"
      />
    </svg>
  );
}

export type ThumbDownIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ThumbDownIcon = createIcon(ThumbDownIconSvg);
export default ThumbDownIcon;
