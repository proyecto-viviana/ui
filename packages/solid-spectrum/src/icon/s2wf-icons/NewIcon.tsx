/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/New.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/New.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function NewIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M18 4.25v11.5c0 1.24-1.01 2.25-2.25 2.25H4.25C3.01 18 2 16.99 2 15.75V4.25C2 3.01 3.01 2 4.25 2h11.5C16.99 2 18 3.01 18 4.25m-1.5 0c0-.414-.336-.75-.75-.75H4.25c-.414 0-.75.336-.75.75v11.5c0 .414.336.75.75.75h11.5c.414 0 .75-.336.75-.75z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M13.763 10c0 .421-.342.763-.763.763h-2.237V13c0 .421-.342.763-.763.763s-.763-.342-.763-.763v-2.237H7c-.421 0-.763-.342-.763-.763s.342-.763.763-.763h2.237V7c0-.421.342-.763.763-.763s.763.342.763.763v2.237H13c.421 0 .763.342.763.763"
      />
    </svg>
  );
}

export type NewIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const NewIcon = createIcon(NewIconSvg);
export default NewIcon;
