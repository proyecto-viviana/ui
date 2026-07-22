/*
 * Auto-generated from vendored React Spectrum S2 icon sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function MoreIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <circle cx="10" cy="10.02114" r="1.5" fill="var(--iconPrimary, #222)" />
      <path
        d="m10,8.5c-.82843,0-1.5.67157-1.5,1.5s.67157,1.5,1.5,1.5,1.5-.67157,1.5-1.5-.67157-1.5-1.5-1.5Z"
        fill="var(--iconPrimary, #222)"
      />
      <circle cx="4" cy="10.02114" r="1.5" fill="var(--iconPrimary, #222)" />
      <circle cx="4" cy="10" r="1.5" fill="var(--iconPrimary, #222)" />
      <circle cx="16" cy="10.02114" r="1.5" fill="var(--iconPrimary, #222)" />
      <circle cx="16" cy="10" r="1.5" fill="var(--iconPrimary, #222)" />
    </svg>
  );
}

export type MoreIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const MoreIcon = createIcon(MoreIconSvg);
export default MoreIcon;
