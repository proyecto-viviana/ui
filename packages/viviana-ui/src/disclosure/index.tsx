/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/Disclosure.tsx

// Port of packages/@react-spectrum/s2/src/Disclosure.tsx.

import { type JSX, createContext, splitProps, useContext, Show } from "solid-js";
import { ElementTag } from "@proyecto-viviana/solidaria-components";
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
import { mergeProps, createFocusRing, createHover, useLocale } from "@proyecto-viviana/solidaria";
import type { Key } from "@proyecto-viviana/solid-stately";
import { useProviderProps, type ProviderInheritedProps } from "../provider";
import type { StyleString } from "../style";
import type { StylesPropWithFont } from "../s2-internal/style-utils";
import { baseColor, centerPadding, focusRing, space, style } from "../style" with { type: "macro" };
import { getAllowedOverrides } from "../s2-internal/style-utils" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
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
  /**
   * Spectrum-defined styles, returned by the `style()` macro. Only allows overriding
   * `font`, `fontFamily`, `fontWeight`, `fontSize`, and `lineHeight`.
   */
  styles?: StylesPropWithFont;
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
  isHovered?: boolean;
  isPressed?: boolean;
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
  /* Viviana UI v2 (Glasselated): the rules that separate stacked disclosure items
   * ride the register's edge token instead of an opaque Spectrum ramp stop.
   * `gray-200` bakes a solid line into both schemes; `--border-subtle` is
   * translucent in both (rgba(255,255,255,.07) dark / rgba(145,158,171,.18) light,
   * dist/viviana-tokens.css) and is exposed on the borderColor family in
   * style/spectrum-theme.ts. The 1px weight above was already right — only the
   * colour channel was off. */
  borderColor: "border-subtle",
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

const buttonStyles = style<DisclosureButtonStyleProps>(
  {
    ...focusRing(),
    outlineOffset: -2,
    font: "heading",
    /* A disclosure header is a nav row, and the handoff draws those mono
     * (TerminalGlassLab.tsx:598). `font` keeps the heading size ramp. */
    fontFamily: "code",
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
    /* Glasselated: a disclosure header IS a list row, so it takes the register's
     * row fills (`--surface-hover` / `--surface-active`) and the 6px row corner,
     * rather than the neutral black/white scrims S2 uses. */
    backgroundColor: {
      default: "transparent",
      isFocusVisible: "surface-hover",
      isHovered: "surface-hover",
      isPressed: "[var(--surface-active)]",
    },
    transition: "default",
    borderWidth: 0,
    borderRadius: "row",
    textAlign: "start",
    disableTapHighlight: true,
  },
  getAllowedOverrides({ font: true }),
);

/* Glasselated: the disclosure affordance is the register's mono ">" mark, rotated
 * 90° when the panel is open — the same mark the nav rail, the list rows and the
 * tree use, so one glyph means "opens/leads somewhere" everywhere in the register.
 * The rotate/RTL contract is unchanged; only the glyph replaced the chevron path. */
const chevronStyles = style<ChevronStyleProps>({
  rotate: {
    isRTL: 180,
    isExpanded: 90,
  },
  transition: "default",
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "code",
  fontWeight: "semi-bold",
  lineHeight: "[1]",
  color: "[var(--accent-primary)]",
  width: {
    size: {
      S: 10,
      M: 10,
      L: 12,
      XL: 14,
    },
  },
  fontSize: {
    size: {
      S: "[10px]",
      M: "[10px]",
      L: "[12px]",
      XL: "[14px]",
    },
  },
});

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
  const providerProps = useProviderProps(props) as DisclosureGroupProps & ProviderInheritedProps;
  const [flags] = splitProps(providerProps, [
    "isQuiet",
    "isEmphasized",
    "isDisabled",
    "isRequired",
    "isReadOnly",
    "validationState",
  ]);
  const contextProps = getSlottedContextProps(useContext(DisclosureContext), props.slot);
  const merged = mergeProps<DisclosureGroupProps>(flags, contextProps ?? {}, props);
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
  const providerProps = useProviderProps(props) as DisclosureProps & ProviderInheritedProps;
  const [flags] = splitProps(providerProps, [
    "isQuiet",
    "isEmphasized",
    "isDisabled",
    "isRequired",
    "isReadOnly",
    "validationState",
  ]);
  const parentDisclosureContext = useContext(DisclosureContext);
  const contextProps = getSlottedContextProps(parentDisclosureContext, props.slot);
  const merged = mergeProps<DisclosureProps>(flags, contextProps ?? {}, props);
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
  const { isFocusVisible, focusProps } = createFocusRing();
  const triggerFocusProps = focusProps as JSX.ButtonHTMLAttributes<HTMLButtonElement>;
  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return isDisabled();
    },
  });
  const isPressed = () => headlessDisclosureContext?.disclosureAria.isPressed() ?? false;

  return (
    <ElementTag
      tag={headingTag()}
      {...domProps}
      ref={mergeContextRefs(local.ref)}
      class={classNames(local.UNSAFE_className, local.class, headingStyles)}
      style={styleAlias(local.UNSAFE_style, local.style)}
      data-rsp-slot="disclosure-title"
      data-level={level()}
    >
      <HeadlessDisclosureTrigger
        {...hoverProps}
        onFocus={triggerFocusProps.onFocus}
        onBlur={triggerFocusProps.onBlur}
        class={buttonStyles(
          {
            size: size(),
            density: density(),
            isQuiet: isQuiet(),
            isDisabled: isDisabled(),
            isHovered: isHovered(),
            isPressed: isPressed(),
            isFocusVisible: isFocusVisible(),
          },
          local.styles,
        )}
        data-rsp-slot="disclosure-trigger"
        data-size={size()}
        data-density={density()}
        data-quiet={isQuiet() ? "true" : undefined}
        data-hovered={isHovered() ? "true" : undefined}
        data-pressed={isPressed() ? "true" : undefined}
      >
        <Show when={!local.hideIcon}>
          <span
            class={chevronStyles({
              size: size(),
              isExpanded: isExpanded(),
              isRTL: locale().direction === "rtl",
            })}
            aria-hidden="true"
            data-rsp-slot="disclosure-chevron"
          >
            {">"}
          </span>
        </Show>
        {local.children}
      </HeadlessDisclosureTrigger>
    </ElementTag>
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
  const [local, forwardedProps] = splitProps(props, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "style",
    "slot",
    "ref",
    // `role` is split off and dropped to mirror S2's `DisclosurePanel`, which runs
    // its props through `filterDOMProps(otherProps)` (no `propNames`) before handing
    // them to RAC — that allowlist (id + data-*/aria-*) excludes `role`, so S2
    // silently discards the `group`/`region` override and the panel is ALWAYS a
    // `group`. Forwarding `role` to the headless panel (which honours it) would make
    // the port emit a `region` landmark S2 never renders. See Disclosure.tsx:387
    // (`const domProps = filterDOMProps(otherProps)`).
    "role",
  ] as const);
  const headlessProps = forwardedProps;
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
