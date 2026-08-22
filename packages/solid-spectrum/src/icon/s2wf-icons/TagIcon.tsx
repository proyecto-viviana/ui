/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Tag.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Tag.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function TagIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M11.864 18.804c-.552 0-1.103-.207-1.523-.622l-7.633-7.467C2.258 10.275 2 9.662 2 9.033v-4.68C2 3.057 3.056 2 4.354 2h4.779c.628 0 1.218.244 1.662.687l7.571 7.548c.408.403.634.942.634 1.515s-.226 1.113-.637 1.518l-4.975 4.914c-.42.415-.972.622-1.524.622M4.354 3.5c-.471 0-.854.383-.854.854v4.679c0 .228.094.45.257.61l7.636 7.47c.261.258.682.257.94.002L17.31 12.2c.123-.121.19-.281.19-.45s-.067-.33-.19-.45L9.736 3.748c-.159-.158-.378-.249-.602-.249z"
      />
      <circle
        cx="6"
        cy="6"
        r="1"
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
      />
    </svg>
  );
}

export type TagIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const TagIcon = createIcon(TagIconSvg);
export default TagIcon;
