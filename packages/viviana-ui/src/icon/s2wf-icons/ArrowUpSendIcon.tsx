/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/ArrowUpSend.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/ArrowUpSend.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ArrowUpSendIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M14.527 7.467 10.524 3.47c-.294-.294-.768-.292-1.06 0L5.467 7.467c-.293.293-.293.767 0 1.06.146.147.338.22.53.22s.384-.073.53-.22l2.724-2.723v9.946c0 .414.336.75.75.75s.75-.336.75-.75V5.816l2.716 2.711c.294.294.768.292 1.06 0 .293-.293.293-.768 0-1.06"
      />
    </svg>
  );
}

export type ArrowUpSendIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ArrowUpSendIcon = createIcon(ArrowUpSendIconSvg);
export default ArrowUpSendIcon;
