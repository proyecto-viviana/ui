/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/Select.tsx

/**
 * Select component for solidaria-components
 *
 * A pre-wired headless select that combines state + aria hooks.
 * Port of react-aria-components/src/Select.tsx
 */

import {
  type JSX,
  type Accessor,
  createContext,
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  splitProps,
  useContext,
  For,
  Show,
  untrack,
  type Context,
} from "solid-js";
import {
  createSelect,
  createHiddenSelect,
  createListBox,
  createOption,
  createHover,
  createInteractOutside,
  createFocusRing,
  FocusScope,
  focusSafely,
  mergeProps,
  type AriaSelectProps,
  type AriaListBoxProps,
  type AriaOptionProps,
  createStringFormatter,
  createListFormatter,
} from "@proyecto-viviana/solidaria";
import {
  createSelectState,
  type ListState,
  type SelectState,
  type Key,
  type CollectionNode,
  DEFAULT_VALIDATION_RESULT,
  type ValidationResult,
} from "@proyecto-viviana/solid-stately";
import { FieldErrorContext, type FieldErrorContextValue } from "./FieldError";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  DEFAULT_SLOT,
  OptionContent,
  Provider,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import {
  SelectionIndicatorContext,
  type SelectionIndicatorContextValue,
} from "./SelectionIndicator";
import { ListBoxLoadMoreItem } from "./ListBox";
import { TextContext } from "./Text";
import { useCollectionRenderer } from "./Collection";
import { racIntlStrings } from "./intl";

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(el);
  } else {
    ref.current = el;
  }
}

function getNativeSelectValidation(select: HTMLSelectElement | HTMLInputElement): ValidationResult {
  return {
    isInvalid: !select.validity.valid,
    validationDetails: {
      badInput: select.validity.badInput,
      customError: select.validity.customError,
      patternMismatch: select.validity.patternMismatch,
      rangeOverflow: select.validity.rangeOverflow,
      rangeUnderflow: select.validity.rangeUnderflow,
      stepMismatch: select.validity.stepMismatch,
      tooLong: select.validity.tooLong,
      tooShort: select.validity.tooShort,
      typeMismatch: select.validity.typeMismatch,
      valueMissing: select.validity.valueMissing,
      valid: select.validity.valid,
    },
    validationErrors: select.validationMessage ? [select.validationMessage] : [],
  };
}

export interface SelectRenderProps {
  /** Whether the select is open. */
  isOpen: boolean;
  /** Whether the select is focused. */
  isFocused: boolean;
  /** Whether the select has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the select is disabled. */
  isDisabled: boolean;
  /** Whether the select is required. */
  isRequired: boolean;
  /** Whether a value is selected. */
  isSelected: boolean;
}

export interface SelectProps<T> extends Omit<AriaSelectProps, "children">, SlotProps {
  /** The items to render in the select. */
  items: T[];
  /** Function to get the key from an item. */
  getKey?: (item: T) => Key;
  /** Function to get the text value from an item. */
  getTextValue?: (item: T) => string;
  /** Function to check if an item is disabled. */
  getDisabled?: (item: T) => boolean;
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** Selection mode. */
  selectionMode?: "single" | "multiple";
  /** The currently selected key (controlled). */
  selectedKey?: Key | null;
  /** The default selected key (uncontrolled). */
  defaultSelectedKey?: Key | null;
  /** Currently selected keys (controlled, for multiple selection). */
  selectedKeys?: "all" | Iterable<Key>;
  /** Default selected keys (uncontrolled, for multiple selection). */
  defaultSelectedKeys?: "all" | Iterable<Key>;
  /** Handler called when selection changes. */
  onSelectionChange?: (key: Key | null) => void;
  /** Handler called when selected keys change. */
  onSelectionChangeKeys?: (keys: "all" | Set<Key>) => void;
  /** Whether the select is open (controlled). */
  isOpen?: boolean;
  /** Whether the select is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler called when the open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Placeholder text when no option is selected. */
  placeholder?: string;
  /** The name of the select, used when submitting an HTML form. */
  name?: string;
  /** The children of the component (compound components: SelectTrigger, SelectListBox). */
  children: RenderChildren<SelectRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SelectRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SelectRenderProps>;
  /** Custom renderer for the outer select element. */
  render?: (
    props: JSX.HTMLAttributes<HTMLDivElement>,
    renderProps: SelectRenderProps,
  ) => JSX.Element;
  /** Ref for the outer select element. */
  ref?: RefLike<HTMLDivElement>;
}

export interface SelectValueRenderProps<T> {
  /** The selected item. */
  selectedItem: CollectionNode<T> | null;
  /** The selected items. */
  selectedItems: CollectionNode<T>[];
  /** The text value of the selected item. */
  selectedText: string | null;
  /** Whether a value is selected. */
  isSelected: boolean;
  /** The placeholder text. */
  placeholder: string | undefined;
}

export interface SelectValueProps<T> extends SlotProps {
  /** The children of the value. A function may be provided to receive render props. */
  children?: RenderChildren<SelectValueRenderProps<T>>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SelectValueRenderProps<T>>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SelectValueRenderProps<T>>;
  /** Placeholder text when no option is selected. Overrides the placeholder from Select. */
  placeholder?: string;
}

export interface SelectTriggerRenderProps {
  /** Whether the select is open. */
  isOpen: boolean;
  /** Whether the trigger is focused. */
  isFocused: boolean;
  /** Whether the trigger has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the trigger is hovered. */
  isHovered: boolean;
  /** Whether the trigger is pressed. */
  isPressed: boolean;
  /** Whether the trigger is disabled. */
  isDisabled: boolean;
}

