/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/VectorDraw.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/VectorDraw.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function VectorDrawIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m17.678 5.251-2.96-2.959c-.849-.85-2.332-.85-3.182 0L10.29 3.539q-.009.012-.016.024L5.79 6.01c-.574.314-1.02.823-1.253 1.435L1.22 16.162c-.278.733-.1 1.563.454 2.118.382.382.89.584 1.408.584.251 0 .503-.047.745-.143L13.075 15c.623-.25 1.133-.719 1.435-1.322l2.078-4.157 1.09-1.09c.877-.875.877-2.303 0-3.181m-4.51 7.757c-.137.274-.368.487-.652.6L4.08 17.001l4.262-4.262c.053.008.101.032.157.032.69 0 1.25-.56 1.25-1.25s-.56-1.25-1.25-1.25-1.25.56-1.25 1.25c0 .056.025.104.032.158l-4.44 4.44 3.097-8.14c.106-.279.309-.511.57-.654l4.357-2.377 4.222 4.222zm3.45-5.636-.604.603-4.02-4.02.603-.602c.283-.284.777-.284 1.06 0l2.96 2.959c.292.292.292.768 0 1.06"
      />
    </svg>
  );
}

export type VectorDrawIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const VectorDrawIcon = createIcon(VectorDrawIconSvg);
export default VectorDrawIcon;
