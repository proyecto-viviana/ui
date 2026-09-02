/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Move.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Move.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function MoveIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m18.783 9.47-2.25-2.25c-.293-.293-.767-.293-1.06 0s-.293.767 0 1.06l.97.97H10.75V3.558l.97.97c.146.146.338.22.53.22s.384-.074.53-.22c.293-.294.293-.768 0-1.061l-2.25-2.25c-.293-.293-.767-.293-1.06 0l-2.25 2.25c-.293.293-.293.767 0 1.06s.767.293 1.06 0l.97-.97V9.25H3.558l.97-.97c.292-.293.292-.767 0-1.06s-.768-.293-1.061 0l-2.25 2.25c-.293.293-.293.767 0 1.06l2.25 2.25c.146.147.338.22.53.22s.384-.073.53-.22c.293-.293.293-.767 0-1.06l-.97-.97H9.25v5.692l-.97-.97c-.293-.292-.767-.292-1.06 0s-.293.768 0 1.061l2.25 2.25c.146.147.338.22.53.22s.384-.073.53-.22l2.25-2.25c.293-.293.293-.767 0-1.06s-.767-.293-1.06 0l-.97.97V10.75h5.692l-.97.97c-.292.293-.292.767 0 1.06.147.147.339.22.53.22s.385-.073.531-.22l2.25-2.25c.293-.293.293-.767 0-1.06"
      />
    </svg>
  );
}

export type MoveIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const MoveIcon = createIcon(MoveIconSvg);
export default MoveIcon;
