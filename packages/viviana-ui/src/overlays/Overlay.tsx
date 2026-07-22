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
