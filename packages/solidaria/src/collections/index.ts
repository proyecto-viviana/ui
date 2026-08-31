/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/collections/BaseCollection.ts
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/collections/CollectionBuilder.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/collections/Hidden.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria/src/collections/useCachedChildren.ts

import { createContext, createMemo, useContext, type Accessor } from "solid-js";
import { access, type MaybeAccessor } from "../utils";
import {
  ListCollection,
  type Collection as StatelyCollection,
  type CollectionNode as StatelyCollectionNode,
  type Key,
} from "@proyecto-viviana/solid-stately";

export interface CachedChildrenOptions<T> {
  items?: Iterable<T>;
  children?: ((item: T) => unknown) | unknown;
  dependencies?: ReadonlyArray<unknown>;
  getKey?: (item: T) => Key;
  idScope?: Key;
  addIdAndValue?: boolean;
}

export interface CollectionBuilderProps<T> extends CachedChildrenOptions<T> {}

export interface CollectionProps<T> extends CollectionBuilderProps<T> {}

export interface CollectionCompatNode<TProps = unknown, TValue = unknown> {
  key: Key;
  value: TValue;
  props: TProps;
}

const COLLECTION_NODE_PROP = "__collectionNode";

function applyCollectionMetadata<T>(
  rendered: unknown,
  item: T,
  key: Key,
  addIdAndValue: boolean,
): unknown {
  if (typeof rendered !== "object" || rendered === null) return rendered;
  const next = {
    ...(rendered as Record<string, unknown>),
    key,
    [COLLECTION_NODE_PROP]: {
      key,
      value: item,
      props: rendered as Record<string, unknown>,
    } satisfies CollectionCompatNode<Record<string, unknown>, T>,
  } as Record<string, unknown>;
  if (addIdAndValue) {
    next.id = key;
    next.value = item;
  }
  return next;
}

/**
 * Compatibility helper mirroring React Aria collections API shape.
 * For Solid, this is a lightweight mapper over item arrays.
 */
export function CollectionBuilder<T>(props: CollectionBuilderProps<T>): unknown {
  if (typeof props.children === "function" && props.items) {
    const children = props.children as (item: T) => unknown;
    const mapped: unknown[] = [];
    let index = 0;

    for (const item of props.items) {
      const baseKey = getResolvedItemKey(item, index, props.getKey);
      if (baseKey == null) {
        throw new Error("Could not determine key for item");
      }
      const key = props.idScope != null ? `${String(props.idScope)}:${String(baseKey)}` : baseKey;
      const rendered = children(item);
      const withMeta = applyCollectionMetadata(rendered, item, key, props.addIdAndValue ?? false);
      mapped.push(withMeta);
      index += 1;
    }

    return mapped;
  }
  return props.children ?? null;
}

export function Collection<T>(props: CollectionProps<T>): unknown {
  return CollectionBuilder({
    ...props,
    addIdAndValue: props.addIdAndValue ?? true,
  });
}

/**
 * Identity helper retained for API compatibility.
 */
export function createLeafComponent<TProps>(
  component: (props: TProps, node?: CollectionCompatNode<TProps, unknown>) => unknown,
): (props: TProps) => unknown {
  return (props: TProps) => {
    const node = (props as Record<string, unknown>)[COLLECTION_NODE_PROP] as
      | CollectionCompatNode<TProps, unknown>
      | undefined;
    if (component.length >= 2 && !node) {
      throw new Error(`${component.name || "Component"} cannot be rendered outside a collection.`);
    }
    return component(props, node);
  };
}

/**
 * Identity helper retained for API compatibility.
 */
export function createBranchComponent<TProps>(
  component: (props: TProps, node?: CollectionCompatNode<TProps, unknown>) => unknown,
): (props: TProps) => unknown {
  return (props: TProps) => {
    const node = (props as Record<string, unknown>)[COLLECTION_NODE_PROP] as
      | CollectionCompatNode<TProps, unknown>
      | undefined;
    if (component.length >= 2 && !node) {
      throw new Error(`${component.name || "Component"} cannot be rendered outside a collection.`);
    }
    return component(props, node);
  };
}

const HiddenContext = createContext<Accessor<boolean>>(() => false);

/**
 * Wraps a component and suppresses rendering when the hidden context is true.
 */
