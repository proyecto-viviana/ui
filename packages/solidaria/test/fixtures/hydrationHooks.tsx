import { createSignal, createUniqueId, Show, type Accessor } from "solid-js";
import {
  createBrowserEffect,
  createBrowserValue,
  createHydrationState,
  useIsSSR,
} from "../../src/ssr";
import {
  createFocusVisible,
  useIsKeyboardFocused,
} from "../../src/interactions/createInteractionModality";

export const hookCases = [
  "focus-visible",
  "keyboard-focused",
  "hydration-state",
  "is-ssr",
  "browser-effect",
  "browser-value",
  "browser-function",
] as const;
export type HookCase = (typeof hookCases)[number];

export const fallbackFunction = () => {
  throw new Error("Function fallback must not be invoked");
};
export const browserFunction = () => {
  throw new Error("Function value must not be invoked");
};

export interface HookProbe {
  kind: HookCase;
  state?: (read: Accessor<unknown>) => void;
  id?: (id: string) => void;
  ref?: (element: HTMLSpanElement) => void;
  ran?: (value: number) => void;
  cleaned?: (value: number) => void;
  update?: (update: (value: number) => void) => void;
}

function HookOwner(props: HookProbe) {
  const [version, setVersion] = createSignal(0);
  props.update?.(setVersion);
  let value: Accessor<unknown>;
  switch (props.kind) {
    case "focus-visible":
      value = createFocusVisible().isFocusVisible;
      break;
    case "keyboard-focused":
      value = useIsKeyboardFocused();
      break;
    case "hydration-state":
      value = createHydrationState();
      break;
    case "is-ssr":
      value = useIsSSR();
      break;
    case "browser-effect":
      createBrowserEffect(() => {
        const current = version();
        props.ran?.(current);
        return () => props.cleaned?.(current);
      });
      value = version;
      break;
    case "browser-value":
      value = createBrowserValue(() => {
        props.ran?.(version());
        return "browser";
      }, "fallback");
      break;
    case "browser-function":
      value = createBrowserValue(() => {
        props.ran?.(version());
        return browserFunction;
      }, fallbackFunction);
      break;
  }
  // Allocate in the hook's own owner, not in an isolated sibling component.
  const id = createUniqueId();
  props.id?.(id);
  props.state?.(value);
  return (
    <span id={id} data-hook={props.kind} ref={props.ref}>
      {typeof value() === "function" ? "function" : String(value())}
    </span>
  );
}

export function HydrationHookFixture(
  props: HookProbe & { reveal?: (set: (visible: boolean) => void) => void },
) {
  const [visible, setVisible] = createSignal(true);
  props.reveal?.(setVisible);
  return (
    <section>
      <Show when={visible()}>
        <HookOwner {...props} />
      </Show>
    </section>
  );
}
