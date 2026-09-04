/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/PinOff.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/PinOff.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PinOffIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M17.38 6.566 13.436 2.62c-.363-.363-.846-.562-1.36-.562s-1 .2-1.361.563c-.425.424-.621 1-.557 1.565L6.992 7.35l-2.311-.199c-.748-.086-1.438.31-1.76.986-.322.677-.188 1.459.344 1.99L6.038 12.9 2.22 16.72c-.293.293-.293.767 0 1.06.146.147.338.22.53.22s.384-.073.53-.22L7.1 13.962l2.774 2.774c.339.34.78.517 1.231.517.255 0 .513-.057.758-.173.677-.322 1.064-1.013.987-1.746l-.2-2.326 3.165-3.166c.568.067 1.141-.13 1.565-.554.363-.363.563-.846.564-1.36s-.199-.998-.562-1.362m-1.062 1.662c-.127.126-.288.159-.437.095-.281-.124-.61-.06-.827.158l-3.713 3.713c-.156.157-.237.374-.217.595l.231 2.688c.016.144-.067.214-.138.249s-.18.052-.283-.05L4.325 9.067c-.103-.103-.085-.212-.05-.284.032-.065.093-.14.224-.14l.04.003 2.672.229c.222.02.437-.06.595-.217l3.712-3.712c.216-.217.28-.545.158-.827-.066-.153-.031-.307.098-.437.08-.08.187-.124.301-.124s.22.044.299.123l3.946 3.946c.165.165.164.435-.002.6"
      />
    </svg>
  );
}

export type PinOffIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PinOffIcon = createIcon(PinOffIconSvg);
export default PinOffIcon;
