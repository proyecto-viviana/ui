/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Prompt.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Prompt.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PromptIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M4.75 14c-.183 0-.367-.066-.512-.201-.302-.282-.319-.757-.037-1.06l2.576-2.765-2.576-2.765c-.282-.304-.265-.778.037-1.06s.78-.266 1.06.037l3.054 3.276c.268.288.268.735 0 1.023l-3.053 3.277C5.15 13.92 4.95 14 4.75 14"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M16.75 17H3.25C2.01 17 1 15.99 1 14.75v-9.5C1 4.01 2.01 3 3.25 3h13.5C17.99 3 19 4.01 19 5.25v9.5c0 1.24-1.01 2.25-2.25 2.25M3.25 4.5c-.413 0-.75.337-.75.75v9.5c0 .413.337.75.75.75h13.5c.413 0 .75-.337.75-.75v-9.5c0-.413-.337-.75-.75-.75z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M15.25 14h-5.5c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h5.5c.414 0 .75.336.75.75s-.336.75-.75.75"
      />
    </svg>
  );
}

export type PromptIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PromptIcon = createIcon(PromptIconSvg);
export default PromptIcon;
