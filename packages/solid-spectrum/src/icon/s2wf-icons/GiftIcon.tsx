/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Gift.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Gift.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function GiftIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M15.75 6h-1.314c.194-.376.314-.797.314-1.249 0-1.517-1.233-2.75-2.75-2.75-.79 0-1.498.34-2 .874-.502-.535-1.21-.874-2-.874-1.517 0-2.75 1.233-2.75 2.75 0 .452.12.873.314 1.249H4.25C3.01 6 2 7.01 2 8.25v1.5c0 .778.398 1.465 1 1.869v4.131C3 16.99 4.01 18 5.25 18h9.5c1.24 0 2.25-1.01 2.25-2.25v-4.131c.602-.404 1-1.091 1-1.869v-1.5C18 7.01 16.99 6 15.75 6m.75 2.25v1.5c0 .413-.337.75-.75.75h-5V7.501H12l.01-.001h3.74c.413 0 .75.337.75.75M12 3.501c.69 0 1.25.56 1.25 1.25 0 .688-.558 1.246-1.245 1.249H10.75V4.751c0-.69.56-1.25 1.25-1.25m-5.25 1.25c0-.69.56-1.25 1.25-1.25s1.25.56 1.25 1.25V6H7.995c-.687-.003-1.245-.561-1.245-1.249M3.5 8.25c0-.413.337-.75.75-.75h3.74l.01.001h1.25V10.5h-5c-.413 0-.75-.337-.75-.75zm1 7.5V12h4.75v4.5h-4c-.413 0-.75-.337-.75-.75m10.25.75h-4V12h4.75v3.75c0 .413-.337.75-.75.75"
      />
    </svg>
  );
}

export type GiftIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const GiftIcon = createIcon(GiftIconSvg);
export default GiftIcon;
