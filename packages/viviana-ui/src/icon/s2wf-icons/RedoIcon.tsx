/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Redo.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Redo.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function RedoIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M7.743 5h8.449l-1.72-1.72c-.293-.293-.293-.767 0-1.06s.768-.293 1.06 0l2.998 2.997c.293.293.293.767 0 1.06L15.534 9.28c-.146.147-.338.22-.53.22s-.384-.073-.53-.22c-.294-.292-.294-.767-.001-1.06l1.717-1.72H7.743c-2.482 0-4.5 2.019-4.5 4.5s2.018 4.5 4.5 4.5h3.737c.415 0 .75.336.75.75s-.335.75-.75.75H7.743c-3.309 0-6-2.691-6-6s2.691-6 6-6"
      />
    </svg>
  );
}

export type RedoIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const RedoIcon = createIcon(RedoIconSvg);
export default RedoIcon;
