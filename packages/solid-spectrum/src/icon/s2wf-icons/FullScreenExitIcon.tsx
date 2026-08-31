/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/FullScreenExit.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/FullScreenExit.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function FullScreenExitIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M12.75 15h-5.5C6.01 15 5 13.99 5 12.75v-5.5C5 6.01 6.01 5 7.25 5h5.5C13.99 5 15 6.01 15 7.25v5.5c0 1.24-1.01 2.25-2.25 2.25m-5.5-8.5c-.414 0-.75.336-.75.75v5.5c0 .414.336.75.75.75h5.5c.414 0 .75-.336.75-.75v-5.5c0-.414-.336-.75-.75-.75zM19 4.5h-2.25c-.69 0-1.25-.56-1.25-1.25V1c0-.414.336-.75.75-.75S17 .586 17 1v2h2c.414 0 .75.336.75.75s-.336.75-.75.75M3.25 4.5H1c-.414 0-.75-.336-.75-.75S.586 3 1 3h2V1c0-.414.336-.75.75-.75s.75.336.75.75v2.25c0 .69-.56 1.25-1.25 1.25M3.75 19.75c-.414 0-.75-.336-.75-.75v-2H1c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h2.25c.69 0 1.25.56 1.25 1.25V19c0 .414-.336.75-.75.75M3.25 17h.01zM16.25 19.75c-.414 0-.75-.336-.75-.75v-2.25c0-.69.56-1.25 1.25-1.25H19c.414 0 .75.336.75.75s-.336.75-.75.75h-2v2c0 .414-.336.75-.75.75"
      />
    </svg>
  );
}

export type FullScreenExitIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const FullScreenExitIcon = createIcon(FullScreenExitIconSvg);
export default FullScreenExitIcon;
