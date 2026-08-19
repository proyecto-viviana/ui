// @ts-nocheck
import {
  type JSX,
  createContext,
  createUniqueId,
  mergeProps,
  splitProps,
  Show,
  useContext,
} from "solid-js";
import {
  TextField as HeadlessTextField,
  Label as HeadlessLabel,
  Input as HeadlessInput,
  TextFieldContext as HeadlessTextFieldContext,
  type TextFieldProps as HeadlessTextFieldProps,
  type TextFieldRenderProps,
} from "@proyecto-viviana/solidaria-components";
import { getSlottedContextProps, type SpectrumContextValue } from "../button/spectrum-context";
import { FieldPrefix, PrefixInputProvider } from "../field/prefix";
import { FieldSuffix } from "../field/suffix";
import type { StyleString } from "../style";
import { baseColor, focusRing, fontRelative, style } from "../style" with { type: "macro" };
import {
  control,
  controlFont,
  field,
  fieldInput,
  fieldLabel,
  getAllowedOverrides,
} from "../s2-internal/style-utils" with { type: "macro" };
import { CenterBaseline } from "../icon/center-baseline";
import AlertTriangleIcon from "../icon/s2wf-icons/AlertTriangleIcon";
import AsteriskIcon from "../icon/ui-icons/Asterisk";
import { useProviderProps } from "../provider";
import { useFormProps, useIsInForm } from "../form";

export type TextFieldSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
type S2TextFieldSize = "S" | "M" | "L" | "XL";
export type TextFieldVariant = "outline" | "filled";
export type TextFieldLabelPosition = "top" | "side";
export type TextFieldLabelAlign = "start" | "end";
export type TextFieldNecessityIndicator = "icon" | "label";
/**
 * The matte surface the field sits on. `well` is the register's default field
 * surface; `tutor` is the AI-lane surface (`--surface-well-tutor`) — one step
 * deeper in dark, marking a tutor prompt apart from ordinary inputs.
 */
export type TextFieldSurface = "well" | "tutor";

export interface TextFieldProps extends Omit<
  HeadlessTextFieldProps,
  "class" | "style" | "children"
> {
  /** The size of the text field. */
  size?: TextFieldSize;
  /** Legacy visual variant. S2 TextFields do not expose visual variants. */
  variant?: TextFieldVariant;
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
  labelPosition?: TextFieldLabelPosition;
  /** Text alignment for side labels. */
  labelAlign?: TextFieldLabelAlign;
  /** Whether required fields show an icon or text label. */
  necessityIndicator?: TextFieldNecessityIndicator;
  /** An icon or text rendered before the input, e.g. a unit or protocol. */
  prefix?: JSX.Element;
  /** An icon or text rendered after the input, e.g. a unit or key hint. */
  suffix?: JSX.Element;
  /** The matte surface family the field sits on. @default "well" */
  surface?: TextFieldSurface;
}

export const TextFieldContext = createContext<SpectrumContextValue<TextFieldProps>>(null);

interface TextFieldStyleProps extends TextFieldRenderProps {
  size?: S2TextFieldSize;
  labelPosition?: TextFieldLabelPosition;
  labelAlign?: TextFieldLabelAlign;
  isFocusWithin?: boolean;
  isStaticColor?: boolean;
  isInForm?: boolean;
  isQuiet?: boolean;
  surface?: TextFieldSurface;
}

const textFieldRoot = style<TextFieldStyleProps>(
  {
    ...field(),
  },
  getAllowedOverrides(),
);

