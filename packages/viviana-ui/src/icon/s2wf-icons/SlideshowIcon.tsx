/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Slideshow.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Slideshow.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function SlideshowIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M13.75 16h-7.5C5.01 16 4 14.99 4 13.75v-7.5C4 5.01 5.01 4 6.25 4h7.5C14.99 4 16 5.01 16 6.25v7.5c0 1.24-1.01 2.25-2.25 2.25M6.25 5.5c-.414 0-.75.337-.75.75v7.5c0 .413.336.75.75.75h7.5c.414 0 .75-.337.75-.75v-7.5c0-.413-.336-.75-.75-.75zM1.75 14.75c-.414 0-.75-.336-.75-.75V6c0-.414.336-.75.75-.75s.75.336.75.75v8c0 .414-.336.75-.75.75M18.25 14.75c-.414 0-.75-.336-.75-.75V6c0-.414.336-.75.75-.75s.75.336.75.75v8c0 .414-.336.75-.75.75"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M12.196 9.414 9.018 7.706C8.558 7.46 8 7.792 8 8.315v3.416c0 .523.558.856 1.018.609l3.178-1.708c.485-.261.485-.957 0-1.218"
      />
    </svg>
  );
}

export type SlideshowIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const SlideshowIcon = createIcon(SlideshowIconSvg);
export default SlideshowIcon;
