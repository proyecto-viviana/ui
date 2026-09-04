/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Exposure.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Exposure.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ExposureIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10 1.28c-4.825 0-8.75 3.924-8.75 8.75s3.925 8.75 8.75 8.75 8.75-3.926 8.75-8.75S14.825 1.28 10 1.28m7.25 8.75q0 .359-.036.71l-5.918-4.299 3.038-2.21C16.1 5.555 17.25 7.657 17.25 10.03m-5.562 2.47H8.345L7.32 9.333l2.7-1.965 2.707 1.966zm1.237-9.1-6.09 4.43-1.164-3.603C6.881 3.322 8.376 2.78 10 2.78c1.041 0 2.03.225 2.925.622M4.461 5.362 6.768 12.5H3.193c-.282-.772-.443-1.602-.443-2.47 0-1.779.645-3.406 1.71-4.669M3.94 14h7.254l-1.075 3.273c-.04 0-.08.006-.12.006-2.532 0-4.762-1.307-6.06-3.279m7.832 3.051 2.23-6.79 2.863 2.079c-.782 2.316-2.701 4.107-5.093 4.711"
      />
    </svg>
  );
}

export type ExposureIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ExposureIcon = createIcon(ExposureIconSvg);
export default ExposureIcon;
