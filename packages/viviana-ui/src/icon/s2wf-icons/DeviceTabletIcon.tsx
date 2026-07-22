/*
 * Auto-generated from vendored React Spectrum S2 icon sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function DeviceTabletIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <circle cx="5" cy="9.99798" r="1" fill="var(--iconPrimary, #222)" stroke-width="0" />
      <path
        d="M3.25,2.99805h13.5c1.24023,0,2.25,1.00977,2.25,2.25v9.5c0,1.24023-1.00977,2.25-2.25,2.25H3.25c-1.24023,0-2.25-1.00977-2.25-2.25V5.24805c0-1.24023,1.00977-2.25,2.25-2.25ZM16.75,15.49805c.41309,0,.75-.33691.75-.75V5.24805c0-.41309-.33691-.75-.75-.75H3.25c-.41309,0-.75.33691-.75.75v9.5c0,.41309.33691.75.75.75h13.5Z"
        fill="var(--iconPrimary, #222)"
        stroke-width="0"
      />
    </svg>
  );
}

export type DeviceTabletIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const DeviceTabletIcon = createIcon(DeviceTabletIconSvg);
export default DeviceTabletIcon;
