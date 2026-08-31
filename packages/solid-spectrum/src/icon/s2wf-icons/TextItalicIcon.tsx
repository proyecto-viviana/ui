/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/TextItalic.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/TextItalic.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function TextItalicIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.654 2.756c-.382-.48-.953-.756-1.566-.756H6.04c-.935 0-1.754.597-2.139 1.56l-.557 1.404c-.153.385.035.82.42.973.382.154.82-.034.974-.42l.557-1.403c.058-.143.282-.614.745-.614h3.72l-3.491 13H4.662c-.414 0-.75.336-.75.75s.336.75.75.75h4.64c.414 0 .75-.336.75-.75s-.336-.75-.75-.75H7.823l3.492-13h3.773c.21 0 .335.118.391.188.056.072.143.22.095.425l-.25 1.077c-.094.405.157.807.56.9q.087.02.172.02c.34 0 .65-.234.73-.58l.25-1.077c.139-.598 0-1.217-.382-1.697"
      />
    </svg>
  );
}

export type TextItalicIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const TextItalicIcon = createIcon(TextItalicIconSvg);
export default TextItalicIcon;
