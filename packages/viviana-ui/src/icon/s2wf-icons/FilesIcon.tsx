/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Files.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Files.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function FilesIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M3.75 14c-.414 0-.75-.336-.75-.75v-10C3 2.01 4.01 1 5.25 1h6c.414 0 .75.336.75.75s-.336.75-.75.75h-6c-.414 0-.75.337-.75.75v10c0 .414-.336.75-.75.75"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="m17.363 8.213-2.687-3.224C14.152 4.36 13.382 4 12.563 4H8.25C7.01 4 6 5.01 6 6.25v9.5C6 16.99 7.01 18 8.25 18h7.5c1.24 0 2.25-1.01 2.25-2.25V9.974c0-.642-.226-1.267-.637-1.761m-1.714.287H14.25c-.414 0-.75-.337-.75-.75V5.928l.023.022zm.101 8h-7.5c-.414 0-.75-.337-.75-.75v-9.5c0-.413.336-.75.75-.75H12v2.25C12 8.99 13.01 10 14.25 10h2.25v5.75c0 .413-.336.75-.75.75"
      />
    </svg>
  );
}

export type FilesIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const FilesIcon = createIcon(FilesIconSvg);
export default FilesIcon;
