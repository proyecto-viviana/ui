/*
 * Auto-generated from the shipped @react-spectrum/s2 dist assets (SVGO-
 * optimized — pixel parity requires the shipped path data, not the raw
 * vendored .svg sources). Variants absent from the dist (Arrow, Gripper)
 * fall back to the vendored sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createUIIcon } from "../spectrum-icon";

export type AddProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: "XS" | "S" | "M" | "L" | "XL";
};

function Add_XSSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M6.625 3.078H4.922V1.375a.922.922 0 0 0-1.844 0v1.703H1.375a.922.922 0 0 0 0 1.844h1.703v1.703a.922.922 0 0 0 1.844 0V4.922h1.703a.922.922 0 0 0 0-1.844"
      />
    </svg>
  );
}

function Add_SSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M7 3.04H4.96V1a.96.96 0 1 0-1.92 0v2.04H1a.96.96 0 1 0 0 1.92h2.04V7a.96.96 0 1 0 1.92 0V4.96H7a.96.96 0 1 0 0-1.92"
      />
    </svg>
  );
}

function Add_MSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M8.5 4H6V1.5a1 1 0 1 0-2 0V4H1.5a1 1 0 1 0 0 2H4v2.5a1 1 0 1 0 2 0V6h2.5a1 1 0 1 0 0-2"
      />
    </svg>
  );
}

function Add_LSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10.021 4.959h-2.98v-2.98a1.04 1.04 0 1 0-2.082 0v2.98h-2.98a1.04 1.04 0 1 0 0 2.082h2.98v2.98a1.04 1.04 0 1 0 2.082 0v-2.98h2.98a1.04 1.04 0 1 0 0-2.082"
      />
    </svg>
  );
}

function Add_XLSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10.61 4.915H7.085V1.39a1.084 1.084 0 1 0-2.17 0v3.525H1.39a1.084 1.084 0 1 0 0 2.17h3.525v3.525a1.084 1.084 0 1 0 2.17 0V7.085h3.525a1.084 1.084 0 1 0 0-2.17"
      />
    </svg>
  );
}

const Add_XS = createUIIcon(Add_XSSvg);
const Add_S = createUIIcon(Add_SSvg);
const Add_M = createUIIcon(Add_MSvg);
const Add_L = createUIIcon(Add_LSvg);
const Add_XL = createUIIcon(Add_XLSvg);

export default function Add(props: AddProps): JSX.Element {
  const { size = "M", class: className, width: _width, height: _height, ...rest } = props;
  switch (size) {
    case "XS":
      return <Add_XS {...rest} class={className} />;
    case "S":
      return <Add_S {...rest} class={className} />;
    case "M":
      return <Add_M {...rest} class={className} />;
    case "L":
      return <Add_L {...rest} class={className} />;
    case "XL":
      return <Add_XL {...rest} class={className} />;
    default:
      return <Add_M {...rest} class={className} />;
  }
}

export const AddIcon = Add;
