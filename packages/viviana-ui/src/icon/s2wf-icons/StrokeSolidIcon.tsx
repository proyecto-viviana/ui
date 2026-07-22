/*
 * Auto-generated from vendored React Spectrum S2 icon sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function StrokeSolidIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m18,10.75H2c-.41406,0-.75-.33594-.75-.75s.33594-.75.75-.75h16c.41406,0,.75.33594.75.75s-.33594.75-.75.75Z"
        fill="var(--iconPrimary, #222)"
      />
    </svg>
  );
}

export type StrokeSolidIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const StrokeSolidIcon = createIcon(StrokeSolidIconSvg);
export default StrokeSolidIcon;
