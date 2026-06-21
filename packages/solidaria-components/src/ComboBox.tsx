/**
 * ComboBox component for solidaria-components
 *
 * A pre-wired headless combobox that combines state + aria hooks.
 * Port of react-aria-components/src/ComboBox.tsx
 */

import {
  type JSX,
  type Accessor,
  createContext,
  createEffect,
  createMemo,
  onCleanup,
  splitProps,
  useContext,
  For,
  Show,
} from "solid-js";
import {
  createComboBox,
  createListBox,
  createOption,
  getComboBoxData,
  createHover,
  createInteractOutside,
  createScrollIntoViewOnFocus,
  mergeProps,
  type AriaComboBoxProps,
  type AriaListBoxProps,
  type AriaOptionProps,
} from "@proyecto-viviana/solidaria";
import {
  createComboBoxState,
  defaultContainsFilter,
  type ComboBoxState,
  type ListState,
  type Key,
  type FilterFn,
  type MenuTriggerAction,
} from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import {
  SelectionIndicatorContext,
  type SelectionIndicatorContextValue,
} from "./SelectionIndicator";

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") {
    ref(el);
  } else {
    ref.current = el;
  }
}

export interface ComboBoxRenderProps {
  /** Whether the combobox listbox is open. */
  isOpen: boolean;
  /** Whether the combobox input is focused. */
  isFocused: boolean;
  /** Whether the combobox input has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the combobox is disabled. */
  isDisabled: boolean;
  /** Whether the combobox is required. */
  isRequired: boolean;
  /** Whether the combobox is invalid. */
  isInvalid: boolean;
  /** Whether the combobox is read only. */
  isReadOnly: boolean;
  /** Whether a value is selected. */
  isSelected: boolean;
  /** The current input value. */
  inputValue: string;
}

export interface ComboBoxProps<T> extends Omit<AriaComboBoxProps, "children">, SlotProps {
  /** The items to render in the combobox. */
  items?: T[];
  /** The default items to render in the combobox when uncontrolled. */
  defaultItems?: T[];
  /** Function to get the key from an item. */
  getKey?: (item: T) => Key;
  /** Function to get the text value from an item. */
  getTextValue?: (item: T) => string;
  /** Function to check if an item is disabled. */
  getDisabled?: (item: T) => boolean;
  /** Keys of disabled items. */
  disabledKeys?: Iterable<Key>;
  /** The selection mode for the combobox. */
  selectionMode?: "single" | "multiple";
  /** The currently selected key (controlled, single mode). */
  selectedKey?: Key | null;
  /** The default selected key (uncontrolled, single mode). */
  defaultSelectedKey?: Key | null;
  /** The currently selected keys (controlled, multiple mode). */
  selectedKeys?: Iterable<Key>;
  /** The default selected keys (uncontrolled, multiple mode). */
  defaultSelectedKeys?: Iterable<Key>;
  /** Handler called when selection changes (single mode). */
  onSelectionChange?: (key: Key | null) => void;
  /** Handler called when selection changes (multiple mode). */
  onSelectionChangeMultiple?: (keys: Set<Key>) => void;
  /** The current input value (controlled). */
  inputValue?: string;
  /** The default input value (uncontrolled). */
  defaultInputValue?: string;
  /** Handler called when input value changes. */
  onInputChange?: (value: string) => void;
  /** Whether the combobox is open (controlled). */
  isOpen?: boolean;
  /** Whether the combobox is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Handler called when the open state changes. */
  onOpenChange?: (isOpen: boolean, trigger?: MenuTriggerAction) => void;
  /** The filter function to use for filtering items. */
  defaultFilter?: FilterFn;
  /** Whether to allow custom values that don't match any item. */
  allowsCustomValue?: boolean;
  /** Whether to allow an empty collection (show listbox even with no matches). */
  allowsEmptyCollection?: boolean;
  /** The trigger mechanism for the combobox menu. */
  menuTrigger?: "focus" | "input" | "manual";
  /** The name of the combobox, used when submitting an HTML form. */
  name?: string;
  /**
   * Controls what value is submitted in forms.
   * - 'key': submit the selected key via hidden input (default)
   * - 'text': submit the text input value
   *
   * When allowsCustomValue is true, formValue is forced to 'text'.
   */
  formValue?: "key" | "text";
  /** The children of the component (compound components: ComboBoxInput, ComboBoxButton, ComboBoxListBox). */
  children: RenderChildren<ComboBoxRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ComboBoxRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ComboBoxRenderProps>;
  /** Ref for the root combobox element. */
  ref?: RefLike<HTMLDivElement>;
  /** Internal alias for libraries that wrap ComboBox and need a root ref. */
  rootRef?: RefLike<HTMLDivElement>;
  /** Slot definitions provided through ComboBoxContext. */
  slots?: Record<string, Partial<ComboBoxProps<T>>>;
}

