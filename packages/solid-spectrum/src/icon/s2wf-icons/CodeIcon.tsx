/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Code.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Code.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CodeIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M5.5 14.5c-.192 0-.384-.073-.53-.22l-3.75-3.75c-.293-.293-.293-.767 0-1.06l3.75-3.75c.293-.293.767-.293 1.06 0s.293.767 0 1.06L2.81 10l3.22 3.22c.293.293.293.767 0 1.06-.146.147-.338.22-.53.22M14.5 14.5c-.192 0-.384-.073-.53-.22-.293-.293-.293-.767 0-1.06L17.19 10l-3.22-3.22c-.293-.293-.293-.767 0-1.06s.767-.293 1.06 0l3.75 3.75c.293.293.293.767 0 1.06l-3.75 3.75c-.146.147-.338.22-.53.22M8.229 18q-.09 0-.177-.02c-.404-.098-.65-.503-.554-.906l3.5-14.5c.098-.403.51-.645.905-.553.404.097.65.502.554.905l-3.5 14.5c-.083.344-.39.574-.728.574"
      />
    </svg>
  );
}

export type CodeIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CodeIcon = createIcon(CodeIconSvg);
export default CodeIcon;
