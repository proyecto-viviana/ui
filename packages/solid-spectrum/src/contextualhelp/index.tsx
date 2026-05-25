import {
  type JSX,
  createContext,
  createUniqueId,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import { MenuTriggerContext } from "@proyecto-viviana/solidaria-components";
import { createStringFormatter, filterDOMProps } from "@proyecto-viviana/solidaria";
import { Popover, type PopoverProps, type PopoverTriggerProps } from "../popover";
import { PopoverTrigger } from "../popover";
import { ActionButton, type ActionButtonSize } from "../button/ActionButton";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import { ContentContext, FooterContext, HeadingContext, TextContext } from "../text";
import { HelpCircleIcon } from "../icon/s2wf-icons/HelpCircleIcon";
import { InfoCircleIcon } from "../icon/s2wf-icons/InfoCircleIcon";
import { s2IntlStrings, type S2IntlStrings } from "../intl";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
  type SpectrumContextValue,
} from "../button/spectrum-context";

export type ContextualHelpVariant = "help" | "info";
export type ContextualHelpSize = Extract<ActionButtonSize, "XS" | "S">;

export interface ContextualHelpStyleProps {
  /** Indicates whether contents are informative or provide help. @default 'help' */
  variant?: ContextualHelpVariant;
}

export interface ContextualHelpProps extends Omit<
  PopoverProps,
  | "children"
  | "class"
  | "defaultOpen"
  | "isOpen"
  | "onOpenChange"
  | "padding"
  | "hideArrow"
  | "size"
  | "slot"
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
  /** Id of the element that provides detailed information. */
  "aria-details"?: string;
  /** Slotted context key. */
  slot?: string | null;
  /** Ref for the icon trigger button. */
  ref?: RefLike<HTMLButtonElement>;
}

export interface ContextualHelpPopoverProps extends Omit<
  PopoverProps,
  "children" | "class" | "padding" | "hideArrow" | "size"
> {
  /** Contextual help popover content. */
  children: JSX.Element;
  /** Additional CSS class name. */
  class?: string;
}

export const ContextualHelpContext = createContext<SpectrumContextValue<ContextualHelpProps>>(null);

const contextualHelpFrame = style({
  minWidth: 268,
  width: 268,
  padding: 24,
  boxSizing: "border-box",
});

const contextualHelpInner = style({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  maxHeight: "inherit",
  boxSizing: "border-box",
  outlineStyle: "none",
  overflow: "auto",
  borderRadius: "none",
  padding: 24,
  font: "body-sm",
  color: "neutral",
});

const contextualHelpInnerStyle: JSX.CSSProperties = {
  // React S2 uses calc(self(paddingTop) * -1); the local style macro does not emit
  // negative margin classes for this component, so keep the computed margin explicit.
  margin: "-24px",
};

const contextualHelpHeading = style({
  font: "heading-xs",
  margin: 0,
  marginBottom: 8,
});

const contextualHelpText = style({
  font: "body-sm",
});

const contextualHelpFooter = style({
  font: "body-sm",
  marginTop: 16,
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
  const contentContext = {
    styles: contextualHelpText,
  };
  const footerContext = {
    styles: contextualHelpFooter,
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
      class={local.class}
    >
      <div class={contextualHelpFrame}>
        <div class={contextualHelpInner} style={contextualHelpInnerStyle}>
          <TextContext.Provider value={textContext}>
            <ContentContext.Provider value={contentContext}>
              <FooterContext.Provider value={footerContext}>
                <HeadingContext.Provider value={headingContext}>
                  {local.children}
                </HeadingContext.Provider>
              </FooterContext.Provider>
            </ContentContext.Provider>
          </TextContext.Provider>
        </div>
      </div>
    </Popover>
  );
}

export function ContextualHelp(props: ContextualHelpProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(ContextualHelpContext), props.slot);
  const merged = mergeProps(contextProps ?? {}, props) as ContextualHelpProps;
  const [local, popoverProps] = splitProps(merged, [
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
    "id",
    "ref",
    "slot",
    "aria-label",
    "aria-labelledby",
    "aria-describedby",
    "aria-details",
  ]);
  const titleId = createUniqueId();
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");
  const variant = () => local.variant ?? "help";
  const variantLabel = () =>
    stringFormatter().format(`contextualhelp.${variant()}` as keyof S2IntlStrings);
  const triggerLabel = () => {
    const explicitLabel = local.triggerLabel ?? local["aria-label"];
    return explicitLabel ? `${explicitLabel} ${variantLabel()}` : variantLabel();
  };
  const icon = () => (variant() === "info" ? <InfoCircleIcon /> : <HelpCircleIcon />);
  const content = () => local.content ?? local.children;
  const triggerDomProps = () =>
    filterDOMProps(merged as Record<string, unknown>, { labelable: true });
  const triggerClassName = () =>
    [contextProps?.UNSAFE_className, contextProps?.class, props.UNSAFE_className, props.class]
      .filter(Boolean)
      .join(" ");
  const triggerStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const triggerUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const triggerRef = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLButtonElement> } | null)?.ref,
    props.ref,
  );
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
  const contentContext = {
    styles: contextualHelpText,
  };
  const footerContext = {
    styles: contextualHelpFooter,
  };
  const popoverTriggerProps: Partial<PopoverTriggerProps> = {
    get defaultOpen() {
      return local.defaultOpen;
    },
    get isOpen() {
      return local.isOpen;
    },
    get onOpenChange() {
      return local.onOpenChange;
    },
  };

  return (
    <PopoverTrigger {...popoverTriggerProps}>
      <ActionButton
        {...triggerDomProps()}
        id={local.id}
        aria-label={triggerLabel()}
        aria-labelledby={local["aria-labelledby"]}
        aria-describedby={local["aria-describedby"]}
        aria-details={local["aria-details"]}
        aria-haspopup="dialog"
        ref={(element: HTMLButtonElement) => {
          triggerRef(element);
        }}
        size={local.size ?? "XS"}
        isQuiet
        styles={triggerStyles()}
        UNSAFE_className={triggerClassName()}
        UNSAFE_style={triggerUnsafeStyle()}
      >
        {icon()}
      </ActionButton>
      <Popover
        {...popoverProps}
        aria-label={triggerLabel()}
        placement={popoverProps.placement ?? "bottom start"}
        containerPadding={popoverProps.containerPadding ?? 8}
        offset={8}
        shouldFlip={popoverProps.shouldFlip ?? true}
        padding="none"
      >
        <div class={contextualHelpFrame}>
          <div class={contextualHelpInner} style={contextualHelpInnerStyle}>
            <TextContext.Provider value={textContext}>
              <ContentContext.Provider value={contentContext}>
                <FooterContext.Provider value={footerContext}>
                  <HeadingContext.Provider value={headingContext}>
                    {content()}
                  </HeadingContext.Provider>
                </FooterContext.Provider>
              </ContentContext.Provider>
            </TextContext.Provider>
          </div>
        </div>
      </Popover>
    </PopoverTrigger>
  );
}
