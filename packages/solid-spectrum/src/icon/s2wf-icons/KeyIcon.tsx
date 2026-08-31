/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Key.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Key.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function KeyIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M2.073 12.668c1.11-1.323 3.243-1.469 5.017-.442l8.566-10.794c.258-.325.73-.377 1.054-.122.325.257.379.73.122 1.053l-.56.707 2.21 1.856c.155.129.25.315.266.516.016.2-.05.4-.183.551l-2.107 2.415c-.148.17-.356.257-.565.257-.171 0-.342-.058-.483-.176l-2.064-1.733-.623.784 2.046 1.716c.317.265.358.74.091 1.057-.148.176-.36.267-.574.267-.17 0-.342-.058-.482-.176L11.79 8.716l-3.526 4.442c.702.736 1.157 1.627 1.254 2.541.091.873-.148 1.7-.675 2.328-.626.745-1.58 1.12-2.61 1.12-1.011 0-2.097-.36-3.02-1.083-1.033-.807-1.694-1.927-1.815-3.07-.09-.873.149-1.7.674-2.326m13.739-5.8 1.12-1.285-1.594-1.338-1.06 1.336zm-12.92 7.969c.076.73.543 1.495 1.246 2.046 1.215.947 2.843 1.031 3.556.18.337-.402.367-.877.332-1.207-.077-.73-.543-1.494-1.247-2.044-.651-.51-1.422-.77-2.106-.77-.591 0-1.12.194-1.45.589-.336.401-.366.878-.331 1.206"
      />
    </svg>
  );
}

export type KeyIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const KeyIcon = createIcon(KeyIconSvg);
export default KeyIcon;
