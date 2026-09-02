/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Publish.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Publish.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function PublishIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M18.78 1.219c-.213-.211-.528-.276-.805-.166l-16.5 6.509c-.27.105-.454.358-.473.647s.129.563.382.704l6.255 3.495 3.521 6.212c.134.235.384.38.652.38l.054-.002c.29-.02.54-.206.645-.476l6.437-16.5c.109-.277.042-.593-.169-.803M15.17 3.77l-7.114 7.152-4.559-2.547zm-3.482 12.737L9.12 11.98l7.129-7.167z"
      />
    </svg>
  );
}

export type PublishIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const PublishIcon = createIcon(PublishIconSvg);
export default PublishIcon;
