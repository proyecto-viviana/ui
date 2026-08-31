/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/StarFilled.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/StarFilled.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function StarFilledIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M11.495 2.414 12.7 5.597c.211.56.735.94 1.332.968l3.4.161c1.492.07 2.103 1.951.937 2.886l-2.656 2.128c-.467.375-.667.99-.508 1.568l.896 3.26c.396 1.444-1.207 2.608-2.457 1.785l-2.819-1.858c-.5-.33-1.147-.33-1.648-.002l-2.867 1.88c-1.249.82-2.848-.342-2.454-1.783l.898-3.284c.158-.577-.042-1.192-.509-1.566L1.59 9.612c-1.167-.935-.556-2.815.937-2.886l3.4-.161c.597-.028 1.12-.409 1.332-.968L8.46 2.414c.529-1.398 2.506-1.398 3.034 0"
      />
    </svg>
  );
}

export type StarFilledIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const StarFilledIcon = createIcon(StarFilledIconSvg);
export default StarFilledIcon;
