import { type JSX, Show, splitProps } from "solid-js";
import {
  Popover as HeadlessPopover,
  PopoverTrigger as HeadlessPopoverTrigger,
  OverlayArrow as HeadlessOverlayArrow,
  type PopoverProps as HeadlessPopoverProps,
  type PopoverTriggerProps as HeadlessPopoverTriggerProps,
  type PopoverRenderProps,
} from "@proyecto-viviana/solidaria-components";
import type { StyleString } from "../style";
import { lightDark, setColorScheme, style } from "../style" with { type: "macro" };
import { mergeStyles } from "../style/runtime";
import { useTheme, type ColorScheme } from "../provider";

export type PopoverPlacement = NonNullable<HeadlessPopoverProps["placement"]>;
export type Placement = PopoverPlacement;
export type PlacementAxis = NonNullable<PopoverRenderProps["placement"]>;
export type PopoverSize = "S" | "M" | "L";
export type PopoverPadding = "none" | "sm" | "md" | "lg";

export interface PopoverTriggerProps extends HeadlessPopoverTriggerProps {
  /** The children of the popover trigger (trigger element and popover). */
  children: JSX.Element;
}

export interface PopoverProps extends Omit<HeadlessPopoverProps, "class" | "style" | "children"> {
  /** The content of the popover. */
  children: JSX.Element;
  /** DOM id for the popover element. */
  id?: string;
  /** Accessible label for the popover. */
  "aria-label"?: string;
  /** Id of the element that labels the popover. */
  "aria-labelledby"?: string;
  /** Id of the element that describes the popover. */
  "aria-describedby"?: string;
  /** The position of the popover relative to the trigger. */
  placement?: PopoverPlacement;
  /** Size variant of the popover. */
  size?: PopoverSize;
  /** Additional CSS class name. */
  class?: string;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Whether to hide the arrow pointing to the trigger. */
  hideArrow?: boolean;
  /** Custom padding inside the popover. */
  padding?: PopoverPadding;
}

const popoverStyles = style<
  PopoverRenderProps & {
    colorScheme: ColorScheme | null;
    isArrowShown: boolean;
    isSubmenu: boolean;
    size?: PopoverSize;
  }
>({
  ...setColorScheme(),
  "--s2-container-bg": {
    type: "backgroundColor",
    value: {
      default: "layer-2",
      forcedColors: "Background",
    },
  },
  backgroundColor: "--s2-container-bg",
  borderRadius: "lg",
  filter: {
    isArrowShown: "elevated",
  },
  boxShadow: {
    default: "elevated",
    isArrowShown: "none",
  },
  outlineStyle: "solid",
  outlineWidth: 1,
  outlineColor: {
    default: lightDark("transparent-white-25", "gray-200"),
    forcedColors: "ButtonBorder",
  },
  width: {
    size: {
      S: 336,
      M: 416,
      L: 576,
    },
  },
  maxWidth: "calc(100vw - 24px)",
  boxSizing: "border-box",
  display: "flex",
  opacity: {
    isEntering: 0,
    isExiting: 0,
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
    isSubmenu: 0,
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
    isSubmenu: 0,
  },
  transition: "[opacity, translate]",
  transitionDuration: 200,
  transitionTimingFunction: {
    isExiting: "in",
  },
  isolation: "isolate",
  pointerEvents: {
    isExiting: "none",
  },
});

const paddingStyles: Record<PopoverPadding, StyleString> = {
  none: style({ padding: 0 }),
  sm: style({ padding: 8 }),
  md: style({ padding: 16 }),
  lg: style({ padding: 24 }),
};

const arrowStyles = style<PopoverRenderProps>({
  display: "block",
  fill: "--s2-container-bg",
  width: 18,
  height: 9,
  rotate: {
    default: 180,
    placement: {
      top: 0,
      bottom: 180,
      left: -90,
      right: 90,
    },
  },
  translateX: {
    placement: {
      left: "-25%",
      right: "25%",
    },
  },
  strokeWidth: 1,
  stroke: {
    default: lightDark("transparent-white-25", "gray-200"),
    forcedColors: "ButtonBorder",
  },
});

/**
 * PopoverTrigger wraps around a trigger element and a Popover.
 * It handles opening and closing the Popover when the user interacts
 * with the trigger.
 *
 * @example
 * ```tsx
 * <PopoverTrigger>
 *   <Button>Open Popover</Button>
 *   <Popover>
 *     <p>Popover content here!</p>
 *   </Popover>
 * </PopoverTrigger>
 * ```
 */
export function PopoverTrigger(props: PopoverTriggerProps): JSX.Element {
  return <HeadlessPopoverTrigger {...props} />;
}

