/* Viviana editor glyphs. Not part of the S2 workflow set. */
import type { JSX } from "@solidjs/web";
import { createIcon } from "../spectrum-icon";
import { splitProps } from "@proyecto-viviana/solidaria/utils";

function EasingHoldIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const [local, rest] = splitProps(props, ["class"]);
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 20 20"
      {...rest}
      class={local.class}
    >
      <path
        fill="none"
        stroke="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        stroke-width="1.75"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M3.5 16.5H16.5V3.5"
      />
    </svg>
  );
}

export type EasingHoldIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const EasingHoldIcon = createIcon(EasingHoldIconSvg);
export default EasingHoldIcon;
