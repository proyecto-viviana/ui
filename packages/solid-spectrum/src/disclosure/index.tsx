import { type JSX, createContext, mergeProps, splitProps, useContext, Show } from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  Disclosure as HeadlessDisclosure,
  DisclosureGroup as HeadlessDisclosureGroup,
  DisclosureTrigger as HeadlessDisclosureTrigger,
  DisclosurePanel as HeadlessDisclosurePanel,
  DisclosureStateContext as HeadlessDisclosureStateContext,
  type DisclosureProps as HeadlessDisclosureProps,
  type DisclosureGroupProps as HeadlessDisclosureGroupProps,
  type DisclosurePanelProps as HeadlessDisclosurePanelProps,
  type DisclosureRenderProps,
  type DisclosureGroupRenderProps,
  useDisclosureContext as useHeadlessDisclosureContext,
} from "@proyecto-viviana/solidaria-components";
import { createFocusRing, useLocale } from "@proyecto-viviana/solidaria";
import type { Key } from "@proyecto-viviana/solid-stately";
import { useProviderProps } from "../provider";
import { baseColor, centerPadding, focusRing, space, style, type StyleString } from "../s2-style";
import { mergeStyles } from "../s2-style/runtime";
import { ActionButtonContext } from "../button/context";
import type { ActionButtonSize } from "../button/group-context";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type DisclosureSize = "S" | "M" | "L" | "XL";
export type DisclosureDensity = "compact" | "regular" | "spacious";
export type DisclosureVariant = "default" | "bordered" | "filled" | "ghost";
type CompatibleDisclosureSize = DisclosureSize | "sm" | "md" | "lg";

export interface DisclosureContextValue {
  size?: CompatibleDisclosureSize;
  density?: DisclosureDensity;
  isQuiet?: boolean;
  styles?: StyleString;
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  slot?: string | null;
}

export const DisclosureContext = createContext<SpectrumContextValue<DisclosureContextValue>>(null);

interface SpectrumStyleProps {
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Backward-compatible style alias. Prefer UNSAFE_style for S2 parity. */
  style?: JSX.CSSProperties;
  /** Slot name for contextual props. */
  slot?: string | null;
}

export interface DisclosureGroupProps
  extends Omit<HeadlessDisclosureGroupProps, "class" | "style" | "children">, SpectrumStyleProps {
  /** The disclosure item elements in the group. */
  children?: JSX.Element;
  /** The size of all disclosures in the group. @default "M" */
  size?: CompatibleDisclosureSize;
  /** The amount of space between disclosure items. @default "regular" */
  density?: DisclosureDensity;
  /** Whether disclosures should be displayed with a quiet style. */
  isQuiet?: boolean;
  /** Legacy visual variant. Prefer isQuiet for S2 parity. */
  variant?: DisclosureVariant;
  ref?: RefLike<HTMLDivElement>;
}

export interface DisclosureProps
  extends Omit<HeadlessDisclosureProps, "class" | "style" | "children" | "id">, SpectrumStyleProps {
  /** The contents of the disclosure, consisting of a DisclosureTitle and DisclosurePanel. */
  children?: JSX.Element;
  /** The size of the disclosure. @default "M" */
  size?: CompatibleDisclosureSize;
  /** The amount of space between the disclosure title and panel. @default "regular" */
  density?: DisclosureDensity;
  /** Whether the disclosure should be displayed with a quiet style. */
  isQuiet?: boolean;
  /** Legacy visual variant. Prefer isQuiet for S2 parity. */
  variant?: DisclosureVariant;
  /** An id for the disclosure item, matching the id used in expandedKeys. */
  id?: Key;
  ref?: RefLike<HTMLDivElement>;
}

export interface DisclosureHeaderProps
  extends
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "class" | "style" | "slot" | "ref">,
    SpectrumStyleProps {
  /** The contents of the disclosure header. */
  children?: JSX.Element;
  ref?: RefLike<HTMLDivElement>;
}

export interface DisclosureTitleProps
  extends
    Omit<JSX.HTMLAttributes<HTMLHeadingElement>, "children" | "class" | "style" | "slot" | "ref">,
    SpectrumStyleProps {
  /** The heading level of the disclosure header. @default 3 */
  level?: number;
  /** The contents of the disclosure header. */
  children?: JSX.Element;
  /** Backward-compatible option for the legacy DisclosureTrigger alias. */
  hideIcon?: boolean;
  ref?: RefLike<HTMLHeadingElement>;
}

