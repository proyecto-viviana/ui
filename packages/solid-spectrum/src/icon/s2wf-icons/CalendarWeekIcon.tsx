/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/CalendarWeek.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/CalendarWeek.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CalendarWeekIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M13.25 14.998h-6.5c-.965 0-1.75-.785-1.75-1.75v-1.5c0-.965.785-1.75 1.75-1.75h6.5c.965 0 1.75.785 1.75 1.75v1.5c0 .965-.785 1.75-1.75 1.75m-6.5-3.5c-.138 0-.25.112-.25.25v1.5c0 .138.112.25.25.25h6.5c.138 0 .25-.112.25-.25v-1.5c0-.138-.112-.25-.25-.25z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M15.75 3h-2V2c0-.414-.336-.75-.75-.75s-.75.336-.75.75v1h-4.5V2c0-.414-.336-.75-.75-.75s-.75.336-.75.75v1h-2C3.01 3 2 4.01 2 5.25v10.5C2 16.99 3.01 18 4.25 18h11.5c1.24 0 2.25-1.01 2.25-2.25V5.25C18 4.01 16.99 3 15.75 3M4.25 4.5h2V5c0 .414.336.75.75.75s.75-.336.75-.75v-.5h4.5V5c0 .414.336.75.75.75s.75-.336.75-.75v-.5h2c.413 0 .75.337.75.75v1.748h-13V5.25c0-.413.337-.75.75-.75m11.5 12H4.25c-.413 0-.75-.337-.75-.75V8.498h13v7.252c0 .413-.337.75-.75.75"
      />
    </svg>
  );
}

export type CalendarWeekIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CalendarWeekIcon = createIcon(CalendarWeekIconSvg);
export default CalendarWeekIcon;
