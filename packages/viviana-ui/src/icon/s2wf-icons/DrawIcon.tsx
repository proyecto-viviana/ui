/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Draw.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Draw.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function DrawIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M17.53 1.999c-1.27-1.042-3.225-.9-4.449.324L3.105 12.3c-.319.317-.557.716-.689 1.15l-1.384 4.584c-.08.265-.008.552.188.747.142.143.334.22.53.22q.11 0 .217-.032l4.585-1.384c.433-.132.832-.37 1.148-.688L17.777 6.818c.649-.647.994-1.544.949-2.46S18.244 2.583 17.53 2M7.468 15.006l-2.48-2.47 6.858-6.857 2.475 2.475zm-4.596 2.122.98-3.244c.026-.09.066-.173.11-.252l2.413 2.402q-.122.072-.258.114zm13.845-11.37L15.38 7.093 12.907 4.62l1.235-1.235c.386-.387.896-.586 1.39-.586.38 0 .751.118 1.049.361.392.321.621.774.647 1.274.024.493-.163.976-.511 1.325"
      />
    </svg>
  );
}

export type DrawIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const DrawIcon = createIcon(DrawIconSvg);
export default DrawIcon;
