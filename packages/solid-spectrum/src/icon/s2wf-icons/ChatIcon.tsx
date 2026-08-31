/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/Chat.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/Chat.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ChatIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M16.75 2h-8C7.507 2 6.5 3.007 6.5 4.25v.5c0 .414.336.75.75.75S8 5.164 8 4.75v-.5c0-.413.337-.75.75-.75h8c.413 0 .75.338.75.75v4.5c0 .413-.337.75-.75.75H16c-.414 0-.75.336-.75.75v1.651L13.5 10.36V9.25C13.5 8.007 12.493 7 11.25 7h-8C2.007 7 1 8.007 1 9.25v4.5C1 14.99 2.01 16 3.25 16v2.137c0 .383.228.723.58.869q.182.073.365.072c.239 0 .466-.089.618-.245L8.033 16h3.217c1.243 0 2.25-1.007 2.25-2.25v-1.393l1.64 1.444c.18.18.42.275.665.275.122 0 .246-.023.364-.072.352-.147.581-.486.581-.867V11C17.99 11 19 9.99 19 8.75v-4.5C19 3.007 17.993 2 16.75 2M12 13.75c0 .413-.337.75-.75.75H7.467L4.75 16.894V15.25c0-.414-.336-.75-.75-.75h-.75c-.412 0-.75-.337-.75-.75v-4.5c0-.412.338-.75.75-.75h8c.413 0 .75.338.75.75z"
      />
    </svg>
  );
}

export type ChatIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ChatIcon = createIcon(ChatIconSvg);
export default ChatIcon;
