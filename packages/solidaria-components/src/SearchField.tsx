/**
 * SearchField component for solidaria-components
 *
 * A pre-wired headless search field that combines state + aria hooks.
 * Port of react-aria-components/src/SearchField.tsx
 */

import {
  type JSX,
  createContext,
  createMemo,
  onCleanup,
  onMount,
  splitProps,
  useContext,
  Show,
} from "solid-js";
import {
  createSearchField,
  createFocusRing,
  createHover,
  createPress,
  type AriaSearchFieldProps,
} from "@proyecto-viviana/solidaria";
import { createSearchFieldState, type SearchFieldState } from "@proyecto-viviana/solid-stately";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";

export interface SearchFieldRenderProps {
  /** Whether the search field is empty. */
  isEmpty: boolean;
  /** Whether the search field is disabled. */
  isDisabled: boolean;
  /** Whether the search field is invalid. */
  isInvalid: boolean;
  /** Whether the search field is read-only. */
  isReadOnly: boolean;
  /** Whether the search field is required. */
  isRequired: boolean;
  /** The current value. */
  value: string;
}

export interface SearchFieldProps extends Omit<AriaSearchFieldProps, "label">, SlotProps {
  /** The current value (controlled). */
  value?: string;
  /** The default value (uncontrolled). */
  defaultValue?: string;
  /** Handler called when the value changes. */
  onChange?: (value: string) => void;
  /** Handler called when the user submits the search. */
  onSubmit?: (value: string) => void;
  /** Handler called when the field is cleared. */
  onClear?: () => void;
  /** A visible label for the search field. */
  label?: JSX.Element;
  /** The children of the component. */
  children?: RenderChildren<SearchFieldRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SearchFieldRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SearchFieldRenderProps>;
}

export interface SearchFieldInputRenderProps {
  /** Whether the input is focused. */
  isFocused: boolean;
  /** Whether the input has keyboard focus. */
  isFocusVisible: boolean;
  /** Whether the input is hovered. */
  isHovered: boolean;
  /** Whether the input is disabled. */
  isDisabled: boolean;
  /** Whether the input is invalid. */
  isInvalid: boolean;
}

export interface SearchFieldInputProps
  extends SlotProps, Omit<JSX.InputHTMLAttributes<HTMLInputElement>, "class" | "style"> {
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SearchFieldInputRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SearchFieldInputRenderProps>;
}

export interface SearchFieldClearButtonRenderProps {
  /** Whether the button is pressed. */
  isPressed: boolean;
  /** Whether the button is hovered. */
  isHovered: boolean;
  /** Whether the button is disabled. */
  isDisabled: boolean;
}

export interface SearchFieldClearButtonProps
  extends
    SlotProps,
    Omit<JSX.ButtonHTMLAttributes<HTMLButtonElement>, "class" | "style" | "children"> {
  /** The children of the button. */
  children?: RenderChildren<SearchFieldClearButtonRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<SearchFieldClearButtonRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<SearchFieldClearButtonRenderProps>;
}

interface SearchFieldContextValue {
  state: SearchFieldState;
  inputProps: JSX.InputHTMLAttributes<HTMLInputElement>;
  clearButtonProps: {
    "aria-label": string;
    tabIndex: number;
    disabled?: boolean;
    onMouseDown: (e: MouseEvent) => void;
    onClick: () => void;
  };
  labelProps: JSX.HTMLAttributes<HTMLElement>;
  descriptionProps: JSX.HTMLAttributes<HTMLElement>;
  errorMessageProps: JSX.HTMLAttributes<HTMLElement>;
  isDisabled: boolean;
  isInvalid: boolean;
  isRequired: boolean;
  isReadOnly: boolean;
  setInputRef: (el: HTMLInputElement) => void;
}

export const SearchFieldContext = createContext<SearchFieldContextValue | null>(null);

function eventWithCurrentTarget<T extends HTMLElement>(event: Event, element: T): Event {
  return new Proxy(event, {
    get(target, property, receiver) {
      if (property === "target" || property === "currentTarget") {
        return element;
      }

      const value = Reflect.get(target, property, receiver);
      return typeof value === "function" ? value.bind(target) : value;
    },
  });
}

