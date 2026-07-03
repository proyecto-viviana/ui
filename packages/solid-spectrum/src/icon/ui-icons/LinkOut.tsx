/*
 * Auto-generated from the shipped @react-spectrum/s2 dist assets (SVGO-
 * optimized — pixel parity requires the shipped path data, not the raw
 * vendored .svg sources). Variants absent from the dist (Arrow, Gripper)
 * fall back to the vendored sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createUIIcon } from "../spectrum-icon";

export type LinkOutProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: "M" | "L" | "XL" | "XXL";
};

function LinkOut_MSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M8.125 1H3.741a.875.875 0 1 0 0 1.75h2.27l-4.88 4.88a.88.88 0 0 0 0 1.24.873.873 0 0 0 1.238 0L7.25 3.987v2.27a.875.875 0 1 0 1.75 0V1.876A.875.875 0 0 0 8.125 1"
      />
    </svg>
  );
}

function LinkOut_LSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10.089 1h-5.51a.911.911 0 0 0 0 1.822h3.31L1.355 9.355a.91.91 0 1 0 1.29 1.29L9.178 4.11v3.31a.911.911 0 0 0 1.822 0v-5.51A.91.91 0 0 0 10.089 1"
      />
    </svg>
  );
}

function LinkOut_XLSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, width: _width, height: _height, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 14 14"
      {...rest}
      class={className}
    >
      <path
        fill="var(--iconPrimary, #222)"
        d="M12.05 1H5.164a.949.949 0 1 0 0 1.898h4.595l-8.18 8.18a.95.95 0 0 0 1.344 1.344l8.18-8.18v4.595a.949.949 0 1 0 1.898 0V1.949A.95.95 0 0 0 12.05 1"
      />
    </svg>
  );
}

function LinkOut_XXLSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
  const { class: className, width: _width, height: _height, ...rest } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
      viewBox="0 0 16 16"
      {...rest}
      class={className}
    >
      <path
        fill="var(--iconPrimary, #222)"
        d="M14.01 1h-8a.99.99 0 0 0 0 1.979h5.613L1.551 13.05a.988.988 0 1 0 1.398 1.398L13.021 4.377v5.612a.99.99 0 0 0 1.979 0v-8A.99.99 0 0 0 14.01 1"
      />
    </svg>
  );
}

const LinkOut_M = createUIIcon(LinkOut_MSvg);
const LinkOut_L = createUIIcon(LinkOut_LSvg);
const LinkOut_XL = createUIIcon(LinkOut_XLSvg);
const LinkOut_XXL = createUIIcon(LinkOut_XXLSvg);

export default function LinkOut(props: LinkOutProps): JSX.Element {
  const { size = "M", class: className, width: _width, height: _height, ...rest } = props;
  switch (size) {
    case "M":
      return <LinkOut_M {...rest} class={className} />;
    case "L":
      return <LinkOut_L {...rest} class={className} />;
    case "XL":
      return <LinkOut_XL {...rest} class={className} />;
    case "XXL":
      return <LinkOut_XXL {...rest} class={className} />;
    default:
      return <LinkOut_M {...rest} class={className} />;
  }
}

export const LinkOutIcon = LinkOut;
