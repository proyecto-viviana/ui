import { type JSX, splitProps } from "solid-js";
import { style } from "../style" with { type: "macro" };

export interface ContentProps {
  /** Additional CSS class name. */
  class?: string;
  /** The content. */
  children?: JSX.Element;
}

// Slot chrome for dialog/panel bodies, styled from S2 tokens (neutral text, a
// `gray-300` hairline rule on the header/footer). Routed through the `style()`
// macro so the CSS ships in the package bundle for installed consumers.
const contentStyles = style({ font: "ui-sm", color: "neutral" });

/**
 * A content slot component for dialog or panel body.
 */
export function Content(props: ContentProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <div {...rest} class={[contentStyles, local.class].filter(Boolean).join(" ")}>
      {local.children}
    </div>
  );
}

export interface ViewHeaderProps {
  /** Additional CSS class name. */
  class?: string;
  /** The content. */
  children?: JSX.Element;
}

const viewHeaderStyles = style({
  font: "heading-xs",
  color: "neutral",
  paddingBottom: 12,
  borderWidth: 0,
  borderBottomWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
});

/**
 * A header slot component.
 */
export function ViewHeader(props: ViewHeaderProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <header {...rest} class={[viewHeaderStyles, local.class].filter(Boolean).join(" ")}>
      {local.children}
    </header>
  );
}

export interface ViewFooterProps {
  /** Additional CSS class name. */
  class?: string;
  /** The content. */
  children?: JSX.Element;
}

const viewFooterStyles = style({
  display: "flex",
  justifyContent: "end",
  gap: 12,
  paddingTop: 12,
  borderWidth: 0,
  borderTopWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
});

/**
 * A footer slot component.
 */
export function ViewFooter(props: ViewFooterProps): JSX.Element {
  const [local, rest] = splitProps(props, ["class", "children"]);
  return (
    <footer {...rest} class={[viewFooterStyles, local.class].filter(Boolean).join(" ")}>
      {local.children}
    </footer>
  );
}
