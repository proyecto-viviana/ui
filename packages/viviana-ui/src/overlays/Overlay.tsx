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

// Ported to SolidJS for Proyecto Viviana; based on packages/@adobe/react-spectrum/src/overlays/Overlay.tsx

// Port of @react-spectrum source: https://github.com/adobe/react-spectrum/blob/5ecb3333001313e83898cd07644227897e3bae1f/packages/@adobe/react-spectrum/src/overlays/Overlay.tsx.
import { type JSX, splitProps, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { useUNSAFE_PortalContext } from "@proyecto-viviana/solidaria";

export interface OverlayProps {
  /** Whether the overlay is currently open. */
  isOpen?: boolean;
  /** The content of the overlay. */
  children?: JSX.Element;
  /** Additional CSS class name. */
  class?: string;
  /** The container element to render the overlay into. */
  container?: HTMLElement;
}

/**
 * A generic overlay container that renders content above the page via a portal.
 */
export function Overlay(props: OverlayProps): JSX.Element {
  const [local] = splitProps(props, ["isOpen", "children", "class", "container"]);
  const portalContext = useUNSAFE_PortalContext();
  const portalContainer = () =>
    local.container ??
    (portalContext.getContainer?.() as HTMLElement | null | undefined) ??
    undefined;

  return (
    <Show when={local.isOpen}>
      <Portal mount={portalContainer()}>
        <div class={`fixed z-50 ${local.class ?? ""}`}>{local.children}</div>
      </Portal>
    </Show>
  );
}
