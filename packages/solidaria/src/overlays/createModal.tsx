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

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/overlays/useModal.tsx

/**
 * Modal context and hooks for managing modal accessibility.
 * Based on @react-aria/overlays useModal.
 */

import { useContextOptional } from "../utils/owner";
import { createContext, createSignal, createEffect, createTrackedEffect } from "solid-js";
import type { Accessor, ParentComponent } from "solid-js";
import type { JSX } from "@solidjs/web";
import { Portal } from "@solidjs/web";
import { isServer } from "@solidjs/web";

export interface ModalProviderProps {
  children: JSX.Element;
}

export interface PortalProviderProps {
  /** Returns the element where overlays should portal. Pass null to clear inherited context. */
  getContainer?: (() => Element | null) | null;
  children: JSX.Element;
}

export interface PortalProviderContextValue {
  getContainer?: () => Element | null;
}

interface ModalContext {
  parent: ModalContext | null;
  modalCount: Accessor<number>;
  addModal: () => void;
  removeModal: () => void;
}

const ModalContext = createContext<ModalContext | null>(null);
const PortalContext = createContext<PortalProviderContextValue>({});

/**
 * Each ModalProvider tracks how many modals are open in its subtree. On mount, the modals
 * trigger `addModal` to increment the count, and trigger `removeModal` on unmount to decrement it.
 * This is done recursively so that all parent providers are incremented and decremented.
 * If the modal count is greater than zero, we add `aria-hidden` to this provider to hide its
 * subtree from screen readers. This is done using SolidJS context in order to account for things
 * like portals, which can cause the component tree and the DOM tree to differ significantly in structure.
 */
export const ModalProvider: ParentComponent<ModalProviderProps> = (props) => {
  const parent = useContextOptional(ModalContext);
  const [modalCount, setModalCount] = createSignal(0);

  const context: ModalContext = {
    parent: parent ?? null,
    modalCount,
    addModal() {
      setModalCount((count) => count + 1);
      if (parent) {
        parent.addModal();
      }
    },
    removeModal() {
      setModalCount((count) => count - 1);
      if (parent) {
        parent.removeModal();
      }
    },
  };

  return <ModalContext value={context}>{props.children}</ModalContext>;
};

/**
 * Sets the portal container for overlays rendered by descendants.
 */
export const UNSAFE_PortalProvider: ParentComponent<PortalProviderProps> = (props) => {
  const parent = useUNSAFE_PortalContext();

  return (
    <PortalContext
      value={{
        getContainer:
          props.getContainer === null ? undefined : (props.getContainer ?? parent.getContainer),
      }}
    >
      {props.children}
    </PortalContext>
  );
};

/**
 * Returns the portal container configuration inherited from the nearest provider.
 */
export function useUNSAFE_PortalContext(): PortalProviderContextValue {
  return useContextOptional(PortalContext) ?? {};
}

export interface ModalProviderAria {
  /** Props to be spread on the container element. */
  modalProviderProps: {
    "aria-hidden"?: "true";
  };
}

/**
 * Used to determine if the tree should be aria-hidden based on how many
 * modals are open.
 */
export function useModalProvider(): ModalProviderAria {
  const context = useContextOptional(ModalContext);
  return {
    modalProviderProps: {
      get "aria-hidden"() {
        return context && context.modalCount() > 0 ? "true" : undefined;
      },
    },
  };
}

/**
 * Creates a root node that will be aria-hidden if there are other modals open.
 */
const OverlayContainerDOM: ParentComponent<ModalProviderProps> = (props) => {
  const { modalProviderProps } = useModalProvider();
  return (
    <div data-overlay-container="true" {...modalProviderProps}>
      {props.children}
    </div>
  );
};

/**
 * An OverlayProvider acts as a container for the top-level application.
 * Any application that uses modal dialogs or other overlays should
 * be wrapped in a `<OverlayProvider>`. This is used to ensure that
 * the main content of the application is hidden from screen readers
 * if a modal or other overlay is opened. Only the top-most modal or
 * overlay should be accessible at once.
 */
export const OverlayProvider: ParentComponent<ModalProviderProps> = (props) => {
  return (
    <ModalProvider>
      <OverlayContainerDOM>{props.children}</OverlayContainerDOM>
    </ModalProvider>
  );
};

export interface OverlayContainerProps extends ModalProviderProps {
  /**
   * The container element in which the overlay portal will be placed.
   * @default document.body
   */
  portalContainer?: Element;
}

/**
 * A container for overlays like modals and popovers. Renders the overlay
 * into a Portal which is placed at the end of the document body.
 * Also ensures that the overlay is hidden from screen readers if a
 * nested modal is opened. Only the top-most modal or overlay should
 * be accessible at once.
 */
export const OverlayContainer: ParentComponent<OverlayContainerProps> = (props) => {
  // Don't render portal on server
  if (isServer) {
    return null;
  }

  const portalContext = useUNSAFE_PortalContext();
  const portalContainer = () =>
    props.portalContainer ?? portalContext.getContainer?.() ?? document.body;

  // Compiler-generated prop getters may allocate a memo on first read.
  // Read in the owned compute phase, not a child-forbidden tracked callback.
  createEffect(portalContainer, (container) => {
    if (container?.closest("[data-overlay-container]")) {
      throw new Error(
        "An OverlayContainer must not be inside another container. Please change the portalContainer prop.",
      );
    }
  });

  return (
    <Portal mount={portalContainer()}>
      <OverlayProvider>{props.children}</OverlayProvider>
    </Portal>
  );
};

export interface AriaModalOptions {
  /** Whether the modal is disabled. */
  isDisabled?: boolean;
}

export interface ModalAria {
  /** Props for the modal content element. */
  modalProps: {
    "data-ismodal": boolean;
  };
}

/**
 * Hides content outside the current `<OverlayContainer>` from screen readers
 * on mount and restores it on unmount. Typically used by modal dialogs and
 * other types of overlays to ensure that only the top-most modal is
 * accessible at once.
 */
export function createModal(options?: AriaModalOptions): ModalAria {
  // Add aria-hidden to all parent providers on mount, and restore on unmount.
  const context = useContextOptional(ModalContext);

  if (!context) {
    throw new Error("Modal is not contained within a provider");
  }

  createTrackedEffect(() => {
    const _s2Cleanups: Array<() => void> = [];

    if (options?.isDisabled || !context.parent) {
      return;
    }

    // The immediate context is from the provider containing this modal, so we only
    // want to trigger aria-hidden on its parents not on the modal provider itself.
    context.parent.addModal();

    _s2Cleanups.push(() => {
      if (context.parent) {
        context.parent.removeModal();
      }
    });

    return () => {
      for (const c of _s2Cleanups) c();
    };
  });

  return {
    modalProps: {
      "data-ismodal": !options?.isDisabled,
    },
  };
}
