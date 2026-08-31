/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Email.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Email.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function EmailIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.75 2.993H3.25C2.01 2.993 1 4.003 1 5.243v9.5c0 1.24 1.01 2.25 2.25 2.25h13.5c1.24 0 2.25-1.01 2.25-2.25v-9.5c0-1.24-1.01-2.25-2.25-2.25m-.42 1.5-5.838 5.083c-.28.244-.704.244-.985 0L3.67 4.493zm.42 11H3.25c-.413 0-.75-.337-.75-.75V5.462l6.021 5.245c.422.367.95.55 1.479.55s1.057-.183 1.478-.55L17.5 5.462v9.281c0 .413-.337.75-.75.75"
      />
    </svg>
  );
}

export type EmailIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const EmailIcon = createIcon(EmailIconSvg);
export default EmailIcon;
