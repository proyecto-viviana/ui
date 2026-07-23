// @ts-nocheck
import {
  type Accessor,
  type JSX,
  createContext,
  createMemo,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import {
  GridListItem as HeadlessGridListItem,
  GridListSelectionCheckbox,
  Link as HeadlessLink,
  filterDOMProps,
  type GridListItemProps as HeadlessGridListItemProps,
  type GridListItemRenderProps,
  type LinkRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import { ActionMenuContext } from "../menu/ActionMenu";
import { AvatarContext } from "../avatar";
import { ButtonContext, LinkButtonContext } from "../button/context";
import { ContentContext, FooterContext, TextContext } from "../text";
import { DividerContext } from "../divider";
import { IconContext, IllustrationContext } from "../icon";
import { Image, ImageContext, ImageCoordinator } from "../image";
import { SkeletonContext, SkeletonWrapper, useInertAttribute, useIsSkeleton } from "../skeleton";
import { pressScale } from "../pressScale";
import { useProviderProps } from "../provider";
import type { StyleString } from "../style";
import { color, focusRing, lightDark, space, style } from "../style" with { type: "macro" };
import { meshStrip } from "../style/meshStrip";
import { mergeStyles } from "../style/runtime";
import type { UnsafeClassName } from "../s2-internal/style-utils";
import { getAllowedOverrides } from "../s2-internal/style-utils" with { type: "macro" };
import {
  getSlottedContextProps,
  mergeContextRefs,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type CardSize = "XS" | "S" | "M" | "L" | "XL";
export type CardDensity = "compact" | "regular" | "spacious";
export type CardVariant = "primary" | "secondary" | "tertiary" | "quiet";
export type CardMeshVariant = "ambient" | "signal";

export interface CardRenderProps {
  /** The size of the Card. */
  size: CardSize;
}

export interface CardProps extends Omit<
  HeadlessGridListItemProps<object>,
  "class" | "style" | "children" | "ref"
> {
  /** The children of the Card. */
  children?: JSX.Element | ((renderProps: CardRenderProps) => JSX.Element);
  /** The size of the Card. @default 'M' */
  size?: CardSize;
  /** The amount of internal padding within the Card. @default 'regular' */
  density?: CardDensity;
  /** The visual style of the Card. @default 'primary' */
  variant?: CardVariant;
  /**
   * The register's woven hex-mesh weave, painted behind the glass fill —
   * `ambient` is the quiet mixed gray/blue/orange weave, `signal` the warm
   * single-hue amber one. Only the filled variants take it; `tertiary` and
   * `quiet` have no fill for a weave to sit under.
   */
  mesh?: CardMeshVariant;
  /** Seed for the mesh weave, so neighboring cards don't repeat the same pattern. @default 42 */
  meshSeed?: number;
  /** Link target for standalone navigable cards. */
  href?: string;
  download?: boolean | string;
  target?: string;
  rel?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
  /** Ref for the rendered card element. */
  ref?: RefLike<HTMLElement>;
}

export interface CardPreviewProps extends JSX.HTMLAttributes<HTMLDivElement> {
  children?: JSX.Element;
  /**
   * Recessed fill behind the preview. `inset` sits the region on
   * `--surface-inset` — the register's console-strip treatment, where the
   * full-bleed header bar reads sunk into the card rather than flush with it.
   */
  background?: "inset";
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  ref?: RefLike<HTMLDivElement>;
}

export interface AssetCardProps extends Omit<CardProps, "density"> {}
export interface UserCardProps extends Omit<CardProps, "density" | "variant"> {
  variant?: Exclude<CardVariant, "quiet">;
}
export interface ProductCardProps extends Omit<CardProps, "density" | "variant"> {
  variant?: Exclude<CardVariant, "quiet">;
}

/* Glasselated: the handoff draws one card corner (12px, primitives.tsx:35) and does
 * not shrink it for small cards. The size ramp is kept anyway — an XS card with a
 * 12px corner is nearly a lozenge — but rebased on the register: `card` at the
 * normal sizes, the control corner for the two smallest. */
const borderRadius = {
  default: "card",
  size: {
    XS: "control",
    S: "control",
  },
} as const;

type CardStyleState = Partial<GridListItemRenderProps | LinkRenderProps> & {
  size: CardSize;
  density: CardDensity;
  variant: CardVariant;
  isCardView?: boolean;
  isLink?: boolean;
};

const card = style<CardStyleState>(
  {
    display: "flex",
    flexDirection: "column",
    position: "relative",
    borderRadius,
    "--s2-container-bg": {
      type: "backgroundColor",
      value: {
        variant: {
          primary: "elevated",
          secondary: "layer-1",
        },
        forcedColors: "ButtonFace",
      },
    },
    backgroundColor: {
      default: "--s2-container-bg",
      variant: {
        tertiary: "transparent",
        quiet: "transparent",
      },
    },
    /* Glasselated: a card is the handoff's `MeshCard surface="card"` (primitives.tsx:35)
     * — translucent fill, 14px backdrop blur, a 1px `--border-subtle` edge and the
     * inset rim. The surface token is already translucent, so without the blur the
     * card just looks washed out; translucency plus blur is what reads as glass, and
     * the blur can only ride on the element, never on a background-color. The two
     * transparent variants opt out — there is no fill for a blur to sit under. */
    backdropFilter: {
      default: "var(--blur-card)",
      variant: {
        tertiary: "none",
        quiet: "none",
      },
    },
    borderStyle: {
      default: "solid",
      variant: {
        tertiary: "none",
        quiet: "none",
      },
    },
    borderWidth: 1,
    borderColor: {
      default: "border-subtle",
      variant: {
        tertiary: "transparent",
        quiet: "transparent",
      },
    },
    boxShadow: {
      /* The rim carries resting elevation instead of Spectrum's cast shadow — the
       * handoff lifts surfaces with blur plus the inset highlight, and declares
       * `--shadow-*` tokens it then never references. Interactive states keep a real
       * lift, composed *with* the rim rather than replacing it, so the glass edge
       * doesn't blink out from under the pointer. */
      default: "edge-glass-surface",
      isHovered: "[var(--edge-glass-surface), 0 4px 14px rgb(0 0 0 / 0.22)]",
      isFocusVisible: "[var(--edge-glass-surface), 0 4px 14px rgb(0 0 0 / 0.22)]",
      isSelected: "[var(--edge-glass-surface), 0 4px 14px rgb(0 0 0 / 0.22)]",
      forcedColors: "[0 0 0 1px var(--hcm-buttonborder, ButtonBorder)]",
      variant: {
        tertiary: {
          default: `[0 0 0 2px ${color("gray-100")}]`,
          isHovered: `[0 0 0 2px ${color("gray-200")}]`,
          isFocusVisible: `[0 0 0 2px ${color("gray-200")}]`,
          isSelected: "none",
          forcedColors: "[0 0 0 2px var(--hcm-buttonborder, ButtonBorder)]",
        },
        quiet: "none",
      },
    },
    forcedColorAdjust: "none",
    transition: "default",
    fontFamily: "sans",
    textDecoration: "none",
    overflow: {
      default: "clip",
      variant: {
        quiet: "visible",
      },
    },
    contain: "layout",
    disableTapHighlight: true,
    userSelect: {
      isCardView: "none",
    },
    cursor: {
      isLink: "pointer",
    },
    width: {
      size: {
        XS: 112,
        S: 192,
        M: 240,
        L: 320,
        XL: 400,
      },
      isCardView: "full",
    },
    /* `height: full` only makes sense inside a CardView, where the grid cell is
     * definitely sized and the card should fill it. A standalone card in a flex
     * row must hug its content — a percentage there resolves against the row's
     * final height (all wrapped lines included), ballooning every card to the
     * full band. */
    height: {
      default: "auto",
      isCardView: "full",
    },
    "--card-spacing": {
      type: "paddingTop",
      value: {
        density: {
          compact: {
            size: {
              XS: "[6px]",
              S: 8,
              M: 12,
              L: 16,
              XL: 20,
            },
          },
          regular: {
            size: {
              XS: 8,
              S: 12,
              M: 16,
              L: 20,
              XL: 24,
            },
          },
          spacious: {
            size: {
              XS: 12,
              S: 16,
              M: 20,
              L: 24,
              XL: 28,
            },
          },
        },
      },
    },
    "--card-padding-y": {
      type: "paddingTop",
      value: {
        default: "--card-spacing",
        variant: {
          quiet: 0,
        },
      },
    },
    "--card-padding-x": {
      type: "paddingStart",
      value: {
        default: "--card-spacing",
        variant: {
          quiet: 0,
        },
      },
    },
    paddingY: "--card-padding-y",
    paddingX: "--card-padding-x",
    boxSizing: "border-box",
    ...focusRing(),
    outlineStyle: {
      default: "none",
      isFocusVisible: "solid",
      variant: {
        quiet: "none",
      },
    },
  },
  getAllowedOverrides(),
);

const selectionIndicator = style({
  position: "absolute",
  inset: 0,
  zIndex: 2,
  borderRadius,
  pointerEvents: "none",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-1000",
  transition: "default",
  opacity: {
    default: 0,
    isSelected: 1,
  },
  outlineColor: lightDark("transparent-white-600", "transparent-black-600"),
  outlineOffset: -4,
  outlineStyle: {
    default: "none",
    isStrokeInner: "solid",
  },
  outlineWidth: 2,
});

const preview = style({
  position: "relative",
  transition: "default",
  overflow: "clip",
  backgroundColor: {
    background: {
      inset: "pasteboard",
    },
  },
  marginX: "calc(var(--card-padding-x) * -1)",
  marginTop: "calc(var(--card-padding-y) * -1)",
  marginBottom: {
    ":last-child": "calc(var(--card-padding-y) * -1)",
  },
  borderRadius: {
    isQuiet: borderRadius,
  },
  boxShadow: {
    isQuiet: {
      isHovered: "elevated",
      isFocusVisible: "elevated",
      isSelected: "elevated",
    },
  },
  ...focusRing(),
  outlineStyle: {
    default: "none",
    isQuiet: {
      isFocusVisible: "solid",
    },
  },
});

const image = style({
  width: "full",
  aspectRatio: {
    layout: {
      grid: "3/2",
    },
  },
  objectFit: "cover",
  userSelect: "none",
  pointerEvents: "none",
});

const title = style({
  font: "title",
  fontSize: {
    size: {
      XS: "title-xs",
      S: "title-xs",
      M: "title-sm",
      L: "title",
      XL: "title-lg",
    },
  },
  lineClamp: 3,
  gridArea: "title",
});

const description = style({
  font: "body",
  fontSize: {
    size: {
      XS: "body-2xs",
      S: "body-2xs",
      M: "body-xs",
      L: "body-sm",
      XL: "body",
    },
  },
  lineClamp: 3,
  gridArea: "description",
});

const content = style({
  display: "grid",
  gridTemplateColumns: {
    default: ["1fr"],
    ":has([data-slot=menu])": ["minmax(0, 1fr)", "auto"],
  },
  gridTemplateAreas: {
    default: ["title", "description"],
    ":has([data-slot=menu])": ["title menu", "description description"],
  },
  columnGap: 4,
  flexGrow: 1,
  alignItems: "baseline",
  /* Top-packed, not `space-between`. Cards in a row stretch to the tallest sibling, and
   * with `flexGrow: 1` the content grid inherits all that slack; `space-between` then spent
   * it BETWEEN the title and the description, so a short card in a tall row rendered its
   * title at the top, its body pushed to the bottom, and a growing hole in the middle. The
   * register packs card content to the top and lets the slack fall below it, which is also
   * what makes a row of uneven cards read as one band of text rather than as text scattered
   * down each card's own height. The slack still exists — it just collects at the end. */
  alignContent: "start",
  rowGap: {
    size: {
      XS: 4,
      S: 4,
      M: space(6),
      L: space(6),
      XL: 8,
    },
  },
  paddingTop: {
    default: "--card-spacing",
    ":first-child": 0,
  },
  paddingBottom: {
    default: "calc(var(--card-spacing) * 1.5 / 2)",
    ":last-child": 0,
  },
});

const actionMenu = style({
  gridArea: "menu",
  marginY: "calc(-1 * self(height))",
});

const footer = style({
  display: "flex",
  flexDirection: "row",
  alignItems: "end",
  justifyContent: "space-between",
  gap: 8,
  paddingTop: "calc(var(--card-spacing) * 1.5 / 2)",
});

const displayContents = style({
  display: "contents",
});

const cardCheckboxContainer = style({
  position: "absolute",
  top: "--card-spacing",
  insetStart: "--card-spacing",
  zIndex: 2,
  padding: 4,
  backgroundColor: lightDark("transparent-white-600", "transparent-black-600"),
  borderRadius: "default",
  boxShadow: "emphasized",
});

const cardCheckboxInput = style({
  display: "block",
  margin: 0,
  size: {
    size: {
      XS: 16,
      S: 16,
      M: 18,
      L: 20,
      XL: 22,
    },
  },
});

const previewClip = style({
  borderRadius: "inherit",
  overflow: "clip",
});

const collection = style({
  display: "grid",
  gridTemplateColumns: "repeat(3, 1fr)",
  gap: {
    default: 4,
    size: {
      XS: 2,
      S: 2,
    },
  },
});

const collectionImage = style({
  width: "full",
  aspectRatio: {
    default: "square",
    ":nth-last-child(4):first-child": "3/2",
  },
  gridColumnEnd: {
    ":nth-last-child(4):first-child": "span 3",
  },
  objectFit: "cover",
  pointerEvents: "none",
  userSelect: "none",
});

const assetImage = style({
  width: "full",
  aspectRatio: {
    layout: {
      grid: "square",
    },
  },
  objectFit: "contain",
  pointerEvents: "none",
  userSelect: "none",
});

const assetIllustrationWrapper = style({
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "gray-100",
  aspectRatio: "square",
});

const assetIllustration = style({
  height: "auto",
  maxSize: 160,
  width: "50%",
});

const userImage = style({
  width: "full",
  aspectRatio: "3/1",
  objectFit: "cover",
  pointerEvents: "none",
  userSelect: "none",
});

const userAvatar = style({
  position: "relative",
  marginTop: {
    default: 0,
    ":is([slot=preview] + *)": "calc(var(--size) / -2)",
  },
});

const productPreviewImage = style({
  width: "full",
  aspectRatio: "5/1",
  objectFit: "cover",
  pointerEvents: "none",
  userSelect: "none",
});

const productThumbnail = style({
  position: "relative",
  pointerEvents: "none",
  userSelect: "none",
  size: {
    size: {
      XS: 24,
      S: 36,
      M: 40,
      L: 44,
      XL: 56,
    },
  },
  borderRadius: {
    default: "default",
    size: {
      XS: "sm",
      S: "sm",
    },
  },
  objectFit: "cover",
  marginTop: {
    default: 0,
    ":is([slot=preview] + *)": "calc(self(height) / -2)",
  },
  outlineStyle: "solid",
  outlineWidth: {
    default: 2,
    size: {
      XS: 1,
    },
  },
  outlineColor: "--s2-container-bg",
});

const productFooter = style({
  justifyContent: "end",
});

export const InternalCardViewContext = createContext({
  ElementType: "div" as "div" | typeof HeadlessGridListItem,
  layout: "grid" as "grid" | "waterfall",
});

export const CardContext = createContext<SpectrumContextValue<CardProps>>(null);

interface InternalCardContextValue {
  isQuiet: boolean;
  size: CardSize;
  itemKey?: Key;
  isSelected: boolean;
  isHovered: boolean;
  isFocusVisible: boolean;
  isPressed: boolean;
  isCheckboxSelection: boolean;
}

const InternalCardContext = createContext<InternalCardContextValue>({
  isQuiet: false,
  size: "M",
  isSelected: false,
  isHovered: false,
  isFocusVisible: false,
  isPressed: false,
  isCheckboxSelection: true,
});

/* AssetCard previews accept an icon standing in for an illustration (viviana-ui
 * ships no illustration set yet). The square-wrapper treatment must apply ONLY
 * inside the preview slot — providing IconContext at the card level would leak
 * the wrapper into the Content ActionMenu's own icon — so AssetCard raises this
 * flag and CardPreview scopes the provider to its children. */
const InternalAssetPreviewContext = createContext(false);

const actionButtonSize = {
  XS: "XS",
  S: "XS",
  M: "S",
  L: "M",
  XL: "L",
} as const;

const avatarSize = {
  XS: 24,
  S: 48,
  M: 64,
  L: 64,
  XL: 80,
} as const;

const buttonSize = {
  XS: "S",
  S: "S",
  M: "M",
  L: "L",
  XL: "XL",
} as const;

function renderCardChildren(
  children: CardProps["children"],
  renderProps: CardRenderProps,
): JSX.Element {
  return typeof children === "function" ? children(renderProps) : children;
}

function CardProviders(props: {
  size: CardSize;
  layout: "grid" | "waterfall";
  isSkeleton: Accessor<boolean>;
  children: JSX.Element;
}): JSX.Element {
  return (
    <ImageContext.Provider value={{ alt: "", styles: image({ layout: props.layout }) }}>
      <TextContext.Provider
        value={{
          slots: {
            default: {},
            title: { styles: title({ size: props.size }) },
            description: { styles: description({ size: props.size }) },
          },
        }}
      >
        <ContentContext.Provider value={{ styles: content({ size: props.size }) }}>
          <DividerContext.Provider value={{ size: "S" }}>
            <FooterContext.Provider value={{ styles: footer }}>
              <ActionMenuContext.Provider
                value={{
                  isQuiet: true,
                  size: actionButtonSize[props.size],
                  isDisabled: props.isSkeleton(),
                  "data-slot": "menu",
                  styles: actionMenu,
                }}
              >
                <SkeletonContext.Provider value={props.isSkeleton}>
                  <ImageCoordinator>{props.children}</ImageCoordinator>
                </SkeletonContext.Provider>
              </ActionMenuContext.Provider>
            </FooterContext.Provider>
          </DividerContext.Provider>
        </ContentContext.Provider>
      </TextContext.Provider>
    </ImageContext.Provider>
  );
}

function SelectionIndicator(): JSX.Element {
  const context = useContext(InternalCardContext);
  return (
    <div
      class={selectionIndicator({
        size: context.size,
        isSelected: context.isSelected,
        isStrokeInner: context.isQuiet && !context.isCheckboxSelection,
      })}
      aria-hidden="true"
    />
  );
}

function CardCheckbox(): JSX.Element {
  const context = useContext(InternalCardContext);

  if (context.itemKey == null) {
    return null as unknown as JSX.Element;
  }

  return (
    <div
      class={cardCheckboxContainer}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
    >
      <GridListSelectionCheckbox
        itemKey={context.itemKey}
        class={cardCheckboxInput({ size: context.size })}
        excludeFromTabOrder
      />
    </div>
  );
}

function cardClassName(
  local: Pick<CardProps, "UNSAFE_className" | "class" | "styles">,
  renderProps: Partial<GridListItemRenderProps | LinkRenderProps> & {
    size: CardSize;
    density: CardDensity;
    variant: CardVariant;
    isCardView?: boolean;
    isLink?: boolean;
  },
): string {
  return [local.UNSAFE_className, local.class, card(renderProps, local.styles)]
    .filter(Boolean)
    .join(" ");
}

function toInternalCardContext(input: {
  size: CardSize;
  itemKey?: Key;
  isQuiet: boolean;
  isSelected?: boolean;
  isHovered?: boolean;
  isFocusVisible?: boolean;
  isPressed?: boolean;
  isCheckboxSelection?: boolean;
}): InternalCardContextValue {
  return {
    size: input.size,
    itemKey: input.itemKey,
    isQuiet: input.isQuiet,
    isSelected: input.isSelected ?? false,
    isHovered: input.isHovered ?? false,
    isFocusVisible: input.isFocusVisible ?? false,
    isPressed: input.isPressed ?? false,
    isCheckboxSelection: input.isCheckboxSelection ?? false,
  };
}

/**
 * A Card summarizes an object that a user can select or navigate to.
 */
export function Card(props: CardProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useContext(CardContext), props.slot);
  const merged = mergeProps(
    { size: "M" as CardSize, density: "regular" as CardDensity, variant: "primary" as CardVariant },
    providerProps,
    contextProps ?? {},
    props,
  ) as CardProps;
  const [local, otherProps] = splitProps(merged, [
    "children",
    "size",
    "density",
    "variant",
    "mesh",
    "meshSeed",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "id",
    "textValue",
    "href",
    "download",
    "target",
    "rel",
    "slot",
    "ref",
    "isDisabled",
  ]);
  const { ElementType, layout } = useContext(InternalCardViewContext);
  const isSkeleton = useIsSkeleton();
  const inertRef = useInertAttribute(isSkeleton);
  let rootElement: HTMLElement | undefined;
  const assignRootRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLElement> } | null)?.ref,
    props.ref,
    inertRef,
    (element: HTMLElement) => {
      rootElement = element;
    },
  );
  const size = () => local.size ?? "M";
  const density = () => local.density ?? "regular";
  const variant = () => local.variant ?? "primary";
  const isQuiet = () => variant() === "quiet";
  const itemKey = () => local.id as Key | undefined;
  /* The weave is a seeded runtime data URI with per-scheme hues, so neither the
   * style macro (build-time classes) nor light-dark() (colors only) can carry
   * it. It rides the same space-toggle atoms every compiled color already
   * flips on — `initial` fires a slot's var() fallback, `" "` suppresses it —
   * which setColorScheme() maintains on every Provider root. */
  const meshBackground = createMemo(() => {
    const mesh = local.mesh;
    if (mesh == null || variant() === "tertiary" || variant() === "quiet") {
      return undefined;
    }
    const light = meshStrip({ dark: false, variant: mesh, seed: local.meshSeed });
    const dark = meshStrip({ dark: true, variant: mesh, seed: local.meshSeed });
    return `var(--lightningcss-light, ${light}) var(--lightningcss-dark, ${dark})`;
  });
  const meshVariant = () => (meshBackground() != null ? local.mesh : undefined);
  const rootStyle = () => {
    const backgroundImage = meshBackground();
    return backgroundImage == null
      ? local.UNSAFE_style
      : { "background-image": backgroundImage, ...local.UNSAFE_style };
  };
  const children = () => (
    <CardProviders size={size()} layout={layout} isSkeleton={isSkeleton}>
      {renderCardChildren(local.children, { size: size() })}
    </CardProviders>
  );
  const press = () => pressScale(() => rootElement, rootStyle());

  if (ElementType === "div" && !isSkeleton() && local.href) {
    return (
      <HeadlessLink
        {...filterDOMProps(otherProps as Record<string, unknown>, { global: true })}
        href={local.href}
        download={local.download}
        target={local.target}
        rel={local.rel}
        isDisabled={local.isDisabled}
        ref={(element: HTMLElement) => assignRootRef(element)}
        class={(renderProps) =>
          cardClassName(local, {
            ...renderProps,
            size: size(),
            density: density(),
            variant: variant(),
            isCardView: false,
            isLink: true,
          })
        }
        style={(renderProps) => (isQuiet() ? (local.UNSAFE_style ?? {}) : press()(renderProps))}
        data-size={size()}
        data-density={density()}
        data-variant={variant()}
        data-mesh={meshVariant()}
      >
        {(renderProps: LinkRenderProps) => (
          <InternalCardContext.Provider
            value={toInternalCardContext({
              size: size(),
              itemKey: itemKey(),
              isQuiet: isQuiet(),
              isHovered: renderProps.isHovered,
              isFocusVisible: renderProps.isFocusVisible,
              isPressed: renderProps.isPressed,
            })}
          >
            {children()}
          </InternalCardContext.Provider>
        )}
      </HeadlessLink>
    );
  }

  if (ElementType === "div" || isSkeleton()) {
    return (
      <div
        {...filterDOMProps(otherProps as Record<string, unknown>, { global: true })}
        id={local.id != null ? String(local.id) : undefined}
        ref={(element) => assignRootRef(element)}
        class={cardClassName(local, {
          size: size(),
          density: density(),
          variant: variant(),
          isCardView: ElementType !== "div",
        })}
        style={rootStyle()}
        data-size={size()}
        data-density={density()}
        data-variant={variant()}
        data-mesh={meshVariant()}
      >
        <InternalCardContext.Provider
          value={toInternalCardContext({
            size: size(),
            itemKey: itemKey(),
            isQuiet: isQuiet(),
          })}
        >
          {children()}
        </InternalCardContext.Provider>
      </div>
    );
  }

  return (
    <HeadlessGridListItem
      {...otherProps}
      id={local.id}
      textValue={local.textValue}
      ref={(element: HTMLElement) => assignRootRef(element)}
      class={(renderProps) =>
        cardClassName(local, {
          ...renderProps,
          size: size(),
          density: density(),
          variant: variant(),
          isCardView: true,
          isLink: !!local.href,
        })
      }
      style={(renderProps) => (isQuiet() ? (local.UNSAFE_style ?? {}) : press()(renderProps))}
      data-size={size()}
      data-density={density()}
      data-variant={variant()}
      data-mesh={meshVariant()}
    >
      {(renderProps: GridListItemRenderProps) => {
        const isCheckboxSelection =
          renderProps.selectionMode !== "none" && renderProps.selectionBehavior === "toggle";
        return (
          <InternalCardContext.Provider
            value={toInternalCardContext({
              size: size(),
              itemKey: itemKey(),
              isQuiet: isQuiet(),
              isSelected: renderProps.isSelected,
              isHovered: renderProps.isHovered,
              isFocusVisible: renderProps.isFocusVisible,
              isPressed: renderProps.isPressed,
              isCheckboxSelection,
            })}
          >
            {!isQuiet() && <SelectionIndicator />}
            {!isQuiet() && isCheckboxSelection && <CardCheckbox />}
            <div class={displayContents}>{children()}</div>
          </InternalCardContext.Provider>
        );
      }}
    </HeadlessGridListItem>
  );
}

