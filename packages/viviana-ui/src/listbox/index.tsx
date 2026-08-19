import { type JSX, splitProps, createContext, useContext, Show, createUniqueId } from "solid-js";
import {
  ListBox as HeadlessListBox,
  ListBoxOption as HeadlessListBoxOption,
  ListBoxSection as HeadlessListBoxSection,
  type ListBoxProps as HeadlessListBoxProps,
  type ListBoxOptionProps as HeadlessListBoxOptionProps,
  type ListBoxSectionProps as HeadlessListBoxSectionProps,
  type ListBoxRenderProps,
  type ListBoxOptionRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import { useProviderProps } from "../provider";
import { style, focusRing } from "../style" with { type: "macro" };

export type ListBoxSize = "sm" | "md" | "lg";

const ListBoxSizeContext = createContext<ListBoxSize>("md");

export interface ListBoxProps<T> extends Omit<HeadlessListBoxProps<T>, "class" | "style"> {
  /** The size of the listbox. */
  size?: ListBoxSize;
  /** Additional CSS class name. */
  class?: string;
  /** Label for the listbox. */
  label?: string;
  /** Description for the listbox. */
  description?: string;
}

export interface ListBoxOptionProps<T> extends Omit<
  HeadlessListBoxOptionProps<T>,
  "class" | "style"
> {
  /** Additional CSS class name. */
  class?: string;
  /** Optional description text. */
  description?: string;
  /**
   * Optional icon to display before the label.
   * Use a function returning JSX for SSR compatibility: `icon={() => <MyIcon />}`
   */
  icon?: () => JSX.Element;
}

export interface ListBoxSectionProps extends Omit<HeadlessListBoxSectionProps, "class" | "style"> {
  /** Additional CSS class name. */
  class?: string;
}

// All styling is emitted through the build-time S2 style() macro so the atomic
// CSS ships in the package bundle for installed consumers, rather than relying
// on Tailwind utility strings the package ships no CSS for. Interactive state
// (hover/focus/selected/disabled) is driven by the collection render props.

const fieldStyles = style({
  display: "flex",
  flexDirection: "column",
  gap: "[6px]",
});

const labelStyles = style<{ size: ListBoxSize }>({
  font: { size: { sm: "ui-sm", md: "ui", lg: "ui-lg" } },
  fontWeight: "medium",
  color: "neutral",
});

const fieldDescriptionStyles = style({
  font: "ui-sm",
  color: "neutral-subdued",
});

const listStyles = style<{ size: ListBoxSize; isDisabled?: boolean; isFocusVisible?: boolean }>({
  ...focusRing(),
  borderRadius: "panel",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
  backgroundColor: "layer-2",
  overflow: "auto",
  paddingY: { size: { sm: 4, md: "[6px]", lg: 8 } },
  opacity: { default: 1, isDisabled: 0.5 },
});

const emptyStateStyles = style({
  paddingX: 16,
  paddingY: 16,
  textAlign: "center",
  color: "neutral-subdued",
});

const optionStyles = style<ListBoxOptionRenderProps & { size: ListBoxSize }>({
  ...focusRing(),
  outlineOffset: -2,
  display: "flex",
  alignItems: "center",
  cursor: "default",
  transition: "default",
  font: { size: { sm: "ui-sm", md: "ui", lg: "ui-lg" } },
  paddingX: { size: { sm: 12, md: 16, lg: 20 } },
  paddingY: { size: { sm: "[6px]", md: 8, lg: "[10px]" } },
  gap: { size: { sm: 8, md: 12, lg: 12 } },
  // Later keys win when several conditions are active: selected beats hover,
  // disabled beats everything.
  backgroundColor: {
    default: "transparent",
    isHovered: "gray-100",
    isFocused: "gray-100",
    isSelected: "accent-subtle",
    isDisabled: "transparent",
  },
  color: {
    default: "neutral-subdued",
    isHovered: "neutral",
    isFocused: "neutral",
    isSelected: "[var(--text-link)]",
    isDisabled: "disabled",
  },
});

const optionIconStyles = style<{ size: ListBoxSize }>({
  flexShrink: 0,
  display: "inline-flex",
  width: { size: { sm: 16, md: 20, lg: 24 } },
  height: { size: { sm: 16, md: 20, lg: 24 } },
});

const checkmarkStyles = style<{ size: ListBoxSize }>({
  flexShrink: 0,
  color: "[var(--text-link)]",
  width: { size: { sm: 16, md: 20, lg: 24 } },
  height: { size: { sm: 16, md: 20, lg: 24 } },
});

const optionContentStyles = style({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  minWidth: 0,
});

const optionLabelStyles = style({
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const optionDescriptionStyles = style<{ size: ListBoxSize }>({
  font: { size: { sm: "ui-xs", md: "ui-sm", lg: "ui" } },
  color: "neutral-subdued",
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
});

const sectionStyles = style({
  paddingX: 4,
  paddingY: 4,
});

/**
 * A listbox displays a list of options and allows a user to select one or more of them.
 *
 */
export function ListBox<T>(props: ListBoxProps<T>): JSX.Element {
  const mergedProps = useProviderProps(props);
  const labelId = createUniqueId();
  const descriptionId = createUniqueId();
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "class",
    "label",
    "description",
    "renderEmptyState",
  ]);

  const size = local.size ?? "md";
  const customClass = local.class ?? "";

  const getClassName = (renderProps: ListBoxRenderProps): string =>
    [
      listStyles({
        size,
        isDisabled: renderProps.isDisabled,
        isFocusVisible: renderProps.isFocusVisible,
      }),
      customClass,
    ]
      .filter(Boolean)
      .join(" ");

  const defaultEmptyState = () => <li class={emptyStateStyles}>No items</li>;

  const mergedAriaLabel = (headlessProps as { "aria-label"?: string })["aria-label"];

  const labelledByIds =
    [
      (headlessProps as { "aria-labelledby"?: string })["aria-labelledby"],
      !mergedAriaLabel && local.label ? labelId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  const describedByIds =
    [
      (headlessProps as { "aria-describedby"?: string })["aria-describedby"],
      local.description ? descriptionId : undefined,
    ]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <ListBoxSizeContext.Provider value={size}>
      <div class={fieldStyles}>
        <Show when={local.label}>
          <span id={labelId} class={labelStyles({ size })}>
            {local.label}
          </span>
        </Show>
        <HeadlessListBox
          {...headlessProps}
          aria-label={mergedAriaLabel}
          aria-labelledby={labelledByIds}
          aria-describedby={describedByIds}
          class={getClassName}
          renderEmptyState={local.renderEmptyState ?? defaultEmptyState}
          children={props.children}
        />
        <Show when={local.description}>
          <span id={descriptionId} class={fieldDescriptionStyles}>
            {local.description}
          </span>
        </Show>
      </div>
    </ListBoxSizeContext.Provider>
  );
}

/**
 * An option in a listbox. Renders icon, checkmark, content, and description via
 * the collection render props so the selected-state styling stays in sync.
 */
export function ListBoxOption<T>(props: ListBoxOptionProps<T>): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class", "description", "icon"]);
  const size = useContext(ListBoxSizeContext);
  const customClass = local.class ?? "";

  const getClassName = (renderProps: ListBoxOptionRenderProps): string =>
    [optionStyles({ ...renderProps, size }), customClass].filter(Boolean).join(" ");

  return (
    <HeadlessListBoxOption {...headlessProps} class={getClassName}>
      {(renderProps) => (
        <>
          {local.icon && <span class={optionIconStyles({ size })}>{local.icon()}</span>}
          <Show when={renderProps.isSelected}>
            <CheckIcon class={checkmarkStyles({ size })} />
          </Show>
          <div class={optionContentStyles}>
            <span class={optionLabelStyles}>{props.children as JSX.Element}</span>
            {local.description && (
              <span class={optionDescriptionStyles({ size })}>{local.description}</span>
            )}
          </div>
        </>
      )}
    </HeadlessListBoxOption>
  );
}

export function ListBoxSection(props: ListBoxSectionProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class"]);

  return (
    <HeadlessListBoxSection
      {...headlessProps}
      class={[sectionStyles, local.class].filter(Boolean).join(" ")}
    >
      {props.children}
    </HeadlessListBoxSection>
  );
}

function CheckIcon(props: { class?: string }): JSX.Element {
  return (
    <svg class={props.class} fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

ListBox.Option = ListBoxOption;
ListBox.Section = ListBoxSection;

export const Item = ListBoxOption;
export const Section = ListBoxSection;
export const ListBoxBase = ListBox;

export type { Key };
