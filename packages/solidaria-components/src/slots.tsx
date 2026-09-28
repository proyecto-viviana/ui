import { createComponent, createContext, useContext, type Accessor } from "solid-js";
import type { JSX } from "@solidjs/web";

/**
 * Class and slot name a parent publishes for one slot. Styled parents fill
 * this at render time so Text, Icon, and Button do not need a DOM walk.
 */
export interface SlotValue {
  class?: string;
  "data-rsp-slot"?: string;
}

export interface SlotMap {
  [slot: string]: SlotValue;
}

export interface SlotContextValue {
  slots: Accessor<SlotMap>;
}

export const SlotContext = createContext<SlotContextValue | null>(null);

const EMPTY_SLOT: SlotValue = {};

function ownSlots(slots: Accessor<SlotMap> | SlotMap): SlotMap {
  return typeof slots === "function" ? slots() : slots;
}

/**
 * Publishes a slot class map. A child slot replaces the parent entry for that
 * name. Children are created inside the provider: Solid binds `useContext`
 * when the child runs, so eager children would miss this value.
 */
export function SlotProvider(props: {
  slots: Accessor<SlotMap> | SlotMap;
  children: JSX.Element;
}): JSX.Element {
  const parent = useContext(SlotContext);
  const slots = (): SlotMap => {
    const inherited = parent?.slots() ?? {};
    const own = ownSlots(props.slots);
    if (Object.keys(inherited).length === 0) return own;
    return { ...inherited, ...own };
  };

  return createComponent(SlotContext, {
    value: { slots },
    get children() {
      return props.children;
    },
  });
}

export function useSlotValue(
  slot: Accessor<string | undefined | null | false>,
  // Icons and buttons with no slot of their own must not wear the label slot
  // published for Text. `named` skips that default.
  options?: { named?: boolean },
): Accessor<SlotValue> {
  const ctx = useContext(SlotContext);
  return () => {
    const map = ctx?.slots() ?? {};
    const name = slot();
    if (typeof name === "string" && name.length > 0 && map[name]) return map[name];
    if (options?.named) return EMPTY_SLOT;
    return map.default ?? EMPTY_SLOT;
  };
}

type SlotClassPart =
  | string
  | number
  | boolean
  | null
  | undefined
  | readonly SlotClassPart[]
  | { readonly [className: string]: boolean | null | undefined };

function pushSlotClass(part: SlotClassPart, seen: Set<string>, out: string[]): void {
  if (part == null || part === false || part === true) return;
  if (typeof part === "string" || typeof part === "number") {
    for (const token of String(part).split(/\s+/)) {
      if (!token || seen.has(token)) continue;
      seen.add(token);
      out.push(token);
    }
    return;
  }
  if (Array.isArray(part)) {
    for (const item of part) pushSlotClass(item, seen, out);
    return;
  }
  for (const [token, on] of Object.entries(part)) {
    if (on) pushSlotClass(token, seen, out);
  }
}

export function joinSlotClass(...parts: SlotClassPart[]): string | undefined {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const part of parts) pushSlotClass(part, seen, out);
  return out.length > 0 ? out.join(" ") : undefined;
}