export function createHideableComponent<TProps>(
  component: (props: TProps) => unknown,
): (props: TProps) => unknown {
  return (props: TProps) => {
    const isHidden = useIsHidden();
    if (isHidden()) return null;
    return component(props);
  };
}

export function useIsHidden(): Accessor<boolean> {
  return useContext(HiddenContext) ?? (() => false);
}

/**
 * Memoized item renderer for dynamic child mapping.
 */
export function useCachedChildren<T>(
  options: MaybeAccessor<CachedChildrenOptions<T>>,
): Accessor<unknown[]> {
  let objectCache = new WeakMap<object, unknown>();
  const primitiveCache = new Map<Key, unknown>();
  let lastDependencies: ReadonlyArray<unknown> | undefined;
  let lastIdScope: Key | undefined;
  let lastAddIdAndValue: boolean | undefined;
  let lastGetKey: ((item: T) => Key) | undefined;

  const clearCaches = (): void => {
    objectCache = new WeakMap<object, unknown>();
    primitiveCache.clear();
  };

  const getItemKey = (item: T, index: number, getKey?: (item: T) => Key): Key | undefined => {
    return getResolvedItemKey(item, index, getKey);
  };

  return createMemo(() => {
    const resolved = access(options);
    const resolvedAddIdAndValue = resolved.addIdAndValue ?? false;
    const resolvedGetKey = resolved.getKey;
    const resolvedIdScope = resolved.idScope;

    if (resolved.dependencies && resolved.dependencies !== lastDependencies) {
      clearCaches();
      lastDependencies = resolved.dependencies;
    }
    if (
      resolvedIdScope !== lastIdScope ||
      resolvedAddIdAndValue !== lastAddIdAndValue ||
      resolvedGetKey !== lastGetKey
    ) {
      clearCaches();
      lastIdScope = resolvedIdScope;
      lastAddIdAndValue = resolvedAddIdAndValue;
      lastGetKey = resolvedGetKey;
    }

    if (typeof resolved.children === "function" && resolved.items) {
      const children = resolved.children as (item: T) => unknown;
      const rendered: unknown[] = [];
      let index = 0;

      for (const item of resolved.items) {
        const baseKey = getItemKey(item, index, resolvedGetKey);
        if (baseKey == null) {
          throw new Error("Could not determine key for item");
        }
        const key =
          resolvedIdScope != null ? `${String(resolvedIdScope)}:${String(baseKey)}` : baseKey;
        let child: unknown;

        if (typeof item === "object" && item !== null) {
          child = objectCache.get(item as object);
          if (child === undefined) {
            child = applyCollectionMetadata(children(item), item, key, resolvedAddIdAndValue);
            objectCache.set(item as object, child);
          }
        } else {
          if (primitiveCache.has(key)) {
            child = primitiveCache.get(key);
          } else {
            child = applyCollectionMetadata(children(item), item, key, resolvedAddIdAndValue);
            primitiveCache.set(key, child);
          }
        }

        rendered.push(child);
        index += 1;
      }

      return rendered;
    }
    const child = resolved.children;
    return child == null ? [] : [child];
  });
}

/**
 * Minimal BaseCollection compatibility class.
 */
export class BaseCollection<T = unknown> extends ListCollection<T> {}

export type CollectionNode<T = unknown> = StatelyCollectionNode<T>;
export type ItemNode<T = unknown> = StatelyCollectionNode<T>;
export type SectionNode<T = unknown> = StatelyCollectionNode<T>;
export type FilterableNode<T = unknown> = StatelyCollectionNode<T>;
export type LoaderNode<T = unknown> = StatelyCollectionNode<T>;
export type HeaderNode<T = unknown> = StatelyCollectionNode<T>;
export type CollectionType<T = unknown> = StatelyCollection<T>;

function getResolvedItemKey<T>(item: T, index: number, getKey?: (item: T) => Key): Key | undefined {
  if (getKey) return getKey(item);
  if (typeof item === "object" && item !== null) {
    const keyed = item as Record<string, unknown>;
    const keyValue = keyed.key ?? keyed.id;
    if (typeof keyValue === "string" || typeof keyValue === "number") return keyValue;
  }
  if (typeof item === "string" || typeof item === "number") return index;
  return undefined;
}
