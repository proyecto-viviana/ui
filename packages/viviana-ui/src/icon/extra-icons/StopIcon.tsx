/* Viviana editor glyphs. Not part of the S2 workflow set. */
import type { JSX } from "@solidjs/web";
import { createIcon } from "../spectrum-icon";
import { splitProps } from "@proyecto-viviana/solidaria/utils";

function StopIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <rect
        x="4.25"
        y="4.25"
        width="11.5"
        height="11.5"
        rx="1.25"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
    </svg>
  );
}

export type StopIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const StopIcon = createIcon(StopIconSvg);
export default StopIcon;