export interface ComboBoxInputRenderProps {
  /** Whether the combobox is open. */
  isOpen: boolean;
  /** Whether the input is focused. */
  isFocused: boolean;
  /** Whether the input has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the input is hovered. */
  isHovered: boolean;
  /** Whether the input is disabled. */
  isDisabled: boolean;
  /** The current input value. */
  inputValue: string;
}

export interface ComboBoxInputProps extends SlotProps {
  /** The children of the input. */
  children?: RenderChildren<ComboBoxInputRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ComboBoxInputRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ComboBoxInputRenderProps>;
}

export interface ComboBoxLabelProps extends SlotProps {
  /** The children of the label element. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
}

export interface ComboBoxDescriptionProps extends SlotProps {
  /** The children of the description element. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
}

export interface ComboBoxErrorMessageProps extends SlotProps {
  /** The children of the error message element. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
}

export interface ComboBoxButtonRenderProps {
  /** Whether the combobox is open. */
  isOpen: boolean;
  /** Whether the button is focused. */
  isFocused: boolean;
  /** Whether the button is hovered. */
  isHovered: boolean;
  /** Whether the button is pressed. */
  isPressed: boolean;
  /** Whether the button is disabled. */
  isDisabled: boolean;
}

export interface ComboBoxValueRenderProps {
  textValue: string;
  isPlaceholder: boolean;
  selectedItems: unknown[];
  selectedText: string;
  state: ComboBoxState<unknown>;
}

export interface ComboBoxValueProps extends SlotProps {
  children?: RenderChildren<ComboBoxValueRenderProps>;
  class?: ClassNameOrFunction<ComboBoxValueRenderProps>;
  style?: StyleOrFunction<ComboBoxValueRenderProps>;
  placeholder?: JSX.Element;
}

export interface ComboBoxButtonProps extends SlotProps {
  /** The children of the button. */
  children?: RenderChildren<ComboBoxButtonRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ComboBoxButtonRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ComboBoxButtonRenderProps>;
}

export interface ComboBoxListBoxRenderProps {
  /** Whether the listbox is focused. */
  isFocused: boolean;
}

export interface ComboBoxListBoxProps<T> extends SlotProps {
  /** The children of the listbox. A function may be provided to render each item. */
  children?: (item: T) => JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ComboBoxListBoxRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ComboBoxListBoxRenderProps>;
}

