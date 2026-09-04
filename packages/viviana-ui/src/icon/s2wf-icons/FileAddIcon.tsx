/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/FileAdd.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/FileAdd.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function FileAddIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M12.25 8h3.25v.377c0 .414.336.75.75.75s.75-.336.75-.75V6.871c0-.6-.234-1.164-.659-1.59L12.72 1.658c-.426-.424-.99-.658-1.59-.658H5.25C4.01 1 3 2.01 3 3.25v12.5C3 16.99 4.01 18 5.25 18h3.42c.414 0 .75-.336.75-.75s-.336-.75-.75-.75H5.25c-.414 0-.75-.336-.75-.75V3.25c0-.414.336-.75.75-.75H10v3.25C10 6.99 11.01 8 12.25 8m3.03-1.66c.046.047.074.105.106.16H12.25c-.414 0-.75-.336-.75-.75V2.614c.055.032.113.06.159.105z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M15 10.5c-2.485 0-4.5 2.015-4.5 4.5s2.015 4.5 4.5 4.5 4.5-2.015 4.5-4.5-2.015-4.5-4.5-4.5m2.5 5.125h-1.875V17.5c0 .345-.28.625-.625.625s-.625-.28-.625-.625v-1.875H12.5c-.345 0-.625-.28-.625-.625s.28-.625.625-.625h1.875V12.5c0-.345.28-.625.625-.625s.625.28.625.625v1.875H17.5c.345 0 .625.28.625.625s-.28.625-.625.625"
      />
    </svg>
  );
}

export type FileAddIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const FileAddIcon = createIcon(FileAddIconSvg);
export default FileAddIcon;
