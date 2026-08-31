/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/3D.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/3D.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function Icon3DIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.876 4.84h-.001l-5.749-3.319c-.696-.402-1.559-.4-2.251 0l-5.751 3.32C2.431 5.242 2 5.989 2 6.79v6.64c0 .801.432 1.548 1.125 1.948l5.749 3.32C9.222 18.9 9.611 19 10 19c.39 0 .778-.1 1.125-.3l5.75-3.321c.693-.4 1.125-1.147 1.125-1.948V6.79c0-.8-.43-1.548-1.124-1.95m-7.25-2.02c.115-.067.244-.1.374-.1.129 0 .259.033.375.1l5.285 3.052L10 8.994l-5.664-3.12zM3.875 14.08c-.231-.135-.375-.384-.375-.65V7.126l5.75 3.168v6.889zm12.25 0-5.375 3.102v-6.889l5.75-3.172v6.309c0 .266-.144.515-.375.65"
      />
    </svg>
  );
}

export type Icon3DIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const Icon3DIcon = createIcon(Icon3DIconSvg);
export default Icon3DIcon;
