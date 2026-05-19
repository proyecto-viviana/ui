import { type JSX, splitProps, Show, createContext, useContext } from "solid-js";
import {
  Dialog as HeadlessDialog,
  DialogTrigger as HeadlessDialogTrigger,
  Heading as HeadlessDialogHeading,
  Modal as HeadlessModal,
  ModalOverlay as HeadlessModalOverlay,
  useDialogTrigger,
  type DialogProps as HeadlessDialogProps,
} from "@proyecto-viviana/solidaria-components";
import CrossIcon from "../icon/ui-icons/Cross";
import { useTheme, type ColorScheme } from "../provider";
import { baseColor, focusRing, setColorScheme, style } from "../s2-style";

export type DialogSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg" | "fullscreen";
type NormalizedDialogSize = "S" | "M" | "L" | "XL" | "fullscreen";

export interface DialogProps extends Omit<HeadlessDialogProps, "class" | "style" | "children"> {
  /** The size of the dialog. */
  size?: DialogSize;
  /** Whether the dialog can be dismissed by clicking the close button. */
  isDismissible?: boolean;
  /** Alias for isDismissible, retained for older Solid Spectrum examples. */
  isDismissable?: boolean;
  /** Additional CSS class name. */
  class?: string;
  /** The title of the dialog. */
  title?: string;
  /** The children content. */
  children?: JSX.Element;
  /** Callback when dialog should close */
  onClose?: () => void;
}

export interface DialogTriggerProps {
  /** Button to trigger the dialog. */
  trigger?: JSX.Element;
  /** The dialog content - receives close function. */
  content?: (close: () => void) => JSX.Element;
  /** Composition API matching React Spectrum/React Aria DialogTrigger. */
  children?: JSX.Element;
  /** Whether the dialog is controlled. */
  isOpen?: boolean;
  /** Whether the dialog opens by default. */
  defaultOpen?: boolean;
  /** Callback when open state changes. */
  onOpenChange?: (isOpen: boolean) => void;
  /** Whether clicking outside the dialog closes it. Defaults to true. */
  isDismissible?: boolean;
  /** Alias for isDismissible, retained for older Solid Spectrum examples. */
  isDismissable?: boolean;
  /** Whether pressing Escape closes the dialog. Defaults to false. */
  isKeyboardDismissDisabled?: boolean;
}

interface DialogContextValue {
  close: () => void;
}

const DialogContext = createContext<DialogContextValue | null>(null);

export function useDialogContext(): DialogContextValue | null {
  return useContext(DialogContext);
}

function normalizeDialogSize(size: DialogSize | undefined): NormalizedDialogSize {
  switch (size) {
    case "S":
    case "M":
    case "L":
    case "XL":
    case "fullscreen":
      return size;
    case "sm":
      return "S";
    case "lg":
      return "L";
    case "md":
    default:
      return "M";
  }
}

const dialogOverlay = style<{ colorScheme: ColorScheme }>({
  ...setColorScheme(),
  position: "fixed",
  inset: 0,
  zIndex: 1999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  backgroundColor: baseColor("transparent-overlay-500"),
});

const dialogModalHost = style({
  position: "relative",
  pointerEvents: "auto",
});

const dialogModalViewport = style({
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: 32,
  pointerEvents: "none",
});

function dialogOverlayLayoutStyle(colorScheme: ColorScheme): JSX.CSSProperties {
  return {
    position: "fixed",
    inset: "0px",
    "z-index": 1999,
    "--s2-color-scheme": colorScheme,
    "color-scheme": colorScheme,
  } as JSX.CSSProperties;
}

function dialogModalViewportLayoutStyle(colorScheme: ColorScheme): JSX.CSSProperties {
  return {
    position: "fixed",
    inset: "0px",
    "z-index": 2000,
    "--s2-color-scheme": colorScheme,
    "color-scheme": colorScheme,
  } as JSX.CSSProperties;
}

const dialogSurface = style<{ size: NormalizedDialogSize }>({
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  width: {
    size: {
      S: 400,
      M: 480,
      L: 640,
      XL: 960,
      fullscreen: "[calc(100vw - 64px)]",
    },
  },
  maxWidth: "[calc(100vw - 64px)]",
  maxHeight: "[calc(100vh - 64px)]",
  height: {
    size: {
      S: "auto",
      M: "auto",
      L: "auto",
      XL: "auto",
      fullscreen: "[calc(100vh - 64px)]",
    },
  },
  overflow: "hidden",
  borderRadius: {
    size: {
      S: "xl",
      M: "xl",
      L: "xl",
      XL: "xl",
      fullscreen: "lg",
    },
  },
  backgroundColor: "layer-2",
  boxShadow: "emphasized",
  color: "neutral",
  font: "body",
  outlineStyle: "none",
});

const dialogTop = style<{ isDismissible?: boolean }>({
  display: "flex",
  alignItems: "start",
  columnGap: 12,
  paddingTop: 12,
  paddingStart: 32,
  paddingEnd: {
    default: 32,
    isDismissible: 12,
  },
});

