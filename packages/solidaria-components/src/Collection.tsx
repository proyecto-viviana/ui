/*
 * Copyright 2022 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/Collection.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/Group.tsx
// Ported to SolidJS for Proyecto Viviana; based on packages/react-aria-components/src/Header.tsx

/**
 * Collection composition primitives for solidaria-components.
 *
 * Foundational parity layer for React Spectrum-style composition:
 * Section / Header / Group. Based on:
 * - packages/react-aria-components/src/Collection.tsx
 * - packages/react-aria-components/src/Group.tsx
 * - packages/react-aria-components/src/Header.tsx
 */

import { type JSX, createContext, createMemo, splitProps, useContext, For } from "solid-js";
import type { Key } from "@proyecto-viviana/solid-stately";
import type { DragTypes, DropOperation, DropTarget } from "@proyecto-viviana/solid-stately";
import {
  Collection as AriaCollection,
  CollectionBuilder as AriaCollectionBuilder,
  createLeafComponent,
  createBranchComponent,
  type CollectionProps as AriaCollectionProps,
  type CollectionBuilderProps as AriaCollectionBuilderProps,
} from "@proyecto-viviana/solidaria";
import {
  type ClassNameOrFunction,
  type StyleOrFunction,
  type SlotProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";

export interface CollectionPrimitiveRenderProps {
  /** Whether the primitive has visible children content. */
  hasChildren: boolean;
}

type RefLike<T> = ((el: T) => void) | { current?: T | null } | undefined;

function assignRef<T>(ref: RefLike<T>, el: T): void {
  if (!ref) return;
  if (typeof ref === "function") ref(el);
  else ref.current = el;
}

export interface CollectionDropTargetDelegate {
  getDropTargetFromPoint(
    x: number,
    y: number,
    isValidDropTarget: (target: DropTarget) => boolean,
  ): DropTarget | null;
  getDropOperation(
    target: DropTarget,
    types: DragTypes,
    allowedOperations: DropOperation[],
  ): DropOperation;
  getKeyboardNavigationTarget?(
    target: DropTarget | null,
    direction: "next" | "previous",
    isValidDropTarget: (target: DropTarget) => boolean,
  ): DropTarget | null;
  getKeyboardPageNavigationTarget?(
    target: DropTarget | null,
    direction: "next" | "previous",
    isValidDropTarget: (target: DropTarget) => boolean,
  ): DropTarget | null;
}

export interface CollectionRendererContextValue<T> {
  /** Render function used by collection parents to render each item node. */
  renderItem: (item: T) => JSX.Element;
  /** Whether collection rendering is currently virtualized. */
  isVirtualized?: boolean;
  /** Optional layout delegate used by virtualized renderers. */
  layoutDelegate?: unknown;
  /** Optional drop target delegate used by DnD-aware collection paths. */
  dropTargetDelegate?: CollectionDropTargetDelegate;
  /** Optional drop indicator renderer for DnD-aware collection paths. */
  renderDropIndicator?: (
    index: number,
    position: "before" | "after" | "on",
  ) => JSX.Element | undefined;
  /**
   * Root renderer for collection items. RAC `CollectionRenderer.CollectionRoot`
   * (`Collection.tsx:196`). Virtualizer replaces this with a scroll-attached
   * content wrapper (`react-aria-components/src/Virtualizer.tsx:99-151`).
   */
  CollectionRoot?: (props: CollectionRootProps<T>) => JSX.Element;
  /** Branch renderer for nested collection items. RAC `CollectionBranch`. */
  CollectionBranch?: (props: CollectionBranchProps<T>) => JSX.Element;
}

export type CollectionEntry<T> = T | CollectionSection<T>;

export interface CollectionSection<T> {
  /** Optional unique key for the section wrapper. */
  key?: Key;
  /** Optional section header title. */
  title?: JSX.Element;
  /** Optional aria-label for section grouping. */
  "aria-label"?: string;
  /** Items contained in the section. */
  items: T[];
}

export interface SectionProps extends SlotProps {
  /** Section contents, usually Header + Group/items. */
  children?: JSX.Element;
  /** Ref for the section element. */
  ref?: RefLike<HTMLDivElement>;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<CollectionPrimitiveRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<CollectionPrimitiveRenderProps>;
}

export interface HeaderProps extends SlotProps {
  /** Header contents, usually section title text. */
  children?: JSX.Element;
  /** Optional heading level when rendered as a heading role. */
  "aria-level"?: number;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<CollectionPrimitiveRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<CollectionPrimitiveRenderProps>;
}

export interface GroupProps extends SlotProps {
  /** Group contents, usually section items. */
  children?: JSX.Element;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<CollectionPrimitiveRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<CollectionPrimitiveRenderProps>;
}

interface SectionContextValue {
  name: string;
  render: (props: SectionProps, className?: string) => JSX.Element;
}

export interface CollectionBranchProps<T> {
  collection: Iterable<T>;
  parent?: unknown;
  renderDropIndicator?: (target: {
    type: "item";
    key: Key;
    dropPosition: "before" | "after" | "on";
  }) => JSX.Element | undefined;
}

export interface CollectionRootProps<T> {
  collection: Iterable<T>;
  persistedKeys?: Set<Key> | null;
  /**
   * The collection element that scrolls. RAC `CollectionRootProps.scrollRef`
   * (`Collection.tsx:183`).
   */
  scrollRef?: () => HTMLElement | null | undefined;
  renderDropIndicator?: (target: {
    type: "item";
    key: Key;
    dropPosition: "before" | "after" | "on";
  }) => JSX.Element | undefined;
  /**
   * Rendered collection items. RAC CollectionRoot renders `node.render()` from
   * the collection; Solid collections pass the already-composed item tree.
   */
  children?: JSX.Element;
}

export interface CollectionRenderer<T = unknown> {
  isVirtualized?: boolean;
  layoutDelegate?: unknown;
  dropTargetDelegate?: CollectionDropTargetDelegate;
  CollectionRoot: (props: CollectionRootProps<T>) => JSX.Element;
  CollectionBranch: (props: CollectionBranchProps<T>) => JSX.Element;
}

export const CollectionRendererContext =
  createContext<CollectionRendererContextValue<unknown> | null>(null);
export const SelectableCollectionContext = CollectionRendererContext;
export const SectionContext = createContext<SectionContextValue | null>(null);
export const GroupContext = createContext<Partial<GroupProps> | null>(null);
export const HeaderContext = createContext<Partial<HeaderProps> | null>(null);
export const HeadingContext = createContext<Partial<HeaderProps> | null>(null);

export function useCollectionRenderer<T>(): CollectionRendererContextValue<T> | null {
  return useContext(CollectionRendererContext) as CollectionRendererContextValue<T> | null;
}

/** RAC collections always render `CollectionRoot` from the renderer context. */
export function useCollectionRoot<T>(): (props: CollectionRootProps<T>) => JSX.Element {
  const renderer = useCollectionRenderer<T>();
  return renderer?.CollectionRoot ?? DefaultCollectionRenderer.CollectionRoot;
}

export function isCollectionSection<T>(entry: CollectionEntry<T>): entry is CollectionSection<T> {
  return (
    typeof entry === "object" &&
    entry !== null &&
    Array.isArray((entry as CollectionSection<T>).items)
  );
}

export function flattenCollectionEntries<T>(entries: CollectionEntry<T>[]): T[] {
  const flattened: T[] = [];
  for (const entry of entries) {
    if (isCollectionSection(entry)) flattened.push(...entry.items);
    else flattened.push(entry);
  }
  return flattened;
}

function renderCollectionItems<T>(
  collection: Iterable<T>,
  renderDropIndicator?: (target: {
    type: "item";
    key: Key;
    dropPosition: "before" | "after" | "on";
  }) => JSX.Element | undefined,
): JSX.Element {
  const items = Array.from(collection);
  return (
    <For each={items}>
      {(item, index) => {
        const node = item as { type?: unknown; key?: Key };
        if (node.type === "content") {
          // Content rows are rendered by their owning item/section branch.
          return <></>;
        }
        const key = node.key ?? index();
        return (
          <>
            {renderDropIndicator?.({ type: "item", key, dropPosition: "before" })}
            {item as unknown as JSX.Element}
            {renderDropIndicator?.({ type: "item", key, dropPosition: "after" })}
          </>
        );
      }}
    </For>
  );
}

export const DefaultCollectionRenderer: CollectionRenderer<unknown> = {
  CollectionRoot(props) {
    if (props.children != null) return props.children;
    return renderCollectionItems(props.collection, props.renderDropIndicator);
  },
  CollectionBranch(props) {
    return renderCollectionItems(props.collection, props.renderDropIndicator);
  },
};

export function CollectionBuilder<T>(props: AriaCollectionBuilderProps<T>): unknown {
  return AriaCollectionBuilder(props);
}

export function Collection<T>(props: AriaCollectionProps<T>): unknown {
  return AriaCollection(props);
}

export { createLeafComponent, createBranchComponent };

/**
 * A semantic section wrapper for grouped collection content.
 */
export function Section(props: SectionProps): JSX.Element {
  const sectionContext = useContext(SectionContext);
  if (sectionContext) {
    const nodeEnv = (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env
      ?.NODE_ENV;
    if (nodeEnv !== "production") {
      console.warn(`<Section> is deprecated. Please use <${sectionContext.name}> instead.`);
    }
    return sectionContext.render(props, "solidaria-Section");
  }

  const [local, domProps] = splitProps(props, ["children", "class", "style", "slot", "ref"]);

  const renderValues = createMemo<CollectionPrimitiveRenderProps>(() => ({
    hasChildren: local.children != null,
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return local.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Section",
    },
    renderValues,
  );

  const filteredDomProps = createMemo(() => filterDOMProps(domProps, { global: true }));

  return (
    <div
      ref={(el) => assignRef(local.ref, el)}
      {...filteredDomProps()}
      class={renderProps.class()}
      style={renderProps.style()}
      slot={local.slot}
      data-section
    >
      {renderProps.renderChildren()}
    </div>
  );
}

/**
 * A header/title primitive for collection sections.
 */
export function Header(props: HeaderProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["children", "class", "style", "slot"]);

  const renderValues = createMemo<CollectionPrimitiveRenderProps>(() => ({
    hasChildren: local.children != null,
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return local.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Header",
    },
    renderValues,
  );

  const filteredDomProps = createMemo(() => filterDOMProps(domProps, { global: true }));

  return (
    <div
      {...filteredDomProps()}
      role="heading"
      class={renderProps.class()}
      style={renderProps.style()}
      slot={local.slot}
      data-header
    >
      {renderProps.renderChildren()}
    </div>
  );
}

/**
 * A grouping primitive for section item containers.
 */
export function Group(props: GroupProps): JSX.Element {
  const [local, domProps] = splitProps(props, ["children", "class", "style", "slot"]);

  const renderValues = createMemo<CollectionPrimitiveRenderProps>(() => ({
    hasChildren: local.children != null,
  }));

  const renderProps = useRenderProps(
    {
      get children() {
        return local.children;
      },
      class: local.class,
      style: local.style,
      defaultClassName: "solidaria-Group",
    },
    renderValues,
  );

  const filteredDomProps = createMemo(() => filterDOMProps(domProps, { global: true }));

  return (
    <div
      {...filteredDomProps()}
      role="group"
      class={renderProps.class()}
      style={renderProps.style()}
      slot={local.slot}
      data-group
    >
      {renderProps.renderChildren()}
    </div>
  );
}
