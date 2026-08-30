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

import {
  type JSX,
  type Context,
  createContext,
  createMemo,
  createSignal,
  splitProps,
  useContext,
} from "solid-js";
import {
  createHideableComponent,
  createHover,
  createFocusRing,
  createToken,
  createTokenField,
  mergeProps,
  type AriaTokenFieldProps,
} from "@proyecto-viviana/solidaria";
import {
  createTokenFieldState,
  TokenFieldValue,
  type TokenFieldState,
  type TokenSegment,
} from "@proyecto-viviana/solid-stately";
import { LabelContext } from "./Label";
import { TextContext } from "./Text";
import { FieldInputContext, type TextFieldContextValue } from "./TextField";
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
  const [labelRef] = useSlot(!merged["aria-label"] && !merged["aria-labelledby"]);

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

  const aria = createTokenField(
    {
      ...merged,
      get role() {
        return (
          local.role ||
          ((fieldCtx as { inputProps?: { role?: string } } | null)?.inputProps?.role as
            | AriaTokenFieldProps["role"]
            | undefined) ||
          "textbox"
        );
      },
    },
    state,
    () => inputRef(),
  );

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

  return (
    <div
      {...domProps()}
      ref={(el) => {
        setOuterRef(el);
        assignRef(local.ref, el);
      }}
      slot={local.slot || undefined}
      data-disabled={isDisabled() || undefined}
      data-readonly={isReadOnly() || undefined}
      class={renderProps.class()}
      style={renderProps.style()}
    >
      <Provider
        values={
          [
            [
              LabelContext,
              {
                ...aria.labelProps,
                elementType: "span",
                ref: labelRef,
              },
            ],
            [
              TextContext,
              {
                slots: {
                  description: aria.descriptionProps,
                },
              },
            ],
            [
              TokenInputContext,
              {
                tokenFieldProps: aria.tokenFieldProps,
                state,
                isDisabled: isDisabled(),
                isReadOnly: isReadOnly(),
                autocompleteProps: fieldCtx as JSX.HTMLAttributes<HTMLDivElement> | undefined,
                setInputRef,
              },
            ],
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
      }}
      slot={local.slot || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-disabled={context.isDisabled || undefined}
      data-readonly={context.isReadOnly || undefined}
      class={renderProps.class()}
      style={{
        ...(renderProps.style() as JSX.CSSProperties | undefined),
        ...((context.tokenFieldProps.style as JSX.CSSProperties | undefined) ?? {}),
      }}
    >
      {context.state.value().segments.map((segment) => {
        if (segment.type === "token") {
          return (
            <span>
              {"\u200b"}
              {local.children(segment as TokenSegment)}
              {"\u200b"}
            </span>
          );
        }
        return segment.text;
      })}
      {context.state.value().segments.at(-1)?.text.endsWith("\n") ? <br /> : null}
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
      data-selected={aria.isSelected() || undefined}
      data-disabled={context.isDisabled || undefined}
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