export interface ComboBoxOptionRenderProps {
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

export interface ComboBoxOptionProps<T>
  extends Omit<AriaOptionProps, "children" | "key">, SlotProps {
  /** The unique key for the option. */
  id: Key;
  /** The item value. */
  item?: T;
  /** The children of the option. A function may be provided to receive render props. */
  children?: RenderChildren<ComboBoxOptionRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<ComboBoxOptionRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<ComboBoxOptionRenderProps>;
  /** The text value of the option (for typeahead). */
  textValue?: string;
  /** Handler called when the option is activated. */
  onAction?: () => void;
}

interface ComboBoxContextValue<T> {
  state: ComboBoxState<T>;
  listState: ListState<T>;
  inputProps: () => JSX.InputHTMLAttributes<HTMLInputElement>;
  buttonProps: () => JSX.HTMLAttributes<HTMLElement>;
  listBoxProps: () => JSX.HTMLAttributes<HTMLElement>;
  labelProps: () => JSX.HTMLAttributes<HTMLElement>;
  descriptionProps: () => JSX.HTMLAttributes<HTMLElement>;
  errorMessageProps: () => JSX.HTMLAttributes<HTMLElement>;
  isOpen: Accessor<boolean>;
  isFocused: Accessor<boolean>;
  isFocusVisible: Accessor<boolean>;
  items: T[];
  inputRef: () => HTMLInputElement | null;
  setInputRef: (el: HTMLInputElement | null) => void;
  buttonRef: () => HTMLElement | null;
  setButtonRef: (el: HTMLElement | null) => void;
  triggerRef: () => HTMLElement | null;
  setTriggerRef: (el: HTMLElement | null) => void;
  listBoxRef: () => HTMLElement | null;
  setListBoxRef: (el: HTMLElement | null) => void;
  registerOptionAction: (key: Key, action: (() => void) | undefined) => void;
  runOptionAction: (key: Key) => void;
  slots?: Record<string, Partial<ComboBoxProps<T>>>;
}

type InputKeyboardEvent = KeyboardEvent & {
  currentTarget: HTMLInputElement;
  target: Element;
};

export const ComboBoxContext = createContext<ComboBoxContextValue<unknown> | null>(null);
export const ComboBoxStateContext = createContext<ComboBoxState<unknown> | null>(null);
export const ComboBoxValueContext = ComboBoxContext;

function callInputKeyDown(
  handler: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> | undefined,
  event: InputKeyboardEvent,
) {
  if (typeof handler === "function") {
    handler(event);
  } else if (handler) {
    handler[0](handler[1], event);
  }
}

/**
 * A combobox combines a text input with a listbox, allowing users to filter a list of options.
 */
export function ComboBox<T>(props: ComboBoxProps<T>): JSX.Element {
  const parentContext = useContext(ComboBoxContext) as ComboBoxContextValue<T> | null;
  const contextSlotProps = parentContext?.slots?.[props.slot ?? "default"];
  const mergedComboBoxProps = contextSlotProps
    ? (mergeProps(contextSlotProps, props) as ComboBoxProps<T>)
    : props;
  const [local, stateProps, ariaProps] = splitProps(
    mergedComboBoxProps,
    ["class", "style", "slot", "children", "ref", "rootRef", "slots"],
    [
      "items",
      "defaultItems",
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
      "onSelectionChangeMultiple",
      "inputValue",
      "defaultInputValue",
      "onInputChange",
      "isOpen",
      "defaultOpen",
      "onOpenChange",
      "defaultFilter",
      "allowsCustomValue",
      "allowsEmptyCollection",
      "menuTrigger",
      "name",
      "formValue",
    ],
  );

  let inputRef: HTMLInputElement | null = null;
  let buttonRef: HTMLElement | null = null;
  let triggerRef: HTMLElement | null = null;
  let listBoxRef: HTMLElement | null = null;
  const optionActions = new Map<Key, () => void>();
  const runOptionAction = (key: Key) => {
    optionActions.get(key)?.();
  };

  const state = createComboBoxState<T>({
    get items() {
      return stateProps.items;
    },
    get defaultItems() {
      return stateProps.defaultItems;
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
    get onSelectionChangeMultiple() {
      return stateProps.onSelectionChangeMultiple;
    },
    get inputValue() {
      return stateProps.inputValue;
    },
    get defaultInputValue() {
      return stateProps.defaultInputValue;
    },
    get onInputChange() {
      return stateProps.onInputChange;
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
    get defaultFilter() {
      return stateProps.defaultFilter;
    },
    get allowsCustomValue() {
      return stateProps.allowsCustomValue;
    },
    get allowsEmptyCollection() {
      return stateProps.allowsEmptyCollection;
    },
    get menuTrigger() {
      return stateProps.menuTrigger;
    },
    get isDisabled() {
      return ariaProps.isDisabled;
    },
    get isReadOnly() {
      return ariaProps.isReadOnly;
    },
    get isRequired() {
      return ariaProps.isRequired;
    },
  });
  const listState = createComboBoxListStateAdapter(state);

  const effectiveFormValue = createMemo<"key" | "text">(() => {
    if (stateProps.allowsCustomValue) {
      return "text";
    }
    return stateProps.formValue ?? "key";
  });

  const comboBoxAriaProps = createMemo(() => {
    const cleanProps: Record<string, unknown> = {};
    for (const key in ariaProps) {
      if (!key.startsWith("data-")) {
        cleanProps[key] = (ariaProps as Record<string, unknown>)[key];
      }
    }
    return cleanProps as AriaComboBoxProps;
  });

  const comboBoxAria = createComboBox<T>(
    () => ({
      ...comboBoxAriaProps(),
      get name() {
        return effectiveFormValue() === "text" ? stateProps.name : undefined;
      },
    }),
    state,
    () => inputRef,
    () => buttonRef,
    () => listBoxRef,
  );

  const getInputProps = () => {
    const inputProps = comboBoxAria.inputProps;
    const originalOnKeyDown = inputProps.onKeyDown;

    return {
      ...inputProps,
      onKeyDown: (event: InputKeyboardEvent) => {
        const focusedKey = state.focusedKey();
        const shouldRunAction =
          event.key === "Enter" &&
          state.isOpen() &&
          focusedKey != null &&
          !state.isKeyDisabled(focusedKey);
        const optionAction = shouldRunAction ? optionActions.get(focusedKey) : undefined;

        callInputKeyDown(originalOnKeyDown, event);

        optionAction?.();
      },
    } as JSX.InputHTMLAttributes<HTMLInputElement>;
  };

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return ariaProps.isDisabled;
    },
  });

