/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Maximize.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Maximize.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function MaximizeIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M9.03 10.97c-.293-.293-.767-.293-1.06 0L3.5 15.44v-2.433c0-.414-.336-.75-.75-.75s-.75.336-.75.75v4.243c0 .414.336.75.75.75h4.243c.414 0 .75-.336.75-.75s-.336-.75-.75-.75H4.56l4.47-4.47c.292-.293.292-.767 0-1.06M18 2.75v4.243c0 .414-.336.75-.75.75s-.75-.336-.75-.75V4.56l-4.47 4.47c-.146.146-.338.219-.53.219s-.384-.073-.53-.22c-.293-.293-.293-.767 0-1.06l4.47-4.47h-2.433c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h4.243c.414 0 .75.336.75.75"
      />
    </svg>
  );
}

export type MaximizeIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const MaximizeIcon = createIcon(MaximizeIconSvg);
export default MaximizeIcon;
