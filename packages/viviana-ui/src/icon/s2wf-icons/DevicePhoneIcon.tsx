/*
 * Auto-generated from vendored React Spectrum S2 icon sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function DevicePhoneIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <circle cx="10" cy="15" r="1" fill="var(--iconPrimary, #222)" />
      <path
        d="m13.75,19h-7.5c-1.24023,0-2.25-1.00977-2.25-2.25V3.25c0-1.24023,1.00977-2.25,2.25-2.25h7.5c1.24023,0,2.25,1.00977,2.25,2.25v13.5c0,1.24023-1.00977,2.25-2.25,2.25ZM6.25,2.5c-.41309,0-.75.33691-.75.75v13.5c0,.41309.33691.75.75.75h7.5c.41309,0,.75-.33691.75-.75V3.25c0-.41309-.33691-.75-.75-.75h-7.5Z"
        fill="var(--iconPrimary, #222)"
      />
    </svg>
  );
}

export type DevicePhoneIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const DevicePhoneIcon = createIcon(DevicePhoneIconSvg);
export default DevicePhoneIcon;