const dialogHeader = style({
  flexGrow: 1,
  minWidth: 0,
  marginTop: 20,
  marginBottom: 16,
});

const dialogHeading = style({
  margin: 0,
  font: "title-2xl",
  color: "heading",
});

const closeButton = style({
  ...focusRing(),
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 32,
  height: 32,
  flexShrink: 0,
  marginBottom: 12,
  padding: 0,
  borderStyle: "none",
  borderRadius: "full",
  cursor: "default",
  backgroundColor: {
    default: "transparent",
    isHovered: "gray-100",
    isPressed: "gray-200",
  },
  color: baseColor("neutral"),
  "--iconPrimary": {
    type: "fill",
    value: baseColor("neutral"),
  },
});

const dialogContent = style({
  flexGrow: 1,
  minHeight: 0,
  overflow: "auto",
  paddingX: 32,
  paddingBottom: 32,
  color: "body",
});

const dialogFooter = style({
  display: "flex",
  gap: 8,
  justifyContent: "end",
  alignItems: "center",
  marginTop: 24,
  paddingTop: 16,
  borderTopStyle: "solid",
  borderTopWidth: 1,
  borderColor: "gray-200" as never,
});

/**
 * A dialog is an overlay shown above other content in an application.
 */
export function Dialog(props: DialogProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "size",
    "isDismissible",
    "isDismissable",
    "class",
    "title",
    "children",
    "onClose",
  ]);

  const size = () => normalizeDialogSize(local.size);
  const isDismissible = () => local.isDismissible ?? local.isDismissable ?? false;

  const className = () => {
    const base = "comparison-spectrum-Dialog";
    const sizeClass = dialogSurface({ size: size() });
    const custom = local.class ?? "";
    return [base, sizeClass, custom].filter(Boolean).join(" ");
  };

  return (
    <HeadlessDialog
      {...rest}
      class={className()}
      data-size={size()}
      children={({ close }) => {
        const handleDismiss = () => {
          if (local.onClose) {
            local.onClose();
            return;
          }
          close();
        };

        return (
          <DialogContext.Provider value={{ close }}>
            <div class={dialogTop({ isDismissible: isDismissible() })}>
              <Show when={local.title}>
                <div class={dialogHeader}>
                  <HeadlessDialogHeading level={2} class={dialogHeading}>
                    {local.title}
                  </HeadlessDialogHeading>
                </div>
              </Show>
              <Show when={isDismissible()}>
                <div>
                  <button
                    type="button"
                    onClick={handleDismiss}
                    class={closeButton({})}
                    aria-label="Dismiss"
                  >
                    <CrossIcon size="M" aria-hidden="true" />
                  </button>
                </div>
              </Show>
            </div>
            <div class={dialogContent}>{local.children}</div>
          </DialogContext.Provider>
        );
      }}
    />
  );
}

function DialogTriggerContent(props: {
  content: ((close: () => void) => JSX.Element) | undefined;
}): JSX.Element {
  const triggerContext = useDialogTrigger();
  const close = () => triggerContext?.state.close();
  return props.content?.(close) ?? null;
}

/**
 * DialogTrigger wraps a trigger button and dialog content.
 */
export function DialogTrigger(props: DialogTriggerProps): JSX.Element {
  const isDismissible = () => props.isDismissible ?? props.isDismissable ?? true;
  const theme = useTheme();

  if (props.children !== undefined) {
    return (
      <HeadlessDialogTrigger
        isOpen={props.isOpen}
        defaultOpen={props.defaultOpen}
        onOpenChange={props.onOpenChange}
      >
        {props.children}
      </HeadlessDialogTrigger>
    );
  }

  return (
    <HeadlessDialogTrigger
      isOpen={props.isOpen}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
    >
      {props.trigger}
      <HeadlessModalOverlay
        isDismissable={isDismissible()}
        isKeyboardDismissDisabled={props.isKeyboardDismissDisabled ?? false}
        class={dialogOverlay({ colorScheme: theme.colorScheme })}
        style={() => dialogOverlayLayoutStyle(theme.colorScheme)}
      >
        <HeadlessModal
          class={dialogModalViewport}
          style={() => dialogModalViewportLayoutStyle(theme.colorScheme)}
        >
          <div class={dialogModalHost}>
            <DialogTriggerContent content={props.content} />
          </div>
        </HeadlessModal>
      </HeadlessModalOverlay>
    </HeadlessDialogTrigger>
  );
}

export interface DialogFooterProps {
  /** Footer content, typically buttons. */
  children: JSX.Element;
  /** Additional CSS class. */
  class?: string;
}

/**
 * Footer section for dialog actions.
 */
export function DialogFooter(props: DialogFooterProps): JSX.Element {
  return (
    <div class={[dialogFooter, props.class ?? ""].filter(Boolean).join(" ")}>{props.children}</div>
  );
}
