import type { Accessor, JSX } from "solid-js";

type ElementRef =
  | HTMLElement
  | undefined
  | null
  | Accessor<HTMLElement | undefined | null>
  | { current?: HTMLElement | undefined | null };

function resolveElement(ref: ElementRef): HTMLElement | undefined | null {
  if (typeof ref === "function") {
    return ref();
  }

  if (ref && typeof ref === "object" && "current" in ref) {
    return ref.current;
  }

  return ref as HTMLElement | undefined | null;
}

function resolveStyle<R>(
  style: JSX.CSSProperties | ((renderProps: R) => JSX.CSSProperties) | undefined,
  renderProps: R,
): JSX.CSSProperties {
  return typeof style === "function" ? style(renderProps) : (style ?? {});
}

export function pressScale<R extends { isPressed: boolean }>(
  ref: ElementRef,
  style?: JSX.CSSProperties | ((renderProps: R) => JSX.CSSProperties),
): (renderProps: R) => JSX.CSSProperties {
  return (renderProps) => {
    const next = { ...resolveStyle(style, renderProps) } as JSX.CSSProperties;
    const styleRecord = next as Record<string, string | number | undefined>;
    const willChange = styleRecord["will-change"] ?? "";
    styleRecord["will-change"] = `${willChange} transform`.trim();

    const element = resolveElement(ref);
    if (renderProps.isPressed && element) {
      const { width, height } = element.getBoundingClientRect();
      const perspective = Math.max(height, width / 3, 24);
      const transform = styleRecord.transform ?? "";
      styleRecord.transform =
        `${transform} perspective(${perspective}px) translate3d(0, 0, -2px)`.trim();
    }

    return next;
  };
}