export interface SelectTriggerProps extends SlotProps {
  /** A ref callback/object for the underlying trigger button element. */
  ref?: RefLike<HTMLButtonElement>;
  /** The children of the trigger. A function may be provided to receive render props. */
  children?: RenderChildren<SelectTriggerRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SelectTriggerRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SelectTriggerRenderProps>;
}

export interface SelectListBoxRenderProps {
  /** Whether the listbox is focused. */
  isFocused: boolean;
}

export interface SelectListBoxProps<T> extends SlotProps {
  /** The children of the listbox. A function may be provided to render each item. */
  children?: (item: T) => JSX.Element;
  /** Content to display when the listbox has no items. */
  renderEmptyState?: () => JSX.Element;
  /** Called when the load more sentinel becomes visible. */
  onLoadMore?: () => void | Promise<void>;
  /** Whether additional items are currently loading. */
  isLoading?: boolean;
  /** Content to display in the load more sentinel row. */
  renderLoadMore?: () => JSX.Element | undefined;
  /** CSS class for the load more sentinel row. */
  loadMoreClass?: ClassNameOrFunction<{ isLoading: boolean }>;
  /** Whether the listbox is rendered inside an overlay popover. */
  isInPopover?: boolean;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SelectListBoxRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SelectListBoxRenderProps>;
}

export interface SelectOptionRenderProps {
  /** Whether the option is selected. */
  isSelected: boolean;
  /** Whether the option is focused. */
  isFocused: boolean;
  /** Whether the option has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the option is pressed. */
  isPressed: boolean;
  /** Whether the option is hovered. */
  isHovered: boolean;
  /** Whether the option is disabled. */
  isDisabled: boolean;
}

export interface SelectOptionProps<T> extends Omit<AriaOptionProps, "children" | "key">, SlotProps {
  /** A ref callback/object for the underlying option element. */
  ref?: RefLike<HTMLDivElement>;
  /** The unique key for the option. */
  id: Key;
  /** The item value. */
  item?: T;
  /** The children of the option. A function may be provided to receive render props. */
  children?: RenderChildren<SelectOptionRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SelectOptionRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SelectOptionRenderProps>;
  /** The text value of the option (for typeahead). */
  textValue?: string;
}

interface SelectContextValue<T> {
  state: SelectState<T>;
  rootRef: Accessor<HTMLElement | null>;
  triggerRef: Accessor<HTMLElement | null>;
  setTriggerRef: (el: HTMLElement | null) => void;
  triggerProps: JSX.HTMLAttributes<HTMLElement>;
  valueProps: JSX.HTMLAttributes<HTMLElement>;
  labelProps: JSX.HTMLAttributes<HTMLElement>;
  menuProps: JSX.HTMLAttributes<HTMLElement>;
  errorMessageProps?: JSX.HTMLAttributes<HTMLElement>;
  validation?: ValidationResult;
  isOpen: Accessor<boolean>;
  isFocused: Accessor<boolean>;
  isFocusVisible: Accessor<boolean>;
  isPressed: Accessor<boolean>;
  isDisabled: Accessor<boolean>;
  placeholder?: string;
  items: T[];
  renderItem?: (item: T) => JSX.Element;
  slots?: Record<string, Partial<SelectProps<T>>>;
  autoFocus?: boolean;
}

export const SelectContext = createContext<SelectContextValue<unknown> | null>(null);
export const SelectStateContext = createContext<SelectState<unknown> | null>(null);
export const SelectValueContext = SelectContext;

const selectRootLabelProps = new Set([
  "aria-label",
  "aria-labelledby",
  "aria-describedby",
  "aria-details",
]);

/**
 * A select displays a collapsible list of options and allows a user to select one of them.
 */
