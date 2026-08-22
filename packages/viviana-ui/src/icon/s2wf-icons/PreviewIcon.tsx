/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Preview.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Preview.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PreviewIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m19.28 18.222-1.973-1.974c.436-.64.693-1.414.693-2.246 0-2.206-1.794-4-4-4s-4 1.794-4 4 1.794 4 4 4c.833 0 1.605-.257 2.246-.693l1.974 1.973c.146.147.338.22.53.22s.384-.073.53-.22c.293-.293.293-.767 0-1.06m-7.78-4.22c0-1.379 1.121-2.5 2.5-2.5s2.5 1.121 2.5 2.5-1.121 2.5-2.5 2.5-2.5-1.121-2.5-2.5"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="m16.34 5.28-3.62-3.62c-.418-.42-.998-.66-1.591-.66H5.25C4.01 1 3 2.01 3 3.25v12.5C3 16.99 4.01 18 5.25 18H9c.414 0 .75-.336.75-.75s-.336-.75-.75-.75H5.25c-.413 0-.75-.337-.75-.75V3.25c0-.413.337-.75.75-.75H10v3.25C10 6.99 11.01 8 12.25 8h3.25v.5c0 .414.336.75.75.75s.75-.336.75-.75V6.871c0-.592-.24-1.172-.66-1.59m-4.84.47V2.614c.055.032.113.06.158.106l3.622 3.62c.046.046.074.105.106.16H12.25c-.413 0-.75-.337-.75-.75"
      />
    </svg>
  );
}

export type PreviewIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PreviewIcon = createIcon(PreviewIconSvg);
export default PreviewIcon;