function clearDelegatedTextEntryHandlers(element: HTMLElement) {
  const delegatedElement = element as HTMLElement & {
    $$input?: unknown;
    $$change?: unknown;
  };
  delete delegatedElement.$$input;
  delete delegatedElement.$$change;
}

/**
 * A search field allows a user to enter and clear a search query.
 */
export function SearchField(props: SearchFieldProps): JSX.Element {
  const [local, stateProps, ariaProps, rest] = splitProps(
    props,
    ["children", "class", "style", "slot"],
    ["value", "defaultValue", "onChange", "onSubmit", "onClear"],
    [
      "label",
      "aria-label",
      "aria-labelledby",
      "aria-describedby",
      "isDisabled",
      "isReadOnly",
      "isRequired",
      "isInvalid",
      "description",
      "errorMessage",
      "id",
      "autoFocus",
      "name",
      "placeholder",
      "autoComplete",
      "inputMode",
      "autoCorrect",
      "autoCapitalize",
      "spellCheck",
      "maxLength",
      "minLength",
      "pattern",
      "onFocus",
      "onBlur",
      "onFocusChange",
      "onKeyDown",
      "onKeyUp",
      "onCopy",
      "onCut",
      "onPaste",
      "onCompositionStart",
      "onCompositionEnd",
      "onCompositionUpdate",
      "onSelect",
      "onBeforeInput",
      "onInput",
    ],
  );

  const state = createSearchFieldState({
    get value() {
      return stateProps.value;
    },
    get defaultValue() {
      return stateProps.defaultValue;
    },
    get onChange() {
      return stateProps.onChange;
    },
  });

  let inputRef: HTMLInputElement | undefined;
  const setInputRef = (el: HTMLInputElement) => {
    inputRef = el;
  };

  const searchFieldAria = createSearchField(
    {
      get isDisabled() {
        return ariaProps.isDisabled;
      },
      get isReadOnly() {
        return ariaProps.isReadOnly;
      },
      get isRequired() {
        return ariaProps.isRequired;
      },
      get isInvalid() {
        return ariaProps.isInvalid;
      },
      get label() {
        return ariaProps.label;
      },
      get "aria-label"() {
        return ariaProps["aria-label"];
      },
      get "aria-labelledby"() {
        return ariaProps["aria-labelledby"];
      },
      get "aria-describedby"() {
        return ariaProps["aria-describedby"];
      },
      get description() {
        return ariaProps.description;
      },
      get errorMessage() {
        return ariaProps.errorMessage;
      },
      get placeholder() {
        return ariaProps.placeholder;
      },
      get name() {
        return ariaProps.name;
      },
      get autoFocus() {
        return ariaProps.autoFocus;
      },
      get autoComplete() {
        return ariaProps.autoComplete;
      },
      get inputMode() {
        return ariaProps.inputMode;
      },
      get autoCorrect() {
        return ariaProps.autoCorrect;
      },
      get autoCapitalize() {
        return ariaProps.autoCapitalize;
      },
      get spellCheck() {
        return ariaProps.spellCheck;
      },
      get maxLength() {
        return ariaProps.maxLength;
      },
      get minLength() {
        return ariaProps.minLength;
      },
      get pattern() {
        return ariaProps.pattern;
      },
      get onFocus() {
        return ariaProps.onFocus;
      },
      get onBlur() {
        return ariaProps.onBlur;
      },
      get onFocusChange() {
        return ariaProps.onFocusChange;
      },
      get onKeyDown() {
        return ariaProps.onKeyDown;
      },
      get onKeyUp() {
        return ariaProps.onKeyUp;
      },
      get onCopy() {
        return ariaProps.onCopy;
      },
      get onCut() {
        return ariaProps.onCut;
      },
      get onPaste() {
        return ariaProps.onPaste;
      },
      get onCompositionStart() {
        return ariaProps.onCompositionStart;
      },
      get onCompositionEnd() {
        return ariaProps.onCompositionEnd;
      },
      get onCompositionUpdate() {
        return ariaProps.onCompositionUpdate;
      },
      get onSelect() {
        return ariaProps.onSelect;
      },
      get onBeforeInput() {
        return ariaProps.onBeforeInput;
      },
      get onInput() {
        return ariaProps.onInput;
      },
      get onSubmit() {
        return stateProps.onSubmit;
      },
      get onClear() {
        return stateProps.onClear;
      },
    },
    state,
    () => inputRef ?? null,
  );

  const renderValues = createMemo<SearchFieldRenderProps>(() => ({
    isEmpty: state.value() === "",
    isDisabled: ariaProps.isDisabled ?? false,
    isInvalid: searchFieldAria.isInvalid ?? false,
    isRequired: ariaProps.isRequired ?? false,
    isReadOnly: ariaProps.isReadOnly ?? false,
    value: state.value(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-SearchField",
    },
    renderValues,
  );
  const childRenderValues: SearchFieldRenderProps = {
    get isEmpty() {
      return state.value() === "";
    },
    get isDisabled() {
      return ariaProps.isDisabled ?? false;
    },
    get isInvalid() {
      return searchFieldAria.isInvalid ?? false;
    },
    get isRequired() {
      return ariaProps.isRequired ?? false;
    },
    get isReadOnly() {
      return ariaProps.isReadOnly ?? false;
    },
    get value() {
      return state.value();
    },
  };

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  const contextValue: SearchFieldContextValue = {
    state,
    get inputProps() {
      return searchFieldAria.inputProps;
    },
    get clearButtonProps() {
      return searchFieldAria.clearButtonProps;
    },
    get labelProps() {
      return searchFieldAria.labelProps as JSX.HTMLAttributes<HTMLElement>;
    },
    get descriptionProps() {
      return searchFieldAria.descriptionProps;
    },
    get errorMessageProps() {
      return searchFieldAria.errorMessageProps;
    },
    get isDisabled() {
      return ariaProps.isDisabled ?? false;
    },
    get isInvalid() {
      return searchFieldAria.isInvalid ?? false;
    },
    get isRequired() {
      return ariaProps.isRequired ?? false;
    },
    get isReadOnly() {
      return ariaProps.isReadOnly ?? false;
    },
    setInputRef,
  };
  const fieldChildren = () => {
    const children = local.children;
    return typeof children === "function" ? children(childRenderValues) : children;
  };

  return (
    <SearchFieldContext.Provider value={contextValue}>
      <div
        {...domProps()}
        class={renderProps.class()}
        style={renderProps.style()}
        data-empty={state.value() === "" || undefined}
        data-disabled={ariaProps.isDisabled || undefined}
        data-invalid={searchFieldAria.isInvalid || undefined}
        data-required={ariaProps.isRequired || undefined}
        data-readonly={ariaProps.isReadOnly || undefined}
      >
        {fieldChildren()}
      </div>
    </SearchFieldContext.Provider>
  );
}

/**
 * The label for a search field.
 */
export function SearchFieldLabel(props: {
  children?: JSX.Element;
  class?: string;
  style?: JSX.CSSProperties;
}): JSX.Element {
  const context = useContext(SearchFieldContext);
  if (!context) {
    throw new Error("SearchFieldLabel must be used within a SearchField");
  }

  const cleanLabelProps = () => {
    const { ref: _ref, ...rest } = context.labelProps as Record<string, unknown>;
    return rest;
  };

  return (
    <label
      {...cleanLabelProps()}
      class={props.class ?? "solidaria-SearchField-label"}
      style={props.style}
    >
      {props.children}
    </label>
  );
}

/**
 * The input element for a search field.
 */
export function SearchFieldInput(props: SearchFieldInputProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot"]);
  let inputElement: HTMLInputElement | undefined;

  const context = useContext(SearchFieldContext);
  if (!context) {
    throw new Error("SearchFieldInput must be used within a SearchField");
  }

  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return context.isDisabled;
    },
  });

  const renderValues = createMemo<SearchFieldInputRenderProps>(() => ({
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isHovered: isHovered(),
    isDisabled: context.isDisabled,
    isInvalid: context.isInvalid,
  }));

  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-SearchField-input",
    },
    renderValues,
  );

  const cleanInputProps = () => {
    const { ref: _ref, ...rest } = context.inputProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };

  const mergedInputProps = () =>
    ({
      ...domProps,
      ...cleanInputProps(),
      ...cleanFocusProps(),
      ...cleanHoverProps(),
    }) as Record<string, unknown>;

  onMount(() => {
    const element = inputElement;
    if (!element) {
      return;
    }

    const inputHandler = (event: Event) => {
      const handler = mergedInputProps().onInput as
        | JSX.EventHandler<HTMLInputElement, InputEvent>
        | undefined;
      handler?.(
        eventWithCurrentTarget(event, element) as InputEvent & {
          currentTarget: HTMLInputElement;
          target: Element;
        },
      );
      clearDelegatedTextEntryHandlers(element);
      event.stopPropagation();
    };
    const changeHandler = (event: Event) => {
      const handler = mergedInputProps().onChange as
        | JSX.EventHandler<HTMLInputElement, Event>
        | undefined;
      handler?.(
        eventWithCurrentTarget(event, element) as Event & {
          currentTarget: HTMLInputElement;
          target: Element;
        },
      );
      clearDelegatedTextEntryHandlers(element);
      event.stopPropagation();
    };

    element.addEventListener("input", inputHandler);
    element.addEventListener("change", changeHandler);
    clearDelegatedTextEntryHandlers(element);
    onCleanup(() => {
      element.removeEventListener("input", inputHandler);
      element.removeEventListener("change", changeHandler);
    });
  });

  return (
    <input
      {...mergedInputProps()}
      ref={(element) => {
        inputElement = element;
        context.setInputRef(element);
        const ref = (domProps as { ref?: unknown }).ref;
        if (typeof ref === "function") {
          ref(element);
        }
      }}
      class={renderProps.class()}
      style={renderProps.style()}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-hovered={isHovered() || undefined}
      data-disabled={context.isDisabled || undefined}
      data-invalid={context.isInvalid || undefined}
    />
  );
}

