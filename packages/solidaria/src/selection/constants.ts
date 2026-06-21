/**
 * Custom DOM event names used to drive virtual focus into a selectable
 * collection from an outside controller (e.g. an Autocomplete input). Mirrors
 * @react-aria/selection's `utils/constants` (`FOCUS_EVENT` / `CLEAR_FOCUS_EVENT`).
 *
 * Canonical home is here, in the selection layer, because the collection is the
 * consumer that listens for them. A controller that wants to move virtual focus
 * (the deferred autocomplete-collection bridge) dispatches these onto the
 * collection ref.
 */

/** Dispatched onto a collection to focus it (optionally its first item). */
export const FOCUS_EVENT = "react-aria-focus";

/** Dispatched onto a collection to blur it (optionally clearing the focused key). */
export const CLEAR_FOCUS_EVENT = "react-aria-clear-focus";
