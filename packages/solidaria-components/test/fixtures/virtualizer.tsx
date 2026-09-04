/**
 * Shared fixtures for the ListBox / Virtualizer SSR ↔ hydrate pairs. Both halves
 * import this file so the server writer and the client hydrator render the same
 * tree.
 */
import { ListBox, ListBoxItem, ListLayout, Virtualizer } from "../../src/index";

export const VIRTUALIZED_ITEM_COUNT = 200;
export const VIRTUALIZED_ROW_HEIGHT = 32;

const items = Array.from({ length: VIRTUALIZED_ITEM_COUNT }, (_, index) => ({
  id: index,
  name: `Item ${index}`,
}));

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
 * Element option children (a tile with two spans), as a grid demo renders. Each
 * read of a compiled element child consumes a hydration key, so the option must
 * read its children exactly once for the server and client keys to agree.
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
