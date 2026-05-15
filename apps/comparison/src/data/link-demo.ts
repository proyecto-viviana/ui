export const linkVariantOptions = ["primary", "secondary"] as const;
export const linkStaticColorOptions = ["", "black", "white", "auto"] as const;

export type LinkDemoVariant = (typeof linkVariantOptions)[number];
export type LinkDemoStaticColor = Exclude<(typeof linkStaticColorOptions)[number], "">;

export interface LinkDemoProps {
  children: string;
  href: string;
  variant: LinkDemoVariant;
  staticColor?: LinkDemoStaticColor;
  isStandalone: boolean;
  isQuiet: boolean;
}

export const linkDemoDefaults: LinkDemoProps = {
  children: "View project",
  href: "https://example.com/project",
  variant: "primary",
  staticColor: undefined,
  isStandalone: false,
  isQuiet: false,
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

export function normalizeLinkDemoProps(props: Partial<LinkDemoProps> = {}): LinkDemoProps {
  return {
    children: typeof props.children === "string" ? props.children : linkDemoDefaults.children,
    href: typeof props.href === "string" ? props.href : linkDemoDefaults.href,
    variant: isOneOf(props.variant, linkVariantOptions) ? props.variant : linkDemoDefaults.variant,
    staticColor: isOneOf(props.staticColor, linkStaticColorOptions)
      ? props.staticColor || undefined
      : undefined,
    isStandalone: props.isStandalone === true,
    isQuiet: props.isQuiet === true,
  };
}

export function linkDemoPropsFromSearch(search: string): LinkDemoProps {
  const params = new URLSearchParams(search);
  const variant = params.get("variant");
  const staticColor = params.get("staticColor");

  return normalizeLinkDemoProps({
    children: params.get("children") || linkDemoDefaults.children,
    href: params.get("href") || linkDemoDefaults.href,
    variant: isOneOf(variant, linkVariantOptions) ? variant : linkDemoDefaults.variant,
    staticColor: isOneOf(staticColor, linkStaticColorOptions)
      ? staticColor || undefined
      : undefined,
    isStandalone: booleanParam(params.get("isStandalone")),
    isQuiet: booleanParam(params.get("isQuiet")),
  });
}

export function linkDemoPropsFromWindow(): LinkDemoProps {
  if (typeof window === "undefined") {
    return linkDemoDefaults;
  }

  return linkDemoPropsFromSearch(window.location.search);
}

export function serializeLinkDemoProps(props: LinkDemoProps): string {
  return JSON.stringify(normalizeLinkDemoProps(props));
}
