import { type JSX, Show, createContext, splitProps, useContext } from "solid-js";
import {
  Button as HeadlessButton,
  ButtonContext as HeadlessButtonContext,
  Dialog as HeadlessDialog,
  DialogContext as HeadlessDialogContext,
  DialogTrigger as HeadlessDialogTrigger,
  Heading as HeadlessDialogHeading,
  Modal as HeadlessModal,
  ModalOverlay as HeadlessModalOverlay,
  useDialogTrigger,
  type ButtonRenderProps,
  type DialogProps as HeadlessDialogProps,
} from "@proyecto-viviana/solidaria-components";
import { createStringFormatter } from "@proyecto-viviana/solidaria";
import CrossIcon from "../icon/ui-icons/Cross";
import { s2IntlStrings } from "../intl";
import { pressScale } from "../pressScale";
import { mergeStyles } from "../style/runtime";
import type { StaticColor } from "../button/types";
import {
  controlSize,
  getAllowedOverrides,
  staticColor,
} from "../s2-internal/style-utils" with { type: "macro" };
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

export interface CloseButtonProps {
  /**
   * The size of the CloseButton.
   *
   * @default 'M'
   */
  size?: "S" | "M" | "L" | "XL";
  /** The static color style to apply. Useful when the Button appears over a color background. */
  staticColor?: StaticColor;
  /** Whether the button is disabled. */
  isDisabled?: boolean;
  /** Handler called when the button is pressed. */
  onPress?: () => void;
  /** Spectrum-defined generated classes. */
  styles?: StyleString | (() => StyleString | undefined);
  UNSAFE_className?: string;
  UNSAFE_style?: JSX.CSSProperties;
  "aria-label"?: string;
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
  isolation: "isolate",
  backgroundColor: "transparent-black-500",
});

// Upstream Modal.tsx modalWrapper. Fixed instead of sticky because our overlay
// portals with a fixed strategy rather than upstream's page-height absolute
// overlay. pointerEvents none is required for outside-click dismissal: our
// headless ModalOverlay only dismisses when the pointerdown lands on the
// overlay element itself, so this full-viewport wrapper must let clicks
// through (the modal surface restores pointerEvents auto).
const dialogModalWrapper = style<{ size: ModalDialogSize }>({
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  width: "full",
  height: "[var(--visual-viewport-height,100vh)]",
  display: "flex",
  alignItems: {
    default: "center",
    size: {
      fullscreenTakeover: "start",
    },
  },
  justifyContent: "center",
  pointerEvents: "none",
});

