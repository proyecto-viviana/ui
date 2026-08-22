/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: @react-spectrum/s2@1.6.0/icons/ColorFill.mjs
// Generator input: @react-spectrum/s2@1.6.0/icons/ColorFill.cjs

import { type JSX } from "solid-js";
import { createIcon } from "../spectrum-icon";

function ColorFillIconSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="M10.911 9.422c-.192 0-.384-.073-.53-.22L3.679 2.501c-.293-.293-.293-.768 0-1.06s.767-.294 1.06 0l6.702 6.7c.293.294.293.768 0 1.061-.146.147-.337.22-.53.22"
      />
      <path
        fill="var(--iconPrimary, light-dark(rgb(41, 41, 41), rgb(219, 219, 219)))"
        d="M17.583 9.169c-.321-.394-.717-.764-1.087-1.059l-.003-.004-4.65-4.647c-.529-.53-1.286-.759-2.02-.618-.407.079-.673.472-.594.879.079.406.479.67.88.593.242-.05.496.029.674.207l4.65 4.648c.142.142.22.33.22.53s-.078.388-.22.53L9.432 16.23c-.293.293-.768.293-1.06 0l-4.65-4.648c-.293-.293-.293-.769 0-1.061l2.397-2.397c.293-.293.293-.768 0-1.06s-.767-.294-1.06 0L2.66 9.46c-.425.425-.659.99-.659 1.59 0 .602.234 1.168.66 1.593L7.31 17.29c.424.425.99.66 1.59.66s1.166-.235 1.591-.66l6.003-6.003c.176-.176.31-.38.417-.596.464 2.394-.724 3.437-.92 4.544-.128.789.408 1.532 1.197 1.66q.242.038.483-.004c.834-.077 1.39-.626 1.344-1.938s-.598-4.764-1.432-5.785"
      />
    </svg>
  );
}

export type ColorFillIconProps = JSX.SvgSVGAttributes<SVGSVGElement>;
export const ColorFillIcon = createIcon(ColorFillIconSvg);
export default ColorFillIcon;
