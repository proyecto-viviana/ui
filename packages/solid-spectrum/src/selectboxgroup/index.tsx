import {
  children as resolveChildren,
  createContext,
  createEffect,
  type JSX,
  Show,
  splitProps,
  useContext,
} from "solid-js";
import {
  ListBox as HeadlessListBox,
  ListBoxOption as HeadlessListBoxOption,
  type ListBoxOptionProps as HeadlessListBoxOptionProps,
  type ListBoxOptionRenderProps,
  type ListBoxProps as HeadlessListBoxProps,
  type ListBoxRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../s2-style";
import { baseColor, focusRing, style } from "../s2-style";
import { mergeStyles } from "../s2-style/runtime";
import { useProviderProps } from "../provider";
import Checkmark from "../icon/ui-icons/Checkmark";

export type SelectBoxOrientation = "horizontal" | "vertical";

export interface SelectBoxGroupProps<T> extends Omit<
  HeadlessListBoxProps<T>,
  "class" | "style" | "children" | "layout" | "orientation"
> {
  /** The SelectBox elements contained within the SelectBoxGroup. */
  children: (item: T) => JSX.Element;
  /** The layout direction of the content in each SelectBox. @default 'vertical' */
  orientation?: SelectBoxOrientation;
  /** Whether the SelectBoxGroup is disabled. */
  isDisabled?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
}

export interface SelectBoxProps extends Omit<
  HeadlessListBoxOptionProps<unknown>,
  "class" | "style" | "children"
> {
  /** The unique id of the SelectBox. */
  id: Key;
  /** The contents of the SelectBox. */
  children?: JSX.Element;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
}

interface SelectBoxContextValue {
  orientation?: SelectBoxOrientation;
  selectionMode?: "single" | "multiple";
  isDisabled?: boolean;
}

const SelectBoxContext = createContext<SelectBoxContextValue>({ orientation: "vertical" });
const selectBoxGroupStyles = style<{ orientation?: SelectBoxOrientation }>({
  display: "grid",
  gridAutoRows: "1fr",
  margin: 0,
  padding: 0,
  listStyleType: "none",
  gap: 24,
  justifyContent: "center",
  gridTemplateColumns: {
    orientation: {
      vertical: "[repeat(auto-fit,minmax(144px,min(170px,100%)))]",
      horizontal: "[repeat(auto-fit,minmax(188px,min(368px,100%)))]",
    },
  },
});

const selectBoxStyles = style<ListBoxOptionRenderProps & { orientation?: SelectBoxOrientation }>({
  ...focusRing(),
  display: "grid",
  gridAutoRows: "1fr",
  position: "relative",
  font: "ui",
  boxSizing: "border-box",
  overflow: "hidden",
  width: {
    default: 170,
    orientation: {
      horizontal: 368,
    },
  },
  height: {
    default: 170,
    orientation: {
      horizontal: "auto",
    },
  },
  minWidth: {
    default: 144,
    orientation: {
      horizontal: 188,
    },
  },
  "--select-box-max-width": {
    type: "width",
    value: {
      default: 170,
      orientation: {
        horizontal: 480,
      },
    },
  },
  maxWidth: "[min(100%,var(--select-box-max-width))]",
  minHeight: {
    default: 144,
    orientation: {
      horizontal: 80,
    },
  },
  maxHeight: {
    default: 170,
    orientation: {
      horizontal: 240,
    },
  },
  padding: {
    default: 24,
    orientation: {
      horizontal: 16,
    },
  },
  paddingStart: {
    orientation: {
      horizontal: 32,
    },
  },
  paddingEnd: {
    orientation: {
      horizontal: 24,
    },
  },
  gridTemplateAreas: {
    orientation: {
      vertical: ["illustration", ".", "label"],
    },
  },
  gridTemplateRows: {
    orientation: {
      vertical: ["min-content", 8, "min-content"],
    },
  },
  gridTemplateColumns: {
    orientation: {
      horizontal: "[min-content 10px 1fr]",
    },
  },
  alignContent: {
    orientation: {
      vertical: "center",
    },
  },
  borderRadius: "lg",
  borderStyle: "solid",
  borderWidth: 2,
  borderColor: {
    default: "transparent",
    isSelected: "[light-dark(rgb(19, 19, 19), rgb(242, 242, 242))]",
    isDisabled: "transparent",
  },
  backgroundColor: {
    default: "layer-2",
    isDisabled: "disabled",
  },
  color: {
    isDisabled: "disabled",
  },
  boxShadow: {
    default: "emphasized",
    isHovered: "elevated",
    isSelected: "elevated",
    isDisabled: "none",
  },
  cursor: {
    default: "default",
    isDisabled: "not-allowed",
  },
  transition: "default",
});

const selectBoxSelectionIndicator = style({
  position: "absolute",
  top: 8,
  insetStart: 8,
  pointerEvents: "none",
});

const selectBoxCheckboxBox = style<ListBoxOptionRenderProps>({
  ...focusRing(),
  size: 16,
  flexShrink: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 2,
  boxSizing: "border-box",
  borderStyle: "solid",
  borderRadius: "sm",
  transition: "default",
  forcedColorAdjust: "none",
  backgroundColor: {
    default: "[light-dark(rgb(255, 255, 255), rgb(17, 17, 17))]",
    isSelected: "neutral",
    isDisabled: "disabled",
  },
  borderColor: {
    default: "[light-dark(rgb(41, 41, 41), rgb(219, 219, 219))]",
    isDisabled: "disabled",
    isSelected: "transparent",
  },
});

const selectBoxCheckboxIcon = style({
  pointerEvents: "none",
});

const selectBoxIllustration = style<
  ListBoxOptionRenderProps & { orientation?: SelectBoxOrientation }
>({
  gridArea: "illustration",
  alignSelf: "center",
  justifySelf: "center",
  minSize: 48,
  "--iconPrimary": {
    type: "color",
    value: {
      default: baseColor("neutral"),
      isDisabled: "disabled",
    },
  },
});

const selectBoxDescription = style<
  ListBoxOptionRenderProps & { orientation?: SelectBoxOrientation }
>({
  gridArea: "description",
  alignSelf: "center",
  display: {
    default: "block",
    orientation: {
      vertical: "none",
    },
  },
  overflow: "hidden",
  textAlign: {
    default: "center",
    orientation: {
      horizontal: "start",
    },
  },
  color: {
    default: baseColor("neutral"),
    isDisabled: "disabled",
  },
});

const selectBoxLabel = style<ListBoxOptionRenderProps & { orientation?: SelectBoxOrientation }>({
  gridArea: "label",
  alignSelf: "center",
  justifySelf: {
    default: "center",
    orientation: {
      horizontal: "start",
    },
  },
  width: "full",
  overflow: "hidden",
  minWidth: 0,
  textAlign: {
    default: "center",
    orientation: {
      horizontal: "start",
    },
  },
  whiteSpace: "nowrap",
  textOverflow: "ellipsis",
  fontWeight: {
    orientation: {
      horizontal: "bold",
    },
  },
  color: {
    default: baseColor("neutral"),
    isDisabled: "disabled",
  },
});

/**
 * SelectBoxGroup allows users to select one or more options from a list.
 */
export function SelectBoxGroup<T>(props: SelectBoxGroupProps<T>): JSX.Element {
  const mergedProps = useProviderProps(props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "children",
    "orientation",
    "isDisabled",
    "selectionMode",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
  ]);
  const orientation = (): SelectBoxOrientation => local.orientation ?? "vertical";
  const selectionMode = (): "single" | "multiple" =>
    local.selectionMode === "multiple" ? "multiple" : "single";
  const contextValue = {
    get orientation() {
      return orientation();
    },
    get selectionMode() {
      return selectionMode();
    },
    get isDisabled() {
      return local.isDisabled;
    },
  };
  const className = (_renderProps: ListBoxRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      mergeStyles(selectBoxGroupStyles({ orientation: orientation() }), local.styles),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <SelectBoxContext.Provider value={contextValue}>
      <HeadlessListBox
        {...headlessProps}
        isDisabled={local.isDisabled}
        selectionMode={selectionMode()}
        layout="grid"
        orientation={orientation()}
        class={className}
        style={local.UNSAFE_style}
        data-orientation={orientation()}
        data-disabled={local.isDisabled ? "true" : undefined}
      >
        {(item: T) => local.children(item)}
      </HeadlessListBox>
    </SelectBoxContext.Provider>
  );
}

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(el);
  } else {
    ref.current = el;
  }
}

