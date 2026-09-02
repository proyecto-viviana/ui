/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/ChevronRight.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/ChevronRight.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ChevronRightIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M7.75 16.465c-.187 0-.374-.07-.52-.21-.298-.287-.308-.762-.02-1.06l4.999-5.197-4.986-5.184c-.288-.297-.279-.772.02-1.06.296-.286.774-.278 1.06.021L13.79 9.48c.28.29.28.749 0 1.039l-5.5 5.716c-.146.154-.344.23-.54.23"
      />
    </svg>
  );
}

export type ChevronRightIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ChevronRightIcon = createIcon(ChevronRightIconSvg);
export default ChevronRightIcon;
