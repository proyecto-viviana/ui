export const badgeVariantOptions = [
  "accent",
  "informative",
  "neutral",
  "positive",
  "notice",
  "negative",
  "gray",
  "red",
  "orange",
  "yellow",
  "chartreuse",
  "celery",
  "green",
  "seafoam",
  "cyan",
  "blue",
  "indigo",
  "purple",
  "fuchsia",
  "magenta",
  "pink",
  "turquoise",
  "brown",
  "cinnamon",
  "silver",
] as const;
export const badgeFillStyleOptions = ["bold", "subtle", "outline"] as const;
export const badgeSizeOptions = ["S", "M", "L", "XL"] as const;
export const badgeOverflowModeOptions = ["wrap", "truncate"] as const;
export const badgeIconPlacementOptions = ["none", "start"] as const;

export type BadgeDemoVariant = (typeof badgeVariantOptions)[number];
export type BadgeDemoFillStyle = (typeof badgeFillStyleOptions)[number];
export type BadgeDemoSize = (typeof badgeSizeOptions)[number];
export type BadgeDemoOverflowMode = (typeof badgeOverflowModeOptions)[number];
export type BadgeDemoIconPlacement = (typeof badgeIconPlacementOptions)[number];

export interface BadgeDemoProps {
  children: string;
  variant: BadgeDemoVariant;
  fillStyle: BadgeDemoFillStyle;
  size: BadgeDemoSize;
  overflowMode: BadgeDemoOverflowMode;
  iconPlacement: BadgeDemoIconPlacement;
}

export const badgeDemoDefaults: BadgeDemoProps = {
  children: "Published",
  variant: "neutral",
  fillStyle: "bold",
  size: "S",
  overflowMode: "wrap",
  iconPlacement: "none",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

export function normalizeBadgeDemoProps(props: Partial<BadgeDemoProps> = {}): BadgeDemoProps {
  return {
    children: typeof props.children === "string" ? props.children : badgeDemoDefaults.children,
    variant: isOneOf(props.variant, badgeVariantOptions)
      ? props.variant
      : badgeDemoDefaults.variant,
    fillStyle: isOneOf(props.fillStyle, badgeFillStyleOptions)
      ? props.fillStyle
      : badgeDemoDefaults.fillStyle,
    size: isOneOf(props.size, badgeSizeOptions) ? props.size : badgeDemoDefaults.size,
    overflowMode: isOneOf(props.overflowMode, badgeOverflowModeOptions)
      ? props.overflowMode
      : badgeDemoDefaults.overflowMode,
    iconPlacement: isOneOf(props.iconPlacement, badgeIconPlacementOptions)
      ? props.iconPlacement
      : badgeDemoDefaults.iconPlacement,
  };
}

export function badgeDemoPropsFromSearch(search: string): BadgeDemoProps {
  const params = new URLSearchParams(search);
  const variant = params.get("variant");
  const fillStyle = params.get("fillStyle");
  const size = params.get("size");
  const overflowMode = params.get("overflowMode");
  const iconPlacement = params.get("iconPlacement");

  return normalizeBadgeDemoProps({
    children: params.get("children") || badgeDemoDefaults.children,
    variant: isOneOf(variant, badgeVariantOptions) ? variant : badgeDemoDefaults.variant,
    fillStyle: isOneOf(fillStyle, badgeFillStyleOptions) ? fillStyle : badgeDemoDefaults.fillStyle,
    size: isOneOf(size, badgeSizeOptions) ? size : badgeDemoDefaults.size,
    overflowMode: isOneOf(overflowMode, badgeOverflowModeOptions)
      ? overflowMode
      : badgeDemoDefaults.overflowMode,
    iconPlacement: isOneOf(iconPlacement, badgeIconPlacementOptions)
      ? iconPlacement
      : badgeDemoDefaults.iconPlacement,
  });
}

export function badgeDemoPropsFromWindow(): BadgeDemoProps {
  if (typeof window === "undefined") {
    return badgeDemoDefaults;
  }

  return badgeDemoPropsFromSearch(window.location.search);
}

export function serializeBadgeDemoProps(props: BadgeDemoProps): string {
  return JSON.stringify(normalizeBadgeDemoProps(props));
}
