/*
 * Auto-generated from vendored React Spectrum S2 icon sources.
 * Do not edit by hand.
 */

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ContrastIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m10,18.7793c-4.8252,0-8.75-3.9248-8.75-8.75S5.1748,1.2793,10,1.2793s8.75,3.9248,8.75,8.75-3.9248,8.75-8.75,8.75Zm0-16c-3.99805,0-7.25,3.25195-7.25,7.25s3.25195,7.25,7.25,7.25,7.25-3.25195,7.25-7.25-3.25195-7.25-7.25-7.25Z"
        fill="var(--iconPrimary, #222)"
      />
      <path
        d="m10.00001,14.38357c0,.65333.61464,1.12149,1.25098.97349,2.43486-.5663,4.24901-2.74982,4.24901-5.35705s-1.81415-4.79075-4.24901-5.35705c-.63635-.148-1.25098.32016-1.25098.97349v8.76713Z"
        fill="var(--iconPrimary, #222)"
      />
    </svg>
  );
}

export type ContrastIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ContrastIcon = createIcon(ContrastIconSvg);
export default ContrastIcon;
