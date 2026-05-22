/**
 * Disclosure and Accordion components for solidaria-components
 *
 * Disclosure is a widget that can be toggled to show or hide content.
 * Accordion (DisclosureGroup) manages multiple disclosures with optional single-expand.
 *
 * Port of react-aria-components Disclosure.
 */

import {
  type JSX,
  createContext,
  createMemo,
  createSignal,
  splitProps,
  useContext,
} from "solid-js";
import {
  createDisclosureState,
  createDisclosureGroupState,
  type DisclosureState,
  type DisclosureGroupState,
  type DisclosureStateProps,
  type DisclosureGroupStateProps,
} from "@proyecto-viviana/solid-stately";
import {
  createDisclosure,
  createDisclosureGroup,
  createFocusRing,
  mergeProps,
} from "@proyecto-viviana/solidaria";
import {
  type RenderChildren,
  type ClassNameOrFunction,
  type StyleOrFunction,
  useRenderProps,
  filterDOMProps,
  dataAttr,
} from "./utils";

type RefLike<T> = T | ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    (ref as (el: T) => void)(el);
  } else if (typeof ref === "object" && "current" in ref) {
    ref.current = el;
  }
}

export interface DisclosureRenderProps {
  /** Whether the disclosure is expanded. */
  isExpanded: boolean;
  /** Whether the disclosure has keyboard focus within. */
  isFocusVisibleWithin: boolean;
  /** Whether the disclosure is disabled. */
  isDisabled: boolean;
  /** The disclosure state. */
  state: DisclosureState;
}

export interface DisclosureGroupRenderProps {
  /** Whether all items are disabled. */
  isDisabled: boolean;
}

export interface DisclosureProps extends DisclosureStateProps {
  /** The children of the component. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<DisclosureRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<DisclosureRenderProps>;
  /** Whether the disclosure is disabled. */
  isDisabled?: boolean;
  /** A unique identifier for the disclosure (used in groups). */
  id?: string;
  /** A ref for the disclosure root element. */
  ref?: RefLike<HTMLDivElement>;
}

export interface DisclosureGroupProps extends DisclosureGroupStateProps {
  /** The children of the component. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<DisclosureGroupRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<DisclosureGroupRenderProps>;
  /** A ref for the disclosure group root element. */
  ref?: RefLike<HTMLDivElement>;
}

export interface DisclosureTriggerProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "class" | "style" | "type" | "ref"
> {
  /** The children of the trigger. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: string;
  /** The inline style for the element. */
  style?: JSX.CSSProperties;
  /** A ref for the trigger button element. */
  ref?: RefLike<HTMLButtonElement>;
}

export interface DisclosurePanelProps extends Omit<
  JSX.HTMLAttributes<HTMLElement>,
  "children" | "class" | "style" | "role" | "ref"
> {
  /** The children of the panel. */
  children?: RenderChildren<DisclosureRenderProps>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<DisclosureRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<DisclosureRenderProps>;
  /** The accessibility role for the disclosure panel. */
  role?: "group" | "region";
  /** A ref for the panel element. */
  ref?: RefLike<HTMLDivElement>;
}

interface DisclosureContextValue {
  state: DisclosureState;
  isDisabled: () => boolean;
  /** The disclosure ARIA result object - access .buttonProps and .panelProps as getters */
  disclosureAria: {
    readonly buttonProps: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
    readonly panelProps: JSX.HTMLAttributes<HTMLElement>;
    readonly isPressed: () => boolean;
  };
}

export const DisclosureContext = createContext<DisclosureContextValue | null>(null);
export const DisclosureStateContext = createContext<DisclosureState | null>(null);

export function useDisclosureContext(): DisclosureContextValue | null {
  return useContext(DisclosureContext);
}

interface DisclosureGroupContextValue {
  state: DisclosureGroupState;
}

export const DisclosureGroupContext = createContext<DisclosureGroupContextValue | null>(null);
export const DisclosureGroupStateContext = createContext<DisclosureGroupState | null>(null);

export function useDisclosureGroupContext(): DisclosureGroupContextValue | null {
  return useContext(DisclosureGroupContext);
}

/**
 * DisclosureGroup manages a group of Disclosure components.
 * Use this to create an accordion where only one item can be expanded at a time.
 *
 * @example
 * ```tsx
 * <DisclosureGroup>
 *   <Disclosure id="item1">
 *     <DisclosureTrigger>Item 1</DisclosureTrigger>
 *     <DisclosurePanel>Content 1</DisclosurePanel>
 *   </Disclosure>
 *   <Disclosure id="item2">
 *     <DisclosureTrigger>Item 2</DisclosureTrigger>
 *     <DisclosurePanel>Content 2</DisclosurePanel>
 *   </Disclosure>
 * </DisclosureGroup>
 * ```
 */
