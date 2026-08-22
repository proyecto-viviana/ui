/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/TextParagraph.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/TextParagraph.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function TextParagraphIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.741 2H7.125c-2.62 0-4.75 2.13-4.75 4.75s2.13 4.75 4.75 4.75H7.5v5.651c0 .414.336.75.75.75s.75-.336.75-.75V3.5h3v13.651c0 .414.336.75.75.75s.75-.336.75-.75V3.5h3.241c.414 0 .75-.336.75-.75s-.336-.75-.75-.75M7.5 10h-.375c-1.792 0-3.25-1.458-3.25-3.25S5.333 3.5 7.125 3.5H7.5z"
      />
    </svg>
  );
}

export type TextParagraphIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const TextParagraphIcon = createIcon(TextParagraphIconSvg);
export default TextParagraphIcon;