const textFieldLabelWrapper = style<TextFieldStyleProps>({
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

const textFieldLabel = style<TextFieldStyleProps>({
  ...fieldLabel(),
});

const fieldGroupStyles = style<TextFieldStyleProps>({
  ...focusRing(),
  ...control({ shape: "default", register: "matte" }),
  ...fieldInput(),
  transition: "default",
  borderColor: {
    default: "well-border",
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
    default: "well",
    /* The AI-lane surface (register panel 02). `surface` sits before
     * `forcedColors` so forced colors keep the last word. */
    surface: {
      tutor: "well-tutor",
    },
    forcedColors: "Field",
  },
  color: {
    default: baseColor("neutral"),
    /* The tutor well carries its own ink token (brighter in dark, where the
     * deeper fill would otherwise mute the neutral ramp). */
    surface: {
      tutor: "[var(--well-tutor-ink)]",
    },
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

const textFieldInput = style({
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

const helpTextStyles = style<TextFieldStyleProps>({
  gridArea: "helptext",
  display: "flex",
  alignItems: "baseline",
  gap: "text-to-visual",
  font: controlFont(),
  color: {
    default: "neutral-subdued",
    isInvalid: {
      default: "negative-1000",
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
      default: "negative-1000",
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

// Byte-faithful to upstream Field.tsx HelpText: the description renders a RAC
// `<Text slot="description">` (a `<span>`), NOT a `<p>` (whose UA `margin` the
// port previously had to zero out in `helpTextStyles`). The `slot` mirrors RAC's
// Text; the id/aria wiring is read from the headless TextField context.
function TextFieldDescription(props: {
  class?: string;
  children?: JSX.Element;
}): JSX.Element | null {
  const context = useContext(HeadlessTextFieldContext);
  if (!context) return null;
  const descriptionProps = () => {
    const { ref: _ref, ...rest } = context.descriptionProps as Record<string, unknown>;
    return rest;
  };
  return (
    <span {...descriptionProps()} slot="description" class={props.class}>
      {props.children}
    </span>
  );
}

// Upstream renders the invalid message through a RAC `<FieldError>`, which is a
// `<Text slot="errorMessage">` (a `<span>`), not a `<p>`.
function TextFieldError(props: { class?: string; children?: JSX.Element }): JSX.Element | null {
  const context = useContext(HeadlessTextFieldContext);
  if (!context) return null;
  const errorMessageProps = () => {
    const { ref: _ref, ...rest } = context.errorMessageProps as Record<string, unknown>;
    return rest;
  };
  return (
    <span {...errorMessageProps()} slot="errorMessage" class={props.class}>
      {props.children}
    </span>
  );
}

export { TextArea, TextAreaContext } from "./TextArea";
export type { TextAreaProps, TextAreaSize, TextAreaVariant } from "./TextArea";

function normalizeTextFieldSize(size: TextFieldSize | undefined): S2TextFieldSize {
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

function requiredIconStyle(size: S2TextFieldSize): JSX.CSSProperties {
  const pixelSize = size === "L" || size === "XL" ? 10 : 8;
  return {
    width: `${pixelSize}px`,
    height: `${pixelSize}px`,
  };
}

export function TextField(props: TextFieldProps): JSX.Element {
  const isInForm = useIsInForm();
  // Slotted context props sit below explicit props; `useFormProps`/`useProviderProps`
  // wrap the result so the form/Skeleton disabled-force stays outermost (mirrors
  // upstream's `useSpectrumContextProps` → `useFormProps` order in TextField.tsx).
  const contextProps = getSlottedContextProps(useContext(TextFieldContext), props.slot);
  const mergedProps = useProviderProps(useFormProps(mergeProps(contextProps ?? {}, props)));
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
    "validationState",
    "prefix",
    "suffix",
    "surface",
  ]);

  const prefixId = createUniqueId();
  const suffixId = createUniqueId();
  // Space-separated adornment ids appended to the input's `aria-labelledby`,
  // visual order (prefix before suffix). Read live by PrefixInputProvider.
  const adornmentIds = () =>
    [local.prefix ? prefixId : null, local.suffix ? suffixId : null].filter(Boolean).join(" ");
  const size = () => normalizeTextFieldSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";
  const normalizedHeadlessProps = mergeProps(headlessProps, {
    get isInvalid() {
      return headlessProps.isInvalid ?? local.validationState === "invalid";
    },
    get validationBehavior() {
      return headlessProps.validationBehavior ?? (local.validationState ? "aria" : undefined);
    },
  });

  const rootClassName = (renderProps: TextFieldRenderProps) =>
    [
      local.UNSAFE_className,
      local.class,
      textFieldRoot(
        {
          ...renderProps,
          size: size(),
          labelPosition: labelPosition(),
          isInForm,
        },
        local.styles,
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const labelWrapperClass = () =>
    textFieldLabelWrapper({
      size: size(),
      labelPosition: labelPosition(),
      labelAlign: labelAlign(),
    });

  const labelClass = (renderProps: TextFieldRenderProps) =>
    textFieldLabel({
      ...renderProps,
      size: size(),
      labelPosition: labelPosition(),
      isStaticColor: false,
    });

  const groupClass = (renderProps: TextFieldRenderProps) =>
    fieldGroupStyles({
      ...renderProps,
      size: size(),
      isFocusWithin: renderProps.isFocused,
      surface: local.surface ?? "well",
    });

  const helpClass = (renderProps: TextFieldRenderProps, isInvalid: boolean) =>
    helpTextStyles({
      ...renderProps,
      size: size(),
      isInvalid,
    });

  return (
    <HeadlessTextField
      {...normalizedHeadlessProps}
      label={local.label}
      description={local.description}
      errorMessage={local.errorMessage}
      class={rootClassName}
      style={local.UNSAFE_style}
      children={(renderProps) => (
        <>
          <Show when={local.label}>
            <div class={labelWrapperClass()}>
              <HeadlessLabel class={labelClass(renderProps)}>
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
              </HeadlessLabel>
            </div>
          </Show>

          <div
            // Upstream FieldGroup renders a RAC `<Group>`. RAC's `Group` defaults
            // to `role={props.role ?? 'group'}`, but RAC's `TextField` seeds
            // `GroupContext` with `{role: 'presentation'}` (TextField.mjs) — the
            // input is directly labeled, so the visual wrapper is marked
            // presentation to keep the AX tree flat (no redundant group node
            // around the textbox). Verified against the rendered React DOM: the
            // FieldGroup div is `role="presentation"`. The hand-rolled `<div>`
            // must carry it to match both the DOM and the accessibility tree.
            role="presentation"
            class={groupClass(renderProps)}
            onPointerDown={(event) => {
              if (event.pointerType === "mouse") {
                focusFieldInput(event);
              }
            }}
            onTouchEnd={focusFieldInput}
            data-focused={renderProps.isFocused ? "true" : undefined}
            data-focus-visible={renderProps.isFocusVisible ? "true" : undefined}
            data-disabled={renderProps.isDisabled ? "true" : undefined}
            data-invalid={renderProps.isInvalid ? "true" : undefined}
          >
            <Show
              when={local.prefix || local.suffix}
              fallback={<HeadlessInput class={textFieldInput} />}
            >
              <Show when={local.prefix}>
                <FieldPrefix id={prefixId}>{local.prefix}</FieldPrefix>
              </Show>
              <PrefixInputProvider context={HeadlessTextFieldContext} prefixId={adornmentIds()}>
                <HeadlessInput class={textFieldInput} />
              </PrefixInputProvider>
              <Show when={local.suffix}>
                <FieldSuffix id={suffixId}>{local.suffix}</FieldSuffix>
              </Show>
            </Show>
            <Show when={renderProps.isInvalid && !renderProps.isDisabled}>
              <CenterBaseline>
                <AlertTriangleIcon styles={fieldErrorIcon} />
              </CenterBaseline>
            </Show>
          </div>

          <Show when={local.description && !renderProps.isInvalid}>
            <TextFieldDescription class={helpClass(renderProps, false)}>
              {local.description}
            </TextFieldDescription>
          </Show>

          <Show when={local.errorMessage && renderProps.isInvalid}>
            <TextFieldError class={helpClass(renderProps, true)}>
              {local.errorMessage}
            </TextFieldError>
          </Show>
        </>
      )}
    />
  );
}

export { TextField as TextFieldBase };