export function Select<T>(props: SelectProps<T>): JSX.Element {
  const parentContext = useContext(SelectContext) as SelectContextValue<T> | null;
  const contextSlotProps = parentContext?.slots?.[props.slot ?? "default"] as
    | Partial<SelectProps<T>>
    | undefined;
  const mergedSelectProps = (
    contextSlotProps ? mergeProps(contextSlotProps, props) : props
  ) as SelectProps<T>;
  const [local, stateProps, ariaProps] = splitProps(
    mergedSelectProps,
    ["class", "style", "render", "ref", "slot", "children"],
    [
      "items",
      "getKey",
      "getTextValue",
      "getDisabled",
      "disabledKeys",
      "selectionMode",
      "selectedKey",
      "defaultSelectedKey",
      "selectedKeys",
      "defaultSelectedKeys",
      "onSelectionChange",
      "onSelectionChangeKeys",
      "isOpen",
      "defaultOpen",
      "onOpenChange",
      "name",
    ],
  );
  let rootRef: HTMLDivElement | undefined;
  const [selectValidation, setSelectValidation] =
    createSignal<ValidationResult>(DEFAULT_VALIDATION_RESULT);

  const resolveDisabled = (): boolean => {
    const disabled = ariaProps.isDisabled;
    if (typeof disabled === "function") {
      return (disabled as () => boolean)();
    }
    return !!disabled;
  };

  const state = createSelectState<T>({
    get items() {
      return stateProps.items;
    },
    get getKey() {
      return stateProps.getKey;
    },
    get getTextValue() {
      return stateProps.getTextValue;
    },
    get getDisabled() {
      return stateProps.getDisabled;
    },
    get disabledKeys() {
      return stateProps.disabledKeys;
    },
    get selectionMode() {
      return stateProps.selectionMode;
    },
    get selectedKey() {
      return stateProps.selectedKey;
    },
    get defaultSelectedKey() {
      return stateProps.defaultSelectedKey;
    },
    get selectedKeys() {
      return stateProps.selectedKeys;
    },
    get defaultSelectedKeys() {
      return stateProps.defaultSelectedKeys;
    },
    get onSelectionChange() {
      return stateProps.onSelectionChange;
    },
    get onSelectionChangeKeys() {
      return stateProps.onSelectionChangeKeys;
    },
    get isOpen() {
      return stateProps.isOpen;
    },
    get defaultOpen() {
      return stateProps.defaultOpen;
    },
    get onOpenChange() {
      return stateProps.onOpenChange;
    },
    get isDisabled() {
      return resolveDisabled();
    },
    get isRequired() {
      return ariaProps.isRequired;
    },
  });

  const selectAriaProps = createMemo(() => {
    const clean: Record<string, unknown> = {};
    for (const key in ariaProps as Record<string, unknown>) {
      if (!key.startsWith("data-")) {
        clean[key] = (ariaProps as Record<string, unknown>)[key];
      }
    }
    return clean as typeof ariaProps;
  });

  const validation = createMemo<ValidationResult>(() => {
    const current = selectValidation();
    if (current.isInvalid || !ariaProps.isInvalid) {
      return current;
    }

    return {
      ...DEFAULT_VALIDATION_RESULT,
      isInvalid: true,
    };
  });
  const isInvalid = createMemo(() => validation().isInvalid);

  // Keep the hook result intact. Its DOM prop surfaces are getters; destructuring
  // them freezes the initial closed-state attributes and event composition.
  // RAC `useSelect` feeds `state.displayValidation.isInvalid` into `useField`;
  // pass the composed invalid flag so `createSlotId` re-probes when native
  // validation mounts the error slot.
  const selectHook = createSelect<T>(
    () => ({
      ...selectAriaProps(),
      isInvalid: isInvalid(),
    }),
    state,
  );
  const { isFocused, isFocusVisible, isOpen, isPressed } = selectHook;

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return resolveDisabled();
    },
  });

  const renderValues = createMemo<SelectRenderProps>(() => ({
    isOpen: isOpen(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: resolveDisabled(),
    isRequired: !!ariaProps.isRequired,
    isSelected:
      state.selectionMode() === "multiple"
        ? state.selectedKeys() === "all" || (state.selectedKeys() as Set<Key>).size > 0
        : state.selectedKey() != null,
  }));
  const childRenderValues: SelectRenderProps = {
    get isOpen() {
      return isOpen();
    },
    get isFocused() {
      return isFocused();
    },
    get isFocusVisible() {
      return isFocusVisible();
    },
    get isDisabled() {
      return resolveDisabled();
    },
    get isRequired() {
      return !!ariaProps.isRequired;
    },
    get isSelected() {
      return hasSelection();
    },
  };

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Select",
    },
    renderValues,
  );

  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps as Record<string, unknown>, { global: true });
    for (const key of selectRootLabelProps) {
      delete filtered[key];
    }
    return filtered;
  });

  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const cleanLabelProps = () => {
    const { ref: _ref, ...rest } = selectHook.labelProps as Record<string, unknown>;
    return rest;
  };
  const setRootRef = (el: HTMLDivElement) => {
    rootRef = el;
    assignRef(local.ref, el);
  };
  const triggerPropsWithValidation = () =>
    selectHook.triggerProps as JSX.HTMLAttributes<HTMLElement>;
  const fieldErrorContext: FieldErrorContextValue = {
    get validation() {
      return validation();
    },
    get errorMessageProps() {
      return selectHook.errorMessageProps;
    },
  };
  const focusTrigger = () => {
    triggerRef?.focus();
  };
  const hasSelection = () =>
    state.selectionMode() === "multiple"
      ? state.selectedKeys() === "all" || (state.selectedKeys() as Set<Key>).size > 0
      : state.selectedKey() != null;
  const hasNativeValidation = () => (ariaProps.validationBehavior ?? "native") === "native";
  const getSelectValidation = (select: HTMLSelectElement | HTMLInputElement): ValidationResult => {
    if (ariaProps.isRequired && !hasSelection()) {
      return {
        isInvalid: true,
        validationDetails: {
          badInput: false,
          customError: false,
          patternMismatch: false,
          rangeOverflow: false,
          rangeUnderflow: false,
          stepMismatch: false,
          tooLong: false,
          tooShort: false,
          typeMismatch: false,
          valueMissing: true,
          valid: false,
        },
        validationErrors: [select.validationMessage || "Constraints not satisfied"],
      };
    }
    return getNativeSelectValidation(select);
  };

  const {
    containerProps,
    selectProps: hiddenSelectProps,
    inputProps: hiddenInputProps,
  } = createHiddenSelect({
    state,
    name: stateProps.name,
    form: ariaProps.form,
    isRequired: ariaProps.isRequired,
    validationBehavior: ariaProps.validationBehavior ?? "native",
    get isDisabled() {
      return resolveDisabled();
    },
  });
  const handleHiddenSelectInvalid: JSX.EventHandler<HTMLSelectElement | HTMLInputElement, Event> = (
    event,
  ) => {
    setSelectValidation(getSelectValidation(event.currentTarget));
    focusTrigger();
    event.preventDefault();
  };
  const handleHiddenSelectChange: JSX.EventHandler<HTMLSelectElement, Event> = (event) => {
    (hiddenSelectProps as { onChange?: JSX.EventHandler<HTMLSelectElement, Event> }).onChange?.(
      event,
    );
    setSelectValidation(
      hasSelection() && event.currentTarget.validity.valid
        ? DEFAULT_VALIDATION_RESULT
        : getSelectValidation(event.currentTarget),
    );
  };
  // RAC HiddenSelect binds `value` on the <select> (HiddenSelect.tsx:144), not
  // `selected` on each <option>. Spreading selectProps once snapshots the key.
  const hiddenSelectItemNodes = () =>
    Array.from(state.collection()).filter((item) => item.type === "item");
  const nativeSelectValue = (): string | string[] => {
    if (state.selectionMode() === "multiple") {
      const selectedKeys = state.selectedKeys();
      if (selectedKeys === "all") {
        return hiddenSelectItemNodes().map((item) => String(item.key));
      }
      return Array.from(selectedKeys as Set<Key>).map(String);
    }
    const key = state.selectedKey();
    return key != null ? String(key) : "";
  };
  const hiddenSelectFallbackValues = (): Array<Key | null> => {
    if (state.selectionMode() === "multiple") {
      const keys = state.selectedKeys();
      if (keys === "all") {
        return hiddenSelectItemNodes().map((item) => item.key);
      }
      const listed = Array.from(keys as Set<Key>);
      return listed.length === 0 ? [null] : listed;
    }
    return [state.selectedKey()];
  };
  createEffect(() => {
    if (hasSelection() && selectValidation().isInvalid) {
      setSelectValidation(DEFAULT_VALIDATION_RESULT);
    }
  });
  let triggerRef: HTMLElement | null = null;
  const setTriggerRef = (el: HTMLElement | null) => {
    triggerRef = el;
  };

  const RootChildren = () => {
    const selectChildren = untrack(() =>
      typeof local.children === "function"
        ? (local.children as (values: SelectRenderProps) => JSX.Element)(childRenderValues)
        : local.children,
    );

    return (
      <>
        <Show when={ariaProps.label}>
          <span {...cleanLabelProps()}>{ariaProps.label as JSX.Element}</span>
        </Show>
        {selectChildren}
        {/*
          The HiddenSelect (native `<select>` for form autofill/submission) renders
          AFTER the trigger button, mirroring upstream RAC `Select` which emits
          `{renderProps.children}` then `<HiddenSelect>` (Select.tsx:288-289). Order
          matters for the DOM tab/focus trail: the visible button must precede the
          form-only hidden control.

          RAC HiddenSelect.tsx:172-244: ≤300 items render a <select> inside a
          <label> inside the visually hidden container — never an extra <input>.
          Hidden <input>s exist only when the collection is larger than 300.
        */}
        <Show
          when={state.collection().size <= 300}
          fallback={
            <Show when={stateProps.name}>
              <For
                each={(() => {
                  // RAC HiddenSelect.tsx:205-208: always render at least one
                  // hidden input so a required empty field still participates
                  // in native form validation / FormData.
                  const keys =
                    state.selectionMode() === "multiple"
                      ? state.selectedKeys() === "all"
                        ? Array.from(state.collection()).map((item) => item.key)
                        : Array.from(state.selectedKeys() as Set<Key>)
                      : [state.selectedKey()];
                  return keys.length === 0 ? [null] : keys;
                })()}
              >
                {(key) => (
                  <input
                    {...hiddenInputProps}
                    name={stateProps.name}
                    form={ariaProps.form}
                    value={key != null ? String(key) : ""}
                    disabled={resolveDisabled()}
                    onInvalid={handleHiddenSelectInvalid}
                  />
                )}
              </For>
            </Show>
          }
        >
          <div {...containerProps} data-testid="hidden-select-container">
            <label>
              {ariaProps.label}
              <select
                {...hiddenSelectProps}
                name={stateProps.name}
                required={
                  (hasNativeValidation() && ariaProps.isRequired && !hasSelection()) || undefined
                }
                value={nativeSelectValue()}
                onInvalid={handleHiddenSelectInvalid}
                onChange={handleHiddenSelectChange}
                onInput={handleHiddenSelectChange}
              >
                <option value="" label={"\u00A0"}>
                  {"\u00A0"}
                </option>
                <For each={hiddenSelectItemNodes()}>
                  {(item) => <option value={String(item.key)}>{item.textValue}</option>}
                </For>
                <Show when={state.collection().size === 0 && stateProps.name}>
                  <For each={hiddenSelectFallbackValues()}>
                    {(value) => <option value={value != null ? String(value) : ""} />}
                  </For>
                </Show>
              </select>
            </label>
          </div>
        </Show>
      </>
    );
  };
  const baseRootProps = () =>
    ({
      ...domProps(),
      ...cleanHoverProps(),
      ref: setRootRef,
      class: renderProps.class(),
      style: renderProps.style(),
      slot: local.slot,
      "data-open": isOpen() || undefined,
      "data-disabled": resolveDisabled() || undefined,
      "data-required": ariaProps.isRequired || undefined,
      "data-invalid": isInvalid() || undefined,
      "data-hovered": isHovered() || undefined,
    }) as JSX.HTMLAttributes<HTMLDivElement>;
  const RootContent = () => {
    const textSlots = {
      slots: {
        get description() {
          return selectHook.descriptionProps;
        },
        get errorMessage() {
          return selectHook.errorMessageProps;
        },
      },
    };
    const renderedRootChildren = (
      <Provider values={[[TextContext, textSlots]] as Array<[Context<unknown>, unknown]>}>
        <RootChildren />
      </Provider>
    );
    const rootProps = () =>
      ({
        ...baseRootProps(),
        children: renderedRootChildren,
      }) as JSX.HTMLAttributes<HTMLDivElement>;

    return local.render ? (
      local.render(rootProps(), renderValues())
    ) : (
      <div {...baseRootProps()}>{renderedRootChildren}</div>
    );
  };

  return (
    <SelectContext.Provider
      value={
        {
          state,
          rootRef: () => rootRef ?? null,
          triggerRef: () => triggerRef,
          setTriggerRef,
          get triggerProps() {
            return triggerPropsWithValidation();
          },
          get valueProps() {
            return selectHook.valueProps;
          },
          get labelProps() {
            return selectHook.labelProps;
          },
          get menuProps() {
            return selectHook.menuProps;
          },
          get errorMessageProps() {
            return selectHook.errorMessageProps;
          },
          get validation() {
            return validation();
          },
          isOpen,
          isFocused,
          isFocusVisible,
          isPressed,
          isDisabled: resolveDisabled,
          placeholder: ariaProps.placeholder,
          items: stateProps.items,
          autoFocus: !!ariaProps.autoFocus,
        } as SelectContextValue<unknown>
      }
    >
      <SelectStateContext.Provider value={state}>
        <FieldErrorContext.Provider value={fieldErrorContext}>
          <RootContent />
        </FieldErrorContext.Provider>
      </SelectStateContext.Provider>
    </SelectContext.Provider>
  );
}

