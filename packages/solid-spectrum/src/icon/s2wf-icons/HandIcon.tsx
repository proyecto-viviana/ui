/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Hand.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Hand.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function HandIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.4 5.126c-.357-.06-.705-.019-1.027.09v-.871c0-1.172-.953-2.125-2.125-2.125-.39 0-.703.109-.954.288-.376-.6-1.038-1.002-1.796-1.002-.966 0-1.774.651-2.031 1.535-.226-.082-.466-.134-.719-.134-1.172 0-2.125.953-2.125 2.125V8.73c-.323-.414-.776-.695-1.296-.787-.561-.101-1.125.027-1.588.352-.466.325-.775.812-.874 1.371-.098.56.027 1.123.352 1.589l2.75 3.916c1.842 2.38 3.562 3.323 6.092 3.323h.165c3.224-.03 5.518-2.406 6.133-6.347l.78-4.568c.197-1.155-.582-2.255-1.737-2.452m-.523 6.778c-.501 3.212-2.202 5.067-4.672 5.088-2.125.024-3.462-.683-5.03-2.712l-2.73-3.886c-.095-.137-.132-.303-.103-.468.03-.164.12-.308.257-.404.282-.197.672-.13.872.156l1.289 1.83c.239.339.707.423 1.045.181.187-.131.287-.334.306-.546.007-.004.012-.02.012-.067V5.032c0-.344.28-.625.625-.625s.625.28.625.625V8.79c0 .414.336.75.75.75s.75-.336.75-.75V3.63c0-.344.28-.624.625-.624s.625.28.625.625v5.03c0 .414.336.75.75.75s.75-.336.75-.75V4.345c0-.345.28-.625.625-.625s.625.28.625.625v2.964l-.284 1.659c-.07.408.205.796.613.865.402.075.795-.204.865-.613l.36-2.105c.057-.339.369-.568.721-.51.34.057.569.381.511.721z"
      />
    </svg>
  );
}

export type HandIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const HandIcon = createIcon(HandIconSvg);
export default HandIcon;
