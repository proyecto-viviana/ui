/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Send.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Send.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function SendIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M18.649 9.974c0-.295-.172-.563-.443-.683L4.058 2.933c-.257-.115-.557-.077-.776.098-.22.177-.323.46-.267.736l1.272 6.241-1.222 6.23c-.049.247.03.5.205.675q.031.03.065.058c.221.174.52.211.776.095l14.098-6.408c.268-.122.44-.39.44-.684m-4.243-.747-8.742.027L4.777 4.9zm-9.589 5.87.852-4.344 8.763-.027z"
      />
    </svg>
  );
}

export type SendIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const SendIcon = createIcon(SendIconSvg);
export default SendIcon;
