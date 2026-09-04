/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Brand.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Brand.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function BrandIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10.007 19q-.126 0-.253-.004c-4.422-.25-7.818-3.902-7.753-8.311V3.25c0-1.24 1.01-2.25 2.25-2.25H15.75C16.99 1 18 2.01 18 3.25l-.003 7.99c-.066 2.14-.959 4.123-2.516 5.587C13.985 18.233 12.05 19 10.007 19M4.25 2.5c-.413 0-.75.337-.75.75v7.445c-.054 3.615 2.722 6.598 6.32 6.802 1.706.052 3.367-.573 4.632-1.763s1.991-2.8 2.044-4.537L16.5 11V3.25c0-.413-.337-.75-.75-.75z"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M14.25 12h-5.5c-.265 0-.51-.14-.645-.367-.135-.228-.14-.51-.013-.742l2.75-5.04c.133-.24.385-.39.659-.39s.527.15.658.39l2.75 5.04c.126.232.121.514-.014.742s-.38.367-.645.367m-4.236-1.5h2.972l-1.485-2.724zM5.749 12c-.121 0-.244-.03-.358-.092-.364-.198-.497-.654-.3-1.017l1.982-3.63c.198-.363.654-.497 1.018-.298.363.198.497.654.299 1.017l-1.982 3.63c-.136.248-.393.39-.659.39"
      />
    </svg>
  );
}

export type BrandIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const BrandIcon = createIcon(BrandIconSvg);
export default BrandIcon;
