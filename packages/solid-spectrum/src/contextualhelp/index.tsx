import { type JSX, createUniqueId, splitProps, useContext } from "solid-js";
import { MenuTriggerContext } from "@proyecto-viviana/solidaria-components";
import { Popover, type PopoverProps } from "../popover";
import { PopoverTrigger } from "../popover";
import { ActionButton, type ActionButtonSize } from "../button/ActionButton";
import { style, type StyleString } from "../s2-style";
import { HeadingContext, TextContext } from "../text";
import { HelpCircleIcon } from "../icon/s2wf-icons/HelpCircleIcon";
import { InfoCircleIcon } from "../icon/s2wf-icons/InfoCircleIcon";

export type ContextualHelpVariant = "help" | "info";
export type ContextualHelpSize = Extract<ActionButtonSize, "XS" | "S">;

export interface ContextualHelpProps extends Omit<
  PopoverProps,
  | "children"
  | "class"
  | "defaultOpen"
  | "isOpen"
  | "onOpenChange"
  | "padding"
  | "showArrow"
  | "size"
  | "trigger"
> {
  /** Contextual help popover content. */
  children?: JSX.Element;
  /** Backward-compatible content alias. Prefer children for S2 parity. */
  content?: JSX.Element;
  /** Accessible label for the icon trigger button. */
  triggerLabel?: string;
  /** Indicates whether contents are informative or provide help. @default 'help' */
  variant?: ContextualHelpVariant;
  /** Size of the trigger ActionButton. @default 'XS' */
  size?: ContextualHelpSize;
  /** Whether the overlay is open by default (uncontrolled). */
  defaultOpen?: boolean;
  /** Whether the overlay is open (controlled). */
  isOpen?: boolean;
  /** Handler called when the overlay's open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Spectrum-defined generated classes for the trigger. */
  styles?: StyleString;
  /** Additional CSS class name for the trigger. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles for the trigger. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** Backward-compatible trigger class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
}

export interface ContextualHelpPopoverProps extends Omit<
  PopoverProps,
  "children" | "class" | "padding" | "showArrow" | "size"
> {
  /** Contextual help popover content. */
  children: JSX.Element;
  /** Additional CSS class name. */
  class?: string;
}

const contextualHelpFrame = style({
  minWidth: 268,
  width: 268,
  padding: 24,
  boxSizing: "border-box",
  height: "full",
});

const contextualHelpInner = style({
  borderRadius: "none",
  padding: 24,
  margin: "[calc(24px * -1)]",
  font: "body-sm",
  color: "neutral",
});

const contextualHelpHeading = style({
  font: "heading-xs",
  margin: 0,
  marginBottom: 8,
});

const contextualHelpText = style({
  font: "body-sm",
});

/**
 * A popover with contextual help sizing for unavailable menu item affordances.
 */
export function ContextualHelpPopover(props: ContextualHelpPopoverProps): JSX.Element {
  const [local, popoverProps] = splitProps(props, ["children", "class"]);
  const menuTriggerContext = useContext(MenuTriggerContext);
  const titleId = createUniqueId();
  const menuTriggerMenuProps = () => menuTriggerContext?.menuProps as { id?: string } | undefined;
  const popoverId = () => popoverProps.id ?? menuTriggerMenuProps()?.id;
  const ariaLabelledBy = () =>
    popoverProps["aria-labelledby"] ?? (popoverProps["aria-label"] ? undefined : titleId);
  const headingContext = {
    slots: {
      default: {
        id: titleId,
        level: 2 as const,
        styles: contextualHelpHeading,
      },
      title: {
        id: titleId,
        level: 2 as const,
        styles: contextualHelpHeading,
      },
    },
  };
  const textContext = {
    slots: {
      default: {
        styles: contextualHelpText,
        "data-rsp-slot": "text",
      },
    },
  };

  return (
    <Popover
      {...popoverProps}
      id={popoverId()}
      aria-labelledby={ariaLabelledBy()}
      trigger="SubmenuTrigger"
      placement={popoverProps.placement ?? "end top"}
      offset={popoverProps.offset ?? -2}
      crossOffset={popoverProps.crossOffset ?? -8}
      padding="none"
      class={[contextualHelpFrame, local.class].filter(Boolean).join(" ")}
    >
      <div class={contextualHelpInner}>
        <TextContext.Provider value={textContext}>
          <HeadingContext.Provider value={headingContext}>{local.children}</HeadingContext.Provider>
        </TextContext.Provider>
      </div>
    </Popover>
  );
}

export function ContextualHelp(props: ContextualHelpProps): JSX.Element {
  const [local, popoverProps] = splitProps(props, [
    "children",
    "content",
    "triggerLabel",
    "variant",
    "size",
    "defaultOpen",
    "isOpen",
    "onOpenChange",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "class",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
  ]);
  const titleId = createUniqueId();
  const variant = () => local.variant ?? "help";
  const triggerLabel = () =>
    local.triggerLabel ??
    local["aria-label"] ??
    (variant() === "info" ? "More information" : "Contextual help");
  const icon = () => (variant() === "info" ? <InfoCircleIcon /> : <HelpCircleIcon />);
  const content = () => local.content ?? local.children;
  const headingContext = {
    slots: {
      default: {
        id: titleId,
        level: 2 as const,
        styles: contextualHelpHeading,
      },
      title: {
        id: titleId,
        level: 2 as const,
        styles: contextualHelpHeading,
      },
    },
  };
  const textContext = {
    slots: {
      default: {
        styles: contextualHelpText,
        "data-rsp-slot": "text",
      },
    },
  };

  return (
    <PopoverTrigger
      defaultOpen={local.defaultOpen}
      isOpen={local.isOpen}
      onOpenChange={local.onOpenChange}
    >
      <ActionButton
        aria-label={triggerLabel()}
        aria-labelledby={local["aria-labelledby"]}
        aria-describedby={local["aria-describedby"]}
        aria-haspopup="dialog"
        size={local.size ?? "XS"}
        isQuiet
        styles={local.styles}
        UNSAFE_className={[local.UNSAFE_className, local.class].filter(Boolean).join(" ")}
        UNSAFE_style={local.UNSAFE_style}
      >
        {icon()}
      </ActionButton>
      <Popover
        {...popoverProps}
        aria-label={triggerLabel()}
        placement={popoverProps.placement ?? "bottom start"}
        offset={popoverProps.offset ?? 8}
        shouldFlip={popoverProps.shouldFlip ?? true}
        padding="none"
        class={contextualHelpFrame}
      >
        <div class={contextualHelpInner}>
          <TextContext.Provider value={textContext}>
            <HeadingContext.Provider value={headingContext}>{content()}</HeadingContext.Provider>
          </TextContext.Provider>
        </div>
      </Popover>
    </PopoverTrigger>
  );
}