/**
 * The trigger button for a select.
 */
export function SelectTrigger(props: SelectTriggerProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children", "ref"]);

  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("SelectTrigger must be used within a Select");
  }
  const { isOpen, isFocused, isFocusVisible, isPressed, state } = context;
  let triggerRef: HTMLButtonElement | undefined;
  const setTriggerRef = (el: HTMLButtonElement) => {
    triggerRef = el;
    context.setTriggerRef(el);
    assignRef(local.ref, el);
  };

  createEffect(() => {
    if (context.autoFocus) {
      triggerRef?.focus();
    }
  });

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return state.isDisabled;
    },
  });

  const renderValues = createMemo<SelectTriggerRenderProps>(() => ({
    isOpen: isOpen(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isHovered: isHovered(),
    isPressed: isPressed(),
    isDisabled: state.isDisabled,
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Select-trigger",
    },
    renderValues,
  );

  const cleanTriggerProps = () => {
    const {
      ref: _ref1,
      "aria-disabled": _ariaDisabled,
      ...rest
    } = context.triggerProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref2, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const triggerAriaProps = () => context.triggerProps as Record<string, unknown>;
  const menuAriaProps = () => context.menuProps as Record<string, unknown>;
  return (
    <button
      ref={setTriggerRef}
      {...domProps}
      {...cleanTriggerProps()}
      {...cleanHoverProps()}
      type="button"
      id={triggerAriaProps().id as string | undefined}
      tabIndex={state.isDisabled ? undefined : 0}
      disabled={state.isDisabled || undefined}
      aria-label={triggerAriaProps()["aria-label"] as string | undefined}
      aria-labelledby={triggerAriaProps()["aria-labelledby"] as string | undefined}
      aria-haspopup="listbox"
      aria-expanded={isOpen()}
      aria-controls={isOpen() ? (menuAriaProps().id as string | undefined) : undefined}
      aria-required={triggerAriaProps()["aria-required"] as boolean | undefined}
      aria-describedby={triggerAriaProps()["aria-describedby"] as string | undefined}
      class={renderProps.class()}
      style={renderProps.style()}
      data-open={isOpen() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-hovered={isHovered() || undefined}
      data-disabled={state.isDisabled || undefined}
    >
      {renderProps.renderChildren()}
    </button>
  );
}

// Default children function for SelectValue - defined at module level for SSR stability
function defaultSelectValueChildren<T>(values: SelectValueRenderProps<T>) {
  return values.selectedText ?? values.placeholder ?? "";
}

/**
 * Displays the selected value in a select.
 */
export function SelectValue<T>(props: SelectValueProps<T>): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "placeholder",
    "children",
  ]);

  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("SelectValue must be used within a Select");
  }
  const { valueProps, placeholder: contextPlaceholder } = context;
  const state = context.state as SelectState<T>;
  const stringFormatter = createStringFormatter(racIntlStrings, "react-aria-components");
  const listFormatter = createListFormatter({ style: "long", type: "conjunction" });

  const placeholder = () =>
    local.placeholder ?? contextPlaceholder ?? stringFormatter().format("selectPlaceholder");

  const renderValues = createMemo<SelectValueRenderProps<T>>(() => {
    const collection = state.collection();
    const selectedItem =
      state.selectedKey() == null ? null : collection.getItem(state.selectedKey() as Key);
    const selectedKeys = state.selectedKeys();
    const selectedItems =
      selectedKeys === "all"
        ? Array.from(collection)
        : Array.from(selectedKeys as Set<Key>)
            .map((key) => collection.getItem(key))
            .filter((item): item is CollectionNode<T> => item != null);
    const selectedText =
      state.selectionMode() === "multiple"
        ? selectedItems.length > 0
          ? listFormatter().format(selectedItems.map((item) => item.textValue))
          : null
        : (selectedItem?.textValue ?? null);
    return {
      selectedItem,
      selectedItems,
      selectedText,
      isSelected:
        state.selectionMode() === "multiple" ? selectedItems.length > 0 : selectedItem != null,
      placeholder: placeholder(),
    };
  });

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children ?? defaultSelectValueChildren;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Select-value",
    },
    renderValues,
  );

  return (
    <span
      {...domProps}
      {...valueProps}
      class={renderProps.class()}
      style={renderProps.style()}
      data-placeholder={!renderValues().isSelected || undefined}
    >
      {props.children == null
        ? (renderValues().selectedText ?? renderValues().placeholder ?? "")
        : renderProps.renderChildren()}
    </span>
  );
}

