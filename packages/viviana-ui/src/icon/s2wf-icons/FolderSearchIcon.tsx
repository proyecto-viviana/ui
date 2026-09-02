/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/FolderSearch.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/FolderSearch.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function FolderSearchIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m19.28 18.222-1.974-1.975c.437-.64.694-1.414.694-2.247 0-2.206-1.794-4-4-4s-4 1.794-4 4 1.794 4 4 4c.832 0 1.604-.256 2.245-.692l1.975 1.974c.146.147.338.22.53.22s.384-.073.53-.22c.293-.293.293-.767 0-1.06M11.5 14c0-1.379 1.121-2.5 2.5-2.5s2.5 1.121 2.5 2.5-1.121 2.5-2.5 2.5-2.5-1.121-2.5-2.5"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M16.75 5.021h-5.964c-.218 0-.424-.094-.566-.258L8.516 2.797c-.428-.493-1.047-.776-1.7-.776H3.25C2.01 2.021 1 3.031 1 4.271v11c0 .965.785 1.75 1.75 1.75h5.428c.414 0 .75-.335.75-.75s-.336-.75-.75-.75H2.75c-.138 0-.25-.112-.25-.25v-8.75h14.25c.413 0 .75.337.75.75v2.152c0 .414.336.75.75.75s.75-.336.75-.75V7.27c0-1.24-1.01-2.25-2.25-2.25M2.5 4.271c0-.413.337-.75.75-.75h3.565c.218 0 .424.094.567.258l1.077 1.242H2.5z"
      />
    </svg>
  );
}

export type FolderSearchIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const FolderSearchIcon = createIcon(FolderSearchIconSvg);
export default FolderSearchIcon;
