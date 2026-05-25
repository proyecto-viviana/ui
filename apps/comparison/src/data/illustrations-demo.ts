export const illustrationPrimitiveSizeOptions = ["S", "M", "L"] as const;

export type IllustrationPrimitiveSize = (typeof illustrationPrimitiveSizeOptions)[number];

export interface IllustrationsDemoProps {
  ariaLabel: string;
  ariaHidden: boolean;
  slot: string;
  size: IllustrationPrimitiveSize;
  showDecorative: boolean;
  decorativeSize: IllustrationPrimitiveSize;
  showSkeleton: boolean;
  skeletonSize: IllustrationPrimitiveSize;
}

export const illustrationsDemoDefaults: IllustrationsDemoProps = {
  ariaLabel: "Planning illustration",
  ariaHidden: false,
  slot: "",
  size: "S",
  showDecorative: true,
  decorativeSize: "M",
  showSkeleton: true,
  skeletonSize: "L",
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

function textProp(value: string | null | undefined, fallback: string) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

export function normalizeIllustrationsDemoProps(
  props: Partial<IllustrationsDemoProps> = {},
): IllustrationsDemoProps {
  return {
    ariaLabel: textProp(props.ariaLabel, illustrationsDemoDefaults.ariaLabel),
    ariaHidden: props.ariaHidden ?? illustrationsDemoDefaults.ariaHidden,
    slot: typeof props.slot === "string" ? props.slot : illustrationsDemoDefaults.slot,
    size: isOneOf(props.size, illustrationPrimitiveSizeOptions)
      ? props.size
      : illustrationsDemoDefaults.size,
    showDecorative: props.showDecorative ?? illustrationsDemoDefaults.showDecorative,
    decorativeSize: isOneOf(props.decorativeSize, illustrationPrimitiveSizeOptions)
      ? props.decorativeSize
      : illustrationsDemoDefaults.decorativeSize,
    showSkeleton: props.showSkeleton ?? illustrationsDemoDefaults.showSkeleton,
    skeletonSize: isOneOf(props.skeletonSize, illustrationPrimitiveSizeOptions)
      ? props.skeletonSize
      : illustrationsDemoDefaults.skeletonSize,
  };
}

export function illustrationsDemoPropsFromSearch(search: string): IllustrationsDemoProps {
  const params = new URLSearchParams(search);
  const size = params.get("size");
  const decorativeSize = params.get("decorativeSize");
  const skeletonSize = params.get("skeletonSize");

  return normalizeIllustrationsDemoProps({
    ariaLabel: params.get("ariaLabel") || illustrationsDemoDefaults.ariaLabel,
    ariaHidden: params.has("ariaHidden")
      ? booleanParam(params.get("ariaHidden"))
      : illustrationsDemoDefaults.ariaHidden,
    slot: params.get("slot") ?? illustrationsDemoDefaults.slot,
    size: isOneOf(size, illustrationPrimitiveSizeOptions) ? size : illustrationsDemoDefaults.size,
    showDecorative: params.has("showDecorative")
      ? booleanParam(params.get("showDecorative"))
      : illustrationsDemoDefaults.showDecorative,
    decorativeSize: isOneOf(decorativeSize, illustrationPrimitiveSizeOptions)
      ? decorativeSize
      : illustrationsDemoDefaults.decorativeSize,
    showSkeleton: params.has("showSkeleton")
      ? booleanParam(params.get("showSkeleton"))
      : illustrationsDemoDefaults.showSkeleton,
    skeletonSize: isOneOf(skeletonSize, illustrationPrimitiveSizeOptions)
      ? skeletonSize
      : illustrationsDemoDefaults.skeletonSize,
  });
}

export function illustrationsDemoPropsFromWindow(): IllustrationsDemoProps {
  if (typeof window === "undefined") {
    return illustrationsDemoDefaults;
  }

  return illustrationsDemoPropsFromSearch(window.location.search);
}

export function serializeIllustrationsDemoProps(props: IllustrationsDemoProps): string {
  return JSON.stringify(normalizeIllustrationsDemoProps(props));
}
