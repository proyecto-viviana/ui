/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/SwitchVertical.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/SwitchVertical.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function SwitchVerticalIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m9.53 4.47-3-3c-.293-.293-.767-.293-1.06 0l-3 3c-.293.293-.293.767 0 1.06s.767.293 1.06 0l1.72-1.72V16c0 .414.336.75.75.75s.75-.336.75-.75V3.81l1.72 1.72c.146.147.338.22.53.22s.384-.073.53-.22c.293-.293.293-.767 0-1.06M17.53 14.47c-.293-.293-.767-.293-1.06 0l-1.72 1.72V4c0-.414-.336-.75-.75-.75s-.75.336-.75.75v12.19l-1.72-1.72c-.293-.293-.767-.293-1.06 0s-.293.767 0 1.06l3 3c.146.147.338.22.53.22s.384-.073.53-.22l3-3c.293-.293.293-.767 0-1.06"
      />
    </svg>
  );
}

export type SwitchVerticalIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const SwitchVerticalIcon = createIcon(SwitchVerticalIconSvg);
export default SwitchVerticalIcon;
