/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/@adobe/react-spectrum/src/overlays/Tray.tsx

// Port of @react-spectrum source: https://github.com/adobe/react-spectrum/blob/5ecb3333001313e83898cd07644227897e3bae1f/packages/@adobe/react-spectrum/src/overlays/Tray.tsx.

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
