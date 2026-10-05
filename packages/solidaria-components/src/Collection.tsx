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

import {
  createContext,
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  useContext,
  For,
  type Accessor,
} from "solid-js";
import type { JSX } from "@solidjs/web";
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
import { splitProps, isDevEnv } from "@proyecto-viviana/solidaria/utils";
import {
  type ClassNameOrFunction,
  type ContextValue,
  type StyleOrFunction,
  type SlotProps,
  useContextProps,
  useRenderProps,
  filterDOMProps,
} from "./utils";

export interface CollectionPrimitiveRenderProps {
  /** Whether the primitive has visible children content. */
  hasChildren: boolean;
}

export interface ItemRenderProps {
  /** Whether the item is currently hovered with a mouse. */
  isHovered: boolean;
  /** Whether the item is currently in a pressed state. */
  isPressed: boolean;
  /** Whether the item is currently selected. */
  isSelected: boolean;
  /** Whether the item is currently focused. */
  isFocused: boolean;
  /** Whether the item is currently keyboard focused. */
  isFocusVisible: boolean;
  /** Whether the item is non-interactive. */
  isDisabled: boolean;
  /** The type of selection that is allowed in the collection. */
  selectionMode: "none" | "single" | "multiple";
  /** The selection behavior for the collection. */
  selectionBehavior: "toggle" | "replace";
  /**
   * Whether the item allows dragging.
   *
   * @note This property is only available in collection components that support drag and drop.
   * @selector [data-allows-dragging]
   */
  allowsDragging?: boolean;
  /**
   * Whether the item is currently being dragged.
   *
   * @note This property is only available in collection components that support drag and drop.
   * @selector [data-dragging]
   */
  isDragging?: boolean;
  /**
   * Whether the item is currently an active drop target.
   *
   * @note This property is only available in collection components that support drag and drop.
   * @selector [data-drop-target]
   */
  isDropTarget?: boolean;
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
  /** DOM id forwarded to the section element. */
  id?: string;
  /** ARIA role forwarded to the section element. */
  role?: JSX.HTMLAttributes<HTMLElement>["role"];
  /** Accessible name when the section has no naming header. */
  "aria-label"?: string;
  /** Id of the element that names the section. */
  "aria-labelledby"?: string;
  /** The CSS className for the element. */
  class?: ClassNameOrFunction<CollectionPrimitiveRenderProps>;
  /** The inline style for the element. */
  style?: StyleOrFunction<CollectionPrimitiveRenderProps>;
}

