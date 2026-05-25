import type { JSX } from "solid-js";
import { mergeStyles } from "../style/runtime";
import type { StyleString } from "../style";

const DEFAULT_SLOT = "default";

export type RefLike<T> = T | ((el: T) => void) | { current?: T | null } | undefined;

export type SpectrumContextValue<T extends { slot?: string | null } = Record<string, never>> =
  | (Partial<T> & {
      slots?: Record<string, Partial<T> | null | undefined>;
    })
  | null;

export function getSlottedContextProps<T extends { slot?: string | null }>(
  context: SpectrumContextValue<T>,
  slot?: string | null,
): Partial<T> | null {
  if (!context || slot === null) {
    return null;
  }

  if ("slots" in context && context.slots) {
    const slotName = slot ?? DEFAULT_SLOT;
    const slotProps = context.slots[slotName];

    if (!slotProps) {
      const validSlots = Object.keys(context.slots)
        .map((name) => `"${name}"`)
        .join(", ");
      throw new Error(
        slot
          ? `Invalid slot "${slot}". Valid slot names are ${validSlots}.`
          : `A slot prop is required. Valid slot names are ${validSlots}.`,
      );
    }

    return slotProps;
  }

  return context;
}

export function mergeContextStyles(
  contextStyles?: StyleString | (() => StyleString | undefined),
  localStyles?: StyleString | (() => StyleString | undefined),
): StyleString | undefined {
  const resolvedContextStyles =
    typeof contextStyles === "function" ? contextStyles() : contextStyles;
  const resolvedLocalStyles = typeof localStyles === "function" ? localStyles() : localStyles;

  return resolvedContextStyles && resolvedLocalStyles
    ? mergeStyles(resolvedContextStyles, resolvedLocalStyles)
    : (resolvedLocalStyles ?? resolvedContextStyles);
}

export function mergeContextUnsafeStyle(
  contextStyle?: JSX.CSSProperties,
  localStyle?: JSX.CSSProperties,
): JSX.CSSProperties | undefined {
  if (contextStyle && localStyle) {
    return { ...contextStyle, ...localStyle };
  }

  return localStyle ?? contextStyle;
}

export function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) {
    return;
  }

  if (typeof ref === "function") {
    (ref as (el: T) => void)(el);
  } else if (typeof ref === "object" && ref != null && "current" in ref) {
    ref.current = el;
  }
}

export function mergeContextRefs<T>(...refs: RefLike<T>[]): (el: T) => void {
  return (el: T) => {
    const seen = new Set<RefLike<T>>();
    for (const ref of refs) {
      if (!ref || seen.has(ref)) {
        continue;
      }

      seen.add(ref);
      assignRef(ref, el);
    }
  };
}
