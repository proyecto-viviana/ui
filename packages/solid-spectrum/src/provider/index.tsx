import {
  type JSX,
  type ParentProps,
  createContext,
  createMemo,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import {
  I18nProvider,
  ModalProvider,
  isRTL,
  useLocale,
  useModalProvider,
  type Direction,
} from "@proyecto-viviana/solidaria";
import { mergeStyles } from "../style/runtime";
import { setColorScheme, style as s2Style } from "../style" with { type: "macro" };
import type { StyleString } from "../style";
import { generateDefaultColorSchemeStyles } from "../s2-internal/page.macro" with { type: "macro" };

export type ColorScheme = "light" | "dark" | "light dark";
export type Scale = "medium" | "large";
export type ValidationState = "valid" | "invalid";

export interface ProviderInheritedProps {
  /** Whether controls should render in their quiet/subtle style. */
  isQuiet?: boolean;
  /** Whether controls should render in their emphasized style. */
  isEmphasized?: boolean;
  /** Whether controls should be disabled. */
  isDisabled?: boolean;
  /** Whether controls should be required. */
  isRequired?: boolean;
  /** Whether controls should be read only. */
  isReadOnly?: boolean;
  /** Shared validation state for descendant form fields. */
  validationState?: ValidationState;
}

export interface ThemeContextValue {
  /** The current color scheme. */
  colorScheme: ColorScheme;
  /** The UI scale. */
  scale: Scale;
}

export interface ProviderContextValue extends ThemeContextValue, ProviderInheritedProps {
  /** The locale applied by the provider. */
  locale: string;
  /** The writing direction applied by the provider. */
  direction: Direction;
}

export interface ProviderProps extends ParentProps, ProviderInheritedProps {
  /** The locale for i18n. If not provided, inherits the nearest locale. */
  locale?: string;
  /** The color scheme. Inherits from the nearest provider when omitted. */
  colorScheme?: Exclude<ColorScheme, "light dark">;
  /** The background for this provider. If not provided, the background is transparent. */
  background?: "base" | "layer-1" | "layer-2";
  /** The UI scale. Inherits from the nearest provider when omitted. */
  scale?: Scale;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name for the provider wrapper. */
  class?: string;
  /** Additional inline styles. */
  style?: JSX.CSSProperties;
}

type InternalProviderContextValue = ProviderContextValue;

const defaultThemeContext: ThemeContextValue = {
  colorScheme: "light dark",
  scale: "medium",
};

export const ThemeContext = createContext<ThemeContextValue>(defaultThemeContext);
// Mirrors React S2's `ColorSchemeContext`: carries the resolved color scheme
// (including `"light dark"`) down the tree so consumers can read it. Our nested
// inheritance already flows through `ProviderContext` above, so this context is
// provided with the resolved value rather than driving resolution itself.
export const ColorSchemeContext = createContext<ColorScheme | null>(null);
const ProviderContext = createContext<InternalProviderContextValue | null>(null);

/**
 * Hook to access the current theme context.
 */
export function useTheme(): ThemeContextValue {
  const provider = useContext(ProviderContext);
  if (provider) {
    return provider;
  }

  return useContext(ThemeContext);
}

/**
 * Returns the settings applied by the nearest provider.
 */
export function useProvider(): ProviderContextValue {
  const context = useContext(ProviderContext);

  if (!context) {
    throw new Error("No root provider found. Wrap this subtree in <Provider>.");
  }

  return context;
}

/**
 * Merges inherited provider props with the component's explicit props.
 */
export function useProviderProps<T extends object>(props: T): T {
  const context = useContext(ProviderContext);

  if (!context) {
    return props;
  }

  return mergeProps(
    {
      isQuiet: context.isQuiet,
      isEmphasized: context.isEmphasized,
      isDisabled: context.isDisabled,
      isRequired: context.isRequired,
      isReadOnly: context.isReadOnly,
      validationState: context.validationState,
    } as unknown as Partial<T>,
    props,
  ) as T;
}

generateDefaultColorSchemeStyles();

const providerStyles = s2Style({
  ...setColorScheme(),
  "--s2-container-bg": {
    type: "backgroundColor",
    value: {
      background: {
        base: "base",
        "layer-1": "layer-1",
        "layer-2": "layer-2",
      },
    },
  },
  backgroundColor: {
    background: {
      base: "--s2-container-bg",
      "layer-1": "--s2-container-bg",
      "layer-2": "--s2-container-bg",
    },
  },
  isolation: "isolate",
}) as (props: {
  background?: "base" | "layer-1" | "layer-2";
  colorScheme: ColorScheme;
}) => StyleString;

interface ProviderRootProps {
  children: JSX.Element;
  class: string;
  style: JSX.CSSProperties;
  colorScheme: ColorScheme;
  background?: "base" | "layer-1" | "layer-2";
  rest: Record<string, unknown>;
}

function ProviderRoot(props: ProviderRootProps): JSX.Element {
  const locale = useLocale();
  const { modalProviderProps } = useModalProvider();

  return (
    <div
      {...props.rest}
      {...modalProviderProps}
      class={props.class}
      style={props.style}
      lang={locale().locale}
      dir={locale().direction}
      data-color-scheme={props.colorScheme === "light dark" ? undefined : props.colorScheme}
      data-background={props.background}
    >
      {props.children}
    </div>
  );
}

/**
 * Root provider for Spectrum 2-compatible styling.
 */
export function Provider(props: ProviderProps): JSX.Element {
  const parentProvider = useContext(ProviderContext);
  const inheritedLocale = useLocale();

  const [local, rest] = splitProps(props, [
    "locale",
    "colorScheme",
    "background",
    "scale",
    "styles",
    "class",
    "style",
    "children",
    "isQuiet",
    "isEmphasized",
    "isDisabled",
    "isRequired",
    "isReadOnly",
    "validationState",
  ]);

  const colorScheme = createMemo<ColorScheme>(
    () => local.colorScheme ?? parentProvider?.colorScheme ?? "light dark",
  );
  const scale = createMemo<Scale>(() => local.scale ?? parentProvider?.scale ?? "medium");
  const locale = createMemo(
    () => local.locale ?? parentProvider?.locale ?? inheritedLocale().locale,
  );

  const providerValue: InternalProviderContextValue = {
    get locale() {
      return locale();
    },
    get direction() {
      return isRTL(locale()) ? "rtl" : "ltr";
    },
    get colorScheme() {
      return colorScheme();
    },
    get scale() {
      return scale();
    },
    get isQuiet() {
      return local.isQuiet ?? parentProvider?.isQuiet;
    },
    get isEmphasized() {
      return local.isEmphasized ?? parentProvider?.isEmphasized;
    },
    get isDisabled() {
      return local.isDisabled ?? parentProvider?.isDisabled;
    },
    get isRequired() {
      return local.isRequired ?? parentProvider?.isRequired;
    },
    get isReadOnly() {
      return local.isReadOnly ?? parentProvider?.isReadOnly;
    },
    get validationState() {
      return local.validationState ?? parentProvider?.validationState;
    },
  };

  const classes = createMemo(() => {
    const generated = mergeStyles(
      providerStyles({ background: local.background, colorScheme: colorScheme() }),
      local.styles,
    );
    return [generated, local.class].filter(Boolean).join(" ");
  });

  const mergedStyle = createMemo<JSX.CSSProperties>(() => ({
    ...local.style,
  }));

  return (
    <ProviderContext.Provider value={providerValue}>
      <ThemeContext.Provider value={providerValue}>
        <ColorSchemeContext.Provider value={colorScheme()}>
          <I18nProvider locale={locale()}>
          <ModalProvider>
            <ProviderRoot
              rest={rest as Record<string, unknown>}
              class={classes()}
              style={mergedStyle()}
              colorScheme={colorScheme()}
              background={local.background}
            >
              {local.children}
            </ProviderRoot>
          </ModalProvider>
          </I18nProvider>
        </ColorSchemeContext.Provider>
      </ThemeContext.Provider>
    </ProviderContext.Provider>
  );
}
