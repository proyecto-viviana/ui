// @ts-nocheck
import {
  type JSX,
  children as resolveChildren,
  createContext,
  createUniqueId,
  mergeProps,
  splitProps,
  useContext,
  Show,
} from "solid-js";
import { isServer } from "solid-js/web";
import { getSlottedContextProps, type SpectrumContextValue } from "../button/spectrum-context";
import {
  TagList as HeadlessTagList,
  Tag as HeadlessTag,
  TagRemoveButton as HeadlessTagRemoveButton,
  type TagListProps as HeadlessTagListProps,
  type TagRenderProps,
  type TagProps as HeadlessTagProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key, SelectionBehavior, SelectionMode } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../style";
import { baseColor, focusRing, lightDark, style } from "../style" with { type: "macro" };
import {
  control,
  controlFont,
  field,
  fieldInput,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { useProviderProps } from "../provider";
import { pressScale } from "../pressScale";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import { CrossIcon } from "../icon/ui-icons/Cross";
import { ActionButton } from "../button/ActionButton";

export type TagGroupSize = "S" | "M" | "L" | "sm" | "md" | "lg";
type S2TagGroupSize = "S" | "M" | "L";
export type TagGroupVariant = "default" | "outline" | "solid";
export type TagGroupLabelPosition = "top" | "side";
export type TagGroupLabelAlign = "start" | "end";

export interface TagGroupProps<T extends { id?: Key; key?: Key }> extends Omit<
  HeadlessTagListProps<T>,
  "class" | "style" | "children" | "label"
> {
  /** The label for the tag group. */
  label?: JSX.Element;
  /** Function to render each tag or each tag's content. */
  children: (item: T) => JSX.Element;
  /** S2 tag size. Legacy sm/md/lg aliases map to S/M/L. @default 'M' */
  size?: TagGroupSize;
  /** Legacy visual variant. Prefer `isEmphasized` for S2 parity. */
  variant?: TagGroupVariant;
  /** Whether selected tags use the emphasized accent fill. */
  isEmphasized?: boolean;
  /** Description text shown below the tag list. */
  description?: JSX.Element;
  /** Error message shown when invalid. */
  errorMessage?: JSX.Element;
  /** Whether the group is invalid. */
  isInvalid?: boolean;
  /** Position of the label relative to the tag list. */
  labelPosition?: TagGroupLabelPosition;
  /** Text alignment for side labels. */
  labelAlign?: TagGroupLabelAlign;
  /** Label for the optional group action button. */
  groupActionLabel?: string;
  /** Handler for the optional group action button. */
  onGroupAction?: () => void;
  /** Maximum visible rows. This is approximated with overflow clipping in Solid. */
  maxRows?: number;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Backward-compatible inline style alias. Prefer UNSAFE_style for S2 parity. */
  style?: JSX.CSSProperties;
  /** Handler called when a tag is activated. */
  onAction?: (key: Key) => void;
}

export interface TagProps extends Omit<HeadlessTagProps, "class" | "style" | "children"> {
  /** The content of the tag. */
  children?: JSX.Element;
  /** Whether selected tags use the emphasized accent fill. Inherited from TagGroup. */
  isEmphasized?: boolean;
  /** S2 tag size. Inherited from TagGroup. */
  size?: TagGroupSize;
  /** Href retained for API parity; rendered as a tag action in the current Solid primitive. */
  href?: string;
  /** Link target retained for API parity. */
  target?: string;
  /** Link relationship retained for API parity. */
  rel?: string;
  /** Handler called when this tag is activated. */
  onAction?: (key: Key) => void;
  /** Additional CSS class name. Use only as a last resort. */
  class?: string;
  /** Additional inline styles. Use only as a last resort. */
  style?: JSX.CSSProperties;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
}

export const TagGroupContext = createContext<SpectrumContextValue<TagGroupProps<any>>>(null);

interface TagGroupContextValue {
  size: S2TagGroupSize;
  isEmphasized: boolean;
  onAction?: (key: Key) => void;
}

interface TagGroupStyleProps extends TagRenderProps {
  size?: S2TagGroupSize;
  labelPosition?: TagGroupLabelPosition;
  labelAlign?: TagGroupLabelAlign;
  isEmphasized?: boolean;
  isInvalid?: boolean;
  isLink?: boolean;
  isEmpty?: boolean;
  isDisabled?: boolean;
  allowsRemoving?: boolean;
}

const StyledTagGroupContext = createContext<TagGroupContextValue>();

const tagGroupRoot = style<TagGroupStyleProps>(
  {
    ...field(),
    font: controlFont(),
    color: {
      default: baseColor("neutral"),
      isDisabled: "disabled",
      forcedColors: {
        default: "ButtonText",
        isDisabled: "GrayText",
      },
    },
  },
  getAllowedOverrides(),
);

const labelWrapper = style<TagGroupStyleProps>({
  gridArea: "label",
  display: "inline",
  textAlign: {
    labelAlign: {
      start: "start",
      end: "end",
    },
  },
  paddingBottom: {
    labelPosition: {
      top: "--field-gap",
    },
  },
  contain: {
    labelPosition: {
      top: "inline-size",
    },
  },
});

const labelStyle = style({
  ...fieldLabel(),
});

const tagListContainer = style<TagGroupStyleProps>({
  gridArea: "input",
  minWidth: "full",
  marginStart: {
    default: -4,
    isEmpty: 0,
  },
  marginEnd: {
    default: 4,
    isEmpty: 0,
  },
  position: "relative",
});

const tagListStyle = style({
  ...fieldInput(),
  display: "inline",
  minWidth: "full",
  // S2's real `<TagList>` sets a FIXED `font: 'ui'` (14px) on the grid container —
  // NOT the size-conditional `controlFont()`. The tags scale their own font via
  // `control()`; the grid's font is a static default (D1 grid font-size diverges at
  // size S/L when this ramps).
  font: "ui",
  outlineStyle: "none",
});

const tagStyle = style<TagGroupStyleProps>({
  ...focusRing(),
  ...control({ shape: "default", icon: true, register: "chip" }),
  display: "inline-flex",
  maxWidth: "full",
  verticalAlign: "middle",
  justifyContent: "center",
  transition: "default",
  /* The muted chip is a WELL, not a gray step. All three of the handoff's unselected
   * chips are drawn `background: var(--surface-well)` inside `--well-border`
   * (TerminalGlassLab.tsx:35-55) — the same matte surface as a terminal well, which is
   * why `control({register:"chip"})` above already hands them the well's border. The
   * fill was the last part still coming off the ramp, and `gray-100` is opaque on both
   * columns (#e5eaf1 / #43474d), so the chips read as flat grey plates on a page whose
   * every other surface is glass or well: 10 elements in dark, 10 in light.
   *
   * Hover has no drawn counterpart — the handoff's chips are static — so it takes
   * `surface-hover`, the register's one hover surface, rather than a second ramp step. */
  backgroundColor: {
    default: "well",
    isHovered: {
      default: "surface-hover",
    },
    isFocusVisible: {
      default: "surface-hover",
    },
    isSelected: {
      default: baseColor("neutral"),
      isEmphasized: {
        default: lightDark("accent-900", "accent-700"),
        isHovered: lightDark("accent-1000", "accent-800"),
        isPressed: lightDark("accent-1000", "accent-800"),
        isFocusVisible: lightDark("accent-1000", "accent-800"),
      },
    },
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonFace",
      isSelected: "Highlight",
    },
  },
  /* ...and the well's dither with it. The handoff sets `scan: true` on exactly the three
   * well-filled chips and `scan: false` on the selected one (TerminalGlassLab.tsx:33, :40),
   * so the texture follows the fill: a chip that stops being a well stops being dithered.
   *
   * The gradient is `wellScan()`'s literal, restated rather than spread because that helper
   * emits an unconditional `backgroundImage` and this needs the `isSelected` branch —
   * spreading it and re-declaring the key in the same object is the duplicate-key trap.
   * `wellScan()` remains the source of the value; if it moves, this moves with it. */
  backgroundImage: {
    default: "[repeating-conic-gradient(var(--well-scan) 0% 25%, transparent 0% 50%)]",
    isSelected: "none",
    forcedColors: "none",
  },
  backgroundSize: "[4px 4px]",
  color: {
    default: baseColor("neutral"),
    isSelected: {
      default: "gray-25",
      isEmphasized: "white",
    },
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonText",
      isSelected: "HighlightText",
      isDisabled: "GrayText",
    },
  },
  /* The chip's 1px edge arrives with `control({register: "chip"})` above, which sets
   * `borderWidth: 1`, `borderStyle: "solid"` and a resting `borderColor: "well-border"`
   * (s2-internal/style-utils.ts). This slot previously held `borderStyle: "none"`, and
   * because a literal key REPLACES the spread's value for that property, it cancelled the
   * register's edge outright — the chip drew no border at all. Only the state colours
   * belong here now; the width and style come from the register.
   *
   * A `default` stop is mandatory, not redundant with the spread: declaring `borderColor`
   * as a literal key discards the register's `well-border` for every state this map does
   * not name, and an unnamed state would fall back to `currentColor` (the tag's text).
   *
   * The stops mirror the `backgroundColor` map above so a selected chip's edge matches its
   * own fill rather than outlining it in the muted well colour.
   *
   * `gray-800` here is deliberate and must not be "corrected" to `baseColor("neutral")` for
   * symmetry with the fill above: the theme's `borderColor` map (style/spectrum-theme.ts)
   * exposes `...baseColors` plus `negative`, `disabled` and the three edge tokens, but no
   * `neutral` — that key exists only on the `color`, `backgroundColor` and `fill` maps, so
   * `neutral` throws `Invalid color neutral` at macro build time. This file is `@ts-nocheck`,
   * so that surfaces as a build crash rather than a type error. The substitution is exact,
   * not approximate: `neutral` on `backgroundColor` is `neutral-background-color-default`,
   * which is a token `ref` to `{gray-800}`, and `nextColorStop` recurses through refs — so
   * both spellings resolve to the same stop and both step to gray-900 on hover/press. */
  borderColor: {
    default: "well-border",
    isSelected: {
      default: baseColor("gray-800"),
      isEmphasized: {
        default: lightDark("accent-900", "accent-700"),
        isHovered: lightDark("accent-1000", "accent-800"),
        isPressed: lightDark("accent-1000", "accent-800"),
        isFocusVisible: lightDark("accent-1000", "accent-800"),
      },
    },
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonBorder",
      isSelected: "Highlight",
      isDisabled: "GrayText",
    },
  },
  paddingEnd: {
    default: "edge-to-text",
    allowsRemoving: 0,
  },
  margin: 4,
  cursor: {
    default: "default",
    isLink: "pointer",
    isDisabled: "default",
  },
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

