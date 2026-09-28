/**
 * Collapsed disclosure for the SSR/hydrate pair. The panel `hidden` attribute
 * has to survive the hydration walk.
 */
import { createDisclosureState } from "@proyecto-viviana/solid-stately";
import { createDisclosure } from "../../src/disclosure/createDisclosure";

export function CollapsedDisclosureFixture() {
  let panelRef: HTMLDivElement | undefined;
  const state = createDisclosureState({ defaultExpanded: false });
  const aria = createDisclosure({}, state, () => panelRef ?? null);

  return (
    <>
      <button {...aria.buttonProps}>Toggle</button>
      <div ref={panelRef} {...aria.panelProps}>
        Content
      </div>
    </>
  );
}
