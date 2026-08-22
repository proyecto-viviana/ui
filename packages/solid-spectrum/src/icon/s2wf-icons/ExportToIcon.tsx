/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/ExportTo.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/ExportTo.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ExportToIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M18 15.75v-3.72c0-.413-.336-.75-.75-.75s-.75.337-.75.75v3.72c0 .414-.336.75-.75.75H4.25c-.414 0-.75-.336-.75-.75V4.25c0-.414.336-.75.75-.75h3.811c.414 0 .75-.336.75-.75S8.475 2 8.061 2H4.25C3.01 2 2 3.01 2 4.25v11.5C2 16.99 3.01 18 4.25 18h11.5c1.24 0 2.25-1.01 2.25-2.25"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M19 1.75v4.243c0 .414-.336.75-.75.75s-.75-.336-.75-.75V3.56l-6.47 6.47c-.146.146-.338.219-.53.219s-.384-.073-.53-.22c-.293-.293-.293-.767 0-1.06l6.47-6.47h-2.433c-.414 0-.75-.336-.75-.75s.336-.75.75-.75h4.243c.414 0 .75.336.75.75"
      />
    </svg>
  );
}

export type ExportToIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ExportToIcon = createIcon(ExportToIconSvg);
export default ExportToIcon;
