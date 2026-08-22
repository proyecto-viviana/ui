/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Share.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Share.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ShareIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m13.527 5.49-3.002-2.997c-.293-.292-.767-.293-1.06 0L6.467 5.491c-.293.293-.293.767 0 1.06.147.147.339.22.53.22s.384-.073.53-.22L9.25 4.83v8.181c0 .414.336.75.75.75s.75-.336.75-.75V4.837l1.718 1.715c.293.292.767.293 1.06-.001.293-.293.293-.768 0-1.06"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M15.75 18.021H4.25c-1.24 0-2.25-1.01-2.25-2.25v-5.75c0-.414.336-.75.75-.75s.75.336.75.75v5.75c0 .414.336.75.75.75h11.5c.414 0 .75-.336.75-.75v-5.75c0-.414.336-.75.75-.75s.75.336.75.75v5.75c0 1.24-1.01 2.25-2.25 2.25"
      />
    </svg>
  );
}

export type ShareIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ShareIcon = createIcon(ShareIconSvg);
export default ShareIcon;