// Upstream Modal.tsx RACModal styles minus the entering/exiting motion flips
// (those land with the motion driver).
const dialogModal = style<{ size: ModalDialogSize }>({
  display: "flex",
  flexDirection: "column",
  pointerEvents: "auto",
  borderRadius: {
    default: "xl",
    size: {
      fullscreenTakeover: "none",
    },
  },
  width: {
    size: {
      S: 400,
      M: 480,
      L: 640,
      XL: 960,
      fullscreen: "[calc(100% - 40px)]",
      fullscreenTakeover: "full",
    },
  },
  height: {
    size: {
      fullscreen: "[calc(100% - 40px)]",
      fullscreenTakeover: "full",
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
    default: "[90%]",
    size: {
      fullscreen: "none",
      fullscreenTakeover: "none",
    },
  },
  paddingBottom: {
    size: {
      // Extend background behind the iOS Safari toolbar and keyboard.
      fullscreenTakeover: "[100vh]",
    },
  },
  "--s2-container-bg": {
    type: "backgroundColor",
    value: "layer-2",
  },
  backgroundColor: "--s2-container-bg",
  // Transparent outline for WHCM.
  outlineStyle: "solid",
  outlineWidth: 1,
  outlineColor: "transparent",
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

function dialogModalWrapperLayoutStyle(colorScheme: ColorScheme): JSX.CSSProperties {
  return {
    position: "fixed",
    inset: "0px",
    "z-index": 2000,
    "container-type": "size",
    "--s2-color-scheme": colorScheme,
    "color-scheme": colorScheme,
  } as JSX.CSSProperties;
}

const dialogInner = style({
  display: "flex",
  flexDirection: "column",
  flexGrow: 1,
  maxHeight: "inherit",
  boxSizing: "border-box",
  outlineStyle: "none",
  fontFamily: "sans",
  borderRadius: "inherit",
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

const closeButtonHoverBackground = {
  default: "gray-200",
  isStaticColor: "transparent-overlay-200",
} as const;

const closeButton = style<
  CloseButtonProps & {
    isHovered: boolean;
    isFocusVisible: boolean;
    isPressed: boolean;
    isDisabled: boolean;
    isStaticColor: boolean;
  }
>(
  {
    ...focusRing(),
    ...staticColor(),
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    size: controlSize(),
    flexShrink: 0,
    borderRadius: "full",
    padding: 0,
    borderStyle: "none",
    transition: "default",
    backgroundColor: {
      default: "transparent",
      isHovered: closeButtonHoverBackground,
      isFocusVisible: closeButtonHoverBackground,
      isPressed: closeButtonHoverBackground,
    },
    "--iconPrimary": {
      type: "color",
      value: {
        default: baseColor("neutral"),
        isDisabled: "disabled",
        isStaticColor: {
          default: "white",
          isDisabled: "transparent-overlay-400",
        },
        forcedColors: {
          default: "ButtonText",
          isDisabled: "GrayText",
        },
      },
    },
    outlineColor: {
      default: "focus-ring",
      isStaticColor: "transparent-overlay-1000",
      forcedColors: "Highlight",
    },
    disableTapHighlight: true,
  },
  getAllowedOverrides(),
);

const dialogCloseButtonMargin = style({ marginBottom: 12 });

const dialogContent = style({
  flexGrow: 1,
  minHeight: 0,
  overflowY: "auto",
  paddingX: 32,
  font: "body",
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
      default: {
        default: 24,
        sm: 32,
      },
      none: 0,
    },
  },
  boxSizing: "border-box",
  outlineStyle: "none",
  borderRadius: "inherit",
  overflow: "auto",
  position: "relative",
  size: "full",
  maxSize: "[inherit]",
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
      <div
        class={dialogModalWrapper({ size: props.size })}
        style={dialogModalWrapperLayoutStyle(theme.colorScheme)}
      >
        <HeadlessModal class={dialogModal({ size: props.size })}>{props.children}</HeadlessModal>
      </div>
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
              <HeadlessButtonContext.Provider
                value={{ slots: { default: {}, close: { onPress: () => handleDismiss() } } }}
              >
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
                          <CloseButton styles={dialogCloseButtonMargin} />
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
                      <CloseButton styles={dialogCloseButtonMargin} />
                    </Show>
                  </div>
                  <DialogContentSlots>{renderedChildren()}</DialogContentSlots>
                  <div class={dialogFooterWrapper}>
                    <DialogFooterSlots isDismissible={isDismissible()}>
                      {renderedChildren()}
                    </DialogFooterSlots>
                  </div>
                </Show>
              </HeadlessButtonContext.Provider>
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
  // Pick the API by prop shape without resolving children. Resolving with the
  // `children()` helper unwraps the dialog subtree down to ModalOverlay's
  // <Show> accessor and tracks it, so every open (and each remount's
  // useIsHydrated flip) recreated the entire trigger+dialog subtree — an
  // infinite recreation loop in the browser (stack overflow, no dialog).
  if ("children" in props) {
    return <>{props.children}</>;
  }
  return (
    <>
      {props.trigger}
      <DialogTriggerContent content={props.content} />
    </>
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

const closeButtonIconSize = { S: "L", M: "XL", L: "XXL", XL: "XXXL" } as const;

/**
 * A CloseButton allows a user to dismiss a dialog.
 */
export function CloseButton(props: CloseButtonProps): JSX.Element {
  const [local, buttonProps] = splitProps(props, [
    "size",
    "staticColor",
    "styles",
    "UNSAFE_className",
    "UNSAFE_style",
    "aria-label",
  ]);
  let buttonElement: HTMLButtonElement | undefined;
  const stringFormatter = createStringFormatter(s2IntlStrings, "@react-spectrum/s2");

  const getClassName = (renderProps: ButtonRenderProps): string =>
    joinClass(
      local.UNSAFE_className,
      mergeStyles(
        closeButton({
          ...renderProps,
          size: local.size ?? "M",
          staticColor: local.staticColor,
          isStaticColor: !!local.staticColor,
        }),
        resolveStyles(local.styles),
      ),
    );

  const getPressScaleStyle = (renderProps: ButtonRenderProps): JSX.CSSProperties =>
    pressScale(() => buttonElement, local.UNSAFE_style)(renderProps);

  return (
    <HeadlessButton
      {...buttonProps}
      slot="close"
      ref={(element: HTMLButtonElement) => {
        buttonElement = element;
      }}
      aria-label={local["aria-label"] ?? stringFormatter().format("dialog.dismiss")}
      class={getClassName}
      style={getPressScaleStyle}
    >
      <CrossIcon size={closeButtonIconSize[local.size ?? "M"]} aria-hidden="true" />
    </HeadlessButton>
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
              <HeadlessButtonContext.Provider
                value={{ slots: { default: {}, close: { onPress: () => handleDismiss() } } }}
              >
                <div class={fullscreenDialogHeader}>
                  <DialogHeaderSlots>{renderedChildren()}</DialogHeaderSlots>
                  <DialogFooterSlots>{renderedChildren()}</DialogFooterSlots>
                </div>
                <div class={fullscreenDialogContent}>
                  <DialogContentSlots>{renderedChildren()}</DialogContentSlots>
                </div>
              </HeadlessButtonContext.Provider>
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
              <HeadlessButtonContext.Provider
                value={{ slots: { default: {}, close: { onPress: () => handleDismiss() } } }}
              >
                <DialogTitleSlots>{renderedChildren()}</DialogTitleSlots>
              </HeadlessButtonContext.Provider>
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