/**
 * The listbox popup for a select.
 */
export function SelectListBox<T>(props: SelectListBoxProps<T>): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "children",
    "renderEmptyState",
    "onLoadMore",
    "isLoading",
    "renderLoadMore",
    "loadMoreClass",
    "isInPopover",
  ]);

  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("SelectListBox must be used within a Select");
  }
  const { menuProps, rootRef, state: selectState, isOpen } = context;
  const state = selectState as SelectState<T>;

  createEffect(() => {
    if (!isOpen()) {
      return;
    }
    // On open the listbox takes collection focus. Upstream `useSelect` sets
    // `menuProps.autoFocus = state.focusStrategy || true`, so the ListBox's
    // `useSelectableCollection` auto-focuses on mount — setting the selection
    // manager's `isFocused` true and focusing the selected option. Our
    // `createListBox` reimplements keyboard nav inline (no `autoFocus` effect),
    // so we set the manager focus here to match. Without it the selected option
    // never paints its focus-visible background (`data-focused` stays unset).
    state.selectionManager.setFocused(true);
    if (state.focusedKey() != null) {
      return;
    }
    const selectedKey = state.selectedKey();
    if (selectedKey != null && !state.collection().getItem(selectedKey)?.isDisabled) {
      state.setFocusedKey(selectedKey);
    }
  });

  let listBoxRef: HTMLDivElement | undefined;

  createInteractOutside({
    ref: () => rootRef() ?? listBoxRef ?? null,
    onInteractOutside: () => {
      if (isOpen()) {
        state.close();
      }
    },
    get isDisabled() {
      return !isOpen() || local.isInPopover === true;
    },
  });

  // Keep the hook result intact — destructuring `{ listBoxProps }` invokes the
  // `get listBoxProps()` getter ONCE and freezes it (the Solid "destructuring a
  // get-prop freezes reactivity" gotcha). The listbox `tabIndex` is computed from
  // `focusedKey` (`focusedKey != null ? -1 : 0`); on open the effect above sets a
  // focused key, so a frozen snapshot would leave the listbox tabbable (`0`) when
  // upstream flips it to `-1`. Reading `listBoxHook.listBoxProps` per access keeps
  // it reactive.
  const parentCollectionRenderer = useCollectionRenderer<unknown>();
  const listBoxHook = createListBox(
    {
      ...(menuProps as unknown as AriaListBoxProps),
      shouldSelectOnPressUp: true,
      shouldFocusOnHover: true,
      // Upstream useSelect keeps Escape for closing the popup even though a
      // multiple Select may toggle its final selected option off.
      disallowEmptySelection: true,
      shouldSelectOnFocus: local.isInPopover === true ? false : undefined,
      get isDisabled() {
        return state.isDisabled;
      },
      get isVirtualized() {
        return parentCollectionRenderer?.isVirtualized;
      },
    },
    createSelectListStateAdapter(state),
  );

  const {
    isFocused: isListBoxFocused,
    isFocusVisible: isListBoxFocusVisible,
    focusProps: listBoxFocusProps,
  } = createFocusRing();

  const renderValues = createMemo<SelectListBoxRenderProps>(() => ({
    // RAC ListBox.tsx:366 — data-focused comes from useFocusRing on the listbox
    // element, not the selection manager.
    isFocused: isListBoxFocused(),
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Select-listbox",
    },
    renderValues,
  );

  const cleanMenuProps = () => {
    const { ref: _ref1, ...rest } = menuProps as Record<string, unknown>;
    return rest;
  };
  const cleanListBoxProps = () => {
    const {
      ref: _ref2,
      "aria-activedescendant": _activeDescendant,
      onFocus: _onFocus,
      ...rest
    } = listBoxHook.listBoxProps as Record<string, unknown>;
    // Faithful Select listbox focus model: the focused option receives REAL DOM
    // focus (the open effect above + `createSelectableItem`'s self-focus move
    // `document.activeElement` onto it), mirroring upstream `useSelect`. So the
    // listbox must (a) leave the tab sequence once an option is focused —
    // `useSelectableCollection` uses `tabIndex = focusedKey == null ? 0 : -1`
    // (useSelectableCollection.ts:687-690) — and (b) NOT expose
    // `aria-activedescendant`, which is the virtual-focus channel upstream Select
    // never uses. These are overridden here, not in the shared `createListBox`,
    // because the standalone `ListBox` keeps its container-focus model (focus
    // stays on the listbox, `aria-activedescendant` is its AT channel).
    //
    // We also drop `createListBox`'s container-focus TRAMPOLINE (`onFocus`): it
    // marshals the first key when the container is focused with `focusedKey ==
    // null`, which is exactly Select's deliberate click-open state (the open
    // effect sets `isFocused` true but leaves `focusedKey` null when nothing is
    // selected, so the first arrow enters the first item). Upstream's own
    // trampoline no-ops in this case because it guards on `manager.isFocused`
    // (already true); our shared guard uses `focusedKey == null` for the
    // standalone ListBox, so we strip it here to preserve Select's faithful
    // model. (Auto-selecting on focus under replace behavior would also toggle
    // the first item selected on open — the bug this override prevents.)
    return {
      ...rest,
      tabIndex: state.isDisabled ? undefined : state.focusedKey() != null ? -1 : 0,
    };
  };
  const cleanListBoxFocusProps = () => {
    const { ref: _ref3, ...rest } = listBoxFocusProps as Record<string, unknown>;
    return rest;
  };

  const items = () => Array.from(state.collection());
  createEffect(() => {
    if (!isOpen()) return;
    const focusedKey = state.focusedKey();
    if (focusedKey == null) return;

    queueMicrotask(() => {
      const option = Array.from(
        listBoxRef?.querySelectorAll<HTMLElement>("[role='option']") ?? [],
      ).find((element) => element.id === String(focusedKey));
      if (option && document.activeElement !== option) {
        focusSafely(option);
      }
    });
  });

  const listBox = () => (
    // Upstream RAC ListBox (and our own Menu.tsx) render a `<div role="listbox">`
    // over `<div role="option">` rows, NOT `<ul>`/`<li>` — the collection is
    // div-based for virtualization parity. `<ul>`/`<li>` here was a self-inflicted
    // structural divergence surfaced by the Picker recertification (D5/D6/D8 saw
    // `li[option]`/`ul[listbox]` where the React oracle sees `div`).
    <div
      ref={(el) => (listBoxRef = el)}
      {...domProps}
      {...cleanMenuProps()}
      {...cleanListBoxProps()}
      {...cleanListBoxFocusProps()}
      class={renderProps.class()}
      style={renderProps.style()}
      data-focused={isListBoxFocused() || undefined}
      data-focus-visible={isListBoxFocusVisible() || undefined}
      data-empty={state.collection().size === 0 || undefined}
      data-layout="stack"
      data-orientation="vertical"
    >
      {state.collection().size === 0 && local.renderEmptyState ? (
        <div role="option" style={{ display: "contents" }} data-empty-state>
          {local.renderEmptyState()}
        </div>
      ) : (
        <Show
          when={local.children}
          fallback={
            <For each={items()}>
              {(node) => <SelectOption id={node.key}>{node.textValue}</SelectOption>}
            </For>
          }
        >
          <For each={items()}>
            {(node) => (node.value != null ? local.children!(node.value) : null)}
          </For>
        </Show>
      )}
      <Show when={local.onLoadMore}>
        <ListBoxLoadMoreItem
          onLoadMore={local.onLoadMore!}
          isLoading={local.isLoading}
          class={local.loadMoreClass}
        >
          {local.renderLoadMore?.()}
        </ListBoxLoadMoreItem>
      </Show>
    </div>
  );

  return (
    <Show when={isOpen()}>
      <Show
        when={local.isInPopover}
        fallback={
          <FocusScope restoreFocus autoFocus>
            {listBox()}
          </FocusScope>
        }
      >
        {listBox()}
      </Show>
    </Show>
  );
}

