// Solid JSX event handlers are either a function or a bound tuple
// `{ 0: (data, event) => void, 1: data }` (`BoundEventHandler` in @solidjs/web).
// This helper is private to solidaria. It is not a public export.

/**
 * Invoke a Solid `EventHandlerUnion`. A bound tuple calls `handler(data, event)`,
 * including when `data` is `undefined`. A plain function receives the event.
 * Absent and non-callable values do nothing.
 */
export function callEventHandler<E extends Event>(handler: unknown, event: E): void {
  if (typeof handler === "function") {
    (handler as (event: E) => void)(event);
    return;
  }
  if (handler !== null && typeof handler === "object") {
    const bound = handler as { 0?: unknown; 1?: unknown };
    const invoke = bound[0];
    if (typeof invoke === "function") {
      // Bare call so `this` is not the tuple. A method call would bind `this` to it.
      (invoke as (data: unknown, event: E) => void)(bound[1], event);
    }
  }
}
