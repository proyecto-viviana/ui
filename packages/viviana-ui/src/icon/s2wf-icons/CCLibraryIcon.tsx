/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/CCLibrary.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/CCLibrary.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CCLibraryIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M2.75 15c-.414 0-.75-.336-.75-.75v-10C2 3.01 3.01 2 4.25 2h10c.414 0 .75.336.75.75s-.336.75-.75.75h-10c-.414 0-.75.337-.75.75v10c0 .414-.336.75-.75.75"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M15.63 5H7.37C6.063 5 5 6.063 5 7.37v8.26C5 16.937 6.063 18 7.37 18h8.26c1.307 0 2.37-1.063 2.37-2.37V7.37C18 6.063 16.937 5 15.63 5m.87 10.63c0 .48-.39.87-.87.87H7.37c-.48 0-.87-.39-.87-.87V7.37c0-.48.39-.87.87-.87H11v4.134c0 .357.43.535.683.283l1.034-1.034c.156-.156.41-.156.566 0l1.034 1.034c.252.252.683.074.683-.283V6.5h.63c.48 0 .87.39.87.87z"
      />
    </svg>
  );
}

export type CCLibraryIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CCLibraryIcon = createIcon(CCLibraryIconSvg);
export default CCLibraryIcon;
