/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Cloud.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Cloud.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CloudIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M15.407 17H3.717c-1.903 0-3.45-1.549-3.45-3.452 0-1.493.966-2.78 2.323-3.25q-.065-.346-.065-.702c0-2.18 1.81-3.953 4.034-3.953q.42 0 .831.087c.637-1.958 2.476-3.346 4.589-3.346 2.67 0 4.844 2.173 4.844 4.844q0 .659-.187 1.298c1.802.532 3.103 2.192 3.103 4.142 0 2.389-1.944 4.332-4.332 4.332M6.559 7.143c-1.397 0-2.534 1.1-2.534 2.453q.001.5.206.965c.1.223.083.482-.044.692s-.349.344-.593.36c-1.025.065-1.828.915-1.828 1.935 0 1.076.876 1.952 1.952 1.952h11.689c1.561 0 2.832-1.27 2.832-2.832 0-1.497-1.178-2.733-2.682-2.814-.255-.014-.485-.157-.611-.377-.127-.222-.132-.493-.014-.718.26-.5.39-1.015.39-1.531 0-1.844-1.5-3.344-3.344-3.344-1.662 0-3.08 1.252-3.297 2.912-.03.235-.172.442-.38.558-.207.117-.459.126-.674.027-.348-.158-.707-.238-1.068-.238"
      />
    </svg>
  );
}

export type CloudIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CloudIcon = createIcon(CloudIconSvg);
export default CloudIcon;
