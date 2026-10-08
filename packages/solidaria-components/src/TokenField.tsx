/*
 * Copyright 2026 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/TokenField.tsx

/**
 * Token field components for solidaria-components.
 *
 * A token field allows users to enter text with inline tokens.
 */

import { createContext, createMemo, createSignal, onCleanup, useContext } from "solid-js";
import type { Context } from "solid-js";
import type { JSX } from "@solidjs/web";
import {
  createHideableComponent,
  createHover,
  createFocusRing,
  createToken,
  createTokenField,
  mergeProps,
  setTokenFieldSelection,
  tokenFieldPositionToDOMRange,
  type AriaTokenFieldProps,
} from "@proyecto-viviana/solidaria";
import {
  createTokenFieldState,
  TokenFieldValue,
  type Position,
  type SelectedRange,
  type TextSegment,
  type TokenFieldSegment,
  type TokenFieldState,
  type TokenFieldValueOptions,
  type TokenSegment,
} from "@proyecto-viviana/solid-stately";

export {
  TokenFieldValue,
  type Position,
  type SelectedRange,
  type TextSegment,
  type TokenFieldSegment,
  type TokenFieldValueOptions,
  type TokenSegment,
};
export { setTokenFieldSelection, tokenFieldPositionToDOMRange };
import { LabelContext } from "./Label";
import { TextContext } from "./Text";
import { FieldInputContext, type TextFieldContextValue } from "./TextField";
import { splitProps } from "@proyecto-viviana/solidaria/utils";
import {
  Provider,
  type ClassNameOrFunction,
  type ContextValue,
  type RenderChildren,
  type SlotProps,
  type StyleOrFunction,
  assignRef,
  filterDOMProps,
  type RefLike,
  type SlottedContextValue,
  useContextProps,
  useRenderProps,
  useSlot,
  useSlottedContext,
  dataAttr,
} from "./utils";

export interface TokenFieldRenderProps {
  isDisabled: boolean;
  isReadOnly: boolean;
}

export interface TokenFieldProps<T extends TokenFieldValue = TokenFieldValue>
  extends Omit<AriaTokenFieldProps<T>, "class" | "style" | "children">, SlotProps {
  children?: RenderChildren<TokenFieldRenderProps>;
  class?: ClassNameOrFunction<TokenFieldRenderProps>;
  style?: StyleOrFunction<TokenFieldRenderProps>;
  ref?: RefLike<HTMLDivElement>;
}

export interface TokenInputRenderProps {
  isHovered: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
  isDisabled: boolean;
  isReadOnly: boolean;
}

export interface TokenInputProps<T extends TokenFieldValue = TokenFieldValue> extends SlotProps {
  children: (segment: TokenSegment<T extends TokenFieldValue<infer V> ? V : never>) => JSX.Element;
  class?: ClassNameOrFunction<TokenInputRenderProps>;
  style?: StyleOrFunction<TokenInputRenderProps>;
  ref?: RefLike<HTMLDivElement>;
}

interface TokenInputContextValue<T extends TokenFieldValue = TokenFieldValue> {
  tokenFieldProps: JSX.HTMLAttributes<HTMLDivElement>;
  state: TokenFieldState<T>;
  isDisabled: boolean;
  isReadOnly: boolean;
  autocompleteProps?: JSX.HTMLAttributes<HTMLDivElement>;
  setInputRef: (el: HTMLDivElement | null) => void;
}

export const TokenFieldContext = createContext<ContextValue<TokenFieldProps, HTMLDivElement>>(null);
const TokenInputContext = createContext<TokenInputContextValue | null>(null);

/**
 * A token field allows users to enter text with inline tokens.
 */
