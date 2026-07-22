/**
 * createMediaQuery — a SolidJS reactive media-query primitive.
 *
 * Based on @react-spectrum/utils' useMediaQuery: subscribes to
 * `window.matchMedia` and updates when the query's match state changes. Returns
 * `false` during SSR (and before mount) so the server and first client render
 * agree, then resolves to the real value once mounted on the client.
 */
import { createSignal, onCleanup, onMount } from "solid-js";

export function createMediaQuery(query: string): () => boolean {
  const supportsMatchMedia =
    typeof window !== "undefined" && typeof window.matchMedia === "function";

  const [matches, setMatches] = createSignal(false);

  onMount(() => {
    if (!supportsMatchMedia) {
      return;
    }

    const mq = window.matchMedia(query);
    setMatches(mq.matches);

    const onChange = (event: MediaQueryListEvent): void => {
      setMatches(event.matches);
    };

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", onChange);
      onCleanup(() => mq.removeEventListener("change", onChange));
    } else {
      // Safari < 14 only supports the deprecated MediaQueryList listener API.
      mq.addListener(onChange);
      onCleanup(() => mq.removeListener(onChange));
    }
  });

  return matches;
}
