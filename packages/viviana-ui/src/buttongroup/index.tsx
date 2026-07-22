import {
  createEffect,
  createSignal,
  mergeProps,
  onCleanup,
  onMount,
  type JSX,
  splitProps,
} from "solid-js";
import type { StyleString } from "../style";
import { style } from "../style" with { type: "macro" };
import { ButtonContext, LinkButtonContext } from "../button/context";
import { useButtonGroupContext } from "../button/group-context";
import { s2ButtonGroup } from "../button/s2-action-button-styles";
import { useProviderProps } from "../provider";
import {
  getSlottedContextProps,
  mergeContextRefs,
  mergeContextStyles,
  mergeContextUnsafeStyle,
  type RefLike,
} from "../button/spectrum-context";
import type { ButtonSize } from "../button/types";

export interface ButtonGroupProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "class" | "style" | "children"
> {
  /** The Buttons contained within the ButtonGroup. */
  children?: JSX.Element;
  /** The axis the ButtonGroup should align with. @default 'horizontal' */
  orientation?: "horizontal" | "vertical";
  /** The alignment of the Buttons within the ButtonGroup. @default 'start' */
  align?: "start" | "end" | "center";
  /** The size of the Buttons within the ButtonGroup. @default 'M' */
  size?: ButtonSize;
  /** Whether the Buttons in the ButtonGroup are all disabled. */
  isDisabled?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString;
  /** Additional CSS class name. Use only as a last resort. */
  UNSAFE_className?: string;
  /** Additional inline styles. Use only as a last resort. */
  UNSAFE_style?: JSX.CSSProperties;
  /** @internal Whether a parent context should suppress rendering the group. */
  isHidden?: boolean;
}

export function ButtonGroup(props: ButtonGroupProps): JSX.Element {
  const providerProps = useProviderProps(props);
  const contextProps = getSlottedContextProps(useButtonGroupContext(), props.slot);
  const merged = mergeProps(providerProps, contextProps ?? {}, props);
  const [local, domProps] = splitProps(merged, [
    "UNSAFE_className",
    "UNSAFE_style",
    "styles",
    "children",
    "orientation",
    "align",
    "size",
    "isDisabled",
    "isHidden",
    "ref",
  ]);
  const size = () => local.size ?? "M";
  const orientation = () => local.orientation ?? "horizontal";
  const align = () => local.align ?? "start";
  const mergedStyles = () => mergeContextStyles(contextProps?.styles, props.styles);
  const mergedUnsafeStyle = () =>
    mergeContextUnsafeStyle(contextProps?.UNSAFE_style, props.UNSAFE_style);
  const [hasOverflow, setHasOverflow] = createSignal(false);
  let groupElement: HTMLDivElement | undefined;
  const assignGroupRefs = mergeContextRefs(
    (contextProps as { ref?: RefLike<HTMLDivElement> } | null)?.ref,
    props.ref as RefLike<HTMLDivElement>,
  );
  let resizeObserver: ResizeObserver | undefined;
  let measurementFrame = 0;

  const effectiveOrientation = () =>
    orientation() === "vertical" || hasOverflow() ? "vertical" : "horizontal";
  const className = () =>
    [
      local.UNSAFE_className,
      s2ButtonGroup(
        {
          size: size(),
          orientation: effectiveOrientation(),
          align: align(),
        },
        mergedStyles(),
      ),
    ]
      .filter(Boolean)
      .join(" ");

  const measureOverflow = () => {
    if (!groupElement || orientation() !== "horizontal") {
      setHasOverflow(false);
      return;
    }

    const maxX = groupElement.offsetWidth + 1;
    const overflows = Array.from(groupElement.children).some((child) => {
      const element = child as HTMLElement;
      return element.offsetLeft < 0 || element.offsetLeft + element.offsetWidth > maxX;
    });
    setHasOverflow(overflows);
  };

  const scheduleOverflowCheck = () => {
    if (typeof requestAnimationFrame !== "function") {
      measureOverflow();
      return;
    }

    if (measurementFrame) {
      cancelAnimationFrame(measurementFrame);
    }

    if (orientation() !== "horizontal") {
      setHasOverflow(false);
      return;
    }

    setHasOverflow(false);
    measurementFrame = requestAnimationFrame(() => {
      measurementFrame = 0;
      measureOverflow();
    });
  };

  onMount(() => {
    if (typeof ResizeObserver !== "undefined" && groupElement?.parentElement) {
      resizeObserver = new ResizeObserver(scheduleOverflowCheck);
      resizeObserver.observe(groupElement.parentElement);
    }
    scheduleOverflowCheck();
  });

  createEffect(() => {
    orientation();
    align();
    size();
    local.children;
    local.UNSAFE_style;
    scheduleOverflowCheck();
  });

  onCleanup(() => {
    if (measurementFrame) {
      cancelAnimationFrame(measurementFrame);
    }
    resizeObserver?.disconnect();
  });

  const contextValue = {
    get size() {
      return size();
    },
    get isDisabled() {
      return local.isDisabled;
    },
    get styles() {
      return style({ flexShrink: 0 });
    },
  };

  if (local.isHidden) {
    return null;
  }

  return (
    <div
      {...domProps}
      ref={(element) => {
        groupElement = element;
        assignGroupRefs(element);
      }}
      class={className()}
      style={mergedUnsafeStyle()}
    >
      <ButtonContext.Provider value={contextValue}>
        <LinkButtonContext.Provider value={contextValue}>
          {local.children}
        </LinkButtonContext.Provider>
      </ButtonContext.Provider>
    </div>
  );
}
