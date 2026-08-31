/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/TagBold.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/TagBold.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function TagBoldIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M15.393 11.822c-.326-1.6-1.439-2.903-2.915-3.576.62-.92.85-2.04.631-3.134C12.75 3.31 11.12 2 9.232 2H5.125C4.504 2 4 2.504 4 3.125v13.75C4 17.496 4.504 18 5.125 18h5.197c1.57 0 3.036-.693 4.026-1.902.973-1.192 1.354-2.75 1.045-4.276M6.25 4.25h2.982c.818 0 1.52.548 1.67 1.304.113.56-.035 1.137-.403 1.588-.317.386-.755.608-1.2.608H6.25zm6.355 10.424c-.56.683-1.391 1.076-2.283 1.076H6.25V10h3.928c1.476 0 2.743.954 3.01 2.27.176.874-.03 1.728-.583 2.404"
      />
    </svg>
  );
}

export type TagBoldIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const TagBoldIcon = createIcon(TagBoldIconSvg);
export default TagBoldIcon;
