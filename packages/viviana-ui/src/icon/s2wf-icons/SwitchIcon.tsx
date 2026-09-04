/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Switch.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Switch.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function SwitchIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m18.53 13.47-3-3c-.293-.293-.767-.293-1.06 0s-.293.767 0 1.06l1.72 1.72H4c-.414 0-.75.336-.75.75s.336.75.75.75h12.19l-1.72 1.72c-.293.293-.293.767 0 1.06.146.147.338.22.53.22s.384-.073.53-.22l3-3c.293-.293.293-.767 0-1.06M16 5.25H3.81l1.72-1.72c.293-.293.293-.767 0-1.06s-.767-.293-1.06 0l-3 3c-.293.293-.293.767 0 1.06l3 3c.146.147.338.22.53.22s.384-.073.53-.22c.293-.293.293-.767 0-1.06L3.81 6.75H16c.414 0 .75-.336.75-.75s-.336-.75-.75-.75"
      />
    </svg>
  );
}

export type SwitchIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const SwitchIcon = createIcon(SwitchIconSvg);
export default SwitchIcon;
