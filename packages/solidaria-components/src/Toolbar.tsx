/**
 * Toolbar component for solidaria-components
 *
 * Pre-wired headless toolbar component that combines aria hooks.
 * Port of react-aria-components/src/Toolbar.tsx
 */

import {
  type JSX,
  type ParentProps,
  createContext,
  createMemo,
  splitProps,
  useContext,
} from "solid-js";
import {
  createToolbar,
  type AriaToolbarProps,
  type Orientation,
} from "@proyecto-viviana/solidaria";
import { type SlotProps, filterDOMProps } from "./utils";

export interface ToolbarRenderProps {
  /** The orientation of the toolbar. */
  orientation: Orientation;
}

export interface ToolbarProps extends AriaToolbarProps, ParentProps, SlotProps {
  /** The CSS className for the element. A function may be provided to receive render props. */
  class?: string | ((renderProps: ToolbarRenderProps) => string);
  /** The inline style for the element. A function may be provided to receive render props. */
  style?: JSX.CSSProperties | ((renderProps: ToolbarRenderProps) => JSX.CSSProperties);
  /** Additional data-* attributes. */
  [key: `data-${string}`]: string | undefined;
  /** Ref for the toolbar element. */
  ref?: ((el: HTMLDivElement) => void) | { current?: HTMLDivElement | null };
}

export interface ToolbarContextValue {
  slots?: {
    [name: string]: Record<string, unknown>;
  };
}

export const ToolbarContext = createContext<ToolbarContextValue | null>(null);

/**
 * A toolbar is a container for a set of interactive controls,
 * such as buttons, checkboxes, or links, with arrow key navigation.
 *
 * @example
 * ```tsx
 * <Toolbar aria-label="Text formatting">
 *   <Button>Bold</Button>
 *   <Button>Italic</Button>
 *   <Button>Underline</Button>
 * </Toolbar>
 *
 * // With render props
 * <Toolbar orientation="vertical">
 *   {({ orientation }) => (
 *     <div data-orientation={orientation}>
 *       <Button>Cut</Button>
 *       <Button>Copy</Button>
 *       <Button>Paste</Button>
 *     </div>
 *   )}
 * </Toolbar>
 * ```
 */
export function Toolbar(props: ToolbarProps): JSX.Element {
  const [local, ariaProps, domProps] = splitProps(
    props,
    ["class", "style", "slot", "children", "ref"],
    ["orientation", "aria-label", "aria-labelledby"],
  );

  const ctx = useContext(ToolbarContext);
  const slotProps = () => {
    if (ctx?.slots && local.slot) {
      return ctx.slots[local.slot] || {};
    }
    return {};
  };

  const { toolbarProps, orientation } = createToolbar({
    get orientation() {
      return ariaProps.orientation;
    },
    get "aria-label"() {
      return (
        (ariaProps["aria-label"] as string | undefined) ??
        (slotProps()["aria-label"] as string | undefined)
      );
    },
    get "aria-labelledby"() {
      return ariaProps["aria-labelledby"] as string | undefined;
    },
  });

  const renderValues = createMemo<ToolbarRenderProps>(() => ({
    orientation: orientation(),
  }));

  const resolvedClass = createMemo(() => {
    const cls = local.class;
    if (typeof cls === "function") {
      return cls(renderValues());
    }
    return cls ?? "solidaria-Toolbar";
  });

  const resolvedStyle = createMemo(() => {
    const style = local.style;
    if (typeof style === "function") {
      return style(renderValues());
    }
    return style;
  });

  const resolvedChildren = createMemo(() => {
    const children = props.children;
    if (typeof children === "function") {
      return (children as (props: ToolbarRenderProps) => JSX.Element)(renderValues());
    }
    return children;
  });

  const filteredDOMProps = createMemo(() => filterDOMProps(domProps, { global: true }));

  return (
    <div
      {...filteredDOMProps()}
      {...toolbarProps}
      class={resolvedClass()}
      style={resolvedStyle()}
      slot={local.slot}
      data-orientation={orientation()}
      ref={(el) => {
        if (!local.ref) return;
        if (typeof local.ref === "function") {
          local.ref(el);
        } else {
          local.ref.current = el;
        }
      }}
    >
      {resolvedChildren()}
    </div>
  );
}
