/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Shapes.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Shapes.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ShapesIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M11.83 13H3.17c-.814 0-1.542-.42-1.949-1.125s-.406-1.546 0-2.25l4.33-7.5C5.959 1.421 6.688 1 7.5 1s1.542.42 1.949 1.125l4.33 7.5c.407.705.407 1.546 0 2.25S12.644 13 11.83 13M7.5 2.5c-.13 0-.454.036-.65.375l-4.33 7.5c-.195.339-.065.638 0 .75s.259.375.65.375h8.66c.391 0 .585-.262.65-.375s.195-.411 0-.75l-4.33-7.5c-.196-.339-.52-.375-.65-.375m-1.299 0h.01z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="m12.294 18.93-.133-.001c-2.354-.046-4.53-1.352-5.68-3.408-.203-.362-.073-.819.289-1.021.361-.203.817-.072 1.02.288.89 1.594 2.577 2.606 4.4 2.64 1.36.04 2.68-.483 3.672-1.437s1.552-2.238 1.579-3.614c.04-2.094-1.174-3.987-3.093-4.824-.38-.166-.553-.608-.388-.988s.608-.553.988-.387c2.477 1.08 4.045 3.525 3.993 6.228-.035 1.777-.759 3.434-2.04 4.666-1.248 1.2-2.88 1.858-4.607 1.858"
      />
    </svg>
  );
}

export type ShapesIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ShapesIcon = createIcon(ShapesIconSvg);
export default ShapesIcon;
