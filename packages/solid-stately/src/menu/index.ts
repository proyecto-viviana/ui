/**
 * Menu compatibility surface.
 *
 * Exposes React Stately-like menu hook names while using existing
 * Solid menu state primitives.
 */

export {
  createMenuState,
  createMenuTriggerState,
  createSubmenuTriggerState,
  type MenuStateProps,
  type MenuState,
  type MenuTriggerType,
  type MenuTriggerProps,
  type MenuTriggerStateProps,
  type MenuTriggerState,
  type RootMenuTriggerState,
  type SubmenuTriggerProps,
  type SubmenuTriggerState,
} from "../collections/createMenuState";

export { createMenuTriggerState as useMenuTriggerState } from "../collections/createMenuState";
export { createSubmenuTriggerState as useSubmenuTriggerState } from "../collections/createMenuState";
