/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/ChartTrend.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/ChartTrend.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ChartTrendIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M3 17.75c-.155 0-.312-.048-.445-.146-.334-.247-.405-.716-.159-1.05l2.298-3.113c.238-.322.69-.402 1.022-.176l2.05 1.379 1.621-6.985c.07-.299.314-.524.617-.571.304-.049.604.097.76.36l1.932 3.277 3.62-8.034c.17-.378.614-.545.992-.375s.546.615.376.993l-4.215 9.352c-.115.255-.363.425-.643.44-.276.03-.545-.126-.687-.368l-1.715-2.908-1.444 6.219c-.056.24-.226.437-.456.528-.23.09-.488.063-.693-.076L5.475 14.91l-1.871 2.535c-.147.2-.374.305-.604.305"
      />
    </svg>
  );
}

export type ChartTrendIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ChartTrendIcon = createIcon(ChartTrendIconSvg);
export default ChartTrendIcon;
