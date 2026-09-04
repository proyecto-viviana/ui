/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Collection.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Collection.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CollectionIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.75 3H3.25C2.01 3 1 4.01 1 5.25v9.5C1 15.99 2.01 17 3.25 17h13.5c1.24 0 2.25-1.01 2.25-2.25v-9.5C19 4.01 17.99 3 16.75 3m.75 2.25v4h-4V4.5h3.25c.413 0 .75.337.75.75m-9.5 4V4.5h4v4.75zm4 1.5v4.75H8v-4.75zM3.25 4.5H6.5v4.75h-4v-4c0-.413.337-.75.75-.75M2.5 14.75v-4h4v4.75H3.25c-.413 0-.75-.337-.75-.75m14.25.75H13.5v-4.75h4v4c0 .413-.337.75-.75.75"
      />
    </svg>
  );
}

export type CollectionIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CollectionIcon = createIcon(CollectionIconSvg);
export default CollectionIcon;
