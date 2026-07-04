/*
 * Auto-generated from the shipped @react-spectrum/s2 dist icon (icons/Search.mjs,
 * SVGO-rounded path). Do not edit by hand.
 *
 * Pixel parity requires the SHIPPED path data, not the raw vendored `.svg`
 * source: the compiled React S2 SearchField renders `icons/Search.mjs`, whose
 * `d` is SVGO-optimized to lower decimal precision. The higher-precision raw
 * source drifts sub-glyph antialiasing and fails D3. (Same principle recorded
 * on the Cross ui-icon.) See tech-debt `s2wf-icon-shipped-path-provenance`.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function SearchIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m18.53 17.47-5.083-5.084C14.417 11.186 15 9.66 15 8c0-3.86-3.14-7-7-7S1 4.14 1 8s3.14 7 7 7c1.66 0 3.185-.584 4.386-1.553l5.084 5.083c.146.147.338.22.53.22s.384-.073.53-.22c.293-.293.293-.767 0-1.06M8 13.5c-3.032 0-5.5-2.468-5.5-5.5S4.968 2.5 8 2.5s5.5 2.468 5.5 5.5-2.468 5.5-5.5 5.5"
        fill="var(--iconPrimary, #222)"
      />
    </svg>
  );
}

export type SearchIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const SearchIcon = createIcon(SearchIconSvg);
export default SearchIcon;
