/*
 * Auto-generated from the pinned @react-spectrum/s2 icon inventory.
 * Do not edit by hand.
 */
// Generator input: packages/solid-spectrum/src/icon/assets/ui-icons/S2_ArrowSize100.svg
// Generator input: packages/solid-spectrum/src/icon/assets/ui-icons/S2_ArrowSize400.svg

import { type JSX } from "solid-js";
import { createUIIcon } from "../spectrum-icon";

export type ArrowProps = JSX.SvgSVGAttributes<SVGSVGElement> & {
  size?: "M" | "XXL";
};

function Arrow_MSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m9.94946,4.99658c-.00024-.052-.02026-.10132-.02954-.15259-.01074-.05835-.0127-.11768-.03516-.17322-.00122-.00281-.00146-.00574-.00269-.00867-.03198-.07642-.08447-.13965-.13574-.20312-.01831-.02295-.02612-.0509-.04712-.07227l-.00488-.005c-.00024-.00024-.00049-.00049-.00098-.00085l-3.06934-3.11914c-.33984-.3457-.89355-.34863-1.2373-.01074-.34473.33887-.34961.89355-.01074,1.2373l1.6106,1.63672H.9248c-.4834,0-.875.3916-.875.875s.3916.875.875.875h6.06177l-1.6106,1.63672c-.33887.34375-.33398.89844.01074,1.2373.16992.16699.3916.25098.61328.25098.22656,0,.45215-.08691.62402-.26172l3.06934-3.11914c.00049-.00037.00073-.00061.00098-.00085l.00488-.005c.021-.02136.02881-.04932.04712-.07227.05127-.06348.10376-.12671.13574-.20312.00122-.00293.00146-.00586.00269-.00867.02246-.05554.02441-.11487.03516-.17322.00928-.05127.0293-.10059.02954-.15259,0-.00122.00073-.0022.00073-.00342s-.00073-.0022-.00073-.00342Z"
        fill="var(--iconPrimary, #222)"
      />
    </svg>
  );
}

function Arrow_XXLSvg(props: JSX.SvgSVGAttributes<SVGSVGElement>): JSX.Element {
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
        d="m14.78552,8.3783c.10016-.24194.10016-.51477,0-.75671-.05017-.12085-.12256-.2301-.21375-.32129l-4.63037-4.63037c-.38574-.38672-1.0127-.38672-1.39844,0-.38623.38574-.38623,1.0127,0,1.39844l2.94238,2.94238H1.87012c-.54639,0-.98877.44336-.98877.98926s.44238.98926.98877.98926h9.61523l-2.94238,2.94238c-.38623.38574-.38623,1.0127,0,1.39844.19287.19336.44629.29004.69922.29004s.50635-.09668.69922-.29004l4.63037-4.63037c.09125-.09119.16357-.20044.21375-.32141Z"
        fill="var(--iconPrimary, #222)"
      />
    </svg>
  );
}

const Arrow_M = createUIIcon(Arrow_MSvg);
const Arrow_XXL = createUIIcon(Arrow_XXLSvg);

export default function Arrow(props: ArrowProps): JSX.Element {
  const { size = "M", class: className, width: _width, height: _height, ...rest } = props;
  switch (size) {
    case "M":
      return <Arrow_M {...rest} class={className} />;
    case "XXL":
      return <Arrow_XXL {...rest} class={className} />;
    default:
      return <Arrow_M {...rest} class={className} />;
  }
}

export const ArrowIcon = Arrow;
