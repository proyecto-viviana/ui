// @ts-nocheck
import {
  type JSX,
  createContext,
  createSignal,
  mergeProps,
  splitProps,
  Show,
  useContext,
} from "solid-js";
import {
  SearchField as HeadlessSearchField,
  SearchFieldLabel as HeadlessSearchFieldLabel,
  SearchFieldInput as HeadlessSearchFieldInput,
  SearchFieldClearButton as HeadlessSearchFieldClearButton,
  SearchFieldContext as HeadlessSearchFieldContext,
  type SearchFieldProps as HeadlessSearchFieldProps,
  type SearchFieldRenderProps,
  type SearchFieldClearButtonRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../style";
import { baseColor, focusRing, fontRelative, style } from "../style" with { type: "macro" };
import { css } from "../style/style-macro" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
import {
  control,
  controlFont,
  controlSize,
  field,
  fieldInput,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { CenterBaseline } from "../icon/center-baseline";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import SearchIcon from "../icon/s2wf-icons/SearchIcon";
import CrossIcon from "../icon/ui-icons/Cross";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import { useProviderProps } from "../provider";
import { useFormProps, useIsInForm } from "../form";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type SearchFieldSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2SearchFieldSize = "S" | "M" | "L" | "XL";
export type SearchFieldVariant = "outline" | "filled";
export type SearchFieldLabelPosition = "top" | "side";
export type SearchFieldLabelAlign = "start" | "end";
export type SearchFieldNecessityIndicator = "icon" | "label";

export interface SearchFieldProps extends Omit<
  HeadlessSearchFieldProps,
  "class" | "style" | "children" | "label" | "slot" | "ref"
> {
  /** The size of the search field. */
  size?: SearchFieldSize;
  /** Legacy visual variant. S2 SearchFields do not expose visual variants. */
  variant?: SearchFieldVariant;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Label text for the input. */
  label?: JSX.Element;
  /** Description text shown below the input. */
  description?: JSX.Element;
  /** Error message shown when invalid. */
  errorMessage?: JSX.Element;
  /** Position of the label relative to the input. */
  labelPosition?: SearchFieldLabelPosition;
  /** Text alignment for side labels. */
  labelAlign?: SearchFieldLabelAlign;
  /** Whether required fields show an icon or text label. */
  necessityIndicator?: SearchFieldNecessityIndicator;
  /** A contextual help element to place next to the label. */
  contextualHelp?: JSX.Element;
  /** Slot name when used in a Spectrum context. */
  slot?: string | null;
  /** Ref for the search field root element. */
  ref?: RefLike<HTMLDivElement>;
}

interface SearchFieldStyleProps extends SearchFieldRenderProps {
  size?: S2SearchFieldSize;
  labelPosition?: SearchFieldLabelPosition;
  labelAlign?: SearchFieldLabelAlign;
  isFocusWithin?: boolean;
  isStaticColor?: boolean;
  isInForm?: boolean;
  isQuiet?: boolean;
}

interface ClearButtonStyleProps extends SearchFieldClearButtonRenderProps {
  size?: S2SearchFieldSize;
  isFocusVisible?: boolean;
  isStaticColor?: boolean;
}

export const SearchFieldContext = createContext<SpectrumContextValue<SearchFieldProps>>(null);

const hideNativeSearchCancelButton = css(
  "&::-webkit-search-cancel-button { display: none }",
) as StyleString;

const searchFieldRoot = style<SearchFieldStyleProps>(
  {
    ...field(),
    "--iconMargin": {
      type: "marginTop",
      value: fontRelative(-2),
    },
    color: {
      default: baseColor("neutral"),
      isDisabled: {
        default: "disabled",
        forcedColors: "GrayText",
      },
    },
  },
  getAllowedOverrides(),
);

const searchFieldLabelWrapper = style<SearchFieldStyleProps>({
  gridArea: "label",
  display: "inline",
  textAlign: {
    labelAlign: {
      start: "start",
      end: "end",
    },
  },
  paddingBottom: {
    labelPosition: {
      top: "--field-gap",
    },
  },
  contain: {
    labelPosition: {
      top: "inline-size",
    },
    isQuiet: "none",
  },
});

const searchFieldLabel = style<SearchFieldStyleProps>({
  ...fieldLabel(),
});

const searchFieldGroup = style<SearchFieldStyleProps>({
  ...focusRing(),
  ...control({ shape: "default" }),
  ...fieldInput(),
  borderRadius: "full",
  borderWidth: 2,
  borderStyle: "solid",
  transition: "default",
  borderColor: {
    default: baseColor("gray-300"),
    forcedColors: "ButtonBorder",
    isInvalid: {
      default: baseColor("negative"),
      forcedColors: "Mark",
    },
    isFocusWithin: {
      default: "gray-900",
      isInvalid: "negative-1000",
      forcedColors: "Highlight",
    },
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  backgroundColor: {
    default: "gray-25",
    forcedColors: "Field",
  },
  color: {
    default: baseColor("neutral"),
    forcedColors: "ButtonText",
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  cursor: {
    default: "text",
    isDisabled: "default",
  },
});

const searchFieldGroupPillPadding = style({
  paddingStart: "pill",
  paddingEnd: 0,
});

const searchIconWrapper = style({
  flexShrink: 0,
  marginEnd: "text-to-visual",
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const searchIcon = style<SearchFieldStyleProps>({
  size: fontRelative(20),
  marginStart: "--iconMargin",
});

const searchFieldInput = style({
  padding: 0,
  backgroundColor: "transparent",
  color: {
    default: "inherit",
    "::placeholder": {
      default: "gray-600",
      forcedColors: "GrayText",
    },
  },
  fontFamily: "inherit",
  fontSize: "inherit",
  fontWeight: "inherit",
  flexGrow: 1,
  flexShrink: 1,
  minWidth: 0,
  width: "full",
  outlineStyle: "none",
  borderStyle: "none",
  truncate: true,
});

const clearButton = style<ClearButtonStyleProps>({
  ...focusRing(),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  height: "full",
  width: controlSize(),
  flexShrink: 0,
  borderRadius: "full",
  borderStyle: "none",
  backgroundColor: "transparent",
  boxSizing: "border-box",
  padding: 0,
  outlineOffset: -4,
  outlineColor: {
    default: focusRing().outlineColor,
    isStaticColor: "white",
  },
  color: "inherit",
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const helpTextStyles = style<SearchFieldStyleProps>({
  gridArea: "helptext",
  display: "flex",
  margin: 0,
  alignItems: "baseline",
  gap: "text-to-visual",
  font: controlFont(),
  color: {
    default: "neutral-subdued",
    isInvalid: {
      default: "negative",
      forcedColors: "Mark",
    },
    isDisabled: {
      default: "disabled",
      forcedColors: "GrayText",
    },
  },
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
  contain: "inline-size",
  paddingTop: "--field-gap",
  cursor: {
    default: "text",
    isDisabled: "default",
  },
});

const fieldErrorIcon = style({
  size: fontRelative(20),
  marginStart: "text-to-visual",
  marginEnd: fontRelative(-2),
  flexShrink: 0,
  "--iconPrimary": {
    type: "fill",
    value: {
      default: "negative",
      forcedColors: "Mark",
    },
  },
});

const requiredIcon = style({
  "--iconPrimary": {
    type: "fill",
    value: "currentColor",
  },
});

const noWrap = style({
  whiteSpace: "nowrap",
});

function SearchFieldDescription(props: {
  class?: string;
  children?: JSX.Element;
}): JSX.Element | null {
  const context = useContext(HeadlessSearchFieldContext);
  if (!context?.descriptionProps) return null;
  const descriptionProps = () => {
    const { ref: _ref, ...rest } = context.descriptionProps as Record<string, unknown>;
    return rest;
  };
  return (
    <p {...descriptionProps()} class={props.class}>
      {props.children}
    </p>
  );
}

function SearchFieldError(props: { class?: string; children?: JSX.Element }): JSX.Element | null {
  const context = useContext(HeadlessSearchFieldContext);
  if (!context?.errorMessageProps) return null;
  const errorMessageProps = () => {
    const { ref: _ref, ...rest } = context.errorMessageProps as Record<string, unknown>;
    return rest;
  };
  return (
    <p {...errorMessageProps()} class={props.class}>
      {props.children}
    </p>
  );
}

function normalizeSearchFieldSize(size: SearchFieldSize | undefined): S2SearchFieldSize {
  switch (size) {
    case "sm":
      return "S";
    case "md":
      return "M";
    case "lg":
      return "L";
    case "S":
    case "M":
    case "L":
    case "XL":
      return size;
    default:
      return "M";
  }
}

function focusFieldInput(event: Event & { currentTarget: HTMLDivElement }) {
  const target = event.target as Element | null;

  if (target?.closest("button,input,textarea,[role='button']")) {
    return;
  }

  event.preventDefault();
  event.currentTarget.querySelector<HTMLElement>("input, textarea")?.focus();
}

function requiredIconStyle(size: S2SearchFieldSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

function clearIconStyle(size: S2SearchFieldSize): JSX.CSSProperties {
  const pixelSize = size === "XL" ? 12 : size === "L" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

export function SearchField(props: SearchFieldProps): JSX.Element {
  const isInForm = useIsInForm();
  const providerProps = useProviderProps(useFormProps(props));
  const contextProps = getSlottedContextProps(useContext(SearchFieldContext), props.slot);
  const defaultProps: Partial<SearchFieldProps> = {
    labelPosition: "top",
    labelAlign: "start",
    necessityIndicator: "icon",
  };
  const mergedProps = mergeProps(defaultProps, providerProps, contextProps ?? {}, props);
  const [local, headlessProps] = splitProps(mergedProps, [
    "size",
    "variant",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "label",
    "description",
    "errorMessage",
    "labelPosition",
    "labelAlign",
    "necessityIndicator",
    "contextualHelp",
    "slot",
    "ref",
  ]);
  const [isFocusWithin, setIsFocusWithin] = createSignal(false);

  const size = () => normalizeSearchFieldSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const assignRootRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref,
  );

  const rootClassName = (renderProps: SearchFieldRenderProps) =>
    [
      contextProps?.UNSAFE_className,
      props.UNSAFE_className,
      props.class,
      searchFieldRoot(
        {
          ...renderProps,
          size: size(),
          labelPosition: labelPosition(),
          isInForm,
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const labelWrapperClass = () =>
    searchFieldLabelWrapper({
      size: size(),
      labelPosition: labelPosition(),
      labelAlign: labelAlign(),
    });

  const labelClass = (renderProps: SearchFieldRenderProps) =>
    searchFieldLabel({
      ...renderProps,
      size: size(),
      labelPosition: labelPosition(),
      isStaticColor: false,
    });

  const groupClass = (renderProps: SearchFieldRenderProps) =>
    mergeStyles(
      searchFieldGroup({
        ...renderProps,
        size: size(),
        isFocusWithin: isFocusWithin(),
      }),
      searchFieldGroupPillPadding,
    );

  const inputClass = () => [searchFieldInput, hideNativeSearchCancelButton].join(" ");

  const clearButtonClass = (renderProps: SearchFieldClearButtonRenderProps) =>
    clearButton({
      ...renderProps,
      size: size(),
      isStaticColor: false,
    });

  const helpClass = (renderProps: SearchFieldRenderProps, isInvalid: boolean) =>
    helpTextStyles({
      ...renderProps,
      size: size(),
      isInvalid,
    });

  return (
    <HeadlessSearchField
      {...headlessProps}
      label={local.label}
      description={local.description}
      errorMessage={local.errorMessage}
      ref={(element) => assignRootRef(element)}
      slot={local.slot ?? undefined}
      class={rootClassName}
      style={mergedUnsafeStyle()}
      data-size={size()}
      children={(renderProps: SearchFieldRenderProps) => (
        <>
          <Show when={local.label}>
            <div class={labelWrapperClass()}>
              <HeadlessSearchFieldLabel class={labelClass(renderProps)}>
                {local.label}
                <Show when={renderProps.isRequired || necessityIndicator() === "label"}>
                  <span class={noWrap}>
                    &nbsp;
                    <Show
                      when={necessityIndicator() === "icon"}
                      fallback={
                        <span aria-hidden={renderProps.isRequired ? true : undefined}>
                          {renderProps.isRequired ? "(required)" : "(optional)"}
                        </span>
                      }
                    >
                      <AsteriskIcon
                        size={size() === "S" ? "M" : size()}
                        styles={requiredIcon}
                        style={requiredIconStyle(size())}
                        aria-hidden="true"
                      />
                    </Show>
                  </span>
                </Show>
              </HeadlessSearchFieldLabel>
              <Show when={local.contextualHelp}>
                <span data-slot="contextualHelp">{local.contextualHelp}</span>
              </Show>
            </div>
          </Show>

          <div
            // Mirrors S2's FieldGroup, which renders RAC <Group> (role="group")
            // as the field shell around the icon, input, and clear button. The
            // group is intentionally unnamed — the searchbox carries the label.
            role="group"
            class={groupClass(renderProps)}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse") {
                focusFieldInput(event);
              }
            }}
            onTouchEnd={focusFieldInput}
            onFocusIn={() => setIsFocusWithin(true)}
            onFocusOut={(event) => {
              if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                setIsFocusWithin(false);
              }
            }}
            data-focused={isFocusWithin() ? "true" : undefined}
            data-disabled={renderProps.isDisabled ? "true" : undefined}
            data-invalid={renderProps.isInvalid ? "true" : undefined}
          >
            <CenterBaseline slot="icon" styles={searchIconWrapper}>
              <SearchIcon styles={searchIcon} />
            </CenterBaseline>
            <HeadlessSearchFieldInput class={inputClass()} />
            <Show when={!renderProps.isReadOnly}>
              <HeadlessSearchFieldClearButton class={clearButtonClass}>
                <CrossIcon size={size()} style={clearIconStyle(size())} />
              </HeadlessSearchFieldClearButton>
            </Show>
          </div>

          <Show when={local.description && !renderProps.isInvalid}>
            <SearchFieldDescription class={helpClass(renderProps, false)}>
              {local.description}
            </SearchFieldDescription>
          </Show>

          <Show when={local.errorMessage && renderProps.isInvalid}>
            <SearchFieldError class={helpClass(renderProps, true)}>
              <CenterBaseline>
                <AlertTriangleIcon aria-hidden="true" styles={fieldErrorIcon} />
              </CenterBaseline>
              <span>{local.errorMessage}</span>
            </SearchFieldError>
          </Show>
        </>
      )}
    />
  );
}

export type { SearchFieldState } from "@proyecto-viviana/solid-stately";
