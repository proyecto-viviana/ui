/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: react-spectrum/packages/@react-spectrum/s2/ui-icons/Gripper.tsx
// Generator input: packages/solid-spectrum/src/icon/assets/ui-icons/S2_GripperSize100.svg

import type { JSX } from "@solidjs/web";
import { createUIIcon } from "../spectrum-icon";
import { style } from "../../style" with { type: "macro" };
import { splitProps } from "@proyecto-viviana/solidaria/utils";

const styles = style({
  width: {
    size: {
      M: 24,
    },
  },
  height: {
    size: {
      M: 4,
    },
  },
});

export type GripperProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: "M";
};

function Gripper_MSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "width", "height"]);
  return (
    <svg
      id="b"
      data-name="ICONS"
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="4"
      viewBox="0 0 24 4"
      {...rest}
      class={local.class}
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
  const [local, rest] = splitProps(props, ["size", "class", "width", "height"]);
  const size = local.size ?? "M";
  const mergedClass = () => `${local.class ?? ""}${styles({ size })}`;
  switch (size) {
    case "M":
      return <Gripper_M {...rest} class={mergedClass()} />;
    default:
      return <Gripper_M {...rest} class={mergedClass()} />;
  }
}

export const GripperIcon = Gripper;
