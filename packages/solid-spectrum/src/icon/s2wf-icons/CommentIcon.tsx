/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Comment.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Comment.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CommentIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M6.25 19q-.151 0-.293-.06c-.277-.118-.457-.39-.457-.69V15h-.75C2.682 15 1 13.317 1 11.25v-5.5C1 3.683 2.682 2 4.75 2h10.5C17.318 2 19 3.683 19 5.75v5.5c0 2.067-1.682 3.75-3.75 3.75h-4.543L6.77 18.79c-.143.138-.33.21-.52.21M4.75 3.5C3.51 3.5 2.5 4.51 2.5 5.75v5.5c0 1.24 1.01 2.25 2.25 2.25h1.5c.414 0 .75.336.75.75v2.237l2.885-2.777c.14-.135.326-.21.52-.21h4.845c1.24 0 2.25-1.01 2.25-2.25v-5.5c0-1.24-1.01-2.25-2.25-2.25z"
      />
    </svg>
  );
}

export type CommentIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CommentIcon = createIcon(CommentIconSvg);
export default CommentIcon;
