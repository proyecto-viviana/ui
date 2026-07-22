/*
 * Auto-generated from the shipped @react-spectrum/s2 dist assets (SVGO-
 * optimized — pixel parity requires the shipped path data, not the raw
 * vendored .svg sources). Variants absent from the dist (Arrow, Gripper)
 * fall back to the vendored sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createUIIcon } from "../spectrum-icon";

export type CornerTriangleProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: "S" | "M" | "L" | "XL";
};

function CornerTriangle_SSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, width: _width, height: _height, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="5"
      height="5"
      viewBox="0 0 5 5"
      {...rest}
      class={className}
    >
      <path
        fill="var(--iconPrimary, #222)"
        d="M.764 4.488 4.489.762a.3.3 0 0 1 .513.212L5 4.25a.75.75 0 0 1-.75.75H.976a.3.3 0 0 1-.212-.512"
      />
    </svg>
  );
}

function CornerTriangle_MSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, width: _width, height: _height, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="5"
      height="5"
      viewBox="0 0 5 5"
      {...rest}
      class={className}
    >
      <path
        fill="var(--iconPrimary, #222)"
        d="M.154 4.146 4.147.154A.5.5 0 0 1 5 .507V4.25a.75.75 0 0 1-.75.75H.507a.5.5 0 0 1-.354-.854"
      />
    </svg>
  );
}

function CornerTriangle_LSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, width: _width, height: _height, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="6"
      height="6"
      viewBox="0 0 6 6"
      {...rest}
      class={className}
    >
      <path
        fill="var(--iconPrimary, #222)"
        d="M.826 5.146 5.147.826a.5.5 0 0 1 .854.353L6 5.25a.75.75 0 0 1-.75.75H1.18a.5.5 0 0 1-.354-.854"
      />
    </svg>
  );
}

function CornerTriangle_XLSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, width: _width, height: _height, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="7"
      height="7"
      viewBox="0 0 7 7"
      {...rest}
      class={className}
    >
      <path
        fill="var(--iconPrimary, #222)"
        d="M.821 6.146 6.147.821A.5.5 0 0 1 7 1.175L6.999 6.25a.75.75 0 0 1-.75.75H1.174a.5.5 0 0 1-.353-.854"
      />
    </svg>
  );
}

const CornerTriangle_S = createUIIcon(CornerTriangle_SSvg);
const CornerTriangle_M = createUIIcon(CornerTriangle_MSvg);
const CornerTriangle_L = createUIIcon(CornerTriangle_LSvg);
const CornerTriangle_XL = createUIIcon(CornerTriangle_XLSvg);

export default function CornerTriangle(props: CornerTriangleProps): JSX.Element {
  const { size = "M", class: className, width: _width, height: _height, ...rest } = props;
  switch (size) {
    case "S":
      return <CornerTriangle_S {...rest} class={className} />;
    case "M":
      return <CornerTriangle_M {...rest} class={className} />;
    case "L":
      return <CornerTriangle_L {...rest} class={className} />;
    case "XL":
      return <CornerTriangle_XL {...rest} class={className} />;
    default:
      return <CornerTriangle_M {...rest} class={className} />;
  }
}

export const CornerTriangleIcon = CornerTriangle;
