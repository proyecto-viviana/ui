/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Ruler.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Ruler.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function RulerIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M18.09 4.026 15.975 1.91c-.85-.85-2.334-.85-3.182 0L1.91 12.798c-.877.877-.878 2.305 0 3.182l2.117 2.118c.425.424.99.659 1.591.659s1.166-.235 1.591-.66L18.092 7.209c.876-.878.876-2.305-.001-3.182m-1.06 2.121L6.149 17.037c-.283.283-.778.283-1.06 0L2.97 14.92c-.293-.293-.293-.769 0-1.062l1.01-1.01 1.764 1.764c.146.147.338.22.53.22s.384-.073.53-.22c.293-.293.293-.767 0-1.06L5.04 11.787l1.541-1.541 1.058 1.058c.147.146.339.22.53.22s.384-.074.53-.22c.294-.293.294-.768 0-1.06l-1.058-1.06 1.54-1.54 1.767 1.766c.146.147.338.22.53.22s.384-.073.53-.22c.293-.293.293-.767 0-1.06l-1.766-1.767 1.54-1.541 1.06 1.06c.146.146.338.22.53.22s.384-.074.53-.22c.293-.293.293-.768 0-1.061l-1.06-1.06 1.01-1.011c.142-.142.33-.22.53-.22.201 0 .39.078.531.22l2.117 2.117c.293.292.293.768 0 1.06"
      />
    </svg>
  );
}

export type RulerIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const RulerIcon = createIcon(RulerIconSvg);
export default RulerIcon;
