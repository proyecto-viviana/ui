/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Revert.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Revert.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function RevertIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M18 15.5H3c-.414 0-.75-.336-.75-.75S2.586 14 3 14h15c.414 0 .75.336.75.75s-.336.75-.75.75M11 3.25c-3.777 0-6.926 2.816-7.609 6.528l-.858-1.44c-.212-.356-.673-.47-1.029-.26-.355.213-.472.673-.26 1.029l1.796 3.012c.104.173.273.298.47.345q.087.02.174.02c.141 0 .28-.04.402-.116l2.92-1.853c.349-.222.452-.685.23-1.035-.221-.35-.685-.453-1.034-.231l-1.344.852C5.392 7.061 7.94 4.75 11 4.75c3.446 0 6.25 2.931 6.25 6.534 0 .414.336.75.75.75s.75-.336.75-.75c0-4.43-3.477-8.034-7.75-8.034"
      />
    </svg>
  );
}

export type RevertIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const RevertIcon = createIcon(RevertIconSvg);
export default RevertIcon;