/**
 * Styled popover component that displays content in an overlay.
 *
 * @example
 * ```tsx
 * <PopoverTrigger>
 *   <Button>Settings</Button>
 *   <Popover placement="bottom" size="M">
 *     <h3>Settings</h3>
 *     <p>Configure your preferences here.</p>
 *   </Popover>
 * </PopoverTrigger>
 * ```
 */
export function Popover(props: PopoverProps): JSX.Element {
  const theme = useTheme();
  let arrowElement: SVGSVGElement | null = null;
  const [local, rest] = splitProps(props, [
    "placement",
    "size",
    "class",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "hideArrow",
    "padding",
    "offset",
    "arrowRef",
  ]);

  const placement = () => local.placement ?? "bottom";
  const padding = () => local.padding ?? "md";
  const offset = () => (local.offset ?? 8) + (local.hideArrow ? 0 : 8);
  const setArrowElement = (element: SVGSVGElement | null) => {
    arrowElement = element;
  };
  const arrowRef = () => (local.hideArrow ? (local.arrowRef?.() ?? null) : arrowElement);

  return (
    <HeadlessPopover
      {...rest}
      placement={placement()}
      offset={offset()}
      arrowRef={arrowRef}
      class={(renderProps: PopoverRenderProps) => {
        return [
          local.UNSAFE_className,
          local.class ?? "",
          mergeStyles(
            popoverStyles({
              ...renderProps,
              colorScheme: theme.colorScheme,
              isArrowShown: !local.hideArrow,
              isSubmenu: renderProps.trigger === "SubmenuTrigger",
              size: local.size,
              trigger: renderProps.trigger,
            }),
            paddingStyles[padding()],
            local.styles,
          ),
        ]
          .filter(Boolean)
          .join(" ");
      }}
      style={local.UNSAFE_style}
    >
      {(renderProps: PopoverRenderProps) => (
        <>
          <Show when={!local.hideArrow}>
            <PopoverArrow placement={renderProps.placement} setArrowElement={setArrowElement} />
          </Show>
          {props.children}
        </>
      )}
    </HeadlessPopover>
  );
}

/**
 * Arrow component for the popover.
 * Automatically positions itself based on the popover placement.
 */
interface PopoverArrowProps {
  /** The current placement axis. */
  placement: PlacementAxis | null;
  /** Sets the arrow element for positioning measurements. */
  setArrowElement: (element: SVGSVGElement | null) => void;
  /** Additional CSS class. */
  class?: string;
}

function PopoverArrow(props: PopoverArrowProps): JSX.Element {
  const placement = () => props.placement ?? "bottom";

  return (
    <HeadlessOverlayArrow
      class="absolute block data-[placement=bottom]:bottom-full data-[placement=top]:top-full data-[placement=left]:left-full data-[placement=right]:right-full"
      render={() => (
        <svg
          ref={props.setArrowElement}
          width="18"
          height="9"
          viewBox="0 0 18 10"
          class={[
            arrowStyles({
              trigger: null,
              placement: placement(),
              isEntering: false,
              isExiting: false,
            }),
            props.class ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          <path
            transform="translate(0 -1)"
            d="M1 1L7.93799 8.52588C8.07224 8.67448 8.23607 8.79362 8.41895 8.87524C8.60182 8.95687 8.79973 8.9993 9 9C9.19984 8.99882 9.39724 8.95606 9.57959 8.87427C9.76193 8.79248 9.9253 8.67336 10.0591 8.5249L17 1"
          />
        </svg>
      )}
    />
  );
}

export interface PopoverHeaderProps {
  /** The title of the popover. */
  title: string;
  /** Optional description text. */
  description?: string;
  /** Additional CSS class. */
  class?: string;
}

/**
 * Header section for popover with title and optional description.
 */
export function PopoverHeader(props: PopoverHeaderProps): JSX.Element {
  return (
    <div class={`mb-3 ${props.class ?? ""}`}>
      <h3 class="text-lg font-semibold text-primary-100">{props.title}</h3>
      <Show when={props.description}>
        <p class="text-sm text-primary-400 mt-1">{props.description}</p>
      </Show>
    </div>
  );
}

export interface PopoverFooterProps {
  /** Footer content, typically buttons. */
  children: JSX.Element;
  /** Additional CSS class. */
  class?: string;
}

/**
 * Footer section for popover actions.
 */
export function PopoverFooter(props: PopoverFooterProps): JSX.Element {
  return (
    <div
      class={`flex gap-2 justify-end mt-4 pt-3 border-t border-primary-700 ${props.class ?? ""}`}
    >
      {props.children}
    </div>
  );
}

export type { PopoverRenderProps };
