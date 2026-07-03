/*
 * Auto-generated from the shipped @react-spectrum/s2 dist assets (SVGO-
 * optimized — pixel parity requires the shipped path data, not the raw
 * vendored .svg sources). Variants absent from the dist (Arrow, Gripper)
 * fall back to the vendored sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createUIIcon } from "../spectrum-icon";

export type DashProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: "XS" | "S" | "M" | "L" | "XL";
};

function Dash_XSSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M6.634 4.922H1.366a.922.922 0 0 1 0-1.844h5.268a.922.922 0 0 1 0 1.844"
      />
    </svg>
  );
}

function Dash_SSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M6.99 4.96H1.01a.96.96 0 1 1 0-1.92h5.98a.96.96 0 1 1 0 1.92"
      />
    </svg>
  );
}

function Dash_MSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M8.5 6h-7a1 1 0 1 1 0-2h7a1 1 0 1 1 0 2"
      />
    </svg>
  );
}

function Dash_LSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, width: _width, height: _height, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      {...rest}
      class={className}
    >
      <path
        fill="var(--iconPrimary, #222)"
        d="M10.021 7.041H1.98a1.04 1.04 0 1 1 0-2.082h8.042a1.04 1.04 0 1 1 0 2.082"
      />
    </svg>
  );
}

function Dash_XLSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, width: _width, height: _height, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="12"
      height="12"
      viewBox="0 0 12 12"
      {...rest}
      class={className}
    >
      <path
        fill="var(--iconPrimary, #222)"
        d="M10.61 7.085H1.39a1.084 1.084 0 1 1 0-2.17h9.22a1.084 1.084 0 1 1 0 2.17"
      />
    </svg>
  );
}

const Dash_XS = createUIIcon(Dash_XSSvg);
const Dash_S = createUIIcon(Dash_SSvg);
const Dash_M = createUIIcon(Dash_MSvg);
const Dash_L = createUIIcon(Dash_LSvg);
const Dash_XL = createUIIcon(Dash_XLSvg);

export default function Dash(props: DashProps): JSX.Element {
  const { size = "M", class: className, width: _width, height: _height, ...rest } = props;
  switch (size) {
    case "XS":
      return <Dash_XS {...rest} class={className} />;
    case "S":
      return <Dash_S {...rest} class={className} />;
    case "M":
      return <Dash_M {...rest} class={className} />;
    case "L":
      return <Dash_L {...rest} class={className} />;
    case "XL":
      return <Dash_XL {...rest} class={className} />;
    default:
      return <Dash_M {...rest} class={className} />;
  }
}

export const DashIcon = Dash;
