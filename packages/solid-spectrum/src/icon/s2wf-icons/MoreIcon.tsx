/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/More.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/More.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function MoreIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        cy="10.021"
        r="1.5"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M10 8.5c-.828 0-1.5.672-1.5 1.5s.672 1.5 1.5 1.5 1.5-.672 1.5-1.5-.672-1.5-1.5-1.5"
      />
      <circle
        cx="4"
        cy="10.021"
        r="1.5"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <circle
        cx="4"
        cy="10"
        r="1.5"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <circle
        cx="16"
        cy="10.021"
        r="1.5"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
      <circle
        cx="16"
        cy="10"
        r="1.5"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
    </svg>
  );
}

export type MoreIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const MoreIcon = createIcon(MoreIconSvg);
export default MoreIcon;