export function DisclosureGroup(props: DisclosureGroupProps): JSX.Element {
  // IMPORTANT: Don't destructure or access props.children early!
  // In SolidJS, children are lazily evaluated. Accessing them before
  // the context provider renders causes them to evaluate outside the context.
  // See: https://github.com/solidjs/solid/issues/182
  const [local, rest] = splitProps(props, [
    "class",
    "style",
    "allowsMultipleExpanded",
    "isDisabled",
    "expandedKeys",
    "defaultExpandedKeys",
    "onExpandedChange",
    "ref",
  ]);

  // Create group state
  const state = createDisclosureGroupState(() => ({
    allowsMultipleExpanded: local.allowsMultipleExpanded,
    isDisabled: local.isDisabled,
    expandedKeys: local.expandedKeys,
    defaultExpandedKeys: local.defaultExpandedKeys,
    onExpandedChange: local.onExpandedChange,
  }));

  // Create group accessibility props
  const { groupProps } = createDisclosureGroup(() => ({ isDisabled: local.isDisabled }), state);

  const renderValues = createMemo<DisclosureGroupRenderProps>(() => ({
    isDisabled: state.isDisabled,
  }));

  // Resolve render props - don't pass children, we'll render props.children directly
  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-DisclosureGroup",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  const contextValue: DisclosureGroupContextValue = { state };

  // Extract ref from groupProps to avoid type conflicts
  const { ref: _ref, ...cleanGroupProps } = groupProps as Record<string, unknown>;

  return (
    <DisclosureGroupStateContext.Provider value={state}>
      <DisclosureGroupContext.Provider value={contextValue}>
        <div
          ref={(el) => assignRef(local.ref, el)}
          {...domProps()}
          {...cleanGroupProps}
          class={renderProps.class()}
          style={renderProps.style()}
          data-disabled={dataAttr(state.isDisabled)}
        >
          {props.children}
        </div>
      </DisclosureGroupContext.Provider>
    </DisclosureGroupStateContext.Provider>
  );
}

/**
 * Disclosure is a widget that can be toggled to show or hide content.
 *
 * @example
 * ```tsx
 * <Disclosure>
 *   <DisclosureTrigger>Show more</DisclosureTrigger>
 *   <DisclosurePanel>Hidden content here...</DisclosurePanel>
 * </Disclosure>
 * ```
 */
