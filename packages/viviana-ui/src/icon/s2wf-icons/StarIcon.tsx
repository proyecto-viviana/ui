/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Star.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Star.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function StarIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M5.506 18.63c-.36 0-.719-.112-1.027-.337-.594-.431-.854-1.168-.66-1.876l.977-3.577c.079-.29-.02-.596-.254-.783l-2.893-2.32c-.573-.459-.796-1.207-.57-1.906.228-.698.848-1.172 1.582-1.206l3.703-.176c.3-.014.56-.204.665-.483l1.313-3.469c.26-.687.902-1.131 1.637-1.131s1.376.444 1.636 1.13v.001l1.31 3.468c.107.28.369.47.667.484l3.704.176c.733.034 1.354.508 1.582 1.207.226.698.003 1.447-.57 1.906l-2.894 2.32c-.232.186-.333.493-.254.782l.977 3.574c.193.71-.067 1.448-.662 1.879-.598.434-1.38.447-1.994.041l-3.07-2.036c-.252-.166-.576-.166-.827-.002l-3.117 2.045c-.295.193-.628.29-.961.29M9.979 2.866c-.08 0-.184.028-.235.162L8.433 6.496c-.317.839-1.101 1.409-1.998 1.451l-3.704.176c-.142.006-.2.097-.225.172s-.03.183.08.273l2.893 2.319c.702.56 1.001 1.483.764 2.349l-.977 3.576c-.038.137.03.222.094.268.063.045.162.086.285.007l3.117-2.045c.753-.493 1.725-.492 2.476.005l3.072 2.037c.12.08.221.04.285-.006.064-.047.133-.13.094-.268l-.976-3.575c-.236-.866.063-1.787.764-2.348l2.893-2.32c.111-.088.106-.197.081-.272s-.083-.166-.225-.172l-3.705-.176c-.895-.042-1.68-.612-1.998-1.45l-1.31-3.47c-.05-.133-.155-.161-.234-.161"
      />
    </svg>
  );
}

export type StarIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const StarIcon = createIcon(StarIconSvg);
export default StarIcon;
