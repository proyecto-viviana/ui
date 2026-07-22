/*
 * Auto-generated from vendored React Spectrum S2 icon sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function AddIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m16.25,9.25h-5.5V3.75c0-.41406-.33594-.75-.75-.75s-.75.33594-.75.75v5.5H3.75c-.41406,0-.75.33594-.75.75s.33594.75.75.75h5.5v5.5c0,.41406.33594.75.75.75s.75-.33594.75-.75v-5.5h5.5c.41406,0,.75-.33594.75-.75s-.33594-.75-.75-.75Z"
        fill="var(--iconPrimary, #222)"
      />
    </svg>
  );
}

export type AddIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const AddIcon = createIcon(AddIconSvg);
export default AddIcon;
