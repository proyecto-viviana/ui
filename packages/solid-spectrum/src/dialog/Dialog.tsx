import { type JSX, Show, children, createContext, splitProps, useContext } from "solid-js";
import {
  Dialog as HeadlessDialog,
  DialogContext as HeadlessDialogContext,
  DialogTrigger as HeadlessDialogTrigger,
  Heading as HeadlessDialogHeading,
  Modal as HeadlessModal,
  ModalOverlay as HeadlessModalOverlay,
  useDialogTrigger,
  type DialogProps as HeadlessDialogProps,
} from "@proyecto-viviana/solidaria-components";
import CrossIcon from "../icon/ui-icons/Cross";
import { useTheme, type ColorScheme } from "../provider";
import { ImageContext, type ImageProps } from "../image";
import { ButtonGroupContext, type ButtonGroupContextValue } from "../button";
import type { SpectrumContextValue } from "../button/spectrum-context";
import {
  ContentContext,
  FooterContext,
  HeaderContext,
  HeadingContext,
  type ContentProps,
  type FooterProps,
  type HeaderProps,
  type HeadingProps,
} from "../text";
import type { StyleString } from "../style";
import { baseColor, focusRing, setColorScheme, style } from "../style" with { type: "macro" };

export type DialogSize = "S" | "M" | "L" | "XL" | "sm" | "md" | "lg" | "fullscreen";
export type CustomDialogSize = "S" | "M" | "L" | "fullscreen" | "fullscreenTakeover";
export type FullscreenDialogVariant = "fullscreen" | "fullscreenTakeover";

type NormalizedDialogSize = "S" | "M" | "L" | "XL" | "fullscreen";
type ModalDialogSize = NormalizedDialogSize | "fullscreenTakeover";

export interface DialogRenderProps {
  close: () => void;
}

type DialogChildren = JSX.Element | ((props: DialogRenderProps) => JSX.Element);

export interface DialogProps extends Omit<HeadlessDialogProps, "class" | "style" | "children"> {
  /** The size of the dialog. */
  size?: DialogSize;
  /** Whether the dialog can be dismissed by clicking outside, Escape, or the close button. */
  isDismissible?: boolean;
  /** Alias for isDismissible, retained for older Solid Spectrum examples. */
  isDismissable?: boolean;
  /** Whether pressing Escape closes the dialog. */
  isKeyboardDismissDisabled?: boolean;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  /** Additional CSS class name. */
  class?: string;
  /** Additional CSS class name matching Spectrum's escape hatch prop. */
  UNSAFE_className?: string;
  /** Additional inline style matching Spectrum's escape hatch prop. */
  UNSAFE_style?: JSX.CSSProperties;
  /** The legacy title prop; prefer `<Heading slot="title">` for S2 parity. */
  title?: string;
  /** The children content. */
  children?: DialogChildren;
  /** Callback when dialog should close. */
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
  /** Whether clicking outside the dialog closes it. */
  isDismissible?: boolean;
  /** Alias for isDismissible, retained for older Solid Spectrum examples. */
  isDismissable?: boolean;
  /** Whether pressing Escape closes the dialog. */
  isKeyboardDismissDisabled?: boolean;
}

export interface DialogContainerProps {
  children?: JSX.Element;
  onDismiss: () => void;
}

export interface CloseButtonProps extends Omit<
  JSX.ButtonHTMLAttributes<HTMLButtonElement>,
  "class" | "style" | "children" | "onClick"
> {
  styles?: StyleString | (() => StyleString | undefined);
  class?: string;
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  children?: JSX.Element;
  onClick?: JSX.EventHandlerUnion<HTMLButtonElement, MouseEvent>;
}

export interface FullscreenDialogProps extends Omit<
  DialogProps,
  "size" | "isDismissible" | "isDismissable"
> {
  variant?: FullscreenDialogVariant;
}

export interface CustomDialogProps extends Omit<
  DialogProps,
  "size" | "isDismissible" | "isDismissable"
> {
  size?: CustomDialogSize;
  isDismissible?: boolean;
  isDismissable?: boolean;
  padding?: "default" | "none";
}

