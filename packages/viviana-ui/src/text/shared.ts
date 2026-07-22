import type { JSX } from "solid-js";
import type { RefLike } from "../button/spectrum-context";
import type { UnsafeClassName } from "../s2-internal/style-utils";
import type { StyleString } from "../style";

export interface BaseContentProps<T extends HTMLElement = HTMLElement> {
  children?: JSX.Element;
  styles?: StyleString | (() => StyleString | undefined);
  UNSAFE_className?: UnsafeClassName | string;
  UNSAFE_style?: JSX.CSSProperties;
  isHidden?: boolean;
  id?: string;
  itemProp?: string;
  itemScope?: boolean;
  itemType?: string;
  itemID?: string;
  itemRef?: string;
  role?: string;
  slot?: string | null;
  ref?: RefLike<T>;
  [key: `data-${string}`]: string | undefined;
}

export function mergeUnsafeClassName(
  contextClassName?: UnsafeClassName | string,
  localClassName?: UnsafeClassName | string,
): string | undefined {
  return [contextClassName, localClassName].filter(Boolean).join(" ") || undefined;
}

export function getContentDomProps<T extends HTMLElement>(
  props: BaseContentProps<T>,
): JSX.HTMLAttributes<T> {
  const domProps: Record<string, unknown> = {};

  for (const key of [
    "id",
    "itemProp",
    "itemScope",
    "itemType",
    "itemID",
    "itemRef",
    "role",
  ] as const) {
    const value = props[key];
    if (value !== undefined) {
      domProps[key] = value;
    }
  }

  const record = props as Record<string, unknown>;
  for (const key in record) {
    if (key.startsWith("data-")) {
      const value = record[key];
      domProps[key] = value == null ? undefined : String(value);
    }
  }

  return domProps as JSX.HTMLAttributes<T>;
}
