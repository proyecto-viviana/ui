import {
  type Component,
  type JSX,
  Show,
  createContext,
  mergeProps,
  onMount,
  splitProps,
  useContext,
} from "solid-js";
import { Dynamic } from "solid-js/web";
import {
  createFocusRing,
  createStringFormatter,
  filterDOMProps,
  focusSafely,
} from "@proyecto-viviana/solidaria";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { IconContext, type SpectrumIconProps } from "../icon";
import { AlertDiamondIcon } from "../icon/s2wf-icons/AlertDiamondIcon";
import { AlertTriangleIcon } from "../icon/s2wf-icons/AlertTriangleIcon";
import { CheckmarkCircleIcon } from "../icon/s2wf-icons/CheckmarkCircleIcon";
import { InfoCircleIcon } from "../icon/s2wf-icons/InfoCircleIcon";
import { s2IntlStrings, type S2IntlStrings } from "../intl";
import {
  getAllowedOverrides,
  type StyleProps,
  type UnsafeClassName,
} from "../s2-internal/style-utils";
import { focusRing, style, type StyleString } from "../style";
import { ContentContext, HeadingContext } from "../text";

export type InlineAlertVariant = "informative" | "positive" | "notice" | "negative" | "neutral";
export type InlineAlertFillStyle = "border" | "subtleFill" | "boldFill";

interface InlineAlertStyleProps {
  /** The semantic tone of an InlineAlert. @default 'neutral' */
  variant?: InlineAlertVariant;
  /** The visual style of the InlineAlert. @default 'border' */
  fillStyle?: InlineAlertFillStyle;
}

export interface InlineAlertProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children" | "class" | "style" | "ref" | "slot"
> {
  /** The contents of the InlineAlert. */
  children?: JSX.Element;
  /** Whether to automatically focus the InlineAlert when it first renders. */
  autoFocus?: boolean;
  /** The semantic tone of an InlineAlert. @default 'neutral' */
  variant?: InlineAlertVariant;
  /** The visual style of the InlineAlert. @default 'border' */
  fillStyle?: InlineAlertFillStyle;
  /** Spectrum-defined styles, returned by the `style()` macro. */
  styles?: StyleProps["styles"] | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: UnsafeClassName | string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Slotted context key. */
  slot?: string | null;
  /** Ref for the root alert element. */
  ref?: RefLike<HTMLDivElement>;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
}

export const InlineAlertContext = createContext<SpectrumContextValue<InlineAlertProps>>(null);

const inlineAlert = style<InlineAlertStyleProps & { isFocusVisible?: boolean }>(
  {
    ...focusRing(),
    display: "inline-block",
    position: "relative",
    boxSizing: "border-box",
    padding: 24,
    borderRadius: "lg",
    borderStyle: "solid",
    borderWidth: 2,
    borderColor: {
      fillStyle: {
        border: {
          variant: {
            informative: "informative-800" as never,
            positive: "positive-700" as never,
            notice: "notice-700" as never,
            negative: "negative-800" as never,
            neutral: "gray-700" as never,
          },
        },
        subtleFill: "transparent",
        boldFill: "transparent",
      },
    },
    backgroundColor: {
      variant: {
        informative: {
          fillStyle: {
            border: "gray-25" as never,
            subtleFill: "informative-subtle",
            boldFill: "informative",
          },
        },
        positive: {
          fillStyle: {
            border: "gray-25" as never,
            subtleFill: "positive-subtle",
            boldFill: "positive",
          },
        },
        notice: {
          fillStyle: {
            border: "gray-25" as never,
            subtleFill: "notice-subtle",
            boldFill: "notice",
          },
        },
        negative: {
          fillStyle: {
            border: "gray-25" as never,
            subtleFill: "negative-subtle",
            boldFill: "negative",
          },
        },
        neutral: {
          fillStyle: {
            border: "gray-25" as never,
            subtleFill: "neutral-subtle",
            boldFill: "neutral-subdued",
          },
        },
      },
    },
  },
  getAllowedOverrides(),
);