/**
 * An option in a select listbox.
 */
export function SelectOption<T>(props: SelectOptionProps<T>): JSX.Element {
  const [local, ariaProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "id",
    "item",
    "textValue",
    "ref",
  ]);

  const context = useContext(SelectStateContext);
  if (!context) {
    throw new Error("SelectOption must be used within a Select");
  }
  const state = context as SelectState<T>;
  const selectContext = useContext(SelectContext) as SelectContextValue<T> | null;
  const [ref, setRefSignal] = createSignal<HTMLDivElement | null>(null);
  const setRef = (el: HTMLDivElement | null) => {
    setRefSignal(el);
    assignRef(local.ref, el as HTMLDivElement);
  };

  // SelectOption allocates its own list-state adapter, so `createOption` cannot
  // find `isVirtualized` in the listbox data keyed by SelectListBox's adapter
  // (RAC reads it from `listData`, useOption.ts:130-131). Pass it explicitly
  // from the same CollectionRenderer a parent Virtualizer publishes.
  const parentCollectionRenderer = useCollectionRenderer<unknown>();
  const optionAria = createOption<T>(
    {
      key: local.id,
      get isVirtualized() {
        return parentCollectionRenderer?.isVirtualized;
      },
      get isDisabled() {
        return Boolean(ariaProps.isDisabled || selectContext?.isDisabled());
      },
      get "aria-label"() {
        return ariaProps["aria-label"];
      },
      shouldSelectOnPressUp: true,
      shouldFocusOnHover: true,
      get onHoverStart() {
        return ariaProps.onHoverStart;
      },
      get onHoverEnd() {
        return ariaProps.onHoverEnd;
      },
      get onHoverChange() {
        return ariaProps.onHoverChange;
      },
    },
    {
      ...createSelectListStateAdapter(state),
      select: (key: Key) => {
        if (state.selectionMode() === "multiple") {
          const keys = state.selectedKeys();
          if (keys === "all") return;
          state.setSelectedKeys(new Set([...keys, key]));
          return;
        }
        state.setSelectedKey(key);
        state.close();
      },
      toggleSelection: (key: Key) => {
        if (state.selectionMode() === "multiple") {
          const keys = state.selectedKeys();
          if (keys === "all") return;
          const next = new Set(keys);
          if (next.has(key)) next.delete(key);
          else next.add(key);
          state.setSelectedKeys(next);
          return;
        }
        state.setSelectedKey(key);
        state.close();
      },
      replaceSelection: (key: Key) => {
        state.setSelectedKey(key);
        if (state.selectionMode() !== "multiple") {
          state.close();
        }
      },
    },
    () => ref(),
  );
  const isOptionFocusVisible = () =>
    optionAria.isFocused() && (selectContext?.isFocusVisible() ?? optionAria.isFocusVisible());

  const renderValues = createMemo<SelectOptionRenderProps>(() => ({
    isSelected: optionAria.isSelected(),
    isFocused: optionAria.isFocused(),
    isFocusVisible: isOptionFocusVisible(),
    isPressed: optionAria.isPressed(),
    isHovered: optionAria.isHovered(),
    isDisabled: optionAria.isDisabled(),
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return props.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Select-option",
    },
    renderValues,
  );
  const selectionIndicatorContext = createMemo<SelectionIndicatorContextValue>(() => ({
    isSelected: optionAria.isSelected,
  }));

  const cleanOptionProps = () => {
    const { ref: _ref1, ...rest } = optionAria.optionProps as Record<string, unknown>;
    const onClick = rest.onClick as ((event: MouseEvent) => void) | undefined;
    rest.onClick = ((event: MouseEvent) => {
      const wasSelected = optionAria.isSelected();
      onClick?.(event);
      if (typeof PointerEvent === "undefined") {
        return;
      }
      queueMicrotask(() => {
        if (state.selectionMode() !== "multiple" || optionAria.isSelected() === wasSelected) {
          selectOption();
        }
      });
    }) as JSX.EventHandler<HTMLDivElement, MouseEvent>;
    return rest;
  };

  const optionTextSlots = {
    slots: {
      get [DEFAULT_SLOT]() {
        return optionAria.labelProps;
      },
      get label() {
        return optionAria.labelProps;
      },
      get description() {
        return optionAria.descriptionProps;
      },
    },
  };

  createRenderEffect(() => {
    const el = ref();
    const labelId = optionAria.labelProps.id;
    const descriptionId = optionAria.descriptionProps.id;
    if (!el) return;
    if (labelId) {
      const label = el.querySelector("[slot='label']");
      if (label && !label.id) label.id = labelId;
    }
    if (descriptionId) {
      const description = el.querySelector("[slot='description']");
      if (description && !description.id) description.id = descriptionId;
    }
  });
  const selectOption = () => {
    if (optionAria.isDisabled()) {
      return;
    }
    if (state.selectionMode() === "multiple") {
      const keys = state.selectedKeys();
      if (keys === "all") return;
      const next = new Set(keys);
      if (next.has(local.id)) next.delete(local.id);
      else next.add(local.id);
      state.setSelectedKeys(next);
      return;
    }
    state.setSelectedKey(local.id);
    state.close();
  };

  return (
    <SelectionIndicatorContext.Provider value={selectionIndicatorContext()}>
      {/* `<div role="option">`, not `<li>` — see the SelectListBox note; upstream
          RAC options are div-based. */}
      <div
        ref={setRef}
        {...cleanOptionProps()}
        class={renderProps.class()}
        style={renderProps.style()}
        data-selected={optionAria.isSelected() || undefined}
        data-focused={optionAria.isFocused() || undefined}
        data-focus-visible={isOptionFocusVisible() || undefined}
        data-pressed={optionAria.isPressed() || undefined}
        data-hovered={optionAria.isHovered() || undefined}
        data-disabled={optionAria.isDisabled() || undefined}
        data-selection-mode={state.selectionMode()}
      >
        <Provider values={[[TextContext, optionTextSlots] as [Context<unknown>, unknown]]}>
          <OptionContent render={renderProps.renderChildren} labelProps={optionAria.labelProps} />
        </Provider>
      </div>
    </SelectionIndicatorContext.Provider>
  );
}

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function toKey(value: unknown): Key | undefined {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  return undefined;
}

