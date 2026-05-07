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
  createSignal,
  createUniqueId,
  splitProps,
  useContext,
  For,
  Show,
  untrack,
} from "solid-js";
import {
  createSelect,
  createHiddenSelect,
  createListBox,
  createOption,
  createHover,
  createInteractOutside,
  FocusScope,
  mergeProps,
  type AriaSelectProps,
  type AriaListBoxProps,
  type AriaOptionProps,
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

function getNativeSelectValidation(select: HTMLSelectElement): ValidationResult {
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
  /** Whether the trigger is disabled. */
  isDisabled: boolean;
}

export interface SelectTriggerProps extends SlotProps {
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
  const errorMessageId = createUniqueId();

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

  const { labelProps, triggerProps, valueProps, menuProps, isFocused, isFocusVisible, isOpen } =
    createSelect<T>(selectAriaProps, state);

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
    return filtered;
  });

  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const cleanLabelProps = () => {
    const { ref: _ref, ...rest } = labelProps as Record<string, unknown>;
    return rest;
  };
  const setRootRef = (el: HTMLDivElement) => {
    rootRef = el;
    assignRef(local.ref, el);
  };
  const isInvalid = createMemo(() => selectValidation().isInvalid);
  const triggerDescribedBy = () => {
    const ids = [
      (triggerProps as { "aria-describedby"?: string })["aria-describedby"],
      isInvalid() ? errorMessageId : undefined,
    ]
      .filter(Boolean)
      .join(" ")
      .split(" ")
      .filter(Boolean);
    return ids.length ? Array.from(new Set(ids)).join(" ") : undefined;
  };
  const triggerPropsWithValidation = () =>
    ({
      ...triggerProps,
      "aria-describedby": triggerDescribedBy(),
    }) as JSX.HTMLAttributes<HTMLElement>;
  const fieldErrorContext: FieldErrorContextValue = {
    get validation() {
      return selectValidation();
    },
    get errorMessageProps() {
      return { id: errorMessageId };
    },
  };
  const focusTrigger = () => {
    triggerRef?.focus();
  };
  const hasSelection = () =>
    state.selectionMode() === "multiple"
      ? state.selectedKeys() === "all" || (state.selectedKeys() as Set<Key>).size > 0
      : state.selectedKey() != null;
  const getSelectValidation = (select: HTMLSelectElement): ValidationResult => {
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

  const { containerProps, selectProps: hiddenSelectProps } = createHiddenSelect({
    state,
    name: stateProps.name,
    form: ariaProps.form,
    isRequired: ariaProps.isRequired,
    validationBehavior: "native",
    get isDisabled() {
      return resolveDisabled();
    },
  });
  const handleHiddenSelectInvalid: JSX.EventHandler<HTMLSelectElement, Event> = (event) => {
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
        <div {...containerProps}>
          <select
            {...hiddenSelectProps}
            name={hasSelection() ? undefined : stateProps.name}
            required={(ariaProps.isRequired && !hasSelection()) || undefined}
            onInvalid={handleHiddenSelectInvalid}
            onChange={handleHiddenSelectChange}
          >
            <Show when={state.selectionMode() !== "multiple"}>
              <option selected={state.selectedKey() == null} />
            </Show>
            <For each={stateProps.items}>
              {(item) => {
                const itemRecord = isObjectRecord(item) ? item : null;
                const fallbackKey =
                  itemRecord != null ? (toKey(itemRecord.key) ?? toKey(itemRecord.id)) : undefined;
                const key = stateProps.getKey?.(item) ?? fallbackKey ?? String(item);
                const fallbackTextValue =
                  itemRecord != null
                    ? (toTextValue(itemRecord.textValue) ?? toTextValue(itemRecord.label))
                    : undefined;
                const textValue =
                  stateProps.getTextValue?.(item) ?? fallbackTextValue ?? String(item);
                const selectedKeys = state.selectedKeys();
                const isSelected =
                  state.selectionMode() === "multiple"
                    ? selectedKeys === "all"
                      ? true
                      : (selectedKeys as Set<Key>).has(key)
                    : key === state.selectedKey();
                return (
                  <option value={String(key)} selected={isSelected}>
                    {textValue}
                  </option>
                );
              }}
            </For>
          </select>
          <Show when={state.selectionMode() === "multiple" && stateProps.name}>
            <For
              each={
                state.selectedKeys() === "all"
                  ? Array.from(state.collection()).map((item) => item.key)
                  : Array.from(state.selectedKeys() as Set<Key>)
              }
            >
              {(key) => (
                <input
                  type="hidden"
                  name={stateProps.name}
                  form={ariaProps.form}
                  value={String(key)}
                  disabled={resolveDisabled()}
                />
              )}
            </For>
          </Show>
          <Show
            when={
              state.selectionMode() !== "multiple" && stateProps.name && state.selectedKey() != null
            }
          >
            <input
              type="hidden"
              name={stateProps.name}
              form={ariaProps.form}
              value={String(state.selectedKey())}
              disabled={resolveDisabled()}
            />
          </Show>
        </div>
        <Show when={ariaProps.label}>
          <span {...cleanLabelProps()}>{ariaProps.label as JSX.Element}</span>
        </Show>
        {selectChildren}
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
    const renderedRootChildren = <RootChildren />;
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
          valueProps,
          labelProps,
          menuProps,
          get errorMessageProps() {
            return { id: errorMessageId };
          },
          get validation() {
            return selectValidation();
          },
          isOpen,
          isFocused,
          isFocusVisible,
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
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(SelectContext);
  if (!context) {
    throw new Error("SelectTrigger must be used within a Select");
  }
  const { isOpen, isFocused, isFocusVisible, state } = context;
  let triggerRef: HTMLButtonElement | undefined;
  const setTriggerRef = (el: HTMLButtonElement) => {
    triggerRef = el;
    context.setTriggerRef(el);
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
    isDisabled: state.isDisabled,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Select-trigger",
    },
    renderValues,
  );

  const cleanTriggerProps = () => {
    const { ref: _ref1, ...rest } = context.triggerProps as Record<string, unknown>;
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
      aria-label={triggerAriaProps()["aria-label"] as string | undefined}
      aria-labelledby={triggerAriaProps()["aria-labelledby"] as string | undefined}
      aria-haspopup="listbox"
      aria-expanded={isOpen()}
      aria-controls={isOpen() ? (menuAriaProps().id as string | undefined) : undefined}
      aria-disabled={state.isDisabled || undefined}
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

  const placeholder = () => local.placeholder ?? contextPlaceholder;

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
          ? new Intl.ListFormat(undefined, { style: "long", type: "conjunction" }).format(
              selectedItems.map((item) => item.textValue),
            )
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
      children: props.children ?? defaultSelectValueChildren,
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
    if (state.focusedKey() != null) {
      return;
    }
    const selectedKey = state.selectedKey();
    if (selectedKey != null && !state.collection().getItem(selectedKey)?.isDisabled) {
      state.setFocusedKey(selectedKey);
    }
  });

  let listBoxRef: HTMLUListElement | undefined;

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

  const { listBoxProps } = createListBox(
    {
      ...(menuProps as unknown as AriaListBoxProps),
      shouldSelectOnPressUp: true,
      shouldFocusOnHover: true,
      shouldSelectOnFocus: local.isInPopover === true ? false : undefined,
      get isDisabled() {
        return state.isDisabled;
      },
    },
    createSelectListStateAdapter(state),
  );

  const renderValues = createMemo<SelectListBoxRenderProps>(() => ({
    isFocused: state.isFocused(),
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
    const { ref: _ref2, ...rest } = listBoxProps as Record<string, unknown>;
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
        option.focus();
      }
    });
  });

  const listBox = () => (
    <ul
      ref={(el) => (listBoxRef = el)}
      {...domProps}
      {...cleanMenuProps()}
      {...cleanListBoxProps()}
      class={renderProps.class()}
      style={renderProps.style()}
      data-focused={state.isFocused() || undefined}
      data-empty={state.collection().size === 0 || undefined}
    >
      {state.collection().size === 0 && local.renderEmptyState ? (
        <li role="option" style={{ display: "contents" }} data-empty-state>
          {local.renderEmptyState()}
        </li>
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
    </ul>
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
  ]);

  const context = useContext(SelectStateContext);
  if (!context) {
    throw new Error("SelectOption must be used within a Select");
  }
  const state = context as SelectState<T>;
  const selectContext = useContext(SelectContext) as SelectContextValue<T> | null;

  const optionAria = createOption<T>(
    {
      key: local.id,
      get isDisabled() {
        return Boolean(ariaProps.isDisabled || selectContext?.isDisabled());
      },
      get "aria-label"() {
        return ariaProps["aria-label"] ?? local.textValue;
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
  );

  const renderValues = createMemo<SelectOptionRenderProps>(() => ({
    isSelected: optionAria.isSelected(),
    isFocused: optionAria.isFocused(),
    isFocusVisible: optionAria.isFocusVisible(),
    isPressed: optionAria.isPressed(),
    isHovered: optionAria.isHovered(),
    isDisabled: optionAria.isDisabled(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Select-option",
    },
    renderValues,
  );
  const hasPrimitiveLabel = () => {
    return typeof props.children === "string" || typeof props.children === "number";
  };

  const selectionIndicatorContext = createMemo<SelectionIndicatorContextValue>(() => ({
    isSelected: optionAria.isSelected,
  }));

  const cleanOptionProps = () => {
    const {
      ref: _ref1,
      "aria-describedby": _ariaDescribedby,
      ...rest
    } = optionAria.optionProps as Record<string, unknown>;
    if (!hasPrimitiveLabel() && rest["aria-label"] == null) {
      delete rest["aria-labelledby"];
    }
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
    }) as JSX.EventHandler<HTMLLIElement, MouseEvent>;
    return rest;
  };
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
      <li
        {...cleanOptionProps()}
        class={renderProps.class()}
        style={renderProps.style()}
        data-selected={optionAria.isSelected() || undefined}
        data-focused={optionAria.isFocused() || undefined}
        data-focus-visible={optionAria.isFocusVisible() || undefined}
        data-pressed={optionAria.isPressed() || undefined}
        data-hovered={optionAria.isHovered() || undefined}
        data-disabled={optionAria.isDisabled() || undefined}
      >
        {hasPrimitiveLabel() ? (
          <span {...optionAria.labelProps}>{renderProps.renderChildren()}</span>
        ) : (
          renderProps.renderChildren()
        )}
      </li>
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
    isFocused: state.isFocused,
    setFocused: state.setFocused,
    focusedKey: state.focusedKey,
    setFocusedKey: (key) => state.setFocusedKey(key ?? null),
    childFocusStrategy: () => null,
    selectionMode: () => state.selectionMode(),
    selectionBehavior: () => "replace",
    disallowEmptySelection: () => true,
    selectedKeys,
    disabledKeys,
    disabledBehavior: () => "all",
    isEmpty: () => selectedKeys().size === 0,
    isSelectAll: () => state.selectedKeys() === "all",
    isSelected: (key) => selectedKeys().has(key),
    isDisabled: state.isKeyDisabled,
    setSelectionBehavior: () => {},
    toggleSelection: (key) => {
      if (state.selectionMode() !== "multiple") {
        state.setSelectedKey(key);
        return;
      }
      const keys = state.selectedKeys();
      if (keys === "all") return;
      const next = new Set(keys);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      state.setSelectedKeys(next);
    },
    replaceSelection: (key) => state.setSelectedKey(key),
    setSelectedKeys: (keys) => state.setSelectedKeys(keys),
    selectAll: () => {},
    clearSelection: () =>
      state.selectionMode() === "multiple" ? state.setSelectedKeys([]) : state.setSelectedKey(null),
    toggleSelectAll: () => {},
    extendSelection: (toKey) => state.setSelectedKey(toKey),
    select: (key) =>
      state.selectionMode() === "multiple"
        ? state.setSelectedKeys([
            ...(state.selectedKeys() === "all" ? [] : (state.selectedKeys() as Set<Key>)),
            key,
          ])
        : state.setSelectedKey(key),
  };
}

Select.Trigger = SelectTrigger;
Select.Value = SelectValue;
Select.ListBox = SelectListBox;
Select.Option = SelectOption;
