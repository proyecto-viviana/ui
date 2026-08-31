/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/File.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/File.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function FileIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.341 5.28 12.72 1.66c-.425-.426-.99-.66-1.59-.66H5.25C4.01 1 3 2.01 3 3.25v12.5C3 16.99 4.01 18 5.25 18h9.5c1.24 0 2.25-1.01 2.25-2.25V6.871c0-.592-.24-1.172-.659-1.59m-1.06 1.06c.045.046.073.105.105.16H12.25c-.414 0-.75-.337-.75-.75V2.614c.055.032.113.06.159.106zM14.75 16.5h-9.5c-.414 0-.75-.337-.75-.75V3.25c0-.413.336-.75.75-.75H10v3.25C10 6.99 11.01 8 12.25 8h3.25v7.75c0 .413-.336.75-.75.75"
      />
    </svg>
  );
}

export type FileIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const FileIcon = createIcon(FileIconSvg);
export default FileIcon;
