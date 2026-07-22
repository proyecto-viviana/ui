/*
 * Auto-generated from the shipped @react-spectrum/s2 dist assets (SVGO-
 * optimized — pixel parity requires the shipped path data, not the raw
 * vendored .svg sources). Variants absent from the dist (Arrow, Gripper)
 * fall back to the vendored sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createUIIcon } from "../spectrum-icon";

export type DragHandleProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: "S" | "M" | "L" | "XL";
};

function DragHandle_SSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <circle cx="3.2" cy="8.6" r="0.9" fill="var(--iconPrimary, #222)" />
      <circle cx="3.2" cy="5" r="0.9" fill="var(--iconPrimary, #222)" />
      <circle cx="3.2" cy="1.4" r="0.9" fill="var(--iconPrimary, #222)" />
      <circle cx="6.8" cy="8.6" r="0.9" fill="var(--iconPrimary, #222)" />
      <circle cx="6.8" cy="5" r="0.9" fill="var(--iconPrimary, #222)" />
      <circle cx="6.8" cy="1.4" r="0.9" fill="var(--iconPrimary, #222)" />
    </svg>
  );
}

function DragHandle_MSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <circle cx="3" cy="9" r="1" fill="var(--iconPrimary, #222)" />
      <circle cx="3" cy="5" r="1" fill="var(--iconPrimary, #222)" />
      <circle cx="3" cy="1" r="1" fill="var(--iconPrimary, #222)" />
      <circle cx="7" cy="9" r="1" fill="var(--iconPrimary, #222)" />
      <circle cx="7" cy="5" r="1" fill="var(--iconPrimary, #222)" />
      <circle cx="7" cy="1" r="1" fill="var(--iconPrimary, #222)" />
    </svg>
  );
}

function DragHandle_LSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <circle cx="3.8" cy="10.4" r="1.1" fill="var(--iconPrimary, #222)" />
      <circle cx="3.8" cy="6" r="1.1" fill="var(--iconPrimary, #222)" />
      <circle cx="3.8" cy="1.6" r="1.1" fill="var(--iconPrimary, #222)" />
      <circle cx="8.2" cy="10.4" r="1.1" fill="var(--iconPrimary, #222)" />
      <circle cx="8.2" cy="6" r="1.1" fill="var(--iconPrimary, #222)" />
      <circle cx="8.2" cy="1.6" r="1.1" fill="var(--iconPrimary, #222)" />
    </svg>
  );
}

function DragHandle_XLSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
      <circle cx="4.6" cy="11.8" r="1.2" fill="var(--iconPrimary, #222)" />
      <circle cx="4.6" cy="7" r="1.2" fill="var(--iconPrimary, #222)" />
      <circle cx="4.6" cy="2.2" r="1.2" fill="var(--iconPrimary, #222)" />
      <circle cx="9.4" cy="11.8" r="1.2" fill="var(--iconPrimary, #222)" />
      <circle cx="9.4" cy="7" r="1.2" fill="var(--iconPrimary, #222)" />
      <circle cx="9.4" cy="2.2" r="1.2" fill="var(--iconPrimary, #222)" />
    </svg>
  );
}

const DragHandle_S = createUIIcon(DragHandle_SSvg);
const DragHandle_M = createUIIcon(DragHandle_MSvg);
const DragHandle_L = createUIIcon(DragHandle_LSvg);
const DragHandle_XL = createUIIcon(DragHandle_XLSvg);

export default function DragHandle(props: DragHandleProps): JSX.Element {
  const { size = "M", class: className, width: _width, height: _height, ...rest } = props;
  switch (size) {
    case "S":
      return <DragHandle_S {...rest} class={className} />;
    case "M":
      return <DragHandle_M {...rest} class={className} />;
    case "L":
      return <DragHandle_L {...rest} class={className} />;
    case "XL":
      return <DragHandle_XL {...rest} class={className} />;
    default:
      return <DragHandle_M {...rest} class={className} />;
  }
}

export const DragHandleIcon = DragHandle;
