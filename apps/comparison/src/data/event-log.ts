/**
 * Fixture-side callback logging for the D4 event-sequence oracle
 * (recertification.md Phase 1).
 *
 * Component callbacks (onPress*, onSelectionChange, onOpenChange, ...) are
 * invisible to DOM listeners, so fixtures re-emit them as bubbling
 * `comparison:callback` CustomEvents. The e2e recorder listens at the
 * document root in capture phase, so a callback lands in the recorded log at
 * exactly the position it fired relative to the native events around it
 * (dispatchEvent is synchronous). Both stacks import this same module, so the
 * emission itself can never diverge — only the component's callback timing
 * can, which is precisely the signal D4 diffs.
 */

export const comparisonCallbackEvent = "comparison:callback";

export interface ComparisonCallbackDetail {
  component: string;
  callback: string;
  /** `pointerType` from press events; null for non-press callbacks. */
  pointerType: string | null;
  /** Stringified callback payload (selection key, open state, ...). */
  value: string | null;
}

interface PressLikeEvent {
  target?: unknown;
  pointerType?: string;
}

export function dispatchComparisonCallback(
  component: string,
  callback: string,
  options: { target?: unknown; pointerType?: string | null; value?: unknown } = {},
): void {
  if (typeof document === "undefined") {
    return;
  }
  const target = options.target instanceof Element ? options.target : document;
  const detail: ComparisonCallbackDetail = {
    component,
    callback,
    pointerType: options.pointerType ?? null,
    value: options.value === undefined ? null : String(options.value),
  };
  target.dispatchEvent(new CustomEvent(comparisonCallbackEvent, { bubbles: true, detail }));
}

/**
 * The full set of press callbacks for a pressable fixture, each re-emitting
 * into the D4 log. `onPressChange` receives a bare boolean, so it dispatches
 * from the last press target seen (it only ever fires between onPressStart
 * and onPressEnd).
 */
export function pressCallbackLoggers(component: string) {
  let lastTarget: Element | null = null;
  const forward = (callback: string) => (event: PressLikeEvent) => {
    if (event?.target instanceof Element) {
      lastTarget = event.target;
    }
    dispatchComparisonCallback(component, callback, {
      target: event?.target ?? lastTarget,
      pointerType: event?.pointerType ?? null,
    });
  };
  return {
    onPressStart: forward("onPressStart"),
    onPressEnd: forward("onPressEnd"),
    onPressUp: forward("onPressUp"),
    onPress: forward("onPress"),
    onPressChange: (isPressed: boolean) =>
      dispatchComparisonCallback(component, "onPressChange", {
        target: lastTarget,
        value: isPressed,
      }),
  };
}
