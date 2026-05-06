// @ts-nocheck
import { type JSX, createSignal, splitProps, Show, useContext } from "solid-js";
import {
  SearchField as HeadlessSearchField,
  SearchFieldLabel as HeadlessSearchFieldLabel,
  SearchFieldInput as HeadlessSearchFieldInput,
  SearchFieldClearButton as HeadlessSearchFieldClearButton,
  SearchFieldContext,
  type SearchFieldProps as HeadlessSearchFieldProps,
  type SearchFieldRenderProps,
  type SearchFieldClearButtonRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../s2-style";
import { baseColor, focusRing, fontRelative, style } from "../s2-style";
import {
  control,
  controlFont,
  controlSize,
  field,
  fieldInput,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils";
import { CenterBaseline } from "../icon/center-baseline";
import SearchIcon from "../icon/s2wf-icons/SearchIcon";
import CrossIcon from "../icon/ui-icons/Cross";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import { useProviderProps } from "../provider";
import { hideWebkitSearchCancelButton, searchFieldPillPadding } from "./s2-searchfield-styles";

export type SearchFieldSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2SearchFieldSize = "S" | "M" | "L" | "XL";
export type SearchFieldVariant = "outline" | "filled";
export type SearchFieldLabelPosition = "top" | "side";
export type SearchFieldLabelAlign = "start" | "end";
export type SearchFieldNecessityIndicator = "icon" | "label";

export interface SearchFieldProps extends Omit<
  HeadlessSearchFieldProps,
  "class" | "style" | "children" | "label"
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
  const context = useContext(SearchFieldContext);
  if (!context) return null;
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
  const context = useContext(SearchFieldContext);
  if (!context) return null;
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

export function SearchField(props: SearchFieldProps): JSX.Element {
  const mergedProps = useProviderProps(props);
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
  ]);
  const [isFocusWithin, setIsFocusWithin] = createSignal(false);

  const size = () => normalizeSearchFieldSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";

  const rootClassName = (renderProps: SearchFieldRenderProps) =>
    [
      local.UNSAFE_className,
      local.class,
      searchFieldRoot(
        {
          ...renderProps,
          size: size(),
          labelPosition: labelPosition(),
          isInForm: false,
        },
        local.styles,
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
    [
      searchFieldGroup({
        ...renderProps,
        size: size(),
        isFocusWithin: isFocusWithin(),
      }),
      searchFieldPillPadding,
    ].join(" ");

  const inputClass = () => [searchFieldInput, hideWebkitSearchCancelButton].join(" ");

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
      class={rootClassName}
      style={local.UNSAFE_style}
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
            </div>
          </Show>

          <div
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
            <HeadlessSearchFieldClearButton class={clearButtonClass}>
              <CrossIcon size={size()} />
            </HeadlessSearchFieldClearButton>
          </div>

          <Show when={local.description && !renderProps.isInvalid}>
            <SearchFieldDescription class={helpClass(renderProps, false)}>
              {local.description}
            </SearchFieldDescription>
          </Show>

          <Show when={local.errorMessage && renderProps.isInvalid}>
            <SearchFieldError class={helpClass(renderProps, true)}>
              {local.errorMessage}
            </SearchFieldError>
          </Show>
        </>
      )}
    />
  );
}

export type { SearchFieldState } from "@proyecto-viviana/solid-stately";