/**
 * The clear button for a search field.
 */
export function SearchFieldClearButton(props: SearchFieldClearButtonProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["class", "style", "slot", "children"]);

  const context = useContext(SearchFieldContext);
  if (!context) {
    throw new Error("SearchFieldClearButton must be used within a SearchField");
  }

  const isDisabled = () => context.isDisabled || context.isReadOnly;
  const isEmpty = () => context.state.value() === "";
  const clear = () => {
    if (!isDisabled() && !isEmpty()) {
      context.clearButtonProps.onClick();
    }
  };

  const { isPressed, pressProps } = createPress({
    get isDisabled() {
      return context.isDisabled || context.isReadOnly;
    },
    onClick: clear,
    onPress: clear,
  });

  const { isHovered, hoverProps } = createHover({
    get isDisabled() {
      return context.isDisabled || context.isReadOnly;
    },
  });

  const renderValues = createMemo<SearchFieldClearButtonRenderProps>(() => ({
    isPressed: isPressed(),
    isHovered: isHovered(),
    isDisabled: isDisabled(),
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-SearchField-clear",
    },
    renderValues,
  );

  const cleanPressProps = () => {
    const { ref: _ref, ...rest } = pressProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };

  return (
    <Show when={!isEmpty()}>
      <button
        {...domProps}
        type="button"
        aria-label={context.clearButtonProps["aria-label"]}
        tabIndex={context.clearButtonProps.tabIndex}
        disabled={context.clearButtonProps.disabled}
        onMouseDown={context.clearButtonProps.onMouseDown}
        {...cleanPressProps()}
        onPointerUp={clear}
        onMouseUp={clear}
        onClick={clear}
        {...cleanHoverProps()}
        class={renderProps.class()}
        style={renderProps.style()}
        data-pressed={isPressed() || undefined}
        data-hovered={isHovered() || undefined}
        data-disabled={isDisabled() || undefined}
      >
        {renderProps.renderChildren()}
      </button>
    </Show>
  );
}

SearchField.Label = SearchFieldLabel;
SearchField.Input = SearchFieldInput;
SearchField.ClearButton = SearchFieldClearButton;
