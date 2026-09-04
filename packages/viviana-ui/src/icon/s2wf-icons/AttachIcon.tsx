/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Attach.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Attach.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function AttachIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M7.026 18.898h-.001c-1.342 0-2.603-.522-3.548-1.47-.947-.946-1.469-2.206-1.469-3.549s.522-2.603 1.469-3.55l8.012-8c.79-.791 1.804-1.227 2.853-1.227 1.02 0 1.897.358 2.603 1.064.784.785 1.155 1.802 1.043 2.866-.097.925-.543 1.828-1.258 2.541l-5.336 5.322c-.072.078-.904.94-2.01.96-.604.019-1.158-.23-1.622-.693-1.21-1.21-.856-2.649.032-3.537L12.3 5.103c.292-.292.767-.294 1.06-.001.294.292.295.767.002 1.06l-4.507 4.523c-.33.331-.604.844-.033 1.416.232.231.431.262.531.254.4-.005.841-.376.965-.505l5.353-5.339c.464-.463.765-1.06.826-1.636.065-.622-.142-1.176-.613-1.648-.42-.42-.925-.625-1.542-.625-.648 0-1.285.28-1.793.788l-8.012 8c-.663.663-1.029 1.547-1.029 2.49 0 .94.366 1.825 1.03 2.489.663.664 1.546 1.029 2.487 1.03.943 0 1.827-.366 2.49-1.03l6.974-6.973c.293-.293.767-.293 1.06 0s.293.768 0 1.06l-6.973 6.973c-.947.947-2.207 1.47-3.55 1.47"
      />
    </svg>
  );
}

export type AttachIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const AttachIcon = createIcon(AttachIconSvg);
export default AttachIcon;
