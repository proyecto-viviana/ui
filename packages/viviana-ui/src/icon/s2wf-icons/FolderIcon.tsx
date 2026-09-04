/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Folder.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Folder.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function FolderIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.75 5h-5.964c-.218 0-.424-.095-.567-.259L8.516 2.776C8.088 2.283 7.468 2 6.816 2H3.25C2.01 2 1 3.01 1 4.25v10.5C1 15.99 2.01 17 3.25 17h13.5c1.24 0 2.25-1.01 2.25-2.25v-7.5C19 6.01 17.99 5 16.75 5M3.25 3.5h3.565c.218 0 .424.095.567.259L8.458 5H2.5v-.75c0-.413.336-.75.75-.75M17.5 14.75c0 .413-.336.75-.75.75H3.25c-.414 0-.75-.337-.75-.75V6.5h14.25c.414 0 .75.337.75.75z"
      />
    </svg>
  );
}

export type FolderIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const FolderIcon = createIcon(FolderIconSvg);
export default FolderIcon;
