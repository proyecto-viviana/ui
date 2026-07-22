import { type JSX, splitProps } from "solid-js";

export interface ViewProps extends JSX.HTMLAttributes<HTMLDivElement> {
  class?: string;
}

export function View(props: ViewProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "children"]);
  return (
    <div {...domProps} class={`vui-view ${local.class ?? ""}`}>
      {local.children}
    </div>
  );
}

export {
  Content,
  ViewHeader,
  ViewHeader as Header,
  ViewFooter,
  ViewFooter as Footer,
} from "./Content";
export type { ContentProps, ViewHeaderProps, ViewFooterProps } from "./Content";
