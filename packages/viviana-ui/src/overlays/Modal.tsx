import { type JSX, splitProps } from "solid-js";
import {
  Modal as HeadlessModal,
  ModalOverlay as HeadlessModalOverlay,
  type ModalOverlayProps as HeadlessModalOverlayProps,
} from "@proyecto-viviana/solidaria-components";
import { style } from "../style" with { type: "macro" };

export type ModalSize = "sm" | "md" | "lg" | "fullscreen";

export interface StyledModalProps extends Omit<HeadlessModalOverlayProps, "class"> {
  /** The size of the modal. @default 'md' */
  size?: ModalSize;
  /** Additional CSS class name. */
  class?: string;
  /** The content of the modal. */
  children?: JSX.Element;
}

// A dimmed, full-viewport scrim that centers its modal. Mirrors the S2 dialog
// overlay (transparent-black scrim, fixed inset) so the CSS ships in the package
// bundle for installed consumers instead of leaning on utility classes.
const overlayStyles = style({
  position: "fixed",
  inset: 0,
  zIndex: 1999,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "transparent-black-500",
});

// The modal surface: an elevated layer-2 card whose max width steps with size.
const modalStyles = style<{ size: ModalSize }>({
  width: "full",
  height: { size: { fullscreen: "full" } },
  maxWidth: {
    default: "[90vw]",
    size: { sm: 384, md: 512, lg: 768, fullscreen: "none" },
  },
  backgroundColor: "layer-2",
  // Glasselated: the dialog surface frosts the dimmed scene behind it.
  backdropFilter: "var(--blur-card)",
  borderRadius: { default: "lg", size: { fullscreen: "none" } },
  boxShadow: "elevated",
  borderWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
});

/**
 * A styled modal overlay with sizing options.
 */
export function StyledModal(props: StyledModalProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["size", "class", "children"]);

  return (
    <HeadlessModalOverlay {...headlessProps} class={overlayStyles}>
      <HeadlessModal
        class={[modalStyles({ size: local.size ?? "md" }), local.class].filter(Boolean).join(" ")}
      >
        {local.children}
      </HeadlessModal>
    </HeadlessModalOverlay>
  );
}
