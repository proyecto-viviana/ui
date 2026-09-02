/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Mention.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Mention.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function MentionIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10.715 18.98c-4.963 0-9-4.037-9-9 0-4.956 4.027-8.99 8.98-9.001h.042c2.51.029 4.634.91 5.984 2.481 1.3 1.514 1.803 3.588 1.456 5.996-.629 4.367-4.557 5.485-8.026 5.068-1.361-.196-3.831-1.494-3.565-5.019.124-1.651.741-2.887 1.832-3.674 1.99-1.432 4.794-.748 4.912-.718.352.089.59.418.565.78l-.497 6.979c1.487-.384 2.967-1.353 3.295-3.63.283-1.967-.1-3.628-1.11-4.805-1.069-1.244-2.803-1.94-4.885-1.958-4.128.01-7.483 3.37-7.483 7.5 0 4.137 3.364 7.502 7.5 7.502.414 0 .75.336.75.75s-.336.75-.75.75m.88-12.557c-.728 0-1.614.129-2.304.63-.713.515-1.12 1.378-1.209 2.565-.222 2.937 2.015 3.38 2.27 3.42.341.041.891.084 1.527.054l.471-6.625c-.214-.025-.473-.044-.754-.044"
      />
    </svg>
  );
}

export type MentionIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const MentionIcon = createIcon(MentionIconSvg);
export default MentionIcon;
