/*
 * Auto-generated from vendored React Spectrum S2 icon sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function MaximizeIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m9.03027,10.96973c-.29297-.29297-.76758-.29297-1.06055,0l-4.46973,4.46973v-2.43213c0-.41406-.33594-.75-.75-.75s-.75.33594-.75.75v4.24268c0,.41406.33594.75.75.75h4.24268c.41406,0,.75-.33594.75-.75s-.33594-.75-.75-.75h-2.43213l4.46973-4.46973c.29297-.29297.29297-.76758,0-1.06055Z"
        fill="var(--iconPrimary, #222)"
      />
      <path
        d="m18,2.75v4.24268c0,.41406-.33594.75-.75.75s-.75-.33594-.75-.75v-2.43213l-4.46973,4.46973c-.14648.14648-.33838.21973-.53027.21973s-.38379-.07324-.53027-.21973c-.29297-.29297-.29297-.76758,0-1.06055l4.46973-4.46973h-2.43213c-.41406,0-.75-.33594-.75-.75s.33594-.75.75-.75h4.24268c.41406,0,.75.33594.75.75Z"
        fill="var(--iconPrimary, #222)"
      />
    </svg>
  );
}

export type MaximizeIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const MaximizeIcon = createIcon(MaximizeIconSvg);
export default MaximizeIcon;
