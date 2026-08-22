/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Animation.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Animation.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function AnimationIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M1 13.5C1 10.468 3.467 8 6.5 8s5.5 2.468 5.5 5.5S9.533 19 6.5 19 1 16.532 1 13.5m1.5 0c0 2.206 1.794 4 4 4s4-1.794 4-4-1.794-4-4-4-4 1.794-4 4M14.097 12.72q.124 0 .247-.041C15.933 12.126 17 10.629 17 8.954 17 6.774 15.226 5 13.046 5c-1.18 0-2.29.526-3.047 1.444-.116.141-.172.31-.172.478 0 .216.093.43.273.579.32.264.793.218 1.056-.102.47-.57 1.16-.899 1.89-.899 1.353 0 2.454 1.1 2.454 2.454 0 1.037-.663 1.965-1.65 2.309-.309.107-.503.397-.503.708q0 .122.042.247c.108.31.398.503.708.503M17.885 5.832c.241 0 .478-.116.623-.331.32-.478.49-1.033.49-1.61 0-1.591-1.295-2.887-2.887-2.887-1.048 0-2.014.576-2.524 1.505-.199.362-.066.818.297 1.017.364.2.82.068 1.019-.297.245-.447.708-.725 1.208-.725.765 0 1.387.622 1.387 1.388 0 .276-.081.544-.235.771-.23.344-.14.81.204 1.041.129.087.274.128.418.128"
      />
    </svg>
  );
}

export type AnimationIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const AnimationIcon = createIcon(AnimationIconSvg);
export default AnimationIcon;
