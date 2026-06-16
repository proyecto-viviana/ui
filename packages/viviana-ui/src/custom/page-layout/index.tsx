import { type JSX, splitProps } from "solid-js";
// Styled via the S2 style() macro through viviana's own seam (../../style →
// src/style.ts). A full-height page shell painted in Silapse surface/text
// colors; `withHeader` reserves top space so a fixed header doesn't overlap.
import { style } from "../../style" with { type: "macro" };

export interface PageLayoutProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element;
  withHeader?: boolean;
}

const page = style<{ isWithHeader: boolean }>({
  display: "flex",
  flexDirection: "column",
  minHeight: "screen",
  width: "full",
  backgroundColor: "[var(--color-background)]",
  color: "[var(--color-text)]",
  paddingTop: { isWithHeader: 64 },
});

export function PageLayout(props: PageLayoutProps) {
  const [local, rest] = splitProps(props, ["class", "withHeader"]);

  return (
    <div
      class={`${page({ isWithHeader: local.withHeader ?? false })} ${local.class ?? ""}`}
      {...rest}
    >
      {props.children}
    </div>
  );
}
