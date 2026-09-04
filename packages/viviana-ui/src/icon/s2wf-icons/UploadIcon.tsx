/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Upload.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Upload.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function UploadIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m13.527 10.491-3.002-2.998c-.293-.293-.767-.293-1.06 0l-2.998 2.998c-.293.293-.293.768 0 1.06.147.147.339.22.53.22s.384-.073.53-.22L9.25 9.83v8.18c0 .414.336.75.75.75s.75-.336.75-.75V9.837l1.718 1.715c.293.293.767.293 1.06 0s.293-.769 0-1.06"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M15.75 17h-2.799c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h2.799c.414 0 .75-.337.75-.75V4.25c0-.413-.336-.75-.75-.75H4.25c-.414 0-.75.337-.75.75v10.5c0 .413.336.75.75.75h2.726c.414 0 .75.336.75.75s-.336.75-.75.75H4.25C3.01 17 2 15.99 2 14.75V4.25C2 3.01 3.01 2 4.25 2h11.5C16.99 2 18 3.01 18 4.25v10.5c0 1.24-1.01 2.25-2.25 2.25"
      />
    </svg>
  );
}

export type UploadIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const UploadIcon = createIcon(UploadIconSvg);
export default UploadIcon;
