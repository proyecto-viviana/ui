export const dividerOrientationOptions = ["horizontal", "vertical"] as const;
export const dividerSizeOptions = ["S", "M", "L"] as const;
export const dividerStaticColorOptions = ["", "auto", "black", "white"] as const;

export type DividerDemoOrientation = (typeof dividerOrientationOptions)[number];
export type DividerDemoSize = (typeof dividerSizeOptions)[number];
export type DividerDemoStaticColor = Exclude<(typeof dividerStaticColorOptions)[number], "">;

export interface DividerDemoProps {
  orientation: DividerDemoOrientation;
  size: DividerDemoSize;
  staticColor?: DividerDemoStaticColor;
}

export const dividerDemoDefaults: DividerDemoProps = {
  orientation: "horizontal",
  size: "M",
  staticColor: undefined,
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

export function normalizeDividerDemoProps(props: Partial<DividerDemoProps> = {}): DividerDemoProps {
  return {
    orientation: isOneOf(props.orientation, dividerOrientationOptions)
      ? props.orientation
      : dividerDemoDefaults.orientation,
    size: isOneOf(props.size, dividerSizeOptions) ? props.size : dividerDemoDefaults.size,
    staticColor: isOneOf(props.staticColor, dividerStaticColorOptions)
      ? props.staticColor || undefined
      : undefined,
  };
}

export function dividerDemoPropsFromSearch(search: string): DividerDemoProps {
  const params = new URLSearchParams(search);
  const orientation = params.get("orientation");
  const size = params.get("size");
  const staticColor = params.get("staticColor");

  return normalizeDividerDemoProps({
    orientation: isOneOf(orientation, dividerOrientationOptions)
      ? orientation
      : dividerDemoDefaults.orientation,
    size: isOneOf(size, dividerSizeOptions) ? size : dividerDemoDefaults.size,
    staticColor: isOneOf(staticColor, dividerStaticColorOptions)
      ? staticColor || undefined
      : undefined,
  });
}

export function dividerDemoPropsFromWindow(): DividerDemoProps {
  if (typeof window === "undefined") {
    return dividerDemoDefaults;
  }

  return dividerDemoPropsFromSearch(window.location.search);
}

export function serializeDividerDemoProps(props: DividerDemoProps): string {
  return JSON.stringify(normalizeDividerDemoProps(props));
}