export interface DisclosurePanelProps
  extends
    Omit<HeadlessDisclosurePanelProps, "class" | "style" | "children" | "slot" | "ref">,
    SpectrumStyleProps {
  /** The contents of the disclosure panel. */
  children?: JSX.Element;
  ref?: RefLike<HTMLDivElement>;
}

type DisclosureRootStyleProps = {
  isQuiet?: boolean;
  isInGroup?: boolean;
};

type DisclosureButtonStyleProps = {
  size: DisclosureSize;
  density: DisclosureDensity;
  isQuiet?: boolean;
  isDisabled?: boolean;
  isFocusVisible?: boolean;
};

type ChevronStyleProps = {
  size: DisclosureSize;
  isExpanded?: boolean;
  isRTL?: boolean;
};

type PanelInnerStyleProps = {
  size: DisclosureSize;
};

const accordionStyles = style({
  display: "flex",
  flexDirection: "column",
});

const disclosureRootStyles = style<DisclosureRootStyleProps>({
  color: "heading",
  borderTopWidth: {
    default: 1,
    isQuiet: 0,
  },
  borderBottomWidth: {
    default: 1,
    isQuiet: 0,
    isInGroup: {
      default: 0,
      ":last-child": {
        default: 1,
        isQuiet: 0,
      },
    },
  },
  borderStartWidth: 0,
  borderEndWidth: 0,
  borderStyle: "solid",
  borderColor: "gray-200" as never,
  minWidth: 200,
});

const headerStyles = style({
  display: "flex",
  alignItems: "center",
  gap: 4,
});

const headingStyles = style({
  margin: 0,
  flexGrow: 1,
  display: "flex",
  flexShrink: 1,
  minWidth: 0,
});

