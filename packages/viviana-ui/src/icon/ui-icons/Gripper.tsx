/*
 * Auto-generated from the shipped @react-spectrum/s2 dist assets (SVGO-
 * optimized — pixel parity requires the shipped path data, not the raw
 * vendored .svg sources). Variants absent from the dist (Arrow, Gripper)
 * fall back to the vendored sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createUIIcon } from "../spectrum-icon";

export type GripperProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: "M";
};

function Gripper_MSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, width: _width, height: _height, ...rest } = props;
  return (
    <svg
      id="b"
      data-name="ICONS"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="4"
      viewBox="0 0 24 4"
      {...rest}
      class={className}
    >
      <path
        d="M22,4H2c-1.10449,0-2-.89551-2-2S.89551,0,2,0h20c1.10449,0,2,.89551,2,2s-.89551,2-2,2Z"
        fill="var(--iconPrimary, #222)"
        stroke-width="0"
      />
    </svg>
  );
}

const Gripper_M = createUIIcon(Gripper_MSvg);

export default function Gripper(props: GripperProps): JSX.Element {
  const { size = "M", class: className, width: _width, height: _height, ...rest } = props;
  switch (size) {
    case "M":
      return <Gripper_M {...rest} class={className} />;
    default:
      return <Gripper_M {...rest} class={className} />;
  }
}

export const GripperIcon = Gripper;
