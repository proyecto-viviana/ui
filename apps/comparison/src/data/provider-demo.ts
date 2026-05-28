export const providerColorSchemeOptions = ["dark", "light"] as const;
export const providerBackgroundOptions = ["base", "layer-1", "layer-2"] as const;

export type ProviderDemoColorScheme = (typeof providerColorSchemeOptions)[number];
export type ProviderDemoBackground = (typeof providerBackgroundOptions)[number];

export interface ProviderDemoProps {
  colorScheme: ProviderDemoColorScheme;
  background: ProviderDemoBackground;
}

export const providerDemoDefaults: ProviderDemoProps = {
  colorScheme: "dark",
  background: "base",
};

function isOneOf<T extends readonly string[]>(
  value: string | null | undefined,
  options: T,
): value is T[number] {
  return value != null && options.includes(value);
}

export function normalizeProviderDemoProps(
  props: Partial<ProviderDemoProps> = {},
): ProviderDemoProps {
  return {
    colorScheme: isOneOf(props.colorScheme, providerColorSchemeOptions)
      ? props.colorScheme
      : providerDemoDefaults.colorScheme,
    background: isOneOf(props.background, providerBackgroundOptions)
      ? props.background
      : providerDemoDefaults.background,
  };
}

export function providerDemoPropsFromSearch(search: string): ProviderDemoProps {
  const params = new URLSearchParams(search);
  const colorScheme = params.get("colorScheme");
  const background = params.get("background");

  return normalizeProviderDemoProps({
    colorScheme: isOneOf(colorScheme, providerColorSchemeOptions)
      ? colorScheme
      : providerDemoDefaults.colorScheme,
    background: isOneOf(background, providerBackgroundOptions)
      ? background
      : providerDemoDefaults.background,
  });
}

export function providerDemoPropsFromWindow(): ProviderDemoProps {
  if (typeof window === "undefined") {
    return providerDemoDefaults;
  }

  return providerDemoPropsFromSearch(window.location.search);
}

export function serializeProviderDemoProps(props: ProviderDemoProps): string {
  return JSON.stringify(normalizeProviderDemoProps(props));
}
