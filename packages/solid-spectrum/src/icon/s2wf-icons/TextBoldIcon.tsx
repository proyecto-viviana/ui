/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/TextBold.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/TextBold.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function TextBoldIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M13.99 2.015H5.51C4.127 2.015 3 3.192 3 4.64v1.11c0 .621.504 1.125 1.125 1.125S5.25 6.371 5.25 5.75V4.64c0-.221.138-.375.26-.375H8V15.71l.001.015H7.43c-.621 0-1.125.504-1.125 1.125s.504 1.125 1.125 1.125h4.64c.621 0 1.125-.504 1.125-1.125s-.504-1.125-1.125-1.125H11.5l.001-.015V4.265h2.49c.122 0 .26.154.26.375v1.11c0 .621.504 1.125 1.125 1.125S16.5 6.371 16.5 5.75V4.64c0-1.448-1.126-2.625-2.51-2.625"
      />
    </svg>
  );
}

export type TextBoldIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const TextBoldIcon = createIcon(TextBoldIconSvg);
export default TextBoldIcon;
