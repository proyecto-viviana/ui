/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/TextAlignRight.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/TextAlignRight.cjs

import type { JSX } from "@solidjs/web";
import { createIcon } from "../spectrum-icon";
import { splitProps } from "@proyecto-viviana/solidaria/utils";

function TextAlignRightIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.25 4.5H3.75c-.414 0-.75-.336-.75-.75S3.336 3 3.75 3h12.5c.414 0 .75.336.75.75s-.336.75-.75.75M16.25 8.5h-10c-.414 0-.75-.336-.75-.75S5.836 7 6.25 7h10c.414 0 .75.336.75.75s-.336.75-.75.75M16.25 12.5H3.75c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h12.5c.414 0 .75.336.75.75s-.336.75-.75.75M16.25 16.5h-10c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h10c.414 0 .75.336.75.75s-.336.75-.75.75"
      />
    </svg>
  );
}

export type TextAlignRightIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const TextAlignRightIcon = createIcon(TextAlignRightIconSvg);
export default TextAlignRightIcon;
