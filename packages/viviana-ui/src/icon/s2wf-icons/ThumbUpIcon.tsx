/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/ThumbUp.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/ThumbUp.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ThumbUpIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M18.53 8.225C18.02 7.458 17.164 7 16.242 7h-3.045c-.387 0-.715-.303-.747-.688l-.2-2.38c.002-.052-.002-.138-.01-.189-.112-.653-.373-2.183-2.175-2.183-1.482 0-1.79 1.669-2.087 3.284C7.638 6.69 7.32 7.997 6.318 8H4.25C3.01 8 2 9.01 2 10.25v5.5C2 16.99 3.01 18 4.25 18h7.5q.052 0 .1-.007h1.44c1.52 0 2.877-.908 3.46-2.31l2.03-4.876c.355-.851.261-1.816-.25-2.582M3.5 15.75v-5.5c0-.413.336-.75.75-.75h1v7h-1c-.414 0-.75-.337-.75-.75m13.896-5.52-2.03 4.877c-.35.841-1.165 1.385-2.076 1.386h-1.54q-.052 0-.1.007h-4.9V9.467c1.956-.3 2.385-2.624 2.704-4.352.122-.667.351-1.909.611-2.055.36 0 .53 0 .686.877l.001.042.203 2.456c.095 1.158 1.08 2.065 2.242 2.065h3.045c.425 0 .804.203 1.04.557s.278.78.114 1.173"
      />
    </svg>
  );
}

export type ThumbUpIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ThumbUpIcon = createIcon(ThumbUpIconSvg);
export default ThumbUpIcon;