export function CardPreview(props: CardPreviewProps): JSX.Element {
  const context = useContext(InternalCardContext);
  const isAssetPreview = useContext(InternalAssetPreviewContext);
  const [local, domProps] = splitProps(props, [
    "children",
    "background",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "ref",
  ]);
  let previewElement: HTMLDivElement | undefined;
  const assignPreviewRef = mergeContextRefs(props.ref, (element: HTMLDivElement) => {
    previewElement = element;
  });
  const className = () =>
    [
      local.UNSAFE_className,
      local.class,
      preview(
        {
          size: context.size,
          isQuiet: context.isQuiet,
          isHovered: context.isHovered,
          isFocusVisible: context.isFocusVisible,
          isSelected: context.isSelected,
          background: local.background,
        },
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div
      {...filterDOMProps(domProps as Record<string, unknown>, { global: true })}
      slot="preview"
      ref={(element) => assignPreviewRef(element)}
      class={className()}
      style={
        context.isQuiet
          ? pressScale(() => previewElement, local.UNSAFE_style)({ isPressed: context.isPressed })
          : local.UNSAFE_style
      }
    >
      {context.isQuiet && <SelectionIndicator />}
      {context.isQuiet && context.isCheckboxSelection && <CardCheckbox />}
      <div class={previewClip}>
        {isAssetPreview ? (
          <IconContext.Provider
            value={{
              render: (icon) => (
                <SkeletonWrapper>
                  <div class={assetIllustrationWrapper}>{icon}</div>
                </SkeletonWrapper>
              ),
              styles: assetIllustration,
            }}
          >
            {local.children}
          </IconContext.Provider>
        ) : (
          local.children
        )}
      </div>
    </div>
  );
}

export function CollectionCardPreview(props: CardPreviewProps): JSX.Element {
  const context = useContext(InternalCardContext);
  return (
    <CardPreview {...props}>
      <div class={collection({ size: context.size })}>
        {/* `collectionImage` takes no size condition, so the macro bakes it to a class string,
            not a selector function — passing `size` here threw at render. Inherited from the
            port; unnoticed because nothing rendered a collection preview until now. */}
        <ImageContext.Provider value={{ styles: collectionImage }}>
          {props.children}
        </ImageContext.Provider>
      </div>
    </CardPreview>
  );
}

export function AssetCard(props: AssetCardProps): JSX.Element {
  const { layout } = useContext(InternalCardViewContext);
  return (
    <Card {...props} density="regular">
      {(renderProps) => (
        <ImageContext.Provider value={{ alt: "", styles: assetImage({ layout }) }}>
          <IllustrationContext.Provider
            value={{
              render: (icon) => (
                <SkeletonWrapper>
                  <div class={assetIllustrationWrapper}>{icon}</div>
                </SkeletonWrapper>
              ),
              styles: assetIllustration,
            }}
          >
            <InternalAssetPreviewContext.Provider value={true}>
              {renderCardChildren(props.children, renderProps)}
            </InternalAssetPreviewContext.Provider>
          </IllustrationContext.Provider>
        </ImageContext.Provider>
      )}
    </Card>
  );
}

export function UserCard(props: UserCardProps): JSX.Element {
  return (
    <Card {...props} density="spacious">
      {(renderProps) => (
        <ImageContext.Provider value={{ alt: "", styles: userImage }}>
          <AvatarContext.Provider
            value={{
              size: avatarSize[renderProps.size],
              UNSAFE_style: {
                "--size": `${avatarSize[renderProps.size] / 16}rem`,
              },
              styles: userAvatar,
              isOverBackground: true,
            }}
          >
            {renderCardChildren(props.children, renderProps)}
          </AvatarContext.Provider>
        </ImageContext.Provider>
      )}
    </Card>
  );
}

export function ProductCard(props: ProductCardProps): JSX.Element {
  return (
    <Card {...props} density="spacious">
      {(renderProps) => (
        <ImageContext.Provider
          value={{
            slots: {
              preview: {
                alt: "",
                styles: productPreviewImage,
              },
              thumbnail: {
                alt: "",
                styles: productThumbnail({ size: renderProps.size }),
              },
            },
          }}
        >
          <FooterContext.Provider value={{ styles: mergeStyles(footer, productFooter) }}>
            <ButtonContext.Provider value={{ size: buttonSize[renderProps.size] }}>
              <LinkButtonContext.Provider value={{ size: buttonSize[renderProps.size] }}>
                {renderCardChildren(props.children, renderProps)}
              </LinkButtonContext.Provider>
            </ButtonContext.Provider>
          </FooterContext.Provider>
        </ImageContext.Provider>
      )}
    </Card>
  );
}

export { Image };
