/*
 * Auto-generated from vendored React Spectrum S2 icon sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function SortIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m9.25,15.5H2.75c-.41406,0-.75-.33594-.75-.75s.33594-.75.75-.75h6.5c.41406,0,.75.33594.75.75s-.33594.75-.75.75Z"
        fill="var(--iconPrimary, #222)"
        stroke-width="0"
      />
      <path
        d="m13.25,10.5H2.75c-.41406,0-.75-.33594-.75-.75s.33594-.75.75-.75h10.5c.41406,0,.75.33594.75.75s-.33594.75-.75.75Z"
        fill="var(--iconPrimary, #222)"
        stroke-width="0"
      />
      <path
        d="m17.25,5.5H2.75c-.41406,0-.75-.33594-.75-.75s.33594-.75.75-.75h14.5c.41406,0,.75.33594.75.75s-.33594.75-.75.75Z"
        fill="var(--iconPrimary, #222)"
        stroke-width="0"
      />
    </svg>
  );
}

export type SortIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const SortIcon = createIcon(SortIconSvg);
export default SortIcon;