const buttonStyles = style<DisclosureButtonStyleProps>({
  ...focusRing(),
  outlineOffset: -2,
  font: "heading",
  color: {
    default: baseColor("neutral"),
    forcedColors: "ButtonText",
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  fontWeight: "bold",
  fontSize: {
    size: {
      S: "title-sm",
      M: "title",
      L: "title-lg",
      XL: "title-xl",
    },
  },
  lineHeight: "ui",
  display: "flex",
  flexGrow: 1,
  alignItems: "baseline",
  paddingX: "[calc(self(minHeight) * 3/8 - 1px)]",
  paddingY: centerPadding(),
  gap: "[calc(self(minHeight) * 3/8 - 1px)]",
  minHeight: {
    size: {
      S: {
        density: {
          compact: 18,
          regular: 24,
          spacious: 32,
        },
      },
      M: {
        density: {
          compact: 24,
          regular: 32,
          spacious: 40,
        },
      },
      L: {
        density: {
          compact: 32,
          regular: 40,
          spacious: 48,
        },
      },
      XL: {
        density: {
          compact: 40,
          regular: 48,
          spacious: 56,
        },
      },
    },
  },
  width: "full",
  backgroundColor: "transparent",
  transition: "default",
  borderWidth: 0,
  borderRadius: {
    default: "none",
    isQuiet: "default",
  },
  textAlign: "start",
  disableTapHighlight: true,
});

const chevronStyles = style<ChevronStyleProps>({
  rotate: {
    isRTL: 180,
    isExpanded: 90,
  },
  transition: "default",
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
  flexShrink: 0,
  size: {
    size: {
      S: 10,
      M: 10,
      L: 12,
      XL: 14,
    },
  },
});

const chevronIcons: Record<DisclosureSize, { size: number; viewBox: string; path: string }> = {
  S: {
    size: 10,
    viewBox: "0 0 10 10",
    path: "M7.483 4.406 3.86.783a.84.84 0 1 0-1.188 1.188L5.702 5l-3.03 3.03A.84.84 0 1 0 3.86 9.216l3.623-3.623a.84.84 0 0 0 0-1.188",
  },
  M: {
    size: 10,
    viewBox: "0 0 10 10",
    path: "M7.965 5.178C7.978 5.118 8 5.061 8 5s-.021-.118-.034-.178c-.01-.05-.01-.102-.03-.15-.023-.058-.068-.107-.104-.16-.03-.042-.047-.09-.084-.127l-.004-.003-.003-.004L3.615.303a.875.875 0 1 0-1.23 1.244L5.88 5 2.385 8.453a.875.875 0 1 0 1.23 1.244L7.74 5.622l.003-.004.004-.003c.037-.038.055-.085.084-.127.036-.053.08-.102.104-.16.02-.048.02-.1.03-.15",
  },
  L: {
    size: 12,
    viewBox: "0 0 12 12",
    path: "M9.301 6c0-.049-.02-.095-.028-.143-.01-.068-.013-.136-.039-.2a.9.9 0 0 0-.2-.302L4.343.663a.912.912 0 0 0-1.29 1.29L7.102 6l-4.047 4.048a.912.912 0 0 0 1.289 1.289l4.691-4.692a.9.9 0 0 0 .2-.302c.026-.064.028-.132.04-.2C9.28 6.095 9.3 6.05 9.3 6",
  },
  XL: {
    size: 14,
    viewBox: "0 0 14 14",
    path: "M10.361 6.328 5.03.996a.954.954 0 0 0-1.343 0 .95.95 0 0 0 0 1.344L8.346 7l-4.66 4.66a.95.95 0 0 0 1.344 1.344l5.331-5.332a.95.95 0 0 0 0-1.344",
  },
};

const panelStyles = style({
  font: "body",
  height: "--disclosure-panel-height",
  overflow: "clip",
  transition: {
    default: "[height]",
    "@media (prefers-reduced-motion: reduce)": "none",
  },
});

const panelInnerStyles = style<PanelInnerStyleProps>({
  paddingTop: 8,
  paddingBottom: 16,
  paddingX: {
    size: {
      S: 8,
      M: space(9),
      L: 12,
      XL: space(15),
    },
  },
});

const InternalDisclosureHeaderContext = createContext<boolean>(false);

function normalizeSize(size: CompatibleDisclosureSize | undefined): DisclosureSize {
  switch (size) {
    case "sm":
      return "S";
    case "md":
      return "M";
    case "lg":
      return "L";
    default:
      return size ?? "M";
  }
}

function normalizeQuiet(
  isQuiet: boolean | undefined,
  variant: DisclosureVariant | undefined,
): boolean {
  return isQuiet ?? variant === "ghost";
}

function getDisclosureContext(): DisclosureContextValue {
  return useContext(DisclosureContext) ?? {};
}

function classNames(...values: Array<string | undefined | null | false>): string {
  return values.filter(Boolean).join(" ");
}

function styleAlias(
  unsafeStyle: JSX.CSSProperties | undefined,
  legacyStyle: JSX.CSSProperties | undefined,
): JSX.CSSProperties | undefined {
  if (unsafeStyle && legacyStyle) {
    return { ...legacyStyle, ...unsafeStyle };
  }

  return unsafeStyle ?? legacyStyle;
}

function actionButtonSize(size: DisclosureSize, density: DisclosureDensity): ActionButtonSize {
  const sizes: ActionButtonSize[] = ["XS", "S", "M", "L", "XL"];
  const currentIndex = sizes.indexOf(size);
  const shift = density === "compact" ? 2 : 1;
  return sizes[Math.max(0, currentIndex - shift)];
}

/**
 * DisclosureGroup manages a group of Disclosure components. It is also the
 * shared S2 Accordion root primitive.
 */
export function DisclosureGroup(props: DisclosureGroupProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useContext(DisclosureContext), props.slot);
  const merged = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(merged, [
    "children",
    "size",
    "density",
    "isQuiet",
    "variant",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "style",
    "slot",
    "ref",
  ] as const);

  const size = () => normalizeSize(local.size);
  const density = () => local.density ?? "regular";
  const isQuiet = () => normalizeQuiet(local.isQuiet, local.variant);
  const mergedSpectrumStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(
      contextProps?.UNSAFE_style,
      styleAlias(local.UNSAFE_style, local.style),
    );
  const getClassName = (_renderProps: DisclosureGroupRenderProps): string =>
    classNames(
      contextProps?.UNSAFE_className,
      local.UNSAFE_className,
      local.class,
      mergeStyles(accordionStyles, mergedSpectrumStyles()),
    );

  const disclosureContext = {
    get size() {
      return size();
    },
    get density() {
      return density();
    },
    get isQuiet() {
      return isQuiet();
    },
  };

  return (
    <DisclosureContext.Provider value={disclosureContext}>
      <HeadlessDisclosureGroup
        {...(headlessProps as HeadlessDisclosureGroupProps)}
        ref={mergeContextRefs(
          (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
          props.ref,
        )}
        {...{
          "data-rsp-component": "DisclosureGroup",
          "data-size": size(),
          "data-density": density(),
          "data-quiet": isQuiet() ? "true" : undefined,
        }}
        class={getClassName}
        style={mergedUnsafeStyle()}
      >
        {local.children}
      </HeadlessDisclosureGroup>
    </DisclosureContext.Provider>
  );
}

/**
 * A disclosure is a collapsible section of content.
 */
export function Disclosure(props: DisclosureProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const parentDisclosureContext = useContext(DisclosureContext);
  const contextProps = getSlottedContextProps(parentDisclosureContext, props.slot);
  const merged = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(merged, [
    "children",
    "size",
    "density",
    "isQuiet",
    "variant",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "style",
    "slot",
    "ref",
  ] as const);

  const size = () => normalizeSize(local.size);
  const density = () => local.density ?? "regular";
  const isQuiet = () => normalizeQuiet(local.isQuiet, local.variant);
  const isInGroup = () => parentDisclosureContext !== null;
  const mergedSpectrumStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(
      contextProps?.UNSAFE_style,
      styleAlias(local.UNSAFE_style, local.style),
    );
  const getClassName = (_renderProps: DisclosureRenderProps): string =>
    classNames(
      contextProps?.UNSAFE_className,
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        disclosureRootStyles({ isQuiet: isQuiet(), isInGroup: isInGroup() }),
        mergedSpectrumStyles(),
      ),
    );

  const disclosureContext = {
    get size() {
      return size();
    },
    get density() {
      return density();
    },
    get isQuiet() {
      return isQuiet();
    },
  };

  return (
    <DisclosureContext.Provider value={disclosureContext}>
      <HeadlessDisclosure
        {...(headlessProps as HeadlessDisclosureProps)}
        ref={mergeContextRefs(
          (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
          props.ref,
        )}
        {...{
          "data-rsp-component": "Disclosure",
          "data-size": size(),
          "data-density": density(),
          "data-quiet": isQuiet() ? "true" : undefined,
        }}
        class={getClassName}
        style={mergedUnsafeStyle()}
      >
        {local.children}
      </HeadlessDisclosure>
    </DisclosureContext.Provider>
  );
}

/**
 * A wrapper element for the disclosure title that can contain other elements
 * not part of the trigger.
 */
export function DisclosureHeader(props: DisclosureHeaderProps): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "style",
    "slot",
    "ref",
  ] as const);
  const context = getDisclosureContext();
  const size = () => normalizeSize(context.size);
  const density = () => context.density ?? "regular";
  const isQuiet = () => context.isQuiet;
  const actionButtonContext = {
    get size() {
      return actionButtonSize(size(), density());
    },
    get isQuiet() {
      return isQuiet();
    },
  };

  return (
    <ActionButtonContext.Provider value={actionButtonContext}>
      <InternalDisclosureHeaderContext.Provider value>
        <div
          {...domProps}
          ref={mergeContextRefs(local.ref)}
          class={classNames(
            local.UNSAFE_className,
            local.class,
            mergeStyles(headerStyles, local.styles),
          )}
          style={styleAlias(local.UNSAFE_style, local.style)}
          data-rsp-slot="disclosure-header"
          data-size={size()}
          data-density={density()}
          data-quiet={isQuiet() ? "true" : undefined}
        >
          {local.children}
        </div>
      </InternalDisclosureHeaderContext.Provider>
    </ActionButtonContext.Provider>
  );
}

