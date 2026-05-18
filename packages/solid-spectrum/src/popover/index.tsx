import { type JSX, Show, splitProps } from "solid-js";
import {
  Popover as HeadlessPopover,
  PopoverTrigger as HeadlessPopoverTrigger,
  OverlayArrow as HeadlessOverlayArrow,
  type PopoverProps as HeadlessPopoverProps,
  type PopoverTriggerProps as HeadlessPopoverTriggerProps,
  type PopoverRenderProps,
} from "@proyecto-viviana/solidaria-components";

export type PopoverPlacement = NonNullable<HeadlessPopoverProps["placement"]>;
export type Placement = PopoverPlacement;
export type PlacementAxis = NonNullable<PopoverRenderProps["placement"]>;
export type PopoverSize = "sm" | "md" | "lg";

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
  /** Whether to show an arrow pointing to the trigger. */
  showArrow?: boolean;
  /** Custom padding inside the popover. */
  padding?: "none" | "sm" | "md" | "lg";
}

const baseStyles = [
  "bg-bg-300",
  "rounded-lg",
  "shadow-xl",
  "border border-primary-700",
  "text-primary-200",
  "outline-none",
  "animate-in fade-in-0 zoom-in-95",
  "data-[placement=top]:slide-in-from-bottom-2",
  "data-[placement=bottom]:slide-in-from-top-2",
  "data-[placement=left]:slide-in-from-right-2",
  "data-[placement=right]:slide-in-from-left-2",
  "data-[exiting]:animate-out data-[exiting]:fade-out-0 data-[exiting]:zoom-out-95",
].join(" ");

const sizeStyles: Record<PopoverSize, string> = {
  sm: "max-w-xs",
  md: "max-w-sm",
  lg: "max-w-lg",
};

const paddingStyles: Record<string, string> = {
  none: "",
  sm: "p-2",
  md: "p-4",
  lg: "p-6",
};

const arrowBaseStyles = ["fill-bg-300", "stroke-primary-700", "stroke-1"].join(" ");

const getArrowRotation = (placement: PlacementAxis | null): string => {
  switch (placement) {
    case "top":
      return "rotate-180";
    case "bottom":
      return "";
    case "left":
      return "rotate-90";
    case "right":
      return "-rotate-90";
    default:
      return "";
  }
};

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
 *   <Popover placement="bottom" size="md">
 *     <h3>Settings</h3>
 *     <p>Configure your preferences here.</p>
 *   </Popover>
 * </PopoverTrigger>
 * ```
 */
export function Popover(props: PopoverProps): JSX.Element {
  const [local, rest] = splitProps(props, ["placement", "size", "class", "showArrow", "padding"]);

  const placement = () => local.placement ?? "bottom";
  const size = () => local.size ?? "md";
  const padding = () => local.padding ?? "md";

  return (
    <HeadlessPopover
      {...rest}
      placement={placement()}
      class={(_renderProps: PopoverRenderProps) => {
        const classes = [
          baseStyles,
          sizeStyles[size()],
          paddingStyles[padding()],
          local.class ?? "",
        ]
          .filter(Boolean)
          .join(" ");
        return classes;
      }}
    >
      {(renderProps: PopoverRenderProps) => (
        <>
          <Show when={local.showArrow}>
            <PopoverArrow placement={renderProps.placement} />
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
  /** Additional CSS class. */
  class?: string;
}

function PopoverArrow(props: PopoverArrowProps): JSX.Element {
  return (
    <HeadlessOverlayArrow
      class="absolute block"
      style={{
        ...(props.placement === "top" && {
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
        }),
        ...(props.placement === "bottom" && {
          top: "-8px",
          left: "50%",
          transform: "translateX(-50%)",
        }),
        ...(props.placement === "left" && {
          right: "100%",
          top: "50%",
          transform: "translateY(-50%)",
        }),
        ...(props.placement === "right" && {
          left: "-8px",
          top: "50%",
          transform: "translateY(-50%)",
        }),
      }}
    >
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        class={`${arrowBaseStyles} ${getArrowRotation(props.placement)} ${props.class ?? ""}`}
      >
        <path d="M0 0 L6 6 L12 0" />
      </svg>
    </HeadlessOverlayArrow>
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