export const TokenField = createHideableComponent(function TokenField<
  T extends TokenFieldValue = TokenFieldValue,
>(props: TokenFieldProps<T>): JSX.Element {
  const [merged, setOuterRef] = useContextProps(
    props,
    props.ref,
    TokenFieldContext as Context<ContextValue<TokenFieldProps<T>, HTMLDivElement>>,
  );
  const [local, rest] = splitProps(merged, [
    "children",
    "class",
    "style",
    "slot",
    "ref",
    "isDisabled",
    "isReadOnly",
    "onChange",
    "role",
  ]);
  const [labelRef, hasLabel] = useSlot(!merged["aria-label"] && !merged["aria-labelledby"]);

  const fieldCtx = useSlottedContext(
    FieldInputContext as unknown as Context<SlottedContextValue<TextFieldContextValue>>,
    merged.slot,
  );
  const [inputRef, setInputRef] = createSignal<HTMLDivElement | null>(null);

  const isDisabled = () => local.isDisabled || false;
  const isReadOnly = () => local.isReadOnly || false;

  const state = createTokenFieldState<T>({
    get value() {
      return merged.value;
    },
    get defaultValue() {
      return merged.defaultValue;
    },
    onChange: (value) => {
      local.onChange?.(value);
      const onAutocompleteChange = (fieldCtx as { onChange?: (value: string) => void } | null)
        ?.onChange;
      onAutocompleteChange?.(value.toString());
    },
  });

  // Spread reads every getter. Solid children getters instantiate the tree, so
  // copying `children` here would mount TokenInput before Provider sets context.
  // `value` / `onChange` stay on the state hook; spreading them into createField
  // subscribes the render memo and remounts the textbox on every edit.
  const ariaInput: Record<string, unknown> = {};
  const skipAriaProp = new Set([
    "children",
    "class",
    "style",
    "ref",
    "value",
    "defaultValue",
    "onChange",
  ]);
  for (const key of Object.keys(merged)) {
    if (skipAriaProp.has(key)) {
      continue;
    }
    const descriptor = Object.getOwnPropertyDescriptor(merged, key);
    if (descriptor) {
      Object.defineProperty(ariaInput, key, descriptor);
    }
  }
  Object.defineProperty(ariaInput, "label", {
    enumerable: true,
    configurable: true,
    // Same internal slot flag RAC passes into useTokenField. Not a public prop.
    get: () => hasLabel(),
  });
  Object.defineProperty(ariaInput, "role", {
    enumerable: true,
    configurable: true,
    get: () =>
      local.role ||
      ((fieldCtx as { inputProps?: { role?: string } } | null)?.inputProps?.role as
        | AriaTokenFieldProps["role"]
        | undefined) ||
      "textbox",
  });

  const aria = createTokenField(ariaInput as AriaTokenFieldProps<T>, state, () => inputRef());

  const renderValues = createMemo<TokenFieldRenderProps>(() => ({
    isDisabled: isDisabled(),
    isReadOnly: isReadOnly(),
  }));
  const renderProps = useRenderProps(
    {
      get children() {
        return local.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-TokenField",
    },
    renderValues,
  );
  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );
  // Built outside the JSX memo. Spreading aria.* there subscribes the field
  // render to slot ids and replaces the hydrated nodes when those ids settle.
  const labelContextValue = {
    get id() {
      return (aria.labelProps as { id?: string }).id;
    },
    get onClick() {
      return (aria.labelProps as { onClick?: () => void }).onClick;
    },
    elementType: "span" as const,
    ref: labelRef,
  };
  const textContextValue = {
    slots: {
      get description() {
        return aria.descriptionProps;
      },
    },
  };
  const tokenInputContextValue = {
    get tokenFieldProps() {
      return aria.tokenFieldProps;
    },
    state,
    get isDisabled() {
      return isDisabled();
    },
    get isReadOnly() {
      return isReadOnly();
    },
    autocompleteProps: fieldCtx as JSX.HTMLAttributes<HTMLDivElement> | undefined,
    setInputRef,
  };

  return (
    <div
      {...domProps()}
      ref={(el) => {
        setOuterRef(el);
        assignRef(local.ref, el);
      }}
      slot={local.slot || undefined}
      data-disabled={dataAttr(isDisabled())}
      data-readonly={dataAttr(isReadOnly())}
      class={renderProps.class()}
      style={renderProps.style()}
    >
      <Provider
        values={
          [
            [LabelContext, labelContextValue],
            [TextContext, textContextValue],
            [TokenInputContext, tokenInputContextValue],
          ] as Array<[Context<unknown>, unknown]>
        }
      >
        {renderProps.renderChildren()}
      </Provider>
    </div>
  );
}) as (props: TokenFieldProps) => JSX.Element;

/**
 * A token input represents the editable area within a token field.
 */
