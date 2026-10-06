/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@react-spectrum/s2/src/SelectBoxGroup.tsx

// Port of packages/@react-spectrum/s2/src/SelectBoxGroup.tsx.
import {
  children as resolveChildren,
  createContext,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  Show,
  useContext,
} from "solid-js";
import { isServer, type JSX } from "@solidjs/web";
import { mergeProps } from "@proyecto-viviana/solidaria/utils";
import {
  ListBox as HeadlessListBox,
  ListBoxOption as HeadlessListBoxOption,
  SlotProvider,
  type ListBoxOptionProps as HeadlessListBoxOptionProps,
  type ListBoxOptionRenderProps,
  type ListBoxProps as HeadlessListBoxProps,
  type ListBoxRenderProps,
  evaluateRenderChildren,
} from "@proyecto-viviana/solidaria-components";
import type { Key } from "@proyecto-viviana/solid-stately";
import type { StyleString } from "../style";
import { baseColor, css, focusRing, style } from "../style" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
import { useProviderProps, type ProviderInheritedProps } from "../provider";
import Checkmark from "../icon/ui-icons/Checkmark";
import { pressScale } from "../pressScale";
import { splitProps } from "@proyecto-viviana/solidaria/utils";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type SelectBoxOrientation = "horizontal" | "vertical";

export interface SelectBoxGroupProps<T> extends Omit<
  HeadlessListBoxProps<T>,
  "class" | "style" | "children" | "layout" | "orientation" | "slot" | "ref"
> {
  /** The SelectBox elements contained within the SelectBoxGroup. */
  children: JSX.Element | ((item: T) => JSX.Element);
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
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
  /** Ref for the underlying listbox element. */
  ref?: RefLike<HTMLDivElement>;
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

interface StaticSelectBoxItem {
  id: Key;
  textValue?: string;
  isDisabled?: boolean;
  props: SelectBoxProps;
}

interface StaticSelectBoxCollectionContextValue {
  registerItem(item: StaticSelectBoxItem): void;
  unregisterItem(id: Key): void;
}

const SelectBoxContext = createContext<SelectBoxContextValue>({ orientation: "vertical" });
const StaticSelectBoxCollectionContext =
  createContext<StaticSelectBoxCollectionContextValue | null>(null);
export const SelectBoxGroupContext =
  createContext<SpectrumContextValue<SelectBoxGroupProps<unknown>>>(null);
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

const hasSelectBoxDescription =
  ":has([slot=description], [data-slot=description], [data-rsp-slot=description])";
const hasSelectBoxIllustration =
  ":has([slot=illustration], [data-slot=illustration], [data-rsp-slot=illustration])";

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
      horizontal: {
        default: ["illustration . label"],
        [hasSelectBoxDescription]: ["illustration . label", "illustration . description"],
      },
    },
  },
  gridTemplateRows: {
    orientation: {
      vertical: "[48px 8px 18px]",
      horizontal: {
        default: "min-content",
        [hasSelectBoxIllustration]: "[18px 30px]",
      },
    },
  },
  gridTemplateColumns: {
    orientation: {
      vertical: "[1fr]",
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

const selectBoxSlotLayout = css(`
  [slot="illustration"], [data-slot="illustration"], [data-rsp-slot="illustration"] {
    grid-area: illustration;
  }
  [slot="label"], [data-slot="label"], [data-rsp-slot="label"] {
    grid-area: label;
  }
  [slot="description"], [data-slot="description"], [data-rsp-slot="description"] {
    grid-area: description;
  }
`);

/**
 * SelectBoxGroup allows users to select one or more options from a list.
 */
export function SelectBoxGroup<T>(props: SelectBoxGroupProps<T>): JSX.Element {
  const providerProps = useProviderProps(props) as SelectBoxGroupProps<T> & ProviderInheritedProps;
  const [flags] = splitProps(providerProps, [
    "isQuiet",
    "isEmphasized",
    "isDisabled",
    "isRequired",
    "isReadOnly",
    "validationState",
  ]);
  const contextProps = getSlottedContextProps(
    useContext(SelectBoxGroupContext) as SpectrumContextValue<SelectBoxGroupProps<T>>,
    props.slot,
  );
  const mergedProps = mergeProps<SelectBoxGroupProps<T>>(flags, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "children",
    "orientation",
    "isDisabled",
    "selectionMode",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "slot",
    "ref",
  ]);
  const orientation = (): SelectBoxOrientation => local.orientation ?? "vertical";
  const selectionMode = (): "single" | "multiple" =>
    local.selectionMode === "multiple" ? "multiple" : "single";
  let staticItems: StaticSelectBoxItem[] = [];
  const [registrationVersion, setRegistrationVersion] = createSignal(0, {
    ownedWrite: true,
  });
  const staticItemMap = new Map<Key, StaticSelectBoxItem>();
  const usesStaticChildren = () => headlessProps.items == null;
  const syncStaticItems = () => {
    staticItems = Array.from(staticItemMap.values());
    if (!isServer) {
      setRegistrationVersion((version) => version + 1);
    }
  };
  const staticCollectionContext: StaticSelectBoxCollectionContextValue = {
    registerItem(item) {
      const previous = staticItemMap.get(item.id);
      if (
        previous &&
        previous.textValue === item.textValue &&
        previous.isDisabled === item.isDisabled &&
        previous.props === item.props
      ) {
        return;
      }

      staticItemMap.set(item.id, item);
      syncStaticItems();
    },
    unregisterItem(id) {
      if (staticItemMap.delete(id)) {
        syncStaticItems();
      }
    },
  };
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
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignGroupRefs = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );
  const className = (_renderProps: ListBoxRenderProps): string =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      mergeStyles(selectBoxGroupStyles({ orientation: orientation() }), mergedStyles()),
    ]
      .filter(Boolean)
      .join(" ");
  const collectionItems = () => {
    if (!usesStaticChildren()) return headlessProps.items ?? [];
    registrationVersion();
    return staticItems as unknown as T[];
  };
  const getKey = () =>
    usesStaticChildren() ? (item: T) => (item as StaticSelectBoxItem).id : headlessProps.getKey;
  const getTextValue = () =>
    usesStaticChildren()
      ? (item: T) =>
          (item as StaticSelectBoxItem).textValue ?? String((item as StaticSelectBoxItem).id)
      : headlessProps.getTextValue;
  const getDisabled = () =>
    usesStaticChildren()
      ? (item: T) => Boolean((item as StaticSelectBoxItem).isDisabled)
      : headlessProps.getDisabled;
  const renderItem = (item: T) =>
    usesStaticChildren() ? (
      <SelectBox {...(item as StaticSelectBoxItem).props} />
    ) : typeof local.children === "function" ? (
      local.children(item)
    ) : null;
  let registrationOutput: JSX.Element = null;
  if (usesStaticChildren()) {
    registrationOutput = (
      <StaticSelectBoxCollectionContext value={staticCollectionContext}>
        {resolveChildren(() => local.children as JSX.Element)()}
      </StaticSelectBoxCollectionContext>
    );
    if (typeof registrationOutput === "function") {
      registrationOutput = (registrationOutput as () => JSX.Element)();
    }
  }

  return (
    <SelectBoxContext value={contextValue}>
      {registrationOutput}
      <HeadlessListBox
        {...headlessProps}
        ref={(element) => assignGroupRefs(element)}
        items={collectionItems() ?? []}
        getKey={getKey()}
        getTextValue={getTextValue()}
        getDisabled={getDisabled()}
        selectionMode={selectionMode()}
        layout="grid"
        orientation={orientation()}
        slot={local.slot ?? undefined}
        class={className}
        style={mergedUnsafeStyle()}
        data-orientation={orientation()}
      >
        {(item: T) => renderItem(item)}
      </HeadlessListBox>
    </SelectBoxContext>
  );
}

