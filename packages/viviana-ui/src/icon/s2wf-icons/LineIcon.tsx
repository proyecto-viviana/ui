/*
 * Auto-generated from vendored React Spectrum S2 icon sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function LineIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m2.87549,17.875c-.19189,0-.38379-.07324-.53027-.21973-.29297-.29297-.29297-.76758,0-1.06055L16.36621,2.57324c.29297-.29297.76758-.29297,1.06055,0s.29297.76758,0,1.06055L3.40576,17.65527c-.14648.14648-.33838.21973-.53027.21973Z"
        fill="var(--iconPrimary, #222)"
      />
    </svg>
  );
}

export type LineIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const LineIcon = createIcon(LineIconSvg);
export default LineIcon;
