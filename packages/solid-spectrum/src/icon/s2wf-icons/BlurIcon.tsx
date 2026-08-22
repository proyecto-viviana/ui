/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Blur.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Blur.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function BlurIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 18.75c-3.848 0-6.75-2.703-6.75-6.288 0-2.736 2.32-5.784 4.365-8.474.655-.86 1.273-1.67 1.761-2.404.277-.418.97-.418 1.248 0 .488.733 1.106 1.545 1.76 2.404 2.047 2.69 4.366 5.738 4.366 8.474 0 3.585-2.902 6.288-6.75 6.288m0-15.441c-.37.508-.772 1.039-1.19 1.587-1.904 2.501-4.06 5.335-4.06 7.566 0 2.774 2.208 4.788 5.25 4.788s5.25-2.014 5.25-4.788c0-2.23-2.156-5.065-4.06-7.566-.418-.548-.82-1.079-1.19-1.587"
      />
    </svg>
  );
}

export type BlurIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const BlurIcon = createIcon(BlurIconSvg);
export default BlurIcon;
