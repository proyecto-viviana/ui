/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Flag.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Flag.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function FlagIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M17.69 2.678c-.195-.14-.447-.18-.675-.105l-.587.195c-1.096.305-2.25.285-3.337-.067l-2.727-.88c-1.21-.39-2.504-.459-3.741-.195l-2.123.45V1.75c0-.414-.336-.75-.75-.75S3 1.336 3 1.75v16.5c0 .414.336.75.75.75s.75-.336.75-.75v-4.617l2.433-.516c.984-.206 2.01-.154 2.97.156l2.728.881c.725.234 1.474.352 2.228.352.67 0 1.343-.093 2.006-.28l.62-.205c.307-.1.515-.387.515-.711V3.285c0-.24-.115-.467-.31-.607m-1.19 10.09-.073.024c-1.093.309-2.248.285-3.336-.065l-2.727-.881c-1.208-.39-2.501-.456-3.741-.196L4.5 12.1V3.608l2.434-.515c.982-.208 2.01-.154 2.969.156l2.727.88c1.25.404 2.572.462 3.87.166z"
      />
    </svg>
  );
}

export type FlagIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const FlagIcon = createIcon(FlagIconSvg);
export default FlagIcon;
