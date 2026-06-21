/**
 * Selection compatibility surface.
 *
 * Provides a React Stately-like module entrypoint for selection state while
 * delegating to the existing Solid collection selection primitives.
 */

export {
  createSelectionState,
  type SelectionStateProps,
  type SelectionState,
} from "../collections/createSelectionState";

export {
  SelectionManager,
  type SelectionManagerOptions,
  type LayoutDelegate,
} from "./SelectionManager";

export type {
  Key,
  Selection,
  SelectionMode,
  SelectionBehavior,
  DisabledBehavior,
  FocusStrategy,
} from "../collections/types";

export type MultipleSelectionStateProps =
  import("../collections/createSelectionState").SelectionStateProps;
export type MultipleSelectionState = import("../collections/createSelectionState").SelectionState;

export { createSelectionState as useMultipleSelectionState } from "../collections/createSelectionState";
