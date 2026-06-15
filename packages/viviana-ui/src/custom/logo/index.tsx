import { JSX } from "solid-js";

export type LogoSize = "sm" | "md" | "lg" | "xl";

export interface LogoProps {
  firstWord?: string;
  secondWord?: string;
  size?: LogoSize;
  inverted?: boolean;
  class?: string;
}

export function Logo(props: LogoProps): JSX.Element {
  const sizeClass = () => {
    switch (props.size) {
      case "sm":
        return "vui-logo--sm";
      case "lg":
        return "vui-logo--lg";
      case "xl":
        return "vui-logo--xl";
      case "md":
      default:
        return "vui-logo--md";
    }
  };

  const firstWord = () => props.firstWord ?? "Proyecto";
  const secondWord = () => props.secondWord ?? "Viviana";

  return (
    <span
      class={`vui-logo ${sizeClass()} ${props.inverted ? "vui-logo--inverted" : ""} ${props.class ?? ""}`}
    >
      <span class="vui-logo__first" data-text={props.inverted ? firstWord() : undefined}>
        {firstWord()}
      </span>
      <span class="vui-logo__second" data-text={props.inverted ? undefined : secondWord()}>
        {secondWord()}
      </span>
    </span>
  );
}
