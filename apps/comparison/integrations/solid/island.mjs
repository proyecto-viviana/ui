import { createComponent, createStore, Loading, reconcile } from "solid-js";

// Both renderers enter the same owned tree. In Solid 2, reactive allocations
// belong to the hydration address; a client-only wrapper can shift every key.
export function createIsland(Component, props, hydratable, onStore) {
  const [store, setStore] = createStore(props);
  onStore?.((next) => setStore((draft) => reconcile(next)(draft)));
  const children = () => createComponent(Component, store);
  return hydratable
    ? createComponent(Loading, {
        get children() {
          return children();
        },
      })
    : children();
}
