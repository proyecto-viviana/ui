/**
 * Menu compatibility surface.
 *
 * Exposes React Stately-like menu hook names while using existing
 * Solid menu state primitives.
 */

export {
  createMenuState,
  createMenuTriggerState,
  type MenuStateProps,
  type MenuState,
  type MenuTriggerType,
  type MenuTriggerProps,
  type MenuTriggerStateProps,
  type MenuTriggerState,
} from "../collections/createMenuState";

export { createMenuTriggerState as useMenuTriggerState } from "../collections/createMenuState";
