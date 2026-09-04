/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Wallet.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Wallet.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function WalletIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M4.128 6.072c-.332 0-.635-.221-.724-.558-.147-.556-.069-1.136.22-1.633s.755-.853 1.31-1l6.786-1.796c1.152-.306 2.329.383 2.633 1.531L15 5.064c.106.4-.132.812-.532.917-.395.11-.81-.13-.917-.532L12.903 3c-.092-.349-.446-.56-.799-.466L5.32 4.331c-.348.093-.557.451-.465.8.106.4-.132.81-.534.916q-.095.025-.192.025M18.25 10h-.326c-.349-1.71-1.863-3-3.674-3h-11C2.01 7 1 8.01 1 9.25v6.5C1 16.99 2.01 18 3.25 18h11c1.81 0 3.325-1.29 3.674-3h.326c.414 0 .75-.336.75-.75v-3.5c0-.414-.336-.75-.75-.75m-.75 3.5h-3v-2h3zm-3.25 3h-11c-.413 0-.75-.337-.75-.75v-6.5c0-.413.337-.75.75-.75h11c.976 0 1.801.63 2.112 1.5H13.75c-.414 0-.75.336-.75.75v3.5c0 .414.336.75.75.75h2.612c-.311.87-1.136 1.5-2.112 1.5"
      />
    </svg>
  );
}

export type WalletIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const WalletIcon = createIcon(WalletIconSvg);
export default WalletIcon;
