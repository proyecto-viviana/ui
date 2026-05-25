import { type JSX } from "solid-js";
import { mergeStyles } from "../style/runtime";
import { style } from "../style" with { type: "macro" };
import { css } from "../style/style-macro" with { type: "macro" };
import type { StyleString } from "../style";

const centerBaselineClass = style({
  display: "flex",
  alignItems: "center",
});
export const centerBaselineBefore = css(`&::before {
  content: "\\00a0";
  width: 0px;
  visibility: hidden;
}`) as StyleString;

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
      class={mergeStyles(centerBaselineClass, styles()) + " " + centerBaselineBefore}
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
