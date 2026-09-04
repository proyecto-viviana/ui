/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/BookmarkSingleFilled.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/BookmarkSingleFilled.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function BookmarkSingleFilledIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M13.75 2h-7.5C5.01 2 4 3.01 4 4.25v13.499c0 .508.304.962.773 1.155.156.065.318.096.478.096.326 0 .645-.128.886-.37L10 14.743l3.863 3.887c.358.36.892.47 1.364.274.47-.193.773-.647.773-1.155V4.25C16 3.01 14.99 2 13.75 2"
      />
    </svg>
  );
}

export type BookmarkSingleFilledIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const BookmarkSingleFilledIcon = createIcon(BookmarkSingleFilledIconSvg);
export default BookmarkSingleFilledIcon;
