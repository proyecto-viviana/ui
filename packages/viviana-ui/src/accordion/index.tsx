import { type JSX, createContext, mergeProps, useContext } from "solid-js";
import {
  Disclosure,
  DisclosureContext,
  DisclosureGroup,
  DisclosureHeader,
  DisclosurePanel,
  DisclosureTitle,
  type DisclosureDensity,
  type DisclosureGroupProps,
  type DisclosureHeaderProps,
  type DisclosurePanelProps,
  type DisclosureProps,
  type DisclosureSize,
  type DisclosureTitleProps,
  type DisclosureVariant,
} from "../disclosure";
import { getSlottedContextProps, type SpectrumContextValue } from "../button/spectrum-context";

export type AccordionSize = DisclosureSize;
export type AccordionDensity = DisclosureDensity;
export type AccordionVariant = DisclosureVariant;

export interface AccordionProps extends DisclosureGroupProps {
  /** The accordion item elements in the accordion. */
  children?: JSX.Element;
}

export interface AccordionItemProps extends DisclosureProps {
  /** The contents of the accordion item, consisting of a title and panel. */
  children?: JSX.Element;
}

export interface AccordionItemHeaderProps extends DisclosureHeaderProps {
  /** The contents of the accordion item header. */
  children?: JSX.Element;
}

export interface AccordionItemTitleProps extends DisclosureTitleProps {
  /** The contents of the accordion item title. */
  children?: JSX.Element;
}

export interface AccordionItemPanelProps extends DisclosurePanelProps {
  /** The contents of the accordion item panel. */
  children?: JSX.Element;
}

export const AccordionContext = createContext<SpectrumContextValue<AccordionProps>>(null);

/**
 * An accordion is a container for multiple accordion items.
 */
export function Accordion(props: AccordionProps): JSX.Element {
  const contextProps = getSlottedContextProps(useContext(AccordionContext), props.slot);
  const mergedProps = mergeProps(contextProps ?? {}, props);

  return <DisclosureGroup {...mergedProps} />;
}

/**
 * An accordion item is a collapsible section of content.
 */
export function AccordionItem(props: AccordionItemProps): JSX.Element {
  return <Disclosure {...props} />;
}

/**
 * A wrapper element for the accordion item title that can contain other
 * elements not part of the trigger.
 */
export function AccordionItemHeader(props: AccordionItemHeaderProps): JSX.Element {
  return <DisclosureHeader {...props} />;
}

/**
 * An accordion item title consisting of a heading and trigger button.
 */
export function AccordionItemTitle(props: AccordionItemTitleProps): JSX.Element {
  return <DisclosureTitle {...props} />;
}

/**
 * An accordion item panel is hidden until its item is expanded.
 */
export function AccordionItemPanel(props: AccordionItemPanelProps): JSX.Element {
  return <DisclosurePanel {...props} />;
}

export { Disclosure, DisclosureContext, DisclosureHeader, DisclosurePanel, DisclosureTitle };

export const AccordionHeader = AccordionItemHeader;
export const AccordionPanel = AccordionItemPanel;
export const AccordionTitle = AccordionItemTitle;

export type AccordionHeaderProps = AccordionItemHeaderProps;
export type AccordionPanelProps = AccordionItemPanelProps;
export type AccordionTitleProps = AccordionItemTitleProps;
