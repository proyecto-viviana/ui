// @ts-nocheck
import {
  type JSX,
  children as resolveChildren,
  createContext,
  createUniqueId,
  splitProps,
  useContext,
  Show,
} from "solid-js";
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
  font: controlFont(),
  outlineStyle: "none",
});

const tagStyle = style<TagGroupStyleProps>({
  ...focusRing(),
  ...control({ shape: "default", icon: true }),
  display: "inline-flex",
  maxWidth: "full",
  verticalAlign: "middle",
  justifyContent: "center",
  transition: "default",
  backgroundColor: {
    default: "gray-100",
    isHovered: {
      default: "gray-200",
    },
    isFocusVisible: {
      default: "gray-200",
    },
    isSelected: {
      default: baseColor("neutral"),
      isEmphasized: {
        default: lightDark("accent-900", "accent-700"),
        isHovered: lightDark("accent-1000", "accent-600"),
        isPressed: lightDark("accent-1000", "accent-600"),
        isFocusVisible: lightDark("accent-1000", "accent-600"),
      },
    },
    isDisabled: "disabled",
    forcedColors: {
      default: "ButtonFace",
      isSelected: "Highlight",
    },
  },
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
  borderStyle: "none",
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

const tagContentStyle = style({
  display: "flex",
  minWidth: 0,
  alignItems: "center",
  gap: "text-to-visual",
  forcedColorAdjust: "none",
  backgroundColor: "transparent",
  order: 1,
  truncate: true,
});

const removeButtonStyle = style<TagGroupStyleProps>({
  ...focusRing(),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  size: {
    size: {
      S: 20,
      M: 24,
      L: 32,
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
  cursor: {
    default: "pointer",
    isDisabled: "default",
  },
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

function isRenderedTag(value: JSX.Element): boolean {
  if (Array.isArray(value)) {
    return value.length === 1 && isRenderedTag(value[0]);
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

function removeIconSize(size: S2TagGroupSize): "S" | "M" | "L" {
  return size === "L" ? "M" : "S";
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
  ]);
  const size = () => normalizeSize(local.size ?? ctx?.size);
  const isEmphasized = () => local.isEmphasized ?? ctx?.isEmphasized ?? false;
  const isLink = () => local.href != null;
  const actionHandler = () => local.onAction ?? ctx?.onAction;

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
      class={className}
      style={local.UNSAFE_style ?? local.style}
      data-href={local.href}
      data-target={local.target}
      data-rel={local.rel}
      onAction={() => actionHandler()?.(local.id)}
    >
      {(renderProps) => (
        <>
          <span class={resolveStyleClass(tagContentStyle, { size: size() })}>{local.children}</span>
          <Show when={renderProps.allowsRemoving}>
            <HeadlessTagRemoveButton
              buttonProps={renderProps.removeButtonProps}
              class={removeButtonStyle({
                ...renderProps,
                size: size(),
                isEmphasized: isEmphasized(),
              })}
            >
              <CrossIcon size={removeIconSize(size())} aria-hidden="true" />
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
  const mergedProps = useProviderProps(props);
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
