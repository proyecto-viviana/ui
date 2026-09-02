/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Bookmark.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Bookmark.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function BookmarkIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M5.251 19q-.242 0-.478-.096c-.47-.193-.773-.647-.773-1.155v-13.5C4 3.01 5.01 2 6.25 2h7.5C14.99 2 16 3.01 16 4.25v13.5c0 .508-.304.962-.773 1.155-.471.195-1.005.087-1.364-.274L10 14.743 6.137 18.63c-.24.242-.56.37-.886.37M6.25 3.5c-.413 0-.75.337-.75.75v12.892l3.436-3.456c.57-.572 1.56-.571 2.127 0l3.437 3.456V4.25c0-.413-.337-.75-.75-.75z"
      />
    </svg>
  );
}

export type BookmarkIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const BookmarkIcon = createIcon(BookmarkIconSvg);
export default BookmarkIcon;