interface DialogContextValue {
  close: () => void;
}

interface DialogContainerContextValue {
  dismiss: () => void;
}

interface DialogTriggerOptionsContextValue {
  isDismissible?: boolean;
  isKeyboardDismissDisabled?: boolean;
}

type HeadlessDialogContextValue = {
  titleId?: string;
};

type ImageContextValue = ImageProps & {
  hidden?: boolean;
};

const DialogContext = createContext<DialogContextValue | null>(null);
const DialogContainerContext = createContext<DialogContainerContextValue | null>(null);
const DialogTriggerOptionsContext = createContext<DialogTriggerOptionsContextValue | null>(null);

export function useDialogContext(): DialogContextValue | null {
  return useContext(DialogContext);
}

export function useDialogContainer(): DialogContextValue {
  const context = useContext(DialogContainerContext);
  if (!context) {
    throw new Error("useDialogContainer must be used inside a DialogContainer.");
  }
  return { close: context.dismiss };
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

function normalizeCustomDialogSize(size: CustomDialogSize | undefined): ModalDialogSize {
  switch (size) {
    case "S":
    case "M":
    case "L":
    case "fullscreen":
    case "fullscreenTakeover":
      return size;
    default:
      return "M";
  }
}

function resolveStyles(styles: StyleString | (() => StyleString | undefined) | undefined) {
  return typeof styles === "function" ? styles() : styles;
}

function joinClass(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(" ");
}

const dialogOverlay = style<{ colorScheme: ColorScheme }>({
  ...setColorScheme(),
  position: "fixed",
  inset: 0,
  zIndex: 1999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: baseColor("transparent-overlay-500"),
});

const dialogModalViewport = style({
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: "full",
  height: "[var(--visual-viewport-height,100vh)]",
  pointerEvents: "none",
});

const dialogModalHost = style({
  position: "relative",
  display: "flex",
  maxWidth: "full",
  maxHeight: "full",
  pointerEvents: "auto",
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

const dialogSurface = style<{ size: ModalDialogSize }>({
  boxSizing: "border-box",
  display: "flex",
  flexDirection: "column",
  width: {
    size: {
      S: 400,
      M: 480,
      L: 640,
      XL: 960,
      fullscreen: "[calc(100vw - 40px)]",
      fullscreenTakeover: "full",
    },
  },
  height: {
    size: {
      S: "auto",
      M: "auto",
      L: "auto",
      XL: "auto",
      fullscreen: "[calc(var(--visual-viewport-height,100vh) - 40px)]",
      fullscreenTakeover: "[var(--visual-viewport-height,100vh)]",
    },
  },
  maxWidth: {
    default: "[90vw]",
    size: {
      fullscreen: "none",
      fullscreenTakeover: "none",
    },
  },
  maxHeight: {
    default: "[90vh]",
    size: {
      fullscreen: "none",
      fullscreenTakeover: "none",
    },
  },
  overflow: "hidden",
  borderRadius: {
    default: "xl",
    size: {
      fullscreenTakeover: "none",
    },
  },
  backgroundColor: "layer-2",
  boxShadow: "emphasized",
  color: "neutral",
  outlineStyle: "none",
});

const dialogInner = style({
  display: "flex",
  flexDirection: "column",
  maxHeight: "inherit",
  font: "body",
  outlineStyle: "none",
  overflow: "auto",
});

const dialogImage = style({
  width: "full",
  height: 140,
  flexShrink: 0,
  objectFit: "cover",
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

const dialogHeaderWrapper = style({
  display: "flex",
  flexGrow: 1,
  minWidth: 0,
  marginTop: 20,
  marginBottom: 16,
  rowGap: 8,
  columnGap: 24,
  flexDirection: {
    default: "column",
    sm: "row",
  },
  alignItems: {
    default: "start",
    sm: "center",
  },
});

const dialogHeading = style({
  flexGrow: 1,
  marginY: 0,
  font: "title-2xl",
  color: "heading",
});

const dialogHeader = style({
  margin: 0,
  font: "body",
  color: "body",
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
  overflowY: "auto",
  paddingX: 32,
  color: "body",
});

const dialogFooterWrapper = style({
  display: "flex",
  flexGrow: 1,
  alignItems: "center",
  flexWrap: "wrap",
  gap: 24,
  paddingX: 32,
  paddingTop: 0,
  paddingBottom: 32,
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
  borderColor: "gray-200",
});

const dialogButtonGroup = style({
  marginStart: "auto",
  maxWidth: "full",
});

const fullscreenDialogInner = style({
  display: "grid",
  gridTemplateRows: "[auto_1fr]",
  minHeight: 0,
  height: "full",
  font: "body",
  outlineStyle: "none",
});

const fullscreenDialogHeader = style({
  display: "flex",
  alignItems: "center",
  gap: 24,
  paddingX: 32,
  paddingY: 24,
  borderBottomStyle: "solid",
  borderBottomWidth: 1,
  borderColor: "gray-200",
});

const fullscreenDialogContent = style({
  minHeight: 0,
  overflow: "auto",
  padding: 32,
});

const customDialog = style<{ padding: "default" | "none" }>({
  padding: {
    padding: {
      default: 32,
      none: 0,
    },
  },
});

interface DialogModalProps {
  children: JSX.Element;
  size: ModalDialogSize;
  isDismissible?: boolean;
  isKeyboardDismissDisabled?: boolean;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

function DialogModal(props: DialogModalProps): JSX.Element {
  const theme = useTheme();

  return (
    <HeadlessModalOverlay
      isOpen={props.isOpen}
      onOpenChange={props.onOpenChange}
      isDismissable={props.isDismissible}
      isKeyboardDismissDisabled={props.isKeyboardDismissDisabled}
      class={dialogOverlay({ colorScheme: theme.colorScheme })}
      style={() => dialogOverlayLayoutStyle(theme.colorScheme)}
    >
      <HeadlessModal
        class={dialogModalViewport}
        style={() => dialogModalViewportLayoutStyle(theme.colorScheme)}
      >
        <div class={dialogModalHost}>{props.children}</div>
      </HeadlessModal>
    </HeadlessModalOverlay>
  );
}

interface SlotProvidersProps {
  children: JSX.Element;
  image?: SpectrumContextValue<ImageContextValue>;
  heading?: SpectrumContextValue<HeadingProps>;
  header?: SpectrumContextValue<HeaderProps>;
  content?: SpectrumContextValue<ContentProps>;
  footer?: SpectrumContextValue<FooterProps>;
  buttonGroup?: SpectrumContextValue<ButtonGroupContextValue>;
}

function SlotProviders(props: SlotProvidersProps): JSX.Element {
  return (
    <ImageContext.Provider value={props.image ?? null}>
      <HeadingContext.Provider value={props.heading ?? null}>
        <HeaderContext.Provider value={props.header ?? null}>
          <ContentContext.Provider value={props.content ?? null}>
            <FooterContext.Provider value={props.footer ?? null}>
              <ButtonGroupContext.Provider value={props.buttonGroup ?? null}>
                {props.children}
              </ButtonGroupContext.Provider>
            </FooterContext.Provider>
          </ContentContext.Provider>
        </HeaderContext.Provider>
      </HeadingContext.Provider>
    </ImageContext.Provider>
  );
}

function HiddenDialogSlots(props: { children: JSX.Element }): JSX.Element {
  return (
    <SlotProviders
      image={{ hidden: true }}
      heading={{ slots: { title: { isHidden: true } } }}
      header={{ isHidden: true }}
      content={{ isHidden: true }}
      footer={{ isHidden: true }}
      buttonGroup={{ isHidden: true }}
    >
      {props.children}
    </SlotProviders>
  );
}

function DialogHeaderSlots(props: { children: JSX.Element }): JSX.Element {
  const headlessContext = useContext(HeadlessDialogContext) as HeadlessDialogContextValue | null;

  return (
    <SlotProviders
      image={{ hidden: true }}
      heading={{
        slots: {
          title: {
            id: headlessContext?.titleId,
            level: 2,
            styles: dialogHeading,
          },
        },
      }}
      header={{ styles: dialogHeader }}
      content={{ isHidden: true }}
      footer={{ isHidden: true }}
      buttonGroup={{ isHidden: true }}
    >
      {props.children}
    </SlotProviders>
  );
}

function DialogContentSlots(props: { children: JSX.Element }): JSX.Element {
  return (
    <SlotProviders
      image={{ hidden: true }}
      heading={{ slots: { title: { isHidden: true } } }}
      header={{ isHidden: true }}
      content={{ styles: dialogContent }}
      footer={{ isHidden: true }}
      buttonGroup={{ isHidden: true }}
    >
      {props.children}
    </SlotProviders>
  );
}

function DialogFooterSlots(props: { children: JSX.Element; isDismissible?: boolean }): JSX.Element {
  return (
    <SlotProviders
      image={{ hidden: true }}
      heading={{ slots: { title: { isHidden: true } } }}
      header={{ isHidden: true }}
      content={{ isHidden: true }}
      footer={{ styles: dialogHeader }}
      buttonGroup={{
        styles: dialogButtonGroup,
        align: "end",
        isHidden: props.isDismissible,
      }}
    >
      {props.children}
    </SlotProviders>
  );
}

function DialogTitleSlots(props: { children: JSX.Element }): JSX.Element {
  const headlessContext = useContext(HeadlessDialogContext) as HeadlessDialogContextValue | null;

  return (
    <SlotProviders
      heading={{
        slots: {
          title: {
            id: headlessContext?.titleId,
          },
        },
      }}
    >
      {props.children}
    </SlotProviders>
  );
}

function DialogImageSlots(props: { children: JSX.Element }): JSX.Element {
  return (
    <SlotProviders
      image={{ styles: dialogImage }}
      heading={{ slots: { title: { isHidden: true } } }}
      header={{ isHidden: true }}
      content={{ isHidden: true }}
      footer={{ isHidden: true }}
      buttonGroup={{ isHidden: true }}
    >
      {props.children}
    </SlotProviders>
  );
}

function renderDialogChildren(
  children: DialogChildren | undefined,
  renderProps: DialogRenderProps,
): JSX.Element {
  return typeof children === "function"
    ? (children as (props: DialogRenderProps) => JSX.Element)(renderProps)
    : children;
}

function resolveDialogClose(
  localOnClose: (() => void) | undefined,
  containerContext: DialogContainerContextValue | null,
  close: () => void,
): () => void {
  return () => {
    if (localOnClose) {
      localOnClose();
      return;
    }

    if (containerContext) {
      containerContext.dismiss();
      return;
    }
    close();
  };
}

/**
 * A dialog is an overlay shown above other content in an application.
 */
export function Dialog(props: DialogProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "size",
    "isDismissible",
    "isDismissable",
    "isKeyboardDismissDisabled",
    "styles",
    "class",
    "UNSAFE_className",
    "UNSAFE_style",
    "title",
    "children",
    "onClose",
  ]);

  const triggerOptions = useContext(DialogTriggerOptionsContext);
  const containerContext = useContext(DialogContainerContext);
  const size = () => normalizeDialogSize(local.size);
  const isDismissible = () =>
    local.isDismissible ?? local.isDismissable ?? triggerOptions?.isDismissible ?? false;
  const isKeyboardDismissDisabled = () =>
    local.isKeyboardDismissDisabled ?? triggerOptions?.isKeyboardDismissDisabled ?? false;
  const hasLegacyTitle = () => local.title !== undefined && local.title !== null;

  const className = () =>
    joinClass(
      "comparison-spectrum-Dialog",
      dialogSurface({ size: size() }),
      dialogInner,
      resolveStyles(local.styles),
      local.UNSAFE_className,
      local.class,
    );

  return (
    <DialogModal
      size={size()}
      isDismissible={isDismissible()}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled()}
      isOpen={containerContext ? true : undefined}
      onOpenChange={containerContext ? (open) => !open && containerContext.dismiss() : undefined}
    >
      <HeadlessDialog
        {...rest}
        class={className()}
        style={local.UNSAFE_style}
        data-size={size()}
        children={(renderProps: DialogRenderProps) => {
          const { close } = renderProps;
          const handleDismiss = resolveDialogClose(local.onClose, containerContext, close);
          const renderedChildren = () =>
            renderDialogChildren(local.children, { close: handleDismiss });

          return (
            <DialogContext.Provider value={{ close: handleDismiss }}>
              <Show
                when={!hasLegacyTitle()}
                fallback={
                  <>
                    <div class={dialogTop({ isDismissible: isDismissible() })}>
                      <div class={dialogHeaderWrapper}>
                        <HeadlessDialogHeading level={2} class={dialogHeading}>
                          {local.title}
                        </HeadlessDialogHeading>
                      </div>
                      <Show when={isDismissible()}>
                        <CloseButton />
                      </Show>
                    </div>
                    <div class={dialogContent}>{renderedChildren()}</div>
                  </>
                }
              >
                <DialogImageSlots>{renderedChildren()}</DialogImageSlots>
                <div class={dialogTop({ isDismissible: isDismissible() })}>
                  <div class={dialogHeaderWrapper}>
                    <DialogHeaderSlots>{renderedChildren()}</DialogHeaderSlots>
                  </div>
                  <Show when={isDismissible()}>
                    <CloseButton />
                  </Show>
                </div>
                <DialogContentSlots>{renderedChildren()}</DialogContentSlots>
                <div class={dialogFooterWrapper}>
                  <DialogFooterSlots isDismissible={isDismissible()}>
                    {renderedChildren()}
                  </DialogFooterSlots>
                </div>
              </Show>
            </DialogContext.Provider>
          );
        }}
      />
    </DialogModal>
  );
}

function DialogTriggerContent(props: {
  content: ((close: () => void) => JSX.Element) | undefined;
}): JSX.Element {
  const triggerContext = useDialogTrigger();
  const close = () => triggerContext?.state.close();
  return props.content?.(close) ?? null;
}

function DialogTriggerChildren(props: DialogTriggerProps): JSX.Element {
  const resolvedChildren = children(() => props.children);

  return (
    <Show
      when={resolvedChildren()}
      fallback={
        <>
          {props.trigger}
          <DialogTriggerContent content={props.content} />
        </>
      }
    >
      {(resolved) => resolved()}
    </Show>
  );
}

/**
 * DialogTrigger wraps a trigger button and dialog content.
 */
export function DialogTrigger(props: DialogTriggerProps): JSX.Element {
  const isDismissible = () => props.isDismissible ?? props.isDismissable;
  const options = () => ({
    isDismissible: isDismissible(),
    isKeyboardDismissDisabled: props.isKeyboardDismissDisabled,
  });

  return (
    <HeadlessDialogTrigger
      isOpen={props.isOpen}
      defaultOpen={props.defaultOpen}
      onOpenChange={props.onOpenChange}
    >
      <DialogTriggerOptionsContext.Provider value={options()}>
        <DialogTriggerChildren {...props} />
      </DialogTriggerOptionsContext.Provider>
    </HeadlessDialogTrigger>
  );
}

export function DialogContainer(props: DialogContainerProps): JSX.Element {
  return (
    <Show when={props.children}>
      <DialogContainerContext.Provider value={{ dismiss: props.onDismiss }}>
        {props.children}
      </DialogContainerContext.Provider>
    </Show>
  );
}

export function CloseButton(props: CloseButtonProps): JSX.Element {
  const [local, buttonProps] = splitProps(props, [
    "styles",
    "class",
    "UNSAFE_className",
    "UNSAFE_style",
    "children",
    "onClick",
    "aria-label",
  ]);
  const context = useDialogContext();
  const className = () =>
    joinClass(closeButton({}), resolveStyles(local.styles), local.UNSAFE_className, local.class);

  return (
    <button
      {...buttonProps}
      type={buttonProps.type ?? "button"}
      class={className()}
      style={local.UNSAFE_style}
      aria-label={local["aria-label"] ?? "Dismiss"}
      onClick={(event) => {
        const onClick = local.onClick as
          | JSX.EventHandler<HTMLButtonElement, MouseEvent>
          | undefined;
        onClick?.(event);
        if (!event.defaultPrevented) {
          context?.close();
        }
      }}
    >
      {local.children ?? <CrossIcon size="XL" aria-hidden="true" />}
    </button>
  );
}

export function FullscreenDialog(props: FullscreenDialogProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "variant",
    "isKeyboardDismissDisabled",
    "styles",
    "class",
    "UNSAFE_className",
    "UNSAFE_style",
    "children",
    "onClose",
  ]);
  const containerContext = useContext(DialogContainerContext);
  const size = () => local.variant ?? "fullscreen";
  const className = () =>
    joinClass(
      "comparison-spectrum-FullscreenDialog",
      dialogSurface({ size: size() }),
      fullscreenDialogInner,
      resolveStyles(local.styles),
      local.UNSAFE_className,
      local.class,
    );

  return (
    <DialogModal
      size={size()}
      isKeyboardDismissDisabled={local.isKeyboardDismissDisabled}
      isOpen={containerContext ? true : undefined}
      onOpenChange={containerContext ? (open) => !open && containerContext.dismiss() : undefined}
    >
      <HeadlessDialog
        {...rest}
        class={className()}
        style={local.UNSAFE_style}
        data-variant={size()}
        children={(renderProps: DialogRenderProps) => {
          const { close } = renderProps;
          const handleDismiss = resolveDialogClose(local.onClose, containerContext, close);
          const renderedChildren = () =>
            renderDialogChildren(local.children, { close: handleDismiss });

          return (
            <DialogContext.Provider value={{ close: handleDismiss }}>
              <div class={fullscreenDialogHeader}>
                <DialogHeaderSlots>{renderedChildren()}</DialogHeaderSlots>
                <DialogFooterSlots>{renderedChildren()}</DialogFooterSlots>
              </div>
              <div class={fullscreenDialogContent}>
                <DialogContentSlots>{renderedChildren()}</DialogContentSlots>
              </div>
            </DialogContext.Provider>
          );
        }}
      />
    </DialogModal>
  );
}

export function CustomDialog(props: CustomDialogProps): JSX.Element {
  const [local, rest] = splitProps(props, [
    "size",
    "isDismissible",
    "isDismissable",
    "isKeyboardDismissDisabled",
    "padding",
    "styles",
    "class",
    "UNSAFE_className",
    "UNSAFE_style",
    "children",
    "onClose",
  ]);
  const triggerOptions = useContext(DialogTriggerOptionsContext);
  const containerContext = useContext(DialogContainerContext);
  const size = () => normalizeCustomDialogSize(local.size);
  const isDismissible = () =>
    local.isDismissible ?? local.isDismissable ?? triggerOptions?.isDismissible ?? false;
  const isKeyboardDismissDisabled = () =>
    local.isKeyboardDismissDisabled ?? triggerOptions?.isKeyboardDismissDisabled ?? false;
  const className = () =>
    joinClass(
      "comparison-spectrum-CustomDialog",
      dialogSurface({ size: size() }),
      dialogInner,
      customDialog({ padding: local.padding ?? "default" }),
      resolveStyles(local.styles),
      local.UNSAFE_className,
      local.class,
    );

  return (
    <DialogModal
      size={size()}
      isDismissible={isDismissible()}
      isKeyboardDismissDisabled={isKeyboardDismissDisabled()}
      isOpen={containerContext ? true : undefined}
      onOpenChange={containerContext ? (open) => !open && containerContext.dismiss() : undefined}
    >
      <HeadlessDialog
        {...rest}
        class={className()}
        style={local.UNSAFE_style}
        data-size={size()}
        children={(renderProps: DialogRenderProps) => {
          const { close } = renderProps;
          const handleDismiss = resolveDialogClose(local.onClose, containerContext, close);
          const renderedChildren = () =>
            renderDialogChildren(local.children, { close: handleDismiss });

          return (
            <DialogContext.Provider value={{ close: handleDismiss }}>
              <DialogTitleSlots>{renderedChildren()}</DialogTitleSlots>
            </DialogContext.Provider>
          );
        }}
      />
    </DialogModal>
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