function DisclosureTitleContent(props: DisclosureTitleProps): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "children",
    "level",
    "hideIcon",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "style",
    "slot",
    "ref",
  ] as const);
  const context = getDisclosureContext();
  const headlessDisclosureContext = useHeadlessDisclosureContext();
  const headlessState = useContext(HeadlessDisclosureStateContext);
  const locale = useLocale();
  const level = () => Math.min(6, Math.max(1, local.level ?? 3));
  const size = () => normalizeSize(context.size);
  const density = () => context.density ?? "regular";
  const isQuiet = () => context.isQuiet;
  const isDisabled = () => headlessDisclosureContext?.isDisabled() ?? false;
  const isExpanded = () => headlessState?.isExpanded() ?? false;
  const headingTag = () => `h${level()}` as keyof JSX.IntrinsicElements;
  const chevronIcon = () => chevronIcons[size()];
  const { isFocusVisible, focusProps } = createFocusRing();
  const triggerFocusProps = focusProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>;

  return (
    <Dynamic
      component={headingTag()}
      {...domProps}
      ref={mergeContextRefs(local.ref)}
      class={classNames(
        local.UNSAFE_className,
        local.class,
        mergeStyles(headingStyles, local.styles),
      )}
      style={styleAlias(local.UNSAFE_style, local.style)}
      data-rsp-slot="disclosure-title"
      data-level={level()}
    >
      <HeadlessDisclosureTrigger
        onFocus={triggerFocusProps.onFocus}
        onBlur={triggerFocusProps.onBlur}
        class={buttonStyles({
          size: size(),
          density: density(),
          isQuiet: isQuiet(),
          isDisabled: isDisabled(),
          isFocusVisible: isFocusVisible(),
        })}
        data-rsp-slot="disclosure-trigger"
        data-size={size()}
        data-density={density()}
        data-quiet={isQuiet() ? "true" : undefined}
      >
        <Show when={!local.hideIcon}>
          <svg
            class={chevronStyles({
              size: size(),
              isExpanded: isExpanded(),
              isRTL: locale().direction === "rtl",
            })}
            width={chevronIcon().size}
            height={chevronIcon().size}
            viewBox={chevronIcon().viewBox}
            aria-hidden="true"
            data-rsp-slot="disclosure-chevron"
          >
            <path fill="var(--iconPrimary, #222)" d={chevronIcon().path} />
          </svg>
        </Show>
        {local.children}
      </HeadlessDisclosureTrigger>
    </Dynamic>
  );
}

