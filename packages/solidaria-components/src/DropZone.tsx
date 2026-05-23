/**
 * DropZone primitive for solidaria-components.
 *
 * A drop target area for drag and drop operations.
 * Parity target: react-aria-components/src/DropZone.tsx
 */

import {
  type JSX,
  createContext,
  createMemo,
  createSignal,
  mergeProps,
  splitProps,
  useContext,
} from "solid-js";
import {
  createDrop,
  createFocusRing,
  createHover,
  readFromDataTransfer,
  type HoverEvents,
  type AriaDropOptions,
} from "@proyecto-viviana/solidaria";
import {
  type ClassNameOrFunction,
  type StyleOrFunction,
  type RenderChildren,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";
import { VisuallyHidden } from "./VisuallyHidden";

export interface DropZoneRenderProps {
  isHovered: boolean;
  isFocused: boolean;
  isFocusVisible: boolean;
  isDropTarget: boolean;
  isDisabled: boolean;
}

export interface DropZoneProps
  extends
    Omit<JSX.HTMLAttributes<HTMLDivElement>, "children" | "class" | "style" | "onDrop">,
    Omit<AriaDropOptions, "hasDropButton">,
    HoverEvents,
    SlotProps {
  children?: RenderChildren<DropZoneRenderProps>;
  class?: ClassNameOrFunction<DropZoneRenderProps>;
  style?: StyleOrFunction<DropZoneRenderProps>;
}

export const DropZoneContext = createContext<DropZoneProps | null>(null);
const DEFAULT_DROPZONE_LABEL = "Drop files";
const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  'input:not([disabled]):not([type="hidden"])',
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]',
].join(",");

function isFocusableElement(target: Element): boolean {
  return target instanceof HTMLElement && target.matches(FOCUSABLE_SELECTOR);
}

/**
 * A drop zone is an area into which one or multiple objects can be dropped.
 */
export function DropZone(props: DropZoneProps): JSX.Element {
  const contextProps = useContext(DropZoneContext);
  const mergedProps = mergeProps(contextProps ?? {}, props);
  const [local, dropProps, hoverEventProps, domProps] = splitProps(
    mergedProps,
    ["children", "class", "style", "slot", "aria-label", "aria-labelledby"],
    [
      "getDropOperation",
      "getDropOperationForPoint",
      "onDropEnter",
      "onDropMove",
      "onDropActivate",
      "onDropExit",
      "onDrop",
      "isDisabled",
    ],
    ["onHoverStart", "onHoverEnd", "onHoverChange"],
  );

  const [dropZoneRef, setDropZoneRef] = createSignal<HTMLDivElement | null>(null);
  const [dropButtonRef, setDropButtonRef] = createSignal<HTMLButtonElement | null>(null);

  const dropAria = createDrop(() => ({
    getDropOperation: dropProps.getDropOperation,
    getDropOperationForPoint: dropProps.getDropOperationForPoint,
    onDropEnter: dropProps.onDropEnter,
    onDropMove: dropProps.onDropMove,
    onDropActivate: dropProps.onDropActivate,
    onDropExit: dropProps.onDropExit,
    onDrop: dropProps.onDrop,
    hasDropButton: true,
    isDisabled: dropProps.isDisabled,
  }));

  const { isHovered, hoverProps } = createHover(() => ({
    isDisabled: dropProps.isDisabled,
    onHoverStart: hoverEventProps.onHoverStart,
    onHoverEnd: hoverEventProps.onHoverEnd,
    onHoverChange: hoverEventProps.onHoverChange,
  }));
  const { isFocused, isFocusVisible, focusProps } = createFocusRing();

  const renderValues = createMemo<DropZoneRenderProps>(() => ({
    isHovered: isHovered(),
    isFocused: isFocused(),
    isFocusVisible: isFocusVisible(),
    isDropTarget: dropAria.isDropTarget,
    isDisabled: !!dropProps.isDisabled,
  }));

  const renderProps = useRenderProps(
    {
      children: local.children,
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-DropZone",
    },
    renderValues,
  );

  const filteredDomProps = createMemo(() => filterDOMProps(domProps, { global: true }));

  const cleanDropProps = () => {
    const { ref: _ref, ...rest } = dropAria.dropProps as Record<string, unknown>;
    return rest;
  };
  const cleanHoverProps = () => {
    const { ref: _ref, ...rest } = hoverProps as Record<string, unknown>;
    return rest;
  };
  const cleanFocusProps = () => {
    const { ref: _ref, ...rest } = focusProps as Record<string, unknown>;
    return rest;
  };
  const cleanDropButtonProps = () => {
    const { ref: _ref, ...rest } = dropAria.dropButtonProps as Record<string, unknown>;
    return rest;
  };

  const onRootClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (e) => {
    const onClick = (filteredDomProps() as JSX.HTMLAttributes<HTMLDivElement>).onClick as
      | JSX.EventHandler<HTMLDivElement, MouseEvent>
      | undefined;
    onClick?.(e);
    if (e.defaultPrevented || dropProps.isDisabled) {
      return;
    }

    const root = dropZoneRef();
    const hiddenButton = dropButtonRef();
    if (!root || !hiddenButton) {
      return;
    }

    let target: Element | null = e.target instanceof Element ? e.target : root;
    while (target && root.contains(target)) {
      if (isFocusableElement(target)) {
        return;
      }
      if (target === root) {
        hiddenButton.focus();
        return;
      }
      target = target.parentElement;
    }
  };

  const onHiddenButtonPaste: JSX.EventHandler<HTMLButtonElement, ClipboardEvent> = (e) => {
    if (dropProps.isDisabled || !e.clipboardData) {
      return;
    }

    const items = readFromDataTransfer(e.clipboardData);
    if (items.length === 0) {
      return;
    }

    e.preventDefault();
    dropProps.onDrop?.({
      type: "drop",
      x: 0,
      y: 0,
      items,
      dropOperation: "copy",
    });
  };

  const dropButtonAriaLabel = createMemo(
    () => local["aria-label"] ?? (!local["aria-labelledby"] ? DEFAULT_DROPZONE_LABEL : undefined),
  );

  return (
    <div
      ref={setDropZoneRef}
      {...filteredDomProps()}
      {...cleanDropProps()}
      {...cleanHoverProps()}
      onClick={onRootClick}
      class={renderProps.class()}
      style={renderProps.style()}
      slot={local.slot}
      data-hovered={isHovered() || undefined}
      data-focused={isFocused() || undefined}
      data-focus-visible={isFocusVisible() || undefined}
      data-drop-target={dropAria.isDropTarget || undefined}
      data-disabled={dropProps.isDisabled || undefined}
    >
      <VisuallyHidden>
        <button
          ref={setDropButtonRef}
          {...cleanDropButtonProps()}
          {...cleanFocusProps()}
          aria-label={dropButtonAriaLabel()}
          aria-labelledby={local["aria-labelledby"]}
          onPaste={onHiddenButtonPaste}
        />
      </VisuallyHidden>
      {renderProps.renderChildren()}
    </div>
  );
}
