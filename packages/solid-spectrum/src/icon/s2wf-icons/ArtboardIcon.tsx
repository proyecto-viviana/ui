/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Artboard.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Artboard.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ArtboardIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m17.34 8.28-3.62-3.62c-.42-.42-1-.66-1.591-.66H6.25C5.01 4 4 5.01 4 6.25v9.5C4 16.99 5.01 18 6.25 18h9.5c1.24 0 2.25-1.01 2.25-2.25V9.871c0-.592-.24-1.172-.66-1.59m-1.06 1.06c.046.046.074.105.106.16H13.25c-.413 0-.75-.336-.75-.75V5.614c.055.032.114.06.16.106zm-.53 7.16h-9.5c-.413 0-.75-.336-.75-.75v-9.5c0-.414.337-.75.75-.75H11v3.25C11 9.99 12.01 11 13.25 11h3.25v4.75c0 .414-.337.75-.75.75M4.75 3.5c-.414 0-.75-.336-.75-.75V1c0-.414.336-.75.75-.75s.75.336.75.75v1.75c0 .414-.336.75-.75.75M2.75 5.5H1c-.414 0-.75-.336-.75-.75S.586 4 1 4h1.75c.414 0 .75.336.75.75s-.336.75-.75.75"
      />
    </svg>
  );
}

export type ArtboardIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ArtboardIcon = createIcon(ArtboardIconSvg);
export default ArtboardIcon;
