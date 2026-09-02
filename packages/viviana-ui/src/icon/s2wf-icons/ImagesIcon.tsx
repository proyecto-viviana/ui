/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Images.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Images.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ImagesIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M17.022 6H5.978C4.887 6 4 6.848 4 7.89v7.22C4 16.152 4.887 17 5.978 17h11.044C18.113 17 19 16.152 19 15.11V7.89C19 6.848 18.113 6 17.022 6M5.978 7.5h11.044c.26 0 .478.179.478.39v5.734l-1.333-1.346c-.757-.763-2.076-.762-2.831 0l-1.024 1.036h-.11l-2.69-2.716c-.755-.764-2.075-.762-2.83 0L5.5 11.792V7.89c0-.211.219-.39.478-.39m0 8c-.26 0-.478-.179-.478-.39v-1.185l2.247-2.271c.189-.189.51-.19.7 0l2.689 2.715c.596.604 1.642.607 2.242 0l1.024-1.035c.188-.189.511-.19.699 0l2.11 2.132q-.087.033-.189.034z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M1.75 14c-.414 0-.75-.336-.75-.75V4.89C1 3.848 1.866 3 2.932 3H14.75c.414 0 .75.336.75.75s-.336.75-.75.75H2.932c-.239 0-.432.175-.432.39v8.36c0 .414-.336.75-.75.75"
      />
      <circle
        cx="14.29"
        cy="9.75"
        r="1.1"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
    </svg>
  );
}

export type ImagesIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ImagesIcon = createIcon(ImagesIconSvg);
export default ImagesIcon;
