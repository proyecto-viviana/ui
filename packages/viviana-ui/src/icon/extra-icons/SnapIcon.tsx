/* Viviana editor glyphs. Not part of the S2 workflow set. */
import type { JSX } from "@solidjs/web";
import { createIcon } from "../spectrum-icon";
import { splitProps } from "@proyecto-viviana/solidaria/utils";

function SnapIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        stroke-width="2.2"
        stroke-linecap="round"
        stroke-linejoin="round"
        d="M6.2 4.2v6.2a3.8 3.8 0 0 0 7.6 0V4.2"
      />
    </svg>
  );
}

export type SnapIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const SnapIcon = createIcon(SnapIconSvg);
export default SnapIcon;
