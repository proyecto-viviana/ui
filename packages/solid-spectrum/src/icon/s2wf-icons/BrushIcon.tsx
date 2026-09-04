/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Brush.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Brush.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function BrushIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M18.074 1.6c-.528-.44-1.192-.654-1.883-.587-.685.061-1.306.386-1.745.912-.036.043-5.03 6.019-6.693 8.012-.344.016-.693.067-1.042.164-1.973.546-2.687 2.232-3.315 3.718-.501 1.184-.975 2.302-2.003 2.859-.287.154-.44.476-.38.797.06.319.318.564.641.606.936.12 1.977.208 3.024.208 2.16 0 4.351-.372 5.72-1.594.925-.825 1.385-1.937 1.366-3.306-.001-.063-.02-.122-.024-.184l1.206-1.443c2.103-2.517 5.381-6.443 5.455-6.53.912-1.09.765-2.72-.327-3.631M9.4 15.576c-1.052.94-3.109 1.345-5.865 1.18.554-.725.91-1.57 1.241-2.35.57-1.345 1.06-2.506 2.335-2.86.875-.24 1.732-.112 2.354.353.5.375.79.926.799 1.512.012.927-.27 1.636-.864 2.165m7.853-11.308c-.043.05-3.345 4.002-5.458 6.533l-.634.76c-.218-.32-.472-.619-.797-.862-.273-.204-.574-.36-.89-.484 2.01-2.407 6.059-7.251 6.122-7.325.183-.221.443-.357.73-.383.292-.023.566.062.787.247.456.38.518 1.061.14 1.514"
      />
    </svg>
  );
}

export type BrushIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const BrushIcon = createIcon(BrushIconSvg);
export default BrushIcon;
