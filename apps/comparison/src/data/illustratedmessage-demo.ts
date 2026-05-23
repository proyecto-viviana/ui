export const illustratedMessageSizeOptions = ["S", "M", "L"] as const;
export const illustratedMessageOrientationOptions = ["vertical", "horizontal"] as const;

export type IllustratedMessageDemoSize = (typeof illustratedMessageSizeOptions)[number];
export type IllustratedMessageDemoOrientation =
  (typeof illustratedMessageOrientationOptions)[number];

export interface IllustratedMessageDemoProps {
  size: IllustratedMessageDemoSize;
  orientation: IllustratedMessageDemoOrientation;
  withActions: boolean;
}

export const illustratedMessageDemoDefaults: IllustratedMessageDemoProps = {
  size: "M",
  orientation: "vertical",
  withActions: true,
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

function booleanParam(value: string | null | undefined) {
  return value === "true" || value === "on" || value === "1";
}

export function normalizeIllustratedMessageDemoProps(
  props: Partial<IllustratedMessageDemoProps> = {},
): IllustratedMessageDemoProps {
  return {
    size: isOneOf(props.size, illustratedMessageSizeOptions)
      ? props.size
      : illustratedMessageDemoDefaults.size,
    orientation: isOneOf(props.orientation, illustratedMessageOrientationOptions)
      ? props.orientation
      : illustratedMessageDemoDefaults.orientation,
    withActions: props.withActions ?? illustratedMessageDemoDefaults.withActions,
  };
}

export function illustratedMessageDemoPropsFromSearch(search: string): IllustratedMessageDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const orientation = params.get("orientation");

  return normalizeIllustratedMessageDemoProps({
    size: isOneOf(size, illustratedMessageSizeOptions) ? size : illustratedMessageDemoDefaults.size,
    orientation: isOneOf(orientation, illustratedMessageOrientationOptions)
      ? orientation
      : illustratedMessageDemoDefaults.orientation,
    withActions: params.has("withActions")
      ? booleanParam(params.get("withActions"))
      : illustratedMessageDemoDefaults.withActions,
  });
}

export function illustratedMessageDemoPropsFromWindow(): IllustratedMessageDemoProps {
  if (typeof window === "undefined") {
    return illustratedMessageDemoDefaults;
  }

  return illustratedMessageDemoPropsFromSearch(window.location.search);
}

export function serializeIllustratedMessageDemoProps(props: IllustratedMessageDemoProps): string {
  return JSON.stringify(normalizeIllustratedMessageDemoProps(props));
}
