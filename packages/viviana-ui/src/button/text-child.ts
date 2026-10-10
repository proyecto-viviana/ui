import { createMemo } from "solid-js";
import type { JSX } from "@solidjs/web";

// Cache each dynamic child under the slot owner. Keep its accessor in the
// rendered content so mixed text updates without rebuilding static siblings.
export function memoizeChildAccessors(content: JSX.Element): JSX.Element {
  if (typeof content === "function") {
    const accessor = content as () => JSX.Element;
    return createMemo(() => memoizeChildAccessors(accessor())) as unknown as JSX.Element;
  }

  if (Array.isArray(content)) {
    return content.map(memoizeChildAccessors);
  }

  return content;
}

// Solid helpers may pass one plain text child as ["Label"]; upstream React sees
// the equivalent authoring shape as a string child and wraps it in Text.
export function getSingleTextChild(content: unknown): string | undefined {
  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content) && content.length === 1 && typeof content[0] === "string") {
    return content[0];
  }

  return undefined;
}
