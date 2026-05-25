import { type JSX, Show, splitProps } from "solid-js";
import {
  Tooltip as HeadlessTooltip,
  TooltipTrigger as HeadlessTooltipTrigger,
  type TooltipPlacement,
  type TooltipProps as HeadlessTooltipProps,
  type TooltipTriggerComponentProps as HeadlessTooltipTriggerProps,
  type TooltipRenderProps,
  type TooltipResolvedPlacement,
} from "@proyecto-viviana/solidaria-components";
import { centerPadding, setColorScheme, style, type StyleString } from "../style";
import { mergeStyles } from "../style/runtime";
import { useTheme, type ColorScheme } from "../provider";

export type { TooltipPlacement };
export type TooltipVariant = "default" | "neutral" | "info";

export interface TooltipTriggerProps extends HeadlessTooltipTriggerProps {
  /** The children of the tooltip trigger (trigger element and tooltip). */
  children: JSX.Element;
}

export interface TooltipProps extends Omit<HeadlessTooltipProps, "class" | "style" | "children"> {
  /** The content of the tooltip. */
  children: JSX.Element;
  /** The position of the tooltip relative to the trigger. */
  placement?: TooltipPlacement;
  /** Deprecated legacy visual variant. Spectrum 2 tooltips use a single neutral treatment. */
  variant?: TooltipVariant;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
  /** Backward-compatible arrow toggle. Spectrum 2 tooltips render an arrow by default. */
  showArrow?: boolean;
}

const tooltip = style<TooltipRenderProps & { colorScheme: ColorScheme | null }>({
  ...setColorScheme(),
  justifyContent: "center",
  alignItems: "center",
  maxWidth: 160,
  minHeight: 24,
  boxSizing: "border-box",
  font: "ui-sm",
  color: {
    default: "gray-25" as never,
    forcedColors: "ButtonText",
  },
  borderWidth: {
    forcedColors: 1,
  },
  borderStyle: {
    forcedColors: "solid",
  },
  borderColor: {
    forcedColors: "transparent",
  },
  backgroundColor: "neutral",
  borderRadius: "default",
  paddingX: "edge-to-text",
  paddingY: centerPadding(),
  transition: "default",
  transitionDuration: 200,
  transitionTimingFunction: {
    isExiting: "in",
  },
  translateX: {
    placement: {
      left: {
        isEntering: 4,
        isExiting: 4,
      },
      right: {
        isEntering: -4,
        isExiting: -4,
      },
    },
  },
  translateY: {
    placement: {
      top: {
        isEntering: 4,
        isExiting: 4,
      },
      bottom: {
        isEntering: -4,
        isExiting: -4,
      },
    },
  },
  opacity: {
    isEntering: 0,
    isExiting: 0,
  },
  overflowWrap: {
    default: "break-word",
  },
});

const arrowStyles = style<TooltipRenderProps>({
  display: "block",
  fill: "gray-800" as never,
  width: 10,
  height: 5,
  rotate: {
    placement: {
      top: 0,
      bottom: "180deg",
      left: "-90deg",
      right: "90deg",
    },
  },
  translateX: {
    placement: {
      left: "-25%",
      right: "25%",
    },
  },
});

/**
 * TooltipTrigger wraps around a trigger element and a Tooltip.
 * It handles opening and closing the Tooltip when the user hovers
 * over or focuses the trigger.
 *
 * @example
 * ```tsx
 * <TooltipTrigger>
 *   <Button>Hover me</Button>
 *   <Tooltip>This is helpful information</Tooltip>
 * </TooltipTrigger>
 * ```
 */
export function TooltipTrigger(props: TooltipTriggerProps): JSX.Element {
  return <HeadlessTooltipTrigger {...props} />;
}

/**
 * Styled tooltip component that displays a description on hover or focus.
 *
 * @example
 * ```tsx
 * <TooltipTrigger placement="top">
 *   <Button>Save</Button>
 *   <Tooltip>Save your changes</Tooltip>
 * </TooltipTrigger>
 * ```
 */
export function Tooltip(props: TooltipProps): JSX.Element {
  const theme = useTheme();
  const [local, rest] = splitProps(props, [
    "children",
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "showArrow",
    "variant",
  ]);

  const showArrow = () => local.showArrow !== false;

  return (
    <HeadlessTooltip
      {...rest}
      arrowBoundaryOffset={8}
      arrowSize={10}
      offset={9}
      class={(renderProps: TooltipRenderProps) =>
        [
          local.UNSAFE_className,
          local.class,
          mergeStyles(
            tooltip({
              ...renderProps,
              placement: renderProps.placement ?? "top",
              colorScheme: theme.colorScheme,
            }),
            local.styles,
          ),
        ]
          .filter(Boolean)
          .join(" ")
      }
      style={local.UNSAFE_style}
    >
      {(renderProps: TooltipRenderProps) => (
        <>
          <Show when={showArrow()}>
            <div
              aria-hidden="true"
              data-rsp-slot="tooltip-arrow"
              style={arrowFrameStyle(renderProps.placement ?? "top")}
            >
              <svg
                class={arrowStyles({ ...renderProps, placement: renderProps.placement ?? "top" })}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 10 5"
              >
                <path d="M4.29289 4.29289L0 0H10L5.70711 4.29289C5.31658 4.68342 4.68342 4.68342 4.29289 4.29289Z" />
              </svg>
            </div>
          </Show>
          {local.children}
        </>
      )}
    </HeadlessTooltip>
  );
}

function arrowFrameStyle(placement: TooltipResolvedPlacement): JSX.CSSProperties {
  const base: JSX.CSSProperties = {
    position: "absolute",
  };

  switch (placement) {
    case "bottom":
      return { ...base, bottom: "100%", left: "50%", transform: "translateX(-50%)" };
    case "left":
      return { ...base, left: "100%", top: "50%", transform: "translateY(-50%)" };
    case "right":
      return { ...base, right: "100%", top: "50%", transform: "translateY(-50%)" };
    case "top":
    default:
      return { ...base, top: "100%", left: "50%", transform: "translateX(-50%)" };
  }
}

export interface SimpleTooltipProps {
  /** The content to show in the tooltip */
  label: string;
  /** The trigger element */
  children: JSX.Element;
  /** Position of the tooltip */
  position?: "top" | "bottom";
  /** Additional CSS class */
  class?: string;
}

/**
 * Simple CSS-only tooltip component.
 * Uses CSS hover effect for performance. No JS state management.
 *
 * @deprecated Use the accessible Tooltip + TooltipTrigger components instead.
 *
 * @example
 * ```tsx
 * <SimpleTooltip label="Save your changes">
 *   <button>Save</button>
 * </SimpleTooltip>
 * ```
 */
export function SimpleTooltip(props: SimpleTooltipProps): JSX.Element {
  const position = () => props.position ?? "bottom";

  return (
    <div class={`vui-tooltip ${props.class ?? ""}`}>
      <div class="vui-tooltip__trigger">{props.children}</div>
      <div class={`vui-tooltip__content vui-tooltip__content--${position()}`}>
        <span>{props.label}</span>
      </div>
    </div>
  );
}

export type { TooltipRenderProps };
