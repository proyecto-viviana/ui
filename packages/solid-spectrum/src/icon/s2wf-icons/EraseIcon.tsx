/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Erase.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Erase.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function EraseIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m18.184 5.868-3.688-3.687c-.85-.85-2.333-.85-3.182 0l-9.498 9.497c-.876.876-.877 2.301-.002 3.178l2.482 2.492c.42.42 1.001.662 1.594.662h2.405c.593 0 1.172-.24 1.591-.66l8.299-8.3c.876-.878.876-2.305-.001-3.182M8.826 16.29c-.14.14-.333.22-.53.22H5.89c-.197 0-.391-.08-.531-.22l-2.483-2.492c-.291-.293-.291-.768.001-1.06l2.636-2.636 4.59 4.59c.057.057.125.093.193.128zm8.298-8.3-5.833 5.834c-.035-.068-.071-.136-.128-.193l-4.59-4.59 5.802-5.8c.282-.283.777-.283 1.06 0l3.688 3.688c.293.292.293.768 0 1.06M17.937 18.021H17.5c-.414 0-.75-.335-.75-.75s.336-.75.75-.75h.437c.414 0 .75.336.75.75s-.336.75-.75.75M15.006 18.021H12.5c-.414 0-.75-.335-.75-.75s.336-.75.75-.75h2.506c.414 0 .75.336.75.75s-.336.75-.75.75"
      />
    </svg>
  );
}

export type EraseIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const EraseIcon = createIcon(EraseIconSvg);
export default EraseIcon;
