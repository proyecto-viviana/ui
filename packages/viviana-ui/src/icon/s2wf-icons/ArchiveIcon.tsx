/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Archive.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Archive.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ArchiveIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.75 3H3.25C2.01 3 1 4.01 1 5.25v1c0 .778.398 1.465 1 1.869v6.631C2 15.99 3.01 17 4.25 17h11.5c1.24 0 2.25-1.01 2.25-2.25V8.119c.602-.404 1-1.09 1-1.869v-1C19 4.01 17.99 3 16.75 3M2.5 5.25c0-.413.336-.75.75-.75h13.5c.414 0 .75.337.75.75v1c0 .413-.336.75-.75.75H3.25c-.414 0-.75-.337-.75-.75zM15.75 15.5H4.25c-.414 0-.75-.337-.75-.75V8.5h13v6.25c0 .413-.336.75-.75.75"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M12.25 10.5h-4.5c-.414 0-.75.336-.75.75s.336.75.75.75h4.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75"
      />
    </svg>
  );
}

export type ArchiveIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ArchiveIcon = createIcon(ArchiveIconSvg);
export default ArchiveIcon;
