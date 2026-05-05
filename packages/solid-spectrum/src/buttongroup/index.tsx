import { createEffect, createSignal, onCleanup, onMount, type JSX, splitProps } from "solid-js";
import type { StyleString } from "../s2-style";
import { style } from "../s2-style";
import { ButtonGroupContext } from "../button/group-context";
import { s2ButtonGroup } from "../button/s2-action-button-styles";
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
  /** Backward-compatible class alias. Prefer UNSAFE_className for S2 parity. */
  class?: string;
}

export function ButtonGroup(props: ButtonGroupProps): JSX.Element {
  const [local, domProps] = splitProps(props, [
    "class",
    "UNSAFE_className",
    "UNSAFE_style",
    "styles",
    "children",
    "orientation",
    "align",
    "size",
    "isDisabled",
  ]);
  const size = () => local.size ?? "M";
  const orientation = () => local.orientation ?? "horizontal";
  const align = () => local.align ?? "start";
  const [hasOverflow, setHasOverflow] = createSignal(false);
  let groupElement: HTMLDivElement | undefined;
  let resizeObserver: ResizeObserver | undefined;
  let measurementFrame = 0;

  const effectiveOrientation = () =>
    orientation() === "vertical" || hasOverflow() ? "vertical" : "horizontal";
  const className = () =>
    [
      local.UNSAFE_className,
      local.class,
      s2ButtonGroup(
        {
          size: size(),
          orientation: effectiveOrientation(),
          align: align(),
        },
        local.styles,
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

  return (
    <div
      {...domProps}
      ref={(element) => {
        groupElement = element;
      }}
      class={className()}
      style={local.UNSAFE_style}
      data-orientation={effectiveOrientation()}
      data-requested-orientation={orientation()}
      data-disabled={local.isDisabled || undefined}
    >
      <ButtonGroupContext.Provider value={contextValue}>
        {local.children}
      </ButtonGroupContext.Provider>
    </div>
  );
}
