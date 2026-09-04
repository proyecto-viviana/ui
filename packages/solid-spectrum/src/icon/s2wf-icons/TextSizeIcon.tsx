/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/TextSize.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/TextSize.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function TextSizeIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M7.478 2h9.044c1.229 0 2.228 1.01 2.228 2.25v1.11c0 .414-.336.75-.75.75s-.75-.336-.75-.75V4.25c0-.413-.326-.75-.728-.75H12.75v13h1.57c.414 0 .75.336.75.75s-.336.75-.75.75H9.68c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h1.57v-13H7.478c-.402 0-.728.337-.728.75v1.11c0 .414-.336.75-.75.75s-.75-.336-.75-.75V4.25C5.25 3.01 6.249 2 7.478 2"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M2.25 9h5c.827 0 1.5.673 1.5 1.5v.86c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-.86H5.5v6h.586c.414 0 .75.336.75.75s-.336.75-.75.75h-2.64c-.414 0-.75-.336-.75-.75s.336-.75.75-.75H4v-6H2.25v.86c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-.86c0-.827.673-1.5 1.5-1.5"
      />
    </svg>
  );
}

export type TextSizeIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const TextSizeIcon = createIcon(TextSizeIconSvg);
export default TextSizeIcon;
