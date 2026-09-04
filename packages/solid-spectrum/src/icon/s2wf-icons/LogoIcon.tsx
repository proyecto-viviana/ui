/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Logo.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Logo.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function LogoIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M14.25 12.75h-5.5c-.265 0-.51-.14-.645-.367s-.14-.51-.013-.742l2.75-5.04c.132-.24.385-.39.659-.39s.527.15.658.39l2.75 5.04c.126.232.121.514-.014.742s-.38.367-.645.367m-4.236-1.5h2.972l-1.485-2.724zM5.75 12.75c-.122 0-.245-.03-.36-.092-.363-.198-.497-.654-.298-1.017l1.981-3.63c.199-.363.655-.497 1.018-.298.364.198.497.654.299 1.017l-1.982 3.63c-.136.248-.393.39-.658.39"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M10 18.75c-.115 0-.23-.026-.336-.08l-7.73-3.874c-.255-.128-.415-.387-.415-.671v-8.25c0-.284.16-.543.414-.67l7.731-3.876c.211-.105.461-.105.672 0l7.73 3.875c.255.128.415.387.415.671v8.25c0 .284-.16.543-.414.67l-7.731 3.876q-.16.08-.336.079m-6.981-5.088 6.981 3.5 6.981-3.5V6.338L10 2.838l-6.981 3.5z"
      />
    </svg>
  );
}

export type LogoIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const LogoIcon = createIcon(LogoIconSvg);
export default LogoIcon;
