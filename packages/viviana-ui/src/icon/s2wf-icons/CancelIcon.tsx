/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.7.0/icons/Cancel.mjs
// Generator input: @react-spectrum/s2@1.7.0/icons/Cancel.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function CancelIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.201 16.166c1.574-1.583 2.549-3.763 2.549-6.166 0-4.825-3.925-8.75-8.75-8.75-2.403 0-4.583.975-6.166 2.549q-.01.007-.021.014c-.011.007-.008.015-.014.021C2.225 5.417 1.25 7.597 1.25 10c0 4.825 3.925 8.75 8.75 8.75 2.403 0 4.583-.975 6.166-2.549.006-.006.015-.008.021-.014s.008-.015.014-.021M17.25 10c0 1.73-.61 3.317-1.625 4.565L5.435 4.375C6.683 3.36 8.271 2.75 10 2.75c3.998 0 7.25 3.252 7.25 7.25m-14.5 0c0-1.73.61-3.317 1.625-4.565l10.19 10.19C13.317 16.64 11.729 17.25 10 17.25c-3.998 0-7.25-3.252-7.25-7.25"
      />
    </svg>
  );
}

export type CancelIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const CancelIcon = createIcon(CancelIconSvg);
export default CancelIcon;