export interface HeaderProps extends SlotProps {
  /** Header contents, usually section title text. */
  children?: JSX.Element;
  /** Ref for the header element. Context refs merge with this. */
  ref?: RefLike<HTMLDivElement>;
  /** DOM id. A menu section assigns this so the group can name itself. */
  id?: string;
  /**
   * ARIA role. Defaults to `heading`. A menu section passes `presentation`
   * so the title names the group instead of exposing a heading.
   */
  role?: JSX.HTMLAttributes<HTMLElement>["role"];
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
export const HeaderContext = createContext<ContextValue<HeaderProps, HTMLDivElement>>(null);
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

export function flattenCollectionEntries<T>(entries?: CollectionEntry<T>[]): T[] {
  if (!entries || !Array.isArray(entries)) return [];
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
  let lastRenderableIndex = -1;
  for (let i = 0; i < items.length; i++) {
    if ((items[i] as { type?: unknown }).type !== "content") {
      lastRenderableIndex = i;
    }
  }
  return (
    <For each={items}>
      {(item, index) => {
        const node = item as { type?: unknown; key?: Key };
        if (node.type === "content") {
          // Content rows are rendered by their owning item/section branch.
          return <></>;
        }
        const key = node.key ?? index();
        const isLastInLevel = index() === lastRenderableIndex;
        return (
          <>
            {renderDropIndicator?.({ type: "item", key, dropPosition: "before" })}
            {item as unknown as JSX.Element}
            {isLastInLevel
              ? renderDropIndicator?.({ type: "item", key, dropPosition: "after" })
              : null}
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

export interface StaticCollectionItem {
  id: Key;
  textValue?: string;
  isDisabled?: boolean;
}

export interface StaticCollectionContextValue {
  registerItem(item: StaticCollectionItem): void;
  unregisterItem(id: Key): void;
}

export const StaticCollectionContext = createContext<StaticCollectionContextValue | null>(null);

/** True only for the registration/probe copy of static collection children. */
export const StaticCollectionProbeContext = createContext(false);

/**
 * Display text for a static collection option. An explicit `textValue` wins,
 * including an empty string. Otherwise a string aria-label, then string or number
 * children.
 */
export function staticItemText(props: {
  textValue?: string;
  "aria-label"?: string;
  children?: unknown;
}): string | undefined {
  if (props.textValue != null) return props.textValue;
  const label = props["aria-label"];
  if (typeof label === "string") return label;
  return textFromNode(props.children);
}

function textFromNode(node: unknown): string | undefined {
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (typeof node === "function" && node.length === 0) {
    return textFromNode((node as () => unknown)());
  }
  if (Array.isArray(node)) {
    let text = "";
    let any = false;
    for (const child of node) {
      const part = textFromNode(child);
      if (part != null) {
        text += part;
        any = true;
      }
    }
    return any ? text : undefined;
  }
  return undefined;
}

/**
 * Manages item descriptor registration for collections with static JSX children (Menu, Select).
 */
export function createStaticCollectionState(): {
  items: Accessor<StaticCollectionItem[]>;
  context: StaticCollectionContextValue;
} {
  const [items, setItems] = createSignal<StaticCollectionItem[]>([]);
  const itemMap = new Map<Key, StaticCollectionItem>();

  const syncItems = () => {
    setItems(Array.from(itemMap.values()));
  };

  const context: StaticCollectionContextValue = {
    registerItem(item) {
      const previous = itemMap.get(item.id);
      if (
        previous &&
        previous.textValue === item.textValue &&
        previous.isDisabled === item.isDisabled
      ) {
        return;
      }

      itemMap.set(item.id, item);
      syncItems();
    },
    unregisterItem(id) {
      if (itemMap.delete(id)) {
        syncItems();
      }
    },
  };

  return { items, context };
}

/**
 * Registers an item with the nearest StaticCollectionContext.
 */
export function useStaticItemRegistration(props: {
  id: Key;
  textValue?: string;
  isDisabled?: boolean | (() => boolean);
  "aria-label"?: string;
  children?: unknown;
}): void {
  const collection = useContext(StaticCollectionContext);
  let registeredKey: Key | null = null;

  createEffect(
    () => {
      if (!collection) return null;
      const disabled = props.isDisabled;
      return {
        id: props.id,
        textValue: staticItemText(props),
        isDisabled: typeof disabled === "function" ? Boolean(disabled()) : Boolean(disabled),
      };
    },
    (item) => {
      if (!collection || !item) return;
      if (registeredKey != null && registeredKey !== item.id) {
        collection.unregisterItem(registeredKey);
      }
      registeredKey = item.id;
      collection.registerItem(item);
    },
  );

  onCleanup(() => {
    if (registeredKey != null) {
      collection?.unregisterItem(registeredKey);
    }
  });
}

/**
 * Mounted while a collection is probed or closed so the collection exists before
 * display. Renders nothing.
 */
export function StaticCollectionProbeItem(props: {
  id: Key;
  textValue?: string;
  isDisabled?: boolean | (() => boolean);
  "aria-label"?: string;
  children?: unknown;
}): JSX.Element {
  useStaticItemRegistration(props);
  return <></>;
}

export interface StaticCollectionBuilderProps {
  content?: JSX.Element;
  children: (items: Accessor<StaticCollectionItem[]>) => JSX.Element;
}

export function CollectionBuilder<T>(
  props: AriaCollectionBuilderProps<T> | StaticCollectionBuilderProps,
): unknown {
  if ("content" in props && typeof props.children === "function") {
    const { items, context } = createStaticCollectionState();
    return (
      <StaticCollectionContext value={context}>
        <StaticCollectionProbeContext value={true}>{props.content}</StaticCollectionProbeContext>
        {(props.children as (items: Accessor<StaticCollectionItem[]>) => JSX.Element)(items)}
      </StaticCollectionContext>
    );
  }
  return AriaCollectionBuilder(props as AriaCollectionBuilderProps<T>);
}

export function Collection<T>(props: AriaCollectionProps<T>): unknown {
  return AriaCollection(props);
}

export { createLeafComponent, createBranchComponent };

/**
 * RAC Collection renders `before` + item for every item, and `after` only when
 * the next item in the same level is null (`renderAfterDropIndicators`). The
 * `"on"` position is not a collection-level slot. Index-based hosts (ListBox,
 * GridList, Menu, Table) use this helper so they do not fork the geometry.
 */
export function renderCollectionDropSlots(options: {
  index: number;
  lastIndex: number;
  renderDropIndicator?: (
    index: number,
    position: "before" | "after" | "on",
  ) => JSX.Element | undefined;
  children: JSX.Element;
}): JSX.Element {
  return (
    <>
      {options.renderDropIndicator?.(options.index, "before")}
      {options.children}
      {options.index === options.lastIndex
        ? options.renderDropIndicator?.(options.index, "after")
        : null}
    </>
  );
}

/**
 * A semantic section wrapper for grouped collection content.
 */
export function Section(props: SectionProps): JSX.Element {
  const sectionContext = useContext(SectionContext);
  if (sectionContext) {
    if (isDevEnv()) {
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
  const probe = useContext(StaticCollectionProbeContext);
  const [merged, ref] = useContextProps(props, props.ref, HeaderContext);
  const [local, domProps] = splitProps(merged, [
    "children",
    "class",
    "style",
    "slot",
    "ref",
    "role",
  ]);

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

  // The registration copy of a static select must not paint a heading.
  if (probe) return <></>;

  return (
    <div
      ref={ref}
      {...filteredDomProps()}
      role={local.role ?? "heading"}
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
