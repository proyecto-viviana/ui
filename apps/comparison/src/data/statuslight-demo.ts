export const statusLightVariantOptions = [
  "informative",
  "neutral",
  "positive",
  "notice",
  "negative",
  "yellow",
  "chartreuse",
  "celery",
  "seafoam",
  "cyan",
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
export const statusLightSizeOptions = ["S", "M", "L", "XL"] as const;
export const statusLightRoleOptions = ["", "status"] as const;

export type StatusLightDemoVariant = (typeof statusLightVariantOptions)[number];
export type StatusLightDemoSize = (typeof statusLightSizeOptions)[number];
export type StatusLightDemoRole = (typeof statusLightRoleOptions)[number];

export interface StatusLightDemoProps {
  children: string;
  variant: StatusLightDemoVariant;
  size: StatusLightDemoSize;
  role: StatusLightDemoRole;
}

export const statusLightDemoDefaults: StatusLightDemoProps = {
  children: "Sync complete",
  variant: "neutral",
  size: "M",
  role: "",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

export function normalizeStatusLightDemoProps(
  props: Partial<StatusLightDemoProps> = {},
): StatusLightDemoProps {
  return {
    children:
      typeof props.children === "string" && props.children.length > 0
        ? props.children
        : statusLightDemoDefaults.children,
    variant: isOneOf(props.variant, statusLightVariantOptions)
      ? props.variant
      : statusLightDemoDefaults.variant,
    size: isOneOf(props.size, statusLightSizeOptions) ? props.size : statusLightDemoDefaults.size,
    role: isOneOf(props.role, statusLightRoleOptions) ? props.role : statusLightDemoDefaults.role,
  };
}

export function statusLightDemoPropsFromSearch(search: string): StatusLightDemoProps {
  const params = new URLSearchParams(search);
  const variant = params.get("variant");
  const size = params.get("size");
  const role = params.get("role");

  return normalizeStatusLightDemoProps({
    children: params.get("children") || statusLightDemoDefaults.children,
    variant: isOneOf(variant, statusLightVariantOptions)
      ? variant
      : statusLightDemoDefaults.variant,
    size: isOneOf(size, statusLightSizeOptions) ? size : statusLightDemoDefaults.size,
    role: isOneOf(role, statusLightRoleOptions) ? role : statusLightDemoDefaults.role,
  });
}

export function statusLightDemoPropsFromWindow(): StatusLightDemoProps {
  if (typeof window === "undefined") {
    return statusLightDemoDefaults;
  }

  return statusLightDemoPropsFromSearch(window.location.search);
}

export function serializeStatusLightDemoProps(props: StatusLightDemoProps): string {
  return JSON.stringify(normalizeStatusLightDemoProps(props));
}
