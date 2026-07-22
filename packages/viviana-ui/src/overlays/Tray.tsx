import { type JSX, splitProps } from "solid-js";
import {
  ModalOverlay as HeadlessModalOverlay,
  Modal as HeadlessModal,
  type ModalOverlayProps as HeadlessModalOverlayProps,
} from "@proyecto-viviana/solidaria-components";
import { style } from "../style" with { type: "macro" };

export interface TrayProps extends Omit<HeadlessModalOverlayProps, "class"> {
  /** Additional CSS class name. */
  class?: string;
  /** The content of the tray. */
  children?: JSX.Element;
}

// A dimmed scrim that pins its sheet to the bottom of the viewport. Styled
// through the S2 macro so the CSS ships in the package bundle for installed
// consumers rather than relying on utility classes.
const overlayStyles = style({
  position: "fixed",
  inset: 0,
  zIndex: 1999,
  display: "flex",
  alignItems: "end",
  justifyContent: "center",
  backgroundColor: "transparent-black-500",
});

// The sheet surface: a full-width layer-2 panel rounded on its top corners.
const trayStyles = style({
  width: "full",
  maxHeight: "[90vh]",
  overflow: "auto",
  backgroundColor: "layer-2",
  // Glasselated: the sheet frosts the dimmed scene behind it.
  backdropFilter: "var(--blur-panel)",
  borderTopStartRadius: "xl",
  borderTopEndRadius: "xl",
  boxShadow: "elevated",
  borderWidth: 0,
  borderTopWidth: 1,
  borderStyle: "solid",
  borderColor: "gray-300",
});

// The drag grabber affordance centered along the top edge.
const grabberStyles = style({
  width: 48,
  height: 4,
  borderRadius: "full",
  backgroundColor: "gray-400",
  marginX: "auto",
  marginTop: 8,
  marginBottom: 16,
});

/**
 * A bottom-sheet overlay for mobile contexts.
 */
export function Tray(props: TrayProps): JSX.Element {
  const [local, headlessProps] = splitProps(props, ["class", "children"]);

  return (
    <HeadlessModalOverlay {...headlessProps} class={overlayStyles}>
      <HeadlessModal class={[trayStyles, local.class].filter(Boolean).join(" ")}>
        <div class={grabberStyles} />
        {local.children}
      </HeadlessModal>
    </HeadlessModalOverlay>
  );
}
