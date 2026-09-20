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
import { createAutoFocus, type AutoFocusResult } from "../../src/focus/createAutoFocus";
import { createFocusRestore, type FocusRestoreResult } from "../../src/focus/createFocusRestore";
import { createVirtualFocus, type VirtualFocusResult } from "../../src/focus/createVirtualFocus";

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

export const focusHookCases = ["auto-focus", "focus-restore", "virtual-focus"] as const;
export type FocusHookCase = (typeof focusHookCases)[number];

interface FocusItem {
  key: string;
  disabled?: boolean;
}

export interface FocusHookProbe {
  kind: FocusHookCase;
  id?: (id: string) => void;
  ref?: (element: HTMLDivElement) => void;
  readRef?: () => void;
  auto?: (api: AutoFocusResult) => void;
  restore?: (api: FocusRestoreResult) => void;
  virtual?: (api: VirtualFocusResult<FocusItem>) => void;
  focused?: (element: HTMLElement) => void;
  restored?: (element: HTMLElement) => void;
}

export function FocusHookFixture(props: FocusHookProbe) {
  let element: HTMLDivElement | undefined;
  let auto: AutoFocusResult | undefined;
  let restore: FocusRestoreResult | undefined;
  let virtual: VirtualFocusResult<FocusItem> | undefined;
  if (props.kind === "auto-focus") {
    auto = createAutoFocus(
      () => {
        props.readRef?.();
        return element;
      },
      { onFocus: props.focused },
    );
  } else if (props.kind === "focus-restore") {
    restore = createFocusRestore({ restoreOnUnmount: false, onRestore: props.restored });
  } else {
    virtual = createVirtualFocus({
      items: () => [{ key: "one" }, { key: "disabled", disabled: true }, { key: "three" }],
      getKey: (item) => item.key,
      isDisabled: (item) => !!item.disabled,
    });
  }
  // This ID must remain in the hook's own owner, before another primitive.
  const id = createUniqueId();
  props.id?.(id);
  if (auto) props.auto?.(auto);
  if (restore) props.restore?.(restore);
  if (virtual) props.virtual?.(virtual);
  return (
    <div
      id={id}
      data-focus-hook={props.kind}
      tabIndex={0}
      role={virtual ? "listbox" : undefined}
      aria-activedescendant={virtual?.containerProps["aria-activedescendant"]()}
      onKeyDown={virtual?.containerProps.onKeyDown}
      ref={(node) => {
        element = node;
        props.ref?.(node);
      }}
    >
      <span id="item-one">One</span>
      <span id="item-disabled">Disabled</span>
      <span id="item-three">Three</span>
    </div>
  );
}
