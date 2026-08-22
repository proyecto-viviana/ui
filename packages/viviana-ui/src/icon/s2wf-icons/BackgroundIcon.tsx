/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Background.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Background.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function BackgroundIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M15.752 2H4.262C3.024 2 2.016 3.01 2.016 4.25v4.704L2 8.97l.015.014v5.274L2 14.27l.015.015v1.464c0 1.24 1.008 2.25 2.248 2.25h11.49C16.99 18 18 16.99 18 15.75V4.25C18 3.01 16.991 2 15.752 2m.75 8.447L10.454 16.5h-3.18l9.226-9.234zM3.512 4.25c0-.413.337-.75.75-.75h3.2l-3.95 3.954zm0 5.325L9.583 3.5h3.179l-9.249 9.257zm0 6.175v-.872L14.881 3.5h.871c.413 0 .75.337.75.75v.895L5.155 16.5h-.893c-.413 0-.75-.337-.75-.75m12.24.75h-3.179l3.927-3.931v3.181c0 .413-.336.75-.749.75"
      />
    </svg>
  );
}

export type BackgroundIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const BackgroundIcon = createIcon(BackgroundIconSvg);
export default BackgroundIcon;
