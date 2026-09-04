/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Image.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Image.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ImageIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M14.5 7.521c0 .829-.672 1.5-1.5 1.5s-1.5-.671-1.5-1.5c0-.828.672-1.5 1.5-1.5s1.5.672 1.5 1.5"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M16.75 3H3.25C2.01 3 1 4.01 1 5.25v9.5C1 15.99 2.01 17 3.25 17h13.5c1.24 0 2.25-1.01 2.25-2.25v-9.5C19 4.01 17.99 3 16.75 3M3.25 4.5h13.5c.413 0 .75.337.75.75v8.21l-1.91-1.908c-.876-.877-2.304-.877-3.18 0l-1.232 1.231c-.1.098-.257.097-.355.001L7.591 9.552c-.85-.85-2.332-.85-3.182 0L2.5 11.46V5.25c0-.413.337-.75.75-.75m0 11c-.413 0-.75-.337-.75-.75v-1.168l2.97-2.97c.293-.293.767-.293 1.06 0l3.234 3.234c.681.68 1.792.68 2.473-.001l1.233-1.233c.293-.293.767-.293 1.06 0l2.701 2.701c-.131.112-.296.187-.481.187z"
      />
    </svg>
  );
}

export type ImageIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ImageIcon = createIcon(ImageIconSvg);
export default ImageIcon;