const icon = style<InlineAlertStyleProps>({
  float: "inline-end",
  "--iconPrimary": {
    type: "fill",
    value: {
      fillStyle: {
        border: {
          variant: {
            informative: "informative",
            positive: "positive",
            notice: "notice",
            negative: "negative",
            neutral: "neutral",
          },
        },
        subtleFill: {
          variant: {
            informative: "informative",
            positive: "positive",
            notice: "negative",
            negative: "negative",
            neutral: "neutral",
          },
        },
        boldFill: {
          default: "white",
          variant: {
            notice: "black",
          },
        },
      },
    },
  },
});

const heading = style<InlineAlertStyleProps>({
  marginTop: 0,
  font: "title-sm",
  color: {
    default: "title",
    fillStyle: {
      boldFill: {
        default: "white",
        variant: {
          notice: "black",
        },
      },
    },
  },
});

const content = style<InlineAlertStyleProps>({
  font: "body-sm",
  color: {
    default: "body",
    fillStyle: {
      boldFill: {
        default: "white",
        variant: {
          notice: "black",
        },
      },
    },
  },
});

const alertIcons: Record<InlineAlertVariant, Component<SpectrumIconProps> | undefined> = {
  informative: InfoCircleIcon,
  positive: CheckmarkCircleIcon,
  notice: AlertDiamondIcon,
  negative: AlertTriangleIcon,
  neutral: undefined,
};

/**
 * Inline alerts display a non-modal message associated with objects in a view.
 */
export function InlineAlert(props: InlineAlertProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(InlineAlertContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, domProps] = splitProps(merged, [
    "children",
    "autoFocus",
    "variant",
    "fillStyle",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "slot",
    "ref",
    "class",
  ]);
  const formatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const variant = () => local.variant ?? "neutral";
  const fillStyle = () => local.fillStyle ?? "border";
  const autoFocus = () => !!local.autoFocus;
  const { isFocusVisible, focusProps } = createFocusRing({ autoFocus: autoFocus() });
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const Icon = () => alertIcons[variant()];
  const iconLabel = () => formatter().format(`inlinealert.${variant()}` as keyof S2IntlStrings);
  let rootElement: HTMLDivElement | undefined;

  onMount(() => {
    if (autoFocus() && rootElement) {
      focusSafely(rootElement);
    }
  });

  const setRootRef = (element: HTMLDivElement) => {
    rootElement = element;
    mergeContextRefs(
      (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
      props.ref,
    )(element);
  };

  const className = () =>
    [
      contextProps?.UNSAFE_className,
      local.UNSAFE_className,
      local.class,
      inlineAlert(
        {
          variant: variant(),
          fillStyle: fillStyle(),
          isFocusVisible: isFocusVisible(),
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  return (
    <div
      {...filterDOMProps(domProps as Record<string, unknown>)}
      onFocus={focusProps.onFocus}
      onBlur={focusProps.onBlur}
      ref={setRootRef}
      tabIndex={autoFocus() ? -1 : undefined}
      autofocus={autoFocus() || undefined}
      role="alert"
      class={className()}
      style={mergedUnsafeStyle()}
    >
      <HeadingContext.Provider value={{ styles: () => heading({ fillStyle: fillStyle() }) }}>
        <ContentContext.Provider value={{ styles: () => content({ fillStyle: fillStyle() }) }}>
          <IconContext.Provider
            value={{ styles: () => icon({ variant: variant(), fillStyle: fillStyle() }) }}
          >
            <Show when={Icon()}>
              {(AlertIcon) => (
                <Dynamic component={AlertIcon()} UNSAFE_suppressDataSlot aria-label={iconLabel()} />
              )}
            </Show>
            {local.children}
          </IconContext.Provider>
        </ContentContext.Provider>
      </HeadingContext.Provider>
    </div>
  );
}
