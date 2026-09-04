/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/StickyNote.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/StickyNote.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function StickyNoteIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M15.75 2H4.25C3.01 2 2 3.01 2 4.25v11.5C2 16.99 3.01 18 4.25 18h7.879c.592 0 1.172-.24 1.59-.66l3.622-3.62c.419-.42.659-1 .659-1.591V4.25C18 3.01 16.99 2 15.75 2M3.5 15.75V4.25c0-.413.336-.75.75-.75h11.5c.414 0 .75.337.75.75V11h-3.25C12.01 11 11 12.01 11 13.25v3.25H4.25c-.414 0-.75-.337-.75-.75m9.16.53c-.046.046-.105.074-.16.106V13.25c0-.413.336-.75.75-.75h3.136c-.032.055-.06.114-.106.16z"
      />
    </svg>
  );
}

export type StickyNoteIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const StickyNoteIcon = createIcon(StickyNoteIconSvg);
export default StickyNoteIcon;
