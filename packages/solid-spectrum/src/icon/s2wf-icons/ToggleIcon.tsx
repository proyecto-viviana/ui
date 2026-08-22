/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Toggle.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Toggle.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ToggleIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M14.985 9h-9.97C2.8 9 1 7.206 1 5s1.8-4 4.015-4h9.97C17.2 1 19 2.794 19 5s-1.8 4-4.015 4m-9.97-6.5C3.628 2.5 2.5 3.621 2.5 5s1.128 2.5 2.515 2.5h9.97C16.372 7.5 17.5 6.379 17.5 5s-1.128-2.5-2.515-2.5z"
        opacity="0.3"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M5 9C2.794 9 1 7.206 1 5s1.794-4 4-4 4 1.794 4 4-1.794 4-4 4m0-6.5C3.621 2.5 2.5 3.621 2.5 5S3.621 7.5 5 7.5 7.5 6.379 7.5 5 6.379 2.5 5 2.5M19 14c0-2.206-1.8-4-4.015-4h-9.97C2.8 10 1 11.794 1 14s1.8 4 4.015 4h9.7c.071.004.139.021.212.021.554 0 1.082-.113 1.562-.318C17.96 17.108 19 15.676 19 14m-4.015 2.5h-.27c-1.279-.11-2.288-1.172-2.288-2.479 0-1.378 1.12-2.5 2.5-2.5s2.5 1.122 2.5 2.5c0 1.032-.628 1.918-1.521 2.3-.286.112-.595.179-.92.179M2.5 14c0-1.379 1.128-2.5 2.515-2.5h6.832c-.566.69-.92 1.56-.92 2.521 0 .941.34 1.795.885 2.479H5.015C3.628 16.5 2.5 15.379 2.5 14"
      />
    </svg>
  );
}

export type ToggleIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ToggleIcon = createIcon(ToggleIconSvg);
export default ToggleIcon;
