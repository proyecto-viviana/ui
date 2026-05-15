import { type JSX, createContext, splitProps, useContext } from "solid-js";
import {
  Form as HeadlessForm,
  FieldError as HeadlessFieldError,
  type FormProps as HeadlessFormProps,
  type FieldErrorProps as HeadlessFieldErrorProps,
} from "@proyecto-viviana/solidaria-components";
import { style, type StyleString } from "../s2-style";
import { getAllowedOverrides, type UnsafeClassName } from "../s2-internal/style-utils";
import { createIsSkeleton } from "../skeleton";

export type FormSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg";
export type FormLabelPosition = "top" | "side";
export type FormLabelAlign = "start" | "end";
export type FormNecessityIndicator = "icon" | "label";

export interface FormStyleProps {
  /** The size of descendant Form elements. @default 'M' */
  size?: FormSize;
  /** The label's overall position relative to each field. @default 'top' */
  labelPosition?: FormLabelPosition;
  /** The label's horizontal alignment relative to each field. @default 'start' */
  labelAlign?: FormLabelAlign;
  /** Whether required fields show an icon or text label. @default 'icon' */
  necessityIndicator?: FormNecessityIndicator;
  /** Whether descendant Form elements are required. */
  isRequired?: boolean;
  /** Whether descendant Form elements are disabled. */
  isDisabled?: boolean;
  /** Whether descendant Form elements are rendered with emphasized styling. */
  isEmphasized?: boolean;
}

type S2FormSize = "S" | "M" | "L" | "XL";

export interface FormProps extends Omit<HeadlessFormProps, "class" | "style">, FormStyleProps {
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
}

export interface FieldErrorProps extends Omit<HeadlessFieldErrorProps, "class"> {
  class?: string;
}

export const FormContext = createContext<FormStyleProps | null>(null);

const formStylePropKeys = [
  "size",
  "labelPosition",
  "labelAlign",
  "necessityIndicator",
  "isRequired",
  "isDisabled",
  "isEmphasized",
] as const;

export function useIsInForm(): boolean {
  return useContext(FormContext) != null;
}

export function useFormProps<T extends object>(props: T): T {
  const context = useContext(FormContext);
  const isSkeleton = createIsSkeleton();

  const getInheritedValue = (property: PropertyKey) => {
    if (property === "isDisabled" && isSkeleton()) {
      return true;
    }

    if (typeof property !== "string") {
      return undefined;
    }

    return context?.[property as keyof FormStyleProps];
  };

  return new Proxy(props, {
    get(target, property, receiver) {
      if (property === "isDisabled" && isSkeleton()) {
        return true;
      }

      const localValue = Reflect.get(target, property, receiver);
      if (localValue !== undefined) {
        return localValue;
      }

      return getInheritedValue(property);
    },
    has(target, property) {
      return Reflect.has(target, property) || getInheritedValue(property) !== undefined;
    },
    ownKeys(target) {
      const keys = new Set<ReturnType<typeof Reflect.ownKeys>[number]>(Reflect.ownKeys(target));

      for (const key of formStylePropKeys) {
        if (getInheritedValue(key) !== undefined) {
          keys.add(key);
        }
      }

      return Array.from(keys);
    },
    getOwnPropertyDescriptor(target, property) {
      if (property === "isDisabled" && isSkeleton()) {
        return {
          enumerable: true,
          configurable: true,
          get: () => true,
        };
      }

      const descriptor = Reflect.getOwnPropertyDescriptor(target, property);
      if (descriptor) {
        return descriptor;
      }

      if (getInheritedValue(property) !== undefined) {
        return {
          enumerable: true,
          configurable: true,
          get: () => getInheritedValue(property),
        };
      }

      return undefined;
    },
  }) as T;
}

const formStyles = style<{ labelPosition: FormLabelPosition; size: S2FormSize }>(
  {
    display: "grid",
    gridTemplateColumns: {
      labelPosition: {
        top: ["[field] 1fr"],
        side: ["[label] auto", "[field] 1fr"],
      },
    },
    rowGap: {
      size: {
        S: 20,
        M: 24,
        L: 32,
        XL: 40,
      },
    },
    columnGap: "text-to-control",
  },
  getAllowedOverrides(),
);

function normalizeFormSize(size: FormSize | undefined): S2FormSize {
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

export function Form(props: FormProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, [
    "size",
    "labelPosition",
    "labelAlign",
    "necessityIndicator",
    "isRequired",
    "isDisabled",
    "isEmphasized",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "children",
  ]);

  const size = () => normalizeFormSize(local.size);
  const labelPosition = () => local.labelPosition ?? "top";
  const labelAlign = () => local.labelAlign ?? "start";
  const necessityIndicator = () => local.necessityIndicator ?? "icon";

  const contextValue: FormStyleProps = {
    get size() {
      return size();
    },
    get labelPosition() {
      return labelPosition();
    },
    get labelAlign() {
      return labelAlign();
    },
    get necessityIndicator() {
      return necessityIndicator();
    },
    get isRequired() {
      return local.isRequired;
    },
    get isDisabled() {
      return local.isDisabled;
    },
    get isEmphasized() {
      return local.isEmphasized;
    },
  };

  return (
    <FormContext.Provider value={contextValue}>
      <HeadlessForm
        {...headlessProps}
        class={[
          local.UNSAFE_className,
          local.class,
          formStyles({ size: size(), labelPosition: labelPosition() }, local.styles),
        ]
          .filter(Boolean)
          .join(" ")}
        style={local.UNSAFE_style}
      >
        {(renderProps) =>
          typeof local.children === "function" ? local.children(renderProps) : local.children
        }
      </HeadlessForm>
    </FormContext.Provider>
  );
}

export function FieldError(props: FieldErrorProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class"]);
  return (
    <HeadlessFieldError {...headlessProps} class={`text-sm text-danger-400 ${local.class ?? ""}`} />
  );
}

export { Field } from "./Field";
export type { FieldProps, FieldSize } from "./Field";
export { HelpText } from "./HelpText";
export type { HelpTextProps } from "./HelpText";
