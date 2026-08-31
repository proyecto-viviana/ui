/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/CheckBox.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/CheckBox.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CheckBoxIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M14.45 5.645c-.336-.247-.804-.171-1.049.162l-4.539 6.197L7.2 9.864c-.254-.327-.722-.386-1.053-.134-.327.255-.386.726-.132 1.053l2.273 2.927c.018.023.044.031.064.051.03.031.05.068.086.094.026.02.056.028.084.043q.034.02.071.037c.093.039.19.065.287.065h.002c.1 0 .2-.028.295-.07q.039-.016.075-.04c.03-.017.061-.026.089-.047.035-.028.055-.066.084-.098.019-.02.045-.03.061-.052l5.127-7c.244-.334.172-.803-.162-1.048"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M15.25 18H4.75C3.233 18 2 16.767 2 15.25V4.75C2 3.233 3.233 2 4.75 2h10.5C16.767 2 18 3.233 18 4.75v10.5c0 1.517-1.233 2.75-2.75 2.75M4.75 3.5c-.69 0-1.25.56-1.25 1.25v10.5c0 .69.56 1.25 1.25 1.25h10.5c.69 0 1.25-.56 1.25-1.25V4.75c0-.69-.56-1.25-1.25-1.25z"
      />
    </svg>
  );
}

export type CheckBoxIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CheckBoxIcon = createIcon(CheckBoxIconSvg);
export default CheckBoxIcon;