export function TokenInput<T extends TokenFieldValue = TokenFieldValue>(
  props: TokenInputProps<T>,
): JSX.Element {
  const context = useContext(TokenInputContext);
  if (!context) {
    throw new Error("TokenInput must be used within a TokenField");
  }

  const [local, rest] = splitProps(props, ["children", "class", "style", "slot", "ref"]);
  const { isHovered, hoverProps } = createHover({});
  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const renderValues = createMemo<TokenInputRenderProps>(() => ({
    isHovered: isHovered(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDisabled: context.isDisabled,
    isReadOnly: context.isReadOnly,
  }));
  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-TokenInput",
    },
    renderValues,
  );
  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );
  const displayed = createMemo((prev: readonly TokenFieldSegment[] | undefined) => {
    if (context.state.isComposing() && prev) {
      return prev;
    }
    return context.state.value().segments;
  });
  let removeSelectionStyle: (() => void) | undefined;
  onCleanup(() => {
    removeSelectionStyle?.();
    removeSelectionStyle = undefined;
  });
  const cleanFocusProps = () => {
    const { ref: _ref, ...restFocus } = focusProps as Record<string, unknown>;
    return restFocus;
  };

  return (
    <div
      {...mergeProps(
        domProps(),
        cleanFocusProps(),
        hoverProps as Record<string, unknown>,
        context.tokenFieldProps as Record<string, unknown>,
        (context.autocompleteProps as Record<string, unknown> | undefined) ?? {},
      )}
      ref={(el) => {
        context.setInputRef(el);
        assignRef(local.ref, el);
        removeSelectionStyle?.();
        removeSelectionStyle = undefined;
        if (!el) {
          return;
        }
        // Solid calls the ref before the node is inserted. Installing the
        // adopted sheet then sees a document-less root and returns. Retry on
        // a microtask once the node is connected, still from this ref.
        const install = () => {
          if (!el.isConnected) {
            return;
          }
          const cleanup = insertSelectionStyle(el);
          removeSelectionStyle = typeof cleanup === "function" ? cleanup : undefined;
        };
        if (el.isConnected) {
          install();
        } else {
          queueMicrotask(install);
        }
      }}
      slot={local.slot || undefined}
      data-focused={dataAttr(isFocused())}
      data-focus-visible={dataAttr(isFocusVisible())}
      data-disabled={dataAttr(context.isDisabled)}
      data-readonly={dataAttr(context.isReadOnly)}
      class={renderProps.class()}
      style={{
        ...(renderProps.style() as JSX.CSSProperties | undefined),
        ...((context.tokenFieldProps.style as JSX.CSSProperties | undefined) ?? {}),
      }}
    >
      {displayed().map((segment) => {
        if (segment.type === "token") {
          return (
            <span data-react-aria-token="">
              {"\u200b"}
              {local.children(segment as TokenSegment)}
              {"\u200b"}
            </span>
          );
        }
        return segment.text;
      })}
      {displayed().at(-1)?.text.endsWith("\n") ? <br /> : null}
    </div>
  );
}

export interface TokenRenderProps {
  isSelected: boolean;
  isDisabled: boolean;
}

export interface TokenProps extends SlotProps {
  children?: RenderChildren<TokenRenderProps>;
  class?: ClassNameOrFunction<TokenRenderProps>;
  style?: StyleOrFunction<TokenRenderProps>;
  ref?: RefLike<HTMLSpanElement>;
}

/**
 * A token represents an inline segment within a token field.
 */
export function Token(props: TokenProps): JSX.Element {
  const context = useContext(TokenInputContext);
  if (!context) {
    throw new Error("Token must be used within a TokenField");
  }

  const [local, rest] = splitProps(props, ["children", "class", "style", "slot", "ref"]);
  const [tokenRef, setTokenRef] = createSignal<HTMLSpanElement | null>(null);
  const aria = createToken({}, context.state, () => tokenRef());

  const renderValues = createMemo<TokenRenderProps>(() => ({
    isSelected: aria.isSelected(),
    isDisabled: context.isDisabled,
  }));
  const renderProps = useRenderProps(
    {
      get children() {
        return local.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Token",
    },
    renderValues,
  );
  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  return (
    <span
      {...mergeProps(domProps(), aria.tokenProps as Record<string, unknown>)}
      ref={(el) => {
        setTokenRef(el);
        assignRef(local.ref, el);
      }}
      slot={local.slot || undefined}
      data-selected={dataAttr(aria.isSelected())}
      data-disabled={dataAttr(context.isDisabled)}
      class={renderProps.class()}
      style={{
        ...(renderProps.style() as JSX.CSSProperties | undefined),
        ...((aria.tokenProps.style as JSX.CSSProperties | undefined) ?? {}),
      }}
    >
      {renderProps.renderChildren()}
    </span>
  );
}

// Inserts a stylesheet into the document or shadow root that hides native selection on tokens.
function insertSelectionStyle(el: HTMLDivElement | null): (() => void) | void {
  if (typeof CSSStyleSheet !== "function" || !el) {
    return;
  }

  const root = el.getRootNode();
  const isDocument = root.nodeType === Node.DOCUMENT_NODE;
  const isShadow = root.nodeType === Node.DOCUMENT_FRAGMENT_NODE && "host" in root;
  if (!isDocument && !isShadow) {
    return;
  }

  const styleRoot = root as Document | ShadowRoot;
  if (!styleRoot.adoptedStyleSheets) {
    return;
  }

  const sym = Symbol.for("react-aria-token-style");
  const sheets = styleRoot.adoptedStyleSheets as Array<CSSStyleSheet & Record<symbol, boolean>>;
  if (sheets.some((sheet) => sheet[sym])) {
    return;
  }

  const style = new CSSStyleSheet() as CSSStyleSheet & Record<symbol, boolean>;
  style[sym] = true;
  // Firefox ignores a fully transparent selection color, so use a nearly transparent one.
  style.replaceSync(
    "[data-react-aria-token]::selection,[data-react-aria-token]>*::selection{background:#ffffff01}",
  );
  sheets.push(style);

  return () => {
    const index = sheets.indexOf(style);
    if (index >= 0) {
      sheets.splice(index, 1);
    }
  };
}
