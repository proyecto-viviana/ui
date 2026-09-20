/**
 * Shared fixtures for the ListBox / Virtualizer SSR ↔ hydrate pairs. Both halves
 * import this file so the server writer and the client hydrator render the same
 * tree.
 */
import { ListBox, ListBoxItem, ListLayout, Virtualizer } from "../../src/index";
import { createUniqueId } from "solid-js";
import { isServer } from "@solidjs/web";
import { createScrollView } from "../../../solidaria/src/virtualizer/ScrollView";

export const VIRTUALIZED_ITEM_COUNT = 200;
export const VIRTUALIZED_ROW_HEIGHT = 32;

const items = Array.from({ length: VIRTUALIZED_ITEM_COUNT }, (_, index) => ({
  id: index,
  name: `Item ${index}`,
}));

export type ScrollViewEvent =
  | { kind: "size"; width: number; height: number }
  | { kind: "window"; height: number }
  | { kind: "offset"; offset: number }
  | { kind: "scroll"; x: number; y: number }
  | { kind: "start" | "end" };

/** Exposes the claimed element immediately, before the hydration walk finishes. */
export function ScrollViewLifecycleFixture(props: { event?: (event: ScrollViewEvent) => void }) {
  const element = <div data-scroll-view="viewport">Scroll viewport</div>;
  createScrollView({
    getScrollElement: () => (isServer ? null : (element as HTMLDivElement)),
    onSizeChange: (size) => props.event?.({ kind: "size", ...size }),
    onWindowViewportChange: (height) => props.event?.({ kind: "window", height }),
    onViewportOffsetChange: (offset) => props.event?.({ kind: "offset", offset }),
    onScrollPositionChange: (position) => props.event?.({ kind: "scroll", ...position }),
    onScrollStart: () => props.event?.({ kind: "start" }),
    onScrollEnd: () => props.event?.({ kind: "end" }),
  });
  const id = createUniqueId();
  return (
    <section>
      {element}
      <span id={id} data-scroll-view="following">
        Following
      </span>
    </section>
  );
}

/** Text-only option children: the option wraps them in its label span. */
export function VirtualizedListBoxFixture() {
  return (
    <Virtualizer layout={ListLayout} layoutOptions={{ rowHeight: VIRTUALIZED_ROW_HEIGHT }}>
      <ListBox aria-label="Virtualized list" items={items}>
        {(item) => <ListBoxItem id={item.id}>{item.name}</ListBoxItem>}
      </ListBox>
    </Virtualizer>
  );
}

/**
 * Element option children (a tile with two spans), as a grid demo renders.
 * Exercises shared evaluation for classification/insertion and adoption of the
 * actual child DOM, rather than only a primitive-label path.
 */
export function ElementChildrenListBoxFixture() {
  return (
    <ListBox aria-label="Tiles" items={items.slice(0, 4)}>
      {(item) => (
        <ListBoxItem id={item.id} textValue={item.name}>
          <div class="tile">
            <span class="tile-label">{item.name}</span>
            <span class="tile-meta">Grid item</span>
          </div>
        </ListBoxItem>
      )}
    </ListBox>
  );
}