  const renderValues = createMemo<ComboBoxRenderProps>(() => ({
    isOpen: comboBoxAria.isOpen(),
    isFocused: comboBoxAria.isFocused(),
    isFocusVisible: comboBoxAria.isFocusVisible(),
    isDisabled: !!ariaProps.isDisabled,
    isRequired: !!ariaProps.isRequired,
    isInvalid: !!ariaProps.isInvalid,
    isReadOnly: !!ariaProps.isReadOnly,
    isSelected: state.selectedKey() != null,
    inputValue: state.inputValue(),
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ComboBox",
    },
    renderValues,
  );

  const domProps = createMemo(() => {
    const filtered = filterDOMProps(ariaProps as Record<string, unknown>, { global: true });
    return filtered;
  });

  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };

  const ComboBoxChildren = () =>
    typeof local.children === "function"
      ? (local.children as (values: ComboBoxRenderProps) => JSX.Element)(renderValues())
      : local.children;

  return (
    <ComboBoxContext.Provider
      value={
        {
          state,
          listState,
          inputProps: getInputProps,
          buttonProps: () => comboBoxAria.buttonProps,
          listBoxProps: () => ({
            ...comboBoxAria.listBoxProps,
            onAction: runOptionAction,
          }),
          labelProps: () => comboBoxAria.labelProps,
          descriptionProps: () => comboBoxAria.descriptionProps,
          errorMessageProps: () => comboBoxAria.errorMessageProps,
          isOpen: comboBoxAria.isOpen,
          isFocused: comboBoxAria.isFocused,
          isFocusVisible: comboBoxAria.isFocusVisible,
          items: stateProps.items ?? stateProps.defaultItems ?? [],
          inputRef: () => inputRef,
          setInputRef: (el) => {
            inputRef = el;
          },
          buttonRef: () => buttonRef,
          setButtonRef: (el) => {
            buttonRef = el;
          },
          triggerRef: () => triggerRef,
          setTriggerRef: (el) => {
            triggerRef = el;
          },
          listBoxRef: () => listBoxRef,
          setListBoxRef: (el) => {
            listBoxRef = el;
          },
          registerOptionAction: (key, action) => {
            if (action) {
              optionActions.set(key, action);
            } else {
              optionActions.delete(key);
            }
          },
          runOptionAction,
          slots: local.slots,
        } as ComboBoxContextValue<unknown>
      }
    >
      <ComboBoxStateContext.Provider value={state}>
        <div
          {...domProps()}
          {...cleanHoverProps()}
          ref={(el) => {
            assignRef(local.ref, el);
            assignRef(local.rootRef, el);
          }}
          class={renderProps.class()}
          style={renderProps.style()}
          data-open={comboBoxAria.isOpen() || undefined}
          data-focused={comboBoxAria.isFocused() || undefined}
          data-focus-visible={comboBoxAria.isFocusVisible() || undefined}
          data-disabled={ariaProps.isDisabled || undefined}
          data-required={ariaProps.isRequired || undefined}
          data-invalid={ariaProps.isInvalid || undefined}
          data-readonly={ariaProps.isReadOnly || undefined}
          data-hovered={isHovered() || undefined}
          slot={local.slot}
        >
          {/* Hidden input for key-based form submission parity */}
          <Show when={stateProps.name && effectiveFormValue() === "key"}>
            <input
              type="hidden"
              name={stateProps.name}
              form={ariaProps.form}
              value={state.selectedKey()?.toString() ?? ""}
            />
          </Show>
          <ComboBoxChildren />
        </div>
      </ComboBoxStateContext.Provider>
    </ComboBoxContext.Provider>
  );
}

