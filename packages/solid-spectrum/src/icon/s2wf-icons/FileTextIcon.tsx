/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/FileText.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/FileText.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function FileTextIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m16.34 5.296-3.62-3.622c-.42-.42-1-.66-1.591-.66H5.25C4.01 1.015 3 2.025 3 3.265v12.484c0 1.24 1.01 2.25 2.25 2.25h9.5c1.24 0 2.25-1.01 2.25-2.25V6.887c0-.6-.234-1.166-.66-1.591m-1.06 1.06c.046.047.074.104.106.159H12.25c-.413 0-.75-.337-.75-.75V2.628c.055.033.114.06.16.106zm-.53 10.142h-9.5c-.413 0-.75-.337-.75-.75V3.265c0-.413.337-.75.75-.75H10v3.25c0 1.24 1.01 2.25 2.25 2.25h3.25v7.733c0 .413-.337.75-.75.75"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M13 11.498H7c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h6c.414 0 .75.336.75.75s-.336.75-.75.75M13 14.498H7c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h6c.414 0 .75.336.75.75s-.336.75-.75.75"
      />
    </svg>
  );
}

export type FileTextIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const FileTextIcon = createIcon(FileTextIconSvg);
export default FileTextIcon;