function toTextValue(value: unknown): string | undefined {
  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }
  return undefined;
}

function createSelectListStateAdapter<T>(state: SelectState<T>): ListState<T> {
  const selectedKeys = createMemo(() => {
    const keys = state.selectedKeys();
    return keys === "all" ? new Set(Array.from(state.collection()).map((item) => item.key)) : keys;
  });

  const disabledKeys = createMemo(() => {
    const keys = new Set<Key>();
    for (const node of state.collection()) {
      if (node.isDisabled) keys.add(node.key);
    }
    return keys;
  });

  return {
    collection: state.collection,
    selectionManager: state.selectionManager,
    // Collection-level focus (the selection manager's), not the select-level
    // trigger focus — upstream listbox internals only ever read
    // state.selectionManager.isFocused.
    isFocused: () => state.selectionManager.isFocused,
    setFocused: (isFocused) => state.selectionManager.setFocused(isFocused),
    focusedKey: state.focusedKey,
    setFocusedKey: (key) => state.setFocusedKey(key ?? null),
    childFocusStrategy: () => null,
    selectionMode: () => state.selectionManager.selectionMode,
    selectionBehavior: () => state.selectionManager.selectionBehavior,
    disallowEmptySelection: () => state.selectionManager.disallowEmptySelection,
    selectedKeys,
    disabledKeys,
    disabledBehavior: () => "all",
    isEmpty: () => selectedKeys().size === 0,
    isSelectAll: () => state.selectedKeys() === "all",
    isSelected: (key) => selectedKeys().has(key),
    isDisabled: state.isKeyDisabled,
    setSelectionBehavior: (behavior) => state.selectionManager.setSelectionBehavior(behavior),
    toggleSelection: (key) => state.selectionManager.toggleSelection(key),
    replaceSelection: (key) => state.selectionManager.replaceSelection(key),
    setSelectedKeys: (keys) => state.selectionManager.setSelectedKeys(keys),
    selectAll: () => state.selectionManager.selectAll(),
    clearSelection: () => state.selectionManager.clearSelection(),
    toggleSelectAll: () => state.selectionManager.toggleSelectAll(),
    extendSelection: (toKey) => state.selectionManager.extendSelection(toKey),
    select: (key, event) => state.selectionManager.select(key, event),
  };
}

Select.Trigger = SelectTrigger;
Select.Value = SelectValue;
Select.ListBox = SelectListBox;
Select.Option = SelectOption;