function replaceManagedClass(element: Element, dataAttribute: string, nextClass: string): void {
  const previousClass = element.getAttribute(dataAttribute);
  for (const className of previousClass?.split(/\s+/).filter(Boolean) ?? []) {
    element.classList.remove(className);
  }

  for (const className of nextClass.split(/\s+/).filter(Boolean)) {
    element.classList.add(className);
  }

  element.setAttribute(dataAttribute, nextClass);
}

function applySlotClasses(
  root: HTMLElement | undefined,
  renderProps: ListBoxOptionRenderProps,
  orientation: SelectBoxOrientation,
  isDisabled: boolean,
): void {
  if (!root) {
    return;
  }

  const slotState = {
    ...renderProps,
    isDisabled: renderProps.isDisabled || isDisabled,
    orientation,
  };

  for (const element of Array.from(
    root.querySelectorAll(
      '[slot="illustration"], [data-slot="illustration"], [data-rsp-slot="illustration"]',
    ),
  )) {
    replaceManagedClass(element, "data-s2-select-box-slot-class", selectBoxIllustration(slotState));
    element.setAttribute("data-rsp-slot", "illustration");
  }

  for (const element of Array.from(
    root.querySelectorAll('[slot="label"], [data-slot="label"], [data-rsp-slot="label"]'),
  )) {
    replaceManagedClass(element, "data-s2-select-box-slot-class", selectBoxLabel(slotState));
    element.setAttribute("data-rsp-slot", "label");
  }

  for (const element of Array.from(
    root.querySelectorAll(
      '[slot="description"], [data-slot="description"], [data-rsp-slot="description"]',
    ),
  )) {
    replaceManagedClass(element, "data-s2-select-box-slot-class", selectBoxDescription(slotState));
    element.setAttribute("data-rsp-slot", "description");
  }

  if (orientation === "horizontal") {
    const hasIllustration = !!root.querySelector(
      '[slot="illustration"], [data-slot="illustration"], [data-rsp-slot="illustration"]',
    );
    const hasDescription = !!root.querySelector(
      '[slot="description"], [data-slot="description"], [data-rsp-slot="description"]',
    );

    root.style.gridTemplateAreas = hasDescription
      ? '"illustration . label" "illustration . description"'
      : '"illustration . label"';
    root.style.gridTemplateRows = hasIllustration ? "18px 30px" : "min-content";
  } else {
    root.style.gridTemplateAreas = '"illustration" "." "label"';
    root.style.gridTemplateRows = "48px 8px 18px";
    root.style.gridTemplateColumns = "1fr";
    return;
  }

  root.style.removeProperty("grid-template-columns");
}

