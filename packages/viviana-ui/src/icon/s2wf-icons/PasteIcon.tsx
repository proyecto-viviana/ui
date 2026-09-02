/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Paste.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Paste.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PasteIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <circle
        cx="10"
        cy="4"
        r="1"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M15.75 18H4.25C3.01 18 2 16.99 2 15.75v-9.5C2 5.01 3.01 4 4.25 4h2.252c.026-.925.407-1.783 1.079-2.426.696-.666 1.62-1.016 2.576-.966C11.91.685 13.352 2.18 13.49 4h2.261C16.99 4 18 5.01 18 6.25v9.5c0 1.24-1.01 2.25-2.25 2.25M4.25 5.5c-.413 0-.75.337-.75.75v9.5c0 .413.337.75.75.75h11.5c.413 0 .75-.337.75-.75v-9.5c0-.413-.337-.75-.75-.75H15v1.25C15 7.99 13.99 9 12.75 9h-5.5C6.01 9 5 7.99 5 6.75L4.964 5.5zm2.25 0v1.25c0 .413.337.75.75.75h5.5c.413 0 .75-.337.75-.75V5.5h-.75c-.414 0-.75-.336-.75-.75v-.466c0-1.155-.856-2.132-1.908-2.178-.558-.012-1.076.171-1.474.552S8 3.553 8 4.105v.645c0 .414-.336.75-.75.75z"
      />
    </svg>
  );
}

export type PasteIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PasteIcon = createIcon(PasteIconSvg);
export default PasteIcon;
