/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/TextHighlight.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/TextHighlight.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function TextHighlightIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m18.558 2.952-1.51-1.51c-.862-.862-2.223-.93-3.158-.154L7.042 6.87c-.307.258-.543.591-.687.966l-.65 1.714-.006.013q-.067.173-.195.302l-1.442 1.442c-.54.54-.665 1.341-.38 2.006L1.275 15.72c-.214.215-.278.537-.163.817.117.28.39.463.694.463h3.901c.2 0 .39-.08.53-.22l.46-.459c.227.097.47.148.712.148.466 0 .932-.177 1.286-.532l1.442-1.44q.13-.13.3-.195l1.73-.657c.374-.144.707-.38.972-.696l5.571-6.835c.776-.94.71-2.3-.151-3.162M7.634 14.877c-.125.125-.326.123-.451 0l-2.059-2.059c-.125-.125-.125-.328 0-.452l1.375-1.375 2.51 2.51zm9.916-9.714-5.568 6.83c-.093.111-.214.197-.35.25l-1.276.484-3.083-3.083.485-1.275c.052-.137.138-.258.24-.345l6.843-5.577c.159-.13.351-.195.543-.195.219 0 .436.084.603.25l1.51 1.51c.313.313.337.806.053 1.151"
      />
    </svg>
  );
}

export type TextHighlightIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const TextHighlightIcon = createIcon(TextHighlightIconSvg);
export default TextHighlightIcon;