/**
 * Label element for a combobox.
 */
export function ComboBoxLabel(props: ComboBoxLabelProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(ComboBoxContext);
  if (!context) {
    throw new Error("ComboBoxLabel must be used within a ComboBox");
  }

  const cleanLabelProps = () => {
    const { ref: _ref, ...rest } = context.labelProps() as Record<string, unknown>;
    return rest;
  };

  return (
    <label {...domProps} {...cleanLabelProps()} class={local.class} style={local.style}>
      {local.children}
    </label>
  );
}

/**
 * Description element for a combobox.
 */
export function ComboBoxDescription(props: ComboBoxDescriptionProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(ComboBoxContext);
  if (!context) {
    throw new Error("ComboBoxDescription must be used within a ComboBox");
  }

  const cleanDescriptionProps = () => {
    const { ref: _ref, ...rest } = context.descriptionProps() as Record<string, unknown>;
    return rest;
  };

  return (
    <div {...domProps} {...cleanDescriptionProps()} class={local.class} style={local.style}>
      {local.children}
    </div>
  );
}

/**
 * Error message element for a combobox.
 */
export function ComboBoxErrorMessage(props: ComboBoxErrorMessageProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(ComboBoxContext);
  if (!context) {
    throw new Error("ComboBoxErrorMessage must be used within a ComboBox");
  }

  const cleanErrorMessageProps = () => {
    const { ref: _ref, ...rest } = context.errorMessageProps() as Record<string, unknown>;
    return rest;
  };

  return (
    <div {...domProps} {...cleanErrorMessageProps()} class={local.class} style={local.style}>
      {local.children}
    </div>
  );
}

/**
 * The text input for a combobox.
 */
export function ComboBoxInput(props: ComboBoxInputProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(ComboBoxContext);
  if (!context) {
    throw new Error("ComboBoxInput must be used within a ComboBox");
  }
  const { isOpen, isFocused, isFocusVisible, state, setInputRef } = context;

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return state.isDisabled;
    },
  });

  const renderValues = createMemo<ComboBoxInputRenderProps>(() => ({
    isOpen: isOpen(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isHovered: isHovered(),
    isDisabled: state.isDisabled,
    inputValue: state.inputValue(),
  }));

  const renderProps = useRenderProps(
    {
      children: local.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ComboBox-input",
    },
    renderValues,
  );

  const cleanInputProps = () => {
    const { ref: _ref1, value: _value, ...rest } = context.inputProps() as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref2, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };

  return (
    <input
      {...domProps}
      ref={(el) => setInputRef(el)}
      {...cleanInputProps()}
      {...cleanHoverProps()}
      value={state.inputValue()}
      class={renderProps.class()}
      style={renderProps.style()}
      data-open={isOpen() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-hovered={isHovered() || undefined}
      data-disabled={state.isDisabled || undefined}
    />
  );
}

export function ComboBoxValue(props: ComboBoxValueProps): JSX.Element {
  const context = useContext(ComboBoxContext);
  if (!context) {
    throw new Error("ComboBoxValue must be used within a ComboBox");
  }

  const state = context.state;
  const isMulti = createMemo(() => state.selectionMode() === "multiple");
  const selectedItem = createMemo(() => state.selectedItem());
  const selectedItems = createMemo(() => {
    if (isMulti()) {
      return state.selectedItems().map((node) => node.value ?? null);
    }
    const item = selectedItem();
    return item ? [item.value ?? null] : [];
  });
  const selectedText = createMemo(() => {
    if (isMulti()) {
      const items = state.selectedItems();
      return items.map((n) => n.textValue).join(", ");
    }
    return selectedItem()?.textValue ?? "";
  });
  const textValue = createMemo(() => selectedText() || state.inputValue() || "");
  const isPlaceholder = createMemo(() => textValue().length === 0);

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: props.class,
      style: props.style,
      defaultClassName: "solidaria-ComboBox-value",
    },
    () => ({
      textValue: textValue(),
      isPlaceholder: isPlaceholder(),
      selectedItems: selectedItems(),
      selectedText: selectedText(),
      state: state as ComboBoxState<unknown>,
    }),
  );

  return (
    <span
      class={renderProps.class()}
      style={renderProps.style()}
      data-placeholder={isPlaceholder() || undefined}
    >
      {props.children
        ? renderProps.renderChildren()
        : isPlaceholder()
          ? props.placeholder
          : textValue()}
    </span>
  );
}

