/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/FolderBreadcrumb.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/FolderBreadcrumb.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function FolderBreadcrumbIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.75 5h-5.964c-.218 0-.424-.094-.566-.259L8.516 2.777C8.089 2.283 7.47 2 6.816 2H3.25C2.01 2 1 3.01 1 4.25v10.5C1 15.99 2.01 17 3.25 17h13.5c1.24 0 2.25-1.01 2.25-2.25v-7.5C19 6.01 17.99 5 16.75 5M3.25 3.5h3.565c.218 0 .424.094.567.259L8.459 5H2.5v-.75c0-.413.337-.75.75-.75M17.5 14.75c0 .413-.337.75-.75.75H3.25c-.413 0-.75-.337-.75-.75V6.5h14.25c.413 0 .75.337.75.75z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M10 13.65c-.192 0-.384-.073-.53-.22l-3-3c-.293-.292-.293-.767 0-1.06s.767-.293 1.06 0L10 11.84l2.47-2.47c.293-.293.767-.293 1.06 0s.293.768 0 1.06l-3 3c-.146.147-.338.22-.53.22"
      />
    </svg>
  );
}

export type FolderBreadcrumbIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const FolderBreadcrumbIcon = createIcon(FolderBreadcrumbIconSvg);
export default FolderBreadcrumbIcon;
