/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Path.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Path.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PathIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16 3.375c-.583 0-1.116.197-1.552.52-1.34-.826-2.755-1.362-4.142-1.513-1.326-.145-2.568.072-3.679.575-.449-.359-1.01-.582-1.627-.582-1.447 0-2.625 1.178-2.625 2.625 0 .655.25 1.247.647 1.707-1.078 2.466-.79 5.345.803 7.825-.284.42-.45.925-.45 1.468 0 1.447 1.178 2.625 2.625 2.625S8.625 17.447 8.625 16 7.447 13.375 6 13.375c-.36 0-.702.073-1.014.205-1.215-1.955-1.462-4.144-.693-6.064.226.064.46.109.707.109 1.447 0 2.625-1.178 2.625-2.625 0-.28-.056-.544-.137-.797.804-.312 1.692-.434 2.655-.33 1.128.123 2.288.558 3.401 1.226-.104.282-.169.583-.169.901 0 1.447 1.178 2.625 2.625 2.625S18.625 7.447 18.625 6 17.447 3.375 16 3.375M7.375 16c0 .758-.617 1.375-1.375 1.375S4.625 16.758 4.625 16 5.242 14.625 6 14.625s1.375.617 1.375 1.375M5 6.375c-.758 0-1.375-.617-1.375-1.375S4.242 3.625 5 3.625 6.375 4.242 6.375 5 5.758 6.375 5 6.375m11 1c-.758 0-1.375-.617-1.375-1.375S15.242 4.625 16 4.625s1.375.617 1.375 1.375S16.758 7.375 16 7.375"
      />
    </svg>
  );
}

export type PathIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PathIcon = createIcon(PathIconSvg);
export default PathIcon;
