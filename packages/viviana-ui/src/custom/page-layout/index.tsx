import { JSX, splitProps } from "solid-js";

export interface PageLayoutProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element;
  withHeader?: boolean;
}

export function PageLayout(props: PageLayoutProps) {
  const [local, rest] = splitProps(props, ["class", "withHeader"]);

  const classes = () => {
    const base = "vui-page";
    const header = local.withHeader ? "vui-page--with-header" : "";
    const custom = local.class ?? "";
    return [base, header, custom].filter(Boolean).join(" ");
  };

  return (
    <div class={classes()} {...rest}>
      {props.children}
    </div>
  );
}
