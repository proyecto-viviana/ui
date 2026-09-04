/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/ChevronUp.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/ChevronUp.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ChevronUpIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M3.545 12.237c0-.196.077-.393.23-.54L9.48 6.21c.29-.28.749-.28 1.039 0l5.716 5.5c.3.287.308.763.02 1.06-.286.298-.76.308-1.059.02L9.998 7.791l-5.184 4.986c-.297.288-.772.279-1.06-.02-.14-.145-.21-.332-.21-.52"
      />
    </svg>
  );
}

export type ChevronUpIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ChevronUpIcon = createIcon(ChevronUpIconSvg);
export default ChevronUpIcon;