/**
 * The trigger button for a combobox.
 */
export function ComboBoxButton(props: ComboBoxButtonProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(ComboBoxContext);
  if (!context) {
    throw new Error("ComboBoxButton must be used within a ComboBox");
  }
  const { isOpen, isFocused, state, setButtonRef } = context;

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return state.isDisabled;
    },
  });

  const renderValues = createMemo<ComboBoxButtonRenderProps>(() => ({
    isOpen: isOpen(),
    isFocused: isFocused(),
    isHovered: isHovered(),
    isPressed: isOpen(),
    isDisabled: state.isDisabled,
  }));

  const renderProps = useRenderProps(
    {
      children: local.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ComboBox-button",
    },
    renderValues,
  );

  const cleanButtonProps = () => {
    const { ref: _ref1, ...rest } = context.buttonProps() as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref2, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };

  return (
    <button
      {...domProps}
      ref={(el) => setButtonRef(el)}
      {...cleanButtonProps()}
      {...cleanHoverProps()}
      class={renderProps.class()}
      style={renderProps.style()}
      data-open={isOpen() || undefined}
      data-pressed={isOpen() || undefined}
      data-focused={isFocused() || undefined}
      data-hovered={isHovered() || undefined}
      data-disabled={state.isDisabled || undefined}
    >
      {renderProps.renderChildren()}
    </button>
  );
}

/**
 * The listbox popup for a combobox.
 */
export function ComboBoxListBox<T>(props: ComboBoxListBoxProps<T>): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const rawContext = useContext(ComboBoxContext);
  if (!rawContext) {
    throw new Error("ComboBoxListBox must be used within a ComboBox");
  }
  const context = rawContext as ComboBoxContextValue<T>;
  const { state: comboBoxState, listState, isOpen, inputRef, buttonRef, setListBoxRef } = context;
  const state = comboBoxState;

  let listBoxRef: HTMLUListElement | undefined;

  // Reveal the activedescendant-focused option on keyboard navigation while the
  // listbox is open. Real DOM focus stays on the input, so the browser won't
  // natively scroll an off-screen focused option into view.
  createScrollIntoViewOnFocus({
    focusedKey: () => state.focusedKey(),
    isActive: () => isOpen(),
    ref: () => listBoxRef ?? null,
  });

  createInteractOutside({
    ref: () => listBoxRef ?? null,
    onInteractOutside: (e) => {
      // Don't close if clicking the input or button
      const target = e.target as HTMLElement;
      const input = inputRef();
      const button = buttonRef();
      if (input?.contains(target)) {
        return;
      }
      if (button?.contains(target)) {
        return;
      }
      if (isOpen()) {
        state.close();
      }
    },
    get isDisabled() {
      return !isOpen();
    },
  });

  // Create listbox aria props using ComboBoxState's ListState-compatible interface
  const { listBoxProps } = createListBox(
    context.listBoxProps as unknown as AriaListBoxProps,
    listState,
  );

  const renderValues = createMemo<ComboBoxListBoxRenderProps>(() => ({
    isFocused: state.isFocused(),
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ComboBox-listbox",
    },
    renderValues,
  );

  const cleanContextProps = () => {
    const { ref: _ref1, ...rest } = context.listBoxProps() as Record<string, unknown>;
    return rest;
  };
  const cleanListBoxProps = () => {
    const { ref: _ref2, ...rest } = listBoxProps as Record<string, unknown>;
    return rest;
  };

  const items = () => Array.from(state.collection());
  const getNodeValue = (node: { key: Key; value?: T | null; index?: number }): T | null => {
    if (node.value != null) {
      return node.value;
    }

    return (
      context.items.find((item, index) => {
        const candidate = item as { key?: Key; id?: Key };
        const key = candidate.key ?? candidate.id ?? index;
        return key === node.key;
      }) ?? null
    );
  };

  const setListBoxElement = (el: HTMLUListElement) => {
    listBoxRef = el;
    setListBoxRef(el);
  };

  onCleanup(() => {
    setListBoxRef(null);
  });

  return (
    <Show when={isOpen()}>
      <ul
        {...domProps}
        ref={setListBoxElement}
        {...cleanContextProps()}
        {...cleanListBoxProps()}
        class={renderProps.class()}
        style={renderProps.style()}
        data-focused={state.isFocused() || undefined}
      >
        <Show
          when={local.children}
          fallback={
            <For each={items()}>
              {(node) => <ComboBoxOption id={node.key}>{node.textValue}</ComboBoxOption>}
            </For>
          }
        >
          <For each={items()}>
            {(node) => {
              const value = getNodeValue(node);
              return value != null ? (local.children as Function)!(value) : null;
            }}
          </For>
        </Show>
      </ul>
    </Show>
  );
}