/**
 * SelectBox is a single selectable item in a SelectBoxGroup.
 */
export function SelectBox(props: SelectBoxProps): JSX.Element {
  const context = useContext(SelectBoxContext);
  const staticCollection = useContext(StaticSelectBoxCollectionContext);
  const [local, headlessProps] = splitProps(props, [
    "children",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "ref",
  ]);
  if (staticCollection) {
    staticCollection.registerItem({
      id: props.id,
      textValue: headlessProps.textValue ?? headlessProps["aria-label"],
      isDisabled: !!headlessProps.isDisabled,
      props,
    });

    onCleanup(() => {
      staticCollection.unregisterItem(props.id);
    });

    return null;
  }

  const orientation = (): SelectBoxOrientation => context.orientation ?? "vertical";
  const selectionMode = () => context.selectionMode ?? "single";
  const isDisabled = () => !!headlessProps.isDisabled || !!context.isDisabled;
  let optionElement: HTMLDivElement | undefined;
  const assignOptionRef = mergeContextRefs(local.ref);
  const getClassName = (renderProps: ListBoxOptionRenderProps): string =>
    [
      local.UNSAFE_className,
      local.class,
      selectBoxSlotLayout,
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
  const getStyle = (renderProps: ListBoxOptionRenderProps): JSX.CSSProperties =>
    pressScale(() => optionElement, local.UNSAFE_style)(renderProps);

  function SelectBoxContent(renderProps: ListBoxOptionRenderProps) {
    const slots = () => {
      const slotState = {
        ...renderProps,
        isDisabled: renderProps.isDisabled || isDisabled(),
        orientation: orientation(),
      };
      return {
        default: { class: selectBoxLabel(slotState), "data-rsp-slot": "label" },
        label: { class: selectBoxLabel(slotState), "data-rsp-slot": "label" },
        description: { class: selectBoxDescription(slotState), "data-rsp-slot": "description" },
        illustration: { class: selectBoxIllustration(slotState), "data-rsp-slot": "illustration" },
      };
    };

    const renderChildren = () => evaluateRenderChildren(local.children, renderProps);

    return (
      <>
        <div class={selectBoxSelectionIndicator} aria-hidden="true">
          {!renderProps.isDisabled && selectionMode() === "multiple" ? (
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
          ) : null}
        </div>
        <SlotProvider slots={slots}>{renderChildren()}</SlotProvider>
      </>
    );
  }

  return (
    <HeadlessListBoxOption
      {...headlessProps}
      isDisabled={isDisabled()}
      ref={(element) => {
        optionElement = element;
        assignOptionRef(element);
      }}
      class={getClassName}
      style={getStyle}
      data-select-box=""
    >
      {(renderProps) => <SelectBoxContent {...renderProps} />}
    </HeadlessListBoxOption>
  );
}