/**
 * SelectBox is a single selectable item in a SelectBoxGroup.
 */
export function SelectBox(props: SelectBoxProps): JSX.Element {
  const context = useContext(SelectBoxContext);
  const [local, headlessProps] = splitProps(props, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "ref",
  ]);
  const orientation = (): SelectBoxOrientation => context.orientation ?? "vertical";
  const selectionMode = () => context.selectionMode ?? "single";
  const isDisabled = () => !!headlessProps.isDisabled || !!context.isDisabled;
  let optionElement: HTMLLIElement | undefined;
  const getClassName = (renderProps: ListBoxOptionRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      mergeStyles(
        selectBoxStyles({
          ...renderProps,
          isDisabled: renderProps.isDisabled || isDisabled(),
          orientation: orientation(),
        }),
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");
  const getStyle = (_renderProps: ListBoxOptionRenderProps): JSX.CSSProperties => ({
    ...(local.UNSAFE_style ?? {}),
  });

  function SelectBoxContent(renderProps: ListBoxOptionRenderProps) {
    const resolvedChildren = resolveChildren(() => local.children);
    createEffect(() => applySlotClasses(optionElement, renderProps, orientation(), isDisabled()));

    return (
      <>
        <div class={selectBoxSelectionIndicator} aria-hidden="true">
          <Show when={!renderProps.isDisabled && selectionMode() === "multiple"}>
            <div class={selectBoxCheckboxBox(renderProps)} data-rsp-slot="selection-indicator">
              <Checkmark
                size="S"
                class={selectBoxCheckboxIcon}
                style={{
                  "--iconPrimary": "var(--s2-container-bg, white)",
                  width: "10px",
                  height: "10px",
                }}
              />
            </div>
          </Show>
        </div>
        {resolvedChildren()}
      </>
    );
  }

  return (
    <HeadlessListBoxOption
      {...headlessProps}
      isDisabled={isDisabled()}
      ref={(element) => {
        optionElement = element;
        assignRef(local.ref, element);
      }}
      class={getClassName}
      style={getStyle}
      data-select-box=""
    >
      {(renderProps) => <SelectBoxContent {...renderProps} />}
    </HeadlessListBoxOption>
  );
}
