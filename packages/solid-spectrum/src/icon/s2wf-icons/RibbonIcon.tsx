/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Ribbon.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Ribbon.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function RibbonIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m16.345 16.38-1.928-4.456c1.132-1.132 1.833-2.694 1.833-4.418 0-3.446-2.804-6.25-6.25-6.25S3.75 4.06 3.75 7.506c0 1.724.701 3.286 1.833 4.418l-1.928 4.455c-.103.24-.075.514.073.727s.391.327.657.32l1.858-.103L7.44 18.75c.143.17.354.267.574.267q.058 0 .115-.009c.26-.04.479-.213.579-.456L10 15.41l1.292 3.142c.1.243.32.416.579.456q.058.01.115.01c.22 0 .43-.098.574-.268l1.197-1.426 1.858.103c.267.008.509-.107.657-.32s.176-.488.073-.727M5.25 7.505c0-2.619 2.13-4.75 4.75-4.75s4.75 2.131 4.75 4.75-2.13 4.75-4.75 4.75-4.75-2.13-4.75-4.75m2.542 9.329-.642-.764c-.152-.18-.38-.277-.616-.266l-1.02.056 1.294-2.99c.687.41 1.457.69 2.28.811zm5.674-1.03c-.243-.012-.464.086-.616.266l-.641.764-1.297-3.153c.823-.121 1.593-.402 2.28-.812l1.294 2.991z"
      />
    </svg>
  );
}

export type RibbonIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const RibbonIcon = createIcon(RibbonIconSvg);
export default RibbonIcon;
