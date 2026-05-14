import { type JSX } from "solid-js";
import { mergeStyles } from "../s2-style/runtime";
import { addS2CssAsset, css } from "../s2-style/style-macro";
import type { StyleString } from "../s2-style";

const centerBaselineClass = css("display: flex; align-items: center;");
export const centerBaselineBefore = centerBaselineClass as StyleString;

addS2CssAsset(`@layer _.a {
  .${centerBaselineClass}::before {
    content: "\\00a0";
    width: 0px;
    visibility: hidden;
  }
}`);

export interface CenterBaselineProps {
  style?: JSX.CSSProperties;
  styles?: StyleString | (() => StyleString | undefined);
  children: JSX.Element;
  slot?: string;
}

export function CenterBaseline(props: CenterBaselineProps): JSX.Element {
  const styles = () => (typeof props.styles === "function" ? props.styles() : props.styles);

  return (
    <div
      slot={props.slot}
      style={props.style}
      class={mergeStyles(centerBaselineClass as StyleString, styles())}
    >
      {props.children}
    </div>
  );
}

export function centerBaseline(
  props: Omit<CenterBaselineProps, "children"> = {},
): (icon: JSX.Element) => JSX.Element {
  return (icon: JSX.Element) => <CenterBaseline {...props}>{icon}</CenterBaseline>;
}
