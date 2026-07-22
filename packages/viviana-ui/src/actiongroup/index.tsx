import { type JSX, splitProps } from "solid-js";
import {
  ActionGroup as HeadlessActionGroup,
  type ActionGroupProps as HeadlessActionGroupProps,
  type ActionGroupRenderProps,
  type ActionGroupItemRenderProps,
  type ActionGroupItem,
} from "@proyecto-viviana/solidaria-components";
import type { Key, SelectionMode } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../style";
import { baseColor, css, focusRing, style } from "../style" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
import { useProviderProps } from "../provider";

export interface ActionGroupProps<T extends ActionGroupItem = ActionGroupItem> {
  /** The items in the action group. */
  items: T[];
  /** The selection mode. @default 'none' */
  selectionMode?: SelectionMode;
  /** Orientation of the group. @default 'horizontal' */
  orientation?: "horizontal" | "vertical";
  /** Whether the entire group is disabled. */
  isDisabled?: boolean;
  /** Accessible label. */
  "aria-label"?: string;
  /** Labelled-by id. */
  "aria-labelledby"?: string;
  /** Currently selected keys (controlled). */
  selectedKeys?: Iterable<Key>;
  /** Default selected keys (uncontrolled). */
  defaultSelectedKeys?: Iterable<Key>;
  /** Handler called when selection changes. */
  onSelectionChange?: (keys: "all" | Set<Key>) => void;
  /** Handler called when an item action is triggered. */
  onAction?: (key: Key) => void;
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** Optional render function for action items. */
  children?: (item: T, renderProps: ActionGroupItemRenderProps) => JSX.Element;
  /** Custom render function for items. If not provided, uses item.label. */
  renderItem?: (item: T, renderProps: ActionGroupItemRenderProps) => JSX.Element;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  class?: string;
}

// S2 style macro (Tailwind-removal Phase 0). S2 1.5.x ships no ActionGroup
// component (it was split into ActionButtonGroup / ToggleButtonGroup /
// SegmentedControl), so there is no upstream ActionGroup paint to mirror
// verbatim; these styles reuse the shared S2 idiom of those siblings — a
// bordered pill container of ActionButton-like items — expressed through the
// same `style` macro tokens rather than the invented Tailwind vocabulary.
const actionGroupContainer = style<{ orientation: "horizontal" | "vertical" }>({
  display: "inline-flex",
  // The bordered pill must hug its items. Stacked parents stretch children to
  // full width by default: column-flex via align-self, grid via justify-self
  // (grid also blockifies inline-flex, so the display value alone can't help).
  alignSelf: "start",
  justifySelf: "start",
  alignItems: "center",
  gap: 4,
  flexDirection: {
    orientation: {
      horizontal: "row",
      vertical: "column",
    },
  },
  borderRadius: "card",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
  backgroundColor: "gray-25",
  padding: 4,
});

const actionGroupItem = style<ActionGroupItemRenderProps>({
  ...focusRing(),
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  whiteSpace: "nowrap",
  userSelect: "none",
  paddingX: 12,
  paddingY: 4,
  borderRadius: "default",
  fontSize: "ui-sm",
  transition: "default",
  cursor: {
    default: "default",
    isDisabled: "not-allowed",
  },
  color: {
    default: baseColor("neutral-subdued"),
    isSelected: "white",
    isDisabled: "disabled",
  },
  backgroundColor: {
    default: "transparent",
    isSelected: "accent",
  },
});

/* The headless layer renders each item as a bare <button> with no class hook
 * (solidaria-components ActionGroup.tsx, ActionGroupItemWrapper) — every atom
 * above lands on the span INSIDE it. Without this reset the UA button chrome
 * (opaque ButtonFace fill, 2px outset border, its own font) paints AROUND the
 * styled span, burying the transparent resting state under grey lozenges. The
 * single-element style() macro can't reach a child element, so the reset ships
 * through the css() escape hatch on the container. The UA :focus-visible
 * outline is deliberately NOT reset: real focus lands on the button, and the
 * span's focusRing() atoms key on an isFocusVisible render prop the item
 * render props never carry. */
const actionGroupButtonReset = css(`
  & > button {
    appearance: none;
    display: inline-flex;
    background: none;
    border: none;
    padding: 0;
    margin: 0;
    font: inherit;
    color: inherit;
  }
`);

export function ActionGroup<T extends ActionGroupItem = ActionGroupItem>(
  props: ActionGroupProps<T>,
): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "class",
    "styles",
    "renderItem",
    "children",
  ]);

  const containerClass = (rp: ActionGroupRenderProps): string =>
    [
      local.class,
      actionGroupButtonReset,
      mergeStyles(
        actionGroupContainer({ orientation: rp.orientation }) as StyleString,
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <HeadlessActionGroup<T>
      {...(headlessProps as HeadlessActionGroupProps<T>)}
      class={containerClass}
    >
      {(item: T, renderProps: ActionGroupItemRenderProps) => (
        <span class={actionGroupItem(renderProps)}>
          {local.renderItem
            ? local.renderItem(item, renderProps)
            : local.children
              ? local.children(item, renderProps)
              : item.label}
        </span>
      )}
    </HeadlessActionGroup>
  );
}
