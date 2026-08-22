/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/BetaApp.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/BetaApp.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function BetaAppIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M13 2.5H7c-.414 0-.75-.336-.75-.75S6.586 1 7 1h6c.414 0 .75.336.75.75s-.336.75-.75.75M16.773 14.48q-.022-.046-.05-.09L12.49 7.78V5.493h.5c.414 0 .75-.336.75-.75s-.336-.75-.75-.75h-1.25c-.414 0-.75.336-.75.75V8c0 .144.041.284.119.404l1.171 1.83-5.686 1.743 2.279-3.574c.076-.12.117-.26.117-.403V4.743c0-.414-.336-.75-.75-.75H6.99c-.414 0-.75.336-.75.75s.336.75.75.75h.5v2.288l-4.213 6.61q-.028.043-.049.09c-.351.761-.29 1.638.164 2.346C3.86 17.562 4.67 18 5.558 18h8.884c.887 0 1.697-.438 2.167-1.173.453-.708.515-1.585.164-2.347m-1.427 1.539c-.193.301-.531.481-.904.481H5.558c-.373 0-.71-.18-.904-.481-.171-.268-.2-.582-.082-.87l.779-1.222 7.768-2.383 2.31 3.604c.117.29.088.604-.083.87"
      />
    </svg>
  );
}

export type BetaAppIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const BetaAppIcon = createIcon(BetaAppIconSvg);
export default BetaAppIcon;
