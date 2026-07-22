import { createEffect, createSignal, onCleanup, type Accessor } from "solid-js";

export function createPendingState(isPending: Accessor<boolean | undefined>) {
  const [isProgressVisible, setIsProgressVisible] = createSignal(false);

  createEffect(() => {
    let timeout: ReturnType<typeof setTimeout> | undefined;

    if (isPending()) {
      timeout = setTimeout(() => {
        setIsProgressVisible(true);
      }, 1000);
    } else {
      setIsProgressVisible(false);
    }

    onCleanup(() => {
      if (timeout) {
        clearTimeout(timeout);
      }
    });
  });

  return { isProgressVisible };
}
