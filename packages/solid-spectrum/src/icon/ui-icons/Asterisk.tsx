/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/dist/private/S2_AsteriskSize100.mjs
// Generator input: @react-spectrum/s2@1.6.0/dist/private/S2_AsteriskSize100.cjs
// Generator input: @react-spectrum/s2@1.6.0/dist/private/S2_AsteriskSize200.mjs
// Generator input: @react-spectrum/s2@1.6.0/dist/private/S2_AsteriskSize200.cjs
// Generator input: @react-spectrum/s2@1.6.0/dist/private/S2_AsteriskSize300.mjs
// Generator input: @react-spectrum/s2@1.6.0/dist/private/S2_AsteriskSize300.cjs

import { type JSX } from "solid-js";
import { createUIIcon } from "../spectrum-icon";

export type AsteriskProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: "M" | "L" | "XL";
};

function Asterisk_MSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, width: _width, height: _height, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="8"
      height="8"
      viewBox="0 0 8 8"
      {...rest}
      class={className}
    >
      <path
        fill="var(--iconPrimary, #222)"
        d="M6.575 6.555c.055.056.092.13 0 .2l-1.149.741c-.092.056-.129.019-.166-.074L3.834 4.94 1.963 7c-.019.036-.074.073-.129 0l-.889-.927c-.093-.055-.074-.111 0-.166l2.111-1.76L.648 3.24c-.037 0-.092-.074-.056-.167l.63-1.259a.1.1 0 0 1 .121-.066.1.1 0 0 1 .046.03L3.5 3.148l.13-2.7a.1.1 0 0 1 .081-.11h.03l1.537.2c.093 0 .111.036.093.13l-.723 2.646 2.445-.741c.055-.037.111-.037.148.074l.241 1.37c.018.093 0 .13-.074.13l-2.556.2z"
      />
    </svg>
  );
}

function Asterisk_LSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, width: _width, height: _height, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      {...rest}
      class={className}
    >
      <path
        fill="var(--iconPrimary, #222)"
        d="M7.861 7.953c.062.063.1.146 0 .23l-1.293.834c-.1.063-.145.021-.187-.083l-1.6-2.793-2.105 2.314c-.021.04-.083.082-.145 0l-1-1.043c-.1-.062-.083-.125 0-.187l2.375-1.981-2.715-1.026c-.042 0-.1-.083-.063-.188l.707-1.412a.11.11 0 0 1 .136-.074q.03.01.052.034l2.378 1.54.146-3.043A.11.11 0 0 1 4.638.95h.034l1.73.23c.1 0 .125.042.1.146l-.814 2.979 2.751-.834c.062-.042.125-.042.167.083l.271 1.542c.02.1 0 .146-.083.146l-2.876.23z"
      />
    </svg>
  );
}

function Asterisk_XLSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, width: _width, height: _height, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="10"
      height="10"
      viewBox="0 0 10 10"
      {...rest}
      class={className}
    >
      <path
        fill="var(--iconPrimary, #222)"
        d="M8.266 8.324c.07.071.116.164 0 .258l-1.454.938c-.116.071-.163.024-.21-.094l-1.8-3.141-2.367 2.6c-.024.045-.094.092-.163 0l-1.13-1.167c-.118-.07-.094-.141 0-.21l2.671-2.227L.766 4.13c-.047 0-.116-.094-.071-.211l.8-1.593a.124.124 0 0 1 .153-.084.13.13 0 0 1 .058.038l2.669 1.738.164-3.422a.124.124 0 0 1 .1-.14h.038l1.945.258c.118 0 .14.047.118.164l-.915 3.349 3.094-.938c.07-.047.14-.047.187.094l.3 1.734c.023.118 0 .164-.094.164l-3.234.258z"
      />
    </svg>
  );
}

const Asterisk_M = createUIIcon(Asterisk_MSvg);
const Asterisk_L = createUIIcon(Asterisk_LSvg);
const Asterisk_XL = createUIIcon(Asterisk_XLSvg);

export default function Asterisk(props: AsteriskProps): JSX.Element {
  const { size = "M", class: className, width: _width, height: _height, ...rest } = props;
  switch (size) {
    case "M":
      return <Asterisk_M {...rest} class={className} />;
    case "L":
      return <Asterisk_L {...rest} class={className} />;
    case "XL":
      return <Asterisk_XL {...rest} class={className} />;
    default:
      return <Asterisk_M {...rest} class={className} />;
  }
}

export const AsteriskIcon = Asterisk;
