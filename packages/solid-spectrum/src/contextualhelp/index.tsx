import { type JSX, Show, createUniqueId, splitProps, useContext } from "solid-js";
import { MenuTriggerContext } from "@proyecto-viviana/solidaria-components";
import { TooltipTrigger, Tooltip } from "../tooltip";
import { Popover, type PopoverProps } from "../popover";
import { style } from "../s2-style";
import { HeadingContext, TextContext } from "../text";

export interface ContextualHelpProps {
  /** Help trigger content. */
  children?: JSX.Element;
  /** Help text/content rendered in overlay. */
  content: JSX.Element;
  /** Accessible label for the default trigger button. */
  triggerLabel?: string;
  /** Additional CSS class for trigger wrapper. */
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
  const [local] = splitProps(props, ["children", "content", "triggerLabel", "class"]);
  return (
    <TooltipTrigger>
      <Show
        when={local.children}
        fallback={
          <button
            type="button"
            aria-label={local.triggerLabel ?? "More information"}
            class={`inline-flex h-5 w-5 items-center justify-center rounded-full border border-primary-500 text-xs text-primary-200 hover:bg-bg-300 ${local.class ?? ""}`}
          >
            ?
          </button>
        }
      >
        {local.children}
      </Show>
      <Tooltip>{local.content}</Tooltip>
    </TooltipTrigger>
  );
}
