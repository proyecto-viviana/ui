/* Viviana editor glyphs. Not part of the S2 workflow set. */
import type { JSX } from "@solidjs/web";
import { createIcon } from "../spectrum-icon";
import { splitProps } from "@proyecto-viviana/solidaria/utils";

function KeyframeIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M10 3.25 16.75 10 10 16.75 3.25 10Z"
      />
    </svg>
  );
}

export type KeyframeIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const KeyframeIcon = createIcon(KeyframeIconSvg);
export default KeyframeIcon;
