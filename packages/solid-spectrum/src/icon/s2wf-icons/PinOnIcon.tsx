/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/PinOn.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/PinOn.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PinOnIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M15.787 11.404 14 9.901V5.424c.445-.354.715-.9.715-1.498C14.715 2.864 13.852 2 12.79 2H7.21c-1.06 0-1.923.864-1.923 1.926 0 .598.269 1.144.713 1.497V9.9l-1.775 1.495c-.582.472-.797 1.234-.547 1.94.25.707.897 1.164 1.65 1.164H9.25v2.75c0 .414.336.75.75.75s.75-.336.75-.75V14.5h3.924c.752 0 1.4-.457 1.65-1.164s.034-1.468-.537-1.932m-.878 1.431c-.026.075-.089.165-.235.165H5.327c-.146 0-.209-.09-.235-.165s-.035-.183.089-.283l2.052-1.729c.17-.141.267-.351.267-.573V5c0-.307-.187-.583-.473-.696-.154-.063-.24-.197-.24-.378 0-.235.19-.426.423-.426h5.581c.233 0 .424.191.424.426 0 .18-.086.315-.242.378-.286.113-.473.39-.473.696v5.25c0 .222.098.432.267.574l2.064 1.738c.113.09.105.198.078.273"
      />
    </svg>
  );
}

export type PinOnIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PinOnIcon = createIcon(PinOnIconSvg);
export default PinOnIcon;