/**
 * An option in a combobox listbox.
 */
export function ComboBoxOption<T>(props: ComboBoxOptionProps<T>): JSX.Element {
  const [local, ariaProps] = splitProps(props, [
    "class",
    "style",
    "slot",
    "id",
    "item",
    "textValue",
    "onAction",
  ]);

  const stateContext = useContext(ComboBoxStateContext);
  const comboBoxContext = useContext(ComboBoxContext);
  if (!stateContext || !comboBoxContext) {
    throw new Error("ComboBoxOption must be used within a ComboBox");
  }
  const state = stateContext as ComboBoxState<T>;
  const listState = (comboBoxContext as ComboBoxContextValue<T>).listState;
  const optionId = () => {
    const listBoxId = getComboBoxData(state as ComboBoxState<unknown>)?.listBoxId;
    return listBoxId ? `${listBoxId}-option-${local.id}` : String(local.id);
  };

  createEffect(() => {
    const key = local.id;
    comboBoxContext?.registerOptionAction(key, local.onAction);
    onCleanup(() => {
      comboBoxContext?.registerOptionAction(key, undefined);
    });
  });

  // Create option aria props using ComboBoxState's ListState-compatible interface
  const optionAria = createOption<T>(
    {
      key: local.id,
      get optionId() {
        return optionId();
      },
      get isDisabled() {
        return ariaProps.isDisabled;
      },
      get "aria-label"() {
        return ariaProps["aria-label"];
      },
      shouldSelectOnPressUp: true,
      shouldFocusOnHover: true,
      shouldUseVirtualFocus: true,
      allowsDifferentPressOrigin: true,
      get onHoverStart() {
        return ariaProps.onHoverStart;
      },
      get onHoverEnd() {
        return ariaProps.onHoverEnd;
      },
      get onHoverChange() {
        return ariaProps.onHoverChange;
      },
      get onAction() {
        return local.onAction;
      },
    },
    listState,
  );

  const isOptionFocusVisible = () =>
    optionAria.isFocusVisible() ||
    (optionAria.isFocused() && (comboBoxContext?.isFocusVisible() ?? false));

  const renderValues = createMemo<ComboBoxOptionRenderProps>(() => ({
    isSelected: optionAria.isSelected(),
    isFocused: optionAria.isFocused(),
    isFocusVisible: isOptionFocusVisible(),
    isPressed: optionAria.isPressed(),
    isHovered: optionAria.isHovered(),
    isDisabled: optionAria.isDisabled(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-ComboBox-option",
    },
    renderValues,
  );

  const selectionIndicatorContext = createMemo<SelectionIndicatorContextValue>(() => ({
    isSelected: optionAria.isSelected,
  }));

  const cleanOptionProps = () => {
    const { ref: _ref1, ...rest } = optionAria.optionProps as Record<string, unknown>;
    return rest;
  };

  return (
    <SelectionIndicatorContext.Provider value={selectionIndicatorContext()}>
      <li
        {...cleanOptionProps()}
        class={renderProps.class()}
        style={renderProps.style()}
        data-selected={optionAria.isSelected() || undefined}
        data-focused={optionAria.isFocused() || undefined}
        data-focus-visible={isOptionFocusVisible() || undefined}
        data-pressed={optionAria.isPressed() || undefined}
        data-hovered={optionAria.isHovered() || undefined}
        data-disabled={optionAria.isDisabled() || undefined}
      >
        {renderProps.renderChildren()}
      </li>
    </SelectionIndicatorContext.Provider>
  );
}

export interface ComboBoxTagGroupProps {
  /** Render function for each selected item. */
  children: (item: { key: Key; label: string }) => JSX.Element;
  /** The CSS className for the container. */
  class?: string;
  /** The inline style for the container. */
  style?: JSX.CSSProperties;
}

/**
 * Renders selected items as tags in multi-select mode.
 */
export function ComboBoxTagGroup(props: ComboBoxTagGroupProps): JSX.Element {
  const context = useContext(ComboBoxContext);
  if (!context) {
    throw new Error("ComboBoxTagGroup must be used within a ComboBox");
  }

  const state = context.state;
  const items = createMemo(() =>
    state.selectedItems().map((node) => ({
      key: node.key,
      label: node.textValue,
    })),
  );

  return (
    <Show when={items().length > 0}>
      <div
        class={props.class ?? "solidaria-ComboBox-tagGroup"}
        style={props.style}
        role="group"
        aria-label="Selected items"
      >
        <For each={items()}>{(item) => props.children(item)}</For>
      </div>
    </Show>
  );
}

export interface ComboBoxTagProps {
  /** The item data. */
  item: { key: Key; label: string };
  /** Handler called when the tag remove button is clicked. */
  onRemove?: () => void;
  /** The children to render inside the tag. */
  children?: JSX.Element;
  /** The CSS className for the tag. */
  class?: string;
  /** The inline style for the tag. */
  style?: JSX.CSSProperties;
}

/**
 * A tag representing a selected item in a multi-select combobox.
 */
export function ComboBoxTag(props: ComboBoxTagProps): JSX.Element {
  const context = useContext(ComboBoxContext);
  if (!context) {
    throw new Error("ComboBoxTag must be used within a ComboBox");
  }

  const state = context.state;

  const handleRemove = () => {
    if (props.onRemove) {
      props.onRemove();
    } else {
      state.removeSelectedKey(props.item.key);
    }
  };

  return (
    <span
      class={props.class ?? "solidaria-ComboBox-tag"}
      style={props.style}
      data-key={String(props.item.key)}
    >
      {props.children ?? props.item.label}
      <button
        type="button"
        aria-label={`Remove ${props.item.label}`}
        onClick={handleRemove}
        class="solidaria-ComboBox-tag-remove"
        tabIndex={-1}
      >
        &#215;
      </button>
    </span>
  );
}

ComboBox.Input = ComboBoxInput;
ComboBox.Button = ComboBoxButton;
ComboBox.ListBox = ComboBoxListBox;
ComboBox.Option = ComboBoxOption;
ComboBox.Label = ComboBoxLabel;
ComboBox.Description = ComboBoxDescription;
ComboBox.ErrorMessage = ComboBoxErrorMessage;
ComboBox.TagGroup = ComboBoxTagGroup;
ComboBox.Tag = ComboBoxTag;

export { defaultContainsFilter };

function createComboBoxListStateAdapter<T>(state: ComboBoxState<T>): ListState<T> {
  const selectedKeys = createMemo(() => {
    if (state.selectionMode() === "multiple") {
      return state.selectedKeys();
    }
    const key = state.selectedKey();
    return key != null ? new Set<Key>([key]) : new Set<Key>();
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
    isFocused: state.isFocused,
    setFocused: state.setFocused,
    focusedKey: state.focusedKey,
    setFocusedKey: (key) => state.setFocusedKey(key ?? null),
    childFocusStrategy: () => null,
    selectionMode: state.selectionMode,
    selectionBehavior: () => "replace",
    disallowEmptySelection: () => true,
    selectedKeys,
    disabledKeys,
    disabledBehavior: () => "all",
    isEmpty: () => selectedKeys().size === 0,
    isSelectAll: () => false,
    isSelected: state.isSelected,
    isDisabled: state.isKeyDisabled,
    setSelectionBehavior: () => {},
    toggleSelection: (key) => state.select(key),
    replaceSelection: (key) => state.select(key),
    setSelectedKeys: (keys) => {
      const first = keys[Symbol.iterator]().next().value as Key | undefined;
      state.setSelectedKey(first ?? null);
    },
    selectAll: () => {},
    clearSelection: () => state.setSelectedKey(null),
    toggleSelectAll: () => {},
    extendSelection: (toKey) => state.select(toKey),
    select: (key) => state.select(key),
  };
}
