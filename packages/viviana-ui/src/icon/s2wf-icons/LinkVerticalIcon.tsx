/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/LinkVertical.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/LinkVertical.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function LinkVerticalIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 19c-2.068 0-3.75-1.682-3.75-3.75v-4.209c0-2.068 1.682-3.75 3.75-3.75.28 0 .56.031.832.093.403.09.657.492.566.896-.09.405-.49.66-.897.567Q10.253 8.79 10 8.79c-1.24 0-2.25 1.01-2.25 2.25v4.209c0 1.24 1.01 2.25 2.25 2.25s2.25-1.01 2.25-2.25v-1.709c0-.414.336-.75.75-.75s.75.336.75.75v1.709c0 2.068-1.682 3.75-3.75 3.75m3.75-9.959V4.883c0-2.068-1.682-3.75-3.75-3.75s-3.75 1.682-3.75 3.75V6.54c0 .414.336.75.75.75s.75-.336.75-.75V4.883c0-1.24 1.01-2.25 2.25-2.25s2.25 1.01 2.25 2.25V9.04c0 1.24-1.01 2.25-2.25 2.25q-.253 0-.501-.056c-.403-.092-.806.163-.897.567s.163.805.566.896c.273.062.553.093.832.093 2.068 0 3.75-1.682 3.75-3.75"
      />
    </svg>
  );
}

export type LinkVerticalIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const LinkVerticalIcon = createIcon(LinkVerticalIconSvg);
export default LinkVerticalIcon;
