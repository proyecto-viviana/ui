import { flush } from "solid-js";

export { flush };

/** Run `fn` and drain Solid 2's microtask batch before asserting. */
export function act(fn?: () => void): void {
  fn?.();
  flush();
}