/**
 * A disclosure title consisting of a heading and a trigger button to
 * expand/collapse the panel.
 */
export function DisclosureTitle(props: DisclosureTitleProps): JSX.Element {
  const isInsideHeader = useContext(InternalDisclosureHeaderContext);

  if (isInsideHeader) {
    return <DisclosureTitleContent {...props} />;
  }

  return (
    <DisclosureHeader>
      <DisclosureTitleContent {...props} />
    </DisclosureHeader>
  );
}

/**
 * DisclosureTrigger is kept as a compatibility alias for DisclosureTitle.
 */
export const DisclosureTrigger = DisclosureTitle;
export type DisclosureTriggerProps = DisclosureTitleProps;

/**
 * A disclosure panel is a collapsible section of content that is hidden until
 * the disclosure is expanded.
 */
export function DisclosurePanel(props: DisclosurePanelProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "style",
    "slot",
    "ref",
  ] as const);
  const context = getDisclosureContext();
  const size = () => normalizeSize(context.size);
  const getClassName = (_renderProps: DisclosureRenderProps): string =>
    classNames(local.UNSAFE_className, local.class, mergeStyles(panelStyles, local.styles));

  return (
    <HeadlessDisclosurePanel
      {...(headlessProps as HeadlessDisclosurePanelProps)}
      ref={mergeContextRefs(local.ref)}
      {...{
        "data-rsp-slot": "disclosure-panel",
        "data-size": size(),
      }}
      class={getClassName}
      style={styleAlias(local.UNSAFE_style, local.style)}
    >
      <div
        class={panelInnerStyles({ size: size() })}
        data-rsp-slot="disclosure-panel-content"
        data-size={size()}
      >
        {local.children}
      </div>
    </HeadlessDisclosurePanel>
  );
}

Disclosure.Trigger = DisclosureTitle;
Disclosure.Panel = DisclosurePanel;
Disclosure.Header = DisclosureHeader;
DisclosureGroup.Item = Disclosure;
