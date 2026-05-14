import { type JSX, createContext, createMemo, mergeProps, splitProps, useContext } from "solid-js";
import { createStringFormatter, useLocale } from "@proyecto-viviana/solidaria";
import { fontRelative, style, type StyleString } from "../s2-style";
import { getAllowedOverrides } from "../s2-internal/style-utils";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";
import { s2IntlStrings } from "../intl";

export type NotificationBadgeSize = "S" | "M" | "L" | "XL";

export interface NotificationBadgeProps extends Omit<
  JSX.HTMLAttributes<HTMLSpanElement>,
  "class" | "style" | "children" | "slot" | "ref"
> {
  /** The value to display in the notification badge. */
  value?: number | null;
  /** The size of the notification badge. @default 'S' */
  size?: NotificationBadgeSize;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Static color inherited from a surrounding component. */
  staticColor?: "black" | "white" | "auto";
  /** Whether the owning control is disabled. */
  isDisabled?: boolean;
  slot?: string | null;
  ref?: RefLike<HTMLSpanElement>;
  "aria-label"?: string;
}

export const NotificationBadgeContext =
  createContext<SpectrumContextValue<NotificationBadgeProps>>(null);

const notificationBadge = style(
  {
    display: {
      default: "flex",
      isDisabled: "none",
    },
    font: "ui",
    color: {
      default: "white",
      isStaticColor: "auto",
      forcedColors: "ButtonText",
    },
    fontSize: {
      size: {
        S: "ui-xs",
        M: "ui-xs",
        L: "ui-sm",
        XL: "ui",
      },
    },
    borderStyle: {
      forcedColors: "solid",
    },
    borderWidth: {
      forcedColors: "[1px]",
    },
    borderColor: {
      forcedColors: "ButtonBorder",
    },
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: {
      default: "accent",
      isStaticColor: "transparent-overlay-1000",
      forcedColors: "ButtonFace",
    },
    height: {
      size: {
        S: {
          default: 12,
          isIndicatorOnly: 8,
        },
        M: {
          default: fontRelative(18),
          isIndicatorOnly: 8,
        },
        L: {
          default: 16,
          isIndicatorOnly: fontRelative(12),
        },
        XL: {
          default: 18,
          isIndicatorOnly: fontRelative(12),
        },
      },
    },
    aspectRatio: {
      isIndicatorOnly: "square",
      isSingleDigit: "square",
    },
    width: "max",
    paddingX: {
      isDoubleDigit: "edge-to-text",
    },
    borderRadius: "pill",
  },
  getAllowedOverrides(),
);

export function NotificationBadge(props: NotificationBadgeProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(NotificationBadgeContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props);
  const [local, domProps] = splitProps(merged, [
    "value",
    "size",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "staticColor",
    "isDisabled",
    "slot",
    "ref",
    "aria-label",
  ]);
  const locale = useLocale();
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const size = () => local.size ?? "S";
  const value = () => local.value;

  const formattedValue = createMemo(() => {
    const currentValue = value();
    if (currentValue == null) {
      return "";
    }

    if (currentValue <= 0) {
      throw new Error("Value cannot be negative or zero");
    }

    if (!Number.isInteger(currentValue)) {
      throw new Error("Value must be a positive integer");
    }

    const cappedValue = Math.min(currentValue, 99);
    const formatted = new Intl.NumberFormat(locale().locale).format(cappedValue);
    return currentValue > 99
      ? stringFormatter().format("notificationbadge.plus", { notifications: formatted })
      : formatted;
  });

  const digitCount = createMemo(() => {
    const currentValue = value();
    if (currentValue == null) {
      return 0;
    }

    return String(Math.min(currentValue, 99)).length;
  });

  const ariaLabel = () =>
    local["aria-label"] ??
    (value() == null ? stringFormatter().format("notificationbadge.indicatorOnly") : undefined);

  return (
    <span
      {...domProps}
      ref={mergeContextRefs(
        (contextProps as { ref?: RefLike<HTMLSpanElement> } | null)?.ref,
        props.ref,
      )}
      role={ariaLabel() ? "img" : undefined}
      aria-label={ariaLabel()}
      class={[
        contextProps?.UNSAFE_className,
        local.UNSAFE_className,
        notificationBadge(
          {
            size: size(),
            isIndicatorOnly: value() == null,
            isSingleDigit: digitCount() === 1,
            isDoubleDigit: digitCount() === 2,
            isDisabled: local.isDisabled,
            isStaticColor: !!local.staticColor,
          },
          mergeContextStyles(contextProps?.styles, props.styles),
        ),
      ]
        .filter(Boolean)
        .join(" ")}
      style={mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style)}
    >
      {formattedValue()}
    </span>
  );
}