export function Disclosure(props: DisclosureProps): JSX.Element {
  // IMPORTANT: Don't destructure or access props.children early!
  // In SolidJS, children are lazily evaluated. Accessing them before
  // the context provider renders causes them to evaluate outside the context.
  // See: https://github.com/solidjs/solid/issues/182
  const [local, rest] = splitProps(props, [
    "class",
    "style",
    "isDisabled",
    "isExpanded",
    "defaultExpanded",
    "onExpandedChange",
    "id",
    "ref",
  ]);

  // Check if we're inside a DisclosureGroup
  const groupContext = useDisclosureGroupContext();

  // Create disclosure state
  // If in a group, sync with group state
  const state = createDisclosureState(() => {
    const id = local.id;
    if (groupContext && id) {
      return {
        isExpanded: groupContext.state.isExpanded(id),
        onExpandedChange: (expanded: boolean) => {
          if (expanded !== groupContext.state.isExpanded(id)) {
            groupContext.state.toggleKey(id);
          }
          local.onExpandedChange?.(expanded);
        },
      };
    }
    return {
      isExpanded: local.isExpanded,
      defaultExpanded: local.defaultExpanded,
      onExpandedChange: local.onExpandedChange,
    };
  });

  // Panel ref as a signal so the createEffect in createDisclosure can track it
  const [panelRef, setPanelRefSignal] = createSignal<HTMLElement | null>(null);

  // Determine if disabled (used in multiple places)
  const isDisabled = () => local.isDisabled || groupContext?.state.isDisabled || false;

  // Create disclosure accessibility props
  // Pass props as accessor function for reactivity
  // IMPORTANT: Don't destructure! The getters must be called fresh each render
  const disclosureAria = createDisclosure(
    () => ({ isDisabled: isDisabled() }),
    state,
    panelRef, // Pass the accessor directly
  );
  const { isFocusVisible: isFocusVisibleWithin, focusProps: focusWithinProps } = createFocusRing({
    within: true,
  });

  const renderValues = createMemo<DisclosureRenderProps>(() => ({
    isExpanded: state.isExpanded(),
    isFocusVisibleWithin: isFocusVisibleWithin(),
    isDisabled: isDisabled(),
    state,
  }));

  // Resolve render props - don't pass children, we'll render props.children directly
  const renderProps = useRenderProps(
    {
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Disclosure",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  // Context value - pass the disclosureAria object with getters intact
  const contextValue: DisclosureContextValue = {
    state,
    isDisabled, // Pass the accessor function, not the value
    disclosureAria,
  };

  const setPanelRef = (el: HTMLElement | null) => {
    setPanelRefSignal(el);
  };

  return (
    <DisclosureStateContext.Provider value={state}>
      <DisclosureContext.Provider value={contextValue}>
        <DisclosurePanelRefContext.Provider value={setPanelRef}>
          <div
            ref={(el) => assignRef(local.ref, el)}
            {...mergeProps(
              domProps() as Record<string, unknown>,
              focusWithinProps as Record<string, unknown>,
            )}
            class={renderProps.class()}
            style={renderProps.style()}
            data-expanded={dataAttr(state.isExpanded())}
            data-disabled={dataAttr(isDisabled())}
            data-focus-visible-within={dataAttr(isFocusVisibleWithin())}
          >
            {props.children}
          </div>
        </DisclosurePanelRefContext.Provider>
      </DisclosureContext.Provider>
    </DisclosureStateContext.Provider>
  );
}

// Internal context to pass panel ref setter
const DisclosurePanelRefContext = createContext<((el: HTMLElement | null) => void) | null>(null);

/**
 * DisclosureTrigger is the button that toggles the disclosure.
 * Pattern matches SelectTrigger for consistency.
 */
export function DisclosureTrigger(props: DisclosureTriggerProps): JSX.Element {
  // Get context - now safe because parent uses lazy children evaluation
  const context = useContext(DisclosureContext);
  if (!context) {
    throw new Error("DisclosureTrigger must be used within a Disclosure");
  }

  const { state, disclosureAria, isDisabled } = context;

  // Reactive accessors
  const isExpanded = () => state.isExpanded();

  // Get buttonProps from the getter each time - this ensures reactivity
  // IMPORTANT: Call the getter fresh each render to get updated aria-expanded, etc.
  const getButtonProps = () => {
    const { ref: _ref, ...rest } = disclosureAria.buttonProps as Record<string, unknown>;
    return rest;
  };
  const { isFocused, isFocusVisible, focusProps } = createFocusRing();
  const [local, rest] = splitProps(props, ["children", "class", "style", "ref"]);
  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );
  const cleanFocusProps = () => {
    const { ref: _ref, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };

  return (
    <button
      {...mergeProps(domProps() as Record<string, unknown>, getButtonProps(), cleanFocusProps())}
      ref={(el) => assignRef(local.ref, el)}
      type="button"
      class={local.class}
      style={local.style}
      data-expanded={dataAttr(isExpanded())}
      data-disabled={dataAttr(isDisabled())}
      data-pressed={dataAttr(disclosureAria.isPressed())}
      data-focused={dataAttr(isFocused())}
      data-focus-visible={dataAttr(isFocusVisible())}
    >
      {local.children}
    </button>
  );
}

/**
 * DisclosurePanel contains the content that is shown/hidden.
 */
export function DisclosurePanel(props: DisclosurePanelProps): JSX.Element {
  // Get context - now safe because parent uses lazy children evaluation
  const context = useContext(DisclosureContext);
  if (!context) {
    throw new Error("DisclosurePanel must be used within a Disclosure");
  }
  const panelRefSetter = useContext(DisclosurePanelRefContext);

  const [local, rest] = splitProps(props, ["class", "style", "role", "ref"]);
  const { isFocusVisible: isFocusVisibleWithin, focusProps: focusWithinProps } = createFocusRing({
    within: true,
  });

  // Reactive accessors
  const isExpanded = () => context.state.isExpanded();
  const isDisabled = () => context.isDisabled();

  const renderValues = createMemo<DisclosureRenderProps>(() => ({
    isExpanded: isExpanded(),
    isFocusVisibleWithin: isFocusVisibleWithin(),
    isDisabled: isDisabled(),
    state: context.state,
  }));

  const renderProps = useRenderProps(
    {
      children: props.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-DisclosurePanel",
    },
    renderValues,
  );

  const domProps = createMemo(() =>
    filterDOMProps(rest as Record<string, unknown>, { global: true }),
  );

  // Get panelProps from the getter each time - this ensures reactivity
  // IMPORTANT: Call the getter fresh each render to get updated hidden attribute, etc.
  const getPanelProps = () => {
    const { ref: _ref, ...rest } = context.disclosureAria.panelProps as Record<string, unknown>;
    return rest;
  };

  return (
    <div
      {...mergeProps(
        domProps() as Record<string, unknown>,
        focusWithinProps as Record<string, unknown>,
      )}
      {...getPanelProps()}
      ref={(el) => {
        panelRefSetter?.(el);
        assignRef(local.ref, el);
      }}
      role={local.role ?? "group"}
      class={renderProps.class()}
      style={renderProps.style()}
      data-expanded={dataAttr(isExpanded())}
      data-focus-visible-within={dataAttr(isFocusVisibleWithin())}
    >
      {renderProps.renderChildren()}
    </div>
  );
}

export type { DisclosureState, DisclosureGroupState };