// S2's TagWrapper CONTENT DIV (a sibling of the ClearButton at the tag-row flex
// level). It carries NO `order`, so it keeps DOM order (content before the remove
// button). The `order`/`truncate` belong on the inner Text (`tagTextStyle`), NOT
// here — putting them on the row-level element sorts the label AFTER the
// `order: 0` remove button (`× Landscape` instead of `Landscape ×`).
const tagContentStyle = style({
  display: "flex",
  minWidth: 0,
  alignItems: "center",
  gap: "text-to-visual",
  forcedColorAdjust: "none",
  backgroundColor: "transparent",
});

// S2's `TextContext` styles inside the content div: `{order: 1, truncate: true}`
// (icon slots take `order: 0`, so the icon precedes the text regardless of DOM
// order). Scoped to the inner text — see `tagContentStyle`.
const tagTextStyle = style({
  order: 1,
  truncate: true,
});

// Captured so the `outlineColor` static-color branch can reuse the focus ring's own
// default (mirrors S2 `const focusRingStyles = focusRing()`).
const removeButtonFocusRing = focusRing();

const removeButtonStyle = style<TagGroupStyleProps>({
  ...removeButtonFocusRing,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  // Mirror S2 ClearButton (`visibleClearButton`): fill the tag height and width to
  // the control-size ramp (`controlSize()` = {S: 24, M: 32, L: 40}). The port's
  // local `controlSize` helper has a different meaning, so the ramp is inlined.
  height: "full",
  width: {
    size: {
      S: 24,
      M: 32,
      L: 40,
    },
  },
  flexShrink: 0,
  borderRadius: "full",
  borderStyle: "none",
  backgroundColor: "transparent",
  color: "inherit",
  boxSizing: "border-box",
  padding: 0,
  outlineOffset: -4,
  // Mirror S2 `visibleClearButton`: a static-color (emphasized + selected) tag uses
  // a white focus outline against its accent fill; every other tag uses the default
  // focus-ring colour. `isStaticColor` = `isEmphasized && isSelected` (threaded in
  // by the TagWrapper — here at the render site).
  outlineColor: {
    default: removeButtonFocusRing.outlineColor,
    isStaticColor: "white",
  },
  // S2 `visibleClearButton` sets NO cursor — the native `<button>` UA cursor
  // (`default`) stands. Do NOT re-add the arrow→`pointer` override (an invented
  // divergence: D1 pins React's native `default`).
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const helpTextStyle = style<TagGroupStyleProps>({
  gridArea: "helptext",
  display: "flex",
  margin: 0,
  alignItems: "baseline",
  gap: "text-to-visual",
  font: controlFont(),
  color: {
    default: "neutral-subdued",
    isInvalid: {
      default: "negative",
      forcedColors: "Mark",
    },
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
  contain: "inline-size",
  paddingTop: "--field-gap",
});

const emptyStateStyle = style({
  color: "neutral-subdued",
  font: controlFont(),
});

const actionRowStyle = style({
  display: "inline-flex",
  verticalAlign: "middle",
  margin: 4,
  gap: 4,
});

const errorIconStyle = style({
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
  flexShrink: 0,
});

function normalizeSize(size: TagGroupSize | undefined): S2TagGroupSize {
  switch (size) {
    case "sm":
      return "S";
    case "md":
      return "M";
    case "lg":
      return "L";
    case "S":
    case "M":
    case "L":
      return size;
    default:
      return "M";
  }
}

function getItemKey<T extends { id?: Key; key?: Key }>(item: T, getKey?: (item: T) => Key): Key {
  if (getKey) return getKey(item);
  if (item.id !== undefined) return item.id;
  if (item.key !== undefined) return item.key;
  return String(item);
}

function hasKey(keys: Iterable<Key> | "all" | undefined, key: Key): boolean {
  if (keys == null) {
    return false;
  }

  if (keys === "all") {
    return true;
  }

  if ("has" in keys && typeof keys.has === "function") {
    return keys.has(key);
  }

  for (const value of keys) {
    if (value === key) {
      return true;
    }
  }

  return false;
}

// Matches a `role="row"` attribute in a serialized SSR node's markup, mirroring the client-side
// `getAttribute("role") === "row"` check below.
const SSR_TAG_ROW_PATTERN = /\srole="row"[\s>]/;
// Matches the `solidaria-Tag` token inside a `class="..."` attribute, mirroring the client-side
// `classList.contains("solidaria-Tag")` check below.
const SSR_TAG_CLASS_PATTERN = /\sclass="[^"]*\bsolidaria-Tag\b[^"]*"/;

function isRenderedTag(value: JSX.Element): boolean {
  if (Array.isArray(value)) {
    return value.length === 1 && isRenderedTag(value[0]);
  }

  if (isServer) {
    // During renderToString, resolved children are Solid's server-side SSR node objects
    // (`{ t: string }` holding the serialized HTML), not HTMLElement instances — `HTMLElement`
    // isn't even a global in Node. Duck-type the same "already a rendered Tag row" signal the
    // client checks for (a `role="row"` gridcell wrapper carrying the Tag class) by inspecting
    // the markup string directly, so the wrap/no-wrap decision matches what the client will
    // compute once `HTMLElement` is real and hydration can walk a matching tree.
    const markup = (value as { t?: unknown } | null | undefined)?.t;
    if (typeof markup !== "string") {
      return false;
    }
    return SSR_TAG_ROW_PATTERN.test(markup) || SSR_TAG_CLASS_PATTERN.test(markup);
  }

  if (typeof HTMLElement === "undefined" || !(value instanceof HTMLElement)) {
    return false;
  }
  return value.getAttribute("role") === "row" || value.classList.contains("solidaria-Tag");
}

function joinIds(...ids: Array<string | undefined | false>) {
  return ids.filter(Boolean).join(" ") || undefined;
}

function maxRowsStyle(
  maxRows: number | undefined,
  size: S2TagGroupSize,
): JSX.CSSProperties | undefined {
  if (maxRows == null || maxRows <= 0) {
    return undefined;
  }

  const rowHeight = size === "L" ? 44 : size === "S" ? 30 : 36;
  return {
    "max-height": `${rowHeight * maxRows}px`,
    overflow: "hidden",
  };
}

function resolveStyleClass<P extends Record<string, unknown>>(
  styleValue: StyleString | ((props: P) => StyleString),
  props: P,
): string {
  return typeof styleValue === "function" ? styleValue(props) : styleValue;
}

/**
 * An individual Tag for TagGroups.
 */
export function Tag(props: TagProps): JSX.Element {
  const ctx = useContext(StyledTagGroupContext);
  const [local, tagProps] = splitProps(props, [
    "class",
    "style",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "children",
    "id",
    "isDisabled",
    "isEmphasized",
    "size",
    "href",
    "target",
    "rel",
    "onAction",
    "textValue",
  ]);

  // Mirror S2 Tag: derive the row's accessible text from string children when no
  // explicit textValue is given. This names the row (and cascades to the remove
  // button's `aria-labelledby` and the gridcell's name-from-contents), matching
  // how S2 auto-derives `node.textValue` from string children.
  const textValue = () =>
    local.textValue ?? (typeof local.children === "string" ? local.children : undefined);
  const size = () => normalizeSize(local.size ?? ctx?.size);
  const isEmphasized = () => local.isEmphasized ?? ctx?.isEmphasized ?? false;
  const isLink = () => local.href != null;
  const actionHandler = () => local.onAction ?? ctx?.onAction;

  // Mirror S2 Tag: `ref={domRef} style={pressScale(domRef)}` — the layer hint
  // (`will-change: transform`) at rest, plus the press-scale transform on press.
  let tagEl: HTMLDivElement | undefined;
  const rowStyle = (renderProps: TagRenderProps): JSX.CSSProperties =>
    pressScale(() => tagEl, local.UNSAFE_style ?? local.style)(renderProps);

  // Mirror S2 ClearButton: `<Button style={pressScale(domRef)}>` — pressScale
  // ALWAYS contributes the `will-change: transform` layer hint. The plain headless
  // remove button carries no press state yet, so only the resting hint is mirrored
  // here; the on-press scale lands with the CP9.44b interaction pass
  // (tech-debt `taggroup-remove-pressscale`).
  const removeButtonRestStyle = pressScale(undefined)({ isPressed: false });

  const className = (renderProps: TagRenderProps) =>
    [
      local.UNSAFE_className,
      local.class,
      tagStyle(
        {
          ...renderProps,
          size: size(),
          isEmphasized: isEmphasized(),
          isLink: isLink(),
        },
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessTag
      {...tagProps}
      id={local.id}
      isDisabled={local.isDisabled}
      textValue={textValue()}
      class={className}
      ref={(el: HTMLDivElement) => (tagEl = el)}
      style={rowStyle}
      data-href={local.href}
      data-target={local.target}
      data-rel={local.rel}
      onAction={() => actionHandler()?.(local.id)}
    >
      {(renderProps) => (
        <>
          <div class={resolveStyleClass(tagContentStyle, {})}>
            <span class={resolveStyleClass(tagTextStyle, {})}>{local.children}</span>
          </div>
          <Show when={renderProps.allowsRemoving}>
            <HeadlessTagRemoveButton
              buttonProps={renderProps.removeButtonProps}
              class={removeButtonStyle({
                ...renderProps,
                size: size(),
                isEmphasized: isEmphasized(),
                // S2 TagWrapper: `isStaticColor={isEmphasized && isSelected}`.
                isStaticColor: isEmphasized() && renderProps.isSelected,
              })}
              style={removeButtonRestStyle}
            >
              {/* S2 ClearButton renders `<CrossIcon size={props.size}/>` with the RAW
                  control size — the ui-icon selects its own variant (S→Size75,
                  M→Size100, L→Size200) and CSS width (S=M=8px, L=10px). Passing a
                  down-mapped size renders the wrong Cross path variant. No
                  `aria-hidden`: S2's ClearButton leaves the bare CrossIcon svg
                  exposed (Chromium reports an unnamed `img` under the labelled
                  remove button), so mirror that AX shape rather than hiding it. */}
              <CrossIcon size={size()} />
            </HeadlessTagRemoveButton>
          </Show>
        </>
      )}
    </HeadlessTag>
  );
}

/**
 * A tag group displays a collection of tags that can be selected and/or removed.
 */
export function TagGroup<T extends { id?: Key; key?: Key }>(props: TagGroupProps<T>): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useContext(TagGroupContext), props.slot);
  const mergedProps = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, listProps] = splitProps(mergedProps, [
    "label",
    "items",
    "children",
    "getKey",
    "onRemove",
    "size",
    "variant",
    "isEmphasized",
    "description",
    "errorMessage",
    "isInvalid",
    "labelPosition",
    "labelAlign",
    "groupActionLabel",
    "onGroupAction",
    "maxRows",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "style",
    "renderEmptyState",
    "selectionMode",
    "selectionBehavior",
    "selectedKeys",
    "defaultSelectedKeys",
    "onSelectionChange",
    "disabledKeys",
    "isDisabled",
    "onAction",
    "id",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
  ]);

  const labelId = createUniqueId();
  const descriptionId = createUniqueId();
  const errorId = createUniqueId();
  const size = () => normalizeSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const isInvalid = () => local.isInvalid === true;
  const isEmphasized = () => local.isEmphasized ?? local.variant === "solid";
  const hasItems = () => local.items.length > 0;
  const keyForItem = (item: T) => getItemKey(item, local.getKey);
  const renderedEmptyState = () => (
    <span class={resolveStyleClass(emptyStateStyle, { size: size() })}>
      {local.renderEmptyState?.() ?? "No tags"}
    </span>
  );

  const describedBy = () =>
    joinIds(
      local["aria-describedby"],
      local.description && !isInvalid() ? descriptionId : undefined,
      local.errorMessage && isInvalid() ? errorId : undefined,
    );

  const rootClass = () =>
    [
      local.UNSAFE_className,
      local.class,
      tagGroupRoot(
        {
          size: size(),
          labelPosition: labelPosition(),
          labelAlign: labelAlign(),
          isDisabled: local.isDisabled,
          isInvalid: isInvalid(),
        },
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const renderItem = (item: T) => {
    const resolved = resolveChildren(() => local.children(item));
    const rendered = resolved();
    if (isRenderedTag(rendered)) {
      return rendered;
    }

    return (
      <Tag id={keyForItem(item)} isDisabled={hasKey(local.disabledKeys, keyForItem(item))}>
        {rendered}
      </Tag>
    );
  };

  const contextValue: TagGroupContextValue = {
    get size() {
      return size();
    },
    get isEmphasized() {
      return isEmphasized();
    },
    get onAction() {
      return local.onAction;
    },
  };

  return (
    <StyledTagGroupContext.Provider value={contextValue}>
      <div
        id={local.id}
        class={rootClass()}
        style={local.UNSAFE_style ?? local.style}
        data-invalid={isInvalid() ? "true" : undefined}
        data-disabled={local.isDisabled ? "true" : undefined}
      >
        <Show when={local.label}>
          <div
            class={labelWrapper({
              size: size(),
              labelPosition: labelPosition(),
              labelAlign: labelAlign(),
            })}
          >
            <span
              id={labelId}
              class={resolveStyleClass(labelStyle, { size: size(), isDisabled: local.isDisabled })}
            >
              {local.label}
            </span>
          </div>
        </Show>

        <div
          class={tagListContainer({
            size: size(),
            isEmpty: local.items.length === 0,
          })}
          style={maxRowsStyle(local.maxRows, size())}
        >
          <HeadlessTagList
            {...listProps}
            items={local.items}
            getKey={local.getKey}
            onRemove={local.onRemove}
            selectionMode={local.selectionMode}
            selectionBehavior={local.selectionBehavior}
            selectedKeys={local.selectedKeys}
            defaultSelectedKeys={local.defaultSelectedKeys}
            onSelectionChange={local.onSelectionChange}
            disabledKeys={local.disabledKeys}
            isDisabled={local.isDisabled}
            aria-label={local["aria-label"]}
            aria-labelledby={local.label ? labelId : local["aria-labelledby"]}
            aria-describedby={describedBy()}
            class={(renderProps) =>
              resolveStyleClass(tagListStyle, {
                ...renderProps,
                size: size(),
                isDisabled: local.isDisabled,
              })
            }
            renderEmptyState={renderedEmptyState}
          >
            {renderItem}
          </HeadlessTagList>

          <Show when={hasItems() && local.groupActionLabel && local.onGroupAction}>
            <span class={resolveStyleClass(actionRowStyle, { size: size() })}>
              <ActionButton size={size()} isQuiet onPress={local.onGroupAction}>
                {local.groupActionLabel}
              </ActionButton>
            </span>
          </Show>
        </div>

        <Show when={local.description && !isInvalid()}>
          <p
            id={descriptionId}
            class={helpTextStyle({
              size: size(),
              isInvalid: false,
              isDisabled: local.isDisabled,
            })}
          >
            {local.description}
          </p>
        </Show>

        <Show when={local.errorMessage && isInvalid()}>
          <p
            id={errorId}
            class={helpTextStyle({
              size: size(),
              isInvalid: true,
              isDisabled: local.isDisabled,
            })}
          >
            <AlertTriangleIcon styles={errorIconStyle} size={size()} aria-hidden="true" />
            {local.errorMessage}
          </p>
        </Show>
      </div>
    </StyledTagGroupContext.Provider>
  );
}

export type { Key, SelectionBehavior, SelectionMode };
