/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/ChartPie.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/ChartPie.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ChartPieIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 1.25c-2.533 0-4.812 1.089-6.41 2.815-.019.016-.041.023-.058.041s-.022.042-.036.061C2.105 5.717 1.25 7.758 1.25 10c0 2.409.979 4.593 2.559 6.177l.005.009.009.005C5.407 17.771 7.591 18.75 10 18.75c4.825 0 8.75-3.925 8.75-8.75S14.825 1.25 10 1.25m-.75 7.052L5.184 4.596C6.29 3.609 7.695 2.949 9.25 2.789zM4.173 5.704l4.741 4.321-4.54 4.54C3.36 13.318 2.75 11.729 2.75 10c0-1.609.533-3.092 1.423-4.296M10 17.25c-1.73 0-3.318-.61-4.565-1.625l5.095-5.095q.006-.007.01-.015l.015-.01c.026-.029.036-.065.057-.096.027-.041.061-.077.08-.122l.006-.022c.018-.046.02-.094.028-.141.007-.042.024-.082.024-.124V2.789c3.647.376 6.5 3.466 6.5 7.211 0 3.998-3.252 7.25-7.25 7.25"
      />
    </svg>
  );
}

export type ChartPieIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ChartPieIcon = createIcon(ChartPieIconSvg);
export default ChartPieIcon;
